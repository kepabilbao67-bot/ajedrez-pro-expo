import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { APP_COLORS } from '@/theme/colors';

export interface CoachPanelProps {
  readonly coachMessage: string | null;
  readonly contextualMessage: string;
  readonly coachLoading: boolean;
  readonly thinking: boolean;
  readonly hintLevel: number;
  readonly canAnalyze: boolean;
  readonly onRequestHint: () => void;
  readonly onAnalyzeGame: () => void;
}

export function CoachPanel({
  coachMessage,
  contextualMessage,
  coachLoading,
  thinking,
  hintLevel,
  canAnalyze,
  onRequestHint,
  onAnalyzeGame,
}: CoachPanelProps) {
  const isHintDisabled = coachLoading || thinking;
  const isAnalyzeDisabled = isHintDisabled || !canAnalyze;

  return (
    <View style={styles.container}>
      <View style={styles.buttonsRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isHintDisabled }}
          disabled={isHintDisabled}
          onPress={onRequestHint}
          style={({ pressed }) => [styles.coachButton, isHintDisabled && styles.disabledButton, pressed && styles.pressed]}
        >
          <Text style={styles.coachButtonText}>{coachLoading ? 'Analizando…' : `💡 Pista · Nivel ${hintLevel}`}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isAnalyzeDisabled }}
          disabled={isAnalyzeDisabled}
          onPress={onAnalyzeGame}
          style={({ pressed }) => [styles.coachButtonAnalyze, isAnalyzeDisabled && styles.disabledButton, pressed && styles.pressed]}
        >
          <Text style={styles.coachButtonAnalyzeText}>📊 Analizar</Text>
        </Pressable>
      </View>

      {coachMessage ? (
        <Animated.View entering={FadeIn.duration(180)} style={styles.coachCard}>
          <View style={styles.coachHeader}>
            <Text style={styles.coachIcon}>🧠</Text>
            <Text style={styles.coachTitle}>Profesor Táctico IA</Text>
          </View>
          <Text selectable style={styles.coachText}>{coachMessage}</Text>
        </Animated.View>
      ) : (
        <View style={styles.coachCard}>
          <View style={styles.coachHeader}>
            <Text style={styles.coachIcon}>🧠</Text>
            <Text style={styles.coachTitle}>Profesor Táctico IA</Text>
          </View>
          <Text selectable style={styles.coachText}>{contextualMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 440, gap: 8 },
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  coachButton: {
    flex: 1.2,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.borderBlue,
  },
  coachButtonText: { color: APP_COLORS.blueElectric, fontSize: 13, fontWeight: '800' },
  coachButtonAnalyze: {
    flex: 0.8,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.borderGold,
  },
  coachButtonAnalyzeText: { color: APP_COLORS.goldBright, fontSize: 13, fontWeight: '800' },
  disabledButton: { opacity: 0.45 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  coachCard: {
    width: '100%',
    gap: 6,
    padding: 14,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coachIcon: {
    fontSize: 16,
  },
  coachTitle: { color: APP_COLORS.goldBright, fontSize: 13, fontWeight: '900' },
  coachText: { color: APP_COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
});
