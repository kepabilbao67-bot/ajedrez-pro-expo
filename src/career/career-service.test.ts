import { describe, expect, it } from 'vitest';
import { createInitialCareerProfile } from './career-storage';
import {
  advanceToNextChampionship,
  getCurrentOpponent,
  getCurrentPlayerMatch,
  getPlayerColorForCurrentRound,
  recordCareerMatchResult,
} from './career-service';
import { generateTournamentForTier, sortStandings } from './tournaments';

describe('Career Service and Tournament Workflow', () => {
  it('creates initial career with tier 0 Academia and 600 rating', () => {
    const profile = createInitialCareerProfile('Kepa');
    expect(profile.playerName).toBe('Kepa');
    expect(profile.rating.currentRating).toBe(600);
    expect(profile.currentTierId).toBe('academia');
    expect(profile.currentTournament.currentRound).toBe(1);
    expect(profile.currentTournament.isCompleted).toBe(false);
  });

  it('retrieves active player match and opponent for round 1', () => {
    const profile = createInitialCareerProfile('Kepa');
    const match = getCurrentPlayerMatch(profile);
    const opponent = getCurrentOpponent(profile);
    const color = getPlayerColorForCurrentRound(profile);

    expect(match).not.toBeNull();
    expect(match?.round).toBe(1);
    expect(opponent).not.toBeNull();
    expect(opponent?.name).toBeTruthy();
    expect(['w', 'b']).toContain(color);
  });

  it('records match win, updates rating, standings and advances round', () => {
    const profile = createInitialCareerProfile('Kepa');
    const initialRating = profile.rating.currentRating;

    const result = recordCareerMatchResult(profile, 'win');

    expect(result.newRating).toBeGreaterThan(initialRating);
    expect(result.ratingDelta).toBeGreaterThan(0);
    expect(result.playerStanding.points).toBe(1);
    expect(result.playerStanding.wins).toBe(1);
    expect(result.playerStanding.played).toBe(1);
    expect(result.updatedProfile.currentTournament.currentRound).toBe(2);
    expect(result.updatedProfile.rating.history.length).toBe(1);
    expect(result.updatedProfile.rivalries[getCurrentOpponent(profile)!.id].wins).toBe(1);
  });

  it('completes tournament and unlocks next tier when qualifying', () => {
    let profile = createInitialCareerProfile('Kepa');
    const totalRounds = profile.currentTournament.totalRounds;

    for (let r = 1; r <= totalRounds; r++) {
      const outcome = recordCareerMatchResult(profile, 'win');
      profile = outcome.updatedProfile;
      if (r === totalRounds) {
        expect(outcome.tournamentCompleted).toBe(true);
        expect(outcome.isChampion).toBe(true);
        expect(outcome.qualified).toBe(true);
      }
    }

    expect(profile.completedTournaments.length).toBe(1);
    expect(profile.trophies.length).toBe(1);
    expect(profile.unlockedTiers).toContain('club_local');

    // Advance to next championship
    const nextTierProfile = advanceToNextChampionship(profile);
    expect(nextTierProfile.currentTierId).toBe('club_local');
    expect(nextTierProfile.currentTournament.currentRound).toBe(1);
  });

  it('sorts standings correctly by points and wins', () => {
    const standings = [
      { participantId: 'a', name: 'A', avatar: '♟️', rating: 1200, points: 2, played: 3, wins: 1, draws: 2, losses: 0 },
      { participantId: 'b', name: 'B', avatar: '♟️', rating: 1100, points: 3, played: 3, wins: 3, draws: 0, losses: 0 },
      { participantId: 'c', name: 'C', avatar: '♟️', rating: 1300, points: 2, played: 3, wins: 2, draws: 0, losses: 1 },
    ];

    const sorted = sortStandings(standings);
    expect(sorted[0].participantId).toBe('b'); // 3 pts
    expect(sorted[1].participantId).toBe('c'); // 2 pts, 2 wins
    expect(sorted[2].participantId).toBe('a'); // 2 pts, 1 win
  });

  it('generates World Championship Match tier with Alexei Volkov', () => {
    const wcTournament = generateTournamentForTier('campeonato_mundial', 'Kepa', 2600);
    expect(wcTournament.format).toBe('match');
    expect(wcTournament.totalRounds).toBe(6);
    expect(wcTournament.opponentIds).toContain('alexei_volkov');
  });
});
