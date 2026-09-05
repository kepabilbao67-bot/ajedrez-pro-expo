export type ProgressionRank =
  | 'Novato'
  | 'Aprendiz'
  | 'Club'
  | 'Competidor'
  | 'Experto'
  | 'Maestro'
  | 'Gran Maestro virtual'
  | 'Leyenda';

export interface RankDefinition {
  readonly rank: ProgressionRank;
  readonly minimumXp: number;
  readonly rewardCoins: number;
}

export const PROGRESSION_RANKS: readonly RankDefinition[] = [
  { rank: 'Novato', minimumXp: 0, rewardCoins: 0 },
  { rank: 'Aprendiz', minimumXp: 300, rewardCoins: 150 },
  { rank: 'Club', minimumXp: 900, rewardCoins: 300 },
  { rank: 'Competidor', minimumXp: 1800, rewardCoins: 500 },
  { rank: 'Experto', minimumXp: 3200, rewardCoins: 800 },
  { rank: 'Maestro', minimumXp: 5200, rewardCoins: 1200 },
  { rank: 'Gran Maestro virtual', minimumXp: 8000, rewardCoins: 1800 },
  { rank: 'Leyenda', minimumXp: 12000, rewardCoins: 3000 },
] as const;

export interface TournamentDefinition {
  readonly id: string;
  readonly city: string;
  readonly country: string;
  readonly title: string;
  readonly minXp: number;
  readonly difficulty: 'Muy fácil' | 'Fácil' | 'Normal' | 'Difícil' | 'Experto' | 'Maestro';
  readonly boardTheme: string;
  readonly rewardCoins: number;
  readonly rewardXp: number;
  readonly trophy: string;
}

export const WORLD_TOUR: readonly TournamentDefinition[] = [
  { id: 'bilbao-local', city: 'Bilbao', country: 'España', title: 'Torneo Local', minXp: 0, difficulty: 'Muy fácil', boardTheme: 'classic', rewardCoins: 100, rewardXp: 120, trophy: 'Copa del Club' },
  { id: 'madrid-club', city: 'Madrid', country: 'España', title: 'Campeonato de Club', minXp: 300, difficulty: 'Fácil', boardTheme: 'walnut', rewardCoins: 180, rewardXp: 220, trophy: 'Trofeo Capital' },
  { id: 'paris-regional', city: 'París', country: 'Francia', title: 'Campeonato Regional', minXp: 900, difficulty: 'Normal', boardTheme: 'marble', rewardCoins: 300, rewardXp: 360, trophy: 'Torre de Plata' },
  { id: 'london-national', city: 'Londres', country: 'Reino Unido', title: 'Campeonato Nacional', minXp: 1800, difficulty: 'Difícil', boardTheme: 'tournament', rewardCoins: 450, rewardXp: 520, trophy: 'Corona del Támesis' },
  { id: 'reykjavik-masters', city: 'Reikiavik', country: 'Islandia', title: 'Masters del Norte', minXp: 3200, difficulty: 'Experto', boardTheme: 'ice', rewardCoins: 700, rewardXp: 760, trophy: 'Rey de Hielo' },
  { id: 'new-york-world', city: 'Nueva York', country: 'EE. UU.', title: 'Final Mundial', minXp: 5200, difficulty: 'Experto', boardTheme: 'royal-gold', rewardCoins: 1000, rewardXp: 1100, trophy: 'Copa Mundial' },
  { id: 'tokyo-elite', city: 'Tokio', country: 'Japón', title: 'Elite Masters', minXp: 8000, difficulty: 'Maestro', boardTheme: 'neon-cyber', rewardCoins: 1600, rewardXp: 1600, trophy: 'Dragón Maestro' },
  { id: 'singapore-legends', city: 'Singapur', country: 'Singapur', title: 'Torneo de Leyendas', minXp: 12000, difficulty: 'Maestro', boardTheme: 'glass', rewardCoins: 2500, rewardXp: 2500, trophy: 'Corona de Leyenda' },
] as const;

