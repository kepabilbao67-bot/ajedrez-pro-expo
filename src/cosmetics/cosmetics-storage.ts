import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  COSMETICS_SCHEMA_VERSION,
  INVENTORY_STORAGE_KEY,
  PLAYER_CUSTOMIZATION_KEY,
  type CosmeticsInventoryState,
  type PlayerCustomization,
} from './cosmetics-types';
import { DEFAULT_PLAYER_CUSTOMIZATION } from './cosmetics-catalog';

export const DEFAULT_INVENTORY_STATE: CosmeticsInventoryState = {
  version: COSMETICS_SCHEMA_VERSION,
  coins: 200, // Starting gift in Coronas 👑
  ownedItemIds: [
    'avatar_leo',
    'frame_default',
    'board_classic',
    'piece_staunton',
  ],
  equippedBoardId: 'board_classic',
  equippedPieceSetId: 'piece_staunton',
  equippedAvatarId: 'avatar_leo',
  equippedFrameId: 'frame_default',
  claimedLevelRewards: [],
  updatedAt: new Date().toISOString(),
};

export function createInitialInventoryState(): CosmeticsInventoryState {
  return {
    ...DEFAULT_INVENTORY_STATE,
    ownedItemIds: [...DEFAULT_INVENTORY_STATE.ownedItemIds],
    claimedLevelRewards: [],
    updatedAt: new Date().toISOString(),
  };
}

export function isValidInventoryState(data: unknown): data is CosmeticsInventoryState {
  if (!data || typeof data !== 'object') return false;
  const inv = data as Partial<CosmeticsInventoryState>;
  return (
    inv.version === COSMETICS_SCHEMA_VERSION &&
    typeof inv.coins === 'number' &&
    Array.isArray(inv.ownedItemIds) &&
    typeof inv.equippedBoardId === 'string' &&
    typeof inv.equippedPieceSetId === 'string' &&
    typeof inv.equippedAvatarId === 'string'
  );
}

export async function loadInventoryFromStorage(): Promise<CosmeticsInventoryState> {
  try {
    const raw = await AsyncStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) {
      const initial = createInitialInventoryState();
      await saveInventoryToStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (isValidInventoryState(parsed)) {
      return parsed;
    }
    const fallback = createInitialInventoryState();
    await saveInventoryToStorage(fallback);
    return fallback;
  } catch {
    return createInitialInventoryState();
  }
}

export async function saveInventoryToStorage(state: CosmeticsInventoryState): Promise<void> {
  try {
    const updated: CosmeticsInventoryState = {
      ...state,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving inventory state:', err);
  }
}

export async function loadPlayerCustomizationFromStorage(): Promise<PlayerCustomization> {
  try {
    const raw = await AsyncStorage.getItem(PLAYER_CUSTOMIZATION_KEY);
    if (!raw) return { ...DEFAULT_PLAYER_CUSTOMIZATION };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.name === 'string' && typeof parsed.avatarId === 'string') {
      return parsed;
    }
    return { ...DEFAULT_PLAYER_CUSTOMIZATION };
  } catch {
    return { ...DEFAULT_PLAYER_CUSTOMIZATION };
  }
}

export async function savePlayerCustomizationToStorage(custom: PlayerCustomization): Promise<void> {
  try {
    await AsyncStorage.setItem(PLAYER_CUSTOMIZATION_KEY, JSON.stringify(custom));
  } catch (err) {
    console.error('Error saving player customization:', err);
  }
}
