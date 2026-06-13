const VIOLET = ['#7c3aed', '#6366f1', '#a78bfa', '#c4b5fd', '#ffffff'];
const GOLD = ['#f59e0b', '#fbbf24', '#fcd34d', '#ffffff'];

export async function celebrateComplete(leveledUp: boolean): Promise<void> {
  const { default: confetti } = await import('canvas-confetti');

  if (leveledUp) {
    confetti({
      particleCount: 130,
      spread: 72,
      origin: { y: 0.55 },
      colors: VIOLET,
      startVelocity: 32,
      gravity: 1.1,
    });
    setTimeout(() => {
      confetti({ particleCount: 55, angle: 58,  spread: 52, origin: { x: 0,   y: 0.6 }, colors: VIOLET });
      confetti({ particleCount: 55, angle: 122, spread: 52, origin: { x: 1,   y: 0.6 }, colors: VIOLET });
    }, 220);
  } else {
    confetti({
      particleCount: 55,
      spread: 48,
      origin: { y: 0.65 },
      colors: VIOLET,
      startVelocity: 22,
      gravity: 1.3,
    });
  }
}

export async function celebrateAchievement(): Promise<void> {
  const { default: confetti } = await import('canvas-confetti');
  confetti({ particleCount: 65, angle: 58,  spread: 52, origin: { x: 0,   y: 0.7 }, colors: GOLD, startVelocity: 26 });
  setTimeout(() => {
    confetti({ particleCount: 65, angle: 122, spread: 52, origin: { x: 1, y: 0.7 }, colors: GOLD, startVelocity: 26 });
  }, 110);
}
