import { describe, expect, it } from 'vitest';
import { BOARD_THEMES, boardThemeById } from './board-themes';

describe('Board Themes HD & Readability', () => {
  it('contains valid hex color values for all registered themes', () => {
    for (const theme of BOARD_THEMES) {
      expect(theme).toBeDefined();
      expect(theme.name.length).toBeGreaterThan(0);
      expect(theme.lightSquare).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.darkSquare).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.coordinateLight).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.coordinateDark).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.frame).toBeDefined();
      expect(theme.lastMove).toBeDefined();
      expect(theme.selected).toBeDefined();
      expect(theme.legalMove).toBeDefined();
    }
  });

  it('default flagship theme classic has high contrast between light and dark squares', () => {
    const classic = boardThemeById('classic');
    expect(classic.id).toBe('classic');
    expect(classic.lightSquare).toBe('#96B0C6');
    expect(classic.darkSquare).toBe('#1B2A38');
    expect(classic.coordinateLight).toBe('#152A3D');
    expect(classic.coordinateDark).toBe('#D6E3EF');
  });

  it('falls back to default theme if unknown ID passed', () => {
    const fallback = boardThemeById('non-existent' as any);
    expect(fallback).toBeDefined();
    expect(fallback.id).toBe('classic');
  });
});
