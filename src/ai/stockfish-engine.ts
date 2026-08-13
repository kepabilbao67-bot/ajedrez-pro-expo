import { difficultyDefinition } from './difficulty';
import { AiCancelledError, AiEngineError, AiTimeoutError } from './errors';
import type { AiEngine } from './engine-adapter';
import type { AiMove, AnalysisRequest, AnalysisResult, CandidateMove, DifficultyLevel, PositionEvaluation } from './types';

const WORKER_PATH = '/stockfish/stockfish-18-lite-single.js';
const UCI_MOVE = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/;

export interface WorkerPort {
  onmessage: ((event: { readonly data: unknown }) => void) | null;
  onerror: ((event: { readonly message?: string }) => void) | null;
  postMessage(message: string): void;
  terminate(): void;
}

export type WorkerFactory = () => WorkerPort;

interface SearchSnapshot {
  readonly multipv: number;
  readonly depth: number;
  readonly time: number;
  readonly nodes: number;
  readonly evaluation: PositionEvaluation;
  readonly pv: readonly AiMove[];
}

interface StockfishEngineOptions {
  readonly workerFactory?: WorkerFactory;
  readonly random?: () => number;
  readonly timeoutGraceMs?: number;
}

export function parseUciMove(value: string): AiMove | null {
  const match = UCI_MOVE.exec(value);
  if (!match) return null;
  return { from: match[1], to: match[2], ...(match[3] ? { promotion: match[3] as AiMove['promotion'] } : {}) };
}

function defaultWorkerFactory(): WorkerPort {
  if (typeof Worker === 'undefined') throw new AiEngineError('Stockfish local solo está disponible en web');
  const path = WORKER_PATH;
  return new Worker(new URL(path, window.location.href)) as unknown as WorkerPort;
}

function parseInfo(line: string, blackToMove: boolean): SearchSnapshot | null {
  if (!line.startsWith('info ') || !line.includes(' pv ') || !line.includes(' score ')) return null;
  const value = (name: string) => new RegExp(`(?:^| )${name} (-?\\d+)`).exec(line)?.[1];
  const score = / score (cp|mate) (-?\d+)/.exec(line);
  const pvText = line.split(' pv ')[1];
  if (!score || !pvText) return null;
  const pv = pvText.split(' ').map(parseUciMove).filter((move): move is AiMove => move !== null);
  if (pv.length === 0) return null;
  const sign = blackToMove ? -1 : 1;
  return {
    multipv: Number(value('multipv') ?? 1),
    depth: Number(value('depth') ?? 0),
    time: Number(value('time') ?? 0),
    nodes: Number(value('nodes') ?? 0),
    evaluation: { kind: score[1] === 'cp' ? 'centipawns' : 'mate', value: Number(score[2]) * sign, perspective: 'white' },
    pv,
  };
}

export class StockfishEngine implements AiEngine {
  readonly id = 'stockfish-lite-single';
  readonly version = '18.0.8';

  private worker: WorkerPort | null = null;
  private initialized = false;
  private busy = false;
  private readonly factory: WorkerFactory;
  private readonly random: () => number;
  private readonly timeoutGraceMs: number;

  constructor(options: StockfishEngineOptions = {}) {
    this.factory = options.workerFactory ?? defaultWorkerFactory;
    this.random = options.random ?? Math.random;
    this.timeoutGraceMs = options.timeoutGraceMs ?? 1_500;
  }

