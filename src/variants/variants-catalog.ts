export type ChessVariantId =
  | 'classic'
  | 'rapid'
  | 'blitz'
  | 'bullet'
  | 'chess960'
  | 'three_check'
  | 'king_of_the_hill'
  | 'crazyhouse'
  | 'atomic'
  | 'horde'
  | 'puzzle_rush'
  | 'tactics_trainer'
  | 'endgame_trainer';

export type VariantCategory = 'standard' | 'time_control' | 'rule_variant' | 'training';

export interface ChessVariantDefinition {
  readonly id: ChessVariantId;
  readonly name: string;
  readonly category: VariantCategory;
  readonly icon: string;
  readonly description: string;
  readonly rulesSummary: string;
  readonly isImplemented: boolean;
  readonly timeControlMinutes?: number;
  readonly timeIncrementSeconds?: number;
}

export const CHESS_VARIANTS: readonly ChessVariantDefinition[] = [
  // STANDARD / TIME CONTROLS
  {
    id: 'classic',
    name: 'Ajedrez Clásico',
    category: 'standard',
    icon: '♟️',
    description: 'Reglas oficiales de ajedrez sin límite de tiempo estricto.',
    rulesSummary: 'Reglas oficiales FIDE completas con jaque mate.',
    isImplemented: true,
  },
  {
    id: 'rapid',
    name: 'Ajedrez Rápido (10 min)',
    category: 'time_control',
    icon: '⏱️',
    description: '10 minutos por jugador. Máximo equilibrio entre cálculo y velocidad.',
    rulesSummary: '10 minutos por bando con reloj oficial.',
    isImplemented: true,
    timeControlMinutes: 10,
    timeIncrementSeconds: 0,
  },
  {
    id: 'blitz',
    name: 'Blitz (3+2)',
    category: 'time_control',
    icon: '⚡',
    description: '3 minutos + 2 segundos por jugada. Ritmo frenético de reflejos.',
    rulesSummary: '3 minutos con incremento de 2s por movimiento.',
    isImplemented: true,
    timeControlMinutes: 3,
    timeIncrementSeconds: 2,
  },
  {
    id: 'bullet',
    name: 'Bullet (1 min)',
    category: 'time_control',
    icon: '🚀',
    description: '1 minuto a finish. Instinto puro y agilidad extrema.',
    rulesSummary: '60 segundos por bando.',
    isImplemented: true,
    timeControlMinutes: 1,
    timeIncrementSeconds: 0,
  },

  // TRAINING & TACTICS
  {
    id: 'puzzle_rush',
    name: 'Puzzle Rush',
    category: 'training',
    icon: '🔥',
    description: 'Resuelve el máximo número de puzzles contrarreloj con 3 vidas.',
    rulesSummary: 'Modos 3 min, 5 min y Supervivencia.',
    isImplemented: true,
  },
  {
    id: 'tactics_trainer',
    name: 'Entrenador de Mis Errores',
    category: 'training',
    icon: '🧠',
    description: 'Extrae posiciones clave de tus partidas para reintentarlas.',
    rulesSummary: 'Entrenamiento adaptativo de debilidades detectadas.',
    isImplemented: true,
  },
  {
    id: 'endgame_trainer',
    name: 'Desafíos de Finales',
    category: 'training',
    icon: '🎯',
    description: 'Técnica de finales de reyes, torres y peones.',
    rulesSummary: 'Convierte ventajas teóricas en victoria.',
    isImplemented: true,
  },

  // RULE VARIANTS
  {
    id: 'three_check',
    name: 'Tres Jaques (Three-Check)',
    category: 'rule_variant',
    icon: '⚔️',
    description: 'El primer jugador que dé 3 jaques al rey enemigo gana la partida.',
    rulesSummary: 'Gana por jaque mate o al completar 3 jaques.',
    isImplemented: true,
  },
  {
    id: 'king_of_the_hill',
    name: 'Rey de la Colina (KotH)',
    category: 'rule_variant',
    icon: '⛰️',
    description: 'Lleva tu rey a una de las 4 casillas centrales (d4, e4, d5, e5) para ganar.',
    rulesSummary: 'Victoria por mate o por ocupar el centro con el rey.',
    isImplemented: true,
  },
  {
    id: 'chess960',
    name: 'Ajedrez 960 (Fischer Random)',
    category: 'rule_variant',
    icon: '🎲',
    description: 'Generador Scharnagl implementado. Partidas con enroque dinámico X-FEN próximamente.',
    rulesSummary: '960 configuraciones iniciales legales (Próximamente).',
    isImplemented: false,
  },
  {
    id: 'crazyhouse',
    name: 'Crazyhouse',
    category: 'rule_variant',
    icon: '🌀',
    description: 'Las piezas capturadas se incorporan a tu reserva para reintroducirlas en el tablero.',
    rulesSummary: 'Piezas capturadas en reserva (Próximamente).',
    isImplemented: false,
  },
  {
    id: 'atomic',
    name: 'Ajedrez Atómico',
    category: 'rule_variant',
    icon: '💥',
    description: 'Cada captura genera una explosión que destruye las piezas circundantes.',
    rulesSummary: 'Explosiones en capturas (Próximamente).',
    isImplemented: false,
  },
  {
    id: 'horde',
    name: 'Horde Chess',
    category: 'rule_variant',
    icon: '🛡️',
    description: 'Un ejército de 36 peones blancos se enfrenta a las piezas negras estándar.',
    rulesSummary: '36 peones contra piezas tradicionales (Próximamente).',
    isImplemented: false,
  },
] as const;

export function getVariantById(id: ChessVariantId): ChessVariantDefinition | undefined {
  return CHESS_VARIANTS.find((v) => v.id === id);
}
