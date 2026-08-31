import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getDailyPuzzle,
  getPuzzlesByTier,
  getTodayDateString,
  loadDailyStreak,
  recordDailyPuzzleSolved,
} from './daily-puzzle';
import { OFFLINE_TACTICS_PACK } from './content/offline-tactics-pack';

const mockStore = new Map<string, string>();

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => mockStore.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      mockStore.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      mockStore.delete(key);
    }),
  },
}));

describe('Daily Puzzle & Offline Tactics Pack', () => {
  beforeEach(() => {
    mockStore.clear();
  });

  it('offline pack contains at least 30+ rich categorized puzzles', () => {
    expect(OFFLINE_TACTICS_PACK.length).toBeGreaterThanOrEqual(30);
    const themes = new Set(OFFLINE_TACTICS_PACK.map((p) => p.theme));
    expect(themes.has('fork')).toBe(true);
    expect(themes.has('pin')).toBe(true);
    expect(themes.has('mate-in-1')).toBe(true);
    expect(themes.has('mate-in-2')).toBe(true);
    expect(themes.has('discovered-attack')).toBe(true);
    expect(themes.has('win-material')).toBe(true);
    expect(themes.has('endgame')).toBe(true);
  });

  it('filters puzzles accurately by ELO tier (beginner, intermediate, master)', () => {
    const beginner = getPuzzlesByTier('beginner');
    expect(beginner.length).toBeGreaterThan(0);
    expect(beginner.every((p) => p.elo <= 1250)).toBe(true);

    const intermediate = getPuzzlesByTier('intermediate');
    expect(intermediate.length).toBeGreaterThan(0);
    expect(intermediate.every((p) => p.elo >= 1251 && p.elo <= 1750)).toBe(true);

    const master = getPuzzlesByTier('master');
    expect(master.length).toBeGreaterThan(0);
    expect(master.every((p) => p.elo >= 1751)).toBe(true);
  });

  it('generates consistent deterministic daily puzzle for the same date and tier', () => {
    const testDate = new Date('2026-08-30T12:00:00Z');
    const puzzleA = getDailyPuzzle('intermediate', testDate);
    const puzzleB = getDailyPuzzle('intermediate', testDate);

    expect(puzzleA.id).toBe(puzzleB.id);
    expect(puzzleA.title).toBe(puzzleB.title);
    expect(puzzleA.solution.length).toBeGreaterThan(0);
  });

  it('tracks daily streak and resolution status in storage', async () => {
    const initial = await loadDailyStreak();
    expect(typeof initial.currentStreak).toBe('number');
    expect(typeof initial.bestStreak).toBe('number');

    const updated = await recordDailyPuzzleSolved();
    expect(updated.solvedToday).toBe(true);
    expect(updated.currentStreak).toBeGreaterThanOrEqual(1);
    expect(updated.lastSolvedDate).toBe(getTodayDateString());
  });
});
