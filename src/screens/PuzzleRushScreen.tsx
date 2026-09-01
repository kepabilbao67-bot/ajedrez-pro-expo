import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ChessGame, type Move, type Square } from '@/chess';
import { ChessBoard } from '@/components/chess-board';
import {
  formatRushTime,
  getInitialTimeForMode,
  getPuzzleForScore,
  loadPuzzleRushRecords,
  savePuzzleRushRecord,
  type PuzzleRushMode,
  type PuzzleRushRecords,
} from '@/services/puzzleRushEngine';
import type { TacticalPuzzleItem } from '@/training/content/offline-tactics-pack';
import { useVisualPreferences } from '@/hooks/use-visual-preferences';
import { useHaptics } from '@/hooks/use-haptics';
import { useAudioSfx } from '@/hooks/use-audio-sfx';
import { usePlayerProgress } from '@/hooks/use-player-progress';
import { APP_COLORS } from '@/theme/colors';

export function PuzzleRushScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { boardTheme, pieceSet, visualPreferences } = useVisualPreferences();
  const { hapticMove, hapticCheck, hapticVictory } = useHaptics();
  const { playMove, playCapture, playVictory } = useAudioSfx(visualPreferences.soundsEnabled);
  const { recordExerciseCompleted } = usePlayerProgress();

  const [mode, setMode] = useState<PuzzleRushMode>('3min');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [score, setScore] = useState<number>(0);
  const [strikes, setStrikes] = useState<number>(0);
  const [records, setRecords] = useState<PuzzleRushRecords>({ record3min: 0, record5min: 0, recordSurvival: 0 });

  const [currentPuzzle, setCurrentPuzzle] = useState<TacticalPuzzleItem>(() => getPuzzleForScore(0));
  const [game, setGame] = useState<ChessGame>(() => new ChessGame(getPuzzleForScore(0).fen));
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);

  const [gameOverModalVisible, setGameOverModalVisible] = useState<boolean>(false);
  const [isNewRecordEarned, setIsNewRecordEarned] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreRef = useRef<number>(0);
  const strikesRef = useRef<number>(0);
  const modeRef = useRef<PuzzleRushMode>(mode);
  const isEndingRef = useRef<boolean>(false);

  useEffect(() => {
    loadPuzzleRushRecords().then(setRecords).catch(() => {});
  }, []);

  const finishGame = useCallback(async () => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;

    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const currentMode = modeRef.current;
    const finalScore = scoreRef.current;

    const { records: updated, isNewRecord } = await savePuzzleRushRecord(currentMode, finalScore);
    setRecords(updated);
    setIsNewRecordEarned(isNewRecord);

    if (finalScore > 0) {
      recordExerciseCompleted();
      if (isNewRecord) {
        hapticVictory();
        playVictory();
      }
    }

    setGameOverModalVisible(true);
  }, [recordExerciseCompleted, hapticVictory, playVictory]);

  const startSession = (selectedMode: PuzzleRushMode = mode) => {
    isEndingRef.current = false;
    scoreRef.current = 0;
    strikesRef.current = 0;
    modeRef.current = selectedMode;

    setMode(selectedMode);
    setScore(0);
    setStrikes(0);
    setSolvedIds([]);
    setIsNewRecordEarned(false);
    setGameOverModalVisible(false);

    const initialPuzzle = getPuzzleForScore(0);
    setCurrentPuzzle(initialPuzzle);
    setGame(new ChessGame(initialPuzzle.fen));
    setSelectedSquare(null);
    setLastMove(null);

    const startTime = getInitialTimeForMode(selectedMode);
    setTimeLeft(startTime);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const currentMode = modeRef.current;
    if (currentMode === 'survival') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev + 1);
      }, 1000);
    } else {
      const initialSeconds = getInitialTimeForMode(currentMode);
      const targetEndTime = Date.now() + initialSeconds * 1000;

      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          void finishGame();
        }
      }, 500);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, finishGame]);

  const nextPuzzle = (newScore: number, solvedList: string[]) => {
    const puzzle = getPuzzleForScore(newScore, solvedList);
    setCurrentPuzzle(puzzle);
    setGame(new ChessGame(puzzle.fen));
    setSelectedSquare(null);
    setLastMove(null);
  };

  const handleSquarePress = (square: Square) => {
    if (!isPlaying || isEndingRef.current) return;

    if (selectedSquare !== null) {
      const legal = game.legalMoves();
      const candidate = legal.find((m) => m.from === selectedSquare && m.to === square);

      if (candidate) {
        const testGame = new ChessGame(game.fen());
        const record = testGame.move(candidate);

        if (record) {
          const isCorrect = currentPuzzle.solution.some((sol) => {
            const fromSq = typeof sol.from === 'number' ? sol.from : candidate.from;
            const toSq = typeof sol.to === 'number' ? sol.to : candidate.to;
            return candidate.from === fromSq && candidate.to === toSq;
          });

          if (isCorrect) {
            game.move(candidate);
            setLastMove(candidate);
            hapticMove();
            playMove();

            scoreRef.current += 1;
            const nextScore = scoreRef.current;
            setScore(nextScore);
            const updatedSolved = [...solvedIds, currentPuzzle.id];
            setSolvedIds(updatedSolved);

            setTimeout(() => {
              nextPuzzle(nextScore, updatedSolved);
            }, 300);
            return;
          } else {
            strikesRef.current += 1;
            const nextStrikes = strikesRef.current;
            setStrikes(nextStrikes);
            hapticCheck();
            playCapture();

            if (nextStrikes >= 3) {
              void finishGame();
            }
            setSelectedSquare(null);
            return;
          }
        }
      }
    }

    const currentTurn = game.getPosition().turn;
    const piece = game.getPosition().board[square];
    if (piece) {
      const isPieceWhite = piece === piece.toUpperCase();
      if ((isPieceWhite && currentTurn === 'w') || (!isPieceWhite && currentTurn === 'b')) {
        setSelectedSquare(square);
        return;
      }
    }

    setSelectedSquare(null);
  };

  const availableWidth = width - 28;
  const boardSize = Math.min(Math.max(availableWidth, 240), 380);

  const getRecordForMode = (m: PuzzleRushMode) => {
    if (m === '3min') return records.record3min;
    if (m === '5min') return records.record5min;
    return records.recordSurvival;
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Puzzle Rush</Text>
          <View style={styles.recordBadge}>
            <Text style={styles.recordBadgeText}>🏆 {getRecordForMode(mode)}</Text>
          </View>
        </View>

        {/* MODE SELECTOR TABS */}
        <View style={styles.modeTabsRow}>
          {[
            { id: '3min', label: '⏱️ 3 Min' },
            { id: '5min', label: '⏱️ 5 Min' },
            { id: 'survival', label: '🛡️ Supervivencia' },
          ].map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() => {
                if (isPlaying) return;
                setMode(item.id as PuzzleRushMode);
                setTimeLeft(getInitialTimeForMode(item.id as PuzzleRushMode));
              }}
              style={[styles.modeTab, mode === item.id && styles.modeTabActive]}
            >
              <Text style={[styles.modeTabText, mode === item.id && styles.modeTabTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* DASHBOARD STATS (Timer, Score, Strikes) */}
        <View style={styles.dashboardCard}>
          <View style={styles.dashStatBox}>
            <Text style={styles.dashLabel}>{mode === 'survival' ? 'TIEMPO' : 'RESTANTE'}</Text>
            <Text style={[styles.dashValue, timeLeft < 30 && mode !== 'survival' && styles.dashValueUrgent]}>
              {formatRushTime(timeLeft)}
            </Text>
          </View>
          <View style={styles.dashDivider} />
          <View style={styles.dashStatBox}>
            <Text style={styles.dashLabel}>PUNTOS</Text>
            <Text style={[styles.dashValue, styles.scoreValue]}>{score}</Text>
          </View>
          <View style={styles.dashDivider} />
          <View style={styles.dashStatBox}>
            <Text style={styles.dashLabel}>VIDAS</Text>
            <Text style={styles.strikesText}>
              {mode === 'survival'
                ? '❤️'.repeat(Math.max(0, 3 - strikes)) + '🖤'.repeat(strikes)
                : '❌'.repeat(strikes) + '⭕'.repeat(Math.max(0, 3 - strikes))}
            </Text>
          </View>
        </View>

        {/* TURN BANNER */}
        <View style={styles.turnBanner}>
          <Text style={styles.turnBannerText}>
            {game.getPosition().turn === 'w' ? '⚪ Juegan Blancas' : '⚫ Juegan Negras'} · {currentPuzzle.theme} ({currentPuzzle.elo} ELO)
          </Text>
        </View>

        {/* BOARD */}
        <View style={styles.boardWrapper}>
          <ChessBoard
            position={game.getPosition()}
            size={boardSize}
            selected={selectedSquare}
            legalMoves={selectedSquare !== null ? game.legalMoves().filter((m) => m.from === selectedSquare) : []}
            flipped={game.getPosition().turn === 'b'}
            disabled={!isPlaying}
            lastMove={lastMove}
            inCheck={game.status().check}
            boardTheme={boardTheme}
            pieceSet={pieceSet}
            onSquarePress={handleSquarePress}
          />
        </View>

        {/* CONTROLS */}
        <View style={styles.controlsSection}>
          {!isPlaying ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => startSession(mode)}
              style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}
            >
              <Text style={styles.startButtonText}>⚡ ¡INICIAR PUZZLE RUSH!</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => void finishGame()}
              style={({ pressed }) => [styles.stopButton, pressed && styles.pressed]}
            >
              <Text style={styles.stopButtonText}>Rendirse / Terminar</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* GAME OVER MODAL */}
      <Modal
        visible={gameOverModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGameOverModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Animated.View entering={FadeInDown.duration(250)} style={styles.modalCard}>
            <Text style={styles.modalTrophy}>🏆</Text>
            <Text style={styles.modalTitle}>¡SESIÓN COMPLETADA!</Text>

            {isNewRecordEarned ? (
              <View style={styles.newRecordBadge}>
                <Text style={styles.newRecordBadgeText}>✨ ¡NUEVO RÉCORD PERSONAL! ✨</Text>
              </View>
            ) : null}

            <View style={styles.modalScoresRow}>
              <View style={styles.modalScoreCol}>
                <Text style={styles.modalScoreLabel}>Puntuación Final</Text>
                <Text style={styles.modalScoreNum}>{score}</Text>
              </View>
              <View style={styles.modalScoreCol}>
                <Text style={styles.modalScoreLabel}>Récord de Modo</Text>
                <Text style={styles.modalRecordNum}>{getRecordForMode(mode)}</Text>
              </View>
            </View>

            <Text style={styles.modalXpReward}>+{score * 5} XP Ganados para tu perfil</Text>

            <View style={styles.modalBtnRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setGameOverModalVisible(false);
                  startSession(mode);
                }}
                style={styles.modalPrimaryBtn}
              >
                <Text style={styles.modalPrimaryBtnText}>Jugar Otra Vez</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setGameOverModalVisible(false)}
                style={styles.modalSecondaryBtn}
              >
                <Text style={styles.modalSecondaryBtnText}>Cerrar</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: APP_COLORS.background },
  container: { padding: 14, alignItems: 'center', gap: 12 },
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
  recordBadge: {
    backgroundColor: APP_COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: APP_COLORS.borderGold,
  },
  recordBadgeText: { color: APP_COLORS.goldBright, fontSize: 12, fontWeight: '900' },
  modeTabsRow: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
    maxWidth: 440,
  },
  modeTab: {
    flex: 1,
    backgroundColor: APP_COLORS.surface,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  modeTabActive: {
    backgroundColor: APP_COLORS.goldPrimary,
    borderColor: APP_COLORS.goldBright,
  },
  modeTabText: { color: APP_COLORS.textSecondary, fontSize: 12, fontWeight: '800' },
  modeTabTextActive: { color: '#070B0E', fontWeight: '900' },
  dashboardCard: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    backgroundColor: APP_COLORS.surface,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  dashStatBox: { alignItems: 'center', gap: 2 },
  dashDivider: { width: 1, height: 26, backgroundColor: APP_COLORS.border },
  dashLabel: { color: APP_COLORS.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  dashValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', fontVariant: ['tabular-nums'] },
  dashValueUrgent: { color: APP_COLORS.danger },
  scoreValue: { color: APP_COLORS.blueElectric },
  strikesText: { fontSize: 13, marginTop: 2 },
  turnBanner: {
    backgroundColor: APP_COLORS.surfaceStrong,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  turnBannerText: { color: APP_COLORS.goldBright, fontSize: 12, fontWeight: '800' },
  boardWrapper: { alignItems: 'center', justifyContent: 'center' },
  controlsSection: { width: '100%', maxWidth: 440, marginTop: 4 },
  startButton: {
    backgroundColor: APP_COLORS.goldPrimary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    boxShadow: '0 6px 18px rgba(229, 184, 105, 0.35)',
  },
  startButtonText: { color: '#070B0E', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
  stopButton: {
    backgroundColor: APP_COLORS.surfaceStrong,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: APP_COLORS.danger,
  },
  stopButtonText: { color: '#FFBABA', fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 8, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: APP_COLORS.borderGold,
    gap: 12,
  },
  modalTrophy: { fontSize: 44 },
  modalTitle: { color: APP_COLORS.goldBright, fontSize: 20, fontWeight: '900' },
  newRecordBadge: {
    backgroundColor: 'rgba(229, 184, 105, 0.15)',
    borderWidth: 1,
    borderColor: APP_COLORS.goldPrimary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  newRecordBadgeText: { color: APP_COLORS.goldBright, fontSize: 12, fontWeight: '900' },
  modalScoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 12,
    backgroundColor: APP_COLORS.surfaceStrong,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  modalScoreCol: { alignItems: 'center', gap: 4 },
  modalScoreLabel: { color: APP_COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  modalScoreNum: { color: APP_COLORS.blueElectric, fontSize: 26, fontWeight: '900' },
  modalRecordNum: { color: APP_COLORS.goldBright, fontSize: 26, fontWeight: '900' },
  modalXpReward: { color: APP_COLORS.goldBright, fontSize: 13, fontWeight: '800' },
  modalBtnRow: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 8 },
  modalPrimaryBtn: {
    flex: 1.5,
    backgroundColor: APP_COLORS.goldPrimary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalPrimaryBtnText: { color: '#070B0E', fontSize: 14, fontWeight: '900' },
  modalSecondaryBtn: {
    flex: 1,
    backgroundColor: APP_COLORS.surfaceStrong,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    alignItems: 'center',
  },
  modalSecondaryBtnText: { color: APP_COLORS.textSecondary, fontSize: 14, fontWeight: '800' },
});
