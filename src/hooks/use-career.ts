import { useCallback, useEffect, useState } from 'react';
import type {
  CareerOpponent,
  CareerProfile,
  CareerRank,
  TournamentMatch,
} from '../career/career-types';
import {
  advanceToNextChampionship,
  getCurrentOpponent,
  getCurrentPlayerMatch,
  getPlayerColorForCurrentRound,
  recordCareerMatchResult,
  resetCurrentChampionship,
  type RecordMatchOutcomeResult,
} from '../career/career-service';
import {
  createInitialCareerProfile,
  loadCareerProfileFromStorage,
  saveCareerProfileToStorage,
} from '../career/career-storage';
import { getNextRankProgress, getRankForRating } from '../career/ranks';
import { getTierDefinition } from '../career/tournaments';

export function useCareer() {
  const [profile, setProfile] = useState<CareerProfile>(createInitialCareerProfile);
  const [loading, setLoading] = useState(true);

  // Load profile on mount
  useEffect(() => {
    let isMounted = true;
    loadCareerProfileFromStorage().then((loaded) => {
      if (isMounted) {
        setProfile(loaded);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const saveProfile = useCallback(async (newProfile: CareerProfile) => {
    setProfile(newProfile);
    await saveCareerProfileToStorage(newProfile);
  }, []);

  const currentMatch: TournamentMatch | null = getCurrentPlayerMatch(profile);
  const currentOpponent: CareerOpponent | null = getCurrentOpponent(profile);
  const playerColor: 'w' | 'b' = getPlayerColorForCurrentRound(profile);
  const currentRank: CareerRank = getRankForRating(profile.rating.currentRating);
  const rankProgress = getNextRankProgress(profile.rating.currentRating);
  const tierDef = getTierDefinition(profile.currentTierId);

  const applyMatchResult = useCallback(
    async (result: 'win' | 'loss' | 'draw'): Promise<RecordMatchOutcomeResult> => {
      const outcome = recordCareerMatchResult(profile, result);
      await saveProfile(outcome.updatedProfile);
      return outcome;
    },
    [profile, saveProfile]
  );

  const nextChampionship = useCallback(async () => {
    const updated = advanceToNextChampionship(profile);
    await saveProfile(updated);
  }, [profile, saveProfile]);

  const restartChampionship = useCallback(async () => {
    const updated = resetCurrentChampionship(profile);
    await saveProfile(updated);
  }, [profile, saveProfile]);

  const setPlayerName = useCallback(
    async (name: string) => {
      const updated: CareerProfile = {
        ...profile,
        playerName: name,
        currentTournament: {
          ...profile.currentTournament,
          standings: profile.currentTournament.standings.map((s) =>
            s.participantId === 'player' ? { ...s, name } : s
          ),
        },
      };
      await saveProfile(updated);
    },
    [profile, saveProfile]
  );

  const resetAllCareer = useCallback(async () => {
    const initial = createInitialCareerProfile(profile.playerName || 'Kepa');
    await saveProfile(initial);
  }, [profile.playerName, saveProfile]);

  return {
    profile,
    loading,
    currentMatch,
    currentOpponent,
    playerColor,
    currentRank,
    rankProgress,
    tierDef,
    applyMatchResult,
    nextChampionship,
    restartChampionship,
    setPlayerName,
    resetAllCareer,
  };
}
