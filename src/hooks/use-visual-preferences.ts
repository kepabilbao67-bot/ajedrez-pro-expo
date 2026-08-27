import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { boardThemeById, type BoardThemeDefinition } from '@/board-themes/board-themes';
import { pieceSetById, type PieceSetDefinition } from '@/board-themes/piece-sets';
import { DEFAULT_VISUAL_PREFERENCES, VisualPreferencesService, type VisualPreferences } from '@/theme/visual-preferences';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UseVisualPreferencesOptions {}

export interface UseVisualPreferencesResult {
  readonly visualPreferences: VisualPreferences;
  readonly boardTheme: BoardThemeDefinition;
  readonly pieceSet: PieceSetDefinition;
  readonly updateVisualPreferences: (change: Partial<VisualPreferences>) => void;
}

export function useVisualPreferences(options?: UseVisualPreferencesOptions): UseVisualPreferencesResult {
  const [visualPreferences, setVisualPreferences] = useState<VisualPreferences>(DEFAULT_VISUAL_PREFERENCES);
  const serviceRef = useRef<VisualPreferencesService | null>(null);
  serviceRef.current ??= new VisualPreferencesService();

  useEffect(() => {
    setVisualPreferences(serviceRef.current!.load());
  }, []);

  const updateVisualPreferences = useCallback(
    (change: Partial<VisualPreferences>) => {
      setVisualPreferences(serviceRef.current!.update(change));
    },
    [],
  );

  const boardTheme = useMemo(() => boardThemeById(visualPreferences.boardTheme), [visualPreferences.boardTheme]);
  const pieceSet = useMemo(() => pieceSetById(visualPreferences.pieceSet), [visualPreferences.pieceSet]);

  return {
    visualPreferences,
    boardTheme,
    pieceSet,
    updateVisualPreferences,
  };
}
