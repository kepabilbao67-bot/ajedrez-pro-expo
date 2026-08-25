import { useCallback, useEffect, useRef, useState } from 'react';

export interface UsePuzzleRushOptions {
  readonly onGameOver: (score: number) => void;
}

export function usePuzzleRush({ onGameOver }: UsePuzzleRushOptions) {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const maxStrikes = 3;

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeLeftRef = useRef(180);
  const scoreRef = useRef(0);
  const strikesRef = useRef(0);
  const onGameOverRef = useRef(onGameOver);
  const isEndingRef = useRef(false);

  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  const endRush = useCallback(() => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsActive(false);
    onGameOverRef.current(scoreRef.current);
  }, []);

  const startRush = useCallback(() => {
    isEndingRef.current = false;

    const duration = 180;
    setTimeLeft(duration);
    timeLeftRef.current = duration;

    setScore(0);
    scoreRef.current = 0;

    setStrikes(0);
    strikesRef.current = 0;

    setIsActive(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const endTime = Date.now() + duration * 1000;

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));

      if (remaining <= 0) {
        setTimeLeft(0);
        timeLeftRef.current = 0;
        endRush();
      } else {
        timeLeftRef.current = remaining;
        setTimeLeft(remaining);
      }
    }, 1000);
  }, [endRush]);

  const recordSuccess = useCallback(() => {
    if (isEndingRef.current) return;
    scoreRef.current += 1;
    setScore(scoreRef.current);
  }, []);

  const recordFailure = useCallback(() => {
    if (isEndingRef.current) return;
    strikesRef.current += 1;
    setStrikes(strikesRef.current);
    if (strikesRef.current >= maxStrikes) {
      endRush();
    }
  }, [endRush, maxStrikes]);

  const quitRush = useCallback(() => {
    isEndingRef.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsActive(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
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
