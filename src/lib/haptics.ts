type HapticPattern = 'tap' | 'start' | 'stop' | 'success' | 'error';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  start: [40, 20, 70],
  stop: [70, 30, 40],
  success: [30, 15, 30, 15, 60],
  error: [80, 40, 80],
};

export function haptic(pattern: HapticPattern): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  navigator.vibrate(PATTERNS[pattern]);
}
