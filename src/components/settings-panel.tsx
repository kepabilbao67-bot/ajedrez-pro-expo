import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { BOARD_THEMES, boardThemeById } from '@/board-themes/board-themes';
import { PIECE_SETS, pieceSetById, ChessPieceView } from '@/board-themes/piece-sets';
import type { VisualPreferences } from '@/theme/visual-preferences';
import type { Piece } from '@/chess';
import { APP_COLORS } from '@/theme/colors';

export interface SettingsPanelProps {
  readonly expanded: boolean;
  readonly onToggle: () => void;
  readonly visualPreferences: VisualPreferences;
  readonly onUpdatePreferences: (change: Partial<VisualPreferences>) => void;
}

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
            Ajustes & Apariencia
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

          {/* PIECE SET SELECTOR */}
          <Text selectable style={styles.sectionHeading}>
            Colección de Piezas
          </Text>
          <View style={styles.pieceSetRow}>
            {PIECE_SETS.map((set) => {
              const isSelected = activePieceSet.id === set.id;
              return (
                <Pressable
                  key={set.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  onPress={() => onUpdatePreferences({ pieceSet: set.id })}
                  style={[
                    styles.pieceSetCard,
                    isSelected && styles.pieceSetCardSelected,
                  ]}
                >
                  <View style={styles.pieceSetPreviewIcon}>
                    <ChessPieceView piece="N" pieceSetId={set.id} size={32} />
                    <ChessPieceView piece="n" pieceSetId={set.id} size={32} />
                  </View>
                  <Text style={[styles.pieceSetName, isSelected && styles.pieceSetNameSelected]}>
                    {set.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* BOARD THEMES SELECTOR */}
          <Text selectable style={styles.sectionHeading}>
            Temas de Tablero
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.themesList}
          >
            {BOARD_THEMES.map((theme) => {
              const isSelected = activeTheme.id === theme.id;
              return (
                <Pressable
                  key={theme.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  onPress={() => onUpdatePreferences({ boardTheme: theme.id })}
                  style={[
                    styles.themeCard,
                    isSelected && styles.themeCardSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.themePreviewBox,
                      { borderColor: theme.frame },
                    ]}
                  >
                    <View style={[styles.miniSquare, { backgroundColor: theme.lightSquare }]} />
                    <View style={[styles.miniSquare, { backgroundColor: theme.darkSquare }]} />
                    <View style={[styles.miniSquare, { backgroundColor: theme.darkSquare }]} />
                    <View style={[styles.miniSquare, { backgroundColor: theme.lightSquare }]} />
                  </View>
                  <Text numberOfLines={1} style={[styles.themeCardName, isSelected && styles.themeCardNameSelected]}>
                    {theme.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* TOGGLES: SOUNDS & HAPTICS */}
          <Text selectable style={styles.sectionHeading}>
            Efectos y Respuesta
          </Text>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleTitle}>Efectos de Sonido Hi-Fi</Text>
              <Text style={styles.toggleSubtitle}>Movimientos, capturas, jaque y victoria</Text>
            </View>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: visualPreferences.soundsEnabled }}
              onPress={() => onUpdatePreferences({ soundsEnabled: !visualPreferences.soundsEnabled })}
              style={[styles.switchTrack, visualPreferences.soundsEnabled && styles.switchTrackActive]}
            >
              <View style={[styles.switchThumb, visualPreferences.soundsEnabled && styles.switchThumbActive]} />
            </Pressable>
          </View>

          {/* PRIVACY POLICY BUTTON */}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/privacy' as never)}
            style={({ pressed }) => [styles.legalButton, pressed && styles.pressed]}
          >
            <Text style={styles.legalButtonText}>Política de Privacidad y Términos Legales</Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  settingsPanel: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 18,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    padding: 16,
    gap: 12,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileTitle: {
    color: APP_COLORS.goldBright,
    fontSize: 14,
    fontWeight: '900',
  },
  settingsSummary: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
  },
  chevron: {
    color: APP_COLORS.goldBright,
    fontSize: 22,
    fontWeight: '900',
  },
  settingsBody: {
    gap: 12,
    paddingTop: 8,
  },
  sectionHeading: {
    color: APP_COLORS.blueElectric,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  previewContainer: {
    borderRadius: 14,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: APP_COLORS.surfaceStrong,
  },
  previewBoard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: 76,
  },
  previewSquare: {
    width: '16.666%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    padding: 10,
    backgroundColor: 'rgba(7, 11, 14, 0.85)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  previewName: {
    color: APP_COLORS.goldBright,
    fontSize: 12,
    fontWeight: '900',
  },
  previewDesc: {
    color: APP_COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  pieceSetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pieceSetCard: {
    flex: 1,
    padding: 10,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: APP_COLORS.surfaceStrong,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    gap: 6,
  },
  pieceSetCardSelected: {
    borderColor: APP_COLORS.goldPrimary,
    backgroundColor: 'rgba(229, 184, 105, 0.1)',
  },
  pieceSetPreviewIcon: {
    flexDirection: 'row',
    gap: 2,
  },
  pieceSetName: {
    color: APP_COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  pieceSetNameSelected: {
    color: APP_COLORS.goldBright,
  },
  themesList: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  themeCard: {
    width: 90,
    padding: 8,
    borderRadius: 12,
    backgroundColor: APP_COLORS.surfaceStrong,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    gap: 6,
  },
  themeCardSelected: {
    borderColor: APP_COLORS.blueElectric,
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
  },
  themePreviewBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  miniSquare: {
    width: 20,
    height: 20,
  },
  themeCardName: {
    color: APP_COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  themeCardNameSelected: {
    color: APP_COLORS.blueElectric,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  toggleTitle: {
    color: APP_COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },
  toggleSubtitle: {
    color: APP_COLORS.textMuted,
    fontSize: 11,
  },
  switchTrack: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: APP_COLORS.surfaceStrong,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: APP_COLORS.goldPrimary,
    borderColor: APP_COLORS.goldBright,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
    backgroundColor: '#070B0E',
  },
  legalButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  legalButtonText: {
    color: APP_COLORS.textMuted,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.75,
  },
});
