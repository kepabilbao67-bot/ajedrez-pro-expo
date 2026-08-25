import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { usePuzzleRush } from './use-puzzle-rush';

let globalStates: any[] = [];
let globalCurrentIdx = 0;
let effectCleanups: any[] = [];
let globalRender: (() => void) | null = null;

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
      if (globalStates[idx] === undefined) {
        globalStates[idx] = deps;
        const cleanup = fn();
        if (typeof cleanup === 'function') {
          effectCleanups.push(cleanup);
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
    current: render()
  };

  globalRender = () => {
    globalCurrentIdx = 0;
    result.current = render();
  };

  return {
    result,
    unmount: () => {
      effectCleanups.forEach(fn => fn());
      effectCleanups = [];
      globalRender = null;
    }
  };
}

describe('usePuzzleRush', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1000000));
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('1. Estado inicial', () => {
    const onGameOver = vi.fn();
    const { result } = renderHook(() => usePuzzleRush({ onGameOver }));

    expect(result.current.isActive).toBe(false);
    expect(result.current.timeLeft).toBe(180);
    expect(result.current.score).toBe(0);
    expect(result.current.strikes).toBe(0);
  });

  it('2. Inicio en 180 segundos y 3. Descenso del tiempo', () => {
    const onGameOver = vi.fn();
    const { result } = renderHook(() => usePuzzleRush({ onGameOver }));

    result.current.startRush();

    expect(result.current.isActive).toBe(true);
    expect(result.current.timeLeft).toBe(180);

    vi.advanceTimersByTime(1000);
    expect(result.current.timeLeft).toBe(179);

    vi.advanceTimersByTime(2000);
    expect(result.current.timeLeft).toBe(177);
  });

  it('4. Finalización al agotarse y 5. Una sola llamada a onGameOver', () => {
    const onGameOver = vi.fn();
    const { result } = renderHook(() => usePuzzleRush({ onGameOver }));

    result.current.startRush();

    vi.advanceTimersByTime(180000); // 180 seconds

    expect(result.current.timeLeft).toBe(0);
    expect(result.current.isActive).toBe(false);
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver).toHaveBeenCalledWith(0);

    vi.advanceTimersByTime(5000);
    expect(onGameOver).toHaveBeenCalledTimes(1);
  });

  it('6. Finalización después de tres errores', () => {
    const onGameOver = vi.fn();
    const { result } = renderHook(() => usePuzzleRush({ onGameOver }));

    result.current.startRush();

    result.current.recordSuccess(); // Score = 1
    result.current.recordFailure(); // Strike = 1
    result.current.recordFailure(); // Strike = 2

    expect(result.current.isActive).toBe(true);

    result.current.recordFailure(); // Strike = 3 -> Game Over

    expect(result.current.isActive).toBe(false);
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver).toHaveBeenCalledWith(1); // 1 success
  });

  it('7. Abandono sin registrar resultado', () => {
    const onGameOver = vi.fn();
    const { result } = renderHook(() => usePuzzleRush({ onGameOver }));

    result.current.startRush();
    result.current.quitRush();

    expect(result.current.isActive).toBe(false);
    expect(onGameOver).not.toHaveBeenCalled();

    vi.advanceTimersByTime(180000);
    expect(onGameOver).not.toHaveBeenCalled(); // timer cancelled
  });

  it('8. Reinicio completo tras finalizar', () => {
    const onGameOver = vi.fn();
    const { result } = renderHook(() => usePuzzleRush({ onGameOver }));

    result.current.startRush();
    result.current.recordSuccess();
    result.current.recordFailure();
    result.current.recordFailure();
    result.current.recordFailure(); // game over

    expect(result.current.isActive).toBe(false);

    result.current.startRush(); // reinicio

    expect(result.current.isActive).toBe(true);
    expect(result.current.timeLeft).toBe(180);
    expect(result.current.score).toBe(0);
    expect(result.current.strikes).toBe(0);
  });

  it('9. Limpieza del intervalo al desmontar', () => {
    const onGameOver = vi.fn();
    const { result, unmount } = renderHook(() => usePuzzleRush({ onGameOver }));

    result.current.startRush();
    unmount();

    vi.advanceTimersByTime(180000);
    expect(onGameOver).not.toHaveBeenCalled();
  });

  it('10. Cálculo correcto después de simular una pausa temporal', () => {
    const onGameOver = vi.fn();
    const { result } = renderHook(() => usePuzzleRush({ onGameOver }));

    result.current.startRush();
    expect(result.current.timeLeft).toBe(180);

    // Simula que Android pausa la ejecución y vuelve 10 segundos después.
    vi.setSystemTime(Date.now() + 10000);
    vi.advanceTimersByTime(1000);

    expect(result.current.timeLeft).toBe(169); // 180 - 10 - 1
  });

  it('11. Que el botón "Empezar reto" puede reiniciar aunque el modo ya sea rush', () => {
    const onGameOver = vi.fn();
    const { result } = renderHook(() => usePuzzleRush({ onGameOver }));

    result.current.startRush();
    vi.advanceTimersByTime(5000);
    result.current.recordSuccess();

    expect(result.current.timeLeft).toBe(175);
    expect(result.current.score).toBe(1);

    result.current.startRush();

    expect(result.current.timeLeft).toBe(180);
    expect(result.current.score).toBe(0);
    expect(result.current.isActive).toBe(true);
    expect(onGameOver).not.toHaveBeenCalled();
  });
});
