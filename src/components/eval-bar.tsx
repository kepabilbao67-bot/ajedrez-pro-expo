import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { APP_COLORS } from '@/theme/colors';

interface EvalBarProps {
  readonly whiteWinProbability: number; // 0 to 100
  readonly formattedScore: string;
  readonly isThinking?: boolean;
  readonly orientation?: 'vertical' | 'horizontal';
  readonly height?: number;
  readonly width?: number;
}

export function EvalBar({
  whiteWinProbability = 50,
  formattedScore = '0.0',
  isThinking = false,
  orientation = 'horizontal',
  height = 24,
  width,
}: EvalBarProps) {
  const animatedFill = useSharedValue(whiteWinProbability);

  useEffect(() => {
    animatedFill.value = withSpring(whiteWinProbability, {
      damping: 18,
      stiffness: 120,
    });
  }, [whiteWinProbability, animatedFill]);

  const fillStyle = useAnimatedStyle(() => {
    if (orientation === 'vertical') {
      return {
        height: `${animatedFill.value}%`,
      };
    }
    return {
      width: `${animatedFill.value}%`,
    };
  });

  const isWhiteFavored = whiteWinProbability >= 50;

  return (
    <View
      style={[
        styles.container,
        orientation === 'horizontal' ? { height, width: width ?? '100%' } : styles.verticalContainer,
      ]}
    >
      {/* Background represents Black's advantage */}
      <View style={styles.blackBackground}>
        {/* Animated Fill represents White's advantage */}
        <Animated.View style={[styles.whiteFill, fillStyle]} />
      </View>

      {/* Overlay text / indicators */}
      <View style={styles.labelsOverlay}>
        <Text style={[styles.evalBadgeText, isWhiteFavored ? styles.whiteText : styles.blackText]}>
          {isThinking ? '...' : formattedScore}
        </Text>
        <View style={styles.ratioWrapper}>
          <Text style={styles.ratioText}>
            {whiteWinProbability}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: APP_COLORS.borderGold,
    backgroundColor: APP_COLORS.surface,
    position: 'relative',
    marginVertical: 6,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
  },
  verticalContainer: {
    width: 24,
    height: 320,
  },
  blackBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#070E17', // Deep obsidian black
    flexDirection: 'row',
  },
  whiteFill: {
    backgroundColor: '#E5B869', // Metallic gold for White
    height: '100%',
  },
  labelsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  evalBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.3,
  },
  whiteText: {
    color: '#070B0E', // Dark contrast over gold portion
  },
  blackText: {
    color: '#E0EEFF', // Light cyan contrast over dark portion
  },
  ratioWrapper: {
    backgroundColor: 'rgba(7, 11, 14, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.3)',
  },
  ratioText: {
    color: APP_COLORS.blueElectric,
    fontSize: 10,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
});
