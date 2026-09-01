import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  ACHIEVEMENTS,
  type AchievementTier,
} from '@/gamification/achievements';
import { usePlayerProgress } from '@/hooks/use-player-progress';
import { APP_COLORS } from '@/theme/colors';

const TIER_COLORS: Record<AchievementTier, { border: string; bg: string; text: string; label: string }> = {
  bronze: { border: '#CD7F32', bg: 'rgba(205, 127, 50, 0.15)', text: '#E5A663', label: 'Bronce' },
  silver: { border: '#C0C0C0', bg: 'rgba(192, 192, 192, 0.15)', text: '#E0E0E0', label: 'Plata' },
  gold: { border: APP_COLORS.goldPrimary, bg: 'rgba(229, 184, 105, 0.15)', text: APP_COLORS.goldBright, label: 'Oro' },
  diamond: { border: APP_COLORS.blueElectric, bg: 'rgba(0, 210, 255, 0.15)', text: APP_COLORS.blueElectric, label: 'Diamante' },
};

export function AchievementsScreen() {
  const router = useRouter();
  const { gamification, playerLevel } = usePlayerProgress();
  const [selectedTier, setSelectedTier] = useState<AchievementTier | 'all'>('all');

  const unlockedMap = new Map(
    gamification.unlockedAchievements.map((ua) => [ua.id, ua.unlockedAt])
  );

  const totalAchievements = ACHIEVEMENTS.length;
  const unlockedCount = gamification.unlockedAchievements.length;
  const progressPercent = Math.round((unlockedCount / totalAchievements) * 100);

  const filteredAchievements = selectedTier === 'all'
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter((a) => a.tier === selectedTier);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Vitrina de Trofeos</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{playerLevel}</Text>
          </View>
        </View>

        {/* PROGRESS OVERVIEW HERO */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroEyebrow}>PROGRESO DE MEDALLAS</Text>
            <Text style={styles.heroXpText}>{gamification.xp} XP acumulados</Text>
          </View>
          <View style={styles.heroProgressHeader}>
            <Text style={styles.heroUnlockedText}>
              {unlockedCount} de {totalAchievements} Desbloqueados
            </Text>
            <Text style={styles.heroPercentText}>{progressPercent}%</Text>
          </View>

          {/* PROGRESS BAR */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {/* TIER FILTER CHIPS */}
        <View style={styles.filterRow}>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'bronze', label: '🥉 Bronce' },
            { id: 'silver', label: '🥈 Plata' },
            { id: 'gold', label: '🥇 Oro' },
            { id: 'diamond', label: '💎 Diamante' },
          ].map((f) => (
            <Pressable
              key={f.id}
              accessibilityRole="button"
              onPress={() => setSelectedTier(f.id as any)}
              style={[styles.filterChip, selectedTier === f.id && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, selectedTier === f.id && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ACHIEVEMENTS GRID */}
        <View style={styles.grid}>
          {filteredAchievements.map((item, idx) => {
            const isUnlocked = unlockedMap.has(item.id);
            const unlockedAt = unlockedMap.get(item.id);
            const tierStyle = TIER_COLORS[item.tier];

            return (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(idx * 30).duration(220)}
                style={[
                  styles.achievementCard,
                  isUnlocked
                    ? { borderColor: tierStyle.border, backgroundColor: APP_COLORS.surface }
                    : styles.lockedCard,
                ]}
              >
                <View style={styles.cardTopRow}>
                  <View style={[styles.iconBox, { backgroundColor: tierStyle.bg }]}>
                    <Text style={styles.iconText}>{item.icon}</Text>
                  </View>
                  <View style={styles.badgeCol}>
                    <View style={[styles.tierPill, { borderColor: tierStyle.border }]}>
                      <Text style={[styles.tierPillText, { color: tierStyle.text }]}>
                        {tierStyle.label.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.xpRewardText}>+{item.xpReward} XP</Text>
                  </View>
                </View>

                <Text style={[styles.achievementTitle, !isUnlocked && styles.lockedTitle]}>
                  {item.title}
                </Text>
                <Text style={styles.achievementDesc}>{item.description}</Text>

                <View style={styles.cardFooter}>
                  {isUnlocked ? (
                    <Text style={styles.unlockedDate}>
                      ✓ Desbloqueado {unlockedAt ? new Date(unlockedAt).toLocaleDateString() : ''}
                    </Text>
                  ) : (
                    <Text style={styles.lockedLabel}>🔒 Bloqueado</Text>
                  )}
                </View>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: APP_COLORS.background },
  container: { padding: 14, alignItems: 'center', gap: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 440,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  backButtonText: { color: APP_COLORS.blueElectric, fontSize: 13, fontWeight: '800' },
  headerTitle: { color: APP_COLORS.goldBright, fontSize: 18, fontWeight: '900' },
  levelBadge: {
    backgroundColor: APP_COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: APP_COLORS.borderGold,
  },
  levelBadgeText: { color: APP_COLORS.goldBright, fontSize: 11, fontWeight: '900' },
  heroCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: APP_COLORS.borderGold,
    gap: 8,
  },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroEyebrow: { color: APP_COLORS.blueElectric, fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  heroXpText: { color: APP_COLORS.goldBright, fontSize: 12, fontWeight: '900' },
  heroProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  heroUnlockedText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  heroPercentText: { color: APP_COLORS.blueElectric, fontSize: 18, fontWeight: '900' },
  progressBarBg: {
    height: 8,
    backgroundColor: APP_COLORS.surfaceStrong,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: APP_COLORS.goldPrimary,
    borderRadius: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
    maxWidth: 440,
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: APP_COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  filterChipActive: { backgroundColor: APP_COLORS.blueElectric, borderColor: APP_COLORS.blueElectric },
  filterChipText: { color: APP_COLORS.textMuted, fontSize: 11, fontWeight: '800' },
  filterChipTextActive: { color: '#070B0E', fontWeight: '900' },
  grid: {
    width: '100%',
    maxWidth: 440,
    gap: 10,
  },
  achievementCard: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    gap: 6,
  },
  lockedCard: {
    opacity: 0.55,
    backgroundColor: APP_COLORS.surfaceStrong,
    borderColor: APP_COLORS.border,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontSize: 22 },
  badgeCol: { alignItems: 'flex-end', gap: 2 },
  tierPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  tierPillText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  xpRewardText: { color: APP_COLORS.goldBright, fontSize: 11, fontWeight: '900' },
  achievementTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  lockedTitle: { color: APP_COLORS.textMuted },
  achievementDesc: { color: APP_COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  cardFooter: { marginTop: 4 },
  unlockedDate: { color: APP_COLORS.success, fontSize: 11, fontWeight: '800' },
  lockedLabel: { color: APP_COLORS.textMuted, fontSize: 11, fontWeight: '700' },
});
