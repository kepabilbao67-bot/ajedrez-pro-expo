import { describe, expect, it } from 'vitest';
import { AI_BOTS } from './bots';

describe('AI Bots', () => {
  it('should define a complete 8-tier progression of bots', () => {
    expect(AI_BOTS.length).toBe(8);
    const difficulties = AI_BOTS.map((b) => b.difficulty);
    for (let level = 1; level <= 8; level++) {
      expect(difficulties).toContain(level);
    }
  });

  it('should have unique ids, valid Elo ratings, and defined play styles', () => {
    const ids = new Set<string>();
    for (const bot of AI_BOTS) {
      expect(ids.has(bot.id)).toBe(false);
      ids.add(bot.id);
      expect(bot.difficulty).toBeGreaterThanOrEqual(1);
      expect(bot.difficulty).toBeLessThanOrEqual(8);
      expect(bot.playStyle).toBeDefined();
      expect(bot.elo).toBeGreaterThanOrEqual(700);
    }
  });
});
