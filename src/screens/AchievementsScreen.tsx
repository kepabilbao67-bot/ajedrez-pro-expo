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

const TIER_COLORS: Record<AchievementTier, { border: string; bg: string; text: string; label: string }> = {
  bronze: { border: '#CD7F32', bg: 'rgba(205, 127, 50, 0.12)', text: '#E5A663', label: 'Bronce' },
  silver: { border: '#C0C0C0', bg: 'rgba(192, 192, 192, 0.12)', text: '#E0E0E0', label: 'Plata' },
  gold: { border: '#F5C451', bg: 'rgba(245, 196, 81, 0.12)', text: '#F5C451', label: 'Oro' },
  diamond: { border: '#00C8FF', bg: 'rgba(0, 200, 255, 0.12)', text: '#00C8FF', label: 'Diamante' },
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
                    ? { borderColor: tierStyle.border, backgroundColor: '#16281F' }
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
  root: { flex: 1, backgroundColor: '#09130F' },
  container: { padding: 16, alignItems: 'center', gap: 14 },
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
    backgroundColor: '#14241D',
    borderWidth: 1,
    borderColor: '#294235',
  },
  backButtonText: { color: '#00E5B4', fontSize: 13, fontWeight: '800' },
  headerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  levelBadge: {
    backgroundColor: '#1E3529',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00E5B4',
  },
  levelBadgeText: { color: '#00E5B4', fontSize: 11, fontWeight: '900' },
  heroCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#14241D',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#294235',
    gap: 8,
  },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroEyebrow: { color: '#00E5B4', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  heroXpText: { color: '#F5C451', fontSize: 12, fontWeight: '900' },
  heroProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  heroUnlockedText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  heroPercentText: { color: '#00E5B4', fontSize: 18, fontWeight: '900' },
  progressBarBg: {
    height: 8,
    backgroundColor: '#0E1A14',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00E5B4',
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
    backgroundColor: '#14241D',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#294235',
  },
  filterChipActive: { backgroundColor: '#00E5B4', borderColor: '#00E5B4' },
  filterChipText: { color: '#9EAFA5', fontSize: 11, fontWeight: '800' },
  filterChipTextActive: { color: '#09130F' },
  grid: {
    width: '100%',
    maxWidth: 440,
    gap: 10,
  },
  achievementCard: {
    backgroundColor: '#14241D',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#294235',
    gap: 6,
  },
  lockedCard: {
    opacity: 0.65,
    backgroundColor: '#0E1A14',
    borderColor: '#1F3328',
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
  xpRewardText: { color: '#F5C451', fontSize: 11, fontWeight: '900' },
  achievementTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  lockedTitle: { color: '#9EAFA5' },
  achievementDesc: { color: '#C5D0C9', fontSize: 12, lineHeight: 17 },
  cardFooter: { marginTop: 4 },
  unlockedDate: { color: '#00E5B4', fontSize: 11, fontWeight: '800' },
  lockedLabel: { color: '#6D8276', fontSize: 11, fontWeight: '700' },
});
