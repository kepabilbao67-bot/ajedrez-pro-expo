import { SCHOOL_LESSONS, getLessonById } from './school-lessons';
import type { PieceLessonId, SchoolProgressState } from './school-types';

export interface CompleteLessonResult {
  readonly updatedState: SchoolProgressState;
  readonly isNewCompletion: boolean;
  readonly starsAwarded: number;
  readonly xpEarned: number;
  readonly coinsEarned: number;
  readonly nextLessonUnlocked: string | null;
  readonly graduated: boolean;
}

/**
 * Calculates stars (1 to 3) based on moves taken compared to optimal moves.
 */
export function calculateExerciseStars(movesTaken: number, optimalMoves: number): number {
  if (movesTaken <= optimalMoves) {
    return 3;
  }
  if (movesTaken <= optimalMoves + 1) {
    return 2;
  }
  return 1;
}

/**
 * Records lesson completion, calculates stars, unlocks the next piece lesson in order,
 * and detects graduation from the school academy.
 */
export function completeSchoolLesson(
  state: SchoolProgressState,
  lessonId: PieceLessonId,
  stars: number
): CompleteLessonResult {
  const lesson = getLessonById(lessonId);
  if (!lesson) {
    throw new Error(`La lección ${lessonId} no existe.`);
  }

  const boundedStars = Math.min(3, Math.max(1, stars));
  const isNewCompletion = !state.completedLessonIds.includes(lessonId);
  const previousStars = state.lessonStars[lessonId] ?? 0;
  const bestStars = Math.max(previousStars, boundedStars);

  const updatedCompleted = isNewCompletion
    ? [...state.completedLessonIds, lessonId]
    : state.completedLessonIds;

  const updatedLessonStars = {
    ...state.lessonStars,
    [lessonId]: bestStars,
  };

  const totalStars = Object.values(updatedLessonStars).reduce((acc, curr) => acc + curr, 0);

  // Determine next lesson to unlock
  const currentLessonIndex = SCHOOL_LESSONS.findIndex((l) => l.id === lessonId);
  let nextLessonUnlocked: string | null = null;
  const updatedUnlocked = [...state.unlockedLessonIds];

  if (currentLessonIndex >= 0 && currentLessonIndex < SCHOOL_LESSONS.length - 1) {
    const nextLesson = SCHOOL_LESSONS[currentLessonIndex + 1];
    nextLessonUnlocked = nextLesson.id;
    if (!updatedUnlocked.includes(nextLesson.id)) {
      updatedUnlocked.push(nextLesson.id);
    }
  }

  const graduated = updatedCompleted.length >= SCHOOL_LESSONS.length;

  const xpEarned = isNewCompletion ? lesson.rewardXp : 15;
  const coinsEarned = isNewCompletion ? lesson.rewardCoins : 10;

  const updatedState: SchoolProgressState = {
    ...state,
    completedLessonIds: updatedCompleted,
    lessonStars: updatedLessonStars,
    totalStars,
    unlockedLessonIds: updatedUnlocked,
    graduatedFromSchool: graduated,
    updatedAt: new Date().toISOString(),
  };

  return {
    updatedState,
    isNewCompletion,
    starsAwarded: boundedStars,
    xpEarned,
    coinsEarned,
    nextLessonUnlocked,
    graduated,
  };
}
