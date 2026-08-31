import { describe, expect, it } from 'vitest';
import {
  ACHIEVEMENTS,
  unlockedAchievementIds,
  unlockAchievements,
  type AchievementContext,
} from './achievements';
import { DEFAULT_GAMIFICATION_STATE } from './xp-types';

describe('Achievements & Trophies System V1.2', () => {
  it('contains 16 categorized achievements across all 4 tiers', () => {
    expect(ACHIEVEMENTS.length).toBe(16);
    const tiers = new Set(ACHIEVEMENTS.map((a) => a.tier));
    expect(tiers.has('bronze')).toBe(true);
    expect(tiers.has('silver')).toBe(true);
    expect(tiers.has('gold')).toBe(true);
    expect(tiers.has('diamond')).toBe(true);
  });

  it('evaluates eligible achievements based on context', () => {
    const context: AchievementContext = {
      wins: 1,
      gamesPlayed: 10,
      estimatedLevel: 2,
      exercisesCompleted: 20,
      hasUsedClock: true,
      hasStudiedOpening: true,
      hasExecutedBrilliant: true,
      hasStudiedPgn: true,
    };

    const eligible = unlockedAchievementIds(DEFAULT_GAMIFICATION_STATE, context);

    expect(eligible).toContain('first-victory');
    expect(eligible).toContain('ten-games');
    expect(eligible).toContain('level-improvement');
    expect(eligible).toContain('tactics-expert');
    expect(eligible).toContain('clock-sprinter');
    expect(eligible).toContain('opening-explorer');
    expect(eligible).toContain('brilliant-mind');
    expect(eligible).toContain('pgn-scholar');
  });

  it('unlocks achievements without duplicates and timestamps them', () => {
    const context: AchievementContext = {
      wins: 1,
      gamesPlayed: 1,
      estimatedLevel: 1,
      exercisesCompleted: 0,
    };

    const now = '2026-08-30T12:00:00Z';
    const updatedState = unlockAchievements(DEFAULT_GAMIFICATION_STATE, context, now);

    expect(updatedState.unlockedAchievements.length).toBe(1);
    expect(updatedState.unlockedAchievements[0].id).toBe('first-victory');
    expect(updatedState.unlockedAchievements[0].unlockedAt).toBe(now);

    // Unlocking again does not create duplicate entries
    const secondPass = unlockAchievements(updatedState, context, now);
    expect(secondPass.unlockedAchievements.length).toBe(1);
  });
});
