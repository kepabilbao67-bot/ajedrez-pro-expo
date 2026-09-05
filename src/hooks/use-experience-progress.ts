import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ACADEMY_LESSONS,
  COSMETIC_CATALOG,
  WORLD_TOUR,
  rankForXp,
  unlockedTournaments,
} from '@/experience/experience-catalog';
import {
  buyCatalogItem,
  claimDailyReward,
  completeAcademyLesson,
  completeTournament,
  createDefaultExperienceState,
  equipCatalogItem,
  isExperienceState,
  toggleKidsMode,
  type ExperienceState,
} from '@/experience/experience-state';

const STORAGE_KEY = '@ajedrezpro_experience_v1';

export function useExperienceProgress(xp: number) {
  const [state, setState] = useState<ExperienceState>(() => createDefaultExperienceState());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        try {
          const parsed: unknown = JSON.parse(raw);
          if (isExperienceState(parsed)) setState(parsed);
        } catch {
          // Ignore corrupt optional experience state; keep the safe defaults.
        }
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((next: ExperienceState) => {
    setState(next);
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const buy = useCallback((itemId: string) => {
    const item = COSMETIC_CATALOG.find((candidate) => candidate.id === itemId);
    if (!item) return false;
    const next = buyCatalogItem(state, item, xp);
    if (next === state) return false;
    persist(next);
    return true;
  }, [persist, state, xp]);

  const equip = useCallback((itemId: string) => {
    const next = equipCatalogItem(state, itemId);
    if (next === state) return false;
    persist(next);
    return true;
  }, [persist, state]);

  const finishTournament = useCallback((tournamentId: string) => {
    const next = completeTournament(state, tournamentId, xp);
    if (next === state) return false;
    persist(next);
    return true;
  }, [persist, state, xp]);

  const finishLesson = useCallback((lessonId: string) => {
    const lesson = ACADEMY_LESSONS.find((candidate) => candidate.id === lessonId);
    if (!lesson) return false;
    const next = completeAcademyLesson(state, lessonId, lesson.rewardCoins);
    if (next === state) return false;
    persist(next);
    return true;
  }, [persist, state]);

  const setKidsMode = useCallback((enabled: boolean) => {
    persist(toggleKidsMode(state, enabled));
  }, [persist, state]);

  const claimToday = useCallback((today: string) => {
    const next = claimDailyReward(state, today);
    if (next === state) return false;
    persist(next);
    return true;
  }, [persist, state]);

  const rank = useMemo(() => rankForXp(xp), [xp]);
  const tournaments = useMemo(() => unlockedTournaments(xp), [xp]);
  const nextTournament = useMemo(
    () => WORLD_TOUR.find((tournament) => !state.completedTournamentIds.includes(tournament.id)) ?? null,
    [state.completedTournamentIds],
  );

  return {
    state,
    loaded,
    rank,
    tournaments,
    nextTournament,
    buy,
    equip,
    finishTournament,
    finishLesson,
    setKidsMode,
    claimToday,
  } as const;
}
