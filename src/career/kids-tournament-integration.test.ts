import { describe, expect, it } from 'vitest';
import {
  canUnlockKidsCup,
  createKidsCupTournament,
  recordKidsCupSemifinal,
  recordKidsCupFinal,
  claimKidsCupChampionRewards,
  KIDS_CUP_REWARDS,
} from './kids-tournament';
import { createInitialCareerProfile } from './career-storage';
import { createInitialInventoryState } from '../cosmetics/cosmetics-storage';
import { DEFAULT_GAMIFICATION_STATE } from '../gamification/xp-types';

describe('Kids Tournament (Copa Promesas) — E2E Integration Suite', () => {
  it('follows full victory path: graduation -> unlocks Copa Promesas -> semifinal win -> final win -> rewards -> start career', () => {
    // 1. Check School Graduation requirement
    expect(canUnlockKidsCup({ graduatedFromSchool: false })).toBe(false);
    expect(canUnlockKidsCup({ graduatedFromSchool: true })).toBe(true);

    // 2. Initialize Tournament from graduation
    const tournament = createKidsCupTournament('Leo');
    expect(tournament.id).toContain('kids');
    expect(tournament.format).toBe('eliminatoria');
    expect(tournament.currentRound).toBe(1);
    expect(tournament.isCompleted).toBe(false);
    expect(tournament.matches.length).toBe(2);

    // 3. Semifinal Match -> Player wins
    const semiResult = recordKidsCupSemifinal(tournament, true);
    expect(semiResult.qualifiedForFinal).toBe(true);
    expect(semiResult.updatedTournament.currentRound).toBe(2);
    expect(semiResult.updatedTournament.isCompleted).toBe(false);
    expect(semiResult.updatedTournament.matches.length).toBe(3); // 2 semis + 1 final

    // 4. Final Match -> Player wins championship
    const finalResult = recordKidsCupFinal(semiResult.updatedTournament, true);
    expect(finalResult.isChampion).toBe(true);
    expect(finalResult.updatedTournament.isCompleted).toBe(true);
    expect(finalResult.updatedTournament.finalRank).toBe(1);

    // 5. Award Rewards to Profile, Inventory, and Gamification
    let profile = createInitialCareerProfile('Leo');
    let inventory = createInitialInventoryState();
    let gamification = { ...DEFAULT_GAMIFICATION_STATE, xp: 100 };

    const initialCoins = inventory.coins;
    const initialXp = gamification.xp;

    const rewardResult = claimKidsCupChampionRewards(
      profile,
      inventory,
      gamification,
      finalResult.isChampion
    );

    expect(rewardResult.isNewReward).toBe(true);
    expect(rewardResult.deltaXp).toBe(KIDS_CUP_REWARDS.xp); // +250 XP
    expect(rewardResult.deltaCrowns).toBe(KIDS_CUP_REWARDS.crowns); // +350 Coronas
    expect(rewardResult.unlockedPieceId).toBe(KIDS_CUP_REWARDS.cosmeticPieceId); // 'piece_kids_classic'
    expect(rewardResult.unlockedTrophy?.tournamentName).toContain('Copa Promesas');
    expect(rewardResult.canStartCareer).toBe(true); // Opción de comenzar carrera

    expect(rewardResult.updatedInventory.coins).toBe(initialCoins + 350);
    expect(rewardResult.updatedGamification.xp).toBe(initialXp + 250);
    expect(rewardResult.updatedInventory.ownedItemIds).toContain('piece_kids_classic');
    expect(rewardResult.updatedProfile.trophies.length).toBe(1);
  });

  it('handles defeat in semifinal: player does NOT qualify for final', () => {
    const tournament = createKidsCupTournament('Leo');
    const semiResult = recordKidsCupSemifinal(tournament, false); // Player loses semifinal

    expect(semiResult.qualifiedForFinal).toBe(false);
    expect(semiResult.updatedTournament.isCompleted).toBe(true);
    expect(semiResult.updatedTournament.isChampion).toBe(false);
    expect(semiResult.updatedTournament.finalRank).toBe(3);

    // No final match generated for player
    const playerFinalMatch = semiResult.updatedTournament.matches.find(
      (m) => m.round === 2 && m.isPlayerMatch
    );
    expect(playerFinalMatch).toBeUndefined();
  });

  it('handles defeat in final: player does NOT receive champion rewards', () => {
    const tournament = createKidsCupTournament('Leo');
    const semiResult = recordKidsCupSemifinal(tournament, true); // Wins semi
    const finalResult = recordKidsCupFinal(semiResult.updatedTournament, false); // Loses final

    expect(finalResult.isChampion).toBe(false);
    expect(finalResult.updatedTournament.isCompleted).toBe(true);
    expect(finalResult.updatedTournament.finalRank).toBe(2);

    let profile = createInitialCareerProfile('Leo');
    let inventory = createInitialInventoryState();
    let gamification = { ...DEFAULT_GAMIFICATION_STATE, xp: 50 };

    const rewardResult = claimKidsCupChampionRewards(
      profile,
      inventory,
      gamification,
      finalResult.isChampion
    );

    expect(rewardResult.isNewReward).toBe(false);
    expect(rewardResult.deltaXp).toBe(0);
    expect(rewardResult.deltaCrowns).toBe(0);
    expect(rewardResult.updatedInventory.ownedItemIds).not.toContain('piece_kids_classic');
    expect(rewardResult.updatedProfile.trophies.length).toBe(0);
    expect(rewardResult.canStartCareer).toBe(true);
  });

  it('prevents double callback from duplicating XP, Coronas, trophy, or cosmetics', () => {
    let profile = createInitialCareerProfile('Leo');
    let inventory = createInitialInventoryState();
    let gamification = { ...DEFAULT_GAMIFICATION_STATE, xp: 100 };

    // 1st callback: claim rewards successfully
    const firstClaim = claimKidsCupChampionRewards(profile, inventory, gamification, true);
    expect(firstClaim.isNewReward).toBe(true);
    expect(firstClaim.deltaXp).toBe(250);
    expect(firstClaim.deltaCrowns).toBe(350);

    profile = firstClaim.updatedProfile;
    inventory = firstClaim.updatedInventory;
    gamification = firstClaim.updatedGamification;

    // 2nd callback: duplicate call with the updated state
    const duplicateClaim = claimKidsCupChampionRewards(profile, inventory, gamification, true);
    expect(duplicateClaim.isNewReward).toBe(false);
    expect(duplicateClaim.deltaXp).toBe(0);
    expect(duplicateClaim.deltaCrowns).toBe(0);

    // Assert that balances did not increment again
    expect(duplicateClaim.updatedInventory.coins).toBe(inventory.coins);
    expect(duplicateClaim.updatedGamification.xp).toBe(gamification.xp);
    expect(duplicateClaim.updatedProfile.trophies.length).toBe(1);
    expect(
      duplicateClaim.updatedInventory.ownedItemIds.filter((id) => id === 'piece_kids_classic')
    ).toHaveLength(1);
  });
});
