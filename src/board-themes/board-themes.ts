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
  | 'cherry-blossom';

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
  // --- FLAGSHIP 1: PREMIUM ROYALE (Deep Obsidian Black + Electric Sapphire Blue + Metallic Gold Frame) ---
  {
    id: 'classic',
    name: 'Royale Azul & Oro (Flagship)',
    availability: 'free',
    lightSquare: '#233E5D', // Sapphire stone
    darkSquare: '#080E16', // Deep obsidian black
    frame: '#D4AF37', // Metallic gold border
    lastMove: '#00D2FF', // Electric cyan last move
    selected: '#00E5FF', // Electric cyan halo
    legalMove: '#00D2FF', // Electric cyan dot
    coordinateLight: '#8AB4F8',
    coordinateDark: '#E5B869', // Gold coordinate
  },
  {
    id: 'dark-neon',
    name: 'Neón Cyberpunk',
    availability: 'free',
    lightSquare: '#10384F',
    darkSquare: '#050D14',
    frame: '#00D2FF',
    lastMove: '#00E5FF',
    selected: '#00E5FF',
    legalMove: '#00D2FF',
    coordinateLight: '#38BDF8',
    coordinateDark: '#7DD3FC',
  },
  {
    id: 'royal-gold',
    name: 'Oro Imperial',
    availability: 'prepared',
    lightSquare: '#E2C275',
    darkSquare: '#1E1608',
    frame: '#E5B869',
    lastMove: '#FFD700',
    selected: '#FFF1A3',
    legalMove: '#FFD700',
    coordinateLight: '#3D2806',
    coordinateDark: '#FFE5A3',
  },
  {
    id: 'fide-blue',
    name: 'Azul Torneo FIDE',
    availability: 'free',
    lightSquare: '#DCEAF4',
    darkSquare: '#2B547E',
    frame: '#1A365D',
    lastMove: '#63B3ED',
    selected: '#00D2FF',
    legalMove: '#00D2FF',
    coordinateLight: '#234465',
    coordinateDark: '#EDF2F7',
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
    coordinateLight: '#653C1D',
    coordinateDark: '#F8E7D1',
  },
  {
    id: 'marble',
    name: 'Mármol de Carrara',
    availability: 'free',
    lightSquare: '#E2E8F0',
    darkSquare: '#4A5568',
    frame: '#2D3748',
    lastMove: '#CBD5E0',
    selected: '#63B3ED',
    legalMove: '#63B3ED',
    coordinateLight: '#323E50',
    coordinateDark: '#F7FAFC',
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    availability: 'prepared',
    lightSquare: '#164E63',
    darkSquare: '#081622',
    frame: '#00E5FF',
    lastMove: '#B7FF00',
    selected: '#FF4DDA',
    legalMove: '#FF4DDA',
    coordinateLight: '#075650',
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
    coordinateLight: '#3F5B70',
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
    coordinateLight: '#5A3523',
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
    coordinateLight: '#27306B',
    coordinateDark: '#E9EBFF',
  },
  {
    id: 'ocean',
    name: 'Océano Abisal',
    availability: 'prepared',
    lightSquare: '#E0F7FA',
    darkSquare: '#006064',
    frame: '#00838F',
    lastMove: '#4DD0E1',
    selected: '#80DEEA',
    legalMove: '#80DEEA',
    coordinateLight: '#004D40',
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
    coordinateLight: '#880E4F',
    coordinateDark: '#F8BBD0',
  },
];

export function boardThemeById(id: BoardThemeId): BoardThemeDefinition {
  return BOARD_THEMES.find((theme) => theme.id === id) ?? BOARD_THEMES[0];
}
