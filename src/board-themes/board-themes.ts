export type BoardThemeId =
  | 'classic'
  | 'walnut'
  | 'marble'
  | 'fide-blue'
  | 'dark-neon'
  | 'neon-cyber'
  | 'glass'
  | 'medieval'
  | 'royal-gold'
  | 'futuristic'
  | 'ocean'
  | 'cherry-blossom'
  | 'bilbao'
  | 'madrid'
  | 'paris'
  | 'london'
  | 'kids-castle';

export interface BoardThemeDefinition {
  readonly id: BoardThemeId;
  readonly name: string;
  readonly availability: 'free' | 'prepared';
  readonly lightSquare: string;
  readonly darkSquare: string;
  readonly frame: string;
  readonly lastMove: string;
  readonly selected: string;
  readonly legalMove: string;
  readonly coordinateLight: string;
  readonly coordinateDark: string;
}

export const BOARD_THEMES: readonly BoardThemeDefinition[] = [
  // --- FLAGSHIP 1: PREMIUM ROYALE (Steel Slate Blue + Deep Midnight Navy + Gold Frame) ---
  {
    id: 'classic',
    name: 'Royale Azul & Oro (Flagship)',
    availability: 'free',
    lightSquare: '#96B0C6', // Luminous clean slate-steel blue (maximum contrast for white and black pieces)
    darkSquare: '#1B2A38', // Deep midnight navy-obsidian
    frame: '#D4AF37', // Metallic gold border
    lastMove: '#00D2FF', // Electric cyan last move
    selected: '#00E5FF', // Electric cyan halo
    legalMove: '#00D2FF', // Electric cyan dot
    coordinateLight: '#152A3D', // High-contrast navy on light square
    coordinateDark: '#D6E3EF', // High-contrast ice-blue on dark square
  },
  {
    id: 'fide-blue',
    name: 'Azul Torneo FIDE',
    availability: 'free',
    lightSquare: '#DEEBF5',
    darkSquare: '#335E8A',
    frame: '#1A365D',
    lastMove: '#63B3ED',
    selected: '#00D2FF',
    legalMove: '#00D2FF',
    coordinateLight: '#1E3A5F',
    coordinateDark: '#F0F6FC',
  },
  {
    id: 'dark-neon',
    name: 'Neón Cyberpunk',
    availability: 'free',
    lightSquare: '#3B6888',
    darkSquare: '#0E1F2E',
    frame: '#00D2FF',
    lastMove: '#00E5FF',
    selected: '#00E5FF',
    legalMove: '#00D2FF',
    coordinateLight: '#071520',
    coordinateDark: '#7DD3FC',
  },
  {
    id: 'walnut',
    name: 'Madera Nogal Real',
    availability: 'free',
    lightSquare: '#EBD2B0',
    darkSquare: '#7A4B29',
    frame: '#522F15',
    lastMove: '#D4A359',
    selected: '#F6CE7C',
    legalMove: '#F6CE7C',
    coordinateLight: '#4A2A12',
    coordinateDark: '#FBF3E8',
  },
  {
    id: 'marble',
    name: 'Mármol de Carrara',
    availability: 'free',
    lightSquare: '#E8EEF5',
    darkSquare: '#4A5A6D',
    frame: '#2D3748',
    lastMove: '#CBD5E0',
    selected: '#63B3ED',
    legalMove: '#63B3ED',
    coordinateLight: '#25303D',
    coordinateDark: '#F8FAFC',
  },
  {
    id: 'royal-gold',
    name: 'Oro Imperial',
    availability: 'prepared',
    lightSquare: '#E2C275',
    darkSquare: '#261D0D',
    frame: '#E5B869',
    lastMove: '#FFD700',
    selected: '#FFF1A3',
    legalMove: '#FFD700',
    coordinateLight: '#3D2806',
    coordinateDark: '#FFE5A3',
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    availability: 'prepared',
    lightSquare: '#327288',
    darkSquare: '#0B1E2B',
    frame: '#00E5FF',
    lastMove: '#B7FF00',
    selected: '#FF4DDA',
    legalMove: '#FF4DDA',
    coordinateLight: '#05181F',
    coordinateDark: '#D7FFF2',
  },
  {
    id: 'glass',
    name: 'Cristal Traslúcido',
    availability: 'prepared',
    lightSquare: '#DCEAF4',
    darkSquare: '#56758D',
    frame: '#B5D6E8',
    lastMove: '#8BC4E2',
    selected: '#F5C451',
    legalMove: '#F5C451',
    coordinateLight: '#1C3140',
    coordinateDark: '#EDF7FC',
  },
  {
    id: 'medieval',
    name: 'Medieval Forjado',
    availability: 'prepared',
    lightSquare: '#E6D2A6',
    darkSquare: '#6E4731',
    frame: '#A76A37',
    lastMove: '#D6A943',
    selected: '#E9B75A',
    legalMove: '#E9B75A',
    coordinateLight: '#3A2012',
    coordinateDark: '#F7E8C8',
  },
  {
    id: 'futuristic',
    name: 'Titanio Futurista',
    availability: 'prepared',
    lightSquare: '#D5D9FF',
    darkSquare: '#323B85',
    frame: '#7D8CFF',
    lastMove: '#43D8FF',
    selected: '#00D2FF',
    legalMove: '#43D8FF',
    coordinateLight: '#171E4B',
    coordinateDark: '#E9EBFF',
  },
  {
    id: 'ocean',
    name: 'Océano Abisal',
    availability: 'prepared',
    lightSquare: '#CBEFF2',
    darkSquare: '#005459',
    frame: '#00838F',
    lastMove: '#4DD0E1',
    selected: '#80DEEA',
    legalMove: '#80DEEA',
    coordinateLight: '#002B26',
    coordinateDark: '#B2EBF2',
  },
  {
    id: 'cherry-blossom',
    name: 'Sakura Zen',
    availability: 'prepared',
    lightSquare: '#FCE4EC',
    darkSquare: '#AD1457',
    frame: '#D81B60',
    lastMove: '#F06292',
    selected: '#F8BBD0',
    legalMove: '#F8BBD0',
    coordinateLight: '#4A052A',
    coordinateDark: '#F8BBD0',
  },
  {
    id: 'bilbao',
    name: 'Bilbao Acero & Titanio',
    availability: 'free',
    lightSquare: '#B0BEC5',
    darkSquare: '#263238',
    frame: '#37474F',
    lastMove: '#00E5FF',
    selected: '#00E5FF',
    legalMove: '#00E5FF',
    coordinateLight: '#1C2833',
    coordinateDark: '#ECEFF1',
  },
  {
    id: 'madrid',
    name: 'Madrid Granito & Oro',
    availability: 'free',
    lightSquare: '#E0E0E0',
    darkSquare: '#424242',
    frame: '#D4AF37',
    lastMove: '#FFD700',
    selected: '#FFD700',
    legalMove: '#FFD700',
    coordinateLight: '#212121',
    coordinateDark: '#F5F5F5',
  },
  {
    id: 'paris',
    name: 'París Mármol & Ébano',
    availability: 'free',
    lightSquare: '#E8EAF6',
    darkSquare: '#283593',
    frame: '#1A237E',
    lastMove: '#5C6BC0',
    selected: '#7986CB',
    legalMove: '#7986CB',
    coordinateLight: '#1A237E',
    coordinateDark: '#E8EAF6',
  },
  {
    id: 'london',
    name: 'Londres Madera Victoriana',
    availability: 'free',
    lightSquare: '#D7CCC8',
    darkSquare: '#4E342E',
    frame: '#3E2723',
    lastMove: '#8D6E63',
    selected: '#A1887F',
    legalMove: '#A1887F',
    coordinateLight: '#3E2723',
    coordinateDark: '#EFEBE9',
  },
  {
    id: 'kids-castle',
    name: 'Castillo Mágico Kids',
    availability: 'free',
    lightSquare: '#E8EEFF',
    darkSquare: '#5A67D8',
    frame: '#4C51BF',
    lastMove: '#F6AD55',
    selected: '#68D391',
    legalMove: '#F6AD55',
    coordinateLight: '#3C366B',
    coordinateDark: '#EDE9FE',
  },
];

export function boardThemeById(id: BoardThemeId): BoardThemeDefinition {
  return BOARD_THEMES.find((theme) => theme.id === id) ?? BOARD_THEMES[0];
}
