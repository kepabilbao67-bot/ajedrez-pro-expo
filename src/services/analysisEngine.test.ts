import { describe, expect, it } from 'vitest';
import { AnalysisEngine } from './analysisEngine';

describe('AnalysisEngine Service', () => {
  const engine = AnalysisEngine.getInstance();

  it('evaluates starting position near equality (around 50% win probability)', async () => {
    const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const result = await engine.evaluatePosition(startFen, 1);

    expect(result.whiteWinProbability).toBeGreaterThanOrEqual(40);
    expect(result.whiteWinProbability).toBeLessThanOrEqual(60);
    expect(result.isMate).toBe(false);
    expect(typeof result.formatted).toBe('string');
  });

  it('detects checkmate positions accurately', async () => {
    // Scholar's mate delivered by White
    const mateFen = 'r1bqkb1r/pppp1Qpp/2n5/4p3/2B1n3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4';
    const result = await engine.evaluatePosition(mateFen, 1);

    expect(result.isMate).toBe(true);
    expect(result.whiteWinProbability).toBe(100);
    expect(result.formatted).toBe('#M0');
  });

  it('evaluates draw/stalemate positions safely returning 50% and 0.0', async () => {
    const stalemateFen = 'k7/8/1Q6/8/8/8/8/7K b - - 0 1';
    const result = await engine.evaluatePosition(stalemateFen, 1);

    expect(result.isMate).toBe(false);
    expect(result.whiteWinProbability).toBe(50);
    expect(result.formatted).toBe('0.0');
    expect(result.scoreCp).toBe(0);
  });

  it('calculates win percentage with logistic formula strictly within safe bounds [0, 100]', () => {
    expect(engine.calculateWinPercentage(0)).toBe(50);
    expect(engine.calculateWinPercentage(300)).toBeGreaterThan(70);
    expect(engine.calculateWinPercentage(-300)).toBeLessThan(30);
    expect(engine.calculateWinPercentage(100000)).toBe(100);
    expect(engine.calculateWinPercentage(-100000)).toBe(0);
    expect(engine.calculateWinPercentage(999999)).toBeLessThanOrEqual(100);
    expect(engine.calculateWinPercentage(-999999)).toBeGreaterThanOrEqual(0);
  });

  it('classifies moves correctly across spectrum (brilliant, best, inaccuracy, mistake, blunder)', () => {
    const brilliant = engine.classifyMove(5, { isSacrifice: true });
    expect(brilliant.classification).toBe('brilliant');
    expect(brilliant.symbol).toBe('💎');

    const best = engine.classifyMove(10);
    expect(best.classification).toBe('best');
    expect(best.symbol).toBe('🟢');
    expect(best.explanation).toContain('evaluación local');

    const excellent = engine.classifyMove(35);
    expect(excellent.classification).toBe('excellent');
    expect(excellent.symbol).toBe('🔵');

    const inaccuracy = engine.classifyMove(70, { recommendedMoveSan: 'Nf3' });
    expect(inaccuracy.classification).toBe('inaccuracy');
    expect(inaccuracy.symbol).toBe('🟡');
    expect(inaccuracy.explanation).toContain('Nf3');

    const mistake = engine.classifyMove(150, { recommendedMoveSan: 'd4' });
    expect(mistake.classification).toBe('mistake');
    expect(mistake.symbol).toBe('🟠');
    expect(mistake.explanation).toContain('d4');

    const blunder = engine.classifyMove(350, { recommendedMoveSan: 'Qxd8' });
    expect(blunder.classification).toBe('blunder');
    expect(blunder.symbol).toBe('🔴');
    expect(blunder.explanation).toContain('Qxd8');
  });

  it('formats centipawns and mate evaluations properly', () => {
    expect(engine.formatScore({ kind: 'centipawns', value: 150, perspective: 'white' })).toBe('+1.5');
    expect(engine.formatScore({ kind: 'centipawns', value: -70, perspective: 'white' })).toBe('-0.7');
    expect(engine.formatScore({ kind: 'mate', value: 99998, perspective: 'white' })).toContain('#M');
  });
});

