import { decode } from '../utils/Cipher';

export interface ImpostorPuzzle { 
  numbers: number[]; 
  answer: number; 
  hint: string; 
  directHint: string; 
}

interface Property {
  check: (n: number) => boolean;
  hint: string;
  directHint: string;
}


const PROPERTIES: Property[] = [
  { 
    
    check: (n) => (n & 1) === 0, 
    hint: decode("Gur bguref ner nyjnlf va cnvef."), 
    directHint: decode("Fryrpg gur BQQ ahzore") 
  },
  { 
    
    check: (n) => (n & 1) === 1, 
    hint: decode("Gur bguref cerfre gb or nybar."), 
    directHint: decode("Fryrpg gur RIRA ahzore") 
  },
  { 
    
    check: (n) => (n >> 2) >= 1, 
    hint: decode("Gur bguref ner tvnagf."), 
    directHint: decode("Fryrpg gur FZNYY ahzore") 
  },
  { 
    
    check: (n) => (n >> 2) === 0, 
    hint: decode("Gur bguref ner gval."), 
    directHint: decode("Fryrpg gur OVT ahzore") 
  },
  { 
    
    check: (n) => n !== 1 && n !== 2 && n !== 4 && n !== 5, 
    hint: decode("Gur bguref pna or funerq nzbat guerr sevraqf."), 
    directHint: decode("Fryrpg gur ahzore ABG QVIVFVOYR OL 3") 
  },
  { 
    check: (n) => [1, 2, 4, 5].includes(n), 
    hint: decode("Gur bguref pnaabg or funerq nzbat guerr sevraqf."), 
    directHint: decode("Fryrpg gur ahzore QVIVFVOYR OL 3") 
  },
];

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
      // Target must NOT satisfy the property (it's the impostor)
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

  
  const target = unopenedBars[0];
  return { 
    numbers: [target], 
    answer: target, 
    hint: "Click the bar.", 
    directHint: "Click the bar." 
  };
}