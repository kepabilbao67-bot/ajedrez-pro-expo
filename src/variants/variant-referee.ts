import { opposite, typeOf } from '../chess/board';
import { isInCheck, isCheckmate, isStalemate, isInsufficientMaterial } from '../chess/rules';
import type { Color, Move, Position, Square } from '../chess/types';

// ==================== KING OF THE HILL ====================

/**
 * Center squares for King of the Hill variant: d4, e4, d5, e5
 * Algebraic coordinates & zero-indexed board coordinates:
 * d5: rank 3, file 3 -> 3 * 8 + 3 = 27
 * e5: rank 3, file 4 -> 3 * 8 + 4 = 28
 * d4: rank 4, file 3 -> 4 * 8 + 3 = 35
 * e4: rank 4, file 4 -> 4 * 8 + 4 = 36
 */
export const KOTH_CENTER_SQUARES: readonly Square[] = [27, 28, 35, 36];
export const KOTH_CENTER_ALGEBRAIC = ['d5', 'e5', 'd4', 'e4'] as const;

export interface VariantGameOutcome {
  readonly isGameOver: boolean;
  readonly winner: Color | 'draw' | null;
  readonly reason: 'checkmate' | 'stalemate' | 'insufficient_material' | 'three_check' | 'king_of_the_hill' | null;
  readonly description: string;
}

/**
 * Evaluates whether the last move triggers King of the Hill victory condition.
 */
export function checkKingOfTheHillOutcome(position: Position, lastMove?: Move): VariantGameOutcome {
  if (lastMove) {
    const movedPiece = position.board[lastMove.to];
    if (movedPiece && typeOf(movedPiece) === 'k' && KOTH_CENTER_SQUARES.includes(lastMove.to)) {
      const winner: Color = position.turn === 'w' ? 'b' : 'w'; // player who just moved
      return {
        isGameOver: true,
        winner,
        reason: 'king_of_the_hill',
        description: `¡El Rey ${winner === 'w' ? 'blanco' : 'negro'} conquistó la colina central!`,
      };
    }
  }

  // Also verify standard end conditions
  if (isCheckmate(position)) {
    const winner = opposite(position.turn);
    return {
      isGameOver: true,
      winner,
      reason: 'checkmate',
      description: `Jaque mate. Victoria de las ${winner === 'w' ? 'blancas' : 'negras'}.`,
    };
  }

  if (isStalemate(position)) {
    return {
      isGameOver: true,
      winner: 'draw',
      reason: 'stalemate',
      description: 'Tablas por rey ahogado.',
    };
  }

  if (isInsufficientMaterial(position)) {
    return {
      isGameOver: true,
      winner: 'draw',
      reason: 'insufficient_material',
      description: 'Tablas por material insuficiente.',
    };
  }

  return {
    isGameOver: false,
    winner: null,
    reason: null,
    description: '',
  };
}

// ==================== THREE-CHECK ====================

export interface ThreeCheckState {
  readonly whiteChecksGiven: number;
  readonly blackChecksGiven: number;
}

export function createInitialThreeCheckState(): ThreeCheckState {
  return {
    whiteChecksGiven: 0,
    blackChecksGiven: 0,
  };
}

/**
 * Processes a move in Three-Check variant, tracking checks delivered and detecting 3-check victory.
 */
export function processThreeCheckMove(
  currentState: ThreeCheckState,
  positionAfterMove: Position,
  movedColor: Color
): { readonly nextState: ThreeCheckState; readonly outcome: VariantGameOutcome } {
  const opponentColor = opposite(movedColor);
  const givesCheck = isInCheck(positionAfterMove, opponentColor);

  const whiteChecksGiven = movedColor === 'w' && givesCheck
    ? currentState.whiteChecksGiven + 1
    : currentState.whiteChecksGiven;

  const blackChecksGiven = movedColor === 'b' && givesCheck
    ? currentState.blackChecksGiven + 1
    : currentState.blackChecksGiven;

  const nextState: ThreeCheckState = {
    whiteChecksGiven,
    blackChecksGiven,
  };

  // 3-check condition
  if (whiteChecksGiven >= 3) {
    return {
      nextState,
      outcome: {
        isGameOver: true,
        winner: 'w',
        reason: 'three_check',
        description: '¡Victoria blanca al conseguir el 3º jaque!',
      },
    };
  }

  if (blackChecksGiven >= 3) {
    return {
      nextState,
      outcome: {
        isGameOver: true,
        winner: 'b',
        reason: 'three_check',
        description: '¡Victoria negra al conseguir el 3º jaque!',
      },
    };
  }

  // Checkmate / Stalemate fallbacks
  if (isCheckmate(positionAfterMove)) {
    return {
      nextState,
      outcome: {
        isGameOver: true,
        winner: movedColor,
        reason: 'checkmate',
        description: `Jaque mate. Victoria de las ${movedColor === 'w' ? 'blancas' : 'negras'}.`,
      },
    };
  }

  if (isStalemate(positionAfterMove)) {
    return {
      nextState,
      outcome: {
        isGameOver: true,
        winner: 'draw',
        reason: 'stalemate',
        description: 'Tablas por ahogado.',
      },
    };
  }

  return {
    nextState,
    outcome: {
      isGameOver: false,
      winner: null,
      reason: null,
      description: '',
    },
  };
}

