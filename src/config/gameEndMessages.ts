import type { Color, GameStatus } from '@/chess';

export type GameEndReason =
  | 'checkmate-win'
  | 'checkmate-loss'
  | 'stalemate'
  | 'insufficient-material'
  | 'threefold-repetition'
  | 'fifty-move'
  | 'draw-general'
  | 'resignation-win'
  | 'resignation-loss'
  | 'timeout-win'
  | 'timeout-loss'
  | 'three-check-win'
  | 'three-check-loss'
  | 'koth-win'
  | 'koth-loss';

export interface GameEndOutcomeConfig {
  readonly reason: GameEndReason;
  readonly icon: string;
  readonly title: string;
  readonly subtitle: string;
  readonly outcome: 'win' | 'loss' | 'draw';
  readonly score: '1-0' | '0-1' | '½-½';
  readonly messages: readonly string[];
}

export const GAME_END_CATALOG: Record<GameEndReason, GameEndOutcomeConfig> = {
  'checkmate-win': {
    reason: 'checkmate-win',
    icon: '🏆',
    title: '¡Victoria!',
    subtitle: 'Jaque mate.',
    outcome: 'win',
    score: '1-0',
    messages: [
      'El rey rival acaba de pedir vacaciones.',
      'Jaque mate. Puedes guardar esa sonrisa.',
      'El rival todavía está buscando por dónde escapar.',
      'Ese rey necesitaba un GPS.',
      'Boom. Rey cazado.',
      'La corona cambia de dueño.',
      'Hoy el tablero era tuyo.',
      'Mate limpio. Sin anestesia.',
      'El rey rival ha presentado su dimisión.',
      'Eso no fue jaque mate. Fue una declaración de intenciones.',
    ],
  },
  'checkmate-loss': {
    reason: 'checkmate-loss',
    icon: '♟️',
    title: 'Fin de la partida',
    subtitle: 'Jaque mate.',
    outcome: 'loss',
    score: '0-1',
    messages: [
      'Tu rey solicita una segunda oportunidad.',
      'Bueno… ese mate estaba bastante bien escondido.',
      'El rey ha caído, pero todavía queda la revancha.',
      'Houston, hemos perdido al rey.',
      'El rival encontró una puerta que nosotros no vimos.',
      'Hoy el rey durmió demasiado.',
      'Ese mate dolió un poquito.',
      'El tablero gana otra batalla. ¿Revancha?',
      'Tu rey necesita un café.',
      'Archivamos esta bajo: cosas que no volverán a pasar.',
    ],
  },
  stalemate: {
    reason: 'stalemate',
    icon: '🤝',
    title: 'Tablas',
    subtitle: 'Rey ahogado.',
    outcome: 'draw',
    score: '½-½',
    messages: [
      'Sin movimientos… pero todavía vivo.',
      'El rey se quedó sin habitaciones.',
      'No puede moverse. Tampoco quiere rendirse.',
      'El arte de sobrevivir sin tener dónde ir.',
      'Ahogado con estilo. Medio punto al bolsillo.',
    ],
  },
  'insufficient-material': {
    reason: 'insufficient-material',
    icon: '🤝',
    title: 'Tablas',
    subtitle: 'Material insuficiente.',
    outcome: 'draw',
    score: '½-½',
    messages: [
      'Con esto ya no montamos ni un ejército.',
      'Demasiado poco material para tanta ambición.',
      'Los supervivientes han firmado la paz.',
      'Pocas piezas, mucha paz.',
    ],
  },
  'threefold-repetition': {
    reason: 'threefold-repetition',
    icon: '🤝',
    title: 'Tablas',
    subtitle: 'Triple repetición.',
    outcome: 'draw',
    score: '½-½',
    messages: [
      'Esto me suena de algo…',
      'Déjà vu ajedrecístico.',
      'Otra vez aquí. Y otra. Y otra.',
      'El tablero entró en bucle.',
    ],
  },
  'fifty-move': {
    reason: 'fifty-move',
    icon: '🤝',
    title: 'Tablas',
    subtitle: 'Regla de los 50 movimientos.',
    outcome: 'draw',
    score: '½-½',
    messages: [
      '50 movimientos después… los reyes piden descanso.',
      'Esto ya parecía una serie de ocho temporadas.',
      'El tablero pide vacaciones.',
      'Medio siglo de jugadas sin bajas.',
    ],
  },
  'draw-general': {
    reason: 'draw-general',
    icon: '🤝',
    title: 'Tablas',
    subtitle: 'Pacto de tablas.',
    outcome: 'draw',
    score: '½-½',
    messages: [
      'Nadie gana, nadie pierde… diplomacia ajedrecística.',
      'Los dos reyes han firmado la paz.',
      'Empate técnico. Los reyes se van a tomar algo.',
      'Hoy no habrá coronación.',
      'Tablas. Dos cerebros, cero vencedores.',
      'El tablero declara armisticio.',
      'Esto pide otra partida.',
    ],
  },
  'resignation-win': {
    reason: 'resignation-win',
    icon: '🏆',
    title: '¡Victoria!',
    subtitle: 'El rival se ha rendido.',
    outcome: 'win',
    score: '1-0',
    messages: [
      'Bandera blanca detectada.',
      'El rival ha visto suficiente.',
      'Victoria sin necesidad de perseguir al rey.',
      'El rival ha pulsado el botón de emergencia.',
    ],
  },
  'resignation-loss': {
    reason: 'resignation-loss',
    icon: '♟️',
    title: 'Partida finalizada',
    subtitle: 'Te has rendido.',
    outcome: 'loss',
    score: '0-1',
    messages: [
      'A veces retirarse también es estrategia.',
      'Guardamos energía para la revancha.',
      'Esta posición se archiva. La siguiente será otra historia.',
      'El rey acepta la retirada.',
    ],
  },
  'timeout-win': {
    reason: 'timeout-win',
    icon: '⏱️',
    title: '¡Victoria!',
    subtitle: 'Al rival se le acabó el tiempo.',
    outcome: 'win',
    score: '1-0',
    messages: [
      'El reloj también juega.',
      'Tiempo fuera. Rey salvado.',
      'El rival tenía posición… pero no minutos.',
      'El reloj acaba de dar jaque mate.',
    ],
  },
  'timeout-loss': {
    reason: 'timeout-loss',
    icon: '⏱️',
    title: 'Tiempo agotado',
    subtitle: 'Se acabó tu tiempo.',
    outcome: 'loss',
    score: '0-1',
    messages: [
      'Buena partida. Maldito reloj.',
      'El enemigo esta vez tenía agujas.',
      'El tablero estaba ahí. El tiempo no.',
      'Necesitamos unas cuantas décimas más.',
    ],
  },
  'three-check-win': {
    reason: 'three-check-win',
    icon: '⚔️',
    title: '¡Victoria por 3 Jaques!',
    subtitle: 'Conseguiste el tercer jaque mortal.',
    outcome: 'win',
    score: '1-0',
    messages: [
      '¡Tres jaques y el rey rival se quedó sin aliento!',
      'Ataque incesante: 3 jaques directos al corazón.',
      'Triple amenaza completada. ¡Victoria impecable!',
    ],
  },
  'three-check-loss': {
    reason: 'three-check-loss',
    icon: '⚡',
    title: 'Fin de la partida',
    subtitle: 'El rival completó 3 jaques.',
    outcome: 'loss',
    score: '0-1',
    messages: [
      'El tercer jaque fue demasiado para nuestro rey.',
      'Una defensa difícil ante un asalto tan veloz.',
      'El rival encontró tres líneas directas de ataque.',
    ],
  },
  'koth-win': {
    reason: 'koth-win',
    icon: '⛰️',
    title: '¡Rey de la Colina!',
    subtitle: 'Tu Rey conquistó el centro del tablero.',
    outcome: 'win',
    score: '1-0',
    messages: [
      '¡Tu Rey marcha triunfal en la cima de la colina!',
      'Control total de las cuatro casillas sagradas.',
      'Un monarca valiente que lidera desde el frente.',
    ],
  },
  'koth-loss': {
    reason: 'koth-loss',
    icon: '⛰️',
    title: 'Fin de la partida',
    subtitle: 'El rey rival conquistó el centro.',
    outcome: 'loss',
    score: '0-1',
    messages: [
      'El rey rival se apoderó de la colina central.',
      'Perdimos el control de las casillas clave.',
      'La fortaleza del centro cayó en manos enemigas.',
    ],
  },
};

