import type {
  CareerOpponent,
  CareerProfile,
  CareerRank,
  CareerTrophy,
  TournamentMatch,
  TournamentStanding,
} from './career-types';
import { getOpponentById } from './opponents';
import { getRankForRating } from './ranks';
import { calculateRatingDelta } from './rating-system';
import {
  generateTournamentForTier,
  getNextTierId,
  getTierDefinition,
  processRoundSimulations,
  sortStandings,
} from './tournaments';

export interface RecordMatchOutcomeResult {
  updatedProfile: CareerProfile;
  ratingDelta: number;
  newRating: number;
  oldRating: number;
  currentRank: CareerRank;
  rankChanged: boolean;
  tournamentCompleted: boolean;
  qualified: boolean;
  isChampion: boolean;
  playerStanding: TournamentStanding;
  playerRankPosition: number;
  isNewResult: boolean;
}

export function getCurrentPlayerMatch(profile: CareerProfile): TournamentMatch | null {
  const tournament = profile.currentTournament;
  if (tournament.isCompleted) return null;

  return (
    tournament.matches.find(
      (m) => m.round === tournament.currentRound && m.isPlayerMatch
    ) ?? null
  );
}

export function getCurrentOpponent(profile: CareerProfile): CareerOpponent | null {
  const match = getCurrentPlayerMatch(profile);
  if (!match) return null;

  const opponentId = match.whiteId === 'player' ? match.blackId : match.whiteId;
  return getOpponentById(opponentId) ?? null;
}

export function getPlayerColorForCurrentRound(profile: CareerProfile): 'w' | 'b' {
  const match = getCurrentPlayerMatch(profile);
  if (!match) return 'w';
  return match.whiteId === 'player' ? 'w' : 'b';
}

/**
 * Records the outcome of the player's match in the current tournament round,
 * calculates Elo delta, simulates other board results, updates standings,
 * tracks head-to-head rivalry, and checks qualification/trophies.
 */
