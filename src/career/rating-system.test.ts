import { describe, expect, it } from 'vitest';
import { calculateRatingDelta, getKFactor } from './rating-system';
import { getNextRankProgress, getRankForRating, VIRTUAL_TITLE_DISCLAIMER } from './ranks';

describe('Career Rating System (Elo Math)', () => {
  it('calculates K-factor according to game count and rating bracket', () => {
    expect(getKFactor(10, 800)).toBe(40); // Provisional
    expect(getKFactor(35, 1200)).toBe(32); // Club
    expect(getKFactor(50, 1900)).toBe(24); // Advanced
    expect(getKFactor(50, 2300)).toBe(16); // Master
  });

  it('awards rating on victory against equal opponent', () => {
    const res = calculateRatingDelta(1000, 1000, 1, 35);
    expect(res.playerDelta).toBe(16);
    expect(res.playerNewRating).toBe(1016);
    expect(res.opponentDelta).toBe(-16);
  });

  it('awards more rating when defeating higher rated opponent', () => {
    const res = calculateRatingDelta(1000, 1200, 1, 35);
    expect(res.playerDelta).toBeGreaterThan(20);
    expect(res.playerNewRating).toBe(1000 + res.playerDelta);
  });

  it('protects against farming vastly inferior opponents (>400 gap)', () => {
    const res = calculateRatingDelta(1600, 900, 1, 50);
    expect(res.playerDelta).toBeLessThanOrEqual(2);
  });

  it('reduces rating on defeat against equal opponent', () => {
    const res = calculateRatingDelta(1200, 1200, 0, 35);
    expect(res.playerDelta).toBe(-16);
    expect(res.playerNewRating).toBe(1184);
  });

  it('results in near-zero rating change on balanced draw', () => {
    const res = calculateRatingDelta(1400, 1400, 0.5, 35);
    expect(res.playerDelta).toBe(0);
    expect(res.playerNewRating).toBe(1400);
  });
});

describe('Career Ranks and Virtual Titles', () => {
  it('identifies Novato for low ratings', () => {
    const rank = getRankForRating(450);
    expect(rank.id).toBe('novato');
    expect(rank.name).toBe('Novato');
  });

  it('identifies Master and Grandmaster ranks with virtual title flag', () => {
    const nationalMaster = getRankForRating(2050);
    expect(nationalMaster.id).toBe('maestro_nacional');
    expect(nationalMaster.isVirtualTitle).toBe(true);

    const gm = getRankForRating(2450);
    expect(gm.id).toBe('gran_maestro_virtual');
    expect(gm.isVirtualTitle).toBe(true);

    const worldChampion = getRankForRating(2650);
    expect(worldChampion.id).toBe('campeon_mundial');
    expect(worldChampion.isVirtualTitle).toBe(true);
  });

  it('computes next rank progress correctly', () => {
    const progress = getNextRankProgress(700); // Between 600 (Aspirante) and 800 (Club)
    expect(progress.currentRank.id).toBe('aspirante');
    expect(progress.nextRank?.id).toBe('jugador_club');
    expect(progress.progressPercent).toBe(50);
    expect(progress.pointsNeeded).toBe(100);
  });

  it('includes proper disclaimer text', () => {
    expect(VIRTUAL_TITLE_DISCLAIMER).toContain('Título virtual de AjedrezPro');
    expect(VIRTUAL_TITLE_DISCLAIMER).toContain('FIDE');
  });
});
