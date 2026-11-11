export interface ImpostorPuzzle { 
  numbers: number[]; 
  answer: number; 
  hint: string; 
  directHint: string; 
}

/**
 * Each property defines the pattern the DISTRACTORS share.
 * The TARGET (impostor) does NOT satisfy the property.
 * 
 * Rule: check(n) returns TRUE for distractors, FALSE for target.
 */
interface Property {
  check: (n: number) => boolean;
  hint: string;
  directHint: string;
}

const PROPERTIES: Property[] = [
  { 
    check: (n) => n % 2 === 0, 
    hint: "The others are always in pairs.", 
    directHint: "Select the ODD number" 
  },
  { 
    check: (n) => n % 2 === 1, 
    hint: "The others prefer to be alone.", 
    directHint: "Select the EVEN number" 
  },
  { 
    check: (n) => n >= 4, 
    hint: "The others are giants.", 
    directHint: "Select the SMALL number" 
  },
  { 
    check: (n) => n <= 3, 
    hint: "The others are tiny.", 
    directHint: "Select the BIG number" 
  },
  { 
    check: (n) => n % 3 === 0, 
    hint: "The others can be shared among three friends.", 
    directHint: "Select the number NOT DIVISIBLE BY 3" 
  },
  { 
    check: (n) => n % 3 !== 0, 
    hint: "The others cannot be shared among three friends.", 
    directHint: "Select the number DIVISIBLE BY 3" 
  },
];

/**
 * Generates a puzzle with EXACTLY ONE correct answer.
 * Only uses unopened bars as candidates.
 */
export function generateLevel2Puzzle(unopenedBars: number[]): ImpostorPuzzle {
  if (unopenedBars.length === 1) {
    const target = unopenedBars[0];
    return { 
      numbers: [target], 
      answer: target, 
      hint: `Select the number ${target}.`, 
      directHint: `Select the number ${target}.` 
    };
  }

  const shuffledTargets = [...unopenedBars].sort(() => Math.random() - 0.5);
  
  for (const target of shuffledTargets) {
    const availableDistractors = unopenedBars.filter(n => n !== target);
    const shuffledProps = [...PROPERTIES].sort(() => Math.random() - 0.5);
    
    for (const prop of shuffledProps) {
      // Target must NOT satisfy the property
      if (prop.check(target)) continue;
      
      // Distractors must satisfy the property
      const matchingDistractors = availableDistractors.filter(prop.check);
      const minRequired = Math.min(2, availableDistractors.length);
      
      if (matchingDistractors.length < minRequired) continue;
      
      const numDistractors = Math.min(3, matchingDistractors.length);
      const picked = [...matchingDistractors]
        .sort(() => Math.random() - 0.5)
        .slice(0, numDistractors);
      const numbers = [...picked, target].sort(() => Math.random() - 0.5);
      
      return { 
        numbers, 
        answer: target, 
        hint: prop.hint, 
        directHint: prop.directHint 
      };
    }
  }

  // Fallback
  const target = unopenedBars[0];
  return { 
    numbers: [target], 
    answer: target, 
    hint: "Click the bar.", 
    directHint: "Click the bar." 
  };
}