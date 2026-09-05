import type {
  CareerTierId,
  CareerTournament,
  TournamentFormat,
  TournamentMatch,
  TournamentStanding,
} from './career-types';
import { getOpponentById, getOpponentsForTier } from './opponents';

export interface TierDefinition {
  readonly id: CareerTierId;
  readonly name: string;
  readonly subtitle: string;
  readonly format: TournamentFormat;
  readonly minRatingRecommended: number;
  readonly totalRounds: number;
  readonly qualifyingThresholdRank: number; // e.g. top 2 advance to next championship
  readonly opponentIds: readonly string[];
  readonly description: string;
  readonly trophyIcon: string;
}

export const CAREER_TIERS: readonly TierDefinition[] = [
  {
    id: 'academia',
    name: 'Torneo de Promesas de la Academia',
    subtitle: 'Nivel 0 — Tu debut competitivo',
    format: 'round_robin',
    minRatingRecommended: 400,
    totalRounds: 4,
    qualifyingThresholdRank: 2,
    opponentIds: ['mateo', 'lucia', 'carlos'],
    description: 'Comienza tu andadura competitiva contra los talentos jóvenes y veteranos del club.',
    trophyIcon: '🥉',
  },
  {
    id: 'club_local',
    name: 'Campeonato de Club Local',
    subtitle: 'Nivel 1 — El honor del club',
    format: 'round_robin',
    minRatingRecommended: 800,
    totalRounds: 4,
    qualifyingThresholdRank: 2,
    opponentIds: ['mateo', 'lucia', 'carlos', 'marta'],
    description: 'Enfréntate a los miembros titulares para coronarte mejor jugador del club.',
    trophyIcon: '🏆',
  },
  {
    id: 'liga_local',
    name: 'Liga Abierta Interclubes',
    subtitle: 'Nivel 2 — Competición local',
    format: 'round_robin',
    minRatingRecommended: 1100,
    totalRounds: 4,
    qualifyingThresholdRank: 2,
    opponentIds: ['lucia', 'carlos', 'marta', 'sofia'],
    description: 'Los mejores representantes de los clubes locales se miden por el ascenso.',
    trophyIcon: '🎖️',
  },
  {
    id: 'campeonato_regional',
    name: 'Gran Campeonato Regional',
    subtitle: 'Nivel 3 — Rumbo a la élite',
    format: 'round_robin',
    minRatingRecommended: 1400,
    totalRounds: 5,
    qualifyingThresholdRank: 2,
    opponentIds: ['carlos', 'marta', 'sofia', 'viktor', 'diego_vega'],
    description: 'El torneo oficial de la región donde emergen los futuros maestros.',
    trophyIcon: '🥈',
  },
  {
    id: 'campeonato_nacional',
    name: 'Campeonato Nacional Absoluto',
    subtitle: 'Nivel 4 — La cumbre del país',
    format: 'round_robin',
    minRatingRecommended: 1700,
    totalRounds: 5,
    qualifyingThresholdRank: 2,
    opponentIds: ['marta', 'sofia', 'viktor', 'diego_vega', 'helena_rostova'],
    description: 'Lucha contra la Maestra Helena Rostova y los mejores clasificados de la nación.',
    trophyIcon: '🥇',
  },
  {
    id: 'circuito_internacional',
    name: 'Circuito Abierto Internacional',
    subtitle: 'Nivel 5 — Pasaporte al mundo',
    format: 'round_robin',
    minRatingRecommended: 1900,
    totalRounds: 4,
    qualifyingThresholdRank: 1,
    opponentIds: ['sofia', 'viktor', 'diego_vega', 'helena_rostova'],
    description: 'Gira internacional contra maestros en busca de normas y puntos de élite.',
    trophyIcon: '🌍',
  },
  {
    id: 'campeonato_continental',
    name: 'Campeonato Continental de Maestros',
    subtitle: 'Nivel 6 — Selección continental',
    format: 'round_robin',
    minRatingRecommended: 2100,
    totalRounds: 4,
    qualifyingThresholdRank: 1,
    opponentIds: ['viktor', 'diego_vega', 'helena_rostova', 'alexei_volkov'],
    description: 'Sólo los campeones de cada país tienen plaza en este prestigioso torneo.',
    trophyIcon: '🛡️',
  },
  {
    id: 'copa_mundial',
    name: 'Copa Mundial AjedrezPro',
    subtitle: 'Nivel 7 — Torneo de eliminación y maestría',
    format: 'round_robin',
    minRatingRecommended: 2200,
    totalRounds: 4,
    qualifyingThresholdRank: 1,
    opponentIds: ['diego_vega', 'helena_rostova', 'alexei_volkov', 'viktor'],
    description: 'El torneo más prestigioso del calendario global. Concede plaza directa a Candidatos.',
    trophyIcon: '🏅',
  },
  {
    id: 'torneo_candidatos',
    name: 'Torneo de Candidatos Virtual',
    subtitle: 'Nivel 8 — La antesala del trono',
    format: 'round_robin',
    minRatingRecommended: 2350,
    totalRounds: 4,
    qualifyingThresholdRank: 1,
    opponentIds: ['sofia', 'viktor', 'diego_vega', 'helena_rostova'],
    description: 'El vencedor se gana el derecho absoluto de retar al Campeón del Mundo en un match individual.',
    trophyIcon: '👑',
  },
  {
    id: 'campeonato_mundial',
    name: 'Match por el Campeonato del Mundo AjedrezPro',
    subtitle: 'Nivel 9 — El título supremo',
    format: 'match',
    minRatingRecommended: 2500,
    totalRounds: 6,
    qualifyingThresholdRank: 1,
    opponentIds: ['alexei_volkov'],
    description: 'Match de 6 partidas históricas contra el Gran Maestro Alexei Volkov. El ganador es el Campeón del Mundo.',
    trophyIcon: '🏆',
  },
] as const;

