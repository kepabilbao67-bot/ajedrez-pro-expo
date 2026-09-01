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
import { APP_COLORS } from '@/theme/colors';

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
      if (player === 'bottom') {
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
      const tenths = Math.floor((ms % 1000) / 100);
      return `${secs}.${tenths}`;
    }

    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isTopLow = topPlayer.timeRemainingMs <= 10000 && status !== 'ready';
  const isBottomLow = bottomPlayer.timeRemainingMs <= 10000 && status !== 'ready';

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={APP_COLORS.background} />

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
    backgroundColor: APP_COLORS.background,
  },
  playerPaddle: {
    flex: 1,
    margin: 8,
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.surface,
    borderWidth: 2,
    borderColor: APP_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  topPaddle: {
    backgroundColor: APP_COLORS.surfaceStrong,
  },
  bottomPaddle: {
    backgroundColor: APP_COLORS.surface,
  },
  activePaddle: {
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    borderColor: APP_COLORS.blueElectric,
    boxShadow: '0 0 20px rgba(0, 210, 255, 0.4)',
  },
  lowTimePaddle: {
    borderColor: APP_COLORS.warning,
    backgroundColor: 'rgba(245, 196, 81, 0.12)',
  },
  flaggedPaddle: {
    borderColor: APP_COLORS.danger,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
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
    color: APP_COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  moveBadge: {
    color: APP_COLORS.blueElectric,
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.3)',
  },
  clockDisplay: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  lowTimeText: {
    color: APP_COLORS.warning,
  },
  flaggedText: {
    color: APP_COLORS.danger,
  },
  turnIndicator: {
    color: APP_COLORS.blueElectric,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 8,
  },
  flaggedBanner: {
    color: APP_COLORS.danger,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 8,
  },
  controlBar: {
    height: 72,
    backgroundColor: APP_COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: APP_COLORS.border,
  },
  controlIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: APP_COLORS.surfaceStrong,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnIcon: {
    color: APP_COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '900',
  },
  presetPill: {
    backgroundColor: APP_COLORS.surfaceStrong,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.borderGold,
    alignItems: 'center',
  },
  presetPillText: {
    color: APP_COLORS.goldBright,
    fontSize: 13,
    fontWeight: '800',
  },
  presetPillSub: {
    color: APP_COLORS.blueElectric,
    fontSize: 10,
    fontWeight: '700',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: APP_COLORS.goldPrimary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#070B0E',
    fontSize: 12,
    fontWeight: '900',
  },
  resetButton: {
    backgroundColor: APP_COLORS.surfaceStrong,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  resetButtonText: {
    color: APP_COLORS.textSecondary,
  },
  pressed: {
    opacity: 0.8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 8, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    backgroundColor: APP_COLORS.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: APP_COLORS.borderGold,
  },
  modalTitle: {
    color: APP_COLORS.goldBright,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: APP_COLORS.textSecondary,
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
    backgroundColor: APP_COLORS.surfaceStrong,
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  presetOptionSelected: {
    borderColor: APP_COLORS.goldPrimary,
    backgroundColor: 'rgba(229, 184, 105, 0.1)',
  },
  presetOptionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  presetOptionTitleActive: {
    color: APP_COLORS.goldBright,
  },
  presetOptionDetail: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  presetCategoryBadge: {
    color: APP_COLORS.goldBright,
    fontSize: 10,
    fontWeight: '900',
    backgroundColor: 'rgba(229, 184, 105, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: APP_COLORS.borderGold,
  },
  closeModalButton: {
    marginTop: 14,
    backgroundColor: APP_COLORS.surfaceStrong,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  closeModalText: {
    color: APP_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '800',
  },
});