export interface RivalDefinition {
  readonly id: string;
  readonly name: string;
  readonly country: string;
  readonly approximateElo: number;
  readonly style: 'agresivo' | 'defensivo' | 'táctico' | 'posicional' | 'atacante' | 'prudente' | 'principiante';
  readonly difficulty: 'Muy fácil' | 'Fácil' | 'Normal' | 'Difícil' | 'Experto' | 'Maestro';
}

export const TOUR_RIVALS: readonly RivalDefinition[] = [
  { id: 'leo', name: 'Leo', country: 'España', approximateElo: 700, style: 'principiante', difficulty: 'Muy fácil' },
  { id: 'ines', name: 'Inés', country: 'España', approximateElo: 1000, style: 'prudente', difficulty: 'Fácil' },
  { id: 'luc', name: 'Luc', country: 'Francia', approximateElo: 1300, style: 'posicional', difficulty: 'Normal' },
  { id: 'arthur', name: 'Arthur', country: 'Reino Unido', approximateElo: 1550, style: 'táctico', difficulty: 'Difícil' },
  { id: 'freya', name: 'Freya', country: 'Islandia', approximateElo: 1800, style: 'defensivo', difficulty: 'Experto' },
  { id: 'maya', name: 'Maya', country: 'EE. UU.', approximateElo: 2000, style: 'agresivo', difficulty: 'Experto' },
  { id: 'ren', name: 'Ren', country: 'Japón', approximateElo: 2200, style: 'atacante', difficulty: 'Maestro' },
  { id: 'wei', name: 'Wei', country: 'Singapur', approximateElo: 2400, style: 'posicional', difficulty: 'Maestro' },
] as const;

export type LessonLevel = 'Nunca he jugado' | 'Principiante' | 'Intermedio' | 'Avanzado';

export interface AcademyLesson {
  readonly id: string;
  readonly level: LessonLevel;
  readonly title: string;
  readonly objective: string;
  readonly rewardXp: number;
  readonly rewardCoins: number;
}

export const ACADEMY_LESSONS: readonly AcademyLesson[] = [
  { id: 'board', level: 'Nunca he jugado', title: 'Conoce el tablero', objective: 'Casillas, filas, columnas y orientación', rewardXp: 25, rewardCoins: 20 },
  { id: 'pieces', level: 'Nunca he jugado', title: 'Las seis piezas', objective: 'Reconocer rey, dama, torre, alfil, caballo y peón', rewardXp: 25, rewardCoins: 20 },
  { id: 'moves', level: 'Principiante', title: 'Mover y capturar', objective: 'Movimientos legales y capturas', rewardXp: 40, rewardCoins: 30 },
  { id: 'check', level: 'Principiante', title: 'Jaque y jaque mate', objective: 'Atacar y proteger al rey', rewardXp: 50, rewardCoins: 40 },
  { id: 'special', level: 'Principiante', title: 'Reglas especiales', objective: 'Enroque, promoción y tablas', rewardXp: 55, rewardCoins: 45 },
  { id: 'center', level: 'Intermedio', title: 'Control del centro', objective: 'Desarrollo, espacio y seguridad del rey', rewardXp: 70, rewardCoins: 55 },
  { id: 'fork', level: 'Intermedio', title: 'Doble ataque', objective: 'Crear dos amenazas a la vez', rewardXp: 80, rewardCoins: 65 },
  { id: 'pin', level: 'Intermedio', title: 'Clavada y descubierta', objective: 'Tácticas de inmovilización y rayos X', rewardXp: 90, rewardCoins: 70 },
  { id: 'mate-2', level: 'Intermedio', title: 'Mate en 2', objective: 'Calcular una secuencia forzada corta', rewardXp: 100, rewardCoins: 80 },
  { id: 'openings', level: 'Avanzado', title: 'Planes de apertura', objective: 'Elegir planes, no memorizar sin comprender', rewardXp: 120, rewardCoins: 90 },
  { id: 'endgames', level: 'Avanzado', title: 'Finales esenciales', objective: 'Rey y peones, oposición y actividad', rewardXp: 130, rewardCoins: 100 },
  { id: 'calculation', level: 'Avanzado', title: 'Cálculo candidato', objective: 'Comparar jugadas forzantes con disciplina', rewardXp: 150, rewardCoins: 120 },
] as const;