export function getTierDefinition(tierId: CareerTierId): TierDefinition {
  const found = CAREER_TIERS.find((t) => t.id === tierId);
  return found ?? CAREER_TIERS[0];
}

export function getNextTierId(currentTierId: CareerTierId): CareerTierId | null {
  const index = CAREER_TIERS.findIndex((t) => t.id === currentTierId);
  if (index >= 0 && index < CAREER_TIERS.length - 1) {
    return CAREER_TIERS[index + 1].id;
  }
  return null;
}

/**
 * Generates initial tournament structure (standings table & schedule) for a given tier.
 */
export function generateTournamentForTier(
  tierId: CareerTierId,
  playerName: string = 'Kepa',
  playerRating: number = 800
): CareerTournament {
  const tierDef = getTierDefinition(tierId);
  const opponents = getOpponentsForTier(tierDef.opponentIds);

  // Initialize standings with 0 points
  const initialStandings: TournamentStanding[] = [
    {
      participantId: 'player',
      name: playerName,
      avatar: '👤',
      rating: playerRating,
      points: 0,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
    },
    ...opponents.map((opp) => ({
      participantId: opp.id,
      name: opp.name,
      avatar: opp.avatar,
      rating: opp.rating,
      points: 0,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
    })),
  ];

  const matches: TournamentMatch[] = [];

  if (tierDef.format === 'match') {
    // World Championship Match against Alexei Volkov
    const opponent = opponents[0];
    for (let r = 1; r <= tierDef.totalRounds; r++) {
      const isPlayerWhite = r % 2 === 1;
      matches.push({
        id: `m_wc_r${r}`,
        round: r,
        whiteId: isPlayerWhite ? 'player' : opponent.id,
        blackId: isPlayerWhite ? opponent.id : 'player',
        isPlayerMatch: true,
        played: false,
      });
    }
  } else {
    // Round Robin generation
    let matchCounter = 1;

    // Build round robin pairings
    for (let r = 1; r <= tierDef.totalRounds; r++) {
      const playerOpponentId = opponents[(r - 1) % opponents.length].id;
      const isPlayerWhite = r % 2 === 1;

      // Player match
      matches.push({
        id: `match_${tierId}_r${r}_player`,
        round: r,
        whiteId: isPlayerWhite ? 'player' : playerOpponentId,
        blackId: isPlayerWhite ? playerOpponentId : 'player',
        isPlayerMatch: true,
        played: false,
      });

      // Pair other opponents for this round if any
      const remainingOpponents = opponents.filter((o) => o.id !== playerOpponentId);
      for (let i = 0; i < remainingOpponents.length - 1; i += 2) {
        const white = remainingOpponents[i].id;
        const black = remainingOpponents[i + 1].id;
        matches.push({
          id: `match_${tierId}_r${r}_sim_${matchCounter++}`,
          round: r,
          whiteId: white,
          blackId: black,
          isPlayerMatch: false,
          played: false,
        });
      }
    }
  }

  return {
    id: `tour_${tierId}_${Date.now()}`,
    tierId,
    name: tierDef.name,
    subtitle: tierDef.subtitle,
    format: tierDef.format,
    totalRounds: tierDef.totalRounds,
    qualifyingThresholdRank: tierDef.qualifyingThresholdRank,
    opponentIds: tierDef.opponentIds,
    currentRound: 1,
    standings: sortStandings(initialStandings),
    matches,
    isCompleted: false,
  };
}

