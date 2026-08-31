import { describe, expect, it } from 'vitest';
import {
  OPENINGS_DATABASE,
  detectOpening,
  getOpeningByEco,
  searchOpenings,
} from './openingBook';

describe('Opening Book & ECO Database', () => {
  it('contains comprehensive collection of openings across e4, d4 and flank', () => {
    expect(OPENINGS_DATABASE.length).toBeGreaterThanOrEqual(25);
    const families = new Set(OPENINGS_DATABASE.map((op) => op.family));
    expect(families.has('e4')).toBe(true);
    expect(families.has('d4')).toBe(true);
    expect(families.has('flank')).toBe(true);
  });

  it('detects Sicilian Najdorf accurately in real-time', () => {
    const moves = ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'];
    const detected = detectOpening(moves);

    expect(detected).toBeDefined();
    expect(detected?.eco).toBe('B90');
    expect(detected?.name).toContain('Najdorf');
  });

  it('detects Ruy Lopez Berlin Defense accurately', () => {
    const moves = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6'];
    const detected = detectOpening(moves);

    expect(detected).toBeDefined();
    expect(detected?.eco).toBe('C65');
    expect(detected?.name).toContain('Berlinesa');
  });

  it('detects King\'s Indian Defense accurately', () => {
    const moves = ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7'];
    const detected = detectOpening(moves);

    expect(detected).toBeDefined();
    expect(detected?.eco).toBe('E60');
    expect(detected?.name).toContain('India de Rey');
  });

  it('fetches opening by ECO code', () => {
    const b90 = getOpeningByEco('B90');
    expect(b90).toBeDefined();
    expect(b90?.eco).toBe('B90');

    const c50 = getOpeningByEco('c50');
    expect(c50).toBeDefined();
    expect(c50?.name).toContain('Italiana');
  });

  it('searches openings by text query and family filter', () => {
    const results = searchOpenings('francesa');
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results.every((r) => r.name.toLowerCase().includes('francesa') || r.description.toLowerCase().includes('francesa'))).toBe(true);

    const d4Results = searchOpenings('', 'd4');
    expect(d4Results.length).toBeGreaterThan(0);
    expect(d4Results.every((r) => r.family === 'd4')).toBe(true);
  });
});