export type CatalogKind = 'board' | 'pieces' | 'avatar' | 'clock' | 'effect';

export interface CatalogItem {
  readonly id: string;
  readonly kind: CatalogKind;
  readonly name: string;
  readonly priceCoins: number;
  readonly unlockXp: number;
  readonly kidsSafe: boolean;
}

export const COSMETIC_CATALOG: readonly CatalogItem[] = [
  { id: 'board-classic', kind: 'board', name: 'Classic FIDE', priceCoins: 0, unlockXp: 0, kidsSafe: true },
  { id: 'board-walnut', kind: 'board', name: 'Walnut', priceCoins: 250, unlockXp: 300, kidsSafe: true },
  { id: 'board-tournament', kind: 'board', name: 'Tournament', priceCoins: 400, unlockXp: 900, kidsSafe: true },
  { id: 'board-marble', kind: 'board', name: 'Marble', priceCoins: 650, unlockXp: 1800, kidsSafe: true },
  { id: 'board-glass', kind: 'board', name: 'Glass', priceCoins: 900, unlockXp: 3200, kidsSafe: true },
  { id: 'board-gold', kind: 'board', name: 'Royal Gold', priceCoins: 1200, unlockXp: 5200, kidsSafe: true },
  { id: 'board-neon', kind: 'board', name: 'Neon Cyber', priceCoins: 1100, unlockXp: 5200, kidsSafe: true },
  { id: 'board-ice', kind: 'board', name: 'Ice', priceCoins: 800, unlockXp: 3200, kidsSafe: true },
  { id: 'board-kids', kind: 'board', name: 'Kids', priceCoins: 150, unlockXp: 0, kidsSafe: true },
  { id: 'board-space', kind: 'board', name: 'Space', priceCoins: 700, unlockXp: 1800, kidsSafe: true },
  { id: 'pieces-staunton', kind: 'pieces', name: 'Staunton Ivory/Ebony', priceCoins: 0, unlockXp: 0, kidsSafe: true },
  { id: 'pieces-wood', kind: 'pieces', name: 'Tournament Wood', priceCoins: 350, unlockXp: 900, kidsSafe: true },
  { id: 'pieces-marble', kind: 'pieces', name: 'Marble', priceCoins: 650, unlockXp: 1800, kidsSafe: true },
  { id: 'pieces-crystal', kind: 'pieces', name: 'Crystal', priceCoins: 900, unlockXp: 3200, kidsSafe: true },
  { id: 'pieces-gold', kind: 'pieces', name: 'Gold', priceCoins: 1200, unlockXp: 5200, kidsSafe: true },
  { id: 'pieces-kids', kind: 'pieces', name: 'Kids Animals', priceCoins: 150, unlockXp: 0, kidsSafe: true },
  { id: 'pieces-space', kind: 'pieces', name: 'Space', priceCoins: 750, unlockXp: 1800, kidsSafe: true },
  { id: 'clock-digital', kind: 'clock', name: 'Digital Pro', priceCoins: 0, unlockXp: 0, kidsSafe: true },
  { id: 'clock-analog', kind: 'clock', name: 'Analógico doble botón', priceCoins: 250, unlockXp: 300, kidsSafe: true },
  { id: 'clock-mechanical', kind: 'clock', name: 'Mecánico clásico', priceCoins: 400, unlockXp: 900, kidsSafe: true },
  { id: 'clock-hourglass', kind: 'clock', name: 'Arena visual', priceCoins: 350, unlockXp: 900, kidsSafe: true },
] as const;

export type TimeCategory = 'Bullet' | 'Blitz' | 'Rapid' | 'Classic' | 'Custom';

export interface TimeControlPreset {
  readonly id: string;
  readonly category: TimeCategory;
  readonly minutes: number;
  readonly incrementSeconds: number;
}

