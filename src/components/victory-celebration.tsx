import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

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
        { translateY: translateY.value }
      ]
    };
  });

  // Confetti particles
  const particles = Array.from({ length: 12 }).map((_, i) => {
    const pX = useSharedValue(Math.random() * 200 - 100);
    const pY = useSharedValue(0);
    const pOpacity = useSharedValue(0);
    
    useEffect(() => {
      pOpacity.value = withDelay(
        Math.random() * 300,
        withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(0, { duration: 800, easing: Easing.in(Easing.ease) })
        )
      );
      
      pY.value = withDelay(
        Math.random() * 300,
        withTiming(-150 - Math.random() * 100, { duration: 1000, easing: Easing.out(Easing.cubic) })
      );
    }, [pOpacity, pY]);

    const pStyle = useAnimatedStyle(() => {
      return {
        opacity: pOpacity.value,
        transform: [
          { translateX: pX.value },
          { translateY: pY.value },
          { scale: Math.random() * 0.5 + 0.5 }
        ]
      };
    });

    return (
      <Animated.View key={i} style={[styles.particle, pStyle, { backgroundColor: ['#00E5B4', '#D6A943', '#F7CE63', '#C44732'][i % 4] }]} />
    );
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {particles}
      <Text style={styles.title}>¡JAQUE MATE!</Text>
      <Text style={styles.subtitle}>¡Has ganado la partida!</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 440, alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 20, backgroundColor: '#3B2D10', borderWidth: 2, borderColor: '#D6A943', marginVertical: 10, shadowColor: '#D6A943', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8, overflow: 'visible' },
  title: { color: '#F7CE63', fontSize: 32, fontWeight: '900', letterSpacing: 2, textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  subtitle: { color: '#F6E6BD', fontSize: 16, fontWeight: '700', marginTop: 4 },
  particle: { position: 'absolute', width: 10, height: 10, borderRadius: 5, zIndex: -1 },
});
