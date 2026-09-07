import type { DifficultyLevel, PlayStyle } from './types';

export interface AiBot {
  readonly id: string;
  readonly name: string;
  readonly avatar: string;
  readonly description: string;
  readonly greeting: string;
  readonly difficulty: DifficultyLevel;
  readonly playStyle: PlayStyle;
  readonly elo: number;
}

export const AI_BOTS: readonly AiBot[] = [
  {
    id: 'leo',
    name: 'Leo',
    avatar: '🧒',
    description: 'Aspirante impaciente',
    greeting: '¡Hola! Me gusta lanzar peones hacia adelante rápido.',
    difficulty: 1,
    playStyle: 'Aggressive',
    elo: 800,
  },
  {
    id: 'lucas',
    name: 'Lucas',
    avatar: '👦',
    description: 'Principiante entusiasta',
    greeting: '¡Hola! Estoy aprendiendo a mover los caballos, ¿jugamos?',
    difficulty: 2,
    playStyle: 'Balanced',
    elo: 1000,
  },
  {
    id: 'lucia',
    name: 'Lucía',
    avatar: '👩‍🎓',
    description: 'Cazadora de tácticas',
    greeting: 'Cuidado con tus piezas desprotegidas; no perdono una clavada.',
    difficulty: 3,
    playStyle: 'Tactical',
    elo: 1200,
  },
  {
    id: 'carlos',
    name: 'Carlos',
    avatar: '👨‍💼',
    description: 'Veterano de club sólido',
    greeting: 'El buen ajedrez se construye desde la paciencia y la estructura.',
    difficulty: 4,
    playStyle: 'Defensive',
    elo: 1400,
  },
  {
    id: 'marta',
    name: 'Marta',
    avatar: '👩‍🔬',
    description: 'Estratega posicional',
    greeting: 'Cada casilla débil en tu campo será una casilla para mis piezas.',
    difficulty: 5,
    playStyle: 'Positional',
    elo: 1650,
  },
  {
    id: 'elena',
    name: 'Elena',
    avatar: '👩‍🎤',
    description: 'Jugadora de club agresiva',
    greeting: 'Prepárate para defender a tu rey contra mis líneas dinámicas.',
    difficulty: 6,
    playStyle: 'Tactical',
    elo: 1900,
  },
  {
    id: 'helena',
    name: 'Helena',
    avatar: '👑',
    description: 'Maestra Nacional',
    greeting: 'La armonía entre las piezas decide la partida. Juguemos con rigor.',
    difficulty: 7,
    playStyle: 'Positional',
    elo: 2150,
  },
  {
    id: 'nexus',
    name: 'Maestro Nexus',
    avatar: '🧙‍♂️',
    description: 'Inteligencia Suprema',
    greeting: 'El ajedrez es comprensión pura. Veamos qué tienes.',
    difficulty: 8,
    playStyle: 'Balanced',
    elo: 2400,
  },
];
