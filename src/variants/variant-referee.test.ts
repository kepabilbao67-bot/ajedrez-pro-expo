import { describe, expect, it } from 'vitest';
import { parseFen } from '../chess/fen';
import { applyMove } from '../chess/moves';
import {
  KOTH_CENTER_SQUARES,
  checkKingOfTheHillOutcome,
  createInitialThreeCheckState,
  processThreeCheckMove,
  generateChess960BackRank,
  validateChess960BackRank,
} from './variant-referee';
import type { Move } from '../chess/types';

describe('Variant Referee: King of the Hill', () => {
  it('identifies the 4 center squares (d4, e4, d5, e5)', () => {
    expect(KOTH_CENTER_SQUARES).toHaveLength(4);
    expect(KOTH_CENTER_SQUARES).toEqual([27, 28, 35, 36]);
  });

  it('triggers immediate victory when white King enters center square e4', () => {
    // Position with White King on e3 moving to e4, Black King on a8
    const fen = 'k7/8/8/8/8/4K3/8/8 w - - 0 1';
    const position = parseFen(fen);
    const move: Move = { from: 44, to: 36 }; // e3 (44) -> e4 (36)
    const nextPosition = applyMove(position, move);

    const outcome = checkKingOfTheHillOutcome(nextPosition, move);
    expect(outcome.isGameOver).toBe(true);
    expect(outcome.winner).toBe('w');
    expect(outcome.reason).toBe('king_of_the_hill');
  });

  it('does NOT trigger victory when a pawn enters center square e4', () => {
    // Position with White Pawn on e2 moving to e4, White King on e1, Black King on e8
    const fen = '4k3/8/8/8/8/8/4P3/4K3 w - - 0 1';
    const position = parseFen(fen);
    const move: Move = { from: 52, to: 36 }; // e2 (52) -> e4 (36)
    const nextPosition = applyMove(position, move);

    const outcome = checkKingOfTheHillOutcome(nextPosition, move);
    expect(outcome.isGameOver).toBe(false);
    expect(outcome.winner).toBeNull();
  });

  it('triggers victory when black King enters d5', () => {
    const fen = '8/8/4k3/8/8/8/8/4K3 b - - 0 1';
    const position = parseFen(fen);
    const move: Move = { from: 20, to: 27 }; // e6 (20) -> d5 (27)
    const nextPosition = applyMove(position, move);

    const outcome = checkKingOfTheHillOutcome(nextPosition, move);
    expect(outcome.isGameOver).toBe(true);
    expect(outcome.winner).toBe('b');
    expect(outcome.reason).toBe('king_of_the_hill');
  });
});

describe('Variant Referee: Three-Check', () => {
  it('initializes with 0 checks for both players', () => {
    const state = createInitialThreeCheckState();
    expect(state.whiteChecksGiven).toBe(0);
    expect(state.blackChecksGiven).toBe(0);
  });

  it('increments check counter when a move gives check', () => {
    let state = createInitialThreeCheckState();
    // White Rook on e1 checks Black King on e8 (White King on a1)
    const fen = '4k3/8/8/8/8/8/8/R3K3 w - - 0 1';
    const pos = parseFen(fen);
    const move: Move = { from: 56, to: 60 }; // a1 -> e1
    const nextPos = applyMove(pos, move);

    const result = processThreeCheckMove(state, nextPos, 'w');
    expect(result.nextState.whiteChecksGiven).toBe(1);
    expect(result.nextState.blackChecksGiven).toBe(0);
    expect(result.outcome.isGameOver).toBe(false);
  });

  it('triggers immediate victory when player delivers 3rd check', () => {
    const state = { whiteChecksGiven: 2, blackChecksGiven: 1 };
    // White delivers 3rd check
    const fen = '4k3/8/8/8/8/8/8/R3K3 w - - 0 1';
    const pos = parseFen(fen);
    const move: Move = { from: 56, to: 60 };
    const nextPos = applyMove(pos, move);

    const result = processThreeCheckMove(state, nextPos, 'w');
    expect(result.nextState.whiteChecksGiven).toBe(3);
    expect(result.outcome.isGameOver).toBe(true);
    expect(result.outcome.winner).toBe('w');
    expect(result.outcome.reason).toBe('three_check');
  });
});

describe('Variant Referee: Chess960 (Fischer Random)', () => {
  it('generates standard classic layout for Scharnagl index 518', () => {
    const standard = generateChess960BackRank(518);
    expect(standard.backRankPieces).toEqual(['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']);
    expect(validateChess960BackRank(standard.backRankPieces)).toBe(true);
  });

  it('generates all 960 positions satisfying strict Fischer Random constraints', () => {
    for (let i = 0; i < 960; i++) {
      const setup = generateChess960BackRank(i);
      expect(setup.scharnaglIndex).toBe(i);
      expect(validateChess960BackRank(setup.backRankPieces)).toBe(true);
      expect(setup.fen).toMatch(/^[RNBQKPrnbqkp1-8/]+ w KQkq - 0 1$/);
    }
  });

  it('rejects invalid back rank setups with bishops on same color or king not between rooks', () => {
    // Both bishops on light squares (files 1 and 3)
    expect(validateChess960BackRank(['R', 'B', 'N', 'B', 'Q', 'K', 'N', 'R'])).toBe(false);

    // King not between rooks (King on file 0, Rooks on files 4 and 7)
    expect(validateChess960BackRank(['K', 'N', 'B', 'Q', 'R', 'B', 'N', 'R'])).toBe(false);

    // Wrong piece counts (3 rooks, 1 bishop)
    expect(validateChess960BackRank(['R', 'R', 'B', 'Q', 'K', 'R', 'N', 'N'])).toBe(false);
  });
});
