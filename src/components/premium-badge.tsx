import { APP_COLORS } from '@/theme/colors';
import { StyleSheet, Text, View } from 'react-native';

export type PremiumBadgeVariant = 'default' | 'compact' | 'feature-lock';

export interface PremiumBadgeProps {
  readonly isPro: boolean;
  readonly variant?: PremiumBadgeVariant;
}

/**
 * Badge que muestra estado Premium (FREE o PRO)
 */
export function PremiumBadge({ isPro, variant = 'default' }: PremiumBadgeProps) {
  const isFree = !isPro;

  // Configuración por variante
  const config = {
    default: {
      container: styles.containerDefault,
      text: styles.textDefault,
      freeBackground: styles.freeBackground,
      proBackground: styles.proBackground,
      freeText: styles.freeText,
      proText: styles.proText,
    },
    compact: {
      container: styles.containerCompact,
      text: styles.textCompact,
      freeBackground: styles.freeBackground,
      proBackground: styles.proBackground,
      freeText: styles.freeText,
      proText: styles.proText,
    },
    'feature-lock': {
      container: styles.containerFeatureLock,
      text: styles.textFeatureLock,
      freeBackground: styles.freeBackgroundFeatureLock,
      proBackground: styles.proBackground,
      freeText: styles.freeTextFeatureLock,
      proText: styles.proText,
    },
  }[variant];

  const label = isPro ? 'PRO' : 'FREE';
  const accessibilityLabel = isPro ? 'Usuario Pro' : 'Usuario Free';

  return (
    <View
      style={[
        config.container,
        isFree ? config.freeBackground : config.proBackground,
      ]}
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
    >
      <Text style={[config.text, isFree ? config.freeText : config.proText]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Variante default
  containerDefault: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  textDefault: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Variante compact
  containerCompact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },
  textCompact: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Variante feature-lock
  containerFeatureLock: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
    borderWidth: 1,
  },
  textFeatureLock: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // Colores FREE
  freeBackground: {
    backgroundColor: APP_COLORS.backgroundSecondary,
    borderColor: APP_COLORS.border,
    borderWidth: 1,
  },
  freeBackgroundFeatureLock: {
    backgroundColor: 'transparent',
    borderColor: APP_COLORS.textSecondary,
    borderWidth: 1,
  },
  freeText: {
    color: APP_COLORS.textSecondary,
  },
  freeTextFeatureLock: {
    color: APP_COLORS.textSecondary,
  },

  // Colores PRO
  proBackground: {
    backgroundColor: APP_COLORS.goldGlow,
    borderColor: APP_COLORS.goldPrimary,
    borderWidth: 1,
  },
  proText: {
    color: APP_COLORS.goldPrimary,
  },
});