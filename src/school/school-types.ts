export const SCHOOL_STORAGE_KEY = '@ajedrezpro_school_v1';
export const SCHOOL_SCHEMA_VERSION = 1;

export type SchoolMode = 'classic' | 'kids';
export type PieceLessonId =
  | 'pawn'
  | 'rook'
  | 'bishop'
  | 'queen'
  | 'king'
  | 'knight'
  | 'check'
  | 'escape_check'
  | 'checkmate'
  | 'castling'
  | 'promotion'
  | 'first_game';
export type SchoolSquare = string;

export interface ExerciseTarget {
  readonly square: SchoolSquare;
  readonly icon?: string; // '⭐' | '🎯' | '💎' | '🏆'
}

export interface SchoolExercise {
  readonly id: string;
  readonly title: string;
  readonly instructions: string;
  readonly coachTip: string;
  readonly initialFen: string;
  readonly targetPieceSquare: SchoolSquare;
  readonly goalSquares: readonly SchoolSquare[]; // Squares with stars/targets to collect
  readonly targetCaptureSquares?: readonly SchoolSquare[];
  readonly optimalMoves: number;
  readonly maxAllowedMoves: number;
  readonly profeProPraise: string;
  readonly profeProCorrection: string;
}

export interface RealPieceComparison {
  readonly kidsName: string;
  readonly kidsEmoji: string;
  readonly classicName: string;
  readonly classicSymbol: string;
  readonly explanation: string;
}

export interface SchoolLesson {
  readonly id: PieceLessonId;
  readonly order: number;
  readonly pieceName: string;
  readonly pieceSymbol: string;
  readonly kidsName: string;
  readonly kidsIcon: string;
  readonly themeColor: string;
  readonly introTitle: string;
  readonly introStory: string;
  readonly movementRules: string;
  readonly demonstrationFen: string;
  readonly realPieceComparison: RealPieceComparison;
  readonly exercises: readonly SchoolExercise[];
  readonly rewardXp: number;
  readonly rewardCoins: number;
  readonly rewardItemId?: string;
}

export interface SchoolProgressState {
  readonly version: number;
  mode: SchoolMode;
  completedLessonIds: string[];
  lessonStars: Record<string, number>; // lessonId -> 1, 2, or 3 stars
  totalStars: number;
  unlockedLessonIds: string[];
  graduatedFromSchool: boolean;
  updatedAt: string;
}
