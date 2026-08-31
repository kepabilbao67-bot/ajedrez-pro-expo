import { describe, expect, it, vi } from 'vitest';
import { PostGamePanel, type PostGameSummaryData } from '../post-game-panel';
import { createPostGameSummary } from '@/ai/coach/post-game-summary';
import type { GameStatus } from '@/chess';
import type { GameAnalysis } from '@/ai/coach/coach-types';

vi.mock('react-native', () => {
  return {
    View: (props: any) => ({ type: 'View', props }),
    Text: (props: any) => ({ type: 'Text', props }),
    Pressable: (props: any) => ({ type: 'Pressable', props }),
    StyleSheet: {
      create: (styles: any) => styles,
    },
  };
});

describe('PostGamePanel Component & Analysis Logic', () => {
  const defaultGameOverStatus: GameStatus = {
    gameOver: true,
    checkmate: true,
    stalemate: false,
    draw: false,
    drawReason: null,
    check: true,
    winner: 'w',
  };

  const defaultOngoingStatus: GameStatus = {
    gameOver: false,
    checkmate: false,
    stalemate: false,
    draw: false,
    drawReason: null,
    check: false,
    winner: null,
  };

  it('renders null when game is ongoing', () => {
    const result = PostGamePanel({
      status: defaultOngoingStatus,
      postGameSummary: null,
    });
    expect(result).toBeNull();
  });

  it('renders without errors and avoids fake metrics when postGameSummary is null', () => {
    const element = PostGamePanel({
      status: defaultGameOverStatus,
      postGameSummary: null,
    });

    expect(element).not.toBeNull();
    const stringified = JSON.stringify(element);
    expect(stringified).toContain('--%');
    expect(stringified).toContain('No se ha generado análisis posicional.');
    expect(stringified).not.toContain('APRENDE DE TUS ERRORES');
  });

  it('hides retry button when there are no blunders or inaccuracies', () => {
    const cleanSummary: PostGameSummaryData = {
      bestMove: 'Excelente juego de apertura.',
      worstError: 'No se detectó un error crítico.',
      learning: 'Gran partida.',
      accuracy: 98,
      totalMoves: 25,
      blunders: 0,
      inaccuracies: 0,
      bestMovesCount: 25,
      brilliantMovesCount: 1,
    };

    const element = PostGamePanel({
      status: defaultGameOverStatus,
      postGameSummary: cleanSummary,
      onRetryMistakes: vi.fn(),
    });

    const stringified = JSON.stringify(element);
    expect(stringified).toContain('98%');
    expect(stringified).not.toContain('APRENDE DE TUS ERRORES');
  });

  it('shows retry button when mistakes exist and callback is passed', () => {
    const mistakeSummary: PostGameSummaryData = {
      bestMove: 'Había una mejor opción con Nf3.',
      worstError: 'Pérdida de dama en jugada 12.',
      learning: 'Protege tus piezas antes de lanzarte al ataque.',
      accuracy: 65,
      totalMoves: 30,
      blunders: 2,
      inaccuracies: 1,
      bestMovesCount: 20,
      brilliantMovesCount: 0,
    };

    const onRetry = vi.fn();
    const element = PostGamePanel({
      status: defaultGameOverStatus,
      postGameSummary: mistakeSummary,
      onRetryMistakes: onRetry,
    });

    const stringified = JSON.stringify(element);
    expect(stringified).toContain('65%');
    expect(stringified).toContain('APRENDE DE TUS ERRORES');
  });

  it('createPostGameSummary correctly computes accuracy without external API or hallucinated data', () => {
    const analysis: GameAnalysis = {
      mistakes: [
        {
          moveNumber: 4,
          san: 'f3',
          severity: 'blunder',
          evaluationChange: -3.5,
          recommendedMove: { from: 'g1', to: 'f3' },
          explanation: 'Debilita el enroque',
        },
      ],
      inaccuracies: [
        {
          moveNumber: 2,
          san: 'a3',
          severity: 'inaccuracy',
          evaluationChange: -0.6,
          recommendedMove: { from: 'd2', to: 'd4' },
          explanation: 'Jugada lenta',
        },
      ],
      missedOpportunities: [],
      criticalMoment: {
        moveNumber: 4,
        san: 'f3',
        severity: 'blunder',
        evaluationChange: -3.5,
        recommendedMove: { from: 'g1', to: 'f3' },
        explanation: 'Error en f3',
      },
      summary: 'Partida analizada localmente.',
    };

    const summary = createPostGameSummary(analysis, 10);
    expect(summary.blunders).toBe(1);
    expect(summary.inaccuracies).toBe(1);
    expect(summary.accuracy).toBe(100 - 10 - 3); // 87%
    expect(summary.brilliantMovesCount).toBe(1);
  });
});
