import type { DifficultyLevel, PlayStyle } from '../ai/types';

export const CAREER_STORAGE_KEY = '@ajedrezpro_career_v1';
export const CAREER_SCHEMA_VERSION = 1;

export type CareerTierId =
  | 'academia'
  | 'club_local'
  | 'liga_local'
  | 'campeonato_regional'
  | 'campeonato_nacional'
  | 'circuito_internacional'
  | 'campeonato_continental'
  | 'copa_mundial'
  | 'torneo_candidatos'
  | 'campeonato_mundial';

export type OpponentPlayStyle =
  | 'agresivo'
  | 'posicional'
  | 'táctico'
  | 'defensivo'
  | 'aperturas'
  | 'finales'
  | 'impredecible';

export interface CareerOpponent {
  readonly id: string;
  readonly name: string;
  readonly avatar: string;
  readonly rating: number;
  readonly aiDifficulty: DifficultyLevel;
  readonly playStyle: PlayStyle;
  readonly styleDescription: OpponentPlayStyle;
  readonly title?: string;
  readonly preferredOpenings: readonly string[];
  readonly strength: string;
  readonly weakness: string;
  readonly bio: string;
  readonly quotes: {
    readonly preMatch: readonly string[];
    readonly victory: readonly string[];
    readonly defeat: readonly string[];
    readonly draw: readonly string[];
  };
}

export interface RivalryRecord {
  readonly opponentId: string;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  lastPlayedAt: string;
}

export interface CareerRank {
  readonly id: string;
  readonly name: string;
  readonly minRating: number;
  readonly maxRating: number;
  readonly badge: string;
  readonly isVirtualTitle?: boolean;
}

export type TournamentFormat = 'round_robin' | 'suizo' | 'eliminatoria' | 'match';

export interface TournamentStanding {
  readonly participantId: string; // 'player' or opponent.id
  readonly name: string;
  readonly avatar: string;
  readonly rating: number;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  tieBreakSonnenbornBerger?: number;
}

export interface TournamentMatch {
  readonly id: string;
  readonly round: number;
  readonly whiteId: string;
  readonly blackId: string;
  result?: '1-0' | '0-1' | '1/2-1/2';
  isPlayerMatch: boolean;
  played: boolean;
}

export interface CareerTournament {
  readonly id: string;
  readonly tierId: CareerTierId;
  readonly name: string;
  readonly subtitle: string;
  readonly format: TournamentFormat;
  readonly totalRounds: number;
  readonly qualifyingThresholdRank: number; // e.g. top 2 advance
  readonly opponentIds: readonly string[];
  currentRound: number;
  standings: TournamentStanding[];
  matches: TournamentMatch[];
  isCompleted: boolean;
  finalRank?: number;
  isChampion?: boolean;
}

export interface RatingHistoryEntry {
  readonly date: string;
  readonly rating: number;
  readonly delta: number;
  readonly opponentName: string;
  readonly opponentRating: number;
  readonly result: 'win' | 'loss' | 'draw';
}

export interface CareerRatingStats {
  currentRating: number;
  peakRating: number;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
  history: RatingHistoryEntry[];
}

export interface CareerTrophy {
  readonly id: string;
  readonly tournamentName: string;
  readonly tierId: CareerTierId;
  readonly placement: number;
  readonly date: string;
  readonly icon: string;
}

export interface CareerProfile {
  readonly version: number;
  playerName: string;
  rating: CareerRatingStats;
  currentTierId: CareerTierId;
  currentTournament: CareerTournament;
  completedTournaments: CareerTournament[];
  rivalries: Record<string, RivalryRecord>;
  unlockedTiers: CareerTierId[];
  trophies: CareerTrophy[];
  createdAt: string;
  updatedAt: string;
}
