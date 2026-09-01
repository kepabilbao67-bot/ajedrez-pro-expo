import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { PuzzleAttempt, TrainingPuzzle } from '@/training/training-types';
import { APP_COLORS } from '@/theme/colors';

export interface TrainingPanelProps {
  readonly activePuzzle: TrainingPuzzle | null;
  readonly puzzleFeedback: PuzzleAttempt | null;
  readonly onStartPuzzle: () => void;
  readonly onNextPuzzle: () => void;
}

export function TrainingPanel({
  activePuzzle,
  puzzleFeedback,
  onStartPuzzle,
  onNextPuzzle,
}: TrainingPanelProps) {
  return (
    <View accessibilityLabel="Academia táctica" style={styles.academyPanel}>
      <Text selectable style={styles.panelTitle}>Academia Táctica</Text>
      {activePuzzle ? (
        <>
          <Text selectable style={styles.academyTitle}>{activePuzzle.title}</Text>
          <Text selectable style={styles.subtext}>Encuentra la mejor jugada · {activePuzzle.objective}</Text>
          {puzzleFeedback ? (
            <Animated.View
              entering={FadeIn.duration(160)}
              style={[styles.puzzleFeedback, puzzleFeedback.correct ? styles.puzzleCorrect : styles.puzzleIncorrect]}
            >
              <Text selectable style={styles.academyTitle}>{puzzleFeedback.message}</Text>
              <Text selectable style={styles.subtext}>{puzzleFeedback.explanation}</Text>
              <Text selectable style={styles.subtext}>Aprendizaje: {puzzleFeedback.learning}</Text>
              <Text selectable style={styles.subtext}>Alternativa: {puzzleFeedback.alternative}</Text>
            </Animated.View>
          ) : null}
          {puzzleFeedback?.completed ? (
            <Pressable accessibilityRole="button" onPress={onNextPuzzle} style={styles.academyButton}>
              <Text style={styles.buttonText}>Siguiente Ejercicio →</Text>
            </Pressable>
          ) : null}
        </>
      ) : (
        <>
          <Text selectable style={styles.subtext}>Encuentra la mejor jugada posicional y táctica.</Text>
          <Pressable accessibilityRole="button" onPress={onStartPuzzle} style={styles.academyButton}>
            <Text style={styles.buttonText}>Iniciar Ejercicio</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  academyPanel: {
    width: '100%',
    maxWidth: 440,
    gap: 8,
    padding: 16,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  panelTitle: { color: APP_COLORS.blueElectric, fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  academyTitle: { color: APP_COLORS.goldBright, fontSize: 14, fontWeight: '900' },
  subtext: { color: APP_COLORS.textSecondary, fontSize: 12, lineHeight: 18 },
  academyButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.goldPrimary,
    boxShadow: '0 4px 12px rgba(229, 184, 105, 0.3)',
  },
  buttonText: { color: '#070B0E', fontSize: 15, fontWeight: '900' },
  puzzleFeedback: { gap: 5, padding: 12, borderRadius: 14, borderCurve: 'continuous', borderWidth: 1 },
  puzzleCorrect: { backgroundColor: 'rgba(0, 230, 118, 0.12)', borderColor: APP_COLORS.success },
  puzzleIncorrect: { backgroundColor: 'rgba(255, 59, 48, 0.12)', borderColor: APP_COLORS.danger },
});
