import type { CareerOpponent } from './career-types';

export const CAREER_OPPONENTS: readonly CareerOpponent[] = [
  {
    id: 'mateo',
    name: 'Mateo',
    avatar: '👦',
    rating: 820,
    aiDifficulty: 2,
    playStyle: 'Aggressive',
    styleDescription: 'agresivo',
    title: 'Aspirante Local',
    preferredOpenings: ['Gambito de Rey', 'Apertura Italiana'],
    strength: 'Ataques rápidos al rey en la apertura',
    weakness: 'Descuidos tácticos y finales de peones',
    bio: 'Joven entusiasta de la academia. Se lanza siempre al ataque sin importar el material.',
    quotes: {
      preMatch: [
        '¡He preparado una trampa en la apertura que no vas a ver venir!',
        'A ver si aguantas mi ataque directo.',
      ],
      victory: [
        '¡Ja! ¡Te dije que mi ataque era imparable!',
        '¡Buena partida! Mis caballos estuvieron intratables.',
      ],
      defeat: [
        'Uff, me confié y descuidé el contraataque...',
        'Me ganaste bien. Necesito repasar mis finales.',
      ],
      draw: [
        '¡Vaya batalla! Ninguno dio un paso atrás.',
      ],
    },
  },
  {
    id: 'lucia',
    name: 'Lucía',
    avatar: '👩‍🎓',
    rating: 960,
    aiDifficulty: 3,
    playStyle: 'Tactical',
    styleDescription: 'táctico',
    title: 'Talento de la Academia',
    preferredOpenings: ['Defensa Siciliana', 'Gambito Escocés'],
    strength: 'Clavadas agudas y horquillas de caballo',
    weakness: 'Impaciencia en posiciones cerradas',
    bio: 'Estudia táctica varias horas al día. Si dejas una pieza desprotegida, la castigará al instante.',
    quotes: {
      preMatch: [
        'He resuelto 50 puzzles esta mañana. Mis ojos ven cada combinación.',
        'Juguemos una partida dinámica.',
      ],
      victory: [
        'La táctica siempre recompensa a quien calcula mejor.',
        'Esa clavada en el centro fue decisiva.',
      ],
      defeat: [
        'Bien jugado. Neutralizaste mis trucos tácticos.',
        'Me faltó visión profiláctica...',
      ],
      draw: [
        'Quedamos en tablas, pero la posición estuvo que ardía.',
      ],
    },
  },
  {
    id: 'carlos',
    name: 'Carlos',
    avatar: '👨‍💼',
    rating: 1180,
    aiDifficulty: 4,
    playStyle: 'Defensive',
    styleDescription: 'defensivo',
    title: 'Veterano del Club',
    preferredOpenings: ['Defensa Francesa', 'Apertura Inglesa'],
    strength: 'Estructura de peones sólida y profilaxis',
    weakness: 'Falta de agresividad en momentos de ventaja',
    bio: 'Jugador paciente y meticuloso. Prefiere construir fortalezas y esperar el error del rival.',
    quotes: {
      preMatch: [
        'El ajedrez se gana no cometiendo errores, joven.',
        'Veamos si puedes romper mi estructura sólida.',
      ],
      victory: [
        'La paciencia siempre da sus frutos.',
        'Tu ataque se estrelló contra una defensa ordenada.',
      ],
      defeat: [
        'Me presionaste con mucha precisión en los flancos.',
        'Admito que tu iniciativa fue superior a mi defensa.',
      ],
      draw: [
        'Un empate justo. Posición sólida de ambos.',
      ],
    },
  },
  {
    id: 'marta',
    name: 'Marta',
    avatar: '👩‍🔬',
    rating: 1350,
    aiDifficulty: 5,
    playStyle: 'Positional',
    styleDescription: 'aperturas',
    title: 'Especialista Teórica',
    preferredOpenings: ['Gambito de Dama', 'Defensa Caro-Kann'],
    strength: 'Preparación enciclopédica de aperturas y armonía',
    weakness: 'Dificultades en apuros de tiempo con complicaciones',
    bio: 'Conoce los primeros 15 movimientos de memoria. Su juego es armonioso y metódico.',
    quotes: {
      preMatch: [
        'Conozco todas las líneas principales de esta apertura.',
        'La armonía de piezas es la clave de la victoria.',
      ],
      victory: [
        'La ventaja que obtuve en la apertura se tradujo en victoria.',
        'Un plan estratégico ejecutado con pulcritud.',
      ],
      defeat: [
        'Me sacaste de mi preparación de libro con valentía.',
        'Gran creatividad en el medio juego. Felicitaciones.',
      ],
      draw: [
        'Equilibrio exacto. Buena técnica teórica.',
      ],
    },
  },
  {
    id: 'sofia',
    name: 'Sofía',
    avatar: '🧘‍♀️',
    rating: 1520,
    aiDifficulty: 6,
    playStyle: 'Positional',
    styleDescription: 'posicional',
    title: 'Capitana Regional',
    preferredOpenings: ['Defensa Nimzoindia', 'Apertura Reti'],
    strength: 'Finales de torres y técnica posicional depurada',
    weakness: 'Ataques relámpago con sacrificios intuitivos',
    bio: 'Ex campeona juvenil. Domina el arte de convertir pequeñas ventajas posicionales en finales ganadores.',
    quotes: {
      preMatch: [
        'Cada pequeña casilla débil en tu campo será mi objetivo.',
        'Juguemos ajedrez de alta escuela.',
      ],
      victory: [
        'La ventaja de espacio decidió la partida poco a poco.',
        'El final de torres estaba ganado desde el movimiento 25.',
      ],
      defeat: [
        'Impresionante visión. Rompiste mi fortaleza central.',
        'Hacía tiempo que no me superaban en el final. Gran partida.',
      ],
      draw: [
        'Un reparto de puntos digno de un campeonato de alto nivel.',
      ],
    },
  },
  {
    id: 'viktor',
    name: 'Viktor',
    avatar: '🕵️‍♂️',
    rating: 1690,
    aiDifficulty: 6,
    playStyle: 'Tactical',
    styleDescription: 'táctico',
    title: 'Maestro Táctico Regional',
    preferredOpenings: ['Defensa India de Rey', 'Ataque Marshall'],
    strength: 'Cálculo profundo en posiciones ultra complejas',
    weakness: 'Impaciencia si la partida se torna aburrida',
    bio: 'Famoso por sus sacrificios de calidad y ataques despiadados en el flanco de rey.',
    quotes: {
      preMatch: [
        'En este tablero va a haber fuego y sacrificios.',
        'Prepárate para calcular variantes profundas.',
      ],
      victory: [
        'El ataque sobre tu enroque era imparable.',
        'El cálculo frío siempre triunfa sobre las dudas.',
      ],
      defeat: [
        '¡Magnífica defensa! Tu rey escapó milagrosamente.',
        'Me castigaste cuando me excedí en el ataque. Merecido.',
      ],
      draw: [
        'Tablas por jaque continuo tras un ataque furioso.',
      ],
    },
  },
  {
    id: 'diego_vega',
    name: 'Diego Vega',
    avatar: '🥋',
    rating: 1910,
    aiDifficulty: 7,
    playStyle: 'Aggressive',
    styleDescription: 'agresivo',
    title: 'Candidato a Maestro',
    preferredOpenings: ['Defensa Grünfeld', 'Apertura Ruy López'],
    strength: 'Iniciativa implacable y juego dinámico de piezas',
    weakness: 'Tendencia al sobreoptimismo en el medio juego',
    bio: 'Jugador implacable con experiencia en circuitos de élite. Exige máxima concentración en cada jugada.',
    quotes: {
      preMatch: [
        'Llegar a este nivel exige jugar como un verdadero maestro.',
        'Demuéstrame que mereces competir en esta división.',
      ],
      victory: [
        'La presión constante terminó forzando tu error.',
        'A este nivel, una sola imprecisión cuesta la partida.',
      ],
      defeat: [
        'Excelente técnica. Tienes nivel de maestro nacional.',
        'Has jugado con una precisión extraordinaria hoy.',
      ],
      draw: [
        'Un empate disputado al más alto nivel.',
      ],
    },
  },
  {
    id: 'helena_rostova',
    name: 'Helena Rostova',
    avatar: '👑',
    rating: 2150,
    aiDifficulty: 7,
    playStyle: 'Positional',
    styleDescription: 'posicional',
    title: 'Maestra Nacional',
    preferredOpenings: ['Defensa Eslava', 'Apertura Catalana'],
    strength: 'Dominio total del centro y transiciones milimétricas a finales',
    weakness: 'Posiciones caóticas de doble filo',
    bio: 'Referente indiscutible del ajedrez nacional. Una maestra consumada de la estrategia profunda.',
    quotes: {
      preMatch: [
        'El ajedrez es arte, ciencia y lucha. Que gane la mejor mente.',
        'Cada jugada tuya debe tener un propósito claro.',
      ],
      victory: [
        'El control posicional no dejó fisuras para tu contrajuego.',
        'Una victoria fruto de la armonía entre mis piezas.',
      ],
      defeat: [
        'Eres un rival formidable. Tu progreso es inspirador.',
        'Una partida para enmarcar. Tienes madera de campeón.',
      ],
      draw: [
        'Unas tablas de altísimo vuelo técnico.',
      ],
    },
  },
  {
    id: 'alexei_volkov',
    name: 'Alexei Volkov',
    avatar: '🏆',
    rating: 2628,
    aiDifficulty: 8,
    playStyle: 'Balanced',
    styleDescription: 'impredecible',
    title: 'Campeón del Mundo AjedrezPro',
    preferredOpenings: ['Ruy López Berlinesa', 'Defensa Siciliana Najdorf', 'Gambito de Dama'],
    strength: 'Comprensión universal sin fisuras y cálculo supremo',
    weakness: 'Extremadamente exigente consigo mismo',
    bio: 'El rey indiscutible del circuito AjedrezPro. Nadie ha logrado arrebatarle la corona mundial en las últimas temporadas.',
    quotes: {
      preMatch: [
        'Has recorrido un largo camino para llegar hasta este match.',
        'El trono mundial no se regala. Prepárate para el mayor desafío de tu vida.',
      ],
      victory: [
        'La corona mundial permanece en su sitio.',
        'Buen intento, pero aún te falta temple de campeón supremo.',
      ],
      defeat: [
        '¡Increíble...! Has jugado con la perfección de una leyenda.',
        'Declaro inaugurada una nueva era en AjedrezPro. Eres el nuevo Campeón del Mundo.',
      ],
      draw: [
        'Un empate digno de la historia del ajedrez mundial.',
      ],
    },
  },
] as const;

export function getOpponentById(id: string): CareerOpponent | undefined {
  return CAREER_OPPONENTS.find((o) => o.id === id);
}

export function getOpponentsForTier(opponentIds: readonly string[]): CareerOpponent[] {
  return opponentIds
    .map((id) => getOpponentById(id))
    .filter((opp): opp is CareerOpponent => opp !== undefined);
}
