import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { GameStatus } from '@/chess';
import { XP_AWARDS } from '@/gamification/xp-types';

export interface PostGameSummaryData {
  bestMove: string;
  worstError: string;
  learning: string;
  accuracy: number;
  totalMoves: number;
  blunders: number;
  inaccuracies?: number;
  bestMovesCount?: number;
  brilliantMovesCount?: number;
}

export interface PostGamePanelProps {
  readonly status: GameStatus;
  readonly postGameSummary: PostGameSummaryData | null;
  readonly onRetryMistakes?: () => void;
}

export function PostGamePanel({ status, postGameSummary, onRetryMistakes }: PostGamePanelProps) {
  if (!status.gameOver) return null;

  const getAccuracyColor = (acc: number) => {
    if (acc >= 90) return '#00E5B4';
    if (acc >= 75) return '#D6A943';
    return '#FF4D4D';
  };

  const hasMistakes = (postGameSummary?.blunders ?? 0) > 0 || (postGameSummary?.inaccuracies ?? 0) > 0;

  return (
    <View style={styles.postGamePanel}>
      <Text selectable style={styles.profileTitle}>Reporte de Partida (Evaluación Local)</Text>

      {/* Accuracy and Key Stats */}
      <View style={styles.scoreRow}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Precisión Estimada</Text>
          <Text style={[styles.scoreValue, { color: postGameSummary ? getAccuracyColor(postGameSummary.accuracy) : '#C5D0C9' }]}>
            {postGameSummary ? `${postGameSummary.accuracy}%` : '--%'}
          </Text>
        </View>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Errores Graves</Text>
          <Text style={[styles.scoreValue, { color: postGameSummary && postGameSummary.blunders > 0 ? '#FF4D4D' : '#00E5B4' }]}>
            {postGameSummary ? postGameSummary.blunders : '-'}
          </Text>
        </View>
      </View>

      {/* Classified Move Badges Row */}
      {postGameSummary ? (
        <View style={styles.classificationRow}>
          <View style={[styles.miniBadge, styles.badgeBrilliant]}>
            <Text style={styles.miniBadgeText}>💎 {postGameSummary.brilliantMovesCount ?? 0} Brillantes</Text>
          </View>
          <View style={[styles.miniBadge, styles.badgeBest]}>
            <Text style={styles.miniBadgeText}>🟢 {postGameSummary.bestMovesCount ?? 0} Mejores</Text>
          </View>
          <View style={[styles.miniBadge, styles.badgeInaccuracy]}>
            <Text style={styles.miniBadgeText}>🟡 {postGameSummary.inaccuracies ?? 0} Imprecisas</Text>
          </View>
          <View style={[styles.miniBadge, styles.badgeBlunder]}>
            <Text style={styles.miniBadgeText}>🔴 {postGameSummary.blunders} Blunders</Text>
          </View>
        </View>
      ) : null}
      
      <View style={styles.insightCard}>
        <Text style={styles.insightHeader}>💎 Mejor Jugada Estimada</Text>
        <Text selectable style={styles.profileWeaknesses}>
          {postGameSummary?.bestMove ?? 'Analiza la partida para descubrirla.'}
        </Text>
      </View>

      <View style={[styles.insightCard, styles.errorCard]}>
        <Text style={styles.insightHeaderError}>❌ Momento Crítico</Text>
        <Text selectable style={styles.profileWeaknesses}>
          {postGameSummary?.worstError ?? 'No se ha generado análisis posicional.'}
        </Text>
      </View>

      {/* Retry Mistakes Action Button */}
      {hasMistakes && onRetryMistakes ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetryMistakes}
          style={({ pressed }) => [styles.retryMistakesBtn, pressed && styles.pressed]}
        >
          <Text style={styles.retryMistakesBtnText}>🎯 APRENDE DE TUS ERRORES (REINTENTAR JUGADAS)</Text>
        </Pressable>
      ) : null}

      <Text selectable style={styles.profileWeaknesses}>
        💡 Aprendizaje: {postGameSummary?.learning ?? 'Revisa amenazas y piezas sin defender.'}
      </Text>
      <Text selectable style={styles.profileWeaknesses}>
        🏆 Recompensa: +{status.winner === 'w' ? XP_AWARDS['game-completed'] + XP_AWARDS['victory'] : XP_AWARDS['game-completed']} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  postGamePanel: { width: '100%', maxWidth: 440, gap: 10, padding: 14, borderRadius: 16, borderCurve: 'continuous', backgroundColor: '#1B3025', borderWidth: 1, borderColor: '#3B5A49' },
  profileTitle: { color: '#F5C451', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  profileWeaknesses: { color: '#C5D0C9', fontSize: 13, lineHeight: 18 },
  scoreRow: { flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 4 },
  scoreCard: { flex: 1, backgroundColor: '#14241D', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#294235' },
  scoreLabel: { color: '#9EAFA5', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 2 },
  scoreValue: { fontSize: 24, fontWeight: '900', fontVariant: ['tabular-nums'] },
  classificationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 2,
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  miniBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  badgeBrilliant: {
    backgroundColor: 'rgba(0, 200, 255, 0.15)',
    borderColor: '#00C8FF',
  },
  badgeBest: {
    backgroundColor: 'rgba(0, 229, 180, 0.15)',
    borderColor: '#00E5B4',
  },
  badgeInaccuracy: {
    backgroundColor: 'rgba(245, 196, 81, 0.15)',
    borderColor: '#F5C451',
  },
  badgeBlunder: {
    backgroundColor: 'rgba(255, 77, 77, 0.15)',
    borderColor: '#FF4D4D',
  },
  insightCard: { backgroundColor: '#14241D', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#294235', borderLeftWidth: 4, borderLeftColor: '#00E5B4' },
  errorCard: { borderLeftColor: '#FF4D4D' },
  insightHeader: { color: '#00E5B4', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  insightHeaderError: { color: '#FF4D4D', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  retryMistakesBtn: {
    backgroundColor: '#00E5B4',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  retryMistakesBtnText: {
    color: '#09130F',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] },
});
