import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { BOARD_THEMES, boardThemeById } from '@/board-themes/board-themes';
import { PIECE_SETS, pieceSetById, ChessPieceView } from '@/board-themes/piece-sets';
import type { VisualPreferences } from '@/theme/visual-preferences';
import type { Piece } from '@/chess';

export interface SettingsPanelProps {
  readonly expanded: boolean;
  readonly onToggle: () => void;
  readonly visualPreferences: VisualPreferences;
  readonly onUpdatePreferences: (change: Partial<VisualPreferences>) => void;
}

// Sample chess showcase demonstrating all 6 piece types for white and black
const PREVIEW_BOARD: readonly (Piece | null)[] = [
  'r', 'n', 'b', 'q', 'k', 'p',
  'R', 'N', 'B', 'Q', 'K', 'P',
];

export function SettingsPanel({
  expanded,
  onToggle,
  visualPreferences,
  onUpdatePreferences,
}: SettingsPanelProps) {
  const router = useRouter();
  const [legalVisible, setLegalVisible] = useState(false);

  const activeTheme = boardThemeById(visualPreferences.boardTheme);
  const activePieceSet = pieceSetById(visualPreferences.pieceSet);

  return (
    <View style={styles.settingsPanel}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={({ pressed }) => [styles.settingsHeader, pressed && styles.pressed]}
      >
        <View>
          <Text selectable style={styles.profileTitle}>
            Ajustes y Apariencia
          </Text>
          <Text selectable style={styles.settingsSummary}>
            Tema del tablero, piezas y sonidos
          </Text>
        </View>
        <Text accessibilityElementsHidden style={styles.chevron}>
          {expanded ? '−' : '+'}
        </Text>
      </Pressable>
      {expanded ? (
        <Animated.View entering={FadeIn.duration(160)} style={styles.settingsBody}>
          {/* Visual Showcase / Live Preview */}
          <Text selectable style={styles.sectionHeading}>
            Vista Previa en Vivo
          </Text>
          <View
            style={[
              styles.previewContainer,
              { backgroundColor: activeTheme.frame, borderColor: activeTheme.frame },
            ]}
          >
            <View style={styles.previewBoard}>
              {PREVIEW_BOARD.map((piece, index) => {
                const row = Math.floor(index / 6);
                const col = index % 6;
                const isLight = (row + col) % 2 === 0;
                return (
                  <View
                    key={`${index}-${piece ?? 'empty'}`}
                    style={[
                      styles.previewSquare,
                      {
                        backgroundColor: isLight
                          ? activeTheme.lightSquare
                          : activeTheme.darkSquare,
                      },
                    ]}
                  >
                    {piece ? (
                      <ChessPieceView
                        piece={piece}
                        pieceSetId={activePieceSet.id}
                        size={38}
                      />
                    ) : null}
                  </View>
                );
              })}
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewName}>{activePieceSet.name}</Text>
              <Text style={styles.previewDesc}>{activePieceSet.description}</Text>
            </View>
          </View>

          {/* Piece Set Selector */}
          <Text selectable style={styles.settingsLabel}>
            Juego de Piezas
          </Text>
          <View style={styles.preferenceOptions}>
            {PIECE_SETS.map((set) => {
              const isSelected = activePieceSet.id === set.id || activePieceSet.canonicalId === set.id;
              return (
                <Pressable
                  key={set.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  onPress={() => onUpdatePreferences({ pieceSet: set.id })}
                  style={[
                    styles.preferenceOption,
                    styles.pieceSetOption,
                    isSelected && styles.preferenceOptionActive,
                  ]}
                >
                  <View style={styles.miniPieceIcon}>
                    <ChessPieceView piece="N" pieceSetId={set.id} size={28} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.preferenceText,
                        isSelected && styles.preferenceTextActive,
                      ]}
                    >
                      {set.name}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Board Theme Selector */}
          <Text selectable style={styles.settingsLabel}>
            Tema del Tablero
          </Text>
          <View style={styles.preferenceOptions}>
            {BOARD_THEMES.map((theme) => {
              const isSelected = visualPreferences.boardTheme === theme.id;
              return (
                <Pressable
                  key={theme.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  onPress={() => onUpdatePreferences({ boardTheme: theme.id })}
                  style={[
                    styles.preferenceOption,
                    isSelected && styles.preferenceOptionActive,
                  ]}
                >
                  <View style={styles.themeColorChip}>
                    <View
                      style={[
                        styles.chipSquare,
                        { backgroundColor: theme.lightSquare },
                      ]}
                    />
                    <View
                      style={[
                        styles.chipSquare,
                        { backgroundColor: theme.darkSquare },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.preferenceText,
                      isSelected && styles.preferenceTextActive,
                    ]}
                  >
                    {theme.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Sound Toggle */}
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: visualPreferences.soundsEnabled }}
            onPress={() =>
              onUpdatePreferences({ soundsEnabled: !visualPreferences.soundsEnabled })
            }
            style={styles.soundRow}
          >
            <Text selectable style={styles.settingsLabel}>
              Sonidos
            </Text>
            <Text selectable style={styles.soundValue}>
              {visualPreferences.soundsEnabled ? 'Activados' : 'Desactivados'}
            </Text>
          </Pressable>

          {/* Legal / Policy */}
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Abrir política de privacidad"
            onPress={() => router.push('/privacy' as never)}
            style={({ pressed }) => [styles.legalButton, pressed && styles.pressed]}
          >
            <Text style={styles.legalText}>Política de Privacidad</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setLegalVisible(true)}
            style={styles.licensesButton}
          >
            <Text style={styles.licensesText}>Licencias de Código Abierto</Text>
          </Pressable>
        </Animated.View>
      ) : null}

      <Modal
        visible={legalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setLegalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Privacidad y Licencias</Text>
          <ScrollView style={styles.modalScroll}>
            <Text style={styles.modalSubtitle}>Política de Privacidad</Text>
            <Text style={styles.modalParagraph}>
              AjedrezPro valora tu privacidad. Toda la información, estadísticas,
              nivel y progreso generados se almacenan exclusivamente de forma
              local en tu dispositivo. No requerimos la creación de cuentas, no
              enviamos datos de uso a servidores externos, no incluimos analíticas
              ni mostramos publicidad de terceros. No se comparten datos
              personales con ninguna entidad.
            </Text>

            <Text style={styles.modalSubtitle}>Licencias y Código Abierto</Text>
            <Text style={styles.modalParagraph}>
              Esta aplicación incluye el motor de ajedrez Stockfish para los análisis
              web y recursos gráficos vectoriales optimizados.
              {'\n\n'}
              Stockfish 16.1{'\n'}
              Copyright (C) 2008-2024 The Stockfish developers{'\n'}
              https://stockfishchess.org/ y https://github.com/official-stockfish/Stockfish
            </Text>
          </ScrollView>
          <Pressable
            style={styles.closeButton}
            onPress={() => setLegalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  settingsPanel: {
    backgroundColor: '#142019',
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#22362C',
    overflow: 'hidden',
  },
  settingsHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileTitle: {
    color: '#F4E9D0',
    fontSize: 18,
    fontWeight: '800',
  },
  settingsSummary: {
    color: '#8A9E93',
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    color: '#D6A943',
    fontSize: 22,
    fontWeight: '700',
  },
  settingsBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 14,
  },
  sectionHeading: {
    color: '#D6A943',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  previewContainer: {
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 2,
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
  },
  previewBoard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  previewSquare: {
    width: '16.666%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    backgroundColor: 'rgba(9, 19, 15, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  previewName: {
    color: '#F6E6BD',
    fontSize: 14,
    fontWeight: '800',
  },
  previewDesc: {
    color: '#A2B5AA',
    fontSize: 11,
    marginTop: 2,
  },
  settingsLabel: {
    color: '#E0E7E3',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  preferenceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferenceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: '#1B2C23',
    borderWidth: 1,
    borderColor: '#2A4235',
    gap: 8,
  },
  pieceSetOption: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  preferenceOptionActive: {
    backgroundColor: '#243C30',
    borderColor: '#D6A943',
  },
  miniPieceIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  themeColorChip: {
    flexDirection: 'row',
    width: 20,
    height: 20,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  chipSquare: {
    flex: 1,
    height: '100%',
  },
  preferenceText: {
    color: '#B7C7BF',
    fontSize: 12,
    fontWeight: '700',
  },
  preferenceTextActive: {
    color: '#F6E6BD',
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#22362C',
  },
  soundValue: {
    color: '#D6A943',
    fontSize: 13,
    fontWeight: '700',
  },
  legalButton: {
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1E3227',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2D4B3A',
  },
  legalText: {
    color: '#E0D0A8',
    fontSize: 13,
    fontWeight: '700',
  },
  licensesButton: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  licensesText: {
    color: '#8A9E93',
    fontSize: 11,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0E1712',
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    color: '#F4E9D0',
    fontSize: 22,
    fontWeight: '900',
  },
  modalScroll: {
    flex: 1,
  },
  modalSubtitle: {
    color: '#D6A943',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  modalParagraph: {
    color: '#C2D1C8',
    fontSize: 13,
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: '#22362C',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#F4E9D0',
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.78,
  },
});
