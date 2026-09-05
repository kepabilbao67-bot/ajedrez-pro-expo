import { useCallback, useEffect, useState } from 'react';
import type { PieceLessonId, SchoolLesson, SchoolMode, SchoolProgressState } from '../school/school-types';
import { SCHOOL_LESSONS, getLessonById } from '../school/school-lessons';
import {
  createInitialSchoolState,
  loadSchoolStateFromStorage,
  saveSchoolStateToStorage,
} from '../school/school-storage';
import { completeSchoolLesson, type CompleteLessonResult } from '../school/school-service';
import { useCosmetics } from './use-cosmetics';

export function useSchool() {
  const [state, setState] = useState<SchoolProgressState>(createInitialSchoolState);
  const [loading, setLoading] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<PieceLessonId>('pawn');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [profeProMessage, setProfeProMessage] = useState<string>('¡Hola! Soy el Profe Pro. ¿Listo para descubrir los secretos de las piezas de ajedrez?');
  const { addCoins } = useCosmetics();

  useEffect(() => {
    let isMounted = true;
    loadSchoolStateFromStorage().then((loaded) => {
      if (isMounted) {
        setState(loaded);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const saveState = useCallback(async (newState: SchoolProgressState) => {
    setState(newState);
    await saveSchoolStateToStorage(newState);
  }, []);

  const activeLesson: SchoolLesson = getLessonById(activeLessonId) ?? SCHOOL_LESSONS[0];
  const activeExercise = activeLesson.exercises[currentExerciseIndex] ?? activeLesson.exercises[0];

  const setSchoolMode = useCallback(
    async (mode: SchoolMode) => {
      const updated = { ...state, mode };
      await saveState(updated);
    },
    [state, saveState]
  );

  const selectLesson = useCallback((lessonId: PieceLessonId) => {
    setActiveLessonId(lessonId);
    setCurrentExerciseIndex(0);
    const lesson = getLessonById(lessonId);
    if (lesson) {
      setProfeProMessage(`¡Bienvenido a la lección de ${lesson.pieceName}! ${lesson.introStory}`);
    }
  }, []);

  const finishLesson = useCallback(
    async (stars: number = 3): Promise<CompleteLessonResult> => {
      const result = completeSchoolLesson(state, activeLessonId, stars);
      await saveState(result.updatedState);
      if (result.coinsEarned > 0) {
        await addCoins(result.coinsEarned);
      }
      return result;
    },
    [state, activeLessonId, saveState, addCoins]
  );

  const nextExercise = useCallback(() => {
    if (currentExerciseIndex < activeLesson.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    }
  }, [currentExerciseIndex, activeLesson.exercises.length]);

  return {
    state,
    loading,
    allLessons: SCHOOL_LESSONS,
    activeLesson,
    activeExercise,
    currentExerciseIndex,
    profeProMessage,
    setProfeProMessage,
    setSchoolMode,
    selectLesson,
    finishLesson,
    nextExercise,
  };
}
