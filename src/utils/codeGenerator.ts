/**
 * Generates a random permutation of the numbers [1, 2, 3, 4, 5, 6].
 * 
 * Uses the Fisher-Yates shuffle algorithm to ensure each number appears exactly once,
 * in a truly random order. This is the sequence the player must follow to open
 * the bars and free the tiger.
 * 
 * @returns A shuffled array of numbers from 1 to 6 (e.g., [3, 1, 5, 2, 6, 4])
 */
export const generateCode = (): number[] => {
  // Start with a sorted array [1, 2, 3, 4, 5, 6]
  const code = [1, 2, 3, 4, 5, 6];
  
  // Fisher-Yates shuffle: iterate backwards, swap each element with a random earlier one
  for (let i = code.length - 1; i > 0; i--) {
    // Pick a random index between 0 and i (inclusive)
    const j = Math.floor(Math.random() * (i + 1));
    
    // Swap the current element with the randomly chosen one
    [code[i], code[j]] = [code[j], code[i]];
  }
  
  return code;
};