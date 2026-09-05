import { useCallback, useEffect, useState } from 'react';
import {
  buyCosmeticWithCoins,
  equipCosmeticItem,
  processLevelRewards,
  awardCoinsToInventory,
  type PurchaseResult,
} from '../cosmetics/cosmetics-service';
import {
  createInitialInventoryState,
  loadInventoryFromStorage,
  loadPlayerCustomizationFromStorage,
  saveInventoryToStorage,
  savePlayerCustomizationToStorage,
} from '../cosmetics/cosmetics-storage';
import type {
  CosmeticCategory,
  CosmeticsInventoryState,
  PlayerCustomization,
} from '../cosmetics/cosmetics-types';
import {
  COSMETIC_ITEMS,
  DEFAULT_PLAYER_CUSTOMIZATION,
  getCosmeticById,
  getCosmeticsByCategory,
} from '../cosmetics/cosmetics-catalog';
import { useVisualPreferences } from './use-visual-preferences';
import type { BoardThemeId } from '../board-themes/board-themes';
import type { PieceSetId } from '../board-themes/piece-sets';

export function useCosmetics(playerLevel: number = 1) {
  const [inventory, setInventory] = useState<CosmeticsInventoryState>(createInitialInventoryState);
  const [customization, setCustomization] = useState<PlayerCustomization>(DEFAULT_PLAYER_CUSTOMIZATION);
  const [loading, setLoading] = useState(true);
  const { updateVisualPreferences } = useVisualPreferences();

  // Load from storage
  useEffect(() => {
    let isMounted = true;
    Promise.all([loadInventoryFromStorage(), loadPlayerCustomizationFromStorage()]).then(
      ([loadedInv, loadedCust]) => {
        if (isMounted) {
          // Check if any level rewards are unclaimed
          const rewardOutcome = processLevelRewards(loadedInv, playerLevel);
          setInventory(rewardOutcome.updatedInventory);
          setCustomization(loadedCust);
          setLoading(false);

          if (rewardOutcome.coinsClaimed > 0 || rewardOutcome.itemsUnlocked.length > 0) {
            void saveInventoryToStorage(rewardOutcome.updatedInventory);
          }
        }
      }
    );
    return () => {
      isMounted = false;
    };
  }, [playerLevel]);

  const saveInventory = useCallback(async (newInv: CosmeticsInventoryState) => {
    setInventory(newInv);
    await saveInventoryToStorage(newInv);
  }, []);

  const saveCustomization = useCallback(async (newCust: PlayerCustomization) => {
    setCustomization(newCust);
    await savePlayerCustomizationToStorage(newCust);
  }, []);

  const buyItem = useCallback(
    async (itemId: string): Promise<PurchaseResult> => {
      const result = buyCosmeticWithCoins(inventory, itemId);
      if (result.success) {
        await saveInventory(result.updatedInventory);
      }
      return result;
    },
    [inventory, saveInventory]
  );

  const equipItem = useCallback(
    async (category: CosmeticCategory, itemId: string) => {
      const updated = equipCosmeticItem(inventory, category, itemId);
      await saveInventory(updated);

      const item = getCosmeticById(itemId);
      if (item) {
        if (category === 'boards') {
          updateVisualPreferences({ boardTheme: item.previewAsset as BoardThemeId });
        } else if (category === 'pieces') {
          updateVisualPreferences({ pieceSet: item.previewAsset as PieceSetId });
        } else if (category === 'avatars') {
          const updatedCust = { ...customization, avatarId: itemId };
          await saveCustomization(updatedCust);
        } else if (category === 'frames') {
          const updatedCust = { ...customization, frameId: itemId };
          await saveCustomization(updatedCust);
        }
      }
    },
    [inventory, customization, saveInventory, saveCustomization, updateVisualPreferences]
  );

  const addCoins = useCallback(
    async (amount: number) => {
      const updated = awardCoinsToInventory(inventory, amount);
      await saveInventory(updated);
    },
    [inventory, saveInventory]
  );

  const updateProfileCustomization = useCallback(
    async (changes: Partial<PlayerCustomization>) => {
      const updated: PlayerCustomization = {
        ...customization,
        ...changes,
      };
      await saveCustomization(updated);
    },
    [customization, saveCustomization]
  );

  const isItemOwned = useCallback(
    (itemId: string) => inventory.ownedItemIds.includes(itemId),
    [inventory.ownedItemIds]
  );

  const isItemEquipped = useCallback(
    (category: CosmeticCategory, itemId: string) => {
      switch (category) {
        case 'boards':
          return inventory.equippedBoardId === itemId;
        case 'pieces':
          return inventory.equippedPieceSetId === itemId;
        case 'avatars':
          return inventory.equippedAvatarId === itemId || customization.avatarId === itemId;
        case 'frames':
          return inventory.equippedFrameId === itemId || customization.frameId === itemId;
        default:
          return false;
      }
    },
    [inventory, customization]
  );

  return {
    inventory,
    customization,
    loading,
    catalog: COSMETIC_ITEMS,
    getCosmeticsByCategory,
    buyItem,
    equipItem,
    addCoins,
    updateProfileCustomization,
    isItemOwned,
    isItemEquipped,
  };
}
