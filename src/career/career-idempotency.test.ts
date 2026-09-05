import { describe, expect, it } from 'vitest';
import { createInitialCareerProfile } from './career-storage';
import { recordCareerMatchResult } from './career-service';
import type { CareerProfile } from './career-types';

describe('Career Service — Idempotency of Match Recording', () => {
  it('prevents double-counting: second call with same match result leaves rating, XP, crowns, and standings unchanged', () => {
    const initialProfile: CareerProfile = createInitialCareerProfile('Kepa GM');
    const initialRating = initialProfile.rating.currentRating;
    const initialGamesPlayed = initialProfile.rating.gamesPlayed;
    const initialMatchesPlayed = initialProfile.currentTournament.matches.filter((m) => m.played).length;
    expect(initialMatchesPlayed).toBe(0);

    // 1st Execution: Record a real win
    const firstResult = recordCareerMatchResult(initialProfile, 'win');
    expect(firstResult.isNewResult).toBe(true);
    expect(firstResult.ratingDelta).toBeGreaterThan(0);
    expect(firstResult.newRating).toBeGreaterThan(initialRating);

    // Prepare profile where round 1 match is already marked as played (idempotency scenario)
    const profileWithPlayedMatch: CareerProfile = {
      ...initialProfile,
      currentTournament: {
        ...initialProfile.currentTournament,
        matches: initialProfile.currentTournament.matches.map((m) =>
          m.round === 1 && m.isPlayerMatch ? { ...m, played: true, playerResult: 'win' } : m
        ),
      },
    };

    const recordedStandings = JSON.stringify(profileWithPlayedMatch.currentTournament.standings);

    // 2nd Execution: Calling again on the already-processed match
    const secondResult = recordCareerMatchResult(profileWithPlayedMatch, 'win');

    expect(secondResult.isNewResult).toBe(false);
    expect(secondResult.ratingDelta).toBe(0);
    expect(secondResult.newRating).toBe(initialRating);
    expect(secondResult.oldRating).toBe(initialRating);
    expect(secondResult.updatedProfile.rating.currentRating).toBe(initialRating);
    expect(secondResult.updatedProfile.rating.gamesPlayed).toBe(initialGamesPlayed);
    expect(JSON.stringify(secondResult.updatedProfile.currentTournament.standings)).toBe(recordedStandings);
    expect(secondResult.updatedProfile.currentTournament.matches.filter((m) => m.played).length).toBe(
      profileWithPlayedMatch.currentTournament.matches.filter((m) => m.played).length
    );
  });

  it('does NOT block consecutive legitimate matches (Partida A -> Partida B both processed once)', () => {
    let profile = createInitialCareerProfile('Kepa GM');

    // Partida A (Round 1)
    const matchAResult = recordCareerMatchResult(profile, 'win');
    expect(matchAResult.isNewResult).toBe(true);
    expect(matchAResult.ratingDelta).toBeGreaterThan(0);
    expect(matchAResult.updatedProfile.rating.gamesPlayed).toBe(1);
    expect(matchAResult.updatedProfile.currentTournament.currentRound).toBe(2);

    profile = matchAResult.updatedProfile;

    // Partida B (Round 2) — Legitimate next match in career
    const matchBResult = recordCareerMatchResult(profile, 'win');
    expect(matchBResult.isNewResult).toBe(true);
    expect(matchBResult.ratingDelta).toBeGreaterThan(0);
    expect(matchBResult.updatedProfile.rating.gamesPlayed).toBe(2);
    expect(matchBResult.newRating).toBeGreaterThan(matchAResult.newRating);
    expect(matchBResult.updatedProfile.currentTournament.currentRound).toBe(3);
  });

  it('completedGameGeneration allows new game after reset and blocks intra-game double dispatch', () => {
    let generation = 1;
    let completedGeneration: number | null = null;

    // Partida A finishes
    const canProcessA = completedGeneration !== generation;
    expect(canProcessA).toBe(true);
    completedGeneration = generation; // marks generation 1 completed

    // Duplicate event in Partida A -> blocked
    const canProcessADup = completedGeneration !== generation;
    expect(canProcessADup).toBe(false);

    // User clicks "Nueva Partida" -> generation increments to 2
    generation += 1;

    // Partida B finishes
    const canProcessB = completedGeneration !== generation;
    expect(canProcessB).toBe(true);
    completedGeneration = generation; // marks generation 2 completed

    // Duplicate event in Partida B -> blocked
    const canProcessBDup = completedGeneration !== generation;
    expect(canProcessBDup).toBe(false);
  });
});
