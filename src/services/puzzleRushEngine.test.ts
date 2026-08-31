import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  formatRushTime,
  getInitialTimeForMode,
  getPuzzleForScore,
  loadPuzzleRushRecords,
  savePuzzleRushRecord,
} from './puzzleRushEngine';

// Mock AsyncStorage
const mockStore: Record<string, string> = {};
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => mockStore[key] ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      mockStore[key] = value;
    }),
  },
}));

describe('Puzzle Rush Engine', () => {
  beforeEach(() => {
    for (const key of Object.keys(mockStore)) {
      delete mockStore[key];
    }
  });

  it('formats rush time correctly', () => {
    expect(formatRushTime(180)).toBe('3:00');
    expect(formatRushTime(65)).toBe('1:05');
    expect(formatRushTime(9)).toBe('0:09');
    expect(formatRushTime(0)).toBe('0:00');
  });

  it('provides correct initial time per mode', () => {
    expect(getInitialTimeForMode('3min')).toBe(180);
    expect(getInitialTimeForMode('5min')).toBe(300);
    expect(getInitialTimeForMode('survival')).toBe(0);
  });

  it('adjusts puzzle rating difficulty based on score', () => {
    const easyPuzzle = getPuzzleForScore(2);
    expect(easyPuzzle.elo).toBeLessThanOrEqual(1150);

    const intermediatePuzzle = getPuzzleForScore(8);
    expect(intermediatePuzzle.elo).toBeGreaterThanOrEqual(1151);

    const hardPuzzle = getPuzzleForScore(15);
    expect(hardPuzzle.elo).toBeGreaterThanOrEqual(1451);
  });

  it('loads and saves records with new record detection', async () => {
    const initial = await loadPuzzleRushRecords();
    expect(initial.record3min).toBe(0);

    const firstSave = await savePuzzleRushRecord('3min', 15);
    expect(firstSave.isNewRecord).toBe(true);
    expect(firstSave.records.record3min).toBe(15);

    const secondSave = await savePuzzleRushRecord('3min', 10);
    expect(secondSave.isNewRecord).toBe(false);
    expect(secondSave.records.record3min).toBe(15);
  });
});
