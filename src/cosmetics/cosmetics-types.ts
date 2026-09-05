export const INVENTORY_STORAGE_KEY = '@ajedrezpro_inventory_v1';
export const PLAYER_CUSTOMIZATION_KEY = '@ajedrezpro_player_custom_v1';
export const COSMETICS_SCHEMA_VERSION = 1;

export type CosmeticCategory = 'boards' | 'pieces' | 'avatars' | 'frames' | 'effects';
export type CosmeticRarity = 'comun' | 'especial' | 'epico' | 'legendario' | 'campeon';

export interface CosmeticItem {
  readonly id: string;
  readonly name: string;
  readonly category: CosmeticCategory;
  readonly rarity: CosmeticRarity;
  readonly description: string;
  readonly icon: string;
  readonly previewAsset: string; // Board theme ID, piece set ID, emoji avatar, or frame style
  readonly priceCoins: number; // 0 for free/starter items
  readonly priceRealText?: string; // Optional indicator for future StoreKit/Play Billing
  readonly unlockLevel?: number;
  readonly isAchievementExclusive?: boolean;
  readonly achievementRequirement?: string | null;
}

export interface PlayerCustomization {
  name: string;
  avatarId: string;
  frameId: string;
  countryCode: string;
  favoriteColor: string;
  motto: string;
}

export interface CosmeticsInventoryState {
  readonly version: number;
  coins: number; // Coronas 👑
  ownedItemIds: string[];
  equippedBoardId: string;
  equippedPieceSetId: string;
  equippedAvatarId: string;
  equippedFrameId: string;
  claimedLevelRewards: number[];
  updatedAt: string;
}

export interface LevelRewardTrackItem {
  readonly level: number;
  readonly coinsReward: number;
  readonly itemRewardId: string | null;
  readonly description: string;
  readonly icon: string;
}
