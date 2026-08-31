import type { AchievementId, AchievementProgress, GamificationState } from './xp-types';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface AchievementDefinition {
  readonly id: AchievementId;
  readonly title: string;
  readonly description: string;
  readonly tier: AchievementTier;
  readonly icon: string;
  readonly xpReward: number;
}

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  // --- BRONCE ---
  {
    id: 'first-victory',
    title: 'Primera Victoria',
    description: 'Gana tu primera partida en AjedrezPro.',
    tier: 'bronze',
    icon: '🏆',
    xpReward: 25,
  },
  {
    id: 'first-checkmate',
    title: 'Primer Mate',
    description: 'Entrega jaque mate por primera vez.',
    tier: 'bronze',
    icon: '⚔️',
    xpReward: 25,
  },
  {
    id: 'first-puzzle',
    title: 'Táctico Novato',
    description: 'Resuelve tu primer problema táctico.',
    tier: 'bronze',
    icon: '🧩',
    xpReward: 20,
  },

  // --- PLATA ---
  {
    id: 'ten-games',
    title: '10 Partidas',
    description: 'Completa diez partidas disputadas.',
    tier: 'silver',
    icon: '♟️',
    xpReward: 50,
  },
  {
    id: 'daily-streak',
    title: 'Racha Diaria',
    description: 'Mantén una racha de 2 días consecutivos de juego.',
    tier: 'silver',
    icon: '🔥',
    xpReward: 40,
  },
  {
    id: 'level-improvement',
    title: 'Mejora de Nivel',
    description: 'Alcanza el nivel 2 de maestría.',
    tier: 'silver',
    icon: '📈',
    xpReward: 50,
  },
  {
    id: 'opening-explorer',
    title: 'Explorador ECO',
    description: 'Descubre y estudia 5 variantes de aperturas.',
    tier: 'silver',
    icon: '📖',
    xpReward: 45,
  },
  {
    id: 'clock-sprinter',
    title: 'Velocista del Reloj',
    description: 'Juega una partida usando el Reloj FIDE.',
    tier: 'silver',
    icon: '⏱️',
    xpReward: 40,
  },

  // --- ORO ---
  {
    id: 'weekly-streak',
    title: 'Racha Imparable',
    description: 'Juega 7 días seguidos sin romper la racha.',
    tier: 'gold',
    icon: '🌟',
    xpReward: 100,
  },
  {
    id: 'tactics-expert',
    title: 'Mente Táctica',
    description: 'Resuelve 20 ejercicios de entrenamiento.',
    tier: 'gold',
    icon: '🎯',
    xpReward: 80,
  },
  {
    id: 'hundred-games',
    title: 'Veterano',
    description: 'Alcanza 100 partidas jugadas en la plataforma.',
    tier: 'gold',
    icon: '🎖️',
    xpReward: 150,
  },
  {
    id: 'fide-master',
    title: 'Candidato a Maestro',
    description: 'Alcanza el nivel 4 (Estratega).',
    tier: 'gold',
    icon: '👑',
    xpReward: 120,
  },

  // --- DIAMANTE ---
  {
    id: 'brilliant-mind',
    title: 'Mente Brillante',
    description: 'Ejecuta una jugada clasificada como brillante (💎).',
    tier: 'diamond',
    icon: '💎',
    xpReward: 200,
  },
  {
    id: 'puzzle-master',
    title: 'Maestro de Puzzles',
    description: 'Resuelve 50 problemas tácticos.',
    tier: 'diamond',
    icon: '⚡',
    xpReward: 250,
  },
  {
    id: 'grandmaster-level',
    title: 'Gran Maestro',
    description: 'Alcanza el rango supremo de Gran Maestro.',
    tier: 'diamond',
    icon: '🪐',
    xpReward: 300,
  },
  {
    id: 'pgn-scholar',
    title: 'Erudito PGN',
    description: 'Estudia 3 partidas maestras históricas completas.',
    tier: 'diamond',
    icon: '📜',
    xpReward: 150,
  },
];

export interface AchievementContext {
  readonly wins: number;
  readonly gamesPlayed: number;
  readonly estimatedLevel: number;
  readonly exercisesCompleted: number;
  readonly hasUsedClock?: boolean;
  readonly hasStudiedOpening?: boolean;
  readonly hasExecutedBrilliant?: boolean;
  readonly hasStudiedPgn?: boolean;
}

export function unlockedAchievementIds(state: GamificationState, context: AchievementContext): readonly AchievementId[] {
  const unlocked = new Set(state.unlockedAchievements.map((achievement) => achievement.id));
  const eligible: AchievementId[] = [];

  if (context.wins >= 1) eligible.push('first-victory');
  if (state.checkmates >= 1) eligible.push('first-checkmate');
  if (context.exercisesCompleted >= 1) eligible.push('first-puzzle');

  if (context.gamesPlayed >= 10) eligible.push('ten-games');
  if (context.gamesPlayed >= 100) eligible.push('hundred-games');
  if (state.dailyStreak >= 2) eligible.push('daily-streak');
  if (state.dailyStreak >= 7) eligible.push('weekly-streak');
  if (context.estimatedLevel >= 2) eligible.push('level-improvement');
  if (context.estimatedLevel >= 4) eligible.push('fide-master');
  if (context.estimatedLevel >= 5) eligible.push('grandmaster-level');

  if (context.exercisesCompleted >= 20) eligible.push('tactics-expert');
  if (context.exercisesCompleted >= 50) eligible.push('puzzle-master');

  if (context.hasUsedClock) eligible.push('clock-sprinter');
  if (context.hasStudiedOpening) eligible.push('opening-explorer');
  if (context.hasExecutedBrilliant) eligible.push('brilliant-mind');
  if (context.hasStudiedPgn) eligible.push('pgn-scholar');

  return eligible.filter((id) => !unlocked.has(id));
}

export function unlockAchievements(state: GamificationState, context: AchievementContext, now: string): GamificationState {
  const additions: AchievementProgress[] = unlockedAchievementIds(state, context).map((id) => ({ id, unlockedAt: now }));
  return additions.length === 0 ? state : { ...state, unlockedAchievements: [...state.unlockedAchievements, ...additions] };
}
