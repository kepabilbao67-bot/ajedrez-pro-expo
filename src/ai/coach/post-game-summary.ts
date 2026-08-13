import type { GameAnalysis } from './coach-types';

export interface PostGameSummary { bestMove: string; worstError: string; learning: string; }
export function createPostGameSummary(analysis: GameAnalysis): PostGameSummary {
  const critical = analysis.criticalMoment;
  return {
    bestMove: analysis.missedOpportunities[0]?.recommendedMove ? 'Había una jugada más precisa disponible.' : 'Tus jugadas mantuvieron el plan de la posición.',
    worstError: critical ? critical.explanation : 'No se detectó un error crítico.',
    learning: critical ? 'Antes de atacar, desarrolla tus piezas y revisa amenazas rivales.' : 'Mantén la coordinación de tus piezas y consolida tus ventajas.',
  };
}
