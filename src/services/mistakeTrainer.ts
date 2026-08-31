import { ChessGame, type MoveRecord } from '@/chess';
import type { TrainingPuzzle } from '@/training/training-types';
import { AnalysisEngine } from './analysisEngine';

export interface MistakeMoveCoords {
  readonly from: string;
  readonly to: string;
  readonly promotion?: 'q' | 'r' | 'b' | 'n';
}

export interface MistakeExercise {
  readonly id: string;
  readonly moveNumber: number;
  readonly fenBefore: string;
  readonly playedSan: string;
  readonly bestAlternativeSan: string;
  readonly bestMove: MistakeMoveCoords;
  readonly classification: 'blunder' | 'mistake' | 'inaccuracy';
  readonly explanation: string;
}

export async function extractMistakesFromGame(
  history: readonly MoveRecord[],
  playerColor: 'w' | 'b' = 'w'
): Promise<MistakeExercise[]> {
  const mistakes: MistakeExercise[] = [];
  const engine = AnalysisEngine.getInstance();

  for (let i = 0; i < history.length; i++) {
    const isPlayerTurn = (playerColor === 'w' && i % 2 === 0) || (playerColor === 'b' && i % 2 === 1);
    if (!isPlayerTurn) continue;

    const record = history[i];
    const moveNum = Math.floor(i / 2) + 1;

    // Evaluate position before move
    const beforeEval = await engine.evaluatePosition(record.fenBefore);
    // Evaluate position after move
    const afterEval = await engine.evaluatePosition(record.fenAfter);

    const isWhite = playerColor === 'w';
    const evalBefore = isWhite ? beforeEval.scoreCp : -beforeEval.scoreCp;
    const evalAfter = isWhite ? afterEval.scoreCp : -afterEval.scoreCp;
    const diff = evalBefore - evalAfter;

    let classification: 'blunder' | 'mistake' | 'inaccuracy' | null = null;
    let explanation = '';

    if (diff >= 200) {
      classification = 'blunder';
      explanation = `Tu jugada ${record.san} entregó una ventaja considerable (+${(diff / 100).toFixed(1)} peones en la evaluación estimada).`;
    } else if (diff >= 100) {
      classification = 'mistake';
      explanation = `Tu jugada ${record.san} cedió ventaja táctica posicional.`;
    } else if (diff >= 50) {
      classification = 'inaccuracy';
      explanation = `Había una alternativa más precisa que ${record.san}.`;
    }

    if (classification) {
      let fromSquare = 'e2';
      let toSquare = 'e4';
      let promotion: 'q' | 'r' | 'b' | 'n' | undefined = undefined;
      let bestMoveSan = 'e4';

      if (beforeEval.bestMove && typeof beforeEval.bestMove === 'object') {
        fromSquare = beforeEval.bestMove.from;
        toSquare = beforeEval.bestMove.to;
        promotion = beforeEval.bestMove.promotion;

        try {
          const tempGame = new ChessGame(record.fenBefore);
          const rec = tempGame.move({
            from: fromSquare,
            to: toSquare,
            promotion,
          });
          if (rec) {
            bestMoveSan = rec.san;
          } else {
            bestMoveSan = `${fromSquare}-${toSquare}`;
          }
        } catch {
          bestMoveSan = `${fromSquare}-${toSquare}`;
        }
      } else if (typeof beforeEval.bestMove === 'string') {
        bestMoveSan = beforeEval.bestMove;
      }

      mistakes.push({
        id: `mistake-${moveNum}-${record.san}`,
        moveNumber: moveNum,
        fenBefore: record.fenBefore,
        playedSan: record.san,
        bestAlternativeSan: bestMoveSan,
        bestMove: {
          from: fromSquare,
          to: toSquare,
          promotion,
        },
        classification,
        explanation,
      });
    }
  }

  return mistakes;
}

export function verifyMistakeAttempt(
  exercise: MistakeExercise,
  playedSan: string
): boolean {
  const cleanAttempt = playedSan.replace(/[+#]$/, '');
  const cleanBest = exercise.bestAlternativeSan.replace(/[+#]$/, '');

  return cleanAttempt === cleanBest || cleanAttempt.toLowerCase() === cleanBest.toLowerCase();
}

/**
 * Converts a MistakeExercise into a TrainingPuzzle ready for the interactive board.
 * Sets rewardXp: 0 to ensure retrying mistakes does not grant duplicate game XP.
 */
export function mistakeToTrainingPuzzle(exercise: MistakeExercise): TrainingPuzzle {
  return {
    id: exercise.id,
    title: `Aprende de tu error (Jugada ${exercise.moveNumber})`,
    fen: exercise.fenBefore,
    solution: [
      {
        from: exercise.bestMove.from,
        to: exercise.bestMove.to,
        promotion: exercise.bestMove.promotion,
      },
    ],
    difficulty: exercise.classification === 'blunder' ? 1 : 2,
    category: 'best-move',
    rewardXp: 0, // No duplicar XP al reintentar errores
    explanation: exercise.explanation,
    objective: `Encuentra la mejor alternativa táctica en lugar de ${exercise.playedSan}.`,
    alternative: exercise.bestAlternativeSan,
  };
}

