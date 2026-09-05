import type {
  CareerProfile,
  CareerTournament,
  CareerTrophy,
  TournamentMatch,
  TournamentStanding,
} from './career-types';
import { sortStandings } from './tournaments';
import type { CosmeticsInventoryState } from '../cosmetics/cosmetics-types';
import type { GamificationState } from '../gamification/xp-types';

export const KIDS_CUP_TOURNAMENT_ID = 'torneo_copa_promesas_kids';
export const KIDS_CUP_REWARDS = {
  xp: 250,
  crowns: 350,
  cosmeticPieceId: 'piece_kids_classic',
  trophyId: 'trophy_kids_cup_promesas',
} as const;

export interface KidsCupState {
  tournament: CareerTournament;
  qualifiedForFinal: boolean;
  isChampion: boolean;
  isCompleted: boolean;
}

export function canUnlockKidsCup(schoolState: { graduatedFromSchool?: boolean }): boolean {
  return Boolean(schoolState?.graduatedFromSchool);
}

/**
 * Initializes the Kids Tournament (Copa Promesas) as a 4-player knockout (Semifinals -> Final).
 */
export function createKidsCupTournament(playerName: string = 'Kepa'): CareerTournament {
  const standings: TournamentStanding[] = [
    { participantId: 'player', name: playerName, avatar: '👦', rating: 500, points: 0, played: 0, wins: 0, draws: 0, losses: 0 },
    { participantId: 'mateo', name: 'Mateo (Táctico)', avatar: '🧒', rating: 480, points: 0, played: 0, wins: 0, draws: 0, losses: 0 },
    { participantId: 'lucia', name: 'Lucía (Posicional)', avatar: '👧', rating: 510, points: 0, played: 0, wins: 0, draws: 0, losses: 0 },
    { participantId: 'carlos', name: 'Carlos (Agresivo)', avatar: '👦', rating: 490, points: 0, played: 0, wins: 0, draws: 0, losses: 0 },
  ];

  const matches: TournamentMatch[] = [
    // Semifinal 1: Player vs Mateo
    {
      id: 'kids_semi_player',
      round: 1,
      whiteId: 'player',
      blackId: 'mateo',
      isPlayerMatch: true,
      played: false,
    },
    // Semifinal 2: Lucia vs Carlos (Simulated)
    {
      id: 'kids_semi_ai',
      round: 1,
      whiteId: 'lucia',
      blackId: 'carlos',
      isPlayerMatch: false,
      played: false,
    },
  ];

  return {
    id: KIDS_CUP_TOURNAMENT_ID,
    tierId: 'academia',
    name: 'Torneo Kids: Copa Promesas',
    subtitle: 'Semifinal y Gran Final para Graduados',
    format: 'eliminatoria',
    totalRounds: 2,
    qualifyingThresholdRank: 1,
    opponentIds: ['mateo', 'lucia', 'carlos'],
    currentRound: 1,
    standings: sortStandings(standings),
    matches,
    isCompleted: false,
  };
}

/**
 * Records player result in the Semifinal of Copa Promesas.
 * If player wins: advances to the Final round against the AI semifinal winner.
 * If player loses: player is eliminated, tournament completes without qualifying.
 */
export function recordKidsCupSemifinal(
  tournament: CareerTournament,
  playerWon: boolean
): {
  updatedTournament: CareerTournament;
  qualifiedForFinal: boolean;
  otherFinalistId: string;
} {
  const updatedMatches = tournament.matches.map((m) => {
    if (m.id === 'kids_semi_player') {
      return {
        ...m,
        played: true,
        result: (playerWon ? '1-0' : '0-1') as '1-0' | '0-1',
      };
    }
    if (m.id === 'kids_semi_ai') {
      // Lucia wins AI semifinal
      return {
        ...m,
        played: true,
        result: '1-0' as const,
      };
    }
    return m;
  });

  const otherFinalistId = 'lucia';

  if (!playerWon) {
    // Player lost semifinal -> eliminated
    return {
      updatedTournament: {
        ...tournament,
        matches: updatedMatches,
        currentRound: 1,
        isCompleted: true,
        isChampion: false,
        finalRank: 3, // Bronze/Semifinalist
      },
      qualifiedForFinal: false,
      otherFinalistId,
    };
  }

  // Player won semifinal -> Generate Final match
  const finalMatch: TournamentMatch = {
    id: 'kids_final_match',
    round: 2,
    whiteId: 'player',
    blackId: otherFinalistId,
    isPlayerMatch: true,
    played: false,
  };

  return {
    updatedTournament: {
      ...tournament,
      matches: [...updatedMatches, finalMatch],
      currentRound: 2,
      isCompleted: false,
      isChampion: false,
    },
    qualifiedForFinal: true,
    otherFinalistId,
  };
}

