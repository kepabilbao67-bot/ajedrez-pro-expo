import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  CLOCK_PRESETS,
  type ClockPreset,
  type ClockStatus,
  type PlayerClockState,
} from '@/types/chess-clock-types';
import { useHaptics } from '@/hooks/use-haptics';
import { useAudioSfx } from '@/hooks/use-audio-sfx';

export function ChessClockScreen() {
  const router = useRouter();
  const { hapticMove, hapticDefeat } = useHaptics();
  const { playMove, playCheck, playVictory } = useAudioSfx(true);

  const [preset, setPreset] = useState<ClockPreset>(CLOCK_PRESETS[4]); // Default Blitz 3+2 FIDE
  const [status, setStatus] = useState<ClockStatus>('ready');
  const [activePlayer, setActivePlayer] = useState<'top' | 'bottom' | null>(null);
  const [presetModalVisible, setPresetModalVisible] = useState(false);

  const [topPlayer, setTopPlayer] = useState<PlayerClockState>({
    timeRemainingMs: preset.baseMinutes * 60 * 1000,
    movesCount: 0,
    isFlagged: false,
  });

  const [bottomPlayer, setBottomPlayer] = useState<PlayerClockState>({
    timeRemainingMs: preset.baseMinutes * 60 * 1000,
    movesCount: 0,
    isFlagged: false,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickTimeRef = useRef<number | null>(null);

  const applyPreset = (newPreset: ClockPreset) => {
    setPreset(newPreset);
    setStatus('ready');
    setActivePlayer(null);
    const initialMs = newPreset.baseMinutes * 60 * 1000;
    setTopPlayer({ timeRemainingMs: initialMs, movesCount: 0, isFlagged: false });
    setBottomPlayer({ timeRemainingMs: initialMs, movesCount: 0, isFlagged: false });
    setPresetModalVisible(false);
  };

  const resetClock = () => {
    setStatus('ready');
    setActivePlayer(null);
    const initialMs = preset.baseMinutes * 60 * 1000;
    setTopPlayer({ timeRemainingMs: initialMs, movesCount: 0, isFlagged: false });
    setBottomPlayer({ timeRemainingMs: initialMs, movesCount: 0, isFlagged: false });
  };

  const togglePause = () => {
    if (status === 'running') {
      setStatus('paused');
    } else if (status === 'paused' && activePlayer) {
      lastTickTimeRef.current = Date.now();
      setStatus('running');
    }
  };

  // Clock tick interval
  useEffect(() => {
    if (status !== 'running' || !activePlayer) {
      if (timerRef.current) clearInterval(timerRef.current);
      lastTickTimeRef.current = null;
      return;
    }

    lastTickTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const delta = lastTickTimeRef.current ? now - lastTickTimeRef.current : 100;
      lastTickTimeRef.current = now;

      if (activePlayer === 'top') {
        setTopPlayer((prev) => {
          const next = prev.timeRemainingMs - delta;
          if (next <= 0) {
            setStatus('flagged');
            hapticDefeat();
            playVictory();
            return { ...prev, timeRemainingMs: 0, isFlagged: true };
          }
          if (next <= 10000 && Math.floor(next / 1000) !== Math.floor(prev.timeRemainingMs / 1000)) {
            playCheck();
          }
          return { ...prev, timeRemainingMs: next };
        });
      } else {
        setBottomPlayer((prev) => {
          const next = prev.timeRemainingMs - delta;
          if (next <= 0) {
            setStatus('flagged');
            hapticDefeat();
            playVictory();
            return { ...prev, timeRemainingMs: 0, isFlagged: true };
          }
          if (next <= 10000 && Math.floor(next / 1000) !== Math.floor(prev.timeRemainingMs / 1000)) {
            playCheck();
          }
          return { ...prev, timeRemainingMs: next };
        });
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, activePlayer, hapticDefeat, playCheck, playVictory]);

  const handlePlayerTap = (player: 'top' | 'bottom') => {
    if (status === 'flagged') return;

    hapticMove();
    playMove();

    const incrementMs = preset.incrementSeconds * 1000;

    if (status === 'ready') {
      // First tap starts the clock for the opponent
      if (player === 'bottom') {
        // Bottom (usually White) pressed -> Top (Black) turn starts
        setActivePlayer('top');
        setBottomPlayer((prev) => ({
          ...prev,
          movesCount: prev.movesCount + 1,
          timeRemainingMs: prev.timeRemainingMs + incrementMs,
        }));
      } else {
        setActivePlayer('bottom');
        setTopPlayer((prev) => ({
          ...prev,
          movesCount: prev.movesCount + 1,
          timeRemainingMs: prev.timeRemainingMs + incrementMs,
        }));
      }
      setStatus('running');
      return;
    }

    if (status === 'running') {
      if (player === activePlayer) {
        // Player completed their move, switch to opponent & add increment
        if (player === 'top') {
          setTopPlayer((prev) => ({
            ...prev,
            movesCount: prev.movesCount + 1,
            timeRemainingMs: prev.timeRemainingMs + incrementMs,
          }));
          setActivePlayer('bottom');
        } else {
          setBottomPlayer((prev) => ({
            ...prev,
            movesCount: prev.movesCount + 1,
            timeRemainingMs: prev.timeRemainingMs + incrementMs,
          }));
          setActivePlayer('top');
        }
      }
    }
  };

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    if (mins < 1 && totalSeconds <= 20) {
      // Show tenths of second when low on time
      const tenths = Math.floor((ms % 1000) / 100);
      return `${secs}.${tenths}`;
    }

    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isTopLow = topPlayer.timeRemainingMs <= 10000 && status !== 'ready';
  const isBottomLow = bottomPlayer.timeRemainingMs <= 10000 && status !== 'ready';

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#09130F" />

      {/* TOP PLAYER PADDLE (Rotated 180° for opponent) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Reloj Jugador Superior: ${formatTime(topPlayer.timeRemainingMs)}`}
        disabled={status === 'paused' || (status === 'running' && activePlayer !== 'top')}
        onPress={() => handlePlayerTap('top')}
        style={({ pressed }) => [
          styles.playerPaddle,
          styles.topPaddle,
          activePlayer === 'top' && status === 'running' && styles.activePaddle,
          isTopLow && styles.lowTimePaddle,
          topPlayer.isFlagged && styles.flaggedPaddle,
          pressed && styles.paddlePressed,
        ]}
      >
        <View style={styles.rotatedContent}>
          <View style={styles.paddleHeader}>
            <Text style={styles.playerName}>JUGADOR 2 (NEGRAS)</Text>
            <Text style={styles.moveBadge}>{topPlayer.movesCount} jugadas</Text>
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.clockDisplay, isTopLow && styles.lowTimeText, topPlayer.isFlagged && styles.flaggedText]}
          >
            {formatTime(topPlayer.timeRemainingMs)}
          </Text>
          {topPlayer.isFlagged ? (
            <Text style={styles.flaggedBanner}>🚩 TIEMPO AGOTADO</Text>
          ) : activePlayer === 'top' && status === 'running' ? (
            <Text style={styles.turnIndicator}>TURNO EN CURSO</Text>
          ) : null}
        </View>
      </Pressable>

      {/* CENTER CONTROL BAR */}
      <View style={styles.controlBar}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.controlIconBtn, pressed && styles.pressed]}
        >
          <Text style={styles.controlBtnIcon}>✕</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => setPresetModalVisible(true)}
          style={({ pressed }) => [styles.presetPill, pressed && styles.pressed]}
        >
          <Text style={styles.presetPillText}>{preset.name}</Text>
          <Text style={styles.presetPillSub}>{preset.label}</Text>
        </Pressable>

        <View style={styles.actionButtonsRow}>
          <Pressable
            accessibilityRole="button"
            disabled={status === 'ready'}
            onPress={togglePause}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          >
            <Text style={styles.actionButtonText}>
              {status === 'running' ? '⏸ Pausa' : '▶ Seguir'}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={resetClock}
            style={({ pressed }) => [styles.actionButton, styles.resetButton, pressed && styles.pressed]}
          >
            <Text style={[styles.actionButtonText, styles.resetButtonText]}>↺ Reset</Text>
          </Pressable>
        </View>
      </View>

      {/* BOTTOM PLAYER PADDLE */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Reloj Jugador Inferior: ${formatTime(bottomPlayer.timeRemainingMs)}`}
        disabled={status === 'paused' || (status === 'running' && activePlayer !== 'bottom')}
        onPress={() => handlePlayerTap('bottom')}
        style={({ pressed }) => [
          styles.playerPaddle,
          styles.bottomPaddle,
          activePlayer === 'bottom' && status === 'running' && styles.activePaddle,
          isBottomLow && styles.lowTimePaddle,
          bottomPlayer.isFlagged && styles.flaggedPaddle,
          pressed && styles.paddlePressed,
        ]}
      >
        <View style={styles.paddleContent}>
          <View style={styles.paddleHeader}>
            <Text style={styles.playerName}>JUGADOR 1 (BLANCAS)</Text>
            <Text style={styles.moveBadge}>{bottomPlayer.movesCount} jugadas</Text>
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.clockDisplay, isBottomLow && styles.lowTimeText, bottomPlayer.isFlagged && styles.flaggedText]}
          >
            {formatTime(bottomPlayer.timeRemainingMs)}
          </Text>
          {bottomPlayer.isFlagged ? (
            <Text style={styles.flaggedBanner}>🚩 TIEMPO AGOTADO</Text>
          ) : activePlayer === 'bottom' && status === 'running' ? (
            <Text style={styles.turnIndicator}>TURNO EN CURSO</Text>
          ) : null}
        </View>
      </Pressable>

      {/* PRESETS MODAL */}
      <Modal
        visible={presetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPresetModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Ritmos Oficiales FIDE</Text>
            <Text style={styles.modalSubtitle}>Selecciona el control de tiempo para tu partida:</Text>

            <ScrollView style={styles.presetsList}>
              {CLOCK_PRESETS.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() => applyPreset(item)}
                  style={({ pressed }) => [
                    styles.presetOption,
                    preset.id === item.id && styles.presetOptionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <View>
                    <Text style={[styles.presetOptionTitle, preset.id === item.id && styles.presetOptionTitleActive]}>
                      {item.name}
                    </Text>
                    <Text style={styles.presetOptionDetail}>{item.label}</Text>
                  </View>
                  <Text style={styles.presetCategoryBadge}>{item.category.toUpperCase()}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              accessibilityRole="button"
              onPress={() => setPresetModalVisible(false)}
              style={({ pressed }) => [styles.closeModalButton, pressed && styles.pressed]}
            >
              <Text style={styles.closeModalText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#09130F',
  },
  playerPaddle: {
    flex: 1,
    margin: 8,
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: '#14241D',
    borderWidth: 2,
    borderColor: '#294235',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  topPaddle: {
    backgroundColor: '#111E18',
  },
  bottomPaddle: {
    backgroundColor: '#14241D',
  },
  activePaddle: {
    backgroundColor: '#1E3A2D',
    borderColor: '#00E5B4',
    shadowColor: '#00E5B4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  lowTimePaddle: {
    borderColor: '#FF8C42',
    backgroundColor: '#2A1D16',
  },
  flaggedPaddle: {
    borderColor: '#FF4D4D',
    backgroundColor: '#2F1414',
  },
  paddlePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  rotatedContent: {
    transform: [{ rotate: '180deg' }],
    alignItems: 'center',
    width: '100%',
  },
  paddleContent: {
    alignItems: 'center',
    width: '100%',
  },
  paddleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  playerName: {
    color: '#9EAFA5',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  moveBadge: {
    color: '#00E5B4',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(0, 229, 180, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  clockDisplay: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  lowTimeText: {
    color: '#FF8C42',
  },
  flaggedText: {
    color: '#FF4D4D',
  },
  turnIndicator: {
    color: '#00E5B4',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 8,
  },
  flaggedBanner: {
    color: '#FF4D4D',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 8,
  },
  controlBar: {
    height: 72,
    backgroundColor: '#0E1A14',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#243C30',
  },
  controlIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#182C22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnIcon: {
    color: '#C5D0C9',
    fontSize: 16,
    fontWeight: '900',
  },
  presetPill: {
    backgroundColor: '#182C22',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#345242',
    alignItems: 'center',
  },
  presetPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  presetPillSub: {
    color: '#00E5B4',
    fontSize: 10,
    fontWeight: '700',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#00E5B4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#09130F',
    fontSize: 12,
    fontWeight: '900',
  },
  resetButton: {
    backgroundColor: '#1E3529',
    borderWidth: 1,
    borderColor: '#345242',
  },
  resetButtonText: {
    color: '#C5D0C9',
  },
  pressed: {
    opacity: 0.8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 12, 9, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    backgroundColor: '#14241D',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#345242',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#9EAFA5',
    fontSize: 12,
    marginBottom: 16,
  },
  presetsList: {
    maxHeight: 340,
  },
  presetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1B3025',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#294235',
  },
  presetOptionSelected: {
    borderColor: '#00E5B4',
    backgroundColor: '#1E3A2D',
  },
  presetOptionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  presetOptionTitleActive: {
    color: '#00E5B4',
  },
  presetOptionDetail: {
    color: '#9EAFA5',
    fontSize: 12,
    marginTop: 2,
  },
  presetCategoryBadge: {
    color: '#F5C451',
    fontSize: 10,
    fontWeight: '900',
    backgroundColor: 'rgba(245, 196, 81, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  closeModalButton: {
    marginTop: 14,
    backgroundColor: '#1E3529',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#345242',
  },
  closeModalText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
