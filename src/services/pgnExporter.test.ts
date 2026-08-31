import { describe, expect, it } from 'vitest';
import { exportGameToPgn, parsePgn, MASTER_GAMES } from './pgnExporter';
import type { MoveRecord } from '@/chess';

describe('PGN Exporter and Parser', () => {
  it('exports game with standard FIDE headers and numbered moves correctly', () => {
    const mockHistory: MoveRecord[] = [
      {
        move: { from: 52, to: 36 },
        san: 'e4',
        fenBefore: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        fenAfter: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      },
      {
        move: { from: 12, to: 28 },
        san: 'e5',
        fenBefore: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        fenAfter: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
      },
      {
        move: { from: 62, to: 45 },
        san: 'Nf3',
        fenBefore: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
        fenAfter: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
      },
      {
        move: { from: 1, to: 18 },
        san: 'Nc6',
        fenBefore: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
        fenAfter: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
      },
    ];

    const pgn = exportGameToPgn({
      history: mockHistory,
      status: {
        gameOver: false,
        check: false,
        checkmate: false,
        stalemate: false,
        draw: false,
        drawReason: null,
        winner: null,
      },
      white: 'Jugador 1',
      black: 'Stockfish 18',
      eco: 'C44',
      opening: 'Apertura de Peón de Rey',
    });

    expect(pgn).toContain('[Event "Partida Amistosa"]');
    expect(pgn).toContain('[White "Jugador 1"]');
    expect(pgn).toContain('[Black "Stockfish 18"]');
    expect(pgn).toContain('[ECO "C44"]');
    expect(pgn).toContain('1. e4 e5 2. Nf3 Nc6');
  });

  it('parses master games correctly without losing moves', () => {
    const operaGame = MASTER_GAMES[0];
    const parsed = parsePgn(operaGame.pgn);

    expect(parsed.headers.White).toBe('Paul Morphy');
    expect(parsed.headers.Result).toBe('1-0');
    expect(parsed.moves.length).toBeGreaterThanOrEqual(30);
    expect(parsed.moves[0]).toBe('e4');
    expect(parsed.moves[1]).toBe('e5');
    expect(parsed.moves[parsed.moves.length - 1]).toBe('Rd8#');
  });

  it('parses Kasparov Immortal game accurately', () => {
    const kasparovGame = MASTER_GAMES[3];
    const parsed = parsePgn(kasparovGame.pgn);

    expect(parsed.headers.White).toBe('Garry Kasparov');
    expect(parsed.headers.Black).toBe('Veselin Topalov');
    expect(parsed.result).toBe('1-0');
    expect(parsed.moves.length).toBeGreaterThanOrEqual(80);
  });
});
