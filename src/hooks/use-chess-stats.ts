import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChessStats {
  readonly puzzleRushHighScore: number;
  readonly totalWins: number;
  readonly gamesPlayed: number;
}

const STATS_KEY = '@ajedrezpro_chess_stats';

export const useChessStats = () => {
  const [stats, setStats] = useState<ChessStats>({
    puzzleRushHighScore: 0,
    totalWins: 0,
    gamesPlayed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STATS_KEY);
      if (jsonValue != null) {
        setStats(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error("Error loading chess stats", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const saveStats = async (newStats: ChessStats) => {
    try {
      const jsonValue = JSON.stringify(newStats);
      await AsyncStorage.setItem(STATS_KEY, jsonValue);
      setStats(newStats);
    } catch (e) {
      console.error("Error saving chess stats", e);
    }
  };

  const updatePuzzleRushScore = useCallback(async (score: number) => {
    if (score > stats.puzzleRushHighScore) {
      const newStats = { ...stats, puzzleRushHighScore: score };
      await saveStats(newStats);
      return true;
    }
    return false;
  }, [stats]);

  const recordGame = useCallback(async (won: boolean) => {
    const newStats = {
      ...stats,
      gamesPlayed: stats.gamesPlayed + 1,
      totalWins: won ? stats.totalWins + 1 : stats.totalWins,
    };
    await saveStats(newStats);
  }, [stats]);

  return {
    stats,
    isLoading,
    updatePuzzleRushScore,
    recordGame,
  };
};
