import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { GameClockState, TimeControlPreset } from '../clock/clock-types';
import { TIME_CONTROL_PRESETS } from '../clock/clock-presets';
import {
  createInitialClockState,
  formatClockTime,
  handleClockMove,
  tickGameClock,
} from '../clock/clock-engine';
import { useHaptics } from './use-haptics';
import { useAudioSfx } from './use-audio-sfx';

export interface UseGameClockProps {
  readonly initialPreset?: TimeControlPreset;
  readonly isGameOver?: boolean;
  readonly onTimeout?: (flaggedSide: 'w' | 'b') => void;
  readonly enabledSounds?: boolean;
}

export function useGameClock({
  initialPreset = TIME_CONTROL_PRESETS[0], // Default 'none' (tiempo libre)
  isGameOver = false,
  onTimeout,
  enabledSounds = true,
}: UseGameClockProps = {}) {
  const [clockState, setClockState] = useState<GameClockState>(() =>
    createInitialClockState(initialPreset)
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasFiredTimeoutRef = useRef(false);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const { hapticDefeat } = useHaptics();
  const { playVictory } = useAudioSfx(enabledSounds);

  const applyPreset = useCallback((preset: TimeControlPreset) => {
    hasFiredTimeoutRef.current = false;
    setClockState(createInitialClockState(preset));
  }, []);

  const startClock = useCallback((startingSide: 'w' | 'b' = 'w') => {
    if (clockState.preset.category === 'none') return;
    hasFiredTimeoutRef.current = false;
    setClockState((prev) => ({
      ...prev,
      activeSide: startingSide,
      isRunning: true,
      isPaused: false,
      lastTimestamp: Date.now(),
    }));
  }, [clockState.preset.category]);

  const onPlayerMoveExecuted = useCallback(
    (movedSide: 'w' | 'b') => {
      if (clockState.preset.category === 'none') return;
      setClockState((prev) => handleClockMove(prev, movedSide, Date.now()));
    },
    [clockState.preset.category]
  );

  const togglePause = useCallback(() => {
    setClockState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
      lastTimestamp: !prev.isPaused ? null : Date.now(),
    }));
  }, []);

  const resetClock = useCallback(() => {
    hasFiredTimeoutRef.current = false;
    setClockState(createInitialClockState(clockState.preset));
  }, [clockState.preset]);

  // AppState listener for smooth background/foreground transitions
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        setClockState((prev) => {
          if (!prev.isRunning || prev.isPaused || prev.isFlagged || prev.preset.category === 'none') {
            return prev;
          }
          const now = Date.now();
          const next = tickGameClock(prev, now);
          if (next.isFlagged && !hasFiredTimeoutRef.current && next.flaggedSide) {
            hasFiredTimeoutRef.current = true;
            hapticDefeat();
            playVictory();
            onTimeoutRef.current?.(next.flaggedSide);
          }
          return next;
        });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [hapticDefeat, playVictory]);

  // High-frequency tick effect (50ms for smooth decimal rendering)
  useEffect(() => {
    if (
      !clockState.isRunning ||
      clockState.isPaused ||
      clockState.isFlagged ||
      isGameOver ||
      clockState.preset.category === 'none'
    ) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setClockState((prev) => {
        const next = tickGameClock(prev, Date.now());
        if (next.isFlagged && !hasFiredTimeoutRef.current && next.flaggedSide) {
          hasFiredTimeoutRef.current = true;
          hapticDefeat();
          playVictory();
          onTimeoutRef.current?.(next.flaggedSide);
        }
        return next;
      });
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    clockState.isRunning,
    clockState.isPaused,
    clockState.isFlagged,
    clockState.preset.category,
    isGameOver,
    hapticDefeat,
    playVictory,
  ]);

  const whiteFormatted = formatClockTime(clockState.whiteMs);
  const blackFormatted = formatClockTime(clockState.blackMs);
  const isLowTimeWhite = clockState.whiteMs > 0 && clockState.whiteMs <= 10000;
  const isLowTimeBlack = clockState.blackMs > 0 && clockState.blackMs <= 10000;

  return {
    clockState,
    whiteFormatted,
    blackFormatted,
    isLowTimeWhite,
    isLowTimeBlack,
    applyPreset,
    startClock,
    onPlayerMoveExecuted,
    togglePause,
    resetClock,
  };
}
