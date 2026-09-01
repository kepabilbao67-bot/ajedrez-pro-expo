import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ChessGame, type Position } from '@/chess';
import { ChessBoard } from '@/components/chess-board';
import {
  OPENINGS_DATABASE,
  searchOpenings,
  type OpeningFamily,
  type OpeningVariant,
} from '@/services/openingBook';
import { useVisualPreferences } from '@/hooks/use-visual-preferences';
import { useHaptics } from '@/hooks/use-haptics';
import { APP_COLORS } from '@/theme/colors';

export function OpeningsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { boardTheme, pieceSet } = useVisualPreferences();
  const { hapticMove } = useHaptics();

  const [selectedOpening, setSelectedOpening] = useState<OpeningVariant>(OPENINGS_DATABASE[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<OpeningFamily | 'all'>('all');

  const buildOpeningPosition = (moves: readonly string[]): { game: ChessGame; position: Position } => {
    const game = new ChessGame();
    for (const moveSan of moves) {
      const legal = game.legalMoves();
      for (const m of legal) {
        const testGame = new ChessGame(game.fen());
        const record = testGame.move(m);
        if (record && record.san.replace(/[+#]$/, '') === moveSan.replace(/[+#]$/, '')) {
          game.move(m);
          break;
        }
      }
    }
    return { game, position: game.getPosition() };
  };

  const { position } = buildOpeningPosition(selectedOpening.moves);

  const availableWidth = width - 28;
  const boardSize = Math.min(Math.max(availableWidth, 240), 360);

  const filteredOpenings = searchOpenings(
    searchQuery,
    selectedFamily === 'all' ? undefined : selectedFamily
  );

  const handleSelectOpening = (opening: OpeningVariant) => {
    hapticMove();
    setSelectedOpening(opening);
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Enciclopedia ECO</Text>
          <View style={styles.ecoBadge}>
            <Text style={styles.ecoBadgeText}>{selectedOpening.eco}</Text>
          </View>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Buscar por nombre, código ECO (B90, C50...) o variante"
            placeholderTextColor={APP_COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {/* FAMILY FILTER CHIPS */}
        <View style={styles.familyFilterRow}>
          {[
            { id: 'all', label: 'Todas' },
            { id: 'e4', label: '1.e4 Peón Rey' },
            { id: 'd4', label: '1.d4 Peón Dama' },
            { id: 'flank', label: 'Flanco / Réti' },
          ].map((f) => (
            <Pressable
              key={f.id}
              accessibilityRole="button"
              onPress={() => setSelectedFamily(f.id as any)}
              style={[styles.filterChip, selectedFamily === f.id && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, selectedFamily === f.id && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ACTIVE OPENING CARD & BOARD */}
        <Animated.View entering={FadeInDown.duration(200)} style={styles.activeCard}>
          <View style={styles.openingHeaderRow}>
            <View style={styles.openingTitleCol}>
              <Text style={styles.activeOpeningTitle}>{selectedOpening.name}</Text>
              <Text style={styles.activeOpeningFamily}>{selectedOpening.familyLabel}</Text>
            </View>
            <View style={styles.ecoCodeBox}>
              <Text style={styles.ecoCodeText}>{selectedOpening.eco}</Text>
            </View>
          </View>

          {/* BOARD PREVIEW */}
          <View style={styles.boardWrapper}>
            <ChessBoard
              position={position}
              size={boardSize}
              selected={null}
              legalMoves={[]}
              flipped={false}
              disabled
              lastMove={null}
              inCheck={false}
              boardTheme={boardTheme}
              pieceSet={pieceSet}
              onSquarePress={() => {}}
            />
          </View>

          {/* MOVE SEQUENCE CHIPS */}
          <View style={styles.movesSequenceBox}>
            <Text style={styles.movesSequenceTitle}>Secuencia de Jugadas Teóricas:</Text>
            <View style={styles.movesChipsRow}>
              {selectedOpening.moves.map((san, index) => {
                const moveNum = Math.floor(index / 2) + 1;
                const isWhite = index % 2 === 0;
                return (
                  <View key={`${san}-${index}`} style={styles.moveChip}>
                    <Text style={styles.moveChipText}>
                      {isWhite ? `${moveNum}. ${san}` : san}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* DESCRIPTION */}
          <Text style={styles.openingDescription}>{selectedOpening.description}</Text>

          {/* STRATEGIC IDEAS */}
          <View style={styles.strategicIdeasBox}>
            <Text style={styles.strategicIdeasTitle}>💡 Planes Estratégicos Principales:</Text>
            {selectedOpening.strategicIdeas.map((idea, i) => (
              <View key={i} style={styles.ideaItem}>
                <Text style={styles.ideaDot}>•</Text>
                <Text style={styles.ideaText}>{idea}</Text>
              </View>
            ))}
          </View>

          {/* KEY SQUARES */}
          <View style={styles.keySquaresRow}>
            <Text style={styles.keySquaresTitle}>Casillas clave de lucha:</Text>
            {selectedOpening.keySquares.map((sq) => (
              <View key={sq} style={styles.keySquareBadge}>
                <Text style={styles.keySquareBadgeText}>{sq}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* OPENINGS LIST ACCORDION */}
        <View style={styles.listSection}>
          <Text style={styles.listSectionTitle}>
            Aperturas Disponibles ({filteredOpenings.length})
          </Text>

          <View style={styles.openingsList}>
            {filteredOpenings.map((op) => (
              <Pressable
                key={`${op.eco}-${op.name}`}
                accessibilityRole="button"
                onPress={() => handleSelectOpening(op)}
                style={({ pressed }) => [
                  styles.openingListItem,
                  selectedOpening.eco === op.eco && selectedOpening.name === op.name && styles.openingListItemActive,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.listItemLeft}>
                  <View style={styles.itemEcoBadge}>
                    <Text style={styles.itemEcoText}>{op.eco}</Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{op.name}</Text>
                    <Text style={styles.itemMoves}>{op.moves.slice(0, 4).join(' ')}...</Text>
                  </View>
                </View>
                <Text style={styles.itemArrow}>→</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: APP_COLORS.background },
  container: { padding: 14, alignItems: 'center', gap: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 440,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  backButtonText: { color: APP_COLORS.blueElectric, fontSize: 13, fontWeight: '800' },
  headerTitle: { color: APP_COLORS.goldBright, fontSize: 18, fontWeight: '900' },
  ecoBadge: {
    backgroundColor: APP_COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: APP_COLORS.borderGold,
  },
  ecoBadgeText: { color: APP_COLORS.goldBright, fontSize: 12, fontWeight: '900' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 440,
    backgroundColor: APP_COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  searchIcon: { fontSize: 14 },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    padding: 0,
  },
  familyFilterRow: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
    maxWidth: 440,
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: APP_COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  filterChipActive: { backgroundColor: APP_COLORS.blueElectric, borderColor: APP_COLORS.blueElectric },
  filterChipText: { color: APP_COLORS.textMuted, fontSize: 11, fontWeight: '800' },
  filterChipTextActive: { color: '#070B0E', fontWeight: '900' },
  activeCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: APP_COLORS.borderGold,
    gap: 12,
  },
  openingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  openingTitleCol: { flex: 1, paddingRight: 8 },
  activeOpeningTitle: { color: APP_COLORS.goldBright, fontSize: 17, fontWeight: '900' },
  activeOpeningFamily: { color: APP_COLORS.blueElectric, fontSize: 11, fontWeight: '800', marginTop: 2 },
  ecoCodeBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: APP_COLORS.borderGold,
  },
  ecoCodeText: { color: APP_COLORS.goldBright, fontSize: 13, fontWeight: '900' },
  boardWrapper: { alignItems: 'center', justifyContent: 'center', marginVertical: 4 },
  movesSequenceBox: { gap: 6 },
  movesSequenceTitle: { color: APP_COLORS.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  movesChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  moveChip: {
    backgroundColor: APP_COLORS.surfaceStrong,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  moveChipText: { color: APP_COLORS.goldBright, fontSize: 11, fontWeight: '800' },
  openingDescription: { color: APP_COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
  strategicIdeasBox: {
    backgroundColor: APP_COLORS.surfaceStrong,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    gap: 6,
  },
  strategicIdeasTitle: { color: APP_COLORS.goldBright, fontSize: 12, fontWeight: '800' },
  ideaItem: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  ideaDot: { color: APP_COLORS.blueElectric, fontSize: 14, lineHeight: 16 },
  ideaText: { color: APP_COLORS.textSecondary, fontSize: 12, lineHeight: 17, flex: 1 },
  keySquaresRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  keySquaresTitle: { color: APP_COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  keySquareBadge: {
    backgroundColor: APP_COLORS.surfaceStrong,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: APP_COLORS.borderBlue,
  },
  keySquareBadgeText: { color: APP_COLORS.blueElectric, fontSize: 10, fontWeight: '900' },
  listSection: { width: '100%', maxWidth: 440, gap: 10 },
  listSectionTitle: { color: APP_COLORS.goldBright, fontSize: 14, fontWeight: '900' },
  openingsList: { gap: 8 },
  openingListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: APP_COLORS.surface,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  openingListItemActive: { borderColor: APP_COLORS.goldPrimary, backgroundColor: 'rgba(229, 184, 105, 0.1)' },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  itemEcoBadge: {
    backgroundColor: APP_COLORS.surfaceStrong,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: APP_COLORS.borderGold,
  },
  itemEcoText: { color: APP_COLORS.goldBright, fontSize: 11, fontWeight: '900' },
  itemInfo: { flex: 1, gap: 2 },
  itemTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  itemMoves: { color: APP_COLORS.textSecondary, fontSize: 11 },
  itemArrow: { color: APP_COLORS.blueElectric, fontSize: 14, fontWeight: '900' },
  pressed: { opacity: 0.8 },
});
