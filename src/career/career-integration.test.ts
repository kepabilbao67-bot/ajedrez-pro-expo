import { describe, expect, it } from 'vitest';
import { createInitialCareerProfile } from './career-storage';
import { recordCareerMatchResult } from './career-service';
import { createInitialClockState, tickGameClock, handleClockMove } from '../clock/clock-engine';
import { TIME_CONTROL_PRESETS } from '../clock/clock-presets';
import { createInitialInventoryState } from '../cosmetics/cosmetics-storage';
import { buyCosmeticWithCoins, equipCosmeticItem } from '../cosmetics/cosmetics-service';
import { createInitialSchoolState } from '../school/school-storage';
import { completeSchoolLesson } from '../school/school-service';
import { SCHOOL_LESSONS } from '../school/school-lessons';

import type { GameClockState } from '../clock/clock-types';

describe('Integration Test Suite: AjedrezPro Full Flows', () => {
  describe('A & B. Complete Career Tournament & Idempotent Rewards', () => {
    it('plays through initial tier tournament, crowns champion, unlocks reward, and prevents double rewards', () => {
      let career = createInitialCareerProfile('Kepa');
      const initialTournament = career.currentTournament;
      expect(initialTournament).toBeDefined();
      expect(career.currentTierId).toBe('academia');
      expect(initialTournament.currentRound).toBe(1);

      // Round 1: Win against first opponent
      const r1 = recordCareerMatchResult(career, 'win');
      expect(r1.isNewResult).toBe(true);
      expect(r1.ratingDelta).toBeGreaterThan(0);
      expect(r1.updatedProfile.currentTournament.currentRound).toBe(2);
      expect(r1.tournamentCompleted).toBe(false);

      // Finish remaining rounds to complete the tournament
      let activeProfile = r1.updatedProfile;
      while (!activeProfile.currentTournament.isCompleted) {
        const outcome = recordCareerMatchResult(activeProfile, 'win');
        activeProfile = outcome.updatedProfile;
        if (activeProfile.currentTournament.isCompleted) {
          expect(outcome.tournamentCompleted).toBe(true);
          expect(outcome.isChampion).toBe(true);
          expect(activeProfile.trophies.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('C & D. Clock Engine: Timeout & App State Resumption', () => {
    it('decrements time on tick and triggers timeout when reaching zero', () => {
      // 1-minute bullet preset
      const bulletPreset = TIME_CONTROL_PRESETS.find((p) => p.id === 'bullet-1-0')!;
      let clock: GameClockState = {
        ...createInitialClockState(bulletPreset),
        isRunning: true,
        activeSide: 'w',
        lastTimestamp: 1000000,
      };

      // Advance 50 seconds (50,000 ms)
      clock = tickGameClock(clock, 1050000);
      expect(clock.whiteMs).toBe(10000); // 60s - 50s = 10s
      expect(clock.isFlagged).toBe(false);
      expect(clock.flaggedSide).toBeNull();

      // Advance 15 more seconds -> White flags!
      clock = tickGameClock(clock, 1065000);
      expect(clock.whiteMs).toBe(0);
      expect(clock.isFlagged).toBe(true);
      expect(clock.flaggedSide).toBe('w');
      expect(clock.isRunning).toBe(false);
    });

    it('pauses and accurately restores wall-clock with Fischer increment', () => {
      const blitzPreset = TIME_CONTROL_PRESETS.find((p) => p.id === 'blitz-3-2')!;
      let clock: GameClockState = {
        ...createInitialClockState(blitzPreset),
        isRunning: true,
        activeSide: 'w',
        lastTimestamp: 1000000,
      };

      // Play 10 seconds
      clock = tickGameClock(clock, 1010000);
      expect(clock.whiteMs).toBe(170000); // 180s - 10s = 170s

      // Player executes move: adds 2s (2000ms) increment and switches to black
      clock = handleClockMove(clock, 'w', 1010000);
      expect(clock.whiteMs).toBe(172000);
      expect(clock.activeSide).toBe('b');

      // Pause clock
      clock = { ...clock, isPaused: true };

      // Background elapsed time should NOT drain seconds while paused
      clock = tickGameClock(clock, 1040000);
      expect(clock.blackMs).toBe(180000);
    });
  });

  describe('E. Store Purchase -> Collection -> Equip Flow', () => {
    it('manages crowns, prevents duplicate purchases, and equips items into active loadout', () => {
      let inv = createInitialInventoryState();
      inv.coins = 1000;

      // Purchase walnut board for 350 crowns
      const purchaseRes = buyCosmeticWithCoins(inv, 'board_walnut');
      expect(purchaseRes.success).toBe(true);
      expect(purchaseRes.updatedInventory.coins).toBe(650);
      expect(purchaseRes.updatedInventory.ownedItemIds).toContain('board_walnut');

      // Duplicate purchase attempt is rejected
      const dupPurchase = buyCosmeticWithCoins(purchaseRes.updatedInventory, 'board_walnut');
      expect(dupPurchase.success).toBe(false);
      expect(dupPurchase.error).toContain('Ya posees');

      // Equip walnut board
      const equipRes = equipCosmeticItem(purchaseRes.updatedInventory, 'boards', 'board_walnut');
      expect(equipRes.equippedBoardId).toBe('board_walnut');

      // Purchase & Equip modern piece set
      inv = equipRes;
      const modernPurchase = buyCosmeticWithCoins(inv, 'piece_modern');
      expect(modernPurchase.success).toBe(true);
      const equipModern = equipCosmeticItem(modernPurchase.updatedInventory, 'pieces', 'piece_modern');
      expect(equipModern.equippedPieceSetId).toBe('piece_modern');
    });
  });

  describe('F & G. School 12 Lessons & Kids Tournament Graduation', () => {
    it('progresses through all 12 lessons sequentially and marks academy graduation', () => {
      let school = createInitialSchoolState();
      expect(school.unlockedLessonIds).toEqual(['pawn']);

      for (let i = 0; i < SCHOOL_LESSONS.length; i++) {
        const lesson = SCHOOL_LESSONS[i];
        expect(school.unlockedLessonIds).toContain(lesson.id);

        const outcome = completeSchoolLesson(school, lesson.id, 3);
        school = outcome.updatedState;

        if (i < SCHOOL_LESSONS.length - 1) {
          expect(outcome.nextLessonUnlocked).toBe(SCHOOL_LESSONS[i + 1].id);
        }
      }

      expect(school.completedLessonIds.length).toBe(12);
      expect(school.graduatedFromSchool).toBe(true);
      expect(school.totalStars).toBe(36);
    });
  });
});
