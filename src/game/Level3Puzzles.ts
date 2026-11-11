export interface MathPuzzle {
  text: string;
  sum: number;
  target: number;
}

/**
 * Counts "closed circles" in a number:
 * 8 → 2 circles, 0/6/9/4 → 1 circle, others → 0.
 */
export function getCircles(num: number): number {
  let count = 0;
  for (const char of num.toString()) {
    if (char === '8') count += 2;
    else if (['0', '6', '9', '4'].includes(char)) count += 1;
  }
  return count;
}

/**
 * Generates 6 puzzles where each answer (1-6) appears exactly once.
 * The math sum is always > 6 so the player cannot accidentally click it
 * (bars only go up to 6).
 */
export function generateLevel3Puzzles(): MathPuzzle[] {
  const puzzles: MathPuzzle[] = [];
  const targets = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5);

  for (const target of targets) {
    let attempts = 0;
    
    while (attempts < 2000) {
      attempts++;
      const a = Math.floor(Math.random() * 80) + 10; // 10-89
      const needed = target - getCircles(a);
      if (needed < 0) continue;

      const possibleBs: number[] = [];
      for (let i = 0; i <= 99; i++) {
        if (getCircles(i) === needed) possibleBs.push(i);
      }
      if (possibleBs.length === 0) continue;

      const b = possibleBs[Math.floor(Math.random() * possibleBs.length)];
      const sum = a + b;

      // Sum must exceed 6 so player can't accidentally click it
      if (sum > 6) {
        puzzles.push({ text: `${a} + ${b} = ?`, sum, target });
        break;
      }
    }
  }
  
  return puzzles;
}