import { describe, expect, it } from 'vitest';
import { getOpeningMove, OPENING_BOOK } from './opening-book';

describe('Opening Book', () => {
  it('should return a valid move for the initial position', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const move = getOpeningMove(fen);
    expect(move).toBeDefined();
    expect(typeof move).toBe('string');
    expect(OPENING_BOOK[fen]).toContain(move);
  });

  it('should return null for an unknown position', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RN1QKBNR w KQkq - 0 1'; // random invalid
    const move = getOpeningMove(fen);
    expect(move).toBeNull();
  });
});
