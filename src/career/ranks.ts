import type { CareerRank } from './career-types';

export const VIRTUAL_TITLE_DISCLAIMER =
  'Título virtual de AjedrezPro. No equivale a un título oficial FIDE ni a federaciones oficiales.';

export const CAREER_RANKS: readonly CareerRank[] = [
  { id: 'novato', name: 'Novato', minRating: 0, maxRating: 599, badge: '🌱' },
  { id: 'aspirante', name: 'Aspirante', minRating: 600, maxRating: 799, badge: '♟️' },
  { id: 'jugador_club', name: 'Jugador de Club', minRating: 800, maxRating: 999, badge: '♞' },
  { id: 'competidor', name: 'Competidor', minRating: 1000, maxRating: 1199, badge: '🛡️' },
  { id: 'avanzado', name: 'Avanzado', minRating: 1200, maxRating: 1399, badge: '⚔️' },
  { id: 'experto', name: 'Experto', minRating: 1400, maxRating: 1599, badge: '🎯' },
  { id: 'elite_club', name: 'Élite de Club', minRating: 1600, maxRating: 1799, badge: '⭐' },
  { id: 'maestro_regional', name: 'Maestro Regional', minRating: 1800, maxRating: 1999, badge: '🌟', isVirtualTitle: true },
  { id: 'maestro_nacional', name: 'Maestro Nacional', minRating: 2000, maxRating: 2199, badge: '🏅', isVirtualTitle: true },
  { id: 'maestro_virtual', name: 'Maestro Virtual AjedrezPro', minRating: 2200, maxRating: 2399, badge: '👑', isVirtualTitle: true },
  { id: 'gran_maestro_virtual', name: 'Gran Maestro Virtual', minRating: 2400, maxRating: 2599, badge: '💎', isVirtualTitle: true },
  { id: 'campeon_mundial', name: 'Campeón del Mundo AjedrezPro', minRating: 2600, maxRating: 9999, badge: '🏆', isVirtualTitle: true },
] as const;

export function getRankForRating(rating: number): CareerRank {
  const boundedRating = Math.max(0, rating);
  for (let i = CAREER_RANKS.length - 1; i >= 0; i--) {
    if (boundedRating >= CAREER_RANKS[i].minRating) {
      return CAREER_RANKS[i];
    }
  }
  return CAREER_RANKS[0];
}

export function getNextRankProgress(rating: number): {
  currentRank: CareerRank;
  nextRank: CareerRank | null;
  progressPercent: number;
  pointsNeeded: number;
} {
  const currentRank = getRankForRating(rating);
  const currentIndex = CAREER_RANKS.findIndex((r) => r.id === currentRank.id);
  const nextRank = currentIndex < CAREER_RANKS.length - 1 ? CAREER_RANKS[currentIndex + 1] : null;

  if (!nextRank) {
    return {
      currentRank,
      nextRank: null,
      progressPercent: 100,
      pointsNeeded: 0,
    };
  }

  const range = nextRank.minRating - currentRank.minRating;
  const currentProgress = Math.max(0, rating - currentRank.minRating);
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentProgress / range) * 100)));
  const pointsNeeded = Math.max(0, nextRank.minRating - rating);

  return {
    currentRank,
    nextRank,
    progressPercent,
    pointsNeeded,
  };
}
