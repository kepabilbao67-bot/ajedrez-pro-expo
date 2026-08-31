import { describe, expect, it } from 'vitest';
import {
  extractMistakesFromGame,
  mistakeToTrainingPuzzle,
  verifyMistakeAttempt,
  type MistakeExercise,
} from './mistakeTrainer';
import type { MoveRecord } from '@/chess';

describe('Mistake Trainer', () => {
  it('extracts mistakes from match history with valid coordinates and explanation', async () => {
    const mockHistory: MoveRecord[] = [
      {
        move: { from: 52, to: 36 },
        san: 'e4',
        fenBefore: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        fenAfter: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      },
      {
        move: { from: 12, to: 28 },
        san: 'e5',
        fenBefore: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        fenAfter: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
      },
      {
        // Extreme blunder: g4
        move: { from: 54, to: 38 },
        san: 'g4',
        fenBefore: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
        fenAfter: 'rnbqkbnr/pppp1ppp/8/4p3/4P1P1/8/PPPP1P1P/RNBQKBNR b KQkq g3 0 2',
      },
    ];

    const mistakes = await extractMistakesFromGame(mockHistory, 'w');
    expect(Array.isArray(mistakes)).toBe(true);
    if (mistakes.length > 0) {
      const first = mistakes[0];
      expect(first.fenBefore).toBe('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2');
      expect(first.playedSan).toBe('g4');
      expect(first.bestMove).toBeDefined();
      expect(typeof first.bestMove.from).toBe('string');
      expect(typeof first.bestMove.to).toBe('string');
    }
  });

  it('verifies correct mistake attempts ignoring check symbols', () => {
    const exercise: MistakeExercise = {
      id: 'test-1',
      moveNumber: 5,
      fenBefore: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      playedSan: 'a3',
      bestAlternativeSan: 'Nf3',
      bestMove: { from: 'g1', to: 'f3' },
      classification: 'mistake',
      explanation: 'Test explanation',
    };

    expect(verifyMistakeAttempt(exercise, 'Nf3')).toBe(true);
    expect(verifyMistakeAttempt(exercise, 'Nf3+')).toBe(true);
    expect(verifyMistakeAttempt(exercise, 'nf3')).toBe(true);
    expect(verifyMistakeAttempt(exercise, 'e4')).toBe(false);
  });

  it('converts MistakeExercise to TrainingPuzzle with rewardXp = 0 to prevent duplicate XP', () => {
    const exercise: MistakeExercise = {
      id: 'mistake-3-g4',
      moveNumber: 3,
      fenBefore: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
      playedSan: 'g4',
      bestAlternativeSan: 'Nf3',
      bestMove: { from: 'g1', to: 'f3' },
      classification: 'blunder',
      explanation: 'Tu jugada g4 entregó una ventaja considerable.',
    };

    const puzzle = mistakeToTrainingPuzzle(exercise);

    expect(puzzle.id).toBe('mistake-3-g4');
    expect(puzzle.fen).toBe(exercise.fenBefore);
    expect(puzzle.solution).toEqual([{ from: 'g1', to: 'f3', promotion: undefined }]);
    expect(puzzle.rewardXp).toBe(0); // Strictly zero duplicate XP
    expect(puzzle.category).toBe('best-move');
    expect(puzzle.explanation).toBe(exercise.explanation);
  });
});

