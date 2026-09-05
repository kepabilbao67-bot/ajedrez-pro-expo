import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSchool } from '@/hooks/use-school';
import type { PieceLessonId } from '@/school/school-types';
import { ChessBoard } from '@/components/chess-board';
import { boardThemeById } from '@/board-themes/board-themes';
import { pieceSetById } from '@/board-themes/piece-sets';
import { ChessGame, colorOf, squareToAlgebraic, type Move, type Square } from '@/chess';
import { APP_COLORS } from '@/theme/colors';

export function SchoolScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const {
    state,
    loading,
    allLessons,
    activeLesson,
    activeExercise,
    currentExerciseIndex,
    profeProMessage,
    setProfeProMessage,
    setSchoolMode,
    selectLesson,
    finishLesson,
    nextExercise,
  } = useSchool();

  const [realPieceModalVisible, setRealPieceModalVisible] = useState(false);
  const [exerciseGame, setExerciseGame] = useState(() => new ChessGame(activeExercise.initialFen));
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [movesTaken, setMovesTaken] = useState(0);
  const [completedModalVisible, setCompletedModalVisible] = useState(false);
  const [lastStarsEarned, setLastStarsEarned] = useState(3);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_COLORS.blueElectric} />
        <Text style={styles.loadingText}>Cargando Escuela AjedrezPro...</Text>
      </View>
    );
  }

  const boardSize = Math.min(width - 32, 300);
  const isKidsMode = state.mode === 'kids';

  const handleSelectLesson = (lessonId: PieceLessonId) => {
    selectLesson(lessonId);
    const lesson = allLessons.find((l) => l.id === lessonId);
    if (lesson && lesson.exercises[0]) {
      setExerciseGame(new ChessGame(lesson.exercises[0].initialFen));
      setSelectedSquare(null);
      setMovesTaken(0);
    }
  };

  const handleSquarePress = (square: Square) => {
    if (selectedSquare === null) {
      const piece = exerciseGame.getPosition().board[square];
      if (piece && colorOf(piece) === 'w') {
        setSelectedSquare(square);
      }
      return;
    }

    // Try move
    const legalMoves = exerciseGame.legalMoves(selectedSquare);
    const isLegal = legalMoves.some((m: Move) => m.to === square);

    if (isLegal) {
      const record = exerciseGame.move({ from: selectedSquare, to: square });
      if (record) {
        const nextMoves = movesTaken + 1;
        setMovesTaken(nextMoves);
        setSelectedSquare(null);

        // Check if destination is one of the goal squares
        const destAlg = squareToAlgebraic(square);
        if (activeExercise.goalSquares.includes(destAlg)) {
          setProfeProMessage(activeExercise.profeProPraise);

          // Check if all goals achieved or if this was the final exercise
          const stars = nextMoves <= activeExercise.optimalMoves ? 3 : nextMoves <= activeExercise.maxAllowedMoves ? 2 : 1;
          setLastStarsEarned(stars);

          if (currentExerciseIndex >= activeLesson.exercises.length - 1) {
            void finishLesson(stars);
            setCompletedModalVisible(true);
          } else {
            setTimeout(() => {
              nextExercise();
              const nextEx = activeLesson.exercises[currentExerciseIndex + 1];
              if (nextEx) {
                setExerciseGame(new ChessGame(nextEx.initialFen));
                setMovesTaken(0);
              }
            }, 1200);
          }
        } else {
          setProfeProMessage('¡Buen movimiento! Ahora dirígete a la estrella.');
        }
      }
    } else {
      const piece = exerciseGame.getPosition().board[square];
      if (piece && colorOf(piece) === 'w') {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
        setProfeProMessage(activeExercise.profeProCorrection);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* TOP HEADER */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/')}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <Text style={styles.backBtnText}>‹ Menú</Text>
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>ESCUELA AJEDREZPRO</Text>
          <Text style={styles.headerSubtitle}>
            {isKidsMode ? '🌟 Modo Infantil & Divertido' : '🏛️ Modo Clásico & Limpio'}
          </Text>
        </View>

        {/* MODE TOGGLE */}
        <Pressable
          onPress={() => void setSchoolMode(isKidsMode ? 'classic' : 'kids')}
          style={styles.modeToggleBtn}
        >
          <Text style={styles.modeToggleText}>{isKidsMode ? '🧒 Kids' : '🏛️ Clásico'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* PROFE PRO SPEECH BUBBLE */}
        <Animated.View entering={FadeInDown.duration(200)} style={styles.coachCard}>
          <View style={styles.coachHeaderRow}>
            <Text style={styles.coachAvatar}>🧙‍♂️</Text>
            <View style={styles.coachMeta}>
              <Text style={styles.coachName}>PROFE PRO</Text>
              <Text style={styles.coachRole}>Tu Guía de Ajedrez</Text>
            </View>
            <Pressable
              onPress={() => setRealPieceModalVisible(true)}
              style={styles.realPieceBtn}
            >
              <Text style={styles.realPieceBtnText}>🔍 Ver pieza real</Text>
            </Pressable>
          </View>
          <Text style={styles.coachSpeechText}>&ldquo;{profeProMessage}&rdquo;</Text>
        </Animated.View>

        {/* LESSONS WORLD MAP CAROUSEL */}
        <View style={styles.lessonsSection}>
          <Text style={styles.sectionHeading}>MAPA DE APRENDIZAJE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.lessonsTrack}>
            {allLessons.map((lesson) => {
              const isUnlocked = state.unlockedLessonIds.includes(lesson.id);
              const isCompleted = state.completedLessonIds.includes(lesson.id);
              const isActive = activeLesson.id === lesson.id;
              const stars = state.lessonStars[lesson.id] ?? 0;

              return (
                <Pressable
                  key={lesson.id}
                  disabled={!isUnlocked}
                  onPress={() => handleSelectLesson(lesson.id)}
                  style={[
                    styles.lessonCard,
                    isActive && styles.lessonCardActive,
                    !isUnlocked && styles.lessonCardLocked,
                  ]}
                >
                  <Text style={styles.lessonIcon}>{lesson.kidsIcon}</Text>
                  <Text numberOfLines={1} style={styles.lessonName}>
                    {isKidsMode ? lesson.kidsName : lesson.pieceName}
                  </Text>
                  {isCompleted ? (
                    <Text style={styles.starsText}>{'⭐'.repeat(stars)}</Text>
                  ) : isUnlocked ? (
                    <Text style={styles.unlockedTag}>Disponible</Text>
                  ) : (
                    <Text style={styles.lockedTag}>🔒 Bloqueado</Text>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* INTERACTIVE EXERCISE BOARD */}
        <Animated.View entering={FadeIn.duration(200)} style={styles.exerciseCard}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseTitle}>
              {activeExercise.title} ({currentExerciseIndex + 1}/{activeLesson.exercises.length})
            </Text>
            <Text style={styles.exerciseGoalBadge}>Objetivo: ⭐</Text>
          </View>

          <Text style={styles.exerciseInstructions}>{activeExercise.instructions}</Text>

          <View style={styles.boardWrapper}>
            <ChessBoard
              position={exerciseGame.getPosition()}
              size={boardSize}
              selected={selectedSquare}
              legalMoves={selectedSquare !== null ? exerciseGame.legalMoves(selectedSquare) : []}
              flipped={false}
              disabled={false}
              lastMove={null}
              inCheck={false}
              boardTheme={boardThemeById(isKidsMode ? 'kids-castle' : 'classic')}
              pieceSet={pieceSetById(isKidsMode ? 'kids-classic' : 'staunton')}
              onSquarePress={handleSquarePress}
            />
          </View>

          <Text style={styles.exerciseTip}>💡 Pista: {activeExercise.coachTip}</Text>
        </Animated.View>

        {/* KIDS TOURNAMENT GRADUATION BANNER */}
        {state.graduatedFromSchool ? (
          <Animated.View entering={FadeInDown.duration(220)} style={styles.tournamentBanner}>
            <View style={styles.tournamentBannerHeader}>
              <Text style={styles.tournamentBannerIcon}>🎓🏆</Text>
              <View style={styles.tournamentBannerMeta}>
                <Text style={styles.tournamentBannerTitle}>¡GRADUADO DE LA ESCUELA!</Text>
                <Text style={styles.tournamentBannerSubtitle}>
                  Has completado las 12 lecciones. ¡Tu Primer Torneo te espera!
                </Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Empezar Primer Torneo en Modo Carrera"
              onPress={() => router.push('/career' as never)}
              style={({ pressed }) => [styles.tournamentBannerBtn, pressed && styles.pressed]}
            >
              <Text style={styles.tournamentBannerBtnText}>🚀 JUGAR MI PRIMER TORNEO</Text>
            </Pressable>
          </Animated.View>
        ) : null}
      </ScrollView>

      {/* REAL PIECE COMPARISON MODAL */}
      <Modal visible={realPieceModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Animated.View entering={ZoomIn.duration(200)} style={styles.modalCard}>
            <Text style={styles.modalTitle}>¿CÓMO ES ESTA PIEZA EN LA REALIDAD?</Text>

            <View style={styles.comparisonRow}>
              <View style={styles.compBox}>
                <Text style={styles.compEmoji}>{activeLesson.realPieceComparison.kidsEmoji}</Text>
                <Text style={styles.compLabel}>{activeLesson.realPieceComparison.kidsName}</Text>
              </View>

              <Text style={styles.compArrow}>➔</Text>

              <View style={styles.compBox}>
                <Text style={styles.compEmoji}>{activeLesson.realPieceComparison.classicSymbol}</Text>
                <Text style={styles.compLabel}>{activeLesson.realPieceComparison.classicName}</Text>
              </View>
            </View>

            <Text style={styles.modalExplanation}>
              {activeLesson.realPieceComparison.explanation}
            </Text>

            <Pressable
              onPress={() => setRealPieceModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseBtnText}>¡Entendido!</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>

      {/* LESSON COMPLETED MODAL */}
      <Modal visible={completedModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Animated.View entering={ZoomIn.duration(200)} style={styles.modalCard}>
            <Text style={styles.celebrationIcon}>🏆</Text>
            <Text style={styles.modalTitle}>¡LECCIÓN COMPLETADA!</Text>
            <Text style={styles.celebrationStars}>{'⭐'.repeat(lastStarsEarned)}</Text>
            <Text style={styles.celebrationText}>
              Has aprendido a dominar {activeLesson.pieceName}. ¡Excelente trabajo!
            </Text>
            <Text style={styles.rewardBadges}>
              +{activeLesson.rewardXp} XP • +{activeLesson.rewardCoins} 👑 Coronas
            </Text>

            <Pressable
              onPress={() => setCompletedModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseBtnText}>Siguiente Lección ➔</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070C12',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#070C12',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94AEC5',
    fontSize: 15,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: '#0A121C',
    borderBottomWidth: 1,
    borderBottomColor: '#1E2D3E',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#162230',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#00E5FF',
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  headerSubtitle: {
    color: '#F5C518',
    fontSize: 11,
    fontWeight: '700',
  },
  modeToggleBtn: {
    backgroundColor: '#1E2C3D',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00E5FF44',
  },
  modeToggleText: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  coachCard: {
    backgroundColor: '#0E1724',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E3247',
    gap: 8,
  },
  coachHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coachAvatar: {
    fontSize: 32,
  },
  coachMeta: {
    flex: 1,
  },
  coachName: {
    color: '#00E5FF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  coachRole: {
    color: '#64748B',
    fontSize: 10,
  },
  realPieceBtn: {
    backgroundColor: '#162436',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F5C51866',
  },
  realPieceBtnText: {
    color: '#F5C518',
    fontSize: 11,
    fontWeight: '700',
  },
  coachSpeechText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  lessonsSection: {
    gap: 8,
  },
  sectionHeading: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  lessonsTrack: {
    gap: 10,
  },
  lessonCard: {
    width: 105,
    backgroundColor: '#0E1724',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E2D3E',
    gap: 4,
  },
  lessonCardActive: {
    borderColor: '#00E5FF',
    backgroundColor: '#122234',
  },
  lessonCardLocked: {
    opacity: 0.45,
  },
  lessonIcon: {
    fontSize: 28,
  },
  lessonName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  starsText: {
    fontSize: 10,
  },
  unlockedTag: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
  },
  lockedTag: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '700',
  },
  exerciseCard: {
    backgroundColor: '#0E1724',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E3247',
    alignItems: 'center',
    gap: 10,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  exerciseTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  exerciseGoalBadge: {
    color: '#F5C518',
    fontSize: 11,
    fontWeight: '800',
  },
  exerciseInstructions: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
  },
  boardWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1E2C3D',
  },
  exerciseTip: {
    color: '#CBD5E1',
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 8, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0E1724',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 6,
  },
  compBox: {
    alignItems: 'center',
    gap: 4,
  },
  compEmoji: {
    fontSize: 40,
  },
  compLabel: {
    color: '#94AEC5',
    fontSize: 11,
    fontWeight: '700',
  },
  compArrow: {
    color: '#F5C518',
    fontSize: 22,
    fontWeight: '900',
  },
  modalExplanation: {
    color: '#E2E8F0',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  modalCloseBtn: {
    backgroundColor: '#00E5FF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 6,
  },
  modalCloseBtnText: {
    color: '#070C12',
    fontSize: 13,
    fontWeight: '900',
  },
  celebrationIcon: {
    fontSize: 44,
  },
  celebrationStars: {
    fontSize: 24,
  },
  celebrationText: {
    color: '#E2E8F0',
    fontSize: 13,
    textAlign: 'center',
  },
  rewardBadges: {
    color: '#F5C518',
    fontSize: 13,
    fontWeight: '800',
  },
  tournamentBanner: {
    width: '100%',
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  tournamentBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tournamentBannerIcon: {
    fontSize: 32,
  },
  tournamentBannerMeta: {
    flex: 1,
  },
  tournamentBannerTitle: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tournamentBannerSubtitle: {
    color: '#E2E8F0',
    fontSize: 12,
    marginTop: 2,
  },
  tournamentBannerBtn: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tournamentBannerBtnText: {
    color: '#070C12',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
