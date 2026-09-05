import { describe, expect, it } from 'vitest';
import { createInitialSchoolState } from './school-storage';
import { calculateExerciseStars, completeSchoolLesson } from './school-service';
import { SCHOOL_LESSONS } from './school-lessons';

describe('School and Kids Learning Service', () => {
  it('creates initial school state with only pawn unlocked', () => {
    const state = createInitialSchoolState();
    expect(state.unlockedLessonIds).toEqual(['pawn']);
    expect(state.completedLessonIds.length).toBe(0);
    expect(state.totalStars).toBe(0);
    expect(state.graduatedFromSchool).toBe(false);
  });

  it('calculates stars accurately based on optimal move count', () => {
    expect(calculateExerciseStars(1, 1)).toBe(3);
    expect(calculateExerciseStars(2, 1)).toBe(2);
    expect(calculateExerciseStars(4, 1)).toBe(1);
  });

  it('completes pawn lesson, awards stars and unlocks rook lesson', () => {
    const state = createInitialSchoolState();
    const result = completeSchoolLesson(state, 'pawn', 3);

    expect(result.starsAwarded).toBe(3);
    expect(result.nextLessonUnlocked).toBe('rook');
    expect(result.updatedState.unlockedLessonIds).toContain('rook');
    expect(result.updatedState.completedLessonIds).toContain('pawn');
    expect(result.updatedState.totalStars).toBe(3);
    expect(result.xpEarned).toBe(50);
    expect(result.coinsEarned).toBe(50);
  });

  it('graduates player when all 12 lessons are completed', () => {
    let state = createInitialSchoolState();

    for (const lesson of SCHOOL_LESSONS) {
      const outcome = completeSchoolLesson(state, lesson.id, 3);
      state = outcome.updatedState;
    }

    expect(state.completedLessonIds.length).toBe(12);
    expect(state.graduatedFromSchool).toBe(true);
    expect(state.totalStars).toBe(36); // 12 * 3
  });

  it('has valid demonstration FENs and real-piece comparison for every lesson', () => {
    for (const lesson of SCHOOL_LESSONS) {
      expect(lesson.demonstrationFen).toBeTruthy();
      expect(lesson.realPieceComparison.classicName).toBeTruthy();
      expect(lesson.realPieceComparison.kidsName).toBeTruthy();
      expect(lesson.exercises.length).toBeGreaterThanOrEqual(2);
    }
  });
});
