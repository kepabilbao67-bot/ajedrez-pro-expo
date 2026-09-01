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
import { APP_COLORS } from '@/theme/colors';

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

  const availableWidth = width - 28;
  const boardSize = Math.min(Math.max(availableWidth, 240), height - 260, 400);

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
            <Text style={styles.streakCount}>{streakData.currentStreak} días de racha</Text>
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
          <Text style={styles.packSectionTitle}>Colección de Tácticas ({filteredPuzzles.length})</Text>

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
    backgroundColor: APP_COLORS.background,
  },
  container: {
    padding: 14,
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
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  backButtonText: {
    color: APP_COLORS.blueElectric,
    fontSize: 13,
    fontWeight: '800',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: APP_COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.borderGold,
  },
  streakFire: {
    fontSize: 15,
  },
  streakCount: {
    color: APP_COLORS.goldBright,
    fontSize: 12,
    fontWeight: '900',
  },
  heroCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: APP_COLORS.borderGold,
    gap: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroEyebrow: {
    color: APP_COLORS.blueElectric,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  completedBadge: {
    color: APP_COLORS.goldBright,
    fontSize: 10,
    fontWeight: '900',
    backgroundColor: 'rgba(229, 184, 105, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: APP_COLORS.goldPrimary,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  heroElo: {
    color: APP_COLORS.textSecondary,
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
    backgroundColor: APP_COLORS.surface,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  tierOptionActive: {
    backgroundColor: APP_COLORS.goldPrimary,
    borderColor: APP_COLORS.goldBright,
  },
  tierIcon: {
    fontSize: 14,
  },
  tierLabel: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  tierLabelActive: {
    color: '#070B0E',
    fontWeight: '900',
  },
  statusBanner: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: APP_COLORS.surfaceStrong,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  statusCompleted: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderColor: APP_COLORS.success,
  },
  statusFailed: {
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    borderColor: APP_COLORS.danger,
  },
  statusText: {
    color: APP_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  statusTextSuccess: {
    color: APP_COLORS.success,
    fontWeight: '800',
  },
  statusTextFailed: {
    color: '#FFBABA',
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
    backgroundColor: APP_COLORS.surface,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  secondaryButtonText: {
    color: APP_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  primaryButton: {
    flex: 1.5,
    backgroundColor: APP_COLORS.goldPrimary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    boxShadow: '0 4px 14px rgba(229, 184, 105, 0.3)',
  },
  primaryButtonText: {
    color: '#070B0E',
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
    color: APP_COLORS.goldBright,
    fontSize: 14,
    fontWeight: '900',
  },
  themeFilterRow: {
    gap: 6,
    paddingVertical: 4,
  },
  filterChip: {
    backgroundColor: APP_COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  filterChipActive: {
    backgroundColor: APP_COLORS.blueElectric,
    borderColor: APP_COLORS.blueElectric,
  },
  filterChipText: {
    color: APP_COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  filterChipTextActive: {
    color: '#070B0E',
    fontWeight: '900',
  },
  puzzlesList: {
    gap: 6,
  },
  puzzleListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: APP_COLORS.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  puzzleListItemActive: {
    borderColor: APP_COLORS.goldPrimary,
    backgroundColor: 'rgba(229, 184, 105, 0.1)',
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
    color: APP_COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  puzzleListXp: {
    color: APP_COLORS.goldBright,
    fontSize: 12,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.8,
  },
});
