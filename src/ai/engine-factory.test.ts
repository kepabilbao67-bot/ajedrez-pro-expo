import { describe, test, expect, vi, beforeEach } from 'vitest';
import { Platform } from 'react-native';
import { createAiEngine } from './engine-factory';
import { StockfishEngine } from './stockfish-engine';
import { FallbackAiEngine } from './fallback-engine';
import { ChessGame } from '../chess';
import { AiCancelledError } from './errors';

vi.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

describe('Engine Factory', () => {
  beforeEach(() => {
    Platform.OS = 'web';
  });

  test('1. Web selecciona StockfishEngine', () => {
    Platform.OS = 'web';
    const engine = createAiEngine();
    expect(engine instanceof StockfishEngine).toBe(true);
  });

  test('2. Android selecciona FallbackAiEngine', () => {
    Platform.OS = 'android';
    const engine = createAiEngine();
    expect(engine instanceof FallbackAiEngine).toBe(true);
  });

  test('3. iOS selecciona FallbackAiEngine', () => {
    Platform.OS = 'ios';
    const engine = createAiEngine();
    expect(engine instanceof FallbackAiEngine).toBe(true);
  });

  test('4. El motor seleccionado implementa AiEngine', () => {
    Platform.OS = 'web';
    const engineWeb = createAiEngine();
    expect(engineWeb.analyze).toBeDefined();
    expect(engineWeb.id).toBeDefined();
    
    Platform.OS = 'android';
    const engineAndroid = createAiEngine();
    expect(engineAndroid.analyze).toBeDefined();
    expect(engineAndroid.id).toBeDefined();
  });
});

describe('FallbackAiEngine Integration', () => {
  test('5. Una jugada negra legal puede generarse y aplicarse con el fallback', async () => {
    const engine = new FallbackAiEngine();
    const game = new ChessGame();
    
    // Juega blancas (e4)
    game.move({ from: 'e2', to: 'e4' });
    
    // Analiza para negras
    const analysis = await engine.analyze({
      fen: game.fen(),
      difficulty: 1,
      limits: { depth: 1 },
      playStyle: 'Balanced',
    });
    
    expect(analysis.bestMove).toBeDefined();
    expect(analysis.bestMove).not.toBeNull();
    
    // Aplicar la jugada
    const record = game.move({ 
      from: analysis.bestMove!.from, 
      to: analysis.bestMove!.to, 
      promotion: analysis.bestMove!.promotion 
    });
    expect(record).not.toBeNull();
  });

  test('6. La cancelación mediante AbortSignal continúa funcionando', async () => {
    const engine = new FallbackAiEngine();
    const game = new ChessGame();
    const controller = new AbortController();
    
    controller.abort(); // Cancelar inmediatamente
    
    await expect(engine.analyze({
      fen: game.fen(),
      difficulty: 3,
      limits: { depth: 3 },
      playStyle: 'Balanced',
      signal: controller.signal,
    })).rejects.toThrow(AiCancelledError);
  });
});