// ==================== CHESS960 (FISCHER RANDOM) ====================

export interface Chess960Setup {
  readonly scharnaglIndex: number;
  readonly backRankPieces: readonly string[]; // 8 pieces e.g. ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
  readonly fen: string;
}

/**
 * Generates a valid Fischer Random Chess (Chess960) back-rank setup according to Reinhard Scharnagl's algorithm.
 * Guarantees:
 * 1. Bishops are on opposite colored squares.
 * 2. King is positioned strictly between the two Rooks.
 * 3. Exact count: 1 King, 1 Queen, 2 Rooks, 2 Knights, 2 Bishops.
 */
export function generateChess960BackRank(seedIndex?: number): Chess960Setup {
  const index = typeof seedIndex === 'number' && seedIndex >= 0 && seedIndex < 960
    ? seedIndex
    : Math.floor(Math.random() * 960);

  const backRank: (string | null)[] = Array(8).fill(null);

  // 1. Place Light-Square Bishop on one of 4 light squares: 1, 3, 5, 7
  const b1 = index % 4;
  const lightBishopFile = 2 * b1 + 1;
  backRank[lightBishopFile] = 'B';

  // 2. Place Dark-Square Bishop on one of 4 dark squares: 0, 2, 4, 6
  const b2 = Math.floor(index / 4) % 4;
  const darkBishopFile = 2 * b2;
  backRank[darkBishopFile] = 'B';

  // 3. Place Queen on one of the 6 remaining empty squares
  const q = Math.floor(index / 16) % 6;
  let emptyCount = 0;
  for (let i = 0; i < 8; i++) {
    if (backRank[i] === null) {
      if (emptyCount === q) {
        backRank[i] = 'Q';
        break;
      }
      emptyCount++;
    }
  }

  // 4. Place Knights on two of the 5 remaining empty squares
  const knTable: readonly [number, number][] = [
    [0, 1], [0, 2], [0, 3], [0, 4],
    [1, 2], [1, 3], [1, 4],
    [2, 3], [2, 4],
    [3, 4],
  ];
  const knIndex = Math.floor(index / 96);
  const [kn1, kn2] = knTable[knIndex];

  const emptyIndices: number[] = [];
  for (let i = 0; i < 8; i++) {
    if (backRank[i] === null) emptyIndices.push(i);
  }

  backRank[emptyIndices[kn1]] = 'N';
  backRank[emptyIndices[kn2]] = 'N';

  // 5. Place remaining pieces: Rook, King, Rook in the remaining 3 empty squares
  const remainingEmpty: number[] = [];
  for (let i = 0; i < 8; i++) {
    if (backRank[i] === null) remainingEmpty.push(i);
  }

  backRank[remainingEmpty[0]] = 'R';
  backRank[remainingEmpty[1]] = 'K';
  backRank[remainingEmpty[2]] = 'R';

  const pieces = backRank as string[];
  const whiteRank = pieces.join('');
  const blackRank = pieces.map((p) => p.toLowerCase()).join('');

  const fen = `${blackRank}/pppppppp/8/8/8/8/PPPPPPPP/${whiteRank} w KQkq - 0 1`;

  return {
    scharnaglIndex: index,
    backRankPieces: pieces,
    fen,
  };
}

/**
 * Validates whether a back rank array conforms to Chess960 rules.
 */
export function validateChess960BackRank(pieces: readonly string[]): boolean {
  if (pieces.length !== 8) return false;

  const count = (p: string) => pieces.filter((x) => x.toUpperCase() === p).length;
  if (count('K') !== 1 || count('Q') !== 1 || count('R') !== 2 || count('B') !== 2 || count('N') !== 2) {
    return false;
  }

  // Check Bishops on opposite colors
  const bishopIndices: number[] = [];
  for (let i = 0; i < 8; i++) {
    if (pieces[i].toUpperCase() === 'B') bishopIndices.push(i);
  }
  if (bishopIndices.length !== 2) return false;
  if (bishopIndices[0] % 2 === bishopIndices[1] % 2) return false; // Both same color square

  // Check King between Rooks
  const rookIndices: number[] = [];
  let kingIndex = -1;
  for (let i = 0; i < 8; i++) {
    if (pieces[i].toUpperCase() === 'R') rookIndices.push(i);
    if (pieces[i].toUpperCase() === 'K') kingIndex = i;
  }
  if (rookIndices.length !== 2 || kingIndex === -1) return false;
  if (!(rookIndices[0] < kingIndex && kingIndex < rookIndices[1])) return false;

  return true;
}