/**
 * Sort standings primarily by points desc, then by wins desc, then by rating desc
 */
export function sortStandings(standings: TournamentStanding[]): TournamentStanding[] {
  return [...standings].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    return b.rating - a.rating;
  });
}

/**
 * Simulates a realistic chess match between two AI bots based on rating differential.
 */
export function simulateAiVsAiMatch(whiteRating: number, blackRating: number): '1-0' | '0-1' | '1/2-1/2' {
  const ratingDiff = whiteRating - blackRating + 35; // +35 for white advantage
  const whiteWinProb = 1 / (1 + Math.pow(10, -ratingDiff / 400));
  const drawProb = 0.32; // ~32% draw tendency in chess

  const rand = Math.random();
  if (rand < drawProb) {
    return '1/2-1/2';
  }
  const remainingProb = rand - drawProb;
  const normalizedProb = remainingProb / (1 - drawProb);
  return normalizedProb < whiteWinProb ? '1-0' : '0-1';
}

/**
 * Processes all simulated matches for the current round and updates standings accordingly.
 */
export function processRoundSimulations(tournament: CareerTournament): CareerTournament {
  const updatedTournament = { ...tournament };
  const currentRoundMatches = updatedTournament.matches.filter(
    (m) => m.round === updatedTournament.currentRound && !m.isPlayerMatch && !m.played
  );

  const standingsMap = new Map<string, TournamentStanding>(
    updatedTournament.standings.map((s) => [s.participantId, { ...s }])
  );

  for (const match of currentRoundMatches) {
    const whiteOpp = getOpponentById(match.whiteId);
    const blackOpp = getOpponentById(match.blackId);
    const whiteRating = whiteOpp?.rating ?? 1200;
    const blackRating = blackOpp?.rating ?? 1200;

    const result = simulateAiVsAiMatch(whiteRating, blackRating);
    match.result = result;
    match.played = true;

    const whiteStanding = standingsMap.get(match.whiteId);
    const blackStanding = standingsMap.get(match.blackId);

    if (whiteStanding && blackStanding) {
      whiteStanding.played += 1;
      blackStanding.played += 1;

      if (result === '1-0') {
        whiteStanding.points += 1;
        whiteStanding.wins += 1;
        blackStanding.losses += 1;
      } else if (result === '0-1') {
        blackStanding.points += 1;
        blackStanding.wins += 1;
        whiteStanding.losses += 1;
      } else {
        whiteStanding.points += 0.5;
        blackStanding.points += 0.5;
        whiteStanding.draws += 1;
        blackStanding.draws += 1;
      }
    }
  }

  updatedTournament.standings = sortStandings(Array.from(standingsMap.values()));
  return updatedTournament;
}
