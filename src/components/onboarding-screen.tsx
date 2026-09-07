import { useState, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { APP_COLORS } from '@/theme/colors';

export interface OnboardingScreenProps {
  readonly onComplete: () => void;
}

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 'welcome',
    title: 'AjedrezPro',
    subtitle: 'Bienvenido a tu academia de ajedrez',
    description: 'Mejora tu juego con análisis avanzados, entrenamiento táctico adaptativo y un Profesor IA siempre dispuesto a ayudarte.',
    icon: '♟️',
  },
  {
    id: 'coach',
    title: 'Tu Profesor Personal',
    subtitle: 'IA de nivel Gran Maestro',
    description: 'En cualquier momento, puedes pedir una pista. Al finalizar la partida, obtendrás un análisis completo de tu precisión y errores críticos.',
    icon: '🧠',
  },
  {
    id: 'rush',
    title: 'Supervivencia de Puzzles',
    subtitle: 'Entrena tu visión táctica',
    description: 'Modo contrarreloj: resuelve tantos problemas como puedas en 3 minutos. Solo tienes 3 vidas.',
    icon: '⚡',
  }
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const nextSlide = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    } else {
      onComplete();
    }
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
      >
        {SLIDES.map((slide, index) => (
          <View key={slide.id} style={[styles.slide, { width }]}>
            <Animated.Text entering={SlideInRight.delay(100)} exiting={SlideOutLeft} style={styles.icon}>
              {slide.icon}
            </Animated.Text>
            <Animated.Text entering={SlideInRight.delay(200)} exiting={SlideOutLeft} style={styles.title}>
              {slide.title}
            </Animated.Text>
            <Animated.Text entering={SlideInRight.delay(300)} exiting={SlideOutLeft} style={styles.subtitle}>
              {slide.subtitle}
            </Animated.Text>
            <Animated.Text entering={SlideInRight.delay(400)} exiting={SlideOutLeft} style={styles.description}>
              {slide.description}
            </Animated.Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.dotActive : styles.dotInactive
              ]}
            />
          ))}
        </View>

        <Pressable style={styles.button} onPress={nextSlide}>
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 ? 'Empezar' : 'Siguiente'}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  scrollView: { flex: 1 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 16 },
  icon: { fontSize: 80, marginBottom: 20 },
  title: { color: APP_COLORS.goldBright, fontSize: 32, fontWeight: '900', textAlign: 'center', letterSpacing: 0.5 },
  subtitle: { color: APP_COLORS.blueElectric, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  description: { color: APP_COLORS.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 24, marginTop: 10, maxWidth: 320 },
  footer: { padding: 40, alignItems: 'center', gap: 30 },
  pagination: { flexDirection: 'row', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotActive: { backgroundColor: APP_COLORS.goldPrimary, width: 24 },
  dotInactive: { backgroundColor: APP_COLORS.surfaceStrong },
  button: { width: '100%', maxWidth: 300, backgroundColor: APP_COLORS.goldPrimary, padding: 18, borderRadius: 16, alignItems: 'center', boxShadow: '0 4px 14px rgba(229, 184, 105, 0.35)' },
  buttonText: { color: '#070B0E', fontSize: 16, fontWeight: '900' }
});
