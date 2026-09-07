import { StyleSheet, Text, View, Pressable } from 'react-native';
import { APP_COLORS } from '@/theme/colors';

export interface PuzzleRushPanelProps {
  readonly isActive: boolean;
  readonly timeLeft: number;
  readonly score: number;
  readonly strikes: number;
  readonly maxStrikes: number;
  readonly highScore: number;
  readonly onStart: () => void;
  readonly onQuit: () => void;
}

export function PuzzleRushPanel({ isActive, timeLeft, score, strikes, maxStrikes, highScore, onStart, onQuit }: PuzzleRushPanelProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft <= 30 && timeLeft > 0;

  if (!isActive) {
    return (
      <View style={styles.startCard}>
        <Text style={styles.startTitle}>Supervivencia de Puzzles</Text>
        <Text style={styles.startDesc}>Resuelve todos los problemas que puedas en 3 minutos. 3 fallos y estás fuera.</Text>
        {highScore > 0 ? (
          <Text style={styles.highScoreText}>Récord actual: {highScore} pts</Text>
        ) : null}
        <Pressable style={({ pressed }) => [styles.startButton, pressed && styles.pressed]} onPress={onStart}>
          <Text style={styles.startButtonText}>Empezar Reto ⚡</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.activeCard}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Tiempo</Text>
          <Text style={[styles.statValue, isLowTime && styles.lowTime]}>{formatTime(timeLeft)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Puntos</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Vidas</Text>
          <Text style={styles.strikes}>
            {Array.from({ length: maxStrikes }).map((_, i) => (
              <Text key={i} style={i < strikes ? styles.strikeLost : styles.strikeActive}>
                {i < strikes ? '❌' : '❤️'}
              </Text>
            ))}
          </Text>
        </View>
      </View>
      <Pressable style={styles.quitButton} onPress={onQuit}>
        <Text style={styles.quitButtonText}>Rendirse</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  startCard: {
    width: '100%',
    maxWidth: 440,
    padding: 20,
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1.5,
    borderColor: APP_COLORS.borderGold,
    alignItems: 'center',
    gap: 10,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 16px rgba(229, 184, 105, 0.2)',
  },
  startTitle: { color: APP_COLORS.goldBright, fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  startDesc: { color: APP_COLORS.textSecondary, fontSize: 13, textAlign: 'center', marginBottom: 8 },
  highScoreText: { color: APP_COLORS.blueElectric, fontSize: 14, fontWeight: '800', marginBottom: 12 },
  startButton: {
    backgroundColor: APP_COLORS.goldPrimary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    borderCurve: 'continuous',
    boxShadow: '0 4px 14px rgba(229, 184, 105, 0.35)',
  },
  startButtonText: { color: '#070B0E', fontSize: 15, fontWeight: '900' },
  
  activeCard: {
    width: '100%',
    maxWidth: 440,
    padding: 18,
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1.5,
    borderColor: APP_COLORS.borderBlue,
    gap: 12,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 16px rgba(0, 210, 255, 0.2)',
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', gap: 4 },
  statLabel: { color: APP_COLORS.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  statValue: { color: APP_COLORS.goldBright, fontSize: 24, fontWeight: '900', fontVariant: ['tabular-nums'] },
  lowTime: { color: APP_COLORS.danger },
  strikes: { fontSize: 18, letterSpacing: 2 },
  strikeActive: { opacity: 1 },
  strikeLost: { opacity: 0.4 },
  
  quitButton: { alignSelf: 'center', marginTop: 4 },
  quitButtonText: { color: APP_COLORS.textMuted, fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
