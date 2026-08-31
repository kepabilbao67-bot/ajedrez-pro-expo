import { useEffect, useState } from 'react';
import {
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

import { ChessGame, colorOf, squareToAlgebraic, type Move, type Position, type Square } from '@/chess';
import { ChessBoard } from '@/components/chess-board';
import { PromotionPicker } from '@/components/promotion-picker';
import {
  ELO_TIERS,
  getDailyPuzzle,
  getPuzzlesByTier,
  loadDailyStreak,
  recordDailyPuzzleSolved,
  type DailyStreakData,
  type EloTier,
} from '@/training/daily-puzzle';
import type { TacticalPuzzleItem } from '@/training/content/offline-tactics-pack';
import { useVisualPreferences } from '@/hooks/use-visual-preferences';
import { useHaptics } from '@/hooks/use-haptics';
import { useAudioSfx } from '@/hooks/use-audio-sfx';

export function PuzzlesScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { boardTheme, pieceSet, visualPreferences } = useVisualPreferences();
  const { hapticMove, hapticCapture, hapticVictory, hapticDefeat } = useHaptics();
  const { playMove, playCapture, playVictory } = useAudioSfx(visualPreferences.soundsEnabled);

  const [tier, setTier] = useState<EloTier>('intermediate');
  const [streakData, setStreakData] = useState<DailyStreakData>({
    currentStreak: 0,
    bestStreak: 0,
    lastSolvedDate: null,
    totalPuzzlesSolved: 0,
    solvedToday: false,
  });

  const [activePuzzle, setActivePuzzle] = useState<TacticalPuzzleItem>(() => getDailyPuzzle('intermediate'));
  const [game, setGame] = useState<ChessGame>(() => new ChessGame(activePuzzle.fen));
  const [position, setPosition] = useState<Position>(() => game.getPosition());
  const [selected, setSelected] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<readonly Move[]>(() => game.legalMoves());
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Juegan blancas y ganan ventaja.');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [selectedThemeFilter, setSelectedThemeFilter] = useState<string>('all');

  useEffect(() => {
    loadDailyStreak().then(setStreakData).catch(() => {});
  }, []);

  const loadPuzzle = (puzzle: TacticalPuzzleItem) => {
    setActivePuzzle(puzzle);
    const newGame = new ChessGame(puzzle.fen);
    setGame(newGame);
    setPosition(newGame.getPosition());
    setSelected(null);
    setLegalMoves(newGame.legalMoves());
    setLastMove(null);
    setIsCompleted(false);
    setIsFailed(false);
    setStepIndex(0);
    setPendingPromotion(null);
    const turnName = newGame.getPosition().turn === 'w' ? 'blancas' : 'negras';
    setStatusMessage(`Juegan ${turnName}: ${puzzle.objective}`);
  };

  const changeTier = (newTier: EloTier) => {
    setTier(newTier);
    const daily = getDailyPuzzle(newTier);
    loadPuzzle(daily);
  };

  const availableWidth = width - 32;
  const boardSize = Math.min(Math.max(availableWidth, 240), height - 260, 420);

  const handleSquarePress = (square: Square) => {
    if (isCompleted) return;

    if (selected !== null) {
      const candidates = legalMoves.filter((m) => m.to === square);
      if (candidates.some((m) => m.promotion !== undefined)) {
        setPendingPromotion({ from: selected, to: square });
        return;
      }

      if (candidates.length > 0) {
        applyPuzzleMove(selected, square);
        return;
      }
    }

    const currentTurn = position.turn;
    const piece = position.board[square];
    if (piece && colorOf(piece) === currentTurn) {
      setSelected(square);
      setLegalMoves(game.legalMoves().filter((m) => m.from === square));
    } else {
      setSelected(null);
      setLegalMoves(game.legalMoves());
    }
  };

  const applyPuzzleMove = (from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n') => {
    const expectedMove = activePuzzle.solution[stepIndex];
    const fromAlg = squareToAlgebraic(from);
    const toAlg = squareToAlgebraic(to);

    const isMatch =
      expectedMove &&
      ((expectedMove.from === fromAlg && expectedMove.to === toAlg) ||
        // Fallback algebraic check
        (typeof from === 'number' && typeof to === 'number'));

    const record = game.move({ from, to, promotion });

    if (record) {
      setLastMove({ from, to, promotion });
      setPosition(game.getPosition());
      setSelected(null);
      setLegalMoves(game.legalMoves());

      if (record.san.includes('x')) {
        hapticCapture();
        playCapture();
      } else {
        hapticMove();
        playMove();
      }

      if (isMatch) {
        const nextStep = stepIndex + 1;
        if (nextStep >= activePuzzle.solution.length) {
          setIsCompleted(true);
          setStatusMessage(`¡Correcto! ${activePuzzle.explanation}`);
          hapticVictory();
          playVictory();

          recordDailyPuzzleSolved().then(setStreakData).catch(() => {});
        } else {
          setStepIndex(nextStep);
          setStatusMessage('¡Bien! Continúa la línea táctica...');
        }
      } else {
        setIsFailed(true);
        setStatusMessage(`Incorrecto. ${activePuzzle.alternative}`);
        hapticDefeat();
      }
    }
  };

  const handlePromotionSelect = (piece: 'q' | 'r' | 'b' | 'n') => {
    if (pendingPromotion) {
      applyPuzzleMove(pendingPromotion.from, pendingPromotion.to, piece);
      setPendingPromotion(null);
    }
  };

  const currentTierPuzzles = getPuzzlesByTier(tier);
  const filteredPuzzles = selectedThemeFilter === 'all'
    ? currentTierPuzzles
    : currentTierPuzzles.filter((p) => p.theme === selectedThemeFilter);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </Pressable>
          <View style={styles.streakBadge}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakCount}>{streakData.currentStreak} días</Text>
          </View>
        </View>

        {/* HERO CARD: DAILY PUZZLE */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroEyebrow}>PUZZLE TÁCTICO DEL DÍA</Text>
            {streakData.solvedToday ? (
              <Text style={styles.completedBadge}>✓ RESUELTO HOY</Text>
            ) : null}
          </View>
          <Text style={styles.heroTitle}>{activePuzzle.title}</Text>
          <Text style={styles.heroElo}>Nivel ELO ~{activePuzzle.elo} · +{activePuzzle.rewardXp} XP</Text>
        </View>

        {/* ELO TIER SELECTOR */}
        <View style={styles.tierSelector}>
          {ELO_TIERS.map((t) => (
            <Pressable
              key={t.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: tier === t.id }}
              onPress={() => changeTier(t.id)}
              style={[styles.tierOption, tier === t.id && styles.tierOptionActive]}
            >
              <Text style={styles.tierIcon}>{t.icon}</Text>
              <Text style={[styles.tierLabel, tier === t.id && styles.tierLabelActive]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* STATUS BANNER */}
        <Animated.View entering={FadeInDown.duration(200)} style={[styles.statusBanner, isCompleted && styles.statusCompleted, isFailed && styles.statusFailed]}>
          <Text style={[styles.statusText, isCompleted && styles.statusTextSuccess, isFailed && styles.statusTextFailed]}>
            {statusMessage}
          </Text>
        </Animated.View>

        {/* CHESS BOARD */}
        <View style={styles.boardWrapper}>
          <ChessBoard
            position={position}
            size={boardSize}
            selected={selected}
            legalMoves={legalMoves}
            flipped={activePuzzle.fen.split(' ')[1] === 'b'}
            disabled={isCompleted || pendingPromotion !== null}
            lastMove={lastMove}
            inCheck={game.status().check}
            boardTheme={boardTheme}
            pieceSet={pieceSet}
            onSquarePress={handleSquarePress}
          />
        </View>

        {/* ACTIONS & NEXT PUZZLE */}
        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => loadPuzzle(activePuzzle)}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryButtonText}>↺ Reintentar</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              const nextIndex = (currentTierPuzzles.findIndex((p) => p.id === activePuzzle.id) + 1) % currentTierPuzzles.length;
              loadPuzzle(currentTierPuzzles[nextIndex]);
            }}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>Siguiente táctica →</Text>
          </Pressable>
        </View>

        {/* OFFLINE PUZZLE PACK COLLECTION */}
        <View style={styles.packSection}>
          <Text style={styles.packSectionTitle}>Colección Offline de Tácticas ({filteredPuzzles.length})</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themeFilterRow}>
            {['all', 'fork', 'pin', 'mate-in-1', 'mate-in-2', 'discovered-attack', 'win-material', 'endgame'].map((themeKey) => (
              <Pressable
                key={themeKey}
                accessibilityRole="button"
                onPress={() => setSelectedThemeFilter(themeKey)}
                style={[styles.filterChip, selectedThemeFilter === themeKey && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, selectedThemeFilter === themeKey && styles.filterChipTextActive]}>
                  {themeKey === 'all' ? 'Todos' : themeKey.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.puzzlesList}>
            {filteredPuzzles.slice(0, 8).map((p) => (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                onPress={() => loadPuzzle(p)}
                style={[styles.puzzleListItem, activePuzzle.id === p.id && styles.puzzleListItemActive]}
              >
                <View style={styles.puzzleListInfo}>
                  <Text style={styles.puzzleListTitle}>{p.title}</Text>
                  <Text style={styles.puzzleListSub}>{p.theme.toUpperCase()} · ELO ~{p.elo}</Text>
                </View>
                <Text style={styles.puzzleListXp}>+{p.rewardXp} XP</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <PromotionPicker
        visible={pendingPromotion !== null}
        color={position.turn}
        onSelect={handlePromotionSelect}
        onCancel={() => setPendingPromotion(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#09130F',
  },
  container: {
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
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
  backButtonText: {
    color: '#00E5B4',
    fontSize: 13,
    fontWeight: '800',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E3529',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F5C451',
  },
  streakFire: {
    fontSize: 16,
  },
  streakCount: {
    color: '#F5C451',
    fontSize: 13,
    fontWeight: '900',
  },
  heroCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#14241D',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#294235',
    gap: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroEyebrow: {
    color: '#00E5B4',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  completedBadge: {
    color: '#00E5B4',
    fontSize: 10,
    fontWeight: '900',
    backgroundColor: 'rgba(0, 229, 180, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  heroElo: {
    color: '#9EAFA5',
    fontSize: 12,
    fontWeight: '700',
  },
  tierSelector: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    maxWidth: 440,
  },
  tierOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#14241D',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#294235',
  },
  tierOptionActive: {
    backgroundColor: '#1E3A2D',
    borderColor: '#00E5B4',
  },
  tierIcon: {
    fontSize: 14,
  },
  tierLabel: {
    color: '#9EAFA5',
    fontSize: 12,
    fontWeight: '800',
  },
  tierLabelActive: {
    color: '#FFFFFF',
  },
  statusBanner: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#182C22',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D4B3B',
  },
  statusCompleted: {
    backgroundColor: 'rgba(0, 229, 180, 0.12)',
    borderColor: '#00E5B4',
  },
  statusFailed: {
    backgroundColor: 'rgba(255, 77, 77, 0.12)',
    borderColor: '#FF4D4D',
  },
  statusText: {
    color: '#C5D0C9',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  statusTextSuccess: {
    color: '#00E5B4',
    fontWeight: '800',
  },
  statusTextFailed: {
    color: '#FF4D4D',
  },
  boardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    maxWidth: 440,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#14241D',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#294235',
  },
  secondaryButtonText: {
    color: '#C5D0C9',
    fontSize: 13,
    fontWeight: '800',
  },
  primaryButton: {
    flex: 1.5,
    backgroundColor: '#00E5B4',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#09130F',
    fontSize: 13,
    fontWeight: '900',
  },
  packSection: {
    width: '100%',
    maxWidth: 440,
    marginTop: 8,
    gap: 10,
  },
  packSectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  themeFilterRow: {
    gap: 6,
    paddingVertical: 4,
  },
  filterChip: {
    backgroundColor: '#14241D',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#294235',
  },
  filterChipActive: {
    backgroundColor: '#00E5B4',
    borderColor: '#00E5B4',
  },
  filterChipText: {
    color: '#9EAFA5',
    fontSize: 11,
    fontWeight: '800',
  },
  filterChipTextActive: {
    color: '#09130F',
  },
  puzzlesList: {
    gap: 6,
  },
  puzzleListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#14241D',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#294235',
  },
  puzzleListItemActive: {
    borderColor: '#00E5B4',
    backgroundColor: '#1B3529',
  },
  puzzleListInfo: {
    gap: 2,
  },
  puzzleListTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  puzzleListSub: {
    color: '#9EAFA5',
    fontSize: 11,
    fontWeight: '700',
  },
  puzzleListXp: {
    color: '#F5C451',
    fontSize: 12,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.8,
  },
});
