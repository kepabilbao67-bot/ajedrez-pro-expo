import { Platform } from 'react-native';
import type { AiEngine } from './engine-adapter';
import { FallbackAiEngine } from './fallback-engine';
import { StockfishEngine } from './stockfish-engine';

export function createAiEngine(): AiEngine {
  if (Platform.OS === 'web') {
    return new StockfishEngine();
  }
  return new FallbackAiEngine();
}
