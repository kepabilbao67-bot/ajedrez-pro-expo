import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import type { Color, GameStatus } from '@/chess';
import {
  getRandomEndMessage,
  resolveGameEndConfig,
  type GameEndReason,
} from '@/config/gameEndMessages';
import { APP_COLORS } from '@/theme/colors';

export interface GameOverCareerContext {
  readonly oldRating: number;
  readonly newRating: number;
  readonly ratingDelta: number;
  readonly tournamentName: string;
  readonly currentStandingPos: number;
  readonly round: number;
  readonly totalRounds: number;
}

export interface GameOverModalProps {
  readonly status: GameStatus;
  readonly moveCount: number;
  readonly playerColor?: Color;
  readonly manualReason?: GameEndReason | null;
  readonly visible?: boolean;
  readonly careerContext?: GameOverCareerContext | null;
  readonly onRematch: () => void;
  readonly onAnalyzeGame?: () => void;
  readonly onContinueCareer?: () => void;
  readonly onNewGame: () => void;
}

export function GameOverModal({
  status,
  moveCount,
  playerColor = 'w',
  manualReason = null,
  visible,
  careerContext = null,
  onRematch,
  onAnalyzeGame,
  onContinueCareer,
  onNewGame,
}: GameOverModalProps) {
  const isVisible = visible ?? status.gameOver;

  const outcomeConfig = useMemo(() => {
    return resolveGameEndConfig({ status, playerColor, manualReason });
  }, [status, playerColor, manualReason]);

  const wittyMessage = useMemo(() => {
    if (!isVisible) return '';
    return getRandomEndMessage(outcomeConfig.reason);
  }, [isVisible, outcomeConfig.reason]);

  const isWin = outcomeConfig.outcome === 'win';
  const isLoss = outcomeConfig.outcome === 'loss';
  const isDraw = outcomeConfig.outcome === 'draw';

  return (
    <Modal transparent visible={isVisible} animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <Animated.View
          entering={ZoomIn.duration(240)}
          accessibilityRole="alert"
          style={[
            styles.card,
            isWin && styles.cardWin,
            isLoss && styles.cardLoss,
            isDraw && styles.cardDraw,
          ]}
        >
          {/* TOP HEADER: ICON & SCORE BADGE */}
          <View style={styles.headerRow}>
            <Animated.Text
              entering={FadeInDown.delay(60).duration(180)}
              selectable
              style={styles.icon}
            >
              {outcomeConfig.icon}
            </Animated.Text>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>{outcomeConfig.score}</Text>
            </View>
          </View>

          {/* MAIN TITLE & REASON SUBTITLE */}
          <Text
            selectable
            style={[
              styles.title,
              isWin && styles.titleWin,
              isLoss && styles.titleLoss,
              isDraw && styles.titleDraw,
            ]}
          >
            {outcomeConfig.title}
          </Text>
          <Text selectable style={styles.subtitle}>
            {outcomeConfig.subtitle}
          </Text>

          {/* WITTY / FUNNY MESSAGE CARD */}
          {wittyMessage ? (
            <Animated.View entering={FadeInDown.delay(120).duration(200)} style={styles.quoteCard}>
              <Text style={styles.quoteMark}>&ldquo;</Text>
              <Text selectable style={styles.quoteText}>
                {wittyMessage}
              </Text>
            </Animated.View>
          ) : null}

          {/* CAREER IMPACT BADGE IF IN CAREER MODE */}
          {careerContext ? (
            <Animated.View entering={FadeInDown.delay(100).duration(200)} style={styles.careerOutcomeCard}>
              <View style={styles.careerOutcomeHeader}>
                <Text style={styles.careerTournamentTitle}>{careerContext.tournamentName}</Text>
                <Text style={styles.careerRoundText}>
                  Ronda {careerContext.round}/{careerContext.totalRounds}
                </Text>
              </View>
              <View style={styles.careerStatsRow}>
                <View style={styles.careerStatCol}>
                  <Text style={styles.careerStatLabel}>RATING AJEDREZPRO</Text>
                  <Text
                    style={[
                      styles.careerRatingDelta,
                      careerContext.ratingDelta >= 0 ? styles.deltaPositive : styles.deltaNegative,
                    ]}
                  >
                    {careerContext.ratingDelta >= 0 ? `+${careerContext.ratingDelta}` : `${careerContext.ratingDelta}`}
                  </Text>
                  <Text style={styles.careerRatingTransition}>
                    {careerContext.oldRating} → {careerContext.newRating}
                  </Text>
                </View>
                <View style={styles.careerStatCol}>
                  <Text style={styles.careerStatLabel}>POSICIÓN</Text>
                  <Text style={styles.careerPositionVal}>{careerContext.currentStandingPos}º</Text>
                  <Text style={styles.careerPositionSub}>en la tabla</Text>
                </View>
              </View>
            </Animated.View>
          ) : null}

          {/* GAME STATS PILL */}
          <View style={styles.summary}>
            <Text selectable style={styles.summaryValue}>
              {moveCount}
            </Text>
            <Text selectable style={styles.summaryLabel}>
              {moveCount === 1 ? 'jugada' : 'jugadas disputadas'}
            </Text>
          </View>

          {/* ACTION BUTTONS */}
          <View style={styles.actionGroup}>
            {onContinueCareer ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continuar campeonato"
                onPress={onContinueCareer}
                style={({ pressed }) => [styles.careerBtn, pressed && styles.pressed]}
              >
                <Text style={styles.careerBtnText}>🏆 CONTINUAR CAMPEONATO</Text>
              </Pressable>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Jugar revancha"
              onPress={onRematch}
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            >
              <Text style={styles.primaryBtnText}>⚔️ REVANCHA</Text>
            </Pressable>

            {onAnalyzeGame ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Analizar partida con IA"
                onPress={onAnalyzeGame}
                style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryBtnText}>📊 ANALIZAR PARTIDA</Text>
              </Pressable>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Volver al menú principal"
              onPress={onNewGame}
              style={({ pressed }) => [styles.tertiaryBtn, pressed && styles.pressed]}
            >
              <Text style={styles.tertiaryBtnText}>🏠 MENÚ PRINCIPAL</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 8, 0.90)',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: APP_COLORS.surface,
    borderRadius: 24,
    borderCurve: 'continuous',
    padding: 22,
    gap: 8,
    alignItems: 'stretch',
    borderWidth: 1.5,
    borderColor: APP_COLORS.borderGold,
    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.85), 0 0 24px rgba(229, 184, 105, 0.25)',
  },
  cardWin: {
    borderColor: APP_COLORS.goldPrimary,
    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.85), 0 0 28px rgba(212, 175, 55, 0.35)',
  },
  cardLoss: {
    borderColor: 'rgba(56, 189, 248, 0.5)',
    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.85), 0 0 20px rgba(0, 229, 255, 0.2)',
  },
  cardDraw: {
    borderColor: 'rgba(148, 174, 197, 0.5)',
    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.85), 0 0 20px rgba(148, 174, 197, 0.2)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  icon: {
    fontSize: 42,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: APP_COLORS.surfaceStrong,
    borderWidth: 1,
    borderColor: APP_COLORS.borderGold,
  },
  scoreText: {
    color: APP_COLORS.goldBright,
    fontSize: 16,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  titleWin: {
    color: APP_COLORS.goldBright,
  },
  titleLoss: {
    color: '#E2E8F0',
  },
  titleDraw: {
    color: '#93C5FD',
  },
  subtitle: {
    color: APP_COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  quoteCard: {
    backgroundColor: 'rgba(7, 11, 14, 0.75)',
    borderRadius: 14,
    borderCurve: 'continuous',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    marginVertical: 4,
    position: 'relative',
  },
  quoteMark: {
    position: 'absolute',
    left: 8,
    top: 2,
    fontSize: 24,
    color: 'rgba(212, 175, 55, 0.35)',
    fontWeight: '900',
  },
  quoteText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 10,
    fontWeight: '600',
  },
  summary: {
    alignSelf: 'center',
    minWidth: 120,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginVertical: 2,
    backgroundColor: APP_COLORS.surfaceStrong,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  summaryValue: {
    color: APP_COLORS.blueElectric,
    fontSize: 18,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    color: APP_COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  actionGroup: {
    gap: 8,
    marginTop: 6,
  },
  primaryBtn: {
    minHeight: 50,
    borderRadius: 15,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.goldPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(229, 184, 105, 0.35)',
  },
  primaryBtnText: {
    color: '#070B0E',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    minHeight: 46,
    borderRadius: 15,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderColor: APP_COLORS.blueElectric,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: APP_COLORS.blueElectric,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  tertiaryBtn: {
    minHeight: 44,
    borderRadius: 15,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    backgroundColor: APP_COLORS.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  careerOutcomeCard: {
    backgroundColor: 'rgba(0, 229, 255, 0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    padding: 12,
    marginVertical: 4,
    gap: 8,
  },
  careerOutcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  careerTournamentTitle: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  careerRoundText: {
    color: '#F5C518',
    fontSize: 11,
    fontWeight: '700',
  },
  careerStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  careerStatCol: {
    alignItems: 'center',
  },
  careerStatLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  careerRatingDelta: {
    fontSize: 18,
    fontWeight: '900',
  },
  deltaPositive: {
    color: '#10B981',
  },
  deltaNegative: {
    color: '#EF4444',
  },
  careerRatingTransition: {
    color: '#94A3B8',
    fontSize: 11,
  },
  careerPositionVal: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  careerPositionSub: {
    color: '#64748B',
    fontSize: 10,
  },
  careerBtn: {
    minHeight: 50,
    borderRadius: 15,
    borderCurve: 'continuous',
    backgroundColor: '#00E5FF',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(0, 229, 255, 0.35)',
  },
  careerBtnText: {
    color: '#070B0E',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tertiaryBtnText: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
