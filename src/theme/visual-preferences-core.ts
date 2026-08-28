import type { BoardThemeId } from '../board-themes/board-themes';
import { normalizePieceSetId, type PieceSetId } from '../board-themes/piece-sets';
import { DEFAULT_SOUND_PREFERENCES } from './sound-preferences';

export interface VisualPreferences {
  readonly boardTheme: BoardThemeId;
  readonly pieceSet: PieceSetId;
  readonly soundsEnabled: boolean;
}

export interface PreferenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const VISUAL_PREFERENCES_KEY = 'ajedrezpro.visual-preferences.v1';
export const DEFAULT_VISUAL_PREFERENCES: VisualPreferences = {
  boardTheme: 'classic',
  pieceSet: 'staunton',
  soundsEnabled: DEFAULT_SOUND_PREFERENCES.enabled,
};

const VALID_BOARD_THEMES = new Set<BoardThemeId>([
  'classic',
  'neon-cyber',
  'glass',
  'medieval',
  'royal-gold',
  'futuristic',
  'ocean',
  'cherry-blossom',
]);

const VALID_PIECE_SETS = new Set<PieceSetId>([
  'staunton',
  'modern',
  '3d-realistic',
  'classic',
  '3d',
  'fantasy',
  'minimalist',
]);

const isBoardTheme = (value: unknown): value is BoardThemeId =>
  typeof value === 'string' && VALID_BOARD_THEMES.has(value as BoardThemeId);

const isPieceSet = (value: unknown): value is PieceSetId =>
  typeof value === 'string' && VALID_PIECE_SETS.has(value as PieceSetId);

export function isVisualPreferences(value: unknown): value is VisualPreferences {
  if (!value || typeof value !== 'object') return false;
  const preferences = value as Partial<VisualPreferences>;
  return (
    isBoardTheme(preferences.boardTheme) &&
    isPieceSet(preferences.pieceSet) &&
    typeof preferences.soundsEnabled === 'boolean'
  );
}

function defaultStorage(): PreferenceStorage | null {
  return globalThis.localStorage ?? null;
}

export class VisualPreferencesService {
  constructor(
    private readonly storage?: PreferenceStorage,
    private readonly key = VISUAL_PREFERENCES_KEY
  ) {}

  load(): VisualPreferences {
    const raw = (this.storage ?? defaultStorage())?.getItem(this.key);
    if (!raw) return { ...DEFAULT_VISUAL_PREFERENCES };
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isVisualPreferences(parsed)) {
        return {
          ...parsed,
          pieceSet: normalizePieceSetId(parsed.pieceSet),
        };
      }
    } catch {
      // Corrupt values are removed below and replaced by the defaults.
    }
    (this.storage ?? defaultStorage())?.removeItem(this.key);
    return { ...DEFAULT_VISUAL_PREFERENCES };
  }

  update(change: Partial<VisualPreferences>): VisualPreferences {
    const next: VisualPreferences = {
      ...this.load(),
      ...change,
      ...(change.pieceSet ? { pieceSet: normalizePieceSetId(change.pieceSet) } : {}),
    };
    (this.storage ?? defaultStorage())?.setItem(this.key, JSON.stringify(next));
    return next;
  }
}
