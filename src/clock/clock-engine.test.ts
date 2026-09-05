import { describe, expect, it } from 'vitest';
import {
  createInitialClockState,
  formatClockTime,
  handleClockMove,
  tickGameClock,
} from './clock-engine';
import { TIME_CONTROL_PRESETS } from './clock-presets';

describe('Game Clock Engine & Precision', () => {
  it('creates initial clock with preset times', () => {
    const blitz32 = TIME_CONTROL_PRESETS.find((p) => p.id === 'blitz-3-2')!;
    const state = createInitialClockState(blitz32);

    expect(state.whiteMs).toBe(180000); // 3 min
    expect(state.blackMs).toBe(180000);
    expect(state.isRunning).toBe(false);
    expect(state.isFlagged).toBe(false);
  });

  it('ticks active side time correctly based on elapsed timestamp delta', () => {
    const blitz = TIME_CONTROL_PRESETS.find((p) => p.id === 'blitz-3-0')!;
    let state = createInitialClockState(blitz);
    state = { ...state, isRunning: true, activeSide: 'w', lastTimestamp: 1000 };

    state = tickGameClock(state, 2000); // 1000ms elapsed
    expect(state.whiteMs).toBe(179000);
    expect(state.blackMs).toBe(180000);
  });

  it('adds Fischer increment on move and switches active side', () => {
    const blitz32 = TIME_CONTROL_PRESETS.find((p) => p.id === 'blitz-3-2')!; // +2s increment
    let state = createInitialClockState(blitz32);
    state = { ...state, whiteMs: 170000, activeSide: 'w' };

    state = handleClockMove(state, 'w', Date.now());

    expect(state.whiteMs).toBe(172000); // 170000 + 2000ms
    expect(state.activeSide).toBe('b');
    expect(state.isRunning).toBe(true);
  });

  it('detects timeout flag when time reaches 0', () => {
    const bullet = TIME_CONTROL_PRESETS.find((p) => p.id === 'bullet-1-0')!;
    let state = createInitialClockState(bullet);
    state = { ...state, isRunning: true, activeSide: 'b', blackMs: 500, lastTimestamp: 1000 };

    state = tickGameClock(state, 2000); // 1000ms elapsed, but only 500ms left

    expect(state.blackMs).toBe(0);
    expect(state.isFlagged).toBe(true);
    expect(state.flaggedSide).toBe('b');
    expect(state.isRunning).toBe(false);
  });

  it('transfers time in Hourglass mode', () => {
    const hourglass = TIME_CONTROL_PRESETS.find((p) => p.id === 'hourglass-2-0')!;
    let state = createInitialClockState(hourglass);
    state = { ...state, isRunning: true, activeSide: 'w', whiteMs: 60000, blackMs: 60000, lastTimestamp: 1000 };

    state = tickGameClock(state, 5000); // 4000ms elapsed

    expect(state.whiteMs).toBe(56000);
    expect(state.blackMs).toBe(64000); // 60000 + 4000 transferred!
  });

  it('handles negative time shifts safely without corrupting clock time', () => {
    const blitz = TIME_CONTROL_PRESETS.find((p) => p.id === 'blitz-3-0')!;
    let state = createInitialClockState(blitz);
    state = { ...state, isRunning: true, activeSide: 'w', whiteMs: 100000, lastTimestamp: 5000 };

    // OS clock jumped back to 3000ms
    state = tickGameClock(state, 3000);
    expect(state.whiteMs).toBe(100000); // Does not add time or crash
    expect(state.isFlagged).toBe(false);
  });

  it('handles rapid sequential moves without state corruption', () => {
    const blitz32 = TIME_CONTROL_PRESETS.find((p) => p.id === 'blitz-3-2')!;
    let state = createInitialClockState(blitz32);

    // White moves
    state = handleClockMove(state, 'w', 1000);
    expect(state.whiteMs).toBe(182000);
    expect(state.activeSide).toBe('b');

    // Black moves immediately
    state = handleClockMove(state, 'b', 1100);
    expect(state.blackMs).toBe(182000);
    expect(state.activeSide).toBe('w');

    // White moves again
    state = handleClockMove(state, 'w', 1200);
    expect(state.whiteMs).toBe(184000);
    expect(state.activeSide).toBe('b');
  });

  it('formats clock strings properly including sub-10s decimals', () => {
    expect(formatClockTime(180000)).toBe('03:00');
    expect(formatClockTime(65000)).toBe('01:05');
    expect(formatClockTime(8400)).toBe('00:08.4');
    expect(formatClockTime(0)).toBe('00:00');
  });
});
