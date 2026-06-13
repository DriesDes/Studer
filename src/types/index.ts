// Shared TypeScript types used across the application

export interface Subject {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  chapters?: Chapter[];
  _count?: { chapters: number };
}

export interface Chapter {
  id: string;
  subjectId: string;
  title: string;
  order: number;
  completed: boolean;
}

export interface StudySession {
  id: string;
  subjectId: string | null;
  startTime: string;
  endTime: string | null;
  targetDuration: number;
  xpEarned: number;
  status: string; // "ACTIVE" | "COMPLETED" | "ABANDONED"
}

export interface UserProgress {
  id: string;
  currentXp: number;
  currentLevel: number;
  currentStreak: number;
  lastActiveDate: string;
}

export interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

// XP system types
export interface XpResult {
  xpEarned: number;
  bonusMultiplier: number;
  reachedTarget: boolean;
  overtimeMinutes: number;
}

export interface LevelInfo {
  level: number;
  currentXp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
  leveledUp: boolean;
  newLevel?: number;
}

// Socket.io event types
export interface SessionState {
  isActive: boolean;
  sessionId?: string;
  startTime?: number;
  targetDuration?: number;
  subjectId?: string | null;
  elapsed?: number;
}

export interface SessionCompletedPayload {
  elapsed: number;
  xpEarned: number;
  xpResult: XpResult;
  progress: UserProgress;
  levelInfo: LevelInfo;
  newAchievements: Achievement[];
}

// Analytics types
export interface HoursPerSubject {
  subjectId: string;
  subjectName: string;
  color: string;
  totalMinutes: number;
}

export interface HourlyDistribution {
  hour: number;
  sessions: number;
  minutes: number;
}

export interface DailyStudy {
  date: string;
  minutes: number;
  sessions: number;
}

export interface AnalyticsData {
  hoursPerSubject: HoursPerSubject[];
  hourlyDistribution: HourlyDistribution[];
  dailyStudy: DailyStudy[];
  totalSessions: number;
  totalMinutes: number;
  totalXp: number;
}