/**
 * Records player result in the Final of Copa Promesas.
 */
export function recordKidsCupFinal(
  tournament: CareerTournament,
  playerWon: boolean
): {
  updatedTournament: CareerTournament;
  isChampion: boolean;
} {
  const updatedMatches = tournament.matches.map((m) => {
    if (m.id === 'kids_final_match') {
      return {
        ...m,
        played: true,
        result: (playerWon ? '1-0' : '0-1') as '1-0' | '0-1',
      };
    }
    return m;
  });

  return {
    updatedTournament: {
      ...tournament,
      matches: updatedMatches,
      isCompleted: true,
      isChampion: playerWon,
      finalRank: playerWon ? 1 : 2,
    },
    isChampion: playerWon,
  };
}

export interface ClaimKidsRewardsResult {
  updatedProfile: CareerProfile;
  updatedInventory: CosmeticsInventoryState;
  updatedGamification: GamificationState;
  isNewReward: boolean;
  deltaXp: number;
  deltaCrowns: number;
  unlockedPieceId?: string;
  unlockedTrophy?: CareerTrophy;
  canStartCareer: boolean;
}

/**
 * Awards champion rewards with strict idempotency (does not duplicate on double callback).
 */
export function claimKidsCupChampionRewards(
  profile: CareerProfile,
  inventory: CosmeticsInventoryState,
  gamification: GamificationState,
  isChampion: boolean
): ClaimKidsRewardsResult {
  if (!isChampion) {
    return {
      updatedProfile: profile,
      updatedInventory: inventory,
      updatedGamification: gamification,
      isNewReward: false,
      deltaXp: 0,
      deltaCrowns: 0,
      canStartCareer: true,
    };
  }

  // Idempotency check: verify if trophy already granted
  const alreadyHasTrophy = profile.trophies.some((t) => t.id === KIDS_CUP_REWARDS.trophyId);
  const alreadyHasCosmetic = inventory.ownedItemIds.includes(KIDS_CUP_REWARDS.cosmeticPieceId);

  if (alreadyHasTrophy || alreadyHasCosmetic) {
    return {
      updatedProfile: profile,
      updatedInventory: inventory,
      updatedGamification: gamification,
      isNewReward: false,
      deltaXp: 0,
      deltaCrowns: 0,
      canStartCareer: true,
    };
  }

  const trophy: CareerTrophy = {
    id: KIDS_CUP_REWARDS.trophyId,
    tournamentName: 'Torneo Kids: Copa Promesas',
    tierId: 'academia',
    placement: 1,
    date: new Date().toISOString(),
    icon: '🎓🏆',
  };

  const updatedProfile: CareerProfile = {
    ...profile,
    trophies: [...profile.trophies, trophy],
  };

  const updatedInventory: CosmeticsInventoryState = {
    ...inventory,
    coins: inventory.coins + KIDS_CUP_REWARDS.crowns,
    ownedItemIds: [...inventory.ownedItemIds, KIDS_CUP_REWARDS.cosmeticPieceId],
    updatedAt: new Date().toISOString(),
  };

  const updatedGamification: GamificationState = {
    ...gamification,
    xp: gamification.xp + KIDS_CUP_REWARDS.xp,
  };

  return {
    updatedProfile,
    updatedInventory,
    updatedGamification,
    isNewReward: true,
    deltaXp: KIDS_CUP_REWARDS.xp,
    deltaCrowns: KIDS_CUP_REWARDS.crowns,
    unlockedPieceId: KIDS_CUP_REWARDS.cosmeticPieceId,
    unlockedTrophy: trophy,
    canStartCareer: true,
  };
}
