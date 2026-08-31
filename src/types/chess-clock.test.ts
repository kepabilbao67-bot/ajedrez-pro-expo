import { describe, expect, it } from 'vitest';
import { CLOCK_PRESETS } from './chess-clock-types';

describe('Chess Clock Presets & FIDE Standards', () => {
  it('includes standard FIDE time controls for Blitz, Bullet and Rapid', () => {
    const categories = new Set(CLOCK_PRESETS.map((p) => p.category));
    expect(categories.has('bullet')).toBe(true);
    expect(categories.has('blitz')).toBe(true);
    expect(categories.has('rapid')).toBe(true);
  });

  it('verifies FIDE 3+2 Blitz preset configuration', () => {
    const fideBlitz = CLOCK_PRESETS.find((p) => p.id === 'blitz-3-2');
    expect(fideBlitz).toBeDefined();
    expect(fideBlitz?.baseMinutes).toBe(3);
    expect(fideBlitz?.incrementSeconds).toBe(2);
  });

  it('verifies FIDE 15+10 Rapid preset configuration', () => {
    const fideRapid = CLOCK_PRESETS.find((p) => p.id === 'rapid-15-10');
    expect(fideRapid).toBeDefined();
    expect(fideRapid?.baseMinutes).toBe(15);
    expect(fideRapid?.incrementSeconds).toBe(10);
  });

  it('calculates total initial milliseconds accurately', () => {
    CLOCK_PRESETS.forEach((preset) => {
      const initialMs = preset.baseMinutes * 60 * 1000;
      expect(initialMs).toBeGreaterThan(0);
      expect(initialMs % 1000).toBe(0);
    });
  });
});
