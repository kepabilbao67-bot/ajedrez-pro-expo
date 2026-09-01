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
import { APP_COLORS } from '@/theme/colors';

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
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(true);

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

  // Live evaluation update
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

  const availableWidth = width - 28;
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

  // --- HOME / PORTADA CINEMATOGRÁFICA ---
  if (section === 'home') {
    const luxuryTiles = [
      {
        icon: '⚔️',
        title: 'Jugar vs IA / Local',
        subtitle: 'Motor Stockfish 18 con 8 niveles ELO',
        badge: 'DUELO',
        action: 'play' as HomeActionType,
      },
      {
        icon: '⚡',
        title: 'Puzzle Rush Contrarreloj',
        subtitle: '3 min, 5 min y Modo Supervivencia (3 vidas)',
        badge: 'RUSH',
        action: 'puzzle-rush' as HomeActionType,
      },
      {
        icon: '🧩',
        title: 'Puzzle del Día',
        subtitle: 'Táctica diaria por niveles ELO con racha activa',
        badge: 'DIARIO',
        action: 'puzzles' as HomeActionType,
      },
      {
        icon: '🧠',
        title: 'Entrenador Táctico',
        subtitle: 'Aprende de tus errores y ejercicios adaptativos',
        badge: 'COACH',
        action: 'training' as HomeActionType,
      },
      {
        icon: '📖',
        title: 'Enciclopedia ECO',
        subtitle: '100+ aperturas y variantes con planes estratégicos',
        badge: 'TEORÍA',
        action: 'openings' as HomeActionType,
      },
      {
        icon: '📜',
        title: 'Visor PGN Maestro',
        subtitle: 'Partidas inmortales de Morphy, Fischer y Kasparov',
        badge: 'CLÁSICOS',
        action: 'pgn-viewer' as HomeActionType,
      },
      {
        icon: '⏱️',
        title: 'Reloj FIDE de Torneo',
        subtitle: 'Reloj digital táctil Blitz, Bullet y Rapid',
        badge: 'FIDE',
        action: 'clock' as HomeActionType,
      },
      {
        icon: '🏆',
        title: 'Vitrina de Trofeos',
        subtitle: '16 medallas y logros desbloqueables',
        badge: 'LOGROS',
        action: 'achievements' as HomeActionType,
      },
      {
        icon: '⚙️',
        title: 'Ajustes & Apariencia',
        subtitle: 'Temas HD, piezas doradas y sonidos Hi-Fi',
        badge: 'HD',
        action: 'settings' as HomeActionType,
      },
    ];

    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.root}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* BRANDING HERO */}
        <Animated.View entering={FadeInDown.duration(280)} style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.crownContainer}>
              <Text style={styles.crownIcon}>♛</Text>
            </View>
            <View style={styles.brandTitleCol}>
              <Text style={styles.brandEyebrow}>GRAN MAESTRO EDITION</Text>
              <Text style={styles.brandTitle}>AJEDREZ PRO</Text>
            </View>
            <View style={styles.heroVersionBadge}>
              <Text style={styles.heroVersionText}>v1.3</Text>
            </View>
          </View>
          <Text style={styles.heroSubtitle}>
            Apertura teórica, cálculo táctico relámpago y comprensión magistral.
          </Text>
        </Animated.View>

        {/* STATS OVERVIEW CARD */}
        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Text style={styles.statValueGold}>{playerLevel}</Text>
            <Text style={styles.statLabel}>Rango</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValueCyan}>{gamification.xp}</Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValueGold}>⚡ {chessStats.puzzleRushHighScore}</Text>
            <Text style={styles.statLabel}>Récord Rush</Text>
          </View>
        </View>

        {/* PRIMARY CTA: JUGAR AHORA */}
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            selectMode('local');
            setSection('play');
          }}
          style={({ pressed }) => [styles.primaryHeroButton, pressed && styles.pressed]}
        >
          <View style={styles.primaryHeroContent}>
            <Text style={styles.primaryHeroIcon}>♟️</Text>
            <View>
              <Text style={styles.primaryHeroTitle}>JUGAR PARTIDA</Text>
              <Text style={styles.primaryHeroSubtitle}>Partida rápida local o desafía a Stockfish</Text>
            </View>
          </View>
          <Text style={styles.primaryHeroArrow}>→</Text>
        </Pressable>

        {/* LUXURY MODULE TILES GRID */}
        <View style={styles.tilesGrid}>
          {luxuryTiles.map((tile) => (
            <Pressable
              key={tile.title}
              accessibilityRole="button"
              onPress={() => openHomeAction(tile.action)}
              style={({ pressed }) => [styles.tileCard, pressed && styles.pressed]}
            >
              <View style={styles.tileTopRow}>
                <Text style={styles.tileIcon}>{tile.icon}</Text>
                <View style={styles.tileBadge}>
                  <Text style={styles.tileBadgeText}>{tile.badge}</Text>
                </View>
              </View>
              <Text numberOfLines={1} style={styles.tileTitle}>{tile.title}</Text>
              <Text numberOfLines={2} style={styles.tileSubtitle}>{tile.subtitle}</Text>
            </Pressable>
          ))}
        </View>

        {/* PRIVACY FOOTER */}
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Abrir política de privacidad"
          onPress={() => router.push('/privacy' as never)}
          style={({ pressed }) => [styles.privacyFooterLink, pressed && styles.pressed]}
        >
          <Text style={styles.privacyFooterText}>Política de Privacidad y Términos</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // --- PLAY SECTION ---
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.root}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* PLAY HEADER */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setSection('home')}
          style={styles.backHomeBtn}
        >
          <Text style={styles.backHomeBtnText}>← Menú</Text>
        </Pressable>

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerEyebrow}>
            {mode === 'ai' ? 'VS STOCKFISH' : mode === 'rush' ? 'PUZZLE RUSH' : 'PARTIDA LOCAL'}
          </Text>
          <Text style={styles.headerTitle}>AjedrezPro</Text>
        </View>

        <View style={styles.headerTools}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Puzzle Rush"
            onPress={() => router.push('/puzzle-rush' as never)}
            style={styles.headerToolBtn}
          >
            <Text style={styles.headerToolIcon}>⚡</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reloj FIDE"
            onPress={() => router.push('/clock' as never)}
            style={styles.headerToolBtn}
          >
            <Text style={styles.headerToolIcon}>⏱</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Aperturas"
            onPress={() => router.push('/openings' as never)}
            style={styles.headerToolBtn}
          >
            <Text style={styles.headerToolIcon}>📖</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Visor PGN"
            onPress={() => router.push('/pgn-viewer' as never)}
            style={styles.headerToolBtn}
          >
            <Text style={styles.headerToolIcon}>📜</Text>
          </Pressable>
        </View>
      </View>

      {/* MODE SELECTOR */}
      <View accessibilityRole="radiogroup" style={styles.modeSelector}>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: mode === 'local' }}
          onPress={() => selectMode('local')}
          style={[styles.modeOption, mode === 'local' && styles.modeOptionActive]}
        >
          <Text style={[styles.modeText, mode === 'local' && styles.modeTextActive]}>
            Local 2P
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: mode === 'ai' }}
          onPress={() => selectMode('ai')}
          style={[styles.modeOption, mode === 'ai' && styles.modeOptionActive]}
        >
          <Text style={[styles.modeText, mode === 'ai' && styles.modeTextActive]}>
            Contra IA
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: mode === 'rush' }}
          onPress={() => selectMode('rush')}
          style={[styles.modeOption, mode === 'rush' && styles.modeOptionActive]}
        >
          <Text style={[styles.modeText, mode === 'rush' && styles.modeTextActive]}>
            Rush Táctico
          </Text>
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

      {/* BOT SELECTION IF IN AI MODE */}
      {mode === 'ai' ? (
        <View style={styles.difficultyCard}>
          <Text style={styles.difficultyLabel}>SELECCIONA TU OPONENTE</Text>
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
                  <Text style={[styles.botDesc, activeBot.id === bot.id && styles.botDescActive]}>Nivel {bot.difficulty} ({bot.playStyle})</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
          <Text style={styles.botGreeting}>&quot;{activeBot.greeting}&quot;</Text>
        </View>
      ) : null}

      {/* GAME STATUS BANNER */}
      <Animated.View
        entering={FadeInDown.duration(220)}
        layout={LinearTransition.duration(180)}
        style={[styles.statusCard, status.check && styles.checkCard]}
      >
        <View style={[styles.turnDot, position.turn === 'w' ? styles.whiteTurn : styles.blackTurn]} />
        <View style={styles.statusCopy}>
          <Text selectable accessibilityLiveRegion="polite" style={[styles.statusTitle, status.check && styles.checkText]}>
            {thinking ? 'Stockfish calculando…' : message}
          </Text>
          <Text selectable style={styles.statusDetail}>
            {thinking
              ? `${difficultyDefinition(difficulty).name} · ${Platform.OS === 'web' ? 'Stockfish 18' : 'Motor local'}`
              : status.gameOver
                ? 'Partida finalizada'
                : selected === null
                  ? 'Toca una pieza para ver sus movimientos legales'
                  : 'Elige una casilla marcada'}
          </Text>
        </View>
        {status.check && !status.checkmate ? <Text accessibilityLabel="Jaque" style={styles.checkBadge}>JAQUE</Text> : null}
      </Animated.View>

      {/* VICTORY CELEBRATION */}
      {status.checkmate && status.winner === 'w' ? <VictoryCelebration /> : null}

      {/* PUZZLE RUSH IN-GAME PANEL */}
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

      {/* POST GAME SUMMARY */}
      <PostGamePanel
        status={status}
        postGameSummary={postGameSummary}
        onRetryMistakes={() => void handleRetryMistakes()}
      />

      {/* BOARD + LIVE EVALUATION BAR */}
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

      {/* TRAINING FEEDBACK */}
      <TrainingPanel
        activePuzzle={activePuzzle}
        puzzleFeedback={puzzleFeedback}
        onStartPuzzle={() => startPuzzle(puzzles[0])}
        onNextPuzzle={() => startPuzzle(puzzles[1])}
      />

      {aiError ? <Text selectable accessibilityRole="alert" style={styles.aiError}>{aiError}</Text> : null}

      {/* ACTION CONTROLS */}
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={resetGame}
          style={({ pressed }) => [styles.newGameButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>Nueva Partida</Text>
        </Pressable>
      </View>

      {/* COACH PANEL */}
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

      {/* PROFILE PROGRESS PANEL */}
      <ProfilePanel
        profile={profile}
        gamification={gamification}
        playerLevel={playerLevel}
        progressToNextLevel={progressToNextLevel}
        nextAchievement={nextAchievement}
      />

      {/* SETTINGS PANEL */}
      <SettingsPanel
        expanded={settingsExpanded}
        onToggle={() => setSettingsExpanded((prev) => !prev)}
        visualPreferences={visualPreferences}
        onUpdatePreferences={updateVisualPreferences}
      />

      {/* HISTORY NOTATION */}
      <HistoryPanel history={history} />

      {/* GAME OVER MODAL */}
      <GameOverModal
        status={status}
        moveCount={history.length}
        onRematch={resetGame}
        onNewGame={resetGame}
      />

      {/* PROMOTION PICKER */}
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
  root: { flex: 1, backgroundColor: APP_COLORS.background },
  container: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 48, alignItems: 'center', gap: 12 },

  // --- HOME STYLES ---
  heroCard: {
    width: '100%',
    maxWidth: 440,
    padding: 18,
    borderRadius: 22,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1.5,
    borderColor: APP_COLORS.borderGold,
    gap: 8,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 14px rgba(229, 184, 105, 0.15)',
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  crownContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(229, 184, 105, 0.12)',
    borderWidth: 1,
    borderColor: APP_COLORS.goldPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crownIcon: {
    color: APP_COLORS.goldBright,
    fontSize: 24,
  },
  brandTitleCol: {
    flex: 1,
    marginLeft: 12,
  },
  brandEyebrow: {
    color: APP_COLORS.blueElectric,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  brandTitle: {
    color: APP_COLORS.goldBright,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroVersionBadge: {
    backgroundColor: APP_COLORS.surfaceStrong,
    borderWidth: 1,
    borderColor: APP_COLORS.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  heroVersionText: {
    color: APP_COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: APP_COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },

  statsCard: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    backgroundColor: APP_COLORS.surface,
    borderRadius: 16,
    borderCurve: 'continuous',
    padding: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  statValueGold: {
    color: APP_COLORS.goldBright,
    fontSize: 18,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  statValueCyan: {
    color: APP_COLORS.blueElectric,
    fontSize: 18,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: APP_COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: APP_COLORS.border,
  },

  primaryHeroButton: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: APP_COLORS.goldPrimary,
    borderRadius: 18,
    borderCurve: 'continuous',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 6px 20px rgba(212, 175, 55, 0.35)',
  },
  primaryHeroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryHeroIcon: {
    fontSize: 26,
  },
  primaryHeroTitle: {
    color: '#070B0E',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  primaryHeroSubtitle: {
    color: '#36270A',
    fontSize: 12,
    fontWeight: '700',
  },
  primaryHeroArrow: {
    color: '#070B0E',
    fontSize: 22,
    fontWeight: '900',
  },

  tilesGrid: {
    width: '100%',
    maxWidth: 440,
    gap: 8,
  },
  tileCard: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 16,
    borderCurve: 'continuous',
    padding: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    gap: 4,
  },
  tileTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tileIcon: {
    fontSize: 20,
  },
  tileBadge: {
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.35)',
  },
  tileBadgeText: {
    color: APP_COLORS.blueElectric,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tileTitle: {
    color: APP_COLORS.goldBright,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  tileSubtitle: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },

  privacyFooterLink: {
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyFooterText: {
    color: APP_COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // --- PLAY STYLES ---
  header: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backHomeBtn: {
    backgroundColor: APP_COLORS.surfaceStrong,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  backHomeBtnText: {
    color: APP_COLORS.blueElectric,
    fontSize: 13,
    fontWeight: '800',
  },
  headerTitleCol: {
    alignItems: 'center',
  },
  headerEyebrow: {
    color: APP_COLORS.blueElectric,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  headerTitle: {
    color: APP_COLORS.goldBright,
    fontSize: 18,
    fontWeight: '900',
  },
  headerTools: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerToolBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerToolIcon: {
    fontSize: 15,
  },

  modeSelector: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    gap: 6,
    padding: 4,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  modeOption: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 12,
    borderCurve: 'continuous',
  },
  modeOptionActive: {
    backgroundColor: APP_COLORS.goldPrimary,
  },
  modeText: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  modeTextActive: {
    color: '#070B0E',
    fontWeight: '900',
  },

  detectedOpeningCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: APP_COLORS.borderGold,
  },
  detectedOpeningBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  detectedOpeningBadgeText: {
    color: APP_COLORS.goldBright,
    fontSize: 11,
    fontWeight: '900',
  },
  detectedOpeningText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  detectedOpeningArrow: {
    color: APP_COLORS.goldBright,
    fontSize: 12,
    fontWeight: '800',
  },

  difficultyCard: {
    width: '100%',
    maxWidth: 440,
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  difficultyLabel: {
    color: APP_COLORS.blueElectric,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  difficultyOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  botOption: {
    minWidth: 140,
    padding: 10,
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.surfaceStrong,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botOptionActive: {
    backgroundColor: 'rgba(0, 210, 255, 0.15)',
    borderColor: APP_COLORS.blueElectric,
  },
  botAvatar: {
    fontSize: 22,
  },
  botName: {
    color: APP_COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },
  botNameActive: {
    color: APP_COLORS.blueElectric,
  },
  botDesc: {
    color: APP_COLORS.textSecondary,
    fontSize: 11,
  },
  botDescActive: {
    color: APP_COLORS.textSecondary,
  },
  botGreeting: {
    color: APP_COLORS.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    paddingHorizontal: 4,
  },

  statusCard: {
    width: '100%',
    maxWidth: 440,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  checkCard: {
    backgroundColor: '#350E12',
    borderColor: APP_COLORS.danger,
  },
  turnDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  whiteTurn: {
    backgroundColor: APP_COLORS.goldBright,
    borderColor: '#FFFFFF',
  },
  blackTurn: {
    backgroundColor: '#070B0E',
    borderColor: APP_COLORS.blueElectric,
  },
  statusCopy: {
    flex: 1,
  },
  statusTitle: {
    color: APP_COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  checkText: {
    color: '#FFBABA',
  },
  statusDetail: {
    color: APP_COLORS.textSecondary,
    fontSize: 11,
    paddingTop: 1,
  },
  checkBadge: {
    color: '#FFFFFF',
    backgroundColor: APP_COLORS.danger,
    overflow: 'hidden',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  boardContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 440,
  },

  actions: {
    width: '100%',
    maxWidth: 440,
    gap: 8,
  },
  newGameButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.goldPrimary,
    borderRadius: 16,
    borderCurve: 'continuous',
    boxShadow: '0 4px 14px rgba(229, 184, 105, 0.3)',
  },
  primaryButtonText: {
    color: '#070B0E',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  aiError: {
    width: '100%',
    maxWidth: 440,
    color: '#FFD8CF',
    backgroundColor: '#321B17',
    borderWidth: 1,
    borderColor: '#A84737',
    borderRadius: 12,
    borderCurve: 'continuous',
    padding: 12,
    fontSize: 13,
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.985 }],
  },
});