export const TIME_CONTROLS: readonly TimeControlPreset[] = [
  { id: '1+0', category: 'Bullet', minutes: 1, incrementSeconds: 0 },
  { id: '1+1', category: 'Bullet', minutes: 1, incrementSeconds: 1 },
  { id: '2+1', category: 'Bullet', minutes: 2, incrementSeconds: 1 },
  { id: '3+0', category: 'Blitz', minutes: 3, incrementSeconds: 0 },
  { id: '3+2', category: 'Blitz', minutes: 3, incrementSeconds: 2 },
  { id: '5+0', category: 'Blitz', minutes: 5, incrementSeconds: 0 },
  { id: '5+3', category: 'Blitz', minutes: 5, incrementSeconds: 3 },
  { id: '10+0', category: 'Rapid', minutes: 10, incrementSeconds: 0 },
  { id: '10+5', category: 'Rapid', minutes: 10, incrementSeconds: 5 },
  { id: '15+10', category: 'Rapid', minutes: 15, incrementSeconds: 10 },
  { id: '30+0', category: 'Classic', minutes: 30, incrementSeconds: 0 },
] as const;

export type GameModeAvailability = 'available' | 'planned';

export interface GameModeDefinition {
  readonly id: string;
  readonly title: string;
  readonly availability: GameModeAvailability;
  readonly competitive: boolean;
}

export const GAME_MODES: readonly GameModeDefinition[] = [
  { id: 'quick', title: 'Partida rápida', availability: 'available', competitive: true },
  { id: 'ai', title: 'Vs IA', availability: 'available', competitive: true },
  { id: 'local', title: 'Dos jugadores local', availability: 'available', competitive: false },
  { id: 'puzzles', title: 'Puzzles', availability: 'available', competitive: false },
  { id: 'rush', title: 'Puzzle Rush', availability: 'available', competitive: true },
  { id: 'training', title: 'Entrenamiento', availability: 'available', competitive: false },
  { id: 'championship', title: 'Campeonato', availability: 'available', competitive: true },
  { id: 'clock', title: 'Contrarreloj', availability: 'available', competitive: true },
  { id: 'chess960', title: 'Chess960', availability: 'planned', competitive: true },
  { id: 'king-of-the-hill', title: 'King of the Hill', availability: 'planned', competitive: true },
  { id: 'three-check', title: 'Three Check', availability: 'planned', competitive: true },
  { id: 'horde', title: 'Horde', availability: 'planned', competitive: true },
  { id: 'atomic', title: 'Atomic', availability: 'planned', competitive: true },
  { id: 'crazyhouse', title: 'Crazyhouse', availability: 'planned', competitive: true },
] as const;

export interface KidsModePolicy {
  readonly simplifiedUi: boolean;
  readonly largeTouchTargets: boolean;
  readonly positiveFeedback: boolean;
  readonly aggressiveAds: false;
  readonly purchasesRequireParentalControl: true;
  readonly randomPaidRewards: false;
}

export const KIDS_MODE_POLICY: KidsModePolicy = {
  simplifiedUi: true,
  largeTouchTargets: true,
  positiveFeedback: true,
  aggressiveAds: false,
  purchasesRequireParentalControl: true,
  randomPaidRewards: false,
};

export function rankForXp(xp: number): RankDefinition {
  const safeXp = Number.isFinite(xp) ? Math.max(0, xp) : 0;
  return [...PROGRESSION_RANKS].reverse().find((item) => safeXp >= item.minimumXp) ?? PROGRESSION_RANKS[0];
}

export function unlockedTournaments(xp: number): readonly TournamentDefinition[] {
  const safeXp = Number.isFinite(xp) ? Math.max(0, xp) : 0;
  return WORLD_TOUR.filter((tournament) => safeXp >= tournament.minXp);
}

export function purchasableItems(xp: number, coins: number): readonly CatalogItem[] {
  const safeXp = Number.isFinite(xp) ? Math.max(0, xp) : 0;
  const safeCoins = Number.isFinite(coins) ? Math.max(0, coins) : 0;
  return COSMETIC_CATALOG.filter((item) => safeXp >= item.unlockXp && safeCoins >= item.priceCoins);
}
