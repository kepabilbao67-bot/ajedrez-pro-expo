import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { difficultyDefinition } from '@/ai/difficulty';
import type { PromotionPiece, Square } from '@/chess';
import { ChessBoard } from '@/components/chess-board';
import { CoachPanel } from '@/components/coach-panel';
import { GameOverModal } from '@/components/game-over-modal';
import { HistoryPanel } from '@/components/history-panel';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { PostGamePanel } from '@/components/post-game-panel';
import { EvalBar } from '@/components/eval-bar';

import { ProfilePanel } from '@/components/profile-panel';
import { PuzzleRushPanel } from '@/components/puzzle-rush-panel';
import { SettingsPanel } from '@/components/settings-panel';
import { PromotionPicker } from '@/components/promotion-picker';
import { TrainingPanel } from '@/components/training-panel';
import { VictoryCelebration } from '@/components/victory-celebration';
import { useAiOpponent } from '@/hooks/use-ai-opponent';
import { useChessGame } from '@/hooks/use-chess-game';
import { useCoach } from '@/hooks/use-coach';
import { usePlayerProgress } from '@/hooks/use-player-progress';

import { useTrainingSession } from '@/hooks/use-training-session';
import { useVisualPreferences } from '@/hooks/use-visual-preferences';
import { useHaptics } from '@/hooks/use-haptics';
import { useAudioSfx } from '@/hooks/use-audio-sfx';
import { usePuzzleRush } from '@/hooks/use-puzzle-rush';
import { useChessStats } from '@/hooks/use-chess-stats';
import { AI_BOTS } from '@/ai/bots';
import type { AiBot } from '@/ai/bots';
import type { TrainingPuzzle } from '@/training/training-types';
import { AnalysisEngine, type AdvantageEvaluation } from '@/services/analysisEngine';
import { detectOpening } from '@/services/openingBook';
import { extractMistakesFromGame, mistakeToTrainingPuzzle } from '@/services/mistakeTrainer';

type GameMode = 'local' | 'ai' | 'rush';
type AppSection = 'home' | 'play';
type HomeActionType =
  | 'play'
  | 'training'
  | 'settings'
  | 'puzzles'
  | 'clock'
  | 'openings'
  | 'pgn-viewer'
  | 'achievements'
  | 'puzzle-rush';

