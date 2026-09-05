import { getCosmeticById } from './cosmetics-catalog';
import type { CosmeticCategory, CosmeticsInventoryState } from './cosmetics-types';
import { getUnclaimedLevelRewards } from './level-rewards';

export interface PurchaseResult {
  readonly success: boolean;
  readonly updatedInventory: CosmeticsInventoryState;
  readonly error?: string;
}

export interface ClaimRewardsResult {
  readonly updatedInventory: CosmeticsInventoryState;
  readonly coinsClaimed: number;
  readonly itemsUnlocked: string[];
}

/**
 * Purchases a cosmetic item with in-game coins (Coronas 👑).
 * Ensures no duplicate purchases, validates affordability, and never makes coins negative.
 */
export function buyCosmeticWithCoins(
  inventory: CosmeticsInventoryState,
  itemId: string
): PurchaseResult {
  const item = getCosmeticById(itemId);
  if (!item) {
    return {
      success: false,
      updatedInventory: inventory,
      error: 'El artículo no existe en el catálogo.',
    };
  }

  if (inventory.ownedItemIds.includes(itemId)) {
    return {
      success: false,
      updatedInventory: inventory,
      error: 'Ya posees este artículo en tu colección.',
    };
  }

  if (item.isAchievementExclusive) {
    return {
      success: false,
      updatedInventory: inventory,
      error: 'Este artículo es exclusivo y solo se desbloquea mediante logros.',
    };
  }

  if (inventory.coins < item.priceCoins) {
    return {
      success: false,
      updatedInventory: inventory,
      error: `No tienes suficientes Coronas. Necesitas ${item.priceCoins} 👑 y tienes ${inventory.coins} 👑.`,
    };
  }

  const updatedInventory: CosmeticsInventoryState = {
    ...inventory,
    coins: inventory.coins - item.priceCoins,
    ownedItemIds: [...inventory.ownedItemIds, itemId],
    updatedAt: new Date().toISOString(),
  };

  return {
    success: true,
    updatedInventory,
  };
}

/**
 * Equips a cosmetic item in the given category, provided the player owns it.
 */
export function equipCosmeticItem(
  inventory: CosmeticsInventoryState,
  category: CosmeticCategory,
  itemId: string
): CosmeticsInventoryState {
  if (!inventory.ownedItemIds.includes(itemId)) {
    throw new Error(`No puedes equipar un artículo que no posees (${itemId}).`);
  }

  const updated: CosmeticsInventoryState = {
    ...inventory,
    updatedAt: new Date().toISOString(),
  };

  switch (category) {
    case 'boards':
      updated.equippedBoardId = itemId;
      break;
    case 'pieces':
      updated.equippedPieceSetId = itemId;
      break;
    case 'avatars':
      updated.equippedAvatarId = itemId;
      break;
    case 'frames':
      updated.equippedFrameId = itemId;
      break;
  }

  return updated;
}

/**
 * Processes level progression rewards and adds coins/items safely.
 */
export function processLevelRewards(
  inventory: CosmeticsInventoryState,
  currentLevel: number
): ClaimRewardsResult {
  const unclaimed = getUnclaimedLevelRewards(currentLevel, inventory.claimedLevelRewards);
  if (unclaimed.length === 0) {
    return {
      updatedInventory: inventory,
      coinsClaimed: 0,
      itemsUnlocked: [],
    };
  }

  let totalCoins = 0;
  const newItems: string[] = [];
  const newlyClaimedLevels: number[] = [...inventory.claimedLevelRewards];

  for (const reward of unclaimed) {
    totalCoins += reward.coinsReward;
    newlyClaimedLevels.push(reward.level);

    if (reward.itemRewardId && !inventory.ownedItemIds.includes(reward.itemRewardId)) {
      newItems.push(reward.itemRewardId);
    }
  }

  const updatedInventory: CosmeticsInventoryState = {
    ...inventory,
    coins: inventory.coins + totalCoins,
    ownedItemIds: [...inventory.ownedItemIds, ...newItems],
    claimedLevelRewards: newlyClaimedLevels,
    updatedAt: new Date().toISOString(),
  };

  return {
    updatedInventory,
    coinsClaimed: totalCoins,
    itemsUnlocked: newItems,
  };
}

/**
 * Adds coins (Coronas) to player inventory (e.g. for wins, tournament rounds, achievements).
 */
export function awardCoinsToInventory(
  inventory: CosmeticsInventoryState,
  amount: number
): CosmeticsInventoryState {
  if (amount <= 0) return inventory;
  return {
    ...inventory,
    coins: inventory.coins + Math.round(amount),
    updatedAt: new Date().toISOString(),
  };
}
