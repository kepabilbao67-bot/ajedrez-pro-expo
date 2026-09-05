import { describe, expect, it } from 'vitest';
import { ChessGame, algebraicToSquare } from '../chess';
import {
  processThreeCheckMove,
  checkKingOfTheHillOutcome,
  createInitialThreeCheckState,
  KOTH_CENTER_SQUARES,
  type ThreeCheckState,
} from './variant-referee';

describe('Variant Integration — Three-Check Flow', () => {
  it('delivers Check 1, Check 2, and Check 3 leading to immediate Three-Check victory', () => {
    let threeCheckState: ThreeCheckState = createInitialThreeCheckState();
    expect(threeCheckState.whiteChecksGiven).toBe(0);
    expect(threeCheckState.blackChecksGiven).toBe(0);

    // Setup a game to deliver 3 consecutive checks
    // 1. e4 e5 2. Qh5 (no check) Ke7 3. Qxe5# is mate, but let's do 3 non-mate checks:
    // Game:
    // 1. e4 d5
    // 2. Bb5+ (Check 1) -> c6
    // 3. Bxc6+ (Check 2) -> Nxc6
    // 4. Qh5 Nf6
    // 5. Qxf7+ (Check 3) -> 3-Check Win!
    const game = ChessGame.initial();

    // 1. e4 d5
    game.move({ from: algebraicToSquare('e2')!, to: algebraicToSquare('e4')! });
    game.move({ from: algebraicToSquare('d7')!, to: algebraicToSquare('d5')! });

    // 2. Bb5+ (Check 1)
    const move1 = game.move({ from: algebraicToSquare('f1')!, to: algebraicToSquare('b5')! });
    expect(move1).not.toBeNull();
    const res1 = processThreeCheckMove(threeCheckState, game.getPosition(), 'w');
    threeCheckState = res1.nextState;
    expect(threeCheckState.whiteChecksGiven).toBe(1);
    expect(res1.outcome.isGameOver).toBe(false);

    // 2... c6
    game.move({ from: algebraicToSquare('c7')!, to: algebraicToSquare('c6')! });

    // 3. Bxc6+ (Check 2)
    const move2 = game.move({ from: algebraicToSquare('b5')!, to: algebraicToSquare('c6')! });
    expect(move2).not.toBeNull();
    const res2 = processThreeCheckMove(threeCheckState, game.getPosition(), 'w');
    threeCheckState = res2.nextState;
    expect(threeCheckState.whiteChecksGiven).toBe(2);
    expect(res2.outcome.isGameOver).toBe(false);

    // 3... Nxc6
    game.move({ from: algebraicToSquare('b8')!, to: algebraicToSquare('c6')! });

    // 4. Qh5 Nf6
    game.move({ from: algebraicToSquare('d1')!, to: algebraicToSquare('h5')! });
    game.move({ from: algebraicToSquare('g8')!, to: algebraicToSquare('f6')! });

    // 5. Qxf7+ (Check 3)
    const move3 = game.move({ from: algebraicToSquare('h5')!, to: algebraicToSquare('f7')! });
    expect(move3).not.toBeNull();
    const res3 = processThreeCheckMove(threeCheckState, game.getPosition(), 'w');
    threeCheckState = res3.nextState;
    expect(threeCheckState.whiteChecksGiven).toBe(3);
    expect(res3.outcome.isGameOver).toBe(true);
    expect(res3.outcome.reason).toBe('three_check');
    expect(res3.outcome.winner).toBe('w');
  });

  it('delivers standard checkmate before 3rd check and triggers normal mate victory', () => {
    let threeCheckState: ThreeCheckState = createInitialThreeCheckState();

    // Scholar's Mate (1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#)
    const game = ChessGame.initial();
    game.move({ from: algebraicToSquare('e2')!, to: algebraicToSquare('e4')! });
    game.move({ from: algebraicToSquare('e7')!, to: algebraicToSquare('e5')! });
    game.move({ from: algebraicToSquare('f1')!, to: algebraicToSquare('c4')! });
    game.move({ from: algebraicToSquare('b8')!, to: algebraicToSquare('c6')! });
    game.move({ from: algebraicToSquare('d1')!, to: algebraicToSquare('h5')! });
    game.move({ from: algebraicToSquare('g8')!, to: algebraicToSquare('f6')! });

    // 4. Qxf7# (Checkmate on 1st check!)
    const mateRecord = game.move({ from: algebraicToSquare('h5')!, to: algebraicToSquare('f7')! });
    expect(mateRecord).not.toBeNull();
    expect(game.status().checkmate).toBe(true);

    const res = processThreeCheckMove(threeCheckState, game.getPosition(), 'w');
    expect(res.nextState.whiteChecksGiven).toBe(1);
    expect(res.outcome.isGameOver).toBe(true);
    expect(res.outcome.reason).toBe('checkmate');
    expect(res.outcome.winner).toBe('w');
  });
});

