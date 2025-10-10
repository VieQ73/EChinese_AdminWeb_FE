// Export all templates
export { mockHSK1Template } from './hsk1';
export { mockHSK2Template } from './hsk2';
export { mockHSK3Template } from './hsk3';
export { mockTOCFLBandATemplate } from './tocfl';
export { mockD4Template } from './d4';
export { mockHSKKBasicTemplate } from './hskk';

// Template collections by type
export const HSK_TEMPLATES = {
  HSK1: 'hsk1',
  HSK2: 'hsk2',  
  HSK3: 'hsk3',
} as const;

export const TOCFL_TEMPLATES = {
  'Band A': 'tocfl',
} as const;

export const D4_TEMPLATES = {
  'Level 4': 'd4',
} as const;

export const HSKK_TEMPLATES = {
  'Basic': 'hskk',
} as const;