export function recordCareerMatchResult(
  profile: CareerProfile,
  matchResult: 'win' | 'loss' | 'draw'
): RecordMatchOutcomeResult {
  const currentMatch = getCurrentPlayerMatch(profile);
  const currentOpponent = getCurrentOpponent(profile);

  if (!currentMatch || !currentOpponent) {
    throw new Error('No active player match found for current career tournament round.');
  }

  // Idempotency protection: if this match has already been recorded, do not double-process
  if (currentMatch.played) {
    const playerIndex = profile.currentTournament.standings.findIndex((s) => s.participantId === 'player');
    const finalPlayerStanding =
      profile.currentTournament.standings.find((s) => s.participantId === 'player') ??
      profile.currentTournament.standings[0];
    return {
      updatedProfile: profile,
      oldRating: profile.rating.currentRating,
      newRating: profile.rating.currentRating,
      ratingDelta: 0,
      rankChanged: false,
      currentRank: getRankForRating(profile.rating.currentRating),
      tournamentCompleted: profile.currentTournament.isCompleted,
      qualified: (profile.currentTournament.finalRank ?? 99) <= profile.currentTournament.qualifyingThresholdRank,
      isChampion: profile.currentTournament.isChampion ?? false,
      playerStanding: finalPlayerStanding,
      playerRankPosition: playerIndex >= 0 ? playerIndex + 1 : 1,
      isNewResult: false,
    };
  }

  const oldRating = profile.rating.currentRating;
  const oldRank = getRankForRating(oldRating);

  const numericResult = matchResult === 'win' ? 1 : matchResult === 'draw' ? 0.5 : 0;
  const eloResult = calculateRatingDelta(
    oldRating,
    currentOpponent.rating,
    numericResult,
    profile.rating.gamesPlayed
  );

  const newRating = eloResult.playerNewRating;
  const ratingDelta = eloResult.playerDelta;
  const newRank = getRankForRating(newRating);
  const rankChanged = oldRank.id !== newRank.id;

  // 1. Update rating stats
  const newWins = profile.rating.wins + (matchResult === 'win' ? 1 : 0);
  const newDraws = profile.rating.draws + (matchResult === 'draw' ? 1 : 0);
  const newLosses = profile.rating.losses + (matchResult === 'loss' ? 1 : 0);
  const newStreak = matchResult === 'win' ? profile.rating.currentStreak + 1 : 0;
  const bestStreak = Math.max(profile.rating.bestStreak, newStreak);

  const ratingHistoryEntry = {
    date: new Date().toISOString(),
    rating: newRating,
    delta: ratingDelta,
    opponentName: currentOpponent.name,
    opponentRating: currentOpponent.rating,
    result: matchResult,
  };

  // 2. Update Rivalry record
  const currentRivalry = profile.rivalries[currentOpponent.id] ?? {
    opponentId: currentOpponent.id,
    gamesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    lastPlayedAt: new Date().toISOString(),
  };

  const updatedRivalry = {
    ...currentRivalry,
    gamesPlayed: currentRivalry.gamesPlayed + 1,
    wins: currentRivalry.wins + (matchResult === 'win' ? 1 : 0),
    draws: currentRivalry.draws + (matchResult === 'draw' ? 1 : 0),
    losses: currentRivalry.losses + (matchResult === 'loss' ? 1 : 0),
    lastPlayedAt: new Date().toISOString(),
  };

  // 3. Update Tournament Match Record
  const isPlayerWhite = currentMatch.whiteId === 'player';
  const matchResultCode: '1-0' | '0-1' | '1/2-1/2' =
    matchResult === 'draw'
      ? '1/2-1/2'
      : (matchResult === 'win' && isPlayerWhite) || (matchResult === 'loss' && !isPlayerWhite)
      ? '1-0'
      : '0-1';

  const updatedMatches = profile.currentTournament.matches.map((m) => {
    if (m.id === currentMatch.id) {
      return {
        ...m,
        played: true,
        result: matchResultCode,
      };
    }
    return m;
  });

  // 4. Update Standings
  const updatedStandings = profile.currentTournament.standings.map((s) => {
    if (s.participantId === 'player') {
      return {
        ...s,
        rating: newRating,
        played: s.played + 1,
        points: s.points + numericResult,
        wins: s.wins + (matchResult === 'win' ? 1 : 0),
        draws: s.draws + (matchResult === 'draw' ? 1 : 0),
        losses: s.losses + (matchResult === 'loss' ? 1 : 0),
      };
    }
    if (s.participantId === currentOpponent.id) {
      const oppNumeric = matchResult === 'win' ? 0 : matchResult === 'draw' ? 0.5 : 1;
      return {
        ...s,
        played: s.played + 1,
        points: s.points + oppNumeric,
        wins: s.wins + (oppNumeric === 1 ? 1 : 0),
        draws: s.draws + (oppNumeric === 0.5 ? 1 : 0),
        losses: s.losses + (oppNumeric === 0 ? 1 : 0),
      };
    }
    return s;
  });

  let tournamentState = {
    ...profile.currentTournament,
    matches: updatedMatches,
    standings: sortStandings(updatedStandings),
  };

  // 5. Simulate AI vs AI matches in this round
  tournamentState = processRoundSimulations(tournamentState);

  // 6. Check round / tournament completion
  const isLastRound = tournamentState.currentRound >= tournamentState.totalRounds;
  let tournamentCompleted = false;
  let qualified = false;
  let isChampion = false;
  let finalRank = 1;

  if (isLastRound) {
    tournamentCompleted = true;
    tournamentState.isCompleted = true;

    // Calculate final rank of player
    const sorted = sortStandings(tournamentState.standings);
    const playerIndex = sorted.findIndex((s) => s.participantId === 'player');
    finalRank = playerIndex >= 0 ? playerIndex + 1 : sorted.length;
    tournamentState.finalRank = finalRank;

    isChampion = finalRank === 1;
    tournamentState.isChampion = isChampion;
    qualified = finalRank <= tournamentState.qualifyingThresholdRank;
  } else {
    // Advance to next round
    tournamentState.currentRound += 1;
  }

  // 7. Update trophies and unlocked tiers if tournament is completed and qualified
  const updatedTrophies = [...profile.trophies];
  const updatedUnlockedTiers = [...profile.unlockedTiers];

  if (tournamentCompleted) {
    const tierDef = getTierDefinition(profile.currentTierId);
    const trophy: CareerTrophy = {
      id: `trophy_${profile.currentTierId}_${Date.now()}`,
      tournamentName: tierDef.name,
      tierId: profile.currentTierId,
      placement: finalRank,
      date: new Date().toISOString(),
      icon: finalRank === 1 ? tierDef.trophyIcon : finalRank <= 3 ? '🥈' : '🎖️',
    };
    updatedTrophies.push(trophy);

    if (qualified) {
      const nextTier = getNextTierId(profile.currentTierId);
      if (nextTier && !updatedUnlockedTiers.includes(nextTier)) {
        updatedUnlockedTiers.push(nextTier);
      }
    }
  }

  const updatedProfile: CareerProfile = {
    ...profile,
    rating: {
      currentRating: newRating,
      peakRating: Math.max(profile.rating.peakRating, newRating),
      gamesPlayed: profile.rating.gamesPlayed + 1,
      wins: newWins,
      draws: newDraws,
      losses: newLosses,
      currentStreak: newStreak,
      bestStreak: bestStreak,
      history: [ratingHistoryEntry, ...profile.rating.history].slice(0, 100),
    },
    currentTournament: tournamentState,
    completedTournaments: tournamentCompleted
      ? [tournamentState, ...profile.completedTournaments]
      : profile.completedTournaments,
    rivalries: {
      ...profile.rivalries,
      [currentOpponent.id]: updatedRivalry,
    },
    unlockedTiers: updatedUnlockedTiers,
    trophies: updatedTrophies,
    updatedAt: new Date().toISOString(),
  };

  const finalPlayerStanding =
    tournamentState.standings.find((s) => s.participantId === 'player') ??
    tournamentState.standings[0];
  const sortedStandings = sortStandings(tournamentState.standings);
  const playerRankPos = sortedStandings.findIndex((s) => s.participantId === 'player') + 1;

  return {
    updatedProfile,
    ratingDelta,
    newRating,
    oldRating,
    currentRank: newRank,
    rankChanged,
    tournamentCompleted,
    qualified,
    isChampion,
    playerStanding: finalPlayerStanding,
    playerRankPosition: playerRankPos,
    isNewResult: true,
  };
}

/**
 * Advances the career to the next championship tier if unlocked.
 */
export function advanceToNextChampionship(profile: CareerProfile): CareerProfile {
  const nextTierId = getNextTierId(profile.currentTierId);
  if (!nextTierId) {
    // If at World Championship and won, re-initiate title defense
    return resetCurrentChampionship(profile);
  }

  const nextTournament = generateTournamentForTier(
    nextTierId,
    profile.playerName,
    profile.rating.currentRating
  );

  return {
    ...profile,
    currentTierId: nextTierId,
    currentTournament: nextTournament,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Restarts the current championship (e.g. if player didn't qualify or wants a rematch).
 */
export function resetCurrentChampionship(profile: CareerProfile): CareerProfile {
  const newTournament = generateTournamentForTier(
    profile.currentTierId,
    profile.playerName,
    profile.rating.currentRating
  );

  return {
    ...profile,
    currentTournament: newTournament,
    updatedAt: new Date().toISOString(),
  };
}
