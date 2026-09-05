import type { GameClockState, TimeControlPreset } from './clock-types';
import { TIME_CONTROL_PRESETS } from './clock-presets';

export function createInitialClockState(
  preset: TimeControlPreset = TIME_CONTROL_PRESETS[4] // Blitz 3+2 FIDE default
): GameClockState {
  const initialMs = preset.baseMinutes * 60 * 1000;
  return {
    preset,
    theme: 'digital_pro',
    whiteMs: initialMs,
    blackMs: initialMs,
    activeSide: null,
    isRunning: false,
    isPaused: false,
    isFlagged: false,
    flaggedSide: null,
    lastTimestamp: null,
    currentDelayRemainingMs: (preset.delaySeconds ?? 0) * 1000,
  };
}

/**
 * Executes a high-precision clock tick based on actual elapsed timestamp (Date.now()).
 */
export function tickGameClock(state: GameClockState, nowMs: number): GameClockState {
  if (!state.isRunning || state.isPaused || !state.activeSide || state.isFlagged || state.preset.category === 'none') {
    return state;
  }

  const lastTime = state.lastTimestamp ?? nowMs;
  const deltaMs = Math.max(0, nowMs - lastTime);

  // If there's an active delay on the current move, absorb delta into delay first
  if (state.currentDelayRemainingMs > 0) {
    const nextDelay = Math.max(0, state.currentDelayRemainingMs - deltaMs);
    const remainder = deltaMs - (state.currentDelayRemainingMs - nextDelay);

    return {
      ...state,
      lastTimestamp: nowMs,
      currentDelayRemainingMs: nextDelay,
      ...(remainder > 0 ? applyDeduction(state, remainder) : {}),
    };
  }

  return {
    ...state,
    ...applyDeduction(state, deltaMs),
    lastTimestamp: nowMs,
  };
}

function applyDeduction(state: GameClockState, deltaMs: number): Partial<GameClockState> {
  const isWhite = state.activeSide === 'w';

  if (state.preset.isHourglass) {
    // In Hourglass mode: time lost by active player is transferred to the opponent!
    const updatedWhite = isWhite ? state.whiteMs - deltaMs : state.whiteMs + deltaMs;
    const updatedBlack = !isWhite ? state.blackMs - deltaMs : state.blackMs + deltaMs;

    if (updatedWhite <= 0) {
      return { whiteMs: 0, isFlagged: true, flaggedSide: 'w', isRunning: false };
    }
    if (updatedBlack <= 0) {
      return { blackMs: 0, isFlagged: true, flaggedSide: 'b', isRunning: false };
    }
    return { whiteMs: updatedWhite, blackMs: updatedBlack };
  }

  // Standard deduction
  const currentMs = isWhite ? state.whiteMs : state.blackMs;
  const nextMs = currentMs - deltaMs;

  if (nextMs <= 0) {
    return {
      ...(isWhite ? { whiteMs: 0 } : { blackMs: 0 }),
      isFlagged: true,
      flaggedSide: state.activeSide,
      isRunning: false,
    };
  }

  return isWhite ? { whiteMs: nextMs } : { blackMs: nextMs };
}

/**
 * Handles turn change when a move is executed:
 * - Adds Fischer increment to the player who just moved
 * - Switches active side to next player
 * - Resets delay counter
 */
export function handleClockMove(
  state: GameClockState,
  movedSide: 'w' | 'b',
  nowMs: number
): GameClockState {
  if (state.preset.category === 'none') {
    return state;
  }

  const incrementMs = state.preset.incrementSeconds * 1000;
  const isWhite = movedSide === 'w';

  const newWhiteMs = isWhite ? state.whiteMs + incrementMs : state.whiteMs;
  const newBlackMs = !isWhite ? state.blackMs + incrementMs : state.blackMs;

  const nextSide: 'w' | 'b' = isWhite ? 'b' : 'w';

  return {
    ...state,
    whiteMs: newWhiteMs,
    blackMs: newBlackMs,
    activeSide: nextSide,
    isRunning: true,
    lastTimestamp: nowMs,
    currentDelayRemainingMs: (state.preset.delaySeconds ?? 0) * 1000,
  };
}

/**
 * Formats milliseconds into clean, readable MM:SS or SS.s format.
 */
export function formatClockTime(ms: number, showTenthsBelow10s: boolean = true): string {
  if (ms <= 0) return '00:00';

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0 && seconds < 10 && showTenthsBelow10s) {
    const tenths = Math.floor((ms % 1000) / 100);
    return `00:0${seconds}.${tenths}`;
  }

  const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const ss = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${mm}:${ss}`;
}
