import * as Haptics from 'expo-haptics';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { ChessPieceView, type PieceSetId } from '@/board-themes/piece-sets';
import type { Color, Piece, PromotionPiece } from '@/chess';

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
            PROMOCIÓN
          </Text>
          <Text selectable style={styles.title}>
            Elige una pieza
          </Text>
          <Text selectable style={styles.subtitle}>
            La elección se aplicará inmediatamente con tu estilo visual.
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
    backgroundColor: 'rgba(5, 12, 9, 0.84)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: '#F8F4EA',
    borderRadius: 24,
    borderCurve: 'continuous',
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#D6C397',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
  },
  eyebrow: {
    color: '#8A6B2E',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.8,
    textAlign: 'center',
  },
  title: {
    color: '#17231E',
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: '#526158',
    fontSize: 14,
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
    borderRadius: 17,
    borderCurve: 'continuous',
    backgroundColor: '#E8DCC4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#B9934A',
    padding: 10,
    gap: 6,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  pieceContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#17231E',
    fontSize: 14,
    fontWeight: '800',
  },
  cancel: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderCurve: 'continuous',
  },
  cancelText: {
    color: '#315C4A',
    fontSize: 16,
    fontWeight: '900',
  },
});
