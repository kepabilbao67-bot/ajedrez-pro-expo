import { StyleSheet, Text, View } from 'react-native';

import type { GameStatus } from '@/chess';
import { XP_AWARDS } from '@/gamification/xp-types';

export interface PostGameSummaryData {
  bestMove: string;
  worstError: string;
  learning: string;
}

export interface PostGamePanelProps {
  readonly status: GameStatus;
  readonly postGameSummary: PostGameSummaryData | null;
}

export function PostGamePanel({ status, postGameSummary }: PostGamePanelProps) {
  if (!status.gameOver) return null;

  return (
    <View style={styles.postGamePanel}>
      <Text selectable style={styles.profileTitle}>Resumen postpartida</Text>
      <Text selectable style={styles.profileWeaknesses}>Resultado: {status.draw ? 'Tablas' : status.winner === 'w' ? 'Victoria' : 'Derrota'}</Text>
      <Text selectable style={styles.profileWeaknesses}>Mejor jugada: {postGameSummary?.bestMove ?? 'Analiza la partida para descubrirla.'}</Text>
      <Text selectable style={styles.profileWeaknesses}>Error principal: {postGameSummary?.worstError ?? 'An no hay anlisis.'}</Text>
      <Text selectable style={styles.profileWeaknesses}>Aprendizaje: {postGameSummary?.learning ?? 'Revisa amenazas y piezas sin defender.'}</Text>
      <Text selectable style={styles.profileWeaknesses}>Recompensa: +{status.winner === 'w' ? XP_AWARDS['game-completed'] + XP_AWARDS['victory'] : XP_AWARDS['game-completed']} XP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  postGamePanel: { width: '100%', maxWidth: 440, gap: 5, padding: 14, borderRadius: 16, borderCurve: 'continuous', backgroundColor: '#1B3025', borderWidth: 1, borderColor: '#3B5A49' },
  profileTitle: { color: '#F5C451', fontSize: 13, fontWeight: '900' },
  profileWeaknesses: { color: '#C5D0C9', fontSize: 12, lineHeight: 18 },
});
