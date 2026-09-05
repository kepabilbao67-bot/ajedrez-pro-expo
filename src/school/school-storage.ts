import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SCHOOL_SCHEMA_VERSION,
  SCHOOL_STORAGE_KEY,
  type SchoolProgressState,
} from './school-types';

export const DEFAULT_SCHOOL_STATE: SchoolProgressState = {
  version: SCHOOL_SCHEMA_VERSION,
  mode: 'kids',
  completedLessonIds: [],
  lessonStars: {},
  totalStars: 0,
  unlockedLessonIds: ['pawn'],
  graduatedFromSchool: false,
  updatedAt: new Date().toISOString(),
};

export function createInitialSchoolState(): SchoolProgressState {
  return {
    ...DEFAULT_SCHOOL_STATE,
    completedLessonIds: [],
    lessonStars: {},
    unlockedLessonIds: ['pawn'],
    updatedAt: new Date().toISOString(),
  };
}

export function isValidSchoolState(data: unknown): data is SchoolProgressState {
  if (!data || typeof data !== 'object') return false;
  const state = data as Partial<SchoolProgressState>;
  return (
    state.version === SCHOOL_SCHEMA_VERSION &&
    typeof state.mode === 'string' &&
    Array.isArray(state.completedLessonIds) &&
    typeof state.totalStars === 'number' &&
    Array.isArray(state.unlockedLessonIds)
  );
}

export async function loadSchoolStateFromStorage(): Promise<SchoolProgressState> {
  try {
    const raw = await AsyncStorage.getItem(SCHOOL_STORAGE_KEY);
    if (!raw) {
      const initial = createInitialSchoolState();
      await saveSchoolStateToStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (isValidSchoolState(parsed)) {
      return parsed;
    }
    const fallback = createInitialSchoolState();
    await saveSchoolStateToStorage(fallback);
    return fallback;
  } catch {
    return createInitialSchoolState();
  }
}

export async function saveSchoolStateToStorage(state: SchoolProgressState): Promise<void> {
  try {
    const updated: SchoolProgressState = {
      ...state,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(SCHOOL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving school progress state:', err);
  }
}
