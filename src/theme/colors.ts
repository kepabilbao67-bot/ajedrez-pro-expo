/**
 * AjedrezPro — Master Edition Global Premium Design System
 * 
 * Palette:
 * - Deep Black / Obsidian: #05080C, #080D14, #0D1520
 * - Electric Blue / Cyan: #00D2FF, #0088FF, #0A2540, rgba(0, 210, 255, 0.3)
 * - Metallic Gold: #E5B869, #FFE5A3, #D4AF37, #A67C2E, rgba(229, 184, 105, 0.35)
 * - Crimson / Red: #FF3B30, #FF453A, rgba(255, 59, 48, 0.25)
 * - Emerald / Green: #00E676, #00C853, rgba(0, 230, 118, 0.25)
 */

export const APP_COLORS = {
  // Backgrounds
  background: '#070B0E',
  backgroundAlt: '#0B1117',
  backgroundDeep: '#040608',

  // Surfaces (Cards, Panels, Modals)
  surface: '#0F1722',
  surfaceStrong: '#152030',
  surfaceElevated: '#1A283C',
  surfaceHighlight: '#22344D',

  // Borders
  border: '#1E2C3D',
  borderLight: '#2A3C52',
  borderGold: 'rgba(212, 175, 55, 0.45)',
  borderBlue: 'rgba(0, 210, 255, 0.45)',

  // Gold Tokens (Branding, CTAs, White Pieces, Badges)
  goldPrimary: '#E5B869',
  goldBright: '#FFE5A3',
  goldMetallic: '#D4AF37',
  goldDark: '#9E7422',
  goldGlow: 'rgba(229, 184, 105, 0.35)',

  // Blue Tokens (Focus, Energy, Indicators, Selection)
  blueElectric: '#00D2FF',
  bluePrimary: '#0088FF',
  blueDeep: '#0A2540',
  blueGlow: 'rgba(0, 210, 255, 0.3)',
  blueSurface: '#0E2238',

  // Semantic
  danger: '#FF3B30',
  dangerGlow: 'rgba(255, 59, 48, 0.35)',
  success: '#00E676',
  successGlow: 'rgba(0, 230, 118, 0.35)',
  warning: '#F5C451',

  // Typography
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textGold: '#E5B869',
  textBlue: '#00D2FF',

  // Legacy compatibility
  accent: '#E5B869',
  muted: '#94A3B8',
} as const;

export const SHADOWS = {
  goldGlow: {
    shadowColor: '#E5B869',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  blueGlow: {
    shadowColor: '#00D2FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;
