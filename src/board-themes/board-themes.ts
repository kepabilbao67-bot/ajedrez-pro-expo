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
  // --- 5 FLAGSHIP HD THEMES (V1.3 MASTER EDITION) ---
  {
    id: 'classic',
    name: 'Esmeralda Clásico',
    availability: 'free',
    lightSquare: '#E9DFC9',
    darkSquare: '#35614D',
    frame: '#B9934A',
    lastMove: '#C5A94F',
    selected: '#FFE28A',
    legalMove: 'rgba(255, 226, 138, 0.88)',
    coordinateLight: '#315C4A',
    coordinateDark: '#F4E9D0',
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
    legalMove: 'rgba(246, 206, 124, 0.85)',
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
    legalMove: 'rgba(99, 179, 237, 0.85)',
    coordinateLight: '#323E50',
    coordinateDark: '#F7FAFC',
  },
  {
    id: 'fide-blue',
    name: 'Azul Torneo FIDE',
    availability: 'free',
    lightSquare: '#DCEAF4',
    darkSquare: '#2B547E',
    frame: '#1A365D',
    lastMove: '#63B3ED',
    selected: '#F6AD55',
    legalMove: 'rgba(246, 173, 85, 0.85)',
    coordinateLight: '#234465',
    coordinateDark: '#EDF2F7',
  },
  {
    id: 'dark-neon',
    name: 'Neón Oscuro',
    availability: 'free',
    lightSquare: '#164E63',
    darkSquare: '#081622',
    frame: '#00E5B4',
    lastMove: '#0E7490',
    selected: '#00E5B4',
    legalMove: 'rgba(0, 229, 180, 0.85)',
    coordinateLight: '#0E7490',
    coordinateDark: '#67E8F9',
  },

  // --- ADDITIONAL PREMIUM STYLES ---
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    availability: 'prepared',
    lightSquare: '#D7FFF2',
    darkSquare: '#0A6C69',
    frame: '#00E5B4',
    lastMove: '#B7FF00',
    selected: '#FF4DDA',
    legalMove: '#FF4DDA',
    coordinateLight: '#075650',
    coordinateDark: '#D7FFF2',
  },
  {
    id: 'glass',
    name: 'Glass',
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
    name: 'Medieval',
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
    id: 'royal-gold',
    name: 'Royal Gold',
    availability: 'prepared',
    lightSquare: '#F2E6BF',
    darkSquare: '#76521D',
    frame: '#D6A943',
    lastMove: '#F7CE63',
    selected: '#FFF1A3',
    legalMove: '#FFF1A3',
    coordinateLight: '#5F4013',
    coordinateDark: '#FFF5D8',
  },
  {
    id: 'futuristic',
    name: 'Futuristic',
    availability: 'prepared',
    lightSquare: '#D5D9FF',
    darkSquare: '#323B85',
    frame: '#7D8CFF',
    lastMove: '#43D8FF',
    selected: '#FFCF4A',
    legalMove: '#43D8FF',
    coordinateLight: '#27306B',
    coordinateDark: '#E9EBFF',
  },
  {
    id: 'ocean',
    name: 'Ocean',
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
    name: 'Cherry Blossom',
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
