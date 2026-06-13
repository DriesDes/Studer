import type { XpResult, LevelInfo } from '../types/index';

/**
 * Calculate XP earned for a study session.
 *
 * Rules:
 * - Minimum 1 minute required for any XP
 * - Base rate: 10 XP / minute
 * - Reaching target: 1.5× multiplier on total
 * - Overtime: additional 1.05× compounding per overtime minute (capped at 60)
 */
export function calculateXP(elapsedMinutes: number, targetMinutes: number): XpResult {
  if (elapsedMinutes < 1) {
    return { xpEarned: 0, bonusMultiplier: 1, reachedTarget: false, overtimeMinutes: 0 };
  }

  const baseXP = Math.floor(elapsedMinutes * 10);
  const reachedTarget = targetMinutes > 0 && elapsedMinutes >= targetMinutes;
  const overtimeMinutes = reachedTarget ? Math.max(0, elapsedMinutes - targetMinutes) : 0;

  if (!reachedTarget) {
    return { xpEarned: baseXP, bonusMultiplier: 1, reachedTarget: false, overtimeMinutes: 0 };
  }

  let xp = baseXP * 1.5;
  const cappedOvertime = Math.min(overtimeMinutes, 60);
  const overtimeMult = Math.pow(1.05, cappedOvertime);
  xp = xp * overtimeMult;

  const bonusMultiplier = 1.5 * overtimeMult;
  return {
    xpEarned: Math.floor(xp),
    bonusMultiplier: parseFloat(bonusMultiplier.toFixed(2)),
    reachedTarget: true,
    overtimeMinutes,
  };
}

// XP total required to START level n (level 1 = 0 XP)
// Sequence: 0, 100, 300, 600, 1000, 1500 …  (increments: 100, 200, 300, 400, …)
export function getXpThresholdForLevel(level: number): number {
  if (level <= 1) return 0;
  // sum of 100*(n-1) for n from 1 to level-1  =  100 * (level-1)*(level-2)/2  + 100*(level-1)
  const n = level - 1;
  return 100 * n + 100 * ((n * (n - 1)) / 2);
  // Simplified: 50 * n * (n + 1)
}

export function getLevelFromXp(totalXp: number): number {
  let level = 1;
  while (getXpThresholdForLevel(level + 1) <= totalXp) {
    level++;
    if (level > 999) break;
  }
  return level;
}

/**
 * Compute level display info for the XP bar.
 * previousXp = XP before this session; newTotalXp = XP after this session.
 */
export function computeLevelInfo(previousXp: number, newTotalXp: number): LevelInfo {
  const oldLevel = getLevelFromXp(previousXp);
  const newLevel = getLevelFromXp(newTotalXp);
  const leveledUp = newLevel > oldLevel;

  const xpForCurrentLevel = getXpThresholdForLevel(newLevel);
  const xpForNextLevel = getXpThresholdForLevel(newLevel + 1);
  const xpIntoLevel = newTotalXp - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = Math.min(100, Math.floor((xpIntoLevel / xpNeededForLevel) * 100));

  return {
    level: newLevel,
    currentXp: newTotalXp,
    xpForCurrentLevel,
    xpForNextLevel,
    progressPercent,
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
  };
}
