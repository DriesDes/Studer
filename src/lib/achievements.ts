import type { Achievement } from '../types/index';

export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'id' | 'unlockedAt'>[] = [
  { slug: 'first-steps', title: 'First Steps', description: 'Complete your very first study session.', icon: '🎯' },
  { slug: 'night-owl', title: 'Night Owl', description: 'Study past 22:00.', icon: '🦉' },
  { slug: 'early-bird', title: 'Early Bird', description: 'Study before 07:00.', icon: '🌅' },
  { slug: 'unstoppable', title: 'Unstoppable', description: 'Achieve a 5-day study streak.', icon: '🔥' },
  { slug: 'iron-will', title: 'Iron Will', description: 'Achieve a 10-day study streak.', icon: '⚙️' },
  { slug: 'target-crusher', title: 'Target Crusher', description: 'Beat your target time in 5 sessions.', icon: '💥' },
  { slug: 'marathon-runner', title: 'Marathon Runner', description: 'Study for 2+ hours in a single session.', icon: '🏃' },
  { slug: 'chapter-master', title: 'Chapter Master', description: 'Complete 10 chapters across all subjects.', icon: '📚' },
  { slug: 'scholar', title: 'Scholar', description: 'Reach Level 5.', icon: '🎓' },
  { slug: 'centurion', title: 'Centurion', description: 'Accumulate 1,000 total XP.', icon: '💯' },
  { slug: 'deep-focus', title: 'Deep Focus', description: 'Complete 50 study sessions.', icon: '🧠' },
];

interface CheckContext {
  totalSessions: number;
  currentStreak: number;
  currentLevel: number;
  totalXp: number;
  completedChapters: number;
  sessionElapsedMinutes: number;
  sessionStartHour: number;
  sessionReachedTarget: boolean;
  targetCrusherCount: number;
}

export function getAchievementsToUnlock(ctx: CheckContext, alreadyUnlocked: string[]): string[] {
  const unlocked = new Set(alreadyUnlocked);
  const toUnlock: string[] = [];

  function check(slug: string, condition: boolean) {
    if (!unlocked.has(slug) && condition) toUnlock.push(slug);
  }

  check('first-steps', ctx.totalSessions >= 1);
  check('night-owl', ctx.sessionStartHour >= 22);
  check('early-bird', ctx.sessionStartHour < 7);
  check('unstoppable', ctx.currentStreak >= 5);
  check('iron-will', ctx.currentStreak >= 10);
  check('target-crusher', ctx.targetCrusherCount >= 5);
  check('marathon-runner', ctx.sessionElapsedMinutes >= 120);
  check('chapter-master', ctx.completedChapters >= 10);
  check('scholar', ctx.currentLevel >= 5);
  check('centurion', ctx.totalXp >= 1000);
  check('deep-focus', ctx.totalSessions >= 50);

  return toUnlock;
}
