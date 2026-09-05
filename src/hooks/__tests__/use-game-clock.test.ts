import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useGameClock } from '../use-game-clock';
import { TIME_CONTROL_PRESETS } from '../../clock/clock-presets';

let globalStates: any[] = [];
let globalCurrentIdx = 0;
let effectCleanups: any[] = [];
let globalRender: (() => void) | null = null;

let appStateListener: ((state: string) => void) | null = null;
const mockRemove = vi.fn();

vi.mock('react-native', () => ({
  AppState: {
    addEventListener: vi.fn((_event: string, listener: (state: string) => void) => {
      appStateListener = listener;
      return { remove: mockRemove };
    }),
  },
}));

vi.mock('../use-haptics', () => ({
  useHaptics: () => ({
    hapticDefeat: vi.fn(),
  }),
}));

vi.mock('../use-audio-sfx', () => ({
  useAudioSfx: () => ({
    playVictory: vi.fn(),
  }),
}));

vi.mock('react', () => {
  return {
    useState: (init: any) => {
      const idx = globalCurrentIdx++;
      if (globalStates[idx] === undefined) {
        globalStates[idx] = typeof init === 'function' ? init() : init;
      }
      const setter = (val: any) => {
        globalStates[idx] = typeof val === 'function' ? val(globalStates[idx]) : val;
        if (globalRender) globalRender();
      };
      return [globalStates[idx], setter];
    },
    useRef: (init: any) => {
      const idx = globalCurrentIdx++;
      if (globalStates[idx] === undefined) {
        globalStates[idx] = { current: init };
      }
      return globalStates[idx];
    },
    useEffect: (fn: any, deps: any) => {
      const idx = globalCurrentIdx++;
      const prevDeps = globalStates[idx];
      const hasChanged = !prevDeps || !deps || deps.some((d: any, i: number) => !Object.is(d, prevDeps[i]));
      if (hasChanged) {
        globalStates[idx] = deps;
        if (effectCleanups[idx]) {
          effectCleanups[idx]();
        }
        const cleanup = fn();
        if (typeof cleanup === 'function') {
          effectCleanups[idx] = cleanup;
        }
      }
    },
    useCallback: (fn: any) => fn,
    useMemo: (fn: any) => fn(),
  };
});

function renderHook<T>(render: () => T) {
  globalStates = [];
  effectCleanups = [];
  globalCurrentIdx = 0;

  const result: { current: T } = {
    current: render(),
  };

  globalRender = () => {
    globalCurrentIdx = 0;
    result.current = render();
  };

  return {
    result,
    rerender: () => {
      if (globalRender) globalRender();
    },
    unmount: () => {
      effectCleanups.forEach((fn) => fn());
      effectCleanups = [];
      globalRender = null;
    },
  };
}

describe('useGameClock Hook & AppState Real Wiring', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    appStateListener = null;
    mockRemove.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('unmount cleans up the AppState listener subscription and interval', () => {
    const blitzPreset = TIME_CONTROL_PRESETS.find((p) => p.id === 'blitz-3-2')!;
    const { unmount } = renderHook(() =>
      useGameClock({
        initialPreset: blitzPreset,
        enabledSounds: false,
      })
    );

    expect(mockRemove).not.toHaveBeenCalled();
    unmount();
    expect(mockRemove).toHaveBeenCalled();
  });

  it('handles active -> background -> active transition with exact time deduction once', () => {
    const rapidPreset = TIME_CONTROL_PRESETS.find((p) => p.id === 'rapid-10-0')!;
    const initialMs = 10 * 60 * 1000;

    const { result } = renderHook(() =>
      useGameClock({
        initialPreset: rapidPreset,
        enabledSounds: false,
      })
    );

    // Start clock for White
    result.current.startClock('w');

    expect(result.current.clockState.isRunning).toBe(true);
    expect(result.current.clockState.activeSide).toBe('w');

    // Simulate 2 seconds in foreground
    vi.advanceTimersByTime(2000);

    const whiteAfter2s = result.current.clockState.whiteMs;
    expect(whiteAfter2s).toBeLessThanOrEqual(initialMs - 2000);

    // App goes to background
    appStateListener?.('background');

    // 5 seconds pass in background
    vi.advanceTimersByTime(5000);

    // App returns to active
    appStateListener?.('active');

    const whiteAfterBackground = result.current.clockState.whiteMs;
    expect(whiteAfterBackground).toBeLessThanOrEqual(initialMs - 7000);
  });

  it('fires onTimeout exactly once upon time expiration and does not refire on rerender', () => {
    const onTimeout = vi.fn();
    const bulletPreset = TIME_CONTROL_PRESETS.find((p) => p.id === 'bullet-1-0')!;

    const { result, rerender } = renderHook(() =>
      useGameClock({
        initialPreset: bulletPreset,
        onTimeout,
        enabledSounds: false,
      })
    );

    result.current.startClock('w');

    // Advance 61 seconds to run down 1 min
    vi.advanceTimersByTime(61000);

    expect(result.current.clockState.isFlagged).toBe(true);
    expect(result.current.clockState.flaggedSide).toBe('w');
    expect(onTimeout).toHaveBeenCalledTimes(1);
    expect(onTimeout).toHaveBeenCalledWith('w');

    // Rerender
    rerender();
    rerender();

    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('rapid switchTurn applies increment once per move', () => {
    const blitzPreset = TIME_CONTROL_PRESETS.find((p) => p.id === 'blitz-3-2')!;
    const initialMs = 3 * 60 * 1000;

    const { result } = renderHook(() =>
      useGameClock({
        initialPreset: blitzPreset,
        enabledSounds: false,
      })
    );

    result.current.startClock('w');

    // White plays after 500ms
    vi.advanceTimersByTime(500);

    result.current.onPlayerMoveExecuted('w');

    expect(result.current.clockState.activeSide).toBe('b');
    expect(result.current.clockState.whiteMs).toBeGreaterThan(initialMs);
    expect(result.current.clockState.whiteMs).toBeLessThanOrEqual(initialMs + 2000);
  });
});
