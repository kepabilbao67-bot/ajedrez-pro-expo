import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { APP_COLORS } from '@/theme/colors';

export interface PremiumUpsellModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onUpgrade: () => void;
}

export function PremiumUpsellModal({ visible, onClose, onUpgrade }: PremiumUpsellModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>AjedrezPro Premium</Text>
          <Text style={styles.subtitle}>Has alcanzado el límite gratuito. Desbloquea todo el potencial de tu juego.</Text>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>♾️</Text>
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Análisis Ilimitado</Text>
                <Text style={styles.benefitDescription}>Descubre tus errores y brillanteces en cada partida sin restricciones.</Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🧠</Text>
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Profesor IA Gran Maestro</Text>
                <Text style={styles.benefitDescription}>Pistas ilimitadas y explicaciones detalladas para mejorar tu juego.</Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🎨</Text>
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Temas Exclusivos</Text>
                <Text style={styles.benefitDescription}>Acceso a temas de tablero como Royale Azul & Oro, Neón Cyber y piezas 3D.</Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable style={({ pressed }) => [styles.upgradeButton, pressed && styles.pressed]} onPress={onUpgrade}>
              <Text style={styles.upgradeText}>Desbloquear Premium</Text>
            </Pressable>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>Quizás más tarde</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(4, 6, 8, 0.88)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 24,
    borderCurve: 'continuous',
    padding: 24,
    borderWidth: 1.5,
    borderColor: APP_COLORS.borderGold,
    alignItems: 'center',
    boxShadow: '0 18px 44px rgba(0, 0, 0, 0.8), 0 0 20px rgba(229, 184, 105, 0.25)',
  },
  title: { color: APP_COLORS.goldBright, fontSize: 24, fontWeight: '900', marginBottom: 8, textAlign: 'center', letterSpacing: 0.5 },
  subtitle: { color: APP_COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  benefitsList: { width: '100%', gap: 16, marginBottom: 32 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  benefitIcon: { fontSize: 32 },
  benefitTextContainer: { flex: 1 },
  benefitTitle: { color: APP_COLORS.blueElectric, fontSize: 15, fontWeight: '800', marginBottom: 2 },
  benefitDescription: { color: APP_COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  actions: { width: '100%', gap: 12 },
  upgradeButton: {
    backgroundColor: APP_COLORS.goldPrimary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    borderCurve: 'continuous',
    alignItems: 'center',
    boxShadow: '0 4px 14px rgba(229, 184, 105, 0.35)',
  },
  upgradeText: { color: '#070B0E', fontSize: 16, fontWeight: '900' },
  closeButton: { width: '100%', paddingVertical: 12, alignItems: 'center' },
  closeText: { color: APP_COLORS.textMuted, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
});
