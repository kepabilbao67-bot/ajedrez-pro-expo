import AsyncStorage from '@react-native-async-storage/async-storage';
import { OFFLINE_TACTICS_PACK, type TacticalPuzzleItem } from './content/offline-tactics-pack';

export type EloTier = 'beginner' | 'intermediate' | 'master';

export interface EloTierInfo {
  readonly id: EloTier;
  readonly label: string;
  readonly minElo: number;
  readonly maxElo: number;
  readonly color: string;
  readonly icon: string;
}

export const ELO_TIERS: readonly EloTierInfo[] = [
  { id: 'beginner', label: 'Principiante', minElo: 800, maxElo: 1250, color: '#00E5B4', icon: '🌱' },
  { id: 'intermediate', label: 'Intermedio', minElo: 1251, maxElo: 1750, color: '#F5C451', icon: '⚔️' },
  { id: 'master', label: 'Maestro', minElo: 1751, maxElo: 2400, color: '#A374FF', icon: '👑' },
];

export interface DailyStreakData {
  readonly currentStreak: number;
  readonly bestStreak: number;
  readonly lastSolvedDate: string | null; // Format YYYY-MM-DD
  readonly totalPuzzlesSolved: number;
  readonly solvedToday: boolean;
}

const STORAGE_KEY = '@ajedrezpro_daily_streak';

export function getTodayDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getPuzzlesByTier(tier: EloTier): TacticalPuzzleItem[] {
  const tierInfo = ELO_TIERS.find((t) => t.id === tier) ?? ELO_TIERS[0];
  const list = OFFLINE_TACTICS_PACK.filter(
    (p) => p.elo >= tierInfo.minElo && p.elo <= tierInfo.maxElo
  );
  return list.length > 0 ? list : [...OFFLINE_TACTICS_PACK];
}

/**
 * Returns a deterministic puzzle for the day and chosen ELO tier.
 */
export function getDailyPuzzle(tier: EloTier = 'intermediate', date: Date = new Date()): TacticalPuzzleItem {
  const tierPuzzles = getPuzzlesByTier(tier);
  const dateStr = getTodayDateString(date);

  // Hash the date string deterministically
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % tierPuzzles.length;
  return tierPuzzles[index];
}

export async function loadDailyStreak(): Promise<DailyStreakData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        lastSolvedDate: null,
        totalPuzzlesSolved: 0,
        solvedToday: false,
      };
    }
    const parsed = JSON.parse(raw);
    const today = getTodayDateString();
    const isSolvedToday = parsed.lastSolvedDate === today;

    // Check if streak was broken (missed yesterday)
    let currentStreak = parsed.currentStreak || 0;
    if (parsed.lastSolvedDate && !isSolvedToday) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getTodayDateString(yesterday);
      if (parsed.lastSolvedDate !== yesterdayStr) {
        currentStreak = 0;
      }
    }

    return {
      currentStreak,
      bestStreak: parsed.bestStreak || currentStreak,
      lastSolvedDate: parsed.lastSolvedDate || null,
      totalPuzzlesSolved: parsed.totalPuzzlesSolved || 0,
      solvedToday: isSolvedToday,
    };
  } catch {
    return {
      currentStreak: 0,
      bestStreak: 0,
      lastSolvedDate: null,
      totalPuzzlesSolved: 0,
      solvedToday: false,
    };
  }
}

export async function recordDailyPuzzleSolved(): Promise<DailyStreakData> {
  const currentData = await loadDailyStreak();
  const today = getTodayDateString();

  if (currentData.lastSolvedDate === today) {
    // Already solved today, increment count only
    const updated: DailyStreakData = {
      ...currentData,
      totalPuzzlesSolved: currentData.totalPuzzlesSolved + 1,
      solvedToday: true,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getTodayDateString(yesterday);

  let newStreak = 1;
  if (currentData.lastSolvedDate === yesterdayStr) {
    newStreak = currentData.currentStreak + 1;
  }

  const bestStreak = Math.max(currentData.bestStreak, newStreak);
  const updated: DailyStreakData = {
    currentStreak: newStreak,
    bestStreak,
    lastSolvedDate: today,
    totalPuzzlesSolved: currentData.totalPuzzlesSolved + 1,
    solvedToday: true,
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
