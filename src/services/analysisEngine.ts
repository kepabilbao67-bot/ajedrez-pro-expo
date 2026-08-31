import { ChessGame } from '@/chess';
import { FallbackAiEngine } from '@/ai/fallback-engine';
import type { PositionEvaluation, AiMove } from '@/ai/types';

export type MoveClassification = 'brilliant' | 'best' | 'excellent' | 'inaccuracy' | 'mistake' | 'blunder';

export interface MoveClassificationDetails {
  readonly classification: MoveClassification;
  readonly label: string;
  readonly symbol: string;
  readonly color: string;
  readonly lossCentipawns: number;
  readonly recommendedMoveSan?: string;
  readonly explanation: string;
}

export interface AdvantageEvaluation {
  readonly scoreCp: number;
  readonly formatted: string;
  readonly whiteWinProbability: number; // 0 to 100
  readonly isMate: boolean;
  readonly mateInMoves?: number;
  readonly bestMove: AiMove | null;
}

export class AnalysisEngine {
  private static instance: AnalysisEngine | null = null;
  private readonly fallbackEngine: FallbackAiEngine;

  constructor() {
    this.fallbackEngine = new FallbackAiEngine({ maxDepth: 3 });
  }

  static getInstance(): AnalysisEngine {
    if (!AnalysisEngine.instance) {
      AnalysisEngine.instance = new AnalysisEngine();
    }
    return AnalysisEngine.instance;
  }

  /**
   * Evaluates a given FEN position from White's perspective.
   */
  async evaluatePosition(fen: string, depth: number = 2): Promise<AdvantageEvaluation> {
    const game = new ChessGame(fen);
    const status = game.status();

    if (status.checkmate) {
      const winnerIsWhite = status.winner === 'w';
      const scoreCp = winnerIsWhite ? 100000 : -100000;
      return {
        scoreCp,
        formatted: winnerIsWhite ? '#M0' : '#-M0',
        whiteWinProbability: winnerIsWhite ? 100 : 0,
        isMate: true,
        mateInMoves: 0,
        bestMove: null,
      };
    }

    if (status.draw || status.stalemate) {
      return {
        scoreCp: 0,
        formatted: '0.0',
        whiteWinProbability: 50,
        isMate: false,
        bestMove: null,
      };
    }

    try {
      const result = await this.fallbackEngine.analyze({
        fen,
        difficulty: 5,
        limits: { depth },
      });

      const scoreCp = result.evaluation.value;
      const isMate = result.evaluation.kind === 'mate';
      const whiteWinProb = this.calculateWinPercentage(scoreCp);
      const formatted = this.formatScore(result.evaluation);

      return {
        scoreCp,
        formatted,
        whiteWinProbability: whiteWinProb,
        isMate,
        bestMove: result.bestMove,
      };
    } catch {
      return {
        scoreCp: 0,
        formatted: '0.0',
        whiteWinProbability: 50,
        isMate: false,
        bestMove: null,
      };
    }
  }

  /**
   * Classifies a played move by comparing position evaluation before and after.
   */
  classifyMove(
    lossCentipawns: number,
    options: {
      isSacrifice?: boolean;
      isMateDelivered?: boolean;
      recommendedMoveSan?: string;
    } = {}
  ): MoveClassificationDetails {
    const { isSacrifice, isMateDelivered, recommendedMoveSan } = options;

    if (isMateDelivered) {
      return {
        classification: 'best',
        label: 'Jaque Mate',
        symbol: '🟢',
        color: '#00E5B4',
        lossCentipawns: 0,
        recommendedMoveSan,
        explanation: '¡Remate decisivo que entrega la victoria!',
      };
    }

    if (isSacrifice && lossCentipawns <= 15) {
      return {
        classification: 'brilliant',
        label: 'Brillante',
        symbol: '💎',
        color: '#00C8FF',
        lossCentipawns,
        recommendedMoveSan,
        explanation: '¡Jugada genial! Sacrificio intuitivo que asegura una posición ganadora.',
      };
    }

    if (lossCentipawns <= 15) {
      return {
        classification: 'best',
        label: 'Mejor jugada',
        symbol: '🟢',
        color: '#00E5B4',
        lossCentipawns,
        recommendedMoveSan,
        explanation: 'Encontraste la continuación más precisa de la evaluación local.',
      };
    }

    if (lossCentipawns <= 40) {
      return {
        classification: 'excellent',
        label: 'Excelente',
        symbol: '🔵',
        color: '#4DA6FF',
        lossCentipawns,
        recommendedMoveSan,
        explanation: 'Muy buena jugada que mantiene la ventaja posicional.',
      };
    }

    if (lossCentipawns <= 90) {
      return {
        classification: 'inaccuracy',
        label: 'Imprecisión',
        symbol: '🟡',
        color: '#F5C451',
        lossCentipawns,
        recommendedMoveSan,
        explanation: recommendedMoveSan
          ? `Había una opción más exacta como ${recommendedMoveSan}.`
          : 'Jugada pasiva que cede parte de la iniciativa.',
      };
    }

    if (lossCentipawns <= 200) {
      return {
        classification: 'mistake',
        label: 'Error',
        symbol: '🟠',
        color: '#FF8C42',
        lossCentipawns,
        recommendedMoveSan,
        explanation: recommendedMoveSan
          ? `Error táctico. La jugada clave era ${recommendedMoveSan}.`
          : 'Pérdida de ventaja considerable.',
      };
    }

    return {
      classification: 'blunder',
      label: 'Error grave',
      symbol: '🔴',
      color: '#FF4D4D',
      lossCentipawns,
      recommendedMoveSan,
      explanation: recommendedMoveSan
        ? `Grave descuido. Pierde material o ventaja crítica. Era mejor ${recommendedMoveSan}.`
        : 'Grave descuido que compromete la partida.',
    };
  }

  /**
   * Converts centipawns to white win probability 0 - 100%.
   */
  calculateWinPercentage(centipawns: number): number {
    if (centipawns >= 90000) return 100;
    if (centipawns <= -90000) return 0;
    // Logistic sigmoid formula standard in chess evaluation
    const prob = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * centipawns)) - 1);
    return Math.max(1, Math.min(99, Math.round(prob)));
  }

  /**
   * Formats PositionEvaluation into standard string representation.
   */
  formatScore(evaluation: PositionEvaluation): string {
    if (evaluation.kind === 'mate') {
      const mateMoves = Math.ceil(Math.abs(100000 - Math.abs(evaluation.value)));
      return evaluation.value > 0 ? `#M${mateMoves}` : `#-M${mateMoves}`;
    }
    const pawns = evaluation.value / 100;
    const prefix = pawns > 0 ? '+' : '';
    return `${prefix}${pawns.toFixed(1)}`;
  }
}
