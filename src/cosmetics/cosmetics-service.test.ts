import { describe, expect, it } from 'vitest';
import { createInitialInventoryState } from './cosmetics-storage';
import {
  awardCoinsToInventory,
  buyCosmeticWithCoins,
  equipCosmeticItem,
  processLevelRewards,
} from './cosmetics-service';
import { getCosmeticsByCategory } from './cosmetics-catalog';

describe('Cosmetics and Shop System', () => {
  it('creates initial inventory with 200 starting Coronas and default starter items', () => {
    const inv = createInitialInventoryState();
    expect(inv.coins).toBe(200);
    expect(inv.ownedItemIds).toContain('board_classic');
    expect(inv.ownedItemIds).toContain('piece_staunton');
    expect(inv.ownedItemIds).toContain('avatar_leo');
    expect(inv.ownedItemIds).toContain('frame_default');
  });

  it('rejects purchases when player has insufficient Coronas', () => {
    const inv = createInitialInventoryState(); // 200 coins
    const result = buyCosmeticWithCoins(inv, 'board_dark_neon'); // 1100 coins
    expect(result.success).toBe(false);
    expect(result.error).toContain('No tienes suficientes Coronas');
    expect(result.updatedInventory.coins).toBe(200);
  });

  it('allows purchase when player has enough Coronas and deducts balance properly', () => {
    let inv = createInitialInventoryState();
    inv = awardCoinsToInventory(inv, 500); // 700 coins
    const result = buyCosmeticWithCoins(inv, 'board_walnut'); // 350 coins

    expect(result.success).toBe(true);
    expect(result.updatedInventory.coins).toBe(350);
    expect(result.updatedInventory.ownedItemIds).toContain('board_walnut');
  });

  it('prevents purchasing an item already owned', () => {
    const inv = createInitialInventoryState();
    const result = buyCosmeticWithCoins(inv, 'board_classic'); // Already owned
    expect(result.success).toBe(false);
    expect(result.error).toContain('Ya posees este artículo');
  });

  it('equips owned item and rejects unowned items', () => {
    let inv = createInitialInventoryState();
    inv = { ...inv, ownedItemIds: [...inv.ownedItemIds, 'board_walnut'] };

    const equipped = equipCosmeticItem(inv, 'boards', 'board_walnut');
    expect(equipped.equippedBoardId).toBe('board_walnut');

    expect(() => equipCosmeticItem(inv, 'boards', 'board_dark_neon')).toThrow();
  });

  it('processes level progression rewards without duplicating items or levels', () => {
    const inv = createInitialInventoryState();
    const result = processLevelRewards(inv, 3); // Levels 1, 2, 3

    expect(result.coinsClaimed).toBe(450); // 100 + 150 + 200
    expect(result.itemsUnlocked).toContain('board_walnut');
    expect(result.itemsUnlocked).toContain('frame_bronze');
    expect(result.updatedInventory.coins).toBe(650); // 200 + 450
    expect(result.updatedInventory.claimedLevelRewards).toEqual([1, 2, 3]);

    // Subsequent call for same level yields 0
    const repeat = processLevelRewards(result.updatedInventory, 3);
    expect(repeat.coinsClaimed).toBe(0);
    expect(repeat.itemsUnlocked.length).toBe(0);
  });

  it('contains expected categories in catalog', () => {
    const boards = getCosmeticsByCategory('boards');
    const pieces = getCosmeticsByCategory('pieces');
    const avatars = getCosmeticsByCategory('avatars');
    const frames = getCosmeticsByCategory('frames');

    expect(boards.length).toBeGreaterThanOrEqual(6);
    expect(pieces.length).toBeGreaterThanOrEqual(4);
    expect(avatars.length).toBeGreaterThanOrEqual(6);
    expect(frames.length).toBeGreaterThanOrEqual(5);
  });
});