describe('Variant Integration — King of the Hill (KotH) Flow', () => {
  it('detects KotH victory when legal king move reaches d4, e4, d5, or e5', () => {
    // Custom position with white king on e3, white pawn on e2 and open center
    // 8/8/8/8/8/4K3/4P3/4k3 w - - 0 1
    const game = new ChessGame('8/8/8/8/8/4K3/4P3/4k3 w - - 0 1');

    // King moves from e3 to e4 (center square: index 36)
    const kingFrom = algebraicToSquare('e3')!;
    const kingTo = algebraicToSquare('e4')!;
    expect(KOTH_CENTER_SQUARES.includes(kingTo)).toBe(true);

    const record = game.move({ from: kingFrom, to: kingTo });
    expect(record).not.toBeNull();

    const outcome = checkKingOfTheHillOutcome(game.getPosition(), record!.move);
    expect(outcome.isGameOver).toBe(true);
    expect(outcome.reason).toBe('king_of_the_hill');
    expect(outcome.winner).toBe('w');
    expect(outcome.description).toContain('colina central');
  });

  it('does NOT trigger KotH when king moves to non-center square', () => {
    const game = new ChessGame('8/8/8/8/8/4K3/4P3/4k3 w - - 0 1');

    // King moves from e3 to f3 (not a center square)
    const kingFrom = algebraicToSquare('e3')!;
    const kingTo = algebraicToSquare('f3')!;
    expect(KOTH_CENTER_SQUARES.includes(kingTo)).toBe(false);

    const record = game.move({ from: kingFrom, to: kingTo });
    expect(record).not.toBeNull();

    const outcome = checkKingOfTheHillOutcome(game.getPosition(), record!.move);
    expect(outcome.isGameOver).toBe(false);
    expect(outcome.winner).toBeNull();
  });

  it('rejects illegal king moves or moves into check, preventing invalid KotH win', () => {
    // White king on e3, Black rook on e8 covering e4 and e5
    // 4r3/8/8/8/8/4K3/4P3/7k w - - 0 1
    const game = new ChessGame('4r3/8/8/8/8/4K3/4P3/7k w - - 0 1');

    const kingFrom = algebraicToSquare('e3')!;
    const kingToE4 = algebraicToSquare('e4')!; // Covered by rook on e8 -> illegal move into check!

    // The move must be rejected by the chess engine
    const record = game.move({ from: kingFrom, to: kingToE4 });
    expect(record).toBeNull(); // Illegal move!

    // Position remains unchanged
    expect(game.getPosition().board[kingFrom]).toBe('K');
  });
});

describe('Variant State Reset — Three-Check', () => {
  it('resets check counter to 0/0 when starting a new game', () => {
    let state = createInitialThreeCheckState();
    // Simulate game with previous 2/3 checks
    state = { whiteChecksGiven: 2, blackChecksGiven: 1 };
    expect(state.whiteChecksGiven).toBe(2);
    expect(state.blackChecksGiven).toBe(1);

    // Starting new game invokes createInitialThreeCheckState()
    const newState = createInitialThreeCheckState();
    expect(newState.whiteChecksGiven).toBe(0);
    expect(newState.blackChecksGiven).toBe(0);
  });
});

describe('Variants Selector — Configuration & Playability Guards', () => {
  it('allows playing Three-Check and King of the Hill (playable = true)', async () => {
    const { getVariantById } = await import('./variants-catalog');
    const threeCheck = getVariantById('three_check');
    const koth = getVariantById('king_of_the_hill');

    expect(threeCheck?.isImplemented).toBe(true);
    expect(koth?.isImplemented).toBe(true);
  });

  it('marks Chess960, Crazyhouse, Atomic, and Horde as coming soon (isImplemented = false)', async () => {
    const { getVariantById } = await import('./variants-catalog');
    const c960 = getVariantById('chess960');
    const crazy = getVariantById('crazyhouse');
    const atomic = getVariantById('atomic');
    const horde = getVariantById('horde');

    expect(c960?.isImplemented).toBe(false);
    expect(crazy?.isImplemented).toBe(false);
    expect(atomic?.isImplemented).toBe(false);
    expect(horde?.isImplemented).toBe(false);
  });
});
