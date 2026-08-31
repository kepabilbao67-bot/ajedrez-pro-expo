import { ACADEMY_PUZZLES } from './content/academy-puzzles';
import { OFFLINE_TACTICS_PACK } from './content/offline-tactics-pack';
import type { TrainingPuzzle } from './training-types';

export const PUZZLE_LIBRARY: readonly TrainingPuzzle[] = ACADEMY_PUZZLES;

export const FULL_PUZZLE_COLLECTION: readonly TrainingPuzzle[] = [
  ...ACADEMY_PUZZLES,
  ...OFFLINE_TACTICS_PACK,
];

export function puzzleById(id: string): TrainingPuzzle | null {
  return FULL_PUZZLE_COLLECTION.find((puzzle) => puzzle.id === id) ?? null;
}