export default function Index() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const {
    game,
    position,
    selected,
    pendingPromotion,
    setPendingPromotion,
    lastMove,
    legalMoves,
    status,
    history,
    turnMessage: message,
    generationRef,
    refresh,
    executeMove,
    handlePromotion: handleGamePromotion,
    resetGame: resetChessGame,
    selectPieceSquare,
  } = useChessGame();
  const {
    difficulty,
    setDifficulty,
    setPlayStyle,
    thinking,
    aiError,
    cancelAi,
    requestAiMove,
    getEngine: getStockfishEngine,
  } = useAiOpponent({
    generationRef,
    onMoveApplied: (record, targetGame) => {
      refresh(record, targetGame);
      playMoveHaptics(record.san);
    },
  });
  const [mode, setMode] = useState<GameMode>('local');
  const [activeBot, setActiveBot] = useState<AiBot>(AI_BOTS[0]);
  const {
    profile,
    gamification,
    playerLevel,
    progressToNextLevel,
    nextAchievement,
    recordCompletedGame,
    recordHint,
    recordAnalysis,
    reloadProgress,
  } = usePlayerProgress();
  const {
    coachLoading,
    coachMessage,
    coachReport,
    hintLevel,
    contextualCoachMessage,
    postGameSummary,
    requestHint: requestCoachHint,
    analyzeCurrentGame: runGameAnalysis,
    resetCoach,
  } = useCoach({
    getEngine: getStockfishEngine,
    onHintUsed: recordHint,
    onAnalysisCompleted: recordAnalysis,
  });
  const { visualPreferences, boardTheme, pieceSet, updateVisualPreferences } = useVisualPreferences();
  const {
    activePuzzle,
    puzzleFeedback,
    puzzles,
    startPuzzle: initPuzzleSession,
    submitAttempt,
    resetTraining,
  } = useTrainingSession({
    onAttemptSubmitted: () => reloadProgress(),
  });
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [section, setSection] = useState<AppSection>('home');
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(true); // assume true until loaded

  const [liveEval, setLiveEval] = useState<AdvantageEvaluation>({
    scoreCp: 0,
    formatted: '0.0',
    whiteWinProbability: 50,
    isMate: false,
    bestMove: null,
  });

  const completedGameGeneration = useRef<number | null>(null);
  const { hapticMove, hapticCapture, hapticCheck, hapticVictory } = useHaptics();
  const { playMove, playCapture, playCheck, playVictory } = useAudioSfx(visualPreferences.soundsEnabled);
  const { stats: chessStats, updatePuzzleRushScore, recordGame: recordGameStat } = useChessStats();

  useEffect(() => {
    import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
      AsyncStorage.getItem('@ajedrezpro_onboarding').then((val) => {
        if (val !== 'true') setHasSeenOnboarding(false);
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  // Update live evaluation when position or game changes
  useEffect(() => {
    let isMounted = true;
    AnalysisEngine.getInstance()
      .evaluatePosition(game.fen())
      .then((res) => {
        if (isMounted) setLiveEval(res);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [position, game]);

  const completeOnboarding = () => {
    setHasSeenOnboarding(true);
    import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
      AsyncStorage.setItem('@ajedrezpro_onboarding', 'true').catch(() => {});
    }).catch(() => {});
  };

  const rush = usePuzzleRush({
    onGameOver: (finalScore) => {
      void updatePuzzleRushScore(finalScore);
    },
  });

  const playMoveHaptics = (san: string) => {
    if (san.includes('#')) { hapticVictory(); playVictory(); }
    else if (san.includes('+')) { hapticCheck(); playCheck(); }
    else if (san.includes('x')) { hapticCapture(); playCapture(); }
    else { hapticMove(); playMove(); }
  };

  const availableWidth = width - 30;
  const landscapeLimit = width > height ? height - 110 : 440;
  const boardSize = Math.min(Math.max(availableWidth, 248), Math.max(landscapeLimit, 248), 440);

  const detectedOpening = detectOpening(history.map((h) => h.san));

  const startPuzzle = (puzzle: TrainingPuzzle) => {
    cancelAi();
    const puzzleGame = initPuzzleSession(puzzle);
    resetChessGame(puzzleGame);
  };

  const nextRushPuzzle = () => {
    const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    startPuzzle(randomPuzzle);
  };

  const handleRetryMistakes = async () => {
    const mistakes = await extractMistakesFromGame(history, 'w');
    if (mistakes.length > 0) {
      const firstMistake = mistakes[0];
      const puzzle = mistakeToTrainingPuzzle(firstMistake);
      startPuzzle(puzzle);
    }
  };

  useEffect(() => {
    if (!status.gameOver || completedGameGeneration.current === generationRef.current) return;
    const result = status.draw || !status.winner ? 'draw' : status.winner === 'w' ? 'win' : 'loss';
    recordCompletedGame(result, status.checkmate, coachReport);
    if (mode === 'local' || mode === 'ai') {
      void recordGameStat(status.winner === 'w');
    }
    completedGameGeneration.current = generationRef.current;
  }, [coachReport, generationRef, recordCompletedGame, status.checkmate, status.draw, status.gameOver, status.winner, mode, recordGameStat]);

  const handleSquarePress = (square: Square) => {
    if (selected !== null) {
      const candidates = legalMoves.filter((move) => move.to === square);
      if (candidates.some((move) => move.promotion !== undefined)) {
        setPendingPromotion({ from: selected, to: square });
        return;
      }
      if (activePuzzle && candidates.length > 0) {
        const attempt = submitAttempt(selected, square);
        if (attempt?.isCorrect) {
          const certifiedRecord = game.move({ from: selected, to: square });
          if (certifiedRecord) {
            refresh(certifiedRecord, game);
            playMoveHaptics(certifiedRecord.san);
            if (certifiedRecord.san.includes('#') || game.status().gameOver) {
              if (mode === 'rush') {
                rush.recordSuccess();
                setTimeout(nextRushPuzzle, 800);
              }
            }
          }
        } else {
          if (mode === 'rush') {
            rush.recordFailure();
          }
        }
        return;
      }
      if (candidates.length > 0) {
        const record = executeMove(selected, square);
        if (record) {
          playMoveHaptics(record.san);
          if (mode === 'ai') void requestAiMove(game);
        }
        return;
      }
    }

    const canSelect = mode === 'local' || position.turn === 'w';
    selectPieceSquare(square, canSelect);
  };

  const handlePromotion = (promotion: PromotionPiece) => {
    const record = handleGamePromotion(promotion);
    if (record) {
      playMoveHaptics(record.san);
      if (mode === 'ai') void requestAiMove(game);
    }
  };

  const resetGame = () => {
    cancelAi();
    resetCoach();
    resetTraining();
    resetChessGame();
  };

  const requestHint = () => requestCoachHint(game, difficulty);
  const analyzeCurrentGame = () => runGameAnalysis(history, status);

  const startRushSession = () => {
    setMode('rush');
    rush.startRush();
    nextRushPuzzle();
  };

  const selectMode = (nextMode: GameMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    rush.quitRush();
    if (nextMode === 'ai') {
      setDifficulty(activeBot.difficulty);
      setPlayStyle(activeBot.playStyle);
    }
    if (nextMode === 'rush') {
      startRushSession();
    } else {
      resetGame();
    }
  };

  const selectBot = (bot: AiBot) => {
    setActiveBot(bot);
    setDifficulty(bot.difficulty);
    setPlayStyle(bot.playStyle);
  };

  const openHomeAction = (action: HomeActionType) => {
    if (action === 'puzzle-rush') {
      router.push('/puzzle-rush' as never);
      return;
    }
    if (action === 'puzzles') {
      router.push('/puzzles' as never);
      return;
    }
    if (action === 'clock') {
      router.push('/clock' as never);
      return;
    }
    if (action === 'openings') {
      router.push('/openings' as never);
      return;
    }
    if (action === 'pgn-viewer') {
      router.push('/pgn-viewer' as never);
      return;
    }
    if (action === 'achievements') {
      router.push('/achievements' as never);
      return;
    }
    if (action === 'training') startPuzzle(puzzles[0]);
    if (action === 'settings') setSettingsExpanded(true);
    setSection('play');
  };

  if (!hasSeenOnboarding) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  if (section === 'home') {
    const actions: readonly { label: string; detail: string; action: HomeActionType }[] = [
      { label: 'JUGAR', detail: 'Partida local o contra IA', action: 'play' },
      { label: 'PUZZLE RUSH CONTRARRELOJ', detail: '3 min, 5 min y Supervivencia (3 vidas) ⚡', action: 'puzzle-rush' },
      { label: 'PUZZLE DEL DÍA', detail: 'Táctica diaria por niveles ELO y racha 🔥', action: 'puzzles' },
      { label: 'EXPLORADOR DE APERTURAS', detail: '100+ aperturas y variantes ECO con planes estratégicos', action: 'openings' },
      { label: 'VISOR Y REPRODUCTOR PGN', detail: 'Partidas maestras de Morphy, Fischer y Kasparov', action: 'pgn-viewer' },
      { label: 'RELOJ DE TORNEO FIDE', detail: 'Reloj Blitz, Bullet y Rapid para tablero físico', action: 'clock' },
      { label: 'VITRINA DE TROFEOS', detail: '16 logros y medallas desbloqueables', action: 'achievements' },
      { label: 'ENTRENAR', detail: 'Ejercicio táctico adaptativo', action: 'training' },
      { label: 'AJUSTES', detail: '5 Temas HD, piezas y sonidos Hi-Fi', action: 'settings' },
    ];
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.root} contentContainerStyle={styles.container}>
        <View style={styles.homeHero}>
          <Text selectable style={styles.eyebrow}>AJEDREZPRO · MASTER EDITION V1.3</Text>
          <Text selectable style={styles.title}>Hola jugador</Text>
          <Text selectable style={styles.homeCopy}>Domina cada fase del juego: apertura teórica, táctica relámpago y final de maestros.</Text>
        </View>
        <View style={styles.homeStats}>
          <View style={styles.profileStat}><Text selectable numberOfLines={1} adjustsFontSizeToFit style={[styles.profileValue, styles.homeLevelValue]}>{playerLevel}</Text><Text selectable style={styles.profileLabel}>nivel</Text></View>
          <View style={styles.profileStat}><Text selectable style={styles.profileValue}>{gamification.xp}</Text><Text selectable style={styles.profileLabel}>XP</Text></View>
          <View style={styles.profileStat}><Text selectable style={styles.profileValue}>{chessStats.puzzleRushHighScore}</Text><Text selectable style={styles.profileLabel}>récord rush</Text></View>
        </View>
        <View style={styles.homeInfo}><Text selectable style={styles.profileTitle}>Reto diario</Text><Text selectable style={styles.profileWeaknesses}>{gamification.dailyChallenge ? `${gamification.dailyChallenge.title} · ${gamification.dailyChallenge.progress}/${gamification.dailyChallenge.target}` : 'Completa una actividad para activar tu reto.'}</Text><Text selectable style={styles.profileWeaknesses}>{nextAchievement ? `Próximo logro: ${nextAchievement.title}` : 'Todos los logros actuales desbloqueados.'}</Text></View>
        <View style={styles.homeActions}>{actions.map((item) => <Pressable key={item.label} accessibilityRole="button" onPress={() => openHomeAction(item.action)} style={({ pressed }) => [styles.homeAction, pressed && styles.pressed]}><Text style={styles.homeActionTitle}>{item.label}</Text><Text style={styles.homeActionDetail}>{item.detail}</Text></Pressable>)}</View>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Abrir política de privacidad"
          onPress={() => router.push('/privacy' as never)}
          style={({ pressed }) => [styles.privacyFooterLink, pressed && styles.pressed]}
        >
          <Text style={styles.privacyFooterText}>Política de Privacidad</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.root}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <View>
          <Text selectable style={styles.eyebrow}>{mode === 'ai' ? 'VS STOCKFISH' : 'PARTIDA LOCAL'}</Text>
          <Text selectable style={styles.title}>AjedrezPro</Text>
        </View>
        <View style={styles.headerTools}>
          <Pressable accessibilityRole="button" accessibilityLabel="Puzzle Rush" onPress={() => router.push('/puzzle-rush' as never)} style={styles.headerToolBtn}>
            <Text style={styles.headerToolIcon}>⚡</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Reloj FIDE" onPress={() => router.push('/clock' as never)} style={styles.headerToolBtn}>
            <Text style={styles.headerToolIcon}>⏱</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Puzzles" onPress={() => router.push('/puzzles' as never)} style={styles.headerToolBtn}>
            <Text style={styles.headerToolIcon}>🧩</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Aperturas" onPress={() => router.push('/openings' as never)} style={styles.headerToolBtn}>
            <Text style={styles.headerToolIcon}>📖</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Visor PGN" onPress={() => router.push('/pgn-viewer' as never)} style={styles.headerToolBtn}>
            <Text style={styles.headerToolIcon}>📜</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Trofeos" onPress={() => router.push('/achievements' as never)} style={styles.headerToolBtn}>
            <Text style={styles.headerToolIcon}>🏆</Text>
          </Pressable>
          <View style={styles.moveCounter}>
            <Text selectable style={styles.counterNumber}>{history.length}</Text>
            <Text selectable style={styles.counterLabel}>{history.length === 1 ? 'jugada' : 'jugadas'}</Text>
          </View>
        </View>
      </View>
      <Pressable accessibilityRole="button" onPress={() => setSection('home')} style={styles.homeLink}><Text style={styles.homeLinkText}>Inicio</Text></Pressable>

      <View accessibilityRole="radiogroup" style={styles.modeSelector}>
        <Pressable accessibilityRole="radio" accessibilityState={{ checked: mode === 'local' }} onPress={() => selectMode('local')} style={[styles.modeOption, mode === 'local' && styles.modeOptionActive]}>
          <Text style={[styles.modeText, mode === 'local' && styles.modeTextActive]}>2 jugadores local</Text>
        </Pressable>
        <Pressable accessibilityRole="radio" accessibilityState={{ checked: mode === 'ai' }} onPress={() => selectMode('ai')} style={[styles.modeOption, mode === 'ai' && styles.modeOptionActive]}>
          <Text style={[styles.modeText, mode === 'ai' && styles.modeTextActive]}>Jugar contra IA</Text>
        </Pressable>
        <Pressable accessibilityRole="radio" accessibilityState={{ checked: mode === 'rush' }} onPress={() => selectMode('rush')} style={[styles.modeOption, mode === 'rush' && styles.modeOptionActive]}>
          <Text style={[styles.modeText, mode === 'rush' && styles.modeTextActive]}>Supervivencia</Text>
        </Pressable>
      </View>

      {/* DETECTED OPENING BANNER */}
      {detectedOpening ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/openings' as never)}
          style={({ pressed }) => [styles.detectedOpeningCard, pressed && styles.pressed]}
        >
          <View style={styles.detectedOpeningBadge}>
            <Text style={styles.detectedOpeningBadgeText}>{detectedOpening.eco}</Text>
          </View>
          <Text numberOfLines={1} style={styles.detectedOpeningText}>
            {detectedOpening.name}
          </Text>
          <Text style={styles.detectedOpeningArrow}>📖 →</Text>
        </Pressable>
      ) : null}

      {mode === 'ai' ? (
        <View style={styles.difficultyCard}>
          <Text selectable style={styles.difficultyLabel}>Selecciona tu Oponente</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.difficultyOptions}>
            {AI_BOTS.map((bot) => (
              <Pressable
                key={bot.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: activeBot.id === bot.id, disabled: thinking }}
                disabled={thinking}
                onPress={() => selectBot(bot)}
                style={[styles.botOption, activeBot.id === bot.id && styles.botOptionActive]}
              >
                <Text style={styles.botAvatar}>{bot.avatar}</Text>
                <View>
                  <Text style={[styles.botName, activeBot.id === bot.id && styles.botNameActive]}>{bot.name}</Text>
                  <Text style={[styles.botDesc, activeBot.id === bot.id && styles.botDescActive]}>Dificultad {bot.difficulty}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
          <Text style={styles.botGreeting}>&quot;{activeBot.greeting}&quot;</Text>
        </View>
      ) : null}

      <Animated.View entering={FadeInDown.duration(220)} layout={LinearTransition.duration(180)} style={[styles.statusCard, status.check && styles.checkCard]}>
        <View style={[styles.turnDot, position.turn === 'w' ? styles.whiteTurn : styles.blackTurn]} />
        <View style={styles.statusCopy}>
          <Text selectable accessibilityLiveRegion="polite" style={[styles.statusTitle, status.check && styles.checkText]}>
            {thinking ? 'Pensando…' : message}
          </Text>
          <Text selectable style={styles.statusDetail}>
            {thinking ? `${difficultyDefinition(difficulty).name} · ${Platform.OS === 'web' ? 'Stockfish 18' : 'Motor local'}` : status.gameOver ? 'La partida ha finalizado' : selected === null ? 'Toca una pieza para ver sus movimientos' : 'Elige una casilla marcada'}
          </Text>
        </View>
        {status.check && !status.checkmate ? <Text accessibilityLabel="Jaque" style={styles.checkBadge}>JAQUE</Text> : null}
      </Animated.View>

      {status.checkmate && status.winner === 'w' ? (
        <VictoryCelebration />
      ) : null}

      {mode === 'rush' ? (
        <PuzzleRushPanel
          isActive={rush.isActive}
          timeLeft={rush.timeLeft}
          score={rush.score}
          strikes={rush.strikes}
          maxStrikes={rush.maxStrikes}
          highScore={chessStats.puzzleRushHighScore}
          onStart={startRushSession}
          onQuit={() => selectMode('local')}
        />
      ) : null}

      <PostGamePanel
        status={status}
        postGameSummary={postGameSummary}
        onRetryMistakes={() => void handleRetryMistakes()}
      />

      {/* LIVE ADVANTAGE EVALUATION BAR */}
      <View style={styles.boardContainer}>
        <EvalBar
          whiteWinProbability={liveEval.whiteWinProbability}
          formattedScore={liveEval.formatted}
          isThinking={thinking}
          width={boardSize}
        />

        <ChessBoard
          position={position}
          size={boardSize}
          selected={selected}
          legalMoves={legalMoves}
          flipped={false}
          disabled={status.gameOver || pendingPromotion !== null || thinking || (mode === 'ai' && position.turn === 'b')}
          lastMove={lastMove?.move ?? null}
          inCheck={status.check}
          boardTheme={boardTheme}
          pieceSet={pieceSet}
          onSquarePress={handleSquarePress}
        />
      </View>

      <TrainingPanel
        activePuzzle={activePuzzle}
        puzzleFeedback={puzzleFeedback}
        onStartPuzzle={() => startPuzzle(puzzles[0])}
        onNextPuzzle={() => startPuzzle(puzzles[1])}
      />

      {aiError ? <Text selectable accessibilityRole="alert" style={styles.aiError}>{aiError}</Text> : null}

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={resetGame}
          style={({ pressed }) => [styles.newGameButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>Nueva partida</Text>
        </Pressable>
      </View>

      <CoachPanel
        coachMessage={coachMessage}
        contextualMessage={contextualCoachMessage(status, history.length)}
        coachLoading={coachLoading}
        thinking={thinking}
        hintLevel={hintLevel}
        canAnalyze={history.length > 0}
        onRequestHint={() => void requestHint()}
        onAnalyzeGame={() => void analyzeCurrentGame()}
      />

      <ProfilePanel
        profile={profile}
        gamification={gamification}
        playerLevel={playerLevel}
        progressToNextLevel={progressToNextLevel}
        nextAchievement={nextAchievement}
      />

      <SettingsPanel
        expanded={settingsExpanded}
        onToggle={() => setSettingsExpanded((prev) => !prev)}
        visualPreferences={visualPreferences}
        onUpdatePreferences={updateVisualPreferences}
      />

      <HistoryPanel history={history} />

      <GameOverModal
        status={status}
        moveCount={history.length}
        onRematch={resetGame}
        onNewGame={resetGame}
      />

      <PromotionPicker
        visible={pendingPromotion !== null}
        color={position.turn}
        onSelect={handlePromotion}
        onCancel={() => setPendingPromotion(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#09130f' },
  container: { paddingHorizontal: 12, paddingTop: 16, paddingBottom: 48, alignItems: 'center', gap: 12 },
  homeHero: { width: '100%', maxWidth: 440, gap: 5, padding: 20, borderRadius: 20, borderCurve: 'continuous', backgroundColor: '#1B3025', borderWidth: 1, borderColor: '#3B5A49' },
  homeCopy: { color: '#C5D0C9', fontSize: 14, lineHeight: 20 },
  homeStats: { width: '100%', maxWidth: 440, flexDirection: 'row', gap: 8 },
  homeInfo: { width: '100%', maxWidth: 440, gap: 5, padding: 14, borderRadius: 16, borderCurve: 'continuous', backgroundColor: '#14241D', borderWidth: 1, borderColor: '#294235' },
  homeActions: { width: '100%', maxWidth: 440, gap: 8 },
  homeAction: { minHeight: 62, gap: 2, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 16, borderCurve: 'continuous', backgroundColor: '#22362C', borderWidth: 1, borderColor: '#3B5A49' },
  homeActionTitle: { color: '#F6E6BD', fontSize: 15, fontWeight: '900', letterSpacing: 0.4 },
  homeActionDetail: { color: '#9EAFA5', fontSize: 12 },
  homeLink: { alignSelf: 'flex-start', minHeight: 36, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#22362C' },
  homeLinkText: { color: '#F6E6BD', fontSize: 13, fontWeight: '800' },
  header: { width: '100%', maxWidth: 440, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  headerTools: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerToolBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#14241D', borderWidth: 1, borderColor: '#294235', justifyContent: 'center', alignItems: 'center' },
  headerToolIcon: { fontSize: 15 },
  eyebrow: { color: '#9EAFA5', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#F6E6BD', fontSize: 26, fontWeight: '900', letterSpacing: -0.6 },
  moveCounter: { minWidth: 50, minHeight: 38, paddingHorizontal: 8, justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderCurve: 'continuous', backgroundColor: '#14241D' },
  counterNumber: { color: '#F5C451', fontSize: 16, fontWeight: '900', fontVariant: ['tabular-nums'] },
  counterLabel: { color: '#9EAFA5', fontSize: 9, fontWeight: '700' },
  modeSelector: { width: '100%', maxWidth: 440, flexDirection: 'row', gap: 6, padding: 5, borderRadius: 17, borderCurve: 'continuous', backgroundColor: '#14241D', borderWidth: 1, borderColor: '#294235' },
  modeOption: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, borderRadius: 12, borderCurve: 'continuous' },
  modeOptionActive: { backgroundColor: '#D6A943' },
  modeText: { color: '#9EAFA5', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  modeTextActive: { color: '#162019' },
  detectedOpeningCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#14241D',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#294235',
  },
  detectedOpeningBadge: {
    backgroundColor: 'rgba(0, 229, 180, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  detectedOpeningBadgeText: { color: '#00E5B4', fontSize: 11, fontWeight: '900' },
  detectedOpeningText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', flex: 1 },
  detectedOpeningArrow: { color: '#00E5B4', fontSize: 12, fontWeight: '800' },
  difficultyCard: { width: '100%', maxWidth: 440, gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 17, borderCurve: 'continuous', backgroundColor: '#14241D', borderWidth: 1, borderColor: '#294235' },
  difficultyLabel: { color: '#F6E6BD', fontSize: 12, fontWeight: '800' },
  difficultyOptions: { flexDirection: 'row', gap: 7 },
  botOption: { minWidth: 140, padding: 12, borderRadius: 12, borderCurve: 'continuous', backgroundColor: '#22362C', flexDirection: 'row', alignItems: 'center', gap: 10 },
  botOptionActive: { backgroundColor: '#D6A943' },
  botAvatar: { fontSize: 24 },
  botName: { color: '#F8F4EA', fontSize: 13, fontWeight: '800' },
  botNameActive: { color: '#162019' },
  botDesc: { color: '#9EAFA5', fontSize: 11 },
  botDescActive: { color: '#3B2D10' },
  botGreeting: { color: '#9EAFA5', fontSize: 13, fontStyle: 'italic', marginTop: 8, paddingHorizontal: 4 },
  statusCard: { width: '100%', maxWidth: 440, minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderCurve: 'continuous', backgroundColor: '#14241D', borderWidth: 1, borderColor: '#294235' },
  checkCard: { backgroundColor: '#321B17', borderColor: '#A84737' },
  turnDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
  whiteTurn: { backgroundColor: '#F5EBD5', borderColor: '#FFFFFF' },
  blackTurn: { backgroundColor: '#18201C', borderColor: '#829188' },
  statusCopy: { flex: 1 },
  statusTitle: { color: '#F8F4EA', fontSize: 16, fontWeight: '800' },
  checkText: { color: '#FFD8CF' },
  statusDetail: { color: '#9EAFA5', fontSize: 12, paddingTop: 2 },
  checkBadge: { color: '#FFFFFF', backgroundColor: '#C44732', overflow: 'hidden', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, fontSize: 10, fontWeight: '900', letterSpacing: 0.7 },
  boardContainer: { alignItems: 'center', width: '100%', maxWidth: 440 },
  actions: { width: '100%', maxWidth: 440, gap: 8 },
  newGameButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: '#D6A943', borderRadius: 16, borderCurve: 'continuous' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  primaryButtonText: { color: '#162019', fontSize: 16, fontWeight: '900' },
  profileTitle: { color: '#F5C451', fontSize: 13, fontWeight: '900' },
  profileStats: { flexDirection: 'row', gap: 8 },
  profileStat: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderCurve: 'continuous', backgroundColor: '#22362C' },
  profileValue: { color: '#F8F4EA', fontSize: 18, fontWeight: '900', fontVariant: ['tabular-nums'] },
  homeLevelValue: { fontSize: 15, textAlign: 'center' },
  profileLabel: { color: '#9EAFA5', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  profileWeaknesses: { color: '#C5D0C9', fontSize: 12, lineHeight: 18 },
  aiError: { width: '100%', maxWidth: 440, color: '#FFD8CF', backgroundColor: '#321B17', borderWidth: 1, borderColor: '#A84737', borderRadius: 12, borderCurve: 'continuous', padding: 12, fontSize: 13 },
  privacyFooterLink: { minHeight: 44, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  privacyFooterText: { color: '#9EAFA5', fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' },
});
