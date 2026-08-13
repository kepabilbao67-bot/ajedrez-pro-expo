import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';

import { playAiTurn } from '@/ai/ai-opponent';
import { AiCancelledError } from '@/ai/errors';
import { StockfishEngine } from '@/ai/stockfish-engine';
import type { DifficultyLevel } from '@/ai/types';
import type { ChessGame, MoveRecord } from '@/chess';
import { canAccessDifficulty } from '@/premium/premium-policy';
import type { PremiumStatus } from '@/premium/premium-types';

export interface UseAiOpponentOptions {
  readonly initialDifficulty?: DifficultyLevel;
  readonly generationRef: MutableRefObject<number>;
  readonly onMoveApplied: (record: MoveRecord, targetGame: ChessGame) => void;
  readonly premiumStatus?: PremiumStatus;
}

export interface UseAiOpponentResult {
  readonly difficulty: DifficultyLevel;
  readonly setDifficulty: (difficulty: DifficultyLevel) => void;
  readonly thinking: boolean;
  readonly aiError: string | null;
  readonly clearAiError: () => void;
  readonly cancelAi: () => void;
  readonly requestAiMove: (targetGame: ChessGame) => Promise<void>;
  readonly getEngine: () => StockfishEngine;
}

export function useAiOpponent(options: UseAiOpponentOptions): UseAiOpponentResult {
  const { initialDifficulty = 3, generationRef, onMoveApplied, premiumStatus } = options;
  const [difficulty, setDifficultyState] = useState<DifficultyLevel>(initialDifficulty);
  const [thinking, setThinking] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const setDifficulty = useCallback(
    (nextDifficulty: DifficultyLevel) => {
      const currentStatus = premiumStatus ?? { tier: 'free' };
      if (!canAccessDifficulty(nextDifficulty, currentStatus)) {
        setAiError(`La dificultad ${nextDifficulty} (Stockfish Maestro) requiere AjedrezPro Pro.`);
        return;
      }
      setAiError(null);
      setDifficultyState(nextDifficulty);
    },
    [premiumStatus],
  );

  const engineRef = useRef<StockfishEngine | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const getEngine = useCallback((): StockfishEngine => {
    engineRef.current ??= new StockfishEngine();
    return engineRef.current;
  }, []);

  const cancelAi = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setThinking(false);
    setAiError(null);
  }, []);

  const clearAiError = useCallback(() => {
    setAiError(null);
  }, []);

  const requestAiMove = useCallback(
    async (targetGame: ChessGame) => {
      const generation = generationRef.current;
      const controller = new AbortController();
      abortRef.current = controller;
      setThinking(true);
      setAiError(null);
      try {
        const engine = getEngine();
        const record = await playAiTurn({
          game: targetGame,
          engine,
          difficulty,
          signal: controller.signal,
        });
        if (record && generation === generationRef.current) {
          onMoveApplied(record, targetGame);
        }
      } catch (error) {
        if (!(error instanceof AiCancelledError) && generation === generationRef.current) {
          setAiError(error instanceof Error ? error.message : 'No se pudo completar la jugada de la IA');
        }
      } finally {
        if (generation === generationRef.current) setThinking(false);
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [difficulty, generationRef, getEngine, onMoveApplied],
  );

  useEffect(
    () => () => {
      abortRef.current?.abort();
      engineRef.current?.dispose();
    },
    [],
  );

  return {
    difficulty,
    setDifficulty,
    thinking,
    aiError,
    clearAiError,
    cancelAi,
    requestAiMove,
    getEngine,
  };
}
