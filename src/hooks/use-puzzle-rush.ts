import { useCallback, useEffect, useRef, useState } from 'react';
import { ChessGame } from '@/chess';
import type { TrainingPuzzle } from '@/training/training-types';

export interface UsePuzzleRushOptions {
  readonly onGameOver: (score: number) => void;
}

export function usePuzzleRush({ onGameOver }: UsePuzzleRushOptions) {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const maxStrikes = 3;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRush = useCallback(() => {
    setIsActive(true);
    setTimeLeft(180);
    setScore(0);
    setStrikes(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const endRush = useCallback(() => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    onGameOver(score);
  }, [onGameOver, score]);

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      endRush();
    }
  }, [timeLeft, isActive, endRush]);

  const recordSuccess = useCallback(() => {
    setScore((s) => s + 1);
  }, []);

  const recordFailure = useCallback(() => {
    setStrikes((s) => {
      const next = s + 1;
      if (next >= maxStrikes) {
        endRush();
      }
      return next;
    });
  }, [endRush]);

  const quitRush = useCallback(() => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    isActive,
    timeLeft,
    score,
    strikes,
    maxStrikes,
    startRush,
    recordSuccess,
    recordFailure,
    quitRush,
  };
}
