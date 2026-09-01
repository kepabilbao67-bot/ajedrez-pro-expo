import { StyleSheet, Text, View } from 'react-native';
import type { AchievementDefinition } from '@/gamification/achievements';
import type { GamificationState } from '@/gamification/xp-types';
import type { PlayerProfile } from '@/profile/profile-types';
import { APP_COLORS } from '@/theme/colors';

export interface ProfilePanelProps {
  readonly profile: PlayerProfile;
  readonly gamification: GamificationState;
  readonly playerLevel: string;
  readonly progressToNextLevel: number;
  readonly nextAchievement?: AchievementDefinition;
}

export function ProfilePanel({
  profile,
  gamification,
  playerLevel,
  progressToNextLevel,
  nextAchievement,
}: ProfilePanelProps) {
  return (
    <View style={styles.wrapper}>
      <View accessibilityLabel="Mi progreso" style={styles.profilePanel}>
        <Text selectable style={styles.profileTitle}>Mi Progreso Táctico</Text>
        <View style={styles.profileStats}>
          <View style={styles.profileStat}>
            <Text selectable style={styles.profileValueGold}>{profile.learning.gamesPlayed}</Text>
            <Text selectable style={styles.profileLabel}>partidas</Text>
          </View>
          <View style={styles.profileStat}>
            <Text selectable style={styles.profileValueCyan}>{profile.learning.estimatedLevel}</Text>
            <Text selectable style={styles.profileLabel}>nivel</Text>
          </View>
          <View style={styles.profileStat}>
            <Text selectable style={styles.profileValueGold}>+{profile.progress.improvementScore}</Text>
            <Text selectable style={styles.profileLabel}>mejora</Text>
          </View>
        </View>
        <View accessibilityLabel={`Progreso al siguiente nivel: ${progressToNextLevel}%`} style={styles.levelProgressTrack}>
          <View style={[styles.levelProgressFill, { width: `${progressToNextLevel}%` }]} />
        </View>
        <Text selectable style={styles.profileWeaknesses}>
          {profile.learning.weaknesses.length > 0
            ? `Puntos a mejorar: ${profile.learning.weaknesses.join(' · ')}`
            : 'Puntos débiles: completa una partida analizada para detectarlos.'}
        </Text>
      </View>

      <View accessibilityLabel="Mi nivel" style={styles.levelPanel}>
        <View style={styles.levelHeader}>
          <Text selectable style={styles.profileTitle}>Rango Gran Maestro</Text>
          <Text selectable style={styles.levelName}>{playerLevel}</Text>
        </View>
        <View style={styles.profileStats}>
          <View style={styles.profileStat}>
            <Text selectable style={styles.profileValueGold}>{gamification.xp}</Text>
            <Text selectable style={styles.profileLabel}>XP</Text>
          </View>
          <View style={styles.profileStat}>
            <Text selectable style={styles.profileValueCyan}>{gamification.dailyStreak} 🔥</Text>
            <Text selectable style={styles.profileLabel}>racha</Text>
          </View>
          <View style={styles.profileStat}>
            <Text selectable style={styles.profileValueGold}>{gamification.unlockedAchievements.length} 🏆</Text>
            <Text selectable style={styles.profileLabel}>logros</Text>
          </View>
        </View>
        <Text selectable style={styles.profileWeaknesses}>
          {gamification.dailyChallenge
            ? `Reto diario: ${gamification.dailyChallenge.title} · ${gamification.dailyChallenge.completed ? 'completado ✨' : `${gamification.dailyChallenge.progress}/${gamification.dailyChallenge.target}`}`
            : 'Reto diario disponible al completar una actividad.'}
        </Text>
        <Text selectable style={styles.profileWeaknesses}>
          {nextAchievement ? `Próximo logro: ${nextAchievement.title}` : 'Todos los logros actuales desbloqueados.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', maxWidth: 440, gap: 12 },
  profilePanel: {
    width: '100%',
    gap: 10,
    padding: 16,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  levelPanel: {
    width: '100%',
    gap: 10,
    padding: 16,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.borderGold,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelName: {
    color: APP_COLORS.goldBright,
    fontSize: 14,
    fontWeight: '900',
  },
  profileTitle: { color: APP_COLORS.goldBright, fontSize: 13, fontWeight: '900' },
  profileStats: { flexDirection: 'row', gap: 8 },
  profileStat: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.surfaceStrong,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  profileValueGold: { color: APP_COLORS.goldBright, fontSize: 18, fontWeight: '900', fontVariant: ['tabular-nums'] },
  profileValueCyan: { color: APP_COLORS.blueElectric, fontSize: 18, fontWeight: '900', fontVariant: ['tabular-nums'] },
  profileLabel: { color: APP_COLORS.textMuted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  levelProgressTrack: {
    height: 6,
    backgroundColor: APP_COLORS.surfaceStrong,
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 2,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: APP_COLORS.goldPrimary,
    borderRadius: 3,
  },
  profileWeaknesses: { color: APP_COLORS.textSecondary, fontSize: 12, lineHeight: 18 },
});
