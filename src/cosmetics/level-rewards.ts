import type { LevelRewardTrackItem } from './cosmetics-types';

export const LEVEL_REWARD_TRACK: readonly LevelRewardTrackItem[] = [
  {
    level: 1,
    coinsReward: 100,
    itemRewardId: null,
    description: 'Bono de bienvenida a AjedrezPro',
    icon: '🌱',
  },
  {
    level: 2,
    coinsReward: 150,
    itemRewardId: 'board_walnut',
    description: 'Tablero Nogal Clásico + 150 Coronas',
    icon: '🪵',
  },
  {
    level: 3,
    coinsReward: 200,
    itemRewardId: 'frame_bronze',
    description: 'Marco Bronce de Club + 200 Coronas',
    icon: '🥉',
  },
  {
    level: 4,
    coinsReward: 250,
    itemRewardId: 'avatar_maya',
    description: 'Personaje Maya + 250 Coronas',
    icon: '👩‍🎤',
  },
  {
    level: 5,
    coinsReward: 300,
    itemRewardId: 'piece_modern',
    description: 'Piezas Modernas Neón + 300 Coronas',
    icon: '♟️',
  },
  {
    level: 7,
    coinsReward: 350,
    itemRewardId: 'avatar_akira',
    description: 'Personaje Akira + 350 Coronas',
    icon: '🥋',
  },
  {
    level: 10,
    coinsReward: 500,
    itemRewardId: 'frame_silver',
    description: 'Marco Plata Regional + 500 Coronas',
    icon: '🥈',
  },
  {
    level: 15,
    coinsReward: 650,
    itemRewardId: 'board_marble',
    description: 'Tablero Mármol Imperial + 650 Coronas',
    icon: '🏛️',
  },
  {
    level: 20,
    coinsReward: 800,
    itemRewardId: 'piece_realistic_3d',
    description: 'Piezas 3D Esculpidas + 800 Coronas',
    icon: '🗿',
  },
  {
    level: 30,
    coinsReward: 1200,
    itemRewardId: 'frame_gold',
    description: 'Marco Oro Nacional + 1200 Coronas',
    icon: '🥇',
  },
  {
    level: 50,
    coinsReward: 2500,
    itemRewardId: 'avatar_sofia',
    description: 'Set Gran Maestro + 2500 Coronas',
    icon: '👑',
  },
] as const;

export function getUnclaimedLevelRewards(
  currentLevel: number,
  claimedLevels: readonly number[]
): LevelRewardTrackItem[] {
  return LEVEL_REWARD_TRACK.filter(
    (reward) => reward.level <= currentLevel && !claimedLevels.includes(reward.level)
  );
}
