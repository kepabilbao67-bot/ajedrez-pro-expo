import type { CosmeticsInventoryState } from '../cosmetics/cosmetics-types';
import { buyCosmeticWithCoins } from '../cosmetics/cosmetics-service';

export type CityChampionshipId = 'bilbao' | 'madrid' | 'paris' | 'london';

export interface CityChampionshipConfig {
  readonly id: CityChampionshipId;
  readonly name: string;
  readonly rewardBoardId: string;
  readonly trophyIcon: string;
  readonly achievementRequirement: string;
}

export const CITY_CHAMPIONSHIPS: Record<CityChampionshipId, CityChampionshipConfig> = {
  bilbao: {
    id: 'bilbao',
    name: 'Bilbao Open',
    rewardBoardId: 'board_bilbao',
    trophyIcon: '🏛️',
    achievementRequirement: 'Gana el Bilbao Open en Modo Carrera',
  },
  madrid: {
    id: 'madrid',
    name: 'Madrid Masters',
    rewardBoardId: 'board_madrid',
    trophyIcon: '🏰',
    achievementRequirement: 'Gana el Madrid Masters en Modo Carrera',
  },
  paris: {
    id: 'paris',
    name: 'París Grand Prix',
    rewardBoardId: 'board_paris',
    trophyIcon: '🗼',
    achievementRequirement: 'Gana el París Grand Prix en Modo Carrera',
  },
  london: {
    id: 'london',
    name: 'London Chess Classic',
    rewardBoardId: 'board_london',
    trophyIcon: '💂',
    achievementRequirement: 'Gana el London Chess Classic en Modo Carrera',
  },
};

/**
 * Awards city championship board reward to cosmetics inventory when champion.
 * Guarantees idempotency (only added once, never duplicates).
 */
export function awardCityChampionshipReward(
  inventory: CosmeticsInventoryState,
  cityId: CityChampionshipId,
  isChampion: boolean
): { updatedInventory: CosmeticsInventoryState; isNewUnlock: boolean; rewardBoardId?: string } {
  if (!isChampion) {
    return { updatedInventory: inventory, isNewUnlock: false };
  }

  const config = CITY_CHAMPIONSHIPS[cityId];
  if (!config) {
    return { updatedInventory: inventory, isNewUnlock: false };
  }

  if (inventory.ownedItemIds.includes(config.rewardBoardId)) {
    return {
      updatedInventory: inventory,
      isNewUnlock: false,
      rewardBoardId: config.rewardBoardId,
    };
  }

  const updatedInventory: CosmeticsInventoryState = {
    ...inventory,
    ownedItemIds: [...inventory.ownedItemIds, config.rewardBoardId],
    updatedAt: new Date().toISOString(),
  };

  return {
    updatedInventory,
    isNewUnlock: true,
    rewardBoardId: config.rewardBoardId,
  };
}

/**
 * Verifies that the city board cannot be bought with coins because it is exclusive to achievements.
 */
export function attemptPurchaseCityBoardWithCoins(
  inventory: CosmeticsInventoryState,
  cityId: CityChampionshipId
) {
  const config = CITY_CHAMPIONSHIPS[cityId];
  return buyCosmeticWithCoins(inventory, config.rewardBoardId);
}
