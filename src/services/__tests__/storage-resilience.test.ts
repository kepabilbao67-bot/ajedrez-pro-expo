import { describe, expect, it } from 'vitest';
import { isValidCareerProfile, createInitialCareerProfile } from '../../career/career-storage';
import { isValidInventoryState, createInitialInventoryState } from '../../cosmetics/cosmetics-storage';
import { isValidSchoolState, createInitialSchoolState } from '../../school/school-storage';

describe('Storage Persistence & Schema Resilience', () => {
  describe('Career Profile Storage Validation', () => {
    it('validates a correct career profile structure', () => {
      const profile = createInitialCareerProfile('TestPlayer');
      expect(isValidCareerProfile(profile)).toBe(true);
    });

    it('rejects corrupted career profile data gracefully', () => {
      expect(isValidCareerProfile(null)).toBe(false);
      expect(isValidCareerProfile({})).toBe(false);
      expect(isValidCareerProfile({ version: 999, playerName: 'Broken' })).toBe(false);
      expect(isValidCareerProfile({ version: 1, playerName: 123 })).toBe(false);
    });
  });

  describe('Cosmetics Inventory Storage Validation', () => {
    it('validates a correct cosmetics inventory structure', () => {
      const inventory = createInitialInventoryState();
      expect(isValidInventoryState(inventory)).toBe(true);
    });

    it('rejects corrupted cosmetics inventory data gracefully', () => {
      expect(isValidInventoryState(null)).toBe(false);
      expect(isValidInventoryState('bad_string')).toBe(false);
      expect(isValidInventoryState({ version: 1, coins: 'many' })).toBe(false);
    });
  });

  describe('School Academy Storage Validation', () => {
    it('validates a correct school state structure', () => {
      const state = createInitialSchoolState();
      expect(isValidSchoolState(state)).toBe(true);
    });

    it('rejects corrupted school progress state gracefully', () => {
      expect(isValidSchoolState(null)).toBe(false);
      expect(isValidSchoolState({ completedLessonIds: 'none' })).toBe(false);
    });
  });
});
