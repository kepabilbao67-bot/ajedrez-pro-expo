import { describe, expect, it } from 'vitest';
import { boardThemeById } from './board-themes';

describe('Board Themes HD V1.3', () => {
  it('contains the 5 flagship HD themes with valid color values', () => {
    const flagshipIds = ['classic', 'walnut', 'marble', 'fide-blue', 'dark-neon'] as const;

    for (const id of flagshipIds) {
      const theme = boardThemeById(id);
      expect(theme).toBeDefined();
      expect(theme.id).toBe(id);
      expect(theme.lightSquare).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.darkSquare).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.name.length).toBeGreaterThan(0);
    }
  });

  it('falls back to default theme if unknown ID passed', () => {
    const fallback = boardThemeById('non-existent' as any);
    expect(fallback).toBeDefined();
    expect(fallback.id).toBe('classic');
  });
});
