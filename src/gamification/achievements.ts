import type { AchievementId, AchievementProgress, GamificationState } from './xp-types';

export interface AchievementDefinition {
  readonly id: AchievementId;
  readonly title: string;
  readonly description: string;
}

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  { id: 'first-victory', title: 'Primera victoria', description: 'Gana tu primera partida.' },
  { id: 'first-checkmate', title: 'Primer mate', description: 'Da jaque mate por primera vez.' },
  { id: 'ten-games', title: '10 partidas', description: 'Completa diez partidas.' },
  { id: 'daily-streak', title: 'Racha diaria', description: 'Juega dos días consecutivos.' },
  { id: 'level-improvement', title: 'Mejora de nivel', description: 'Alcanza el nivel estimado 2.' },
];

export interface AchievementContext {
  readonly wins: number;
  readonly gamesPlayed: number;
  readonly estimatedLevel: number;
}

export function unlockedAchievementIds(state: GamificationState, context: AchievementContext): readonly AchievementId[] {
  const unlocked = new Set(state.unlockedAchievements.map((achievement) => achievement.id));
  const eligible: AchievementId[] = [];
  if (context.wins >= 1) eligible.push('first-victory');
  if (state.checkmates >= 1) eligible.push('first-checkmate');
  if (context.gamesPlayed >= 10) eligible.push('ten-games');
  if (state.dailyStreak >= 2) eligible.push('daily-streak');
  if (context.estimatedLevel >= 2) eligible.push('level-improvement');
  return eligible.filter((id) => !unlocked.has(id));
}

export function unlockAchievements(state: GamificationState, context: AchievementContext, now: string): GamificationState {
  const additions: AchievementProgress[] = unlockedAchievementIds(state, context).map((id) => ({ id, unlockedAt: now }));
  return additions.length === 0 ? state : { ...state, unlockedAchievements: [...state.unlockedAchievements, ...additions] };
}
