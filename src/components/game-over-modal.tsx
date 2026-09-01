import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import type { GameStatus } from '@/chess';
import { APP_COLORS } from '@/theme/colors';

const REASONS = {
  stalemate: 'Ahogado',
  'fifty-move': 'Regla de cincuenta movimientos',
  'threefold-repetition': 'Triple repetición de posiciones',
  'insufficient-material': 'Material insuficiente para dar mate',
} as const;

interface GameOverModalProps {
  readonly status: GameStatus;
  readonly moveCount: number;
  readonly onRematch: () => void;
  readonly onNewGame: () => void;
}

export function GameOverModal({ status, moveCount, onRematch, onNewGame }: GameOverModalProps) {
  const result = status.checkmate
    ? status.winner === 'w'
      ? '¡VICTORIA BLANCAS!'
      : '¡VICTORIA NEGRAS!'
    : 'TABLAS';
  const reason = status.checkmate ? 'Jaque mate incontestable' : status.drawReason ? REASONS[status.drawReason] : '';

  return (
    <Modal transparent visible={status.gameOver} animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <Animated.View entering={ZoomIn.duration(220)} accessibilityRole="alert" style={styles.card}>
          <Animated.Text entering={FadeInDown.delay(60).duration(180)} selectable style={styles.icon}>
            {status.checkmate ? (status.winner === 'w' ? '👑' : '⚔️') : '🤝'}
          </Animated.Text>
          <Text selectable style={styles.eyebrow}>PARTIDA FINALIZADA</Text>
          <Text selectable style={styles.result}>{result}</Text>
          <Text selectable style={styles.reason}>{reason}</Text>

          <View style={styles.summary}>
            <Text selectable style={styles.summaryValue}>{moveCount}</Text>
            <Text selectable style={styles.summaryLabel}>{moveCount === 1 ? 'jugada' : 'jugadas'}</Text>
          </View>

          <Pressable accessibilityRole="button" onPress={onRematch} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>Jugar de nuevo</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onNewGame} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
            <Text style={styles.secondaryText}>Nueva partida</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 8, 0.88)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: APP_COLORS.surface,
    borderRadius: 26,
    borderCurve: 'continuous',
    padding: 24,
    gap: 10,
    alignItems: 'stretch',
    borderWidth: 1.5,
    borderColor: APP_COLORS.borderGold,
    boxShadow: '0 18px 44px rgba(0, 0, 0, 0.8), 0 0 20px rgba(229, 184, 105, 0.25)',
  },
  icon: {
    fontSize: 48,
    textAlign: 'center',
  },
  eyebrow: {
    color: APP_COLORS.blueElectric,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  result: {
    color: APP_COLORS.goldBright,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  reason: {
    color: APP_COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  summary: {
    alignSelf: 'center',
    minWidth: 94,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 4,
    backgroundColor: APP_COLORS.surfaceStrong,
    borderRadius: 14,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  summaryValue: {
    color: APP_COLORS.goldBright,
    fontSize: 22,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    color: APP_COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  primary: {
    minHeight: 52,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.goldPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    boxShadow: '0 4px 14px rgba(229, 184, 105, 0.35)',
  },
  primaryText: {
    color: '#070B0E',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  secondary: {
    minHeight: 50,
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: APP_COLORS.borderBlue,
    backgroundColor: APP_COLORS.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: APP_COLORS.blueElectric,
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
