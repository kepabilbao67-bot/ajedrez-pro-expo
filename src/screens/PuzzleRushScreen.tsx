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

  // Load records on mount
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

  // Robust timer loop with target time calculation
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
          // Check if candidate matches any step of puzzle solution
          const isCorrect = currentPuzzle.solution.some((sol) => {
            const fromSq = typeof sol.from === 'number' ? sol.from : candidate.from;
            const toSq = typeof sol.to === 'number' ? sol.to : candidate.to;
            return candidate.from === fromSq && candidate.to === toSq;
          });

          if (isCorrect) {
            // Apply move and advance
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
            // Incorrect move
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

  const availableWidth = width - 32;
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
          <Text style={styles.headerTitle}>Puzzle Rush Contrarreloj</Text>
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
          <View style={styles.dashStatBox}>
            <Text style={styles.dashLabel}>PUNTOS</Text>
            <Text style={[styles.dashValue, styles.scoreValue]}>{score}</Text>
          </View>
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
              <Text style={styles.startButtonText}>¡INICIAR PUZZLE RUSH!</Text>
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
  root: { flex: 1, backgroundColor: '#09130F' },
  container: { padding: 16, alignItems: 'center', gap: 12 },
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
  recordBadge: {
    backgroundColor: '#1E3529',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F5C451',
  },
  recordBadgeText: { color: '#F5C451', fontSize: 12, fontWeight: '900' },
  modeTabsRow: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
    maxWidth: 440,
  },
  modeTab: {
    flex: 1,
    backgroundColor: '#14241D',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#294235',
  },
  modeTabActive: {
    backgroundColor: '#00E5B4',
    borderColor: '#00E5B4',
  },
  modeTabText: { color: '#9EAFA5', fontSize: 12, fontWeight: '800' },
  modeTabTextActive: { color: '#09130F', fontWeight: '900' },
  dashboardCard: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    backgroundColor: '#14241D',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#294235',
    justifyContent: 'space-around',
  },
  dashStatBox: { alignItems: 'center', gap: 2 },
  dashLabel: { color: '#9EAFA5', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  dashValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', fontVariant: ['tabular-nums'] },
  dashValueUrgent: { color: '#FF4D4D' },
  scoreValue: { color: '#00E5B4' },
  strikesText: { fontSize: 14, marginTop: 2 },
  turnBanner: {
    backgroundColor: '#16281F',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#254433',
  },
  turnBannerText: { color: '#F6E6BD', fontSize: 12, fontWeight: '800' },
  boardWrapper: { alignItems: 'center', justifyContent: 'center' },
  controlsSection: { width: '100%', maxWidth: 440, marginTop: 4 },
  startButton: {
    backgroundColor: '#D6A943',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  startButtonText: { color: '#162019', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
  stopButton: {
    backgroundColor: '#321B17',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A84737',
  },
  stopButtonText: { color: '#FFD8CF', fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 12, 9, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#14241D',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#345242',
    gap: 12,
  },
  modalTrophy: { fontSize: 44 },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  newRecordBadge: {
    backgroundColor: 'rgba(245, 196, 81, 0.15)',
    borderWidth: 1,
    borderColor: '#F5C451',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  newRecordBadgeText: { color: '#F5C451', fontSize: 12, fontWeight: '900' },
  modalScoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 10,
    backgroundColor: '#0E1A14',
    borderRadius: 14,
  },
  modalScoreCol: { alignItems: 'center', gap: 4 },
  modalScoreLabel: { color: '#9EAFA5', fontSize: 11, fontWeight: '700' },
  modalScoreNum: { color: '#00E5B4', fontSize: 26, fontWeight: '900' },
  modalRecordNum: { color: '#F5C451', fontSize: 26, fontWeight: '900' },
  modalXpReward: { color: '#00E5B4', fontSize: 13, fontWeight: '800' },
  modalBtnRow: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 8 },
  modalPrimaryBtn: {
    flex: 1.5,
    backgroundColor: '#00E5B4',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalPrimaryBtnText: { color: '#09130F', fontSize: 14, fontWeight: '900' },
  modalSecondaryBtn: {
    flex: 1,
    backgroundColor: '#1E3529',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalSecondaryBtnText: { color: '#C5D0C9', fontSize: 14, fontWeight: '800' },
});