let lastMessageIndices: Record<string, number> = {};

export function getRandomEndMessage(reason: GameEndReason): string {
  const config = GAME_END_CATALOG[reason] ?? GAME_END_CATALOG['draw-general'];
  const pool = config.messages;
  if (pool.length === 0) return '';
  if (pool.length === 1) return pool[0];

  const prevIndex = lastMessageIndices[reason];
  let newIndex = Math.floor(Math.random() * pool.length);
  if (prevIndex !== undefined && newIndex === prevIndex && pool.length > 1) {
    newIndex = (newIndex + 1) % pool.length;
  }
  lastMessageIndices[reason] = newIndex;
  return pool[newIndex];
}

export interface ResolveGameEndInput {
  readonly status: GameStatus;
  readonly playerColor?: Color; // Default 'w'
  readonly manualReason?: GameEndReason | null;
}

export function resolveGameEndConfig(input: ResolveGameEndInput): GameEndOutcomeConfig {
  const { status, playerColor = 'w', manualReason } = input;

  if (manualReason && GAME_END_CATALOG[manualReason]) {
    const base = GAME_END_CATALOG[manualReason];
    // Format score based on player color if applicable
    const score = base.outcome === 'draw' ? '½-½' : (playerColor === 'w' ? (base.outcome === 'win' ? '1-0' : '0-1') : (base.outcome === 'win' ? '0-1' : '1-0'));
    return { ...base, score };
  }

  if (status.checkmate) {
    const isPlayerWin = status.winner === playerColor;
    const key: GameEndReason = isPlayerWin ? 'checkmate-win' : 'checkmate-loss';
    const base = GAME_END_CATALOG[key];
    const score = status.winner === 'w' ? '1-0' : '0-1';
    return { ...base, score };
  }

  if (status.stalemate || status.drawReason === 'stalemate') {
    return GAME_END_CATALOG.stalemate;
  }

  if (status.drawReason === 'insufficient-material') {
    return GAME_END_CATALOG['insufficient-material'];
  }

  if (status.drawReason === 'threefold-repetition') {
    return GAME_END_CATALOG['threefold-repetition'];
  }

  if (status.drawReason === 'fifty-move') {
    return GAME_END_CATALOG['fifty-move'];
  }

  if (status.draw) {
    return GAME_END_CATALOG['draw-general'];
  }

  return GAME_END_CATALOG['checkmate-win'];
}