  async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    if (this.busy) throw new AiEngineError('El motor ya está analizando otra posición');
    if (request.signal?.aborted) throw new AiCancelledError();
    this.busy = true;
    try {
      const worker = this.getWorker();
      await this.initialize(worker, request.signal);
      if (request.signal?.aborted) throw new AiCancelledError();
      return await this.search(worker, request);
    } catch (error) {
      if (error instanceof AiCancelledError || error instanceof AiTimeoutError) this.resetWorker();
      throw error instanceof Error ? error : new AiEngineError('Error desconocido del motor');
    } finally {
      this.busy = false;
    }
  }

  dispose(): void {
    this.resetWorker();
  }

  private getWorker(): WorkerPort {
    if (!this.worker) this.worker = this.factory();
    return this.worker;
  }

  private initialize(worker: WorkerPort, signal?: AbortSignal): Promise<void> {
    if (this.initialized) return Promise.resolve();
    return this.waitFor(worker, 'uci', (line) => line === 'uciok', 8_000, signal).then(() => {
      this.initialized = true;
    });
  }

  private waitFor(worker: WorkerPort, command: string, predicate: (line: string) => boolean, timeoutMs: number, signal?: AbortSignal): Promise<string> {
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
        worker.onmessage = null;
        worker.onerror = null;
      };
      const fail = (error: Error) => { cleanup(); reject(error); };
      const onAbort = () => fail(new AiCancelledError());
      const timer = setTimeout(() => fail(new AiTimeoutError('Stockfish no respondió durante la inicialización')), timeoutMs);
      worker.onmessage = ({ data }) => {
        const line = String(data).trim();
        if (predicate(line)) { cleanup(); resolve(line); }
      };
      worker.onerror = ({ message }) => fail(new AiEngineError(message ?? 'Fallo del Web Worker de Stockfish'));
      signal?.addEventListener('abort', onAbort, { once: true });
      worker.postMessage(command);
    });
  }

  private search(worker: WorkerPort, request: AnalysisRequest): Promise<AnalysisResult> {
    const profile = difficultyDefinition(request.difficulty);
    const timeMs = request.limits.timeMs ?? profile.defaultLimits.timeMs ?? 1_000;
    const depth = request.limits.depth ?? profile.defaultLimits.depth ?? 8;
    const blackToMove = request.fen.split(/\s+/)[1] === 'b';
    const started = Date.now();
    const snapshots = new Map<number, SearchSnapshot>();

    worker.postMessage(`setoption name MultiPV value ${profile.multiPv}`);
    worker.postMessage(`position fen ${request.fen}`);

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        request.signal?.removeEventListener('abort', onAbort);
        worker.onmessage = null;
        worker.onerror = null;
      };
      const fail = (error: Error) => { cleanup(); worker.postMessage('stop'); reject(error); };
      const onAbort = () => fail(new AiCancelledError());
      const timer = setTimeout(() => fail(new AiTimeoutError()), timeMs + this.timeoutGraceMs);

      worker.onmessage = ({ data }) => {
        const line = String(data).trim();
        const info = parseInfo(line, blackToMove);
        if (info) snapshots.set(info.multipv, info);
        if (!line.startsWith('bestmove ')) return;

        const engineBest = parseUciMove(line.split(/\s+/)[1]);
        const ordered = [...snapshots.values()].sort((a, b) => a.multipv - b.multipv);
        const candidates: CandidateMove[] = ordered.map((snapshot) => ({
          move: snapshot.pv[0], evaluation: snapshot.evaluation, principalVariation: snapshot.pv,
        }));
        if (candidates.length === 0 && engineBest) {
          candidates.push({ move: engineBest, evaluation: { kind: 'centipawns', value: 0, perspective: 'white' }, principalVariation: [engineBest] });
        }
        const selectedRank = this.selectRank(request.difficulty, candidates.length);
        const selected = candidates[selectedRank] ?? null;
        const strongest = ordered[0];
        cleanup();
        resolve({
          bestMove: selected?.move ?? engineBest,
          evaluation: strongest?.evaluation ?? { kind: 'centipawns', value: 0, perspective: 'white' },
          candidateMoves: candidates,
          principalVariation: strongest?.pv ?? (engineBest ? [engineBest] : []),
          metadata: {
            engineId: this.id, engineVersion: this.version, depthReached: strongest?.depth,
            elapsedMs: strongest?.time ?? Date.now() - started, nodes: strongest?.nodes,
            completed: true, selectedCandidateRank: selectedRank + 1, difficulty: request.difficulty,
          },
        });
      };
      worker.onerror = ({ message }) => fail(new AiEngineError(message ?? 'Fallo del Web Worker de Stockfish'));
      request.signal?.addEventListener('abort', onAbort, { once: true });
      worker.postMessage(`go movetime ${timeMs} depth ${depth}`);
    });
  }

  private selectRank(level: DifficultyLevel, count: number): number {
    if (count <= 1) return 0;
    const profile = difficultyDefinition(level);
    if (this.random() < profile.bestMoveProbability) return 0;
    return 1 + Math.floor(this.random() * Math.max(1, Math.min(profile.candidateWindow, count) - 1));
  }

  private resetWorker(): void {
    this.worker?.terminate();
    this.worker = null;
    this.initialized = false;
  }
}
