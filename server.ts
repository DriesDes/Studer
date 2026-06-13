/**
 * Custom Next.js server with Socket.io for real-time timer sync.
 * Entry point for both `npm run dev` and `npm start` (Docker).
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { calculateXP, computeLevelInfo } from './src/lib/xp';
import { getAchievementsToUnlock } from './src/lib/achievements';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT ?? '3000', 10);

const prisma = new PrismaClient();

// ── In-memory active session ─────────────────────────────────────────────────
interface ActiveSessionMeta {
  id: string;
  startTime: number; // Unix ms
  targetDuration: number; // minutes (0 = no target)
  subjectId: string | null;
}

let activeSession: ActiveSessionMeta | null = null;
let tickInterval: ReturnType<typeof setInterval> | null = null;

function clearTick() {
  if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
}

function broadcastState(io: SocketIOServer) {
  if (!activeSession) {
    io.emit('session:state', { isActive: false });
    return;
  }
  const elapsed = Math.floor((Date.now() - activeSession.startTime) / 1000);
  io.emit('session:state', {
    isActive: true,
    sessionId: activeSession.id,
    startTime: activeSession.startTime,
    targetDuration: activeSession.targetDuration,
    subjectId: activeSession.subjectId,
    elapsed,
  });
}

// ── Seed achievement definitions ─────────────────────────────────────────────
async function seedAchievements() {
  const { ACHIEVEMENT_DEFINITIONS } = await import('./src/lib/achievements');
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    await prisma.achievement.upsert({
      where: { slug: def.slug },
      update: {},
      create: def,
    });
  }
}

async function ensureProgress() {
  const count = await prisma.userProgress.count();
  if (count === 0) {
    await prisma.userProgress.create({
      data: { currentXp: 0, currentLevel: 1, currentStreak: 0, lastActiveDate: new Date() },
    });
  }
}

// ── Streak update ─────────────────────────────────────────────────────────────
async function updateStreak(progress: { id: string; currentStreak: number; lastActiveDate: Date }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const last = new Date(progress.lastActiveDate); last.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - last.getTime()) / 86400000);

  let newStreak = progress.currentStreak;
  if (diffDays === 1) newStreak += 1;
  else if (diffDays > 1) newStreak = 1;
  // diffDays === 0 → same day, no change

  return prisma.userProgress.update({
    where: { id: progress.id },
    data: { currentStreak: newStreak, lastActiveDate: new Date() },
  });
}

// ── Socket handlers ───────────────────────────────────────────────────────────
function setupSocket(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    console.log(`[ws] connect  ${socket.id}`);
    broadcastState(io);

    // ── session:start ─────────────────────────────────────────────────────
    socket.on('session:start', async (data: { subjectId?: string; targetDuration?: number }) => {
      if (activeSession) {
        socket.emit('error', { message: 'A session is already running.' });
        return;
      }
      try {
        const session = await prisma.studySession.create({
          data: {
            startTime: new Date(),
            targetDuration: data.targetDuration ?? 0,
            subjectId: data.subjectId ?? null,
            status: 'ACTIVE',
            xpEarned: 0,
          },
        });
        activeSession = {
          id: session.id,
          startTime: Date.now(),
          targetDuration: data.targetDuration ?? 0,
          subjectId: data.subjectId ?? null,
        };
        tickInterval = setInterval(() => {
          if (!activeSession) return;
          const elapsed = Math.floor((Date.now() - activeSession.startTime) / 1000);
          io.emit('session:tick', { elapsed });
        }, 1000);
        broadcastState(io);
        console.log(`[ws] session started ${session.id}`);
      } catch (err) {
        console.error('[ws] session:start error', err);
        socket.emit('error', { message: 'Failed to start session.' });
      }
    });

    // ── session:stop ──────────────────────────────────────────────────────
    socket.on('session:stop', async () => {
      if (!activeSession) return;
      const snap = { ...activeSession };
      activeSession = null;
      clearTick();

      const endTime = new Date();
      const elapsedSeconds = Math.floor((endTime.getTime() - snap.startTime) / 1000);
      const elapsedMinutes = elapsedSeconds / 60;

      try {
        const xpResult = calculateXP(elapsedMinutes, snap.targetDuration);

        await prisma.studySession.update({
          where: { id: snap.id },
          data: { endTime, xpEarned: xpResult.xpEarned, status: 'COMPLETED' },
        });

        let progress = await prisma.userProgress.findFirst();
        if (!progress) {
          progress = await prisma.userProgress.create({
            data: { currentXp: 0, currentLevel: 1, currentStreak: 0, lastActiveDate: new Date() },
          });
        }

        const previousXp = progress.currentXp;
        const newXp = previousXp + xpResult.xpEarned;
        const levelInfo = computeLevelInfo(previousXp, newXp);

        progress = await prisma.userProgress.update({
          where: { id: progress.id },
          data: { currentXp: newXp, currentLevel: levelInfo.level },
        });
        progress = await updateStreak(progress);

        // Achievement checks
        const completedChapters = await prisma.chapter.count({ where: { completed: true } });
        const totalSessions = await prisma.studySession.count({ where: { status: 'COMPLETED' } });
        const targetCrusherCount = await prisma.studySession.count({
          where: { status: 'COMPLETED', targetDuration: { gt: 0 } },
        });

        const alreadyUnlocked = (
          await prisma.achievement.findMany({ where: { unlockedAt: { not: null } } })
        ).map((a) => a.slug);

        const startHour = new Date(snap.startTime).getHours();
        const toUnlock = getAchievementsToUnlock(
          {
            totalSessions,
            currentStreak: progress.currentStreak,
            currentLevel: levelInfo.level,
            totalXp: newXp,
            completedChapters,
            sessionElapsedMinutes: elapsedMinutes,
            sessionStartHour: startHour,
            sessionReachedTarget: xpResult.reachedTarget,
            targetCrusherCount,
          },
          alreadyUnlocked
        );

        const now = new Date();
        const newAchievements = await Promise.all(
          toUnlock.map((slug) =>
            prisma.achievement.update({ where: { slug }, data: { unlockedAt: now } })
          )
        );

        io.emit('session:completed', {
          elapsed: elapsedSeconds,
          xpEarned: xpResult.xpEarned,
          xpResult,
          progress: {
            id: progress.id,
            currentXp: progress.currentXp,
            currentLevel: progress.currentLevel,
            currentStreak: progress.currentStreak,
            lastActiveDate: progress.lastActiveDate.toISOString(),
          },
          levelInfo,
          newAchievements: newAchievements.map((a) => ({
            id: a.id,
            slug: a.slug,
            title: a.title,
            description: a.description,
            icon: a.icon,
            unlockedAt: a.unlockedAt?.toISOString() ?? null,
          })),
        });
        io.emit('session:state', { isActive: false });
        console.log(`[ws] session completed ${snap.id} +${xpResult.xpEarned}XP`);
      } catch (err) {
        console.error('[ws] session:stop error', err);
        activeSession = null;
        io.emit('session:state', { isActive: false });
      }
    });

    // ── session:abandon ───────────────────────────────────────────────────
    socket.on('session:abandon', async () => {
      if (!activeSession) return;
      const snap = { ...activeSession };
      activeSession = null;
      clearTick();
      try {
        await prisma.studySession.update({
          where: { id: snap.id },
          data: { endTime: new Date(), xpEarned: 0, status: 'ABANDONED' },
        });
      } catch (err) {
        console.error('[ws] session:abandon error', err);
      }
      io.emit('session:abandoned', {});
      io.emit('session:state', { isActive: false });
      console.log(`[ws] session abandoned ${snap.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`[ws] disconnect ${socket.id}`);
    });
  });
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  await seedAchievements();
  await ensureProgress();

  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Next.js handler error:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    path: '/socket.io',
  });

  setupSocket(io);

  httpServer.listen(port, hostname, () => {
    console.log(`\n  ▶  Studer running on http://localhost:${port}\n`);
  });
});
