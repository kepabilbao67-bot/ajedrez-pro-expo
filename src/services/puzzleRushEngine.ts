import AsyncStorage from '@react-native-async-storage/async-storage';
import { OFFLINE_TACTICS_PACK, type TacticalPuzzleItem } from '@/training/content/offline-tactics-pack';

export type PuzzleRushMode = '3min' | '5min' | 'survival';

export interface PuzzleRushRecords {
  readonly record3min: number;
  readonly record5min: number;
  readonly recordSurvival: number;
}

export const DEFAULT_PUZZLE_RUSH_RECORDS: PuzzleRushRecords = {
  record3min: 0,
  record5min: 0,
  recordSurvival: 0,
};

const STORAGE_KEY = '@ajedrezpro_puzzle_rush_records';

export async function loadPuzzleRushRecords(): Promise<PuzzleRushRecords> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PUZZLE_RUSH_RECORDS;
    const parsed = JSON.parse(raw);
    return {
      record3min: Number(parsed.record3min) || 0,
      record5min: Number(parsed.record5min) || 0,
      recordSurvival: Number(parsed.recordSurvival) || 0,
    };
  } catch {
    return DEFAULT_PUZZLE_RUSH_RECORDS;
  }
}

export async function savePuzzleRushRecord(
  mode: PuzzleRushMode,
  score: number
): Promise<{ records: PuzzleRushRecords; isNewRecord: boolean }> {
  const current = await loadPuzzleRushRecords();
  let isNewRecord = false;
  let updated: PuzzleRushRecords = { ...current };

  if (mode === '3min' && score > current.record3min) {
    isNewRecord = true;
    updated = { ...updated, record3min: score };
  } else if (mode === '5min' && score > current.record5min) {
    isNewRecord = true;
    updated = { ...updated, record5min: score };
  } else if (mode === 'survival' && score > current.recordSurvival) {
    isNewRecord = true;
    updated = { ...updated, recordSurvival: score };
  }

  if (isNewRecord) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage error
    }
  }

  return { records: updated, isNewRecord };
}

/**
 * Returns a puzzle based on the user's current score (adaptive dynamic difficulty).
 */
export function getPuzzleForScore(score: number, excludeIds: readonly string[] = []): TacticalPuzzleItem {
  let minRating = 800;
  let maxRating = 1150;

  if (score >= 20) {
    minRating = 1901;
    maxRating = 2500;
  } else if (score >= 12) {
    minRating = 1501;
    maxRating = 1900;
  } else if (score >= 6) {
    minRating = 1151;
    maxRating = 1500;
  }

  const pool = OFFLINE_TACTICS_PACK.filter(
    (p) => p.elo >= minRating && p.elo <= maxRating && !excludeIds.includes(p.id)
  );

  if (pool.length > 0) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }

  // Fallback to any puzzle not excluded or random from whole pack
  const fallbackPool = OFFLINE_TACTICS_PACK.filter((p) => !excludeIds.includes(p.id));
  if (fallbackPool.length > 0) {
    return fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
  }

  return OFFLINE_TACTICS_PACK[Math.floor(Math.random() * OFFLINE_TACTICS_PACK.length)];
}

export function getInitialTimeForMode(mode: PuzzleRushMode): number {
  switch (mode) {
    case '3min':
      return 180;
    case '5min':
      return 300;
    case 'survival':
      return 0; // counts up in survival
  }
}

export function formatRushTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
