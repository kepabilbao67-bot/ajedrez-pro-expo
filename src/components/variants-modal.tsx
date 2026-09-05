import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { CHESS_VARIANTS, type ChessVariantDefinition, type ChessVariantId } from '@/variants/variants-catalog';
import { APP_COLORS } from '@/theme/colors';

export interface VariantsModalProps {
  readonly visible: boolean;
  readonly activeVariant: ChessVariantId;
  readonly onSelectVariant: (variantId: ChessVariantId) => void;
  readonly onClose: () => void;
}

export function VariantsModal({
  visible,
  activeVariant,
  onSelectVariant,
  onClose,
}: VariantsModalProps) {
  const { height } = useWindowDimensions();

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View entering={ZoomIn.duration(220)} style={[styles.card, { maxHeight: height * 0.85 }]}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerTitleCol}>
              <Text style={styles.eyebrow}>MODOS ALTERNATIVOS</Text>
              <Text style={styles.title}>VARIANTES DE AJEDREZ</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar selector de variantes"
              onPress={onClose}
              style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.subtitle}>
            Elige una regla especial para desafiar tu cálculo y diversión táctica.
          </Text>

          {/* VARIANTS LIST */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          >
            {CHESS_VARIANTS.map((variant: ChessVariantDefinition) => {
              const isActive = activeVariant === variant.id;
              const isPlayable = variant.isImplemented;

              return (
                <View
                  key={variant.id}
                  style={[
                    styles.variantCard,
                    isActive && styles.variantCardActive,
                    !isPlayable && styles.variantCardDisabled,
                  ]}
                >
                  <View style={styles.variantTopRow}>
                    <Text style={styles.variantIcon}>{variant.icon}</Text>
                    <View style={styles.variantMeta}>
                      <View style={styles.titleRow}>
                        <Text style={[styles.variantName, isActive && styles.variantNameActive]}>
                          {variant.name}
                        </Text>
                        {isActive && (
                          <View style={styles.activeBadge}>
                            <Text style={styles.activeBadgeText}>ACTIVA</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.variantRulesSummary}>{variant.rulesSummary}</Text>
                    </View>
                  </View>

                  <Text style={styles.variantDescription}>{variant.description}</Text>

                  {/* ACTION / STATUS BUTTON */}
                  <View style={styles.variantFooter}>
                    {isPlayable ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Jugar variante ${variant.name}`}
                        onPress={() => {
                          onSelectVariant(variant.id);
                          onClose();
                        }}
                        style={({ pressed }) => [
                          styles.playBtn,
                          isActive ? styles.playBtnSelected : styles.playBtnNormal,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={styles.playBtnText}>
                          {isActive ? '✓ MODO ACTIVO — REINICIAR' : '▶ JUGAR AHORA'}
                        </Text>
                      </Pressable>
                    ) : (
                      <View style={styles.upcomingBadge}>
                        <Text style={styles.upcomingBadgeText}>🔒 PRÓXIMAMENTE</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 15, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderColor: APP_COLORS.borderGold,
    padding: 20,
    gap: 12,
    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7), 0 0 20px rgba(229, 184, 105, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitleCol: {
    flex: 1,
  },
  eyebrow: {
    color: APP_COLORS.blueElectric,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  title: {
    color: APP_COLORS.goldBright,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: APP_COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: APP_COLORS.surfaceStrong,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: APP_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  listContainer: {
    gap: 12,
    paddingVertical: 4,
  },
  variantCard: {
    backgroundColor: APP_COLORS.surfaceStrong,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: APP_COLORS.borderLight,
    padding: 14,
    gap: 10,
  },
  variantCardActive: {
    borderColor: APP_COLORS.goldPrimary,
    backgroundColor: 'rgba(229, 184, 105, 0.08)',
  },
  variantCardDisabled: {
    opacity: 0.65,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  variantTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  variantIcon: {
    fontSize: 28,
  },
  variantMeta: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  variantName: {
    color: APP_COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  variantNameActive: {
    color: APP_COLORS.goldBright,
  },
  activeBadge: {
    backgroundColor: 'rgba(229, 184, 105, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: APP_COLORS.goldPrimary,
  },
  activeBadgeText: {
    color: APP_COLORS.goldBright,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  variantRulesSummary: {
    color: APP_COLORS.blueElectric,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  variantDescription: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  variantFooter: {
    marginTop: 4,
  },
  playBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnNormal: {
    backgroundColor: APP_COLORS.goldPrimary,
  },
  playBtnSelected: {
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.goldPrimary,
  },
  playBtnText: {
    color: '#0D1117',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  upcomingBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  upcomingBadgeText: {
    color: APP_COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
});
