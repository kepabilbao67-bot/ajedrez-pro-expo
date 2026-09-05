export interface EloCalculationResult {
  readonly playerNewRating: number;
  readonly opponentNewRating: number;
  readonly playerDelta: number;
  readonly opponentDelta: number;
  readonly expectedScore: number;
  readonly actualScore: number;
}

/**
 * Calculates dynamic K-factor based on number of games played and current rating.
 * Provisional players (few games) move faster; high-rated players have tighter swings.
 */
export function getKFactor(gamesPlayed: number, currentRating: number): number {
  if (gamesPlayed < 30) {
    return 40; // Placement / provisional phase
  }
  if (currentRating < 1600) {
    return 32; // Club player
  }
  if (currentRating < 2200) {
    return 24; // Advanced / Expert
  }
  return 16; // Master level
}

/**
 * Calculates Elo rating change for a match result.
 * Includes anti-farming safeguard: if opponent is vastly inferior (> 400 Elo), gains are strictly bounded.
 *
 * @param playerRating Current rating of the player
 * @param opponentRating Current rating of the opponent
 * @param result Match outcome: 1 for win, 0.5 for draw, 0 for loss
 * @param playerGames Total career games played by player
 */
export function calculateRatingDelta(
  playerRating: number,
  opponentRating: number,
  result: 1 | 0.5 | 0,
  playerGames: number = 30
): EloCalculationResult {
  // Expected score using standard logistic curve
  const exponent = (opponentRating - playerRating) / 400;
  const expectedScore = 1 / (1 + Math.pow(10, exponent));
  const actualScore = result;

  const kPlayer = getKFactor(playerGames, playerRating);
  const kOpponent = getKFactor(30, opponentRating);

  let rawPlayerDelta = kPlayer * (actualScore - expectedScore);
  let rawOpponentDelta = kOpponent * ((1 - actualScore) - (1 - expectedScore));

  // Anti-farming check: beating someone > 400 rating below you yields minimal or +1 point max
  const ratingGap = playerRating - opponentRating;
  if (ratingGap > 400 && actualScore === 1) {
    rawPlayerDelta = Math.min(rawPlayerDelta, 2);
  } else if (ratingGap > 600 && actualScore === 1) {
    rawPlayerDelta = Math.min(rawPlayerDelta, 1);
  }

  // Round deltas appropriately
  let playerDelta = Math.round(rawPlayerDelta);
  let opponentDelta = Math.round(rawOpponentDelta);

  // Ensure winning always gives at least +1 (unless >700 difference), losing always costs at least -1
  if (actualScore === 1 && playerDelta === 0 && ratingGap < 700) {
    playerDelta = 1;
  } else if (actualScore === 0 && playerDelta === 0 && ratingGap > -700) {
    playerDelta = -1;
  }

  const playerNewRating = Math.max(100, Math.round(playerRating + playerDelta));
  const opponentNewRating = Math.max(100, Math.round(opponentRating + opponentDelta));

  return {
    playerNewRating,
    opponentNewRating,
    playerDelta,
    opponentDelta,
    expectedScore,
    actualScore,
  };
}
