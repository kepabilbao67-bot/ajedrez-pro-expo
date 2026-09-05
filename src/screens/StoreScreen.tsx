import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useCosmetics } from '@/hooks/use-cosmetics';
import type { CosmeticCategory, CosmeticItem } from '@/cosmetics/cosmetics-types';
import { ChessBoard } from '@/components/chess-board';
import { boardThemeById, type BoardThemeId } from '@/board-themes/board-themes';
import { pieceSetById, type PieceSetId } from '@/board-themes/piece-sets';
import { ChessGame } from '@/chess';
import { APP_COLORS } from '@/theme/colors';

const PREVIEW_GAME = new ChessGame();

export function StoreScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const {
    inventory,
    loading,
    getCosmeticsByCategory,
    buyItem,
    equipItem,
    isItemOwned,
    isItemEquipped,
  } = useCosmetics();

  const [activeCategory, setActiveCategory] = useState<CosmeticCategory>('boards');
  const [previewItem, setPreviewItem] = useState<CosmeticItem | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_COLORS.blueElectric} />
        <Text style={styles.loadingText}>Cargando Tienda AjedrezPro...</Text>
      </View>
    );
  }

  const items = getCosmeticsByCategory(activeCategory);
  const currentPreview = previewItem ?? items[0] ?? null;

  const previewBoardTheme: BoardThemeId =
    currentPreview?.category === 'boards'
      ? (currentPreview.previewAsset as BoardThemeId)
      : (inventory.equippedBoardId.replace('board_', '') as BoardThemeId) || 'classic';

  const previewPieceSet: PieceSetId =
    currentPreview?.category === 'pieces'
      ? (currentPreview.previewAsset as PieceSetId)
      : (inventory.equippedPieceSetId.replace('piece_', '') as PieceSetId) || 'staunton';

  const boardSize = Math.min(width - 32, 280);

  const handleBuy = async (item: CosmeticItem) => {
    setBuyingId(item.id);
    const result = await buyItem(item.id);
    setBuyingId(null);

    if (result.success) {
      Alert.alert(
        '¡Compra Exitosa!',
        `Has adquirido ${item.name}. ¿Deseas equiparlo ahora?`,
        [
          { text: 'Más tarde', style: 'cancel' },
          {
            text: 'Equipar ya',
            onPress: () => {
              void equipItem(item.category, item.id);
            },
          },
        ]
      );
    } else {
      Alert.alert('No se pudo completar la compra', result.error ?? 'Error desconocido');
    }
  };

  const handleEquip = async (item: CosmeticItem) => {
    await equipItem(item.category, item.id);
  };

  return (
    <View style={styles.container}>
      {/* TOP HEADER */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver al menú"
          onPress={() => router.replace('/')}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <Text style={styles.backBtnText}>‹ Menú</Text>
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>TIENDA AJEDREZPRO</Text>
          <Text style={styles.headerSubtitle}>Cosméticos & Personalización</Text>
        </View>
        <View style={styles.coinsBadge}>
          <Text style={styles.coinsIcon}>👑</Text>
          <Text style={styles.coinsValue}>{inventory.coins.toLocaleString()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* INTERACTIVE PREVIEW CARD */}
        <Animated.View entering={FadeInDown.duration(200)} style={styles.previewCard}>
          <Text style={styles.previewCardTitle}>PREVISUALIZACIÓN EN VIVO</Text>
          <View style={styles.previewBoardWrapper}>
            <ChessBoard
              position={PREVIEW_GAME.getPosition()}
              size={boardSize}
              selected={null}
              legalMoves={[]}
              flipped={false}
              disabled={true}
              lastMove={null}
              inCheck={false}
              boardTheme={boardThemeById(previewBoardTheme)}
              pieceSet={pieceSetById(previewPieceSet)}
              onSquarePress={() => {}}
            />
          </View>
          {currentPreview && (
            <View style={styles.previewMetaRow}>
              <View style={styles.previewMetaCol}>
                <Text style={styles.previewItemName}>{currentPreview.name}</Text>
                <Text style={styles.previewItemDesc}>{currentPreview.description}</Text>
              </View>
              <View
                style={[
                  styles.rarityPill,
                  currentPreview.rarity === 'campeon' && styles.rarityChampion,
                  currentPreview.rarity === 'legendario' && styles.rarityLegendary,
                  currentPreview.rarity === 'epico' && styles.rarityEpic,
                ]}
              >
                <Text style={styles.rarityPillText}>{currentPreview.rarity.toUpperCase()}</Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* CATEGORY SELECTOR TABS */}
        <View style={styles.categoryTabs}>
          {(['boards', 'pieces', 'avatars', 'frames'] as const).map((cat) => {
            const labels: Record<CosmeticCategory, string> = {
              boards: 'Tableros',
              pieces: 'Piezas',
              avatars: 'Avatares',
              frames: 'Marcos',
              effects: 'Efectos',
            };
            const icons: Record<CosmeticCategory, string> = {
              boards: '🔷',
              pieces: '♞',
              avatars: '👤',
              frames: '🖼️',
              effects: '✨',
            };
            const isActive = activeCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => {
                  setActiveCategory(cat);
                  const firstInCat = getCosmeticsByCategory(cat)[0];
                  if (firstInCat) setPreviewItem(firstInCat);
                }}
                style={[styles.categoryTabBtn, isActive && styles.categoryTabBtnActive]}
              >
                <Text style={styles.categoryTabIcon}>{icons[cat]}</Text>
                <Text style={[styles.categoryTabLabel, isActive && styles.categoryTabLabelActive]}>
                  {labels[cat]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* CATALOG ITEMS LIST */}
        <Animated.View entering={FadeIn.duration(200)} style={styles.itemsGrid}>
          {items.map((item) => {
            const owned = isItemOwned(item.id);
            const equipped = isItemEquipped(item.category, item.id);
            const isSelected = currentPreview?.id === item.id;
            const canAfford = inventory.coins >= item.priceCoins;

            return (
              <Pressable
                key={item.id}
                onPress={() => setPreviewItem(item)}
                style={[
                  styles.itemCard,
                  isSelected && styles.itemCardSelected,
                  equipped && styles.itemCardEquipped,
                ]}
              >
                <View style={styles.itemHeader}>
                  <Text style={styles.itemIcon}>{item.icon}</Text>
                  <View
                    style={[
                      styles.itemRarityBadge,
                      item.rarity === 'campeon' && styles.rarityChampion,
                      item.rarity === 'legendario' && styles.rarityLegendary,
                      item.rarity === 'epico' && styles.rarityEpic,
                    ]}
                  >
                    <Text style={styles.itemRarityText}>{item.rarity.toUpperCase()}</Text>
                  </View>
                </View>

                <Text numberOfLines={1} style={styles.itemName}>
                  {item.name}
                </Text>
                <Text numberOfLines={2} style={styles.itemDesc}>
                  {item.description}
                </Text>

                {/* ACTION BUTTON / PRICE ROW */}
                <View style={styles.itemActionRow}>
                  {equipped ? (
                    <View style={styles.equippedBadge}>
                      <Text style={styles.equippedBadgeText}>✓ EQUIPADO</Text>
                    </View>
                  ) : owned ? (
                    <Pressable
                      onPress={() => void handleEquip(item)}
                      style={({ pressed }) => [styles.equipBtn, pressed && styles.pressed]}
                    >
                      <Text style={styles.equipBtnText}>EQUIPAR</Text>
                    </Pressable>
                  ) : item.isAchievementExclusive ? (
                    <View style={styles.achievementLockBadge}>
                      <Text style={styles.achievementLockText}>🏆 LOGRO EXCLUSIVO</Text>
                    </View>
                  ) : (
                    <Pressable
                      disabled={!canAfford || buyingId === item.id}
                      onPress={() => void handleBuy(item)}
                      style={({ pressed }) => [
                        styles.buyBtn,
                        !canAfford && styles.buyBtnDisabled,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.buyBtnText}>
                        {buyingId === item.id ? 'Comprando…' : `👑 ${item.priceCoins}`}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </Pressable>
            );
          })}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070C12',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#070C12',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94AEC5',
    fontSize: 15,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: '#0A121C',
    borderBottomWidth: 1,
    borderBottomColor: '#1E2D3E',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#162230',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#00E5FF',
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  headerSubtitle: {
    color: '#F5C518',
    fontSize: 11,
    fontWeight: '700',
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#152436',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F5C51866',
    gap: 4,
  },
  coinsIcon: {
    fontSize: 14,
  },
  coinsValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  previewCard: {
    backgroundColor: '#0E1724',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E3247',
    alignItems: 'center',
    gap: 10,
  },
  previewCardTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  previewBoardWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1E2C3D',
  },
  previewMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 6,
  },
  previewMetaCol: {
    flex: 1,
  },
  previewItemName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  previewItemDesc: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  rarityPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rarityEpic: {
    backgroundColor: '#7C3AED',
  },
  rarityLegendary: {
    backgroundColor: '#D97706',
  },
  rarityChampion: {
    backgroundColor: '#F5C518',
  },
  rarityPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  categoryTabs: {
    flexDirection: 'row',
    backgroundColor: '#0A121C',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  categoryTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    gap: 2,
  },
  categoryTabBtnActive: {
    backgroundColor: '#172738',
  },
  categoryTabIcon: {
    fontSize: 16,
  },
  categoryTabLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  categoryTabLabelActive: {
    color: '#00E5FF',
  },
  itemsGrid: {
    gap: 10,
  },
  itemCard: {
    backgroundColor: '#0E1724',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1A293B',
    gap: 6,
  },
  itemCardSelected: {
    borderColor: '#00E5FF',
    backgroundColor: '#111F30',
  },
  itemCardEquipped: {
    borderColor: '#F5C51888',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemIcon: {
    fontSize: 24,
  },
  itemRarityBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemRarityText: {
    color: '#CBD5E1',
    fontSize: 8,
    fontWeight: '800',
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  itemDesc: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 15,
  },
  itemActionRow: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  equippedBadge: {
    backgroundColor: 'rgba(245, 197, 24, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F5C518',
  },
  equippedBadgeText: {
    color: '#F5C518',
    fontSize: 11,
    fontWeight: '900',
  },
  equipBtn: {
    backgroundColor: '#1E2F44',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00E5FF88',
  },
  equipBtnText: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '900',
  },
  buyBtn: {
    backgroundColor: '#F5C518',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buyBtnDisabled: {
    backgroundColor: '#334155',
  },
  buyBtnText: {
    color: '#070C12',
    fontSize: 12,
    fontWeight: '900',
  },
  achievementLockBadge: {
    backgroundColor: '#1C1917',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#78716C',
  },
  achievementLockText: {
    color: '#A8A29E',
    fontSize: 10,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
