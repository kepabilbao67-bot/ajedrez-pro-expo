import AsyncStorage from '@react-native-async-storage/async-storage';
import { CAREER_SCHEMA_VERSION, CAREER_STORAGE_KEY, type CareerProfile } from './career-types';
import { generateTournamentForTier } from './tournaments';

export function createInitialCareerProfile(playerName: string = 'Kepa'): CareerProfile {
  const initialTournament = generateTournamentForTier('academia', playerName, 600);

  return {
    version: CAREER_SCHEMA_VERSION,
    playerName,
    rating: {
      currentRating: 600,
      peakRating: 600,
      gamesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      currentStreak: 0,
      bestStreak: 0,
      history: [],
    },
    currentTierId: 'academia',
    currentTournament: initialTournament,
    completedTournaments: [],
    rivalries: {},
    unlockedTiers: ['academia'],
    trophies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function isValidCareerProfile(data: unknown): data is CareerProfile {
  if (!data || typeof data !== 'object') return false;
  const profile = data as Partial<CareerProfile>;
  return (
    profile.version === CAREER_SCHEMA_VERSION &&
    typeof profile.playerName === 'string' &&
    typeof profile.currentTierId === 'string' &&
    profile.rating !== undefined &&
    typeof profile.rating.currentRating === 'number' &&
    profile.currentTournament !== undefined &&
    Array.isArray(profile.currentTournament.standings) &&
    Array.isArray(profile.unlockedTiers)
  );
}

export async function loadCareerProfileFromStorage(): Promise<CareerProfile> {
  try {
    const raw = await AsyncStorage.getItem(CAREER_STORAGE_KEY);
    if (!raw) {
      const initial = createInitialCareerProfile();
      await saveCareerProfileToStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (isValidCareerProfile(parsed)) {
      return parsed;
    }
    const fallback = createInitialCareerProfile();
    await saveCareerProfileToStorage(fallback);
    return fallback;
  } catch {
    return createInitialCareerProfile();
  }
}

export async function saveCareerProfileToStorage(profile: CareerProfile): Promise<void> {
  try {
    const updated = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving career profile:', err);
  }
}
