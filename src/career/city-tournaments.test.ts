import { describe, expect, it } from 'vitest';
import {
  awardCityChampionshipReward,
  attemptPurchaseCityBoardWithCoins,
  CITY_CHAMPIONSHIPS,
  type CityChampionshipId,
} from './city-tournaments';
import { createInitialInventoryState } from '../cosmetics/cosmetics-storage';

describe('City Championships Rewards Integration (Bilbao, Madrid, París, Londres)', () => {
  const cities: CityChampionshipId[] = ['bilbao', 'madrid', 'paris', 'london'];

  cities.forEach((cityId) => {
    const config = CITY_CHAMPIONSHIPS[cityId];

    describe(`City: ${config.name} (${cityId})`, () => {
      it('ganar -> desbloquea tablero correcto en inventario', () => {
        const inventory = createInitialInventoryState();
        expect(inventory.ownedItemIds).not.toContain(config.rewardBoardId);

        const outcome = awardCityChampionshipReward(inventory, cityId, true);
        expect(outcome.isNewUnlock).toBe(true);
        expect(outcome.rewardBoardId).toBe(config.rewardBoardId);
        expect(outcome.updatedInventory.ownedItemIds).toContain(config.rewardBoardId);
      });

      it('aparece owned una sola vez (idempotente ante múltiples llamadas)', () => {
        let inventory = createInitialInventoryState();

        // 1st win
        const res1 = awardCityChampionshipReward(inventory, cityId, true);
        inventory = res1.updatedInventory;

        // 2nd call (duplicate tournament finish callback)
        const res2 = awardCityChampionshipReward(inventory, cityId, true);

        // Board must exist exactly once in ownedItemIds
        const occurrences = res2.updatedInventory.ownedItemIds.filter(
          (id) => id === config.rewardBoardId
        );
        expect(occurrences).toHaveLength(1);
        expect(res2.isNewUnlock).toBe(false);
      });

      it('no puede comprarse con Coronas si es achievementExclusive', () => {
        const inventory = createInitialInventoryState();
        inventory.coins = 99999; // Abundant coins

        const purchaseResult = attemptPurchaseCityBoardWithCoins(inventory, cityId);
        expect(purchaseResult.success).toBe(false);
        expect(purchaseResult.error).toContain('exclusivo');
        expect(purchaseResult.updatedInventory.ownedItemIds).not.toContain(config.rewardBoardId);
      });

      it('no desbloquea tablero si el jugador no fue campeón', () => {
        const inventory = createInitialInventoryState();
        const outcome = awardCityChampionshipReward(inventory, cityId, false);

        expect(outcome.isNewUnlock).toBe(false);
        expect(outcome.updatedInventory.ownedItemIds).not.toContain(config.rewardBoardId);
      });
    });
  });
});
