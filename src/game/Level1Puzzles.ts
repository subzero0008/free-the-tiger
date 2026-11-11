import { CONFIG } from '../config';

export interface FlashStep {
  barId: number;
  color: number;
}

/**
 * Generates a random sequence of 6 bars, each with a random color.
 * Each bar 1-6 appears exactly once in the sequence.
 */
export function generateLevel1Sequence(): FlashStep[] {
  const barIds = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5);
  return barIds.map(barId => ({
    barId,
    color: CONFIG.LEVEL_1.COLORS[Math.floor(Math.random() * CONFIG.LEVEL_1.COLORS.length)]
  }));
}