import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { BOARD_THEMES } from '@/board-themes/board-themes';
import { PIECE_SETS } from '@/board-themes/piece-sets';
import type { VisualPreferences } from '@/theme/visual-preferences';

export interface SettingsPanelProps {
  readonly expanded: boolean;
  readonly onToggle: () => void;
  readonly visualPreferences: VisualPreferences;
  readonly onUpdatePreferences: (change: Partial<VisualPreferences>) => void;
}

export function SettingsPanel({ expanded, onToggle, visualPreferences, onUpdatePreferences }: SettingsPanelProps) {
  const router = useRouter();
  const [legalVisible, setLegalVisible] = useState(false);

  return (
    <View style={styles.settingsPanel}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={({ pressed }) => [styles.settingsHeader, pressed && styles.pressed]}
      >
        <View>
          <Text selectable style={styles.profileTitle}>Ajustes</Text>
          <Text selectable style={styles.settingsSummary}>Tema, piezas y sonidos</Text>
        </View>
        <Text accessibilityElementsHidden style={styles.chevron}>{expanded ? '−' : '+'}</Text>
      </Pressable>
      {expanded ? (
        <Animated.View entering={FadeIn.duration(160)} style={styles.settingsBody}>
          <Text selectable style={styles.settingsLabel}>Tema del tablero</Text>
          <View style={styles.preferenceOptions}>
            {BOARD_THEMES.map((theme) => (
              <Pressable key={theme.id} accessibilityRole="radio" accessibilityState={{ checked: visualPreferences.boardTheme === theme.id }} onPress={() => onUpdatePreferences({ boardTheme: theme.id })} style={[styles.preferenceOption, visualPreferences.boardTheme === theme.id && styles.preferenceOptionActive]}>
                <Text style={[styles.preferenceText, visualPreferences.boardTheme === theme.id && styles.preferenceTextActive]}>{theme.name}</Text>
              </Pressable>
            ))}
          </View>
          <Text selectable style={styles.settingsLabel}>Piezas</Text>
          <View style={styles.preferenceOptions}>
            {PIECE_SETS.map((set) => (
              <Pressable key={set.id} accessibilityRole="radio" accessibilityState={{ checked: visualPreferences.pieceSet === set.id }} onPress={() => onUpdatePreferences({ pieceSet: set.id })} style={[styles.preferenceOption, visualPreferences.pieceSet === set.id && styles.preferenceOptionActive]}>
                <Text style={[styles.preferenceText, visualPreferences.pieceSet === set.id && styles.preferenceTextActive]}>{set.name}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable accessibilityRole="switch" accessibilityState={{ checked: visualPreferences.soundsEnabled }} onPress={() => onUpdatePreferences({ soundsEnabled: !visualPreferences.soundsEnabled })} style={styles.soundRow}>
            <Text selectable style={styles.settingsLabel}>Sonidos</Text>
            <Text selectable style={styles.soundValue}>{visualPreferences.soundsEnabled ? 'Activados' : 'Desactivados'}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Abrir política de privacidad"
            onPress={() => router.push('/privacy' as never)}
            style={({ pressed }) => [styles.legalButton, pressed && styles.pressed]}
          >
            <Text style={styles.legalText}>Política de Privacidad</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => setLegalVisible(true)} style={styles.licensesButton}>
            <Text style={styles.licensesText}>Licencias de Código Abierto</Text>
          </Pressable>
        </Animated.View>
      ) : null}

      <Modal visible={legalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setLegalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Privacidad y Licencias</Text>
          <ScrollView style={styles.modalScroll}>
            <Text style={styles.modalSubtitle}>Política de Privacidad</Text>
            <Text style={styles.modalParagraph}>
              AjedrezPro valora tu privacidad. Toda la información, estadísticas, nivel y progreso generados se almacenan exclusivamente de forma local en tu dispositivo.
              No requerimos la creación de cuentas, no enviamos datos de uso a servidores externos, no incluimos analíticas ni mostramos publicidad de terceros.
              No se comparten datos personales con ninguna entidad.
            </Text>

            <Text style={styles.modalSubtitle}>Licencias y Código Abierto</Text>
            <Text style={styles.modalParagraph}>
              Esta aplicación incluye el motor de ajedrez Stockfish para los análisis web.
              Stockfish es software libre y de código abierto (GPLv3).
              {'\n\n'}
              Stockfish 16.1{'\n'}
              Copyright (C) 2008-2024 The Stockfish developers{'\n'}
              Puedes obtener el código fuente y más información en:{'\n'}
              https://stockfishchess.org/ y https://github.com/official-stockfish/Stockfish
            </Text>
          </ScrollView>
          <Pressable style={styles.closeButton} onPress={() => setLegalVisible(false)}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  settingsPanel: { width: '100%', maxWidth: 440, overflow: 'hidden', borderRadius: 18, borderCurve: 'continuous', backgroundColor: '#14241D', borderWidth: 1, borderColor: '#294235' },
  settingsHeader: { minHeight: 64, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileTitle: { color: '#F5C451', fontSize: 13, fontWeight: '900' },
  settingsSummary: { color: '#9EAFA5', fontSize: 12, paddingTop: 3 },
  chevron: { color: '#F5C451', fontSize: 28, fontWeight: '300' },
  settingsBody: { gap: 9, borderTopWidth: 1, borderTopColor: '#294235', padding: 14 },
  settingsLabel: { color: '#D6E0DA', fontSize: 13, fontWeight: '800' },
  preferenceOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  preferenceOption: { minHeight: 38, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderCurve: 'continuous', backgroundColor: '#22362C', borderWidth: 1, borderColor: '#3B5A49' },
  preferenceOptionActive: { backgroundColor: '#D6A943', borderColor: '#D6A943' },
  preferenceText: { color: '#C5D0C9', fontSize: 12, fontWeight: '800' },
  preferenceTextActive: { color: '#162019' },
  soundRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderRadius: 11, borderCurve: 'continuous', backgroundColor: '#22362C' },
  soundValue: { color: '#F6E6BD', fontSize: 12, fontWeight: '900' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  legalButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 8, borderRadius: 11, backgroundColor: '#1B3025', borderWidth: 1, borderColor: '#294235' },
  legalText: { color: '#F6E6BD', fontSize: 13, fontWeight: '800' },
  licensesButton: { minHeight: 40, alignItems: 'center', justifyContent: 'center', marginTop: 4, borderRadius: 11, backgroundColor: '#16241C' },
  licensesText: { color: '#9EAFA5', fontSize: 12, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: '#09130f', padding: 24, paddingTop: 48 },
  modalTitle: { color: '#F6E6BD', fontSize: 24, fontWeight: '900', marginBottom: 16 },
  modalScroll: { flex: 1 },
  modalSubtitle: { color: '#F5C451', fontSize: 16, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  modalParagraph: { color: '#C5D0C9', fontSize: 14, lineHeight: 22 },
  closeButton: { marginTop: 24, paddingVertical: 16, backgroundColor: '#D6A943', borderRadius: 16, alignItems: 'center' },
  closeButtonText: { color: '#162019', fontSize: 16, fontWeight: '900' },
});
