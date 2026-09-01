import * as Haptics from 'expo-haptics';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { ChessPieceView, type PieceSetId } from '@/board-themes/piece-sets';
import type { Color, Piece, PromotionPiece } from '@/chess';
import { APP_COLORS } from '@/theme/colors';

const PROMOTION_OPTIONS: readonly { value: PromotionPiece; label: string }[] = [
  { value: 'q', label: 'Dama' },
  { value: 'r', label: 'Torre' },
  { value: 'b', label: 'Alfil' },
  { value: 'n', label: 'Caballo' },
];

interface PromotionPickerProps {
  readonly visible: boolean;
  readonly color: Color;
  readonly pieceSetId?: PieceSetId;
  readonly onSelect: (piece: PromotionPiece) => void;
  readonly onCancel: () => void;
}

export function PromotionPicker({
  visible,
  color,
  pieceSetId = 'staunton',
  onSelect,
  onCancel,
}: PromotionPickerProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Animated.View
          entering={ZoomIn.duration(180)}
          accessibilityRole="alert"
          style={styles.card}
        >
          <Text selectable style={styles.eyebrow}>
            CORONACIÓN DE PEÓN
          </Text>
          <Text selectable style={styles.title}>
            Elige una Pieza
          </Text>
          <Text selectable style={styles.subtitle}>
            La coronación transformará tu peón en la pieza seleccionada.
          </Text>
          <View style={styles.options}>
            {PROMOTION_OPTIONS.map((option, index) => {
              const pieceCode = (
                color === 'w' ? option.value.toUpperCase() : option.value
              ) as Piece;

              return (
                <Animated.View
                  key={option.value}
                  entering={FadeIn.delay(index * 35).duration(160)}
                  style={styles.optionWrapper}
                >
                  <Pressable
                    accessibilityLabel={`Promocionar a ${option.label}`}
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => {
                      Haptics.selectionAsync();
                      onSelect(option.value);
                    }}
                    style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                  >
                    <View style={styles.pieceContainer}>
                      <ChessPieceView
                        piece={pieceCode}
                        pieceSetId={pieceSetId}
                        size={56}
                      />
                    </View>
                    <Text style={styles.label}>{option.label}</Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
          <Pressable
            hitSlop={12}
            accessibilityRole="button"
            onPress={() => {
              Haptics.selectionAsync();
              onCancel();
            }}
            style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 8, 0.88)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: APP_COLORS.surface,
    borderRadius: 24,
    borderCurve: 'continuous',
    padding: 20,
    gap: 12,
    borderWidth: 1.5,
    borderColor: APP_COLORS.borderGold,
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(229, 184, 105, 0.2)',
  },
  eyebrow: {
    color: APP_COLORS.blueElectric,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.8,
    textAlign: 'center',
  },
  title: {
    color: APP_COLORS.goldBright,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: APP_COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingBottom: 4,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionWrapper: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  option: {
    minHeight: 110,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    padding: 10,
    gap: 6,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  pieceContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: APP_COLORS.goldBright,
    fontSize: 14,
    fontWeight: '800',
  },
  cancel: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderCurve: 'continuous',
  },
  cancelText: {
    color: APP_COLORS.textMuted,
    fontSize: 14,
    fontWeight: '800',
  },
});
