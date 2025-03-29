import type { QuestionType } from './types';

// Mock question types for the question filter panel
export const questionTypes: QuestionType[] = [
  { id: 'unused', label: 'Unused', count: 19 },
  { id: 'correct', label: 'Correct', count: 0 },
  { id: 'incorrect', label: 'Incorrect', count: 0 },
  { id: 'marked', label: 'Marked', count: 0 },
  { id: 'skipped', label: 'Skipped', count: 0 }
];
