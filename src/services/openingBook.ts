export type OpeningFamily = 'e4' | 'd4' | 'flank';

export interface OpeningVariant {
  readonly eco: string;
  readonly name: string;
  readonly family: OpeningFamily;
  readonly familyLabel: string;
  readonly moves: readonly string[]; // SAN moves
  readonly fen?: string;
  readonly description: string;
  readonly strategicIdeas: readonly string[];
  readonly keySquares: readonly string[];
}

export const OPENINGS_DATABASE: readonly OpeningVariant[] = [
  // ==========================================
  // 1.e4: DEFENSA SICILIANA (B20 - B99)
  // ==========================================
  {
    eco: 'B90',
    name: 'Defensa Siciliana: Variante Najdorf',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
    description: 'La variante más popular y dinámica del ajedrez, favorita de Fischer y Kasparov. El movimiento ...a6 prepara la expansión en el flanco de dama y previene saltos a b5.',
    strategicIdeas: [
      'Control y ruptura con ...e5 o ...e6 según el plan blanco.',
      'Ataque en la columna abierta c con ...Rc8.',
      'Expansión en el flanco de dama mediante ...b5 y ...Bb7.',
    ],
    keySquares: ['d5', 'e5', 'c5', 'b5'],
  },
  {
    eco: 'B70',
    name: 'Defensa Siciliana: Variante del Dragón',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6'],
    description: 'Apertura hiper-agresiva caracterizada por la estructura de peones d6-e7-f7-g6-h7 (en forma de dragón) y el alfil fianchetado en g7.',
    strategicIdeas: [
      'Presión feroz sobre la diagonal larga h8-a1 con el alfil en g7.',
      'Lucha de enroques opuestos con avalancha mutua de peones.',
      'Sacrificio temático de calidad ...Rxc3 para destrozar el enroque blanco.',
    ],
    keySquares: ['d4', 'c3', 'g7', 'h2'],
  },
  {
    eco: 'B33',
    name: 'Defensa Siciliana: Variante Sveshnikov',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e5'],
    description: 'Las negras aceptan un peón retrasado en d6 y una debilidad en d5 a cambio de un tremendo dinamismo y actividad de piezas.',
    strategicIdeas: [
      'Compensar la casilla débil d5 mediante la actividad de piezas menores.',
      'Ruptura con ...f5 en el flanco de rey.',
      'Pareja de alfiles y control de casillas centrales oscuras.',
    ],
    keySquares: ['d5', 'd6', 'f5', 'e5'],
  },
  {
    eco: 'B22',
    name: 'Defensa Siciliana: Variante Alapin (2.c3)',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'c5', 'c3'],
    description: 'Trata de construir un centro clásico de peones con d4 evitando la teoría principal de la Siciliana abierta.',
    strategicIdeas: [
      'Construcción de un sólido centro con d4 tras 2.c3.',
      'Respuestas negras clásicas: 2...d5 o 2...Nf6.',
      'Estructuras derivadas del Gambito de Dama o Francesa.',
    ],
    keySquares: ['d4', 'd5', 'c3'],
  },
  {
    eco: 'B23',
    name: 'Defensa Siciliana: Variante Cerrada',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'c5', 'Nc3', 'Nc6', 'g3'],
    description: 'Apertura posicional sin abrir el centro de inmediato con d4, buscando expansión en el flanco de rey con f4.',
    strategicIdeas: [
      'Fianchetto del alfil en g2 y avance f4-f5.',
      'Las negras expanden en el flanco de dama con ...b5 y ...Rb8.',
      'Juego maniobrero de largo aliento.',
    ],
    keySquares: ['d4', 'f4', 'b5', 'g2'],
  },
  {
    eco: 'B40',
    name: 'Defensa Siciliana: Variante Paulsen / Kan',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'a6'],
    description: 'Gran flexibilidad posicional, retrasando el desarrollo de los caballos para adaptar la estructura de peones.',
    strategicIdeas: [
      'Flexibilidad para pasar a Scheveningen o erizo.',
      'Control de b5 con ...a6 y rápido desarrollo de dama a c7.',
      'Contención del centro blanco.',
    ],
    keySquares: ['b5', 'c7', 'e5'],
  },
  {
    eco: 'B20',
    name: 'Defensa Siciliana: Apertura Base',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'c5'],
    description: 'La respuesta más asimétrica y combativa contra 1.e4, luchando por el centro desde el flanco.',
    strategicIdeas: [
      'Creación de mayoría de peones centrales tras la captura ...cxd4.',
      'Columna semiabierta c para la torre.',
    ],
    keySquares: ['d4', 'c5', 'e4'],
  },

  // ==========================================
  // 1.e4: APERTURA ESPAÑOLA / RUY LÓPEZ (C60 - C99)
  // ==========================================
  {
    eco: 'C60',
    name: 'Apertura Española (Ruy López)',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'],
    description: 'Una de las aperturas más profundas y prestigiosas de la historia, presionando indirectamente el peón de e5.',
    strategicIdeas: [
      'Presión sobre el caballo de c6 que defiende e5.',
      'Preparación de c3 y d4 para dominar el centro.',
      'Maniobra típica de caballo Nb1-d2-f1-g3.',
    ],
    keySquares: ['c6', 'e5', 'd4', 'f5'],
  },
  {
    eco: 'C65',
    name: 'Apertura Española: Defensa Berlinesa',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6'],
    description: 'El "Muro de Berlín", popularizado por Kramnik en su victoria sobre Kasparov en el 2000.',
    strategicIdeas: [
      'Final sin damas ultra-sólido con pareja de alfiles negros.',
      'Mayoría de peones 4 contra 3 en el flanco de rey para las blancas.',
      'Juego defensivo casi inexpugnable para las negras.',
    ],
    keySquares: ['d6', 'e4', 'c7'],
  },
  {
    eco: 'C88',
    name: 'Apertura Española: Variante Cerrada',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O'],
    description: 'La línea principal más rica del ajedrez clásico, con planes estratégicos profundos para ambos bandos.',
    strategicIdeas: [
      'Consolidación del centro con h3, d4 y Nbd2-f1-g3.',
      'Las negras buscan contrajuego con ...Na5 y ...c5 (Variante Chigorin).',
      'Lucha de maniobras a largo plazo.',
    ],
    keySquares: ['d4', 'c5', 'a5', 'f5'],
  },
  {
    eco: 'C89',
    name: 'Apertura Española: Contraataque Marshall',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'O-O', 'c3', 'd5'],
    description: 'Sacrificio legendario de peón creado por Frank Marshall para lanzar un ataque fulminante contra el rey blanco.',
    strategicIdeas: [
      'Sacrificio del peón de d5 por una tremenda iniciativa de ataque.',
      'Ataque directo al enroque blanco con ...Qh4 y ...Bd6.',
      'Las blancas deben defenderse con precisión quirúrgica.',
    ],
    keySquares: ['d5', 'h4', 'h2', 'e4'],
  },
  {
    eco: 'C68',
    name: 'Apertura Española: Variante del Cambio',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Bxc6', 'dxc6'],
    description: 'Las blancas dañan la estructura de peones negra creando una mayoría 4 contra 3 en el flanco de rey.',
    strategicIdeas: [
      'Transición a finales donde la mayoría de peones blanca genera un peón pasado.',
      'Las negras compensan con la pareja de alfiles en posición abierta.',
    ],
    keySquares: ['d4', 'e5', 'c6', 'f4'],
  },

  // ==========================================
  // 1.e4: APERTURA ITALIANA Y OTRAS ABIERTAS (C20 - C59)
  // ==========================================
  {
    eco: 'C50',
    name: 'Apertura Italiana: Giuoco Piano',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'],
    description: 'Apertura clásica centenaria que apunta directamente a la casilla más débil del rival: f7.',
    strategicIdeas: [
      'Ataque al punto f7 con Bc4.',
      'Construcción del centro con c3 y d4 (o juego posicional Giuoco Pianissimo con d3).',
      'Desarrollo armónico de piezas menores.',
    ],
    keySquares: ['f7', 'c4', 'd4', 'c3'],
  },
  {
    eco: 'C51',
    name: 'Apertura Italiana: Gambito Evans',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4'],
    description: 'Sacrificio romántico de peón en b4 para acelerar el centro con c3 y d4 y abrir diagonales de ataque.',
    strategicIdeas: [
      'Sacrificar el peón b4 para ganar tiempos con c3 y d4.',
      'Presión sobre el rey negro antes de que consiga enrocarse.',
    ],
    keySquares: ['b4', 'c3', 'd4', 'f7'],
  },
  {
    eco: 'C55',
    name: 'Defensa de los Dos Caballos',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6'],
    description: 'Respuesta dinámica y contraatacante contra el alfil italiano.',
    strategicIdeas: [
      'Si 4.Ng5, las negras responden con el contragambito 4...d5 5.exd5 Na5.',
      'Actividad táctica frenética a cambio de un peón.',
    ],
    keySquares: ['g5', 'f7', 'd5', 'a5'],
  },
  {
    eco: 'C45',
    name: 'Apertura Escocesa',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4'],
    description: 'Ruptura central inmediata en la jugada 3, popularizada por Garry Kasparov en campeonatos mundiales.',
    strategicIdeas: [
      'Apertura inmediata de líneas centrales.',
      'Presión rápida sobre c6 con Nxd4 o Qf3.',
    ],
    keySquares: ['d4', 'c6', 'e5'],
  },
  {
    eco: 'C42',
    name: 'Defensa Petroff (Rusa)',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'e5', 'Nf3', 'Nf6'],
    description: 'Defensa simétrica altamente resistente contra 1.e4, base del repertorio de Karpov y Caruana.',
    strategicIdeas: [
      'Contrataque simétrico al peón de e4.',
      'Sólida estructura central con d6 y d5.',
      'Alta tasa de solidez posicional.',
    ],
    keySquares: ['e4', 'e5', 'd5'],
  },
  {
    eco: 'C30',
    name: 'Gambito de Rey',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'e5', 'f4'],
    description: 'El gambito romántico por excelencia: se ofrece el peón f4 para desviar el centro negro y abrir la columna f.',
    strategicIdeas: [
      'Eliminar el peón central negro para dominar con d4.',
      'Ataque por la columna abierta f tras el enroque corto.',
    ],
    keySquares: ['f4', 'd4', 'f7'],
  },
  {
    eco: 'C20',
    name: 'Apertura de Peón de Rey',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'e5'],
    description: 'La respuesta clásica por excelencia, dominando el centro y abriendo paso a la dama y al alfil.',
    strategicIdeas: ['Lucha simétrica por el centro', 'Desarrollo rápido de piezas menores.'],
    keySquares: ['d4', 'd5', 'e4', 'e5'],
  },

  // ==========================================
  // 1.e4: SEMIABIERTAS (FRANCESA, CARO-KANN, ESCANDINAVA, PIRC, ALEKHINE)
  // ==========================================
  {
    eco: 'C00',
    name: 'Defensa Francesa: Apertura Base',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'e6'],
    description: 'Prepara la lucha central con ...d5. Caracterizada por cadenas de peones cerradas y contragolpes en el flanco de dama.',
    strategicIdeas: [
      'Rupturas temáticas con ...c5 y ...f6 contra la cadena blanca.',
      'El "alfil malo" de casillas blancas en c8 requiere maniobras especiales.',
    ],
    keySquares: ['d5', 'e6', 'c5', 'c8'],
  },
  {
    eco: 'C02',
    name: 'Defensa Francesa: Variante del Avance',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'e6', 'd4', 'd5', 'e5'],
    description: 'Las blancas cierran el centro con e5, ganando espacio en el flanco de rey mientras las negras presionan d4.',
    strategicIdeas: [
      'Presión negra sobre d4 con ...c5, ...Nc6, ...Qb6.',
      'Las blancas defienden la cadena con c3 y atacan en el flanco de rey.',
    ],
    keySquares: ['d4', 'e5', 'c5', 'b6'],
  },
  {
    eco: 'C15',
    name: 'Defensa Francesa: Variante Winawer',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4'],
    description: 'Clavada agresiva del caballo en c3 que genera estructuras muy asimétricas y dinámicas.',
    strategicIdeas: [
      'Doblar los peones blancos en c3 tras ...Bxc3+.',
      'Ataque blanco con Qg4 aprovechando la ausencia del alfil de casillas negras.',
    ],
    keySquares: ['c3', 'b4', 'g7', 'g4'],
  },
  {
    eco: 'B12',
    name: 'Defensa Caro-Kann: Variante del Avance',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5'],
    description: 'A diferencia de la Francesa, en la Caro-Kann el alfil de casillas blancas sale activamente a f5 antes de jugar ...e6.',
    strategicIdeas: [
      'Desarrollo del alfil a f5 y posterior solidez con ...e6.',
      'Ruptura con ...c5 para socavar el centro blanco.',
    ],
    keySquares: ['f5', 'c5', 'e5', 'd4'],
  },
  {
    eco: 'B10',
    name: 'Defensa Caro-Kann: Apertura Base',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'c6'],
    description: 'Una de las defensas más sólidas y confiables del ajedrez, preparando ...d5 con el respaldo de c6.',
    strategicIdeas: [
      'Estructura de peones impecable.',
      'Transición favorable a finales.',
    ],
    keySquares: ['d5', 'c6', 'e4'],
  },
  {
    eco: 'B01',
    name: 'Defensa Escandinava',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'd5'],
    description: 'Desafío directo e instantáneo al peón de e4 en la jugada 1.',
    strategicIdeas: [
      'Tras 2.exd5 Qxd5 3.Nc3 Qa5, las negras buscan desarrollo armónico con ...c6 y ...Bf5.',
      'Línea moderna con 2...Nf6 (Gambito Escandinavo/Portugués).',
    ],
    keySquares: ['d5', 'a5', 'c6'],
  },
  {
    eco: 'B02',
    name: 'Defensa Alekhine',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'Nf6'],
    description: 'Apertura hipermoderna: provoca el avance de los peones blancos (e5, d4, c4) para luego atacarlos como debilidades.',
    strategicIdeas: [
      'Atraer y sobreextender el centro de peones blanco.',
      'Atacar la base de peones con ...d6 y ...c5.',
    ],
    keySquares: ['e5', 'd4', 'd6'],
  },
  {
    eco: 'B07',
    name: 'Defensa Pirc',
    family: 'e4',
    familyLabel: 'Aperturas de Peón de Rey (1.e4)',
    moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6'],
    description: 'Permite al blanco ocupar el centro entero para atacarlo lateralmente con alfil en g7 y rupturas ...e5 o ...c5.',
    strategicIdeas: [
      'Fianchetto en g7 y contrajuego en el flanco de dama.',
      'Rupturas centrales oportunas.',
    ],
    keySquares: ['g7', 'e5', 'c5', 'd4'],
  },

  // ==========================================
  // 1.d4: GAMBITO DE DAMA Y CERRADAS (D00 - D69)
  // ==========================================
  {
    eco: 'D30',
    name: 'Gambito de Dama Declinado',
    family: 'd4',
    familyLabel: 'Aperturas de Peón de Dama (1.d4)',
    moves: ['d4', 'd5', 'c4', 'e6'],
    description: 'El pilar clásico del ajedrez de torneo. Las negras defienden firmemente d5 con el peón e6.',
    strategicIdeas: [
      'Mantener la cuña central en d5.',
      'Liberar el alfil de c8 mediante la ruptura ...c5 o ...e5.',
      'Estructuras de peón aislado en d4 o d5 (IQP).',
    ],
    keySquares: ['d5', 'c4', 'e6', 'c5'],
  },
  {
    eco: 'D20',
    name: 'Gambito de Dama Aceptado',
    family: 'd4',
    familyLabel: 'Aperturas de Peón de Dama (1.d4)',
    moves: ['d4', 'd5', 'c4', 'dxc4'],
    description: 'Las negras ceden temporalmente el centro para desarrollar piezas rápidamente y atacar el peón blanco con ...c5.',
    strategicIdeas: [
      'No intentar defender c4 con ...b5; buscar contragolpe con ...c5 y ...a6-...b5.',
      'Aprovechar diagonales abiertas para los alfiles.',
    ],
    keySquares: ['c4', 'c5', 'd4'],
  },
  {
    eco: 'D10',
    name: 'Defensa Eslava',
    family: 'd4',
    familyLabel: 'Aperturas de Peón de Dama (1.d4)',
    moves: ['d4', 'd5', 'c4', 'c6'],
    description: 'Una de las defensas más sólidas de la élite mundial. Apoya d5 con c6 sin bloquear la diagonal del alfil de c8.',
    strategicIdeas: [
      'Desarrollo del alfil de casillas blancas a f5 o g4 tras dxc4.',
      'Estructuras ultrarresistentes en el centro.',
    ],
    keySquares: ['d5', 'c6', 'f5', 'b4'],
  },
  {
    eco: 'D43',
    name: 'Defensa Semi-Eslava',
    family: 'd4',
    familyLabel: 'Aperturas de Peón de Dama (1.d4)',
    moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'e6'],
    description: 'Combina la solidez de la Eslava con el dinamismo del Gambito Declinado (Variantes Botvinnik y Merano).',
    strategicIdeas: [
      'Complejidad táctica mayúscula en la variante Merano (...dxc4, ...b5, ...a6, ...c5).',
      'Lucha aguda con sacrificios de piezas.',
    ],
    keySquares: ['e6', 'c6', 'b5', 'c5'],
  },
  {
    eco: 'D02',
    name: 'Sistema Londres',
    family: 'd4',
    familyLabel: 'Aperturas de Peón de Dama (1.d4)',
    moves: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4'],
    description: 'Apertura esquemática extremadamente sólida y popular, con desarrollo rápido del alfil a f4 antes de e3.',
    strategicIdeas: [
      'Estructura piramidal con c3, d4, e3.',
      'Instalación del caballo en el puesto avanzado e5.',
      'Ataque en el flanco de rey con Bd3, Nbd2 y Ne5.',
    ],
    keySquares: ['f4', 'e5', 'd4', 'c3'],
  },
  {
    eco: 'D00',
    name: 'Apertura de Peón de Dama',
    family: 'd4',
    familyLabel: 'Aperturas de Peón de Dama (1.d4)',
    moves: ['d4', 'd5'],
    description: 'La respuesta simétrica fundamental contra 1.d4.',
    strategicIdeas: ['Control central y desarrollo controlado.'],
    keySquares: ['d4', 'd5', 'e4'],
  },

  // ==========================================
  // 1.d4: DEFENSAS INDIAS (E00 - E99)
  // ==========================================
  {
    eco: 'E60',
    name: 'Defensa India de Rey: Apertura Base',
    family: 'd4',
    familyLabel: 'Aperturas de Peón de Dama (1.d4)',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7'],
    description: 'La defensa combativa favorita de leyendas como Kasparov y Fischer. Cede espacio para lanzar un ataque masivo en el flanco de rey.',
    strategicIdeas: [
      'Ruptura central con ...e5.',
      'Avanzar los peones del flanco de rey con ...f5 y ...f4.',
      'Lanzar un ataque directo contra el rey blanco.',
    ],
    keySquares: ['e5', 'f5', 'f4', 'g7'],
  },
  {
    eco: 'E97',
    name: 'Defensa India de Rey: Variante Mar del Plata',
    family: 'd4',
    familyLabel: 'Aperturas de Peón de Dama (1.d4)',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6', 'd5', 'Ne7'],
    description: 'La batalla más feroz del ajedrez: las blancas atacan en el flanco de dama con c5 mientras las negras dan mate en el flanco de rey con ...f5-...g5-...g4.',
    strategicIdeas: [
      'Blancas: Ruptura c5 y apertura de líneas en el flanco de dama.',
      'Negras: Maniobra ...Ne8, ...f5, ...g5, ...f4, ...g4 para dar mate.',
    ],
    keySquares: ['c5', 'f5', 'g4', 'h2'],
  },
  {
    eco: 'E20',
    name: 'Defensa Nimzoindia',
    family: 'd4',
    familyLabel: 'Aperturas de Peón de Dama (1.d4)',
    moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4'],
    description: 'Defensa de máxima reputación estratégica ideada por Aron Nimzowitsch. Clava el caballo de c3 para evitar e4.',
    strategicIdeas: [
      'Evitar e4 mediante la clavada del caballo en c3.',
      'Posibilidad de doblar peones blancos con ...Bxc3+.',
      'Bloqueo posicional y juego sobre casillas de color opuesto.',
    ],
    keySquares: ['b4', 'e4', 'c3', 'd5'],
  },
  {
    eco: 'E12',
    name: 'Defensa India de Dama',
    family: 'd4',
    familyLabel: 'Aperturas de Peón de Dama (1.d4)',
    moves: ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'b6'],
    description: 'Fianchetto del alfil en b7 para controlar la casilla clave e4.',
    strategicIdeas: [
      'Control férreo de la casilla e4 con ...Bb7 y ...Ne4.',
      'Juego hipermoderno y maniobras precisas.',
    ],
    keySquares: ['e4', 'b7', 'd5'],
  },
  {
    eco: 'D85',
    name: 'Defensa Grünfeld',
    family: 'd4',
    familyLabel: 'Aperturas de Peón de Dama (1.d4)',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'cxd5', 'Nxd5', 'e4', 'Nxc3', 'bxc3', 'Bg7'],
    description: 'Las negras permiten a las blancas ocupar el centro entero con peones para después demolerlo con ...c5, ...Bg7 y ...Qa5.',
    strategicIdeas: [
      'Presión implacable sobre el peón blanco de d4.',
      'Ruptura con ...c5 y presión de la torre en la columna c.',
    ],
    keySquares: ['d4', 'c5', 'g7', 'a1'],
  },
  {
    eco: 'A60',
    name: 'Defensa Benoni Moderna',
    family: 'd4',
    familyLabel: 'Aperturas de Peón de Dama (1.d4)',
    moves: ['d4', 'Nf6', 'c4', 'c5', 'd5', 'e6'],
    description: 'Crea una desbalanceada estructura con mayoría de peones negra 3 contra 2 en el flanco de dama.',
    strategicIdeas: [
      'Mayoría de peones en flanco de dama con ...a6 y ...b5.',
      'El alfil de g7 domina la gran diagonal.',
    ],
    keySquares: ['d5', 'b5', 'e5', 'g7'],
  },
  {
    eco: 'A57',
    name: 'Gambito Benko (Volga)',
    family: 'd4',
    familyLabel: 'Aperturas de Peón de Dama (1.d4)',
    moves: ['d4', 'Nf6', 'c4', 'c5', 'd5', 'b5'],
    description: 'Sacrificio posicional de peón por presión semi-permanente en las columnas a y b.',
    strategicIdeas: [
      'Presión posicional en las columnas a y b contra los peones blancos a2 y b2.',
      'El alfil en g7 y las torres en a8 y b8 dictan el juego.',
    ],
    keySquares: ['a2', 'b2', 'b5', 'a8'],
  },
  {
    eco: 'E00',
    name: 'Apertura Catalana',
    family: 'd4',
    familyLabel: 'Aperturas de Peón de Dama (1.d4)',
    moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2'],
    description: 'Combina el Gambito de Dama con el fianchetto del alfil en g2, arma predilecta de Kramnik y Carlsen.',
    strategicIdeas: [
      'El alfil de g2 ejerce tremenda presión a través de toda la diagonal hacia el flanco de dama.',
      'Presión posicional sin prisas.',
    ],
    keySquares: ['g2', 'c4', 'd5', 'b7'],
  },
  {
    eco: 'A80',
    name: 'Defensa Holandesa',
    family: 'd4',
    familyLabel: 'Aperturas de Peón de Dama (1.d4)',
    moves: ['d4', 'f5'],
    description: 'Contrataque asimétrico para controlar e4 desde el primer movimiento.',
    strategicIdeas: [
      'Control de e4 y ataque en el flanco de rey.',
      'Variantes Muro de Piedra (Stonewall) o Leningrado con ...g6.',
    ],
    keySquares: ['e4', 'f5', 'e6'],
  },

  // ==========================================
  // APERTURAS DE FLANCO E HIPERMODERNAS (A00 - A39)
  // ==========================================
  {
    eco: 'A10',
    name: 'Apertura Inglesa',
    family: 'flank',
    familyLabel: 'Aperturas de Flanco e Hipermodernas',
    moves: ['c4'],
    description: 'Controla la casilla central d5 desde el flanco sin comprometer los peones centrales e/d de inmediato.',
    strategicIdeas: [
      'Control de d5 con c4 y Nc3.',
      'Transposición flexible a esquemas de d4 o Siciliana con colores invertidos.',
    ],
    keySquares: ['d5', 'c4', 'g2'],
  },
  {
    eco: 'A04',
    name: 'Apertura Réti',
    family: 'flank',
    familyLabel: 'Aperturas de Flanco e Hipermodernas',
    moves: ['Nf3'],
    description: 'Obra maestra hipermoderna creada por Richard Réti. Desarrolla el caballo y controla d4/e5 con máxima flexibilidad.',
    strategicIdeas: [
      'Presión indirecta sobre el centro rival mediante fianchettos.',
      'Excelente flexibilidad para transponer.',
    ],
    keySquares: ['e5', 'd4', 'g2'],
  },
  {
    eco: 'A02',
    name: 'Apertura Bird',
    family: 'flank',
    familyLabel: 'Aperturas de Flanco e Hipermodernas',
    moves: ['f4'],
    description: 'Apertura agresiva que busca controlar e5 desde el primer turno.',
    strategicIdeas: [
      'Control de e5 con f4 y Nf3.',
      'Ataque directo al flanco de rey.',
    ],
    keySquares: ['e5', 'f4', 'd5'],
  },
  {
    eco: 'A01',
    name: 'Ataque Nimzo-Larsen',
    family: 'flank',
    familyLabel: 'Aperturas de Flanco e Hipermodernas',
    moves: ['b3'],
    description: 'Fianchetto inmediato en b2 para presionar la gran diagonal hacia el flanco de rey negro.',
    strategicIdeas: [
      'El alfil en b2 controla e5 y f6.',
      'Apertura no convencional para sacar al rival de la preparación teórica.',
    ],
    keySquares: ['b2', 'e5', 'f6'],
  },
];

