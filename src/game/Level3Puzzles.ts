export interface MathPuzzle {
  text: string;
  sum: number;
  target: number;
}

/**
 * Obfuscated circle counting.
 * Index represents the digit (0-9), value is the number of circles.
 * Array looks like random noise, but it's the key to the puzzle!
 * 
 * - 0, 4, 6, 9 have 1 circle
 * - 8 has 2 circles  
 * - 1, 2, 3, 5, 7 have 0 circles
 */
const CIRCLE_MAP = [1, 0, 0, 0, 1, 0, 1, 0, 2, 1];

export function getCircles(num: number): number {
  let count = 0;
  for (const char of num.toString()) {
    count += CIRCLE_MAP[parseInt(char)];
  }
  return count;
}

export function generateLevel3Puzzles(): MathPuzzle[] {
  const puzzles: MathPuzzle[] = [];
  const targets = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5);

  for (const target of targets) {
    let attempts = 0;
    
    while (attempts < 2000) {
      attempts++;
      const a = Math.floor(Math.random() * 80) + 10;
      const needed = target - getCircles(a);
      if (needed < 0) continue;

      const possibleBs: number[] = [];
      for (let i = 0; i <= 99; i++) {
        if (getCircles(i) === needed) possibleBs.push(i);
      }
      if (possibleBs.length === 0) continue;

      const b = possibleBs[Math.floor(Math.random() * possibleBs.length)];
      const sum = a + b;

      if (sum > 6) {
        puzzles.push({ text: `${a} + ${b} = ?`, sum, target });
        break;
      }
    }
  }
  
  return puzzles;
}