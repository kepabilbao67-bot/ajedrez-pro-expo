import { APP_COLORS } from '@/theme/colors';
import { DimensionValue, StyleSheet, Text, View } from 'react-native';

export interface UsageMeterProps {
  readonly used: number;
  readonly max: number;
  readonly label: string;
  readonly isPro: boolean;
}

/**
 * Medidor de uso diario para funcionalidades Free/Pro
 */
export function UsageMeter({ used, max, label, isPro }: UsageMeterProps) {
  const isFree = !isPro;
  const isAtLimit = isFree && used >= max;
  const percentage = Math.min(used / max, 1);

  // Texto para mostrar
  const displayText = isPro
    ? 'Ilimitado ✨'
    : `${used}/${max} usadas`;

  // Color del progreso
  const progressColor = isAtLimit
    ? APP_COLORS.danger
    : APP_COLORS.blueElectric;

  // Ancho de la barra de progreso
  const progressWidth: DimensionValue = `${percentage * 100}%`;

  return (
    <View style={styles.container}>
      {/* Cabecera con label y contador */}
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text
          style={[
            styles.counter,
            isPro ? styles.counterPro : styles.counterFree,
            isAtLimit && styles.counterLimit,
          ]}
          accessible
          accessibilityLabel={`${label}: ${displayText}`}
        >
          {displayText}
        </Text>
      </View>

      {/* Barra de progreso (solo para Free) */}
      {isFree && (
        <View
          style={styles.progressContainer}
          accessible
          accessibilityLabel={`Progreso: ${Math.round(percentage * 100)}% utilizado`}
        >
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: progressWidth,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>

          {/* Indicador de límite alcanzado */}
          {isAtLimit && (
            <Text style={styles.limitText}>Límite diario alcanzado</Text>
          )}
        </View>
      )}

      {/* Mensaje especial para Pro */}
      {isPro && (
        <Text style={styles.unlimitedNote}>
          Desbloquea todas las funcionalidades Premium
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: APP_COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_COLORS.textPrimary,
    flex: 1,
  },
  counter: {
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  counterFree: {
    backgroundColor: APP_COLORS.backgroundAlt,
    color: APP_COLORS.textSecondary,
  },
  counterPro: {
    backgroundColor: APP_COLORS.goldGlow,
    color: APP_COLORS.goldPrimary,
  },
  counterLimit: {
    backgroundColor: APP_COLORS.dangerGlow,
    color: APP_COLORS.danger,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBackground: {
    height: 8,
    backgroundColor: APP_COLORS.backgroundAlt,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  limitText: {
    fontSize: 12,
    color: APP_COLORS.danger,
    marginTop: 6,
    fontWeight: '500',
  },
  unlimitedNote: {
    fontSize: 13,
    color: APP_COLORS.goldPrimary,
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});