/**
 * Detects the deepest matching opening from a sequence of played SAN moves.
 */
export function detectOpening(moveSans: readonly string[]): OpeningVariant | null {
  if (!moveSans || moveSans.length === 0) return null;

  let bestMatch: OpeningVariant | null = null;
  let maxMatchedMoves = 0;

  for (const opening of OPENINGS_DATABASE) {
    if (opening.moves.length > moveSans.length) continue;

    let isMatch = true;
    for (let i = 0; i < opening.moves.length; i++) {
      if (opening.moves[i] !== moveSans[i]) {
        isMatch = false;
        break;
      }
    }

    if (isMatch && opening.moves.length > maxMatchedMoves) {
      maxMatchedMoves = opening.moves.length;
      bestMatch = opening;
    }
  }

  return bestMatch;
}

export function getOpeningByEco(eco: string): OpeningVariant | null {
  return OPENINGS_DATABASE.find((op) => op.eco.toLowerCase() === eco.toLowerCase()) ?? null;
}

export function searchOpenings(query: string, familyFilter?: OpeningFamily): OpeningVariant[] {
  const normalized = query.trim().toLowerCase();
  return OPENINGS_DATABASE.filter((op) => {
    if (familyFilter && op.family !== familyFilter) return false;
    if (!normalized) return true;
    return (
      op.name.toLowerCase().includes(normalized) ||
      op.eco.toLowerCase().includes(normalized) ||
      op.description.toLowerCase().includes(normalized)
    );
  });
}
