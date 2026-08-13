import type { DifficultyLevel, DifficultyName, SearchLimits } from './types';

export interface DifficultyDefinition {
  readonly level: DifficultyLevel;
  readonly name: DifficultyName;
  readonly description: string;
  readonly defaultLimits: Readonly<SearchLimits>;
  readonly multiPv: number;
  readonly candidateWindow: number;
  readonly bestMoveProbability: number;
}

export const DIFFICULTIES: readonly DifficultyDefinition[] = [
  { level: 1, name: 'Beginner', description: 'Introducción y respuestas rápidas.', defaultLimits: { timeMs: 120, depth: 2 }, multiPv: 3, candidateWindow: 3, bestMoveProbability: 0.35 },
  { level: 2, name: 'Easy', description: 'Juego accesible con búsqueda limitada.', defaultLimits: { timeMs: 250, depth: 4 }, multiPv: 3, candidateWindow: 3, bestMoveProbability: 0.6 },
  { level: 3, name: 'Medium', description: 'Equilibrio entre rapidez y profundidad.', defaultLimits: { timeMs: 600, depth: 7 }, multiPv: 2, candidateWindow: 2, bestMoveProbability: 0.85 },
  { level: 4, name: 'Hard', description: 'Análisis táctico más profundo.', defaultLimits: { timeMs: 1_200, depth: 10 }, multiPv: 2, candidateWindow: 1, bestMoveProbability: 1 },
  { level: 5, name: 'Expert', description: 'Búsqueda exigente para jugadores avanzados.', defaultLimits: { timeMs: 2_500, depth: 14 }, multiPv: 2, candidateWindow: 1, bestMoveProbability: 1 },
  { level: 6, name: 'Master', description: 'Máximo presupuesto conceptual disponible.', defaultLimits: { timeMs: 5_000, depth: 18 }, multiPv: 3, candidateWindow: 1, bestMoveProbability: 1 },
] as const;

export function difficultyDefinition(level: DifficultyLevel): DifficultyDefinition {
  return DIFFICULTIES[level - 1];
}
