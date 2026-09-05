import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { TimeControlPreset } from '@/clock/clock-types';

export interface GameClockDisplayProps {
  readonly whiteFormatted: string;
  readonly blackFormatted: string;
  readonly activeSide: 'w' | 'b' | null;
  readonly isLowTimeWhite: boolean;
  readonly isLowTimeBlack: boolean;
  readonly preset: TimeControlPreset;
  readonly opponentName?: string;
  readonly playerName?: string;
  readonly playerColor?: 'w' | 'b';
}

export function GameClockDisplay({
  whiteFormatted,
  blackFormatted,
  activeSide,
  isLowTimeWhite,
  isLowTimeBlack,
  preset,
  opponentName = 'Rival',
  playerName = 'Tú',
  playerColor = 'w',
}: GameClockDisplayProps) {
  if (preset.category === 'none') {
    return null;
  }

  const isWhitePlayer = playerColor === 'w';
  const topTime = isWhitePlayer ? blackFormatted : whiteFormatted;
  const bottomTime = isWhitePlayer ? whiteFormatted : blackFormatted;

  const isTopActive = isWhitePlayer ? activeSide === 'b' : activeSide === 'w';
  const isBottomActive = isWhitePlayer ? activeSide === 'w' : activeSide === 'b';

  const isTopLowTime = isWhitePlayer ? isLowTimeBlack : isLowTimeWhite;
  const isBottomLowTime = isWhitePlayer ? isLowTimeWhite : isLowTimeBlack;

  return (
    <Animated.View entering={FadeIn.duration(180)} style={styles.container}>
      {/* TOP (OPPONENT) CLOCK BAR */}
      <View
        style={[
          styles.clockBar,
          styles.clockBarTop,
          isTopActive && styles.clockBarActive,
          isTopLowTime && styles.clockBarLowTime,
        ]}
      >
        <View style={styles.playerInfoRow}>
          <View style={[styles.turnDot, isTopActive && styles.turnDotActive]} />
          <Text style={styles.playerLabel}>{opponentName}</Text>
        </View>
        <Text
          style={[
            styles.timeText,
            isTopActive && styles.timeTextActive,
            isTopLowTime && styles.timeTextLowTime,
          ]}
        >
          {topTime}
        </Text>
      </View>

      {/* BOTTOM (PLAYER) CLOCK BAR */}
      <View
        style={[
          styles.clockBar,
          styles.clockBarBottom,
          isBottomActive && styles.clockBarActive,
          isBottomLowTime && styles.clockBarLowTime,
        ]}
      >
        <View style={styles.playerInfoRow}>
          <View style={[styles.turnDot, isBottomActive && styles.turnDotActive]} />
          <Text style={styles.playerLabel}>{playerName}</Text>
        </View>
        <Text
          style={[
            styles.timeText,
            isBottomActive && styles.timeTextActive,
            isBottomLowTime && styles.timeTextLowTime,
          ]}
        >
          {bottomTime}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 4,
  },
  clockBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E1724',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1E2D3E',
  },
  clockBarTop: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  clockBarBottom: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  clockBarActive: {
    borderColor: '#00E5FF',
    backgroundColor: '#122234',
    boxShadow: '0 0 12px rgba(0, 229, 255, 0.25)',
  },
  clockBarLowTime: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  playerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  turnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#475569',
  },
  turnDotActive: {
    backgroundColor: '#00E5FF',
    boxShadow: '0 0 6px #00E5FF',
  },
  playerLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
  },
  timeText: {
    color: '#E2E8F0',
    fontSize: 18,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  timeTextActive: {
    color: '#00E5FF',
  },
  timeTextLowTime: {
    color: '#EF4444',
  },
});
