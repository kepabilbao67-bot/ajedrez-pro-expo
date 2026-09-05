import { COSMETIC_CATALOG, WORLD_TOUR, rankForXp, type CatalogItem } from './experience-catalog';

export const EXPERIENCE_SCHEMA_VERSION = 1 as const;

export interface ExperienceState {
  readonly version: typeof EXPERIENCE_SCHEMA_VERSION;
  readonly coins: number;
  readonly ownedItemIds: readonly string[];
  readonly equippedBoardId: string;
  readonly equippedPieceSetId: string;
  readonly equippedClockId: string;
  readonly completedTournamentIds: readonly string[];
  readonly completedLessonIds: readonly string[];
  readonly kidsModeEnabled: boolean;
  readonly lastDailyRewardDate: string | null;
}

export const DEFAULT_EXPERIENCE_STATE: ExperienceState = {
  version: EXPERIENCE_SCHEMA_VERSION,
  coins: 0,
  ownedItemIds: ['board-classic', 'pieces-staunton', 'clock-digital'],
  equippedBoardId: 'board-classic',
  equippedPieceSetId: 'pieces-staunton',
  equippedClockId: 'clock-digital',
  completedTournamentIds: [],
  completedLessonIds: [],
  kidsModeEnabled: false,
  lastDailyRewardDate: null,
};

const unique = (values: readonly string[]) => [...new Set(values)];
const nonNegative = (value: number) => Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));

export function createDefaultExperienceState(): ExperienceState {
  return { ...DEFAULT_EXPERIENCE_STATE, ownedItemIds: [...DEFAULT_EXPERIENCE_STATE.ownedItemIds] };
}

export function isExperienceState(value: unknown): value is ExperienceState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Partial<ExperienceState>;
  return (
    state.version === EXPERIENCE_SCHEMA_VERSION &&
    typeof state.coins === 'number' && Number.isFinite(state.coins) && state.coins >= 0 &&
    Array.isArray(state.ownedItemIds) && state.ownedItemIds.every((id) => typeof id === 'string') &&
    typeof state.equippedBoardId === 'string' &&
    typeof state.equippedPieceSetId === 'string' &&
    typeof state.equippedClockId === 'string' &&
    Array.isArray(state.completedTournamentIds) && state.completedTournamentIds.every((id) => typeof id === 'string') &&
    Array.isArray(state.completedLessonIds) && state.completedLessonIds.every((id) => typeof id === 'string') &&
    typeof state.kidsModeEnabled === 'boolean' &&
    (state.lastDailyRewardDate === null || typeof state.lastDailyRewardDate === 'string')
  );
}

export function buyCatalogItem(state: ExperienceState, item: CatalogItem, xp: number): ExperienceState {
  if (state.ownedItemIds.includes(item.id)) return state;
  if (xp < item.unlockXp || state.coins < item.priceCoins) return state;
  return {
    ...state,
    coins: state.coins - item.priceCoins,
    ownedItemIds: unique([...state.ownedItemIds, item.id]),
  };
}

export function equipCatalogItem(state: ExperienceState, itemId: string): ExperienceState {
  if (!state.ownedItemIds.includes(itemId)) return state;
  const item = COSMETIC_CATALOG.find((candidate) => candidate.id === itemId);
  if (!item) return state;
  if (item.kind === 'board') return { ...state, equippedBoardId: itemId };
  if (item.kind === 'pieces') return { ...state, equippedPieceSetId: itemId };
  if (item.kind === 'clock') return { ...state, equippedClockId: itemId };
  return state;
}

export function completeTournament(state: ExperienceState, tournamentId: string, xp: number): ExperienceState {
  const tournament = WORLD_TOUR.find((candidate) => candidate.id === tournamentId);
  if (!tournament || xp < tournament.minXp || state.completedTournamentIds.includes(tournamentId)) return state;
  return {
    ...state,
    coins: state.coins + tournament.rewardCoins,
    completedTournamentIds: unique([...state.completedTournamentIds, tournamentId]),
  };
}

export function completeAcademyLesson(
  state: ExperienceState,
  lessonId: string,
  rewardCoins: number,
): ExperienceState {
  if (state.completedLessonIds.includes(lessonId)) return state;
  return {
    ...state,
    coins: state.coins + nonNegative(rewardCoins),
    completedLessonIds: unique([...state.completedLessonIds, lessonId]),
  };
}

export function claimDailyReward(state: ExperienceState, isoDate: string): ExperienceState {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate) || state.lastDailyRewardDate === isoDate) return state;
  return { ...state, coins: state.coins + 75, lastDailyRewardDate: isoDate };
}

export function toggleKidsMode(state: ExperienceState, enabled: boolean): ExperienceState {
  return { ...state, kidsModeEnabled: enabled };
}

export function experienceSummary(state: ExperienceState, xp: number) {
  const rank = rankForXp(xp);
  const completed = state.completedTournamentIds.length;
  const owned = state.ownedItemIds.length;
  return { rank: rank.rank, coins: state.coins, completedTournaments: completed, ownedItems: owned } as const;
}
