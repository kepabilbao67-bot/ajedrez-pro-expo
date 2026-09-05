import { describe, expect, it } from 'vitest';
import {
  GAME_END_CATALOG,
  getRandomEndMessage,
  resolveGameEndConfig,
  type GameEndReason,
} from './gameEndMessages';
import type { GameStatus } from '@/chess';

describe('Game End Messages Architecture & Catalog', () => {
  const ALL_REASONS: GameEndReason[] = [
    'checkmate-win',
    'checkmate-loss',
    'stalemate',
    'insufficient-material',
    'threefold-repetition',
    'fifty-move',
    'draw-general',
    'resignation-win',
    'resignation-loss',
    'timeout-win',
    'timeout-loss',
    'three-check-win',
    'three-check-loss',
    'koth-win',
    'koth-loss',
  ];

  it('contains valid message collections for all 15 distinct scenarios', () => {
    for (const reason of ALL_REASONS) {
      const config = GAME_END_CATALOG[reason];
      expect(config).toBeDefined();
      expect(config.title.length).toBeGreaterThan(0);
      expect(config.subtitle.length).toBeGreaterThan(0);
      expect(config.icon.length).toBeGreaterThan(0);
      expect(config.messages.length).toBeGreaterThanOrEqual(3);
      for (const msg of config.messages) {
        expect(msg.length).toBeGreaterThan(5);
      }
    }
  });

  it('generates random non-empty messages from the catalog', () => {
    for (const reason of ALL_REASONS) {
      const msg = getRandomEndMessage(reason);
      expect(msg.length).toBeGreaterThan(0);
      expect(GAME_END_CATALOG[reason].messages).toContain(msg);
    }
  });

  it('resolves checkmate victory when player is white and white wins', () => {
    const status: GameStatus = {
      check: true,
      checkmate: true,
      stalemate: false,
      draw: false,
      drawReason: null,
      gameOver: true,
      winner: 'w',
    };
    const resolved = resolveGameEndConfig({ status, playerColor: 'w' });
    expect(resolved.reason).toBe('checkmate-win');
    expect(resolved.outcome).toBe('win');
    expect(resolved.score).toBe('1-0');
    expect(resolved.title).toBe('¡Victoria!');
  });

  it('resolves checkmate defeat when player is white and black wins', () => {
    const status: GameStatus = {
      check: true,
      checkmate: true,
      stalemate: false,
      draw: false,
      drawReason: null,
      gameOver: true,
      winner: 'b',
    };
    const resolved = resolveGameEndConfig({ status, playerColor: 'w' });
    expect(resolved.reason).toBe('checkmate-loss');
    expect(resolved.outcome).toBe('loss');
    expect(resolved.score).toBe('0-1');
    expect(resolved.title).toBe('Fin de la partida');
  });

  it('resolves checkmate victory when player is black and black wins', () => {
    const status: GameStatus = {
      check: true,
      checkmate: true,
      stalemate: false,
      draw: false,
      drawReason: null,
      gameOver: true,
      winner: 'b',
    };
    const resolved = resolveGameEndConfig({ status, playerColor: 'b' });
    expect(resolved.reason).toBe('checkmate-win');
    expect(resolved.outcome).toBe('win');
    expect(resolved.score).toBe('0-1');
  });

  it('resolves stalemate correctly', () => {
    const status: GameStatus = {
      check: false,
      checkmate: false,
      stalemate: true,
      draw: true,
      drawReason: 'stalemate',
      gameOver: true,
      winner: null,
    };
    const resolved = resolveGameEndConfig({ status });
    expect(resolved.reason).toBe('stalemate');
    expect(resolved.outcome).toBe('draw');
    expect(resolved.score).toBe('½-½');
    expect(resolved.subtitle).toBe('Rey ahogado.');
  });

  it('resolves insufficient material correctly', () => {
    const status: GameStatus = {
      check: false,
      checkmate: false,
      stalemate: false,
      draw: true,
      drawReason: 'insufficient-material',
      gameOver: true,
      winner: null,
    };
    const resolved = resolveGameEndConfig({ status });
    expect(resolved.reason).toBe('insufficient-material');
    expect(resolved.outcome).toBe('draw');
    expect(resolved.score).toBe('½-½');
    expect(resolved.subtitle).toBe('Material insuficiente.');
  });

  it('resolves threefold repetition correctly', () => {
    const status: GameStatus = {
      check: false,
      checkmate: false,
      stalemate: false,
      draw: true,
      drawReason: 'threefold-repetition',
      gameOver: true,
      winner: null,
    };
    const resolved = resolveGameEndConfig({ status });
    expect(resolved.reason).toBe('threefold-repetition');
    expect(resolved.outcome).toBe('draw');
    expect(resolved.score).toBe('½-½');
    expect(resolved.subtitle).toBe('Triple repetición.');
  });

  it('resolves fifty-move rule correctly', () => {
    const status: GameStatus = {
      check: false,
      checkmate: false,
      stalemate: false,
      draw: true,
      drawReason: 'fifty-move',
      gameOver: true,
      winner: null,
    };
    const resolved = resolveGameEndConfig({ status });
    expect(resolved.reason).toBe('fifty-move');
    expect(resolved.outcome).toBe('draw');
    expect(resolved.score).toBe('½-½');
    expect(resolved.subtitle).toBe('Regla de los 50 movimientos.');
  });

  it('resolves manual resignation and timeout reasons', () => {
    const status: GameStatus = {
      check: false,
      checkmate: false,
      stalemate: false,
      draw: false,
      drawReason: null,
      gameOver: true,
      winner: 'b',
    };
    const resignLoss = resolveGameEndConfig({ status, manualReason: 'resignation-loss', playerColor: 'w' });
    expect(resignLoss.reason).toBe('resignation-loss');
    expect(resignLoss.subtitle).toBe('Te has rendido.');

    const resignWin = resolveGameEndConfig({ status, manualReason: 'resignation-win', playerColor: 'w' });
    expect(resignWin.reason).toBe('resignation-win');
    expect(resignWin.subtitle).toBe('El rival se ha rendido.');

    const timeoutWin = resolveGameEndConfig({ status, manualReason: 'timeout-win', playerColor: 'w' });
    expect(timeoutWin.reason).toBe('timeout-win');
    expect(timeoutWin.subtitle).toBe('Al rival se le acabó el tiempo.');

    const timeoutLoss = resolveGameEndConfig({ status, manualReason: 'timeout-loss', playerColor: 'w' });
    expect(timeoutLoss.reason).toBe('timeout-loss');
    expect(timeoutLoss.subtitle).toBe('Se acabó tu tiempo.');
  });
});
