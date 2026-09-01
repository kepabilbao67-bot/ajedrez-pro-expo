import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameStatus } from '@/chess';
import { APP_COLORS } from '@/theme/colors';

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
    if (acc >= 90) return APP_COLORS.blueElectric;
    if (acc >= 75) return APP_COLORS.goldPrimary;
    return APP_COLORS.danger;
  };

  const hasMistakes = (postGameSummary?.blunders ?? 0) > 0 || (postGameSummary?.inaccuracies ?? 0) > 0;

  return (
    <View style={styles.postGamePanel}>
      <Text selectable style={styles.profileTitle}>Reporte de Partida (Evaluación Stockfish)</Text>

      {/* Accuracy and Key Stats */}
      <View style={styles.scoreRow}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Precisión Estimada</Text>
          <Text style={[styles.scoreValue, { color: postGameSummary ? getAccuracyColor(postGameSummary.accuracy) : APP_COLORS.textSecondary }]}>
            {postGameSummary ? `${postGameSummary.accuracy}%` : '--%'}
          </Text>
        </View>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Errores Graves</Text>
          <Text style={[styles.scoreValue, { color: postGameSummary && postGameSummary.blunders > 0 ? APP_COLORS.danger : APP_COLORS.success }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  postGamePanel: {
    width: '100%',
    maxWidth: 440,
    gap: 10,
    padding: 16,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.borderGold,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
  },
  profileTitle: {
    color: APP_COLORS.goldBright,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  scoreLabel: {
    color: APP_COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
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
  },
  badgeBrilliant: {
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    borderColor: APP_COLORS.blueElectric,
  },
  badgeBest: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderColor: APP_COLORS.success,
  },
  badgeInaccuracy: {
    backgroundColor: 'rgba(245, 196, 81, 0.12)',
    borderColor: APP_COLORS.warning,
  },
  badgeBlunder: {
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    borderColor: APP_COLORS.danger,
  },
  insightCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: APP_COLORS.surfaceStrong,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    gap: 4,
  },
  errorCard: {
    borderColor: 'rgba(255, 59, 48, 0.35)',
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
  },
  insightHeader: {
    color: APP_COLORS.goldBright,
    fontSize: 12,
    fontWeight: '800',
  },
  insightHeaderError: {
    color: '#FF7B72',
    fontSize: 12,
    fontWeight: '800',
  },
  retryMistakesBtn: {
    backgroundColor: APP_COLORS.goldPrimary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginVertical: 4,
    boxShadow: '0 4px 12px rgba(229, 184, 105, 0.3)',
  },
  retryMistakesBtnText: {
    color: '#070B0E',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  profileWeaknesses: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.985 }],
  },
});
