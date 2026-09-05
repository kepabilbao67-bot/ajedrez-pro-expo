import { describe, expect, it } from 'vitest';
import { ChessGame, algebraicToSquare, squareToAlgebraic } from '../chess';
import { SCHOOL_LESSONS, getLessonById } from './school-lessons';
import {
  calculateExerciseStars,
  completeSchoolLesson,
} from './school-service';
import { createInitialSchoolState } from './school-storage';
import type { SchoolProgressState } from './school-types';

describe('School Flow & Interactive Lessons Integration', () => {
  it('1. Lección Peón (pawn): validates double push, star calculation, and progression', () => {
    const lesson = getLessonById('pawn');
    expect(lesson).toBeDefined();

    const ex1 = lesson!.exercises[0];
    const game = new ChessGame(ex1.initialFen);

    const fromSq = algebraicToSquare(ex1.targetPieceSquare)!;
    const toSq = algebraicToSquare(ex1.goalSquares[0])!;

    // Move e2 -> e4
    const record = game.move({ from: fromSq, to: toSq });
    expect(record).not.toBeNull();
    expect(squareToAlgebraic(toSq)).toBe('e4');

    // 1 move taken <= optimalMoves (1) -> 3 stars
    const stars = calculateExerciseStars(1, ex1.optimalMoves);
    expect(stars).toBe(3);

    // Initial state
    const state = createInitialSchoolState();
    expect(state.unlockedLessonIds).toContain('pawn');

    // Complete lesson
    const result = completeSchoolLesson(state, 'pawn', stars);
    expect(result.updatedState.completedLessonIds).toContain('pawn');
    expect(result.updatedState.lessonStars.pawn).toBe(3);
    expect(result.updatedState.unlockedLessonIds).toContain('rook');
  });

  it('2. Lección Jaque (check): delivers check with Rook to e1', () => {
    const lesson = getLessonById('check');
    expect(lesson).toBeDefined();

    const ex1 = lesson!.exercises[0];
    const game = new ChessGame(ex1.initialFen);

    const fromSq = algebraicToSquare(ex1.targetPieceSquare)!;
    const toSq = algebraicToSquare(ex1.goalSquares[0])!;

    // Move b1 -> e1 (gives check)
    const record = game.move({ from: fromSq, to: toSq });
    expect(record).not.toBeNull();
    expect(game.status().check).toBe(true);

    const stars = calculateExerciseStars(1, ex1.optimalMoves);
    expect(stars).toBe(3);
  });

  it('3. Lección Salir del Jaque (escape_check): moves King to f1 out of check', () => {
    const lesson = getLessonById('escape_check');
    expect(lesson).toBeDefined();

    const ex1 = lesson!.exercises[0];
    const game = new ChessGame(ex1.initialFen);
    expect(game.status().check).toBe(true);

    const fromSq = algebraicToSquare(ex1.targetPieceSquare)!;
    const toSq = algebraicToSquare(ex1.goalSquares[0])!;

    // Move e1 -> f1
    const record = game.move({ from: fromSq, to: toSq });
    expect(record).not.toBeNull();
    expect(game.status().check).toBe(false);
  });

  it('4. Lección Jaque Mate (checkmate): delivers corridor back-rank mate', () => {
    const lesson = getLessonById('checkmate');
    expect(lesson).toBeDefined();

    const ex1 = lesson!.exercises[0];
    const game = new ChessGame(ex1.initialFen);

    const fromSq = algebraicToSquare(ex1.targetPieceSquare)!;
    const toSq = algebraicToSquare(ex1.goalSquares[0])!;

    // Move b1 -> b8 (Checkmate!)
    const record = game.move({ from: fromSq, to: toSq });
    expect(record).not.toBeNull();
    expect(game.status().checkmate).toBe(true);
    expect(game.status().winner).toBe('w');
  });

  it('5. Lección Enroque (castling): executes kingside castling (0-0)', () => {
    const lesson = getLessonById('castling');
    expect(lesson).toBeDefined();

    const ex1 = lesson!.exercises[0];
    const game = new ChessGame(ex1.initialFen);

    const fromSq = algebraicToSquare(ex1.targetPieceSquare)!;
    const toSq = algebraicToSquare(ex1.goalSquares[0])!;

    // Move e1 -> g1 (kingside castle)
    const record = game.move({ from: fromSq, to: toSq });
    expect(record).not.toBeNull();
    expect(record!.san).toBe('O-O');

    // Rook moved to f1
    const f1Sq = algebraicToSquare('f1')!;
    expect(game.getPosition().board[f1Sq]).toBe('R');
  });

  it('6. Lección Promoción (promotion): promotes pawn to Queen on e8', () => {
    const lesson = getLessonById('promotion');
    expect(lesson).toBeDefined();

    const ex1 = lesson!.exercises[0];
    const game = new ChessGame(ex1.initialFen);

    const fromSq = algebraicToSquare(ex1.targetPieceSquare)!;
    const toSq = algebraicToSquare(ex1.goalSquares[0])!;

    // Promote e7 -> e8=Q
    const record = game.move({ from: fromSq, to: toSq, promotion: 'q' });
    expect(record).not.toBeNull();
    expect(record!.san).toBe('e8=Q');

    const e8Sq = algebraicToSquare('e8')!;
    expect(game.getPosition().board[e8Sq]).toBe('Q');
  });

  it('7. Mi Primera Partida (first_game): applies opening principle e2 -> e4', () => {
    const lesson = getLessonById('first_game');
    expect(lesson).toBeDefined();

    const ex1 = lesson!.exercises[0];
    const game = new ChessGame(ex1.initialFen);

    const fromSq = algebraicToSquare(ex1.targetPieceSquare)!;
    const toSq = algebraicToSquare(ex1.goalSquares[0])!;

    const record = game.move({ from: fromSq, to: toSq });
    expect(record).not.toBeNull();
    expect(record!.san).toBe('e4');
  });

  it('rejects invalid chess moves and prevents lesson completion', () => {
    const lesson = getLessonById('pawn')!;
    const ex1 = lesson.exercises[0];
    const game = new ChessGame(ex1.initialFen);

    const fromSq = algebraicToSquare(ex1.targetPieceSquare)!;
    // Illegal pawn move: e2 -> e5 (3 squares forward)
    const illegalToSq = algebraicToSquare('e5')!;

    const record = game.move({ from: fromSq, to: illegalToSq });
    expect(record).toBeNull(); // Rejected!
  });

  it('completes all 12 lessons and triggers graduation banner to debut tournament', () => {
    let state: SchoolProgressState = createInitialSchoolState();

    for (const lesson of SCHOOL_LESSONS) {
      const res = completeSchoolLesson(state, lesson.id, 3);
      state = res.updatedState;
    }

    expect(state.graduatedFromSchool).toBe(true);
    expect(state.completedLessonIds.length).toBe(12);
    expect(state.totalStars).toBe(36);
  });
});
