import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { APP_COLORS } from '@/theme/colors';

function Particle({ index }: { index: number }) {
  const [randomData] = useState(() => ({
    x: Math.random() * 200 - 100,
    delayY: Math.random() * 300,
    delayOp: Math.random() * 300,
    targetY: -150 - Math.random() * 100,
    scale: Math.random() * 0.5 + 0.5,
  }));

  const pX = useSharedValue(randomData.x);
  const pY = useSharedValue(0);
  const pOpacity = useSharedValue(0);

  useEffect(() => {
    pOpacity.value = withDelay(
      randomData.delayOp,
      withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 800, easing: Easing.in(Easing.ease) })
      )
    );

    pY.value = withDelay(
      randomData.delayY,
      withTiming(randomData.targetY, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
  }, [pOpacity, pY, randomData]);

  const pStyle = useAnimatedStyle(() => {
    return {
      opacity: pOpacity.value,
      transform: [
        { translateX: pX.value },
        { translateY: pY.value },
        { scale: randomData.scale },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        pStyle,
        { backgroundColor: [APP_COLORS.blueElectric, APP_COLORS.goldPrimary, APP_COLORS.goldBright, '#00E676'][index % 4] },
      ]}
    />
  );
}

export function VictoryCelebration() {
  const scale = useSharedValue(0.1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    translateY.value = withSpring(0, { damping: 12, stiffness: 90 });
    scale.value = withSequence(
      withSpring(1.2, { damping: 10, stiffness: 100 }),
      withSpring(1, { damping: 12, stiffness: 90 })
    );
  }, [opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
    };
  });

  const particles = Array.from({ length: 14 }).map((_, i) => (
    <Particle key={i} index={i} />
  ));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {particles}
      <Text style={styles.title}>¡JAQUE MATE!</Text>
      <Text style={styles.subtitle}>👑 ¡Victoria magistral!</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 22,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.surface,
    borderWidth: 2,
    borderColor: APP_COLORS.borderGold,
    marginVertical: 10,
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7), 0 0 25px rgba(229, 184, 105, 0.4)',
    overflow: 'visible',
  },
  title: {
    color: APP_COLORS.goldBright,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subtitle: {
    color: APP_COLORS.blueElectric,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: -1,
  },
});
