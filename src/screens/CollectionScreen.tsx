import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useCosmetics } from '@/hooks/use-cosmetics';
import type { CosmeticCategory, CosmeticItem } from '@/cosmetics/cosmetics-types';
import { APP_COLORS } from '@/theme/colors';

export function CollectionScreen() {
  const router = useRouter();
  const {
    loading,
    getCosmeticsByCategory,
    equipItem,
    isItemOwned,
    isItemEquipped,
  } = useCosmetics();

  const [activeCategory, setActiveCategory] = useState<CosmeticCategory>('boards');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_COLORS.blueElectric} />
        <Text style={styles.loadingText}>Cargando Mi Colección...</Text>
      </View>
    );
  }

  const allBoards = getCosmeticsByCategory('boards');
  const allPieces = getCosmeticsByCategory('pieces');
  const allAvatars = getCosmeticsByCategory('avatars');
  const allFrames = getCosmeticsByCategory('frames');

  const ownedBoardsCount = allBoards.filter((b) => isItemOwned(b.id)).length;
  const ownedPiecesCount = allPieces.filter((p) => isItemOwned(p.id)).length;
  const ownedAvatarsCount = allAvatars.filter((a) => isItemOwned(a.id)).length;
  const ownedFramesCount = allFrames.filter((f) => isItemOwned(f.id)).length;

  const currentCategoryItems = getCosmeticsByCategory(activeCategory);

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
          <Text style={styles.headerTitle}>MI COLECCIÓN</Text>
          <Text style={styles.headerSubtitle}>Tus Cosméticos & Estilos</Text>
        </View>
        <Pressable
          onPress={() => router.push('/store' as never)}
          style={styles.storeShortcutBtn}
        >
          <Text style={styles.storeShortcutText}>🛒 Tienda</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* SUMMARY TILES */}
        <Animated.View entering={FadeInDown.duration(200)} style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{ownedBoardsCount}/{allBoards.length}</Text>
            <Text style={styles.statLabel}>Tableros</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{ownedPiecesCount}/{allPieces.length}</Text>
            <Text style={styles.statLabel}>Piezas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{ownedAvatarsCount}/{allAvatars.length}</Text>
            <Text style={styles.statLabel}>Avatares</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{ownedFramesCount}/{allFrames.length}</Text>
            <Text style={styles.statLabel}>Marcos</Text>
          </View>
        </Animated.View>

        {/* CATEGORY TABS */}
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
                onPress={() => setActiveCategory(cat)}
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

        {/* ITEMS LIST */}
        <Animated.View entering={FadeIn.duration(200)} style={styles.itemsList}>
          {currentCategoryItems.map((item) => {
            const owned = isItemOwned(item.id);
            const equipped = isItemEquipped(item.category, item.id);

            return (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  !owned && styles.itemCardLocked,
                  equipped && styles.itemCardEquipped,
                ]}
              >
                <View style={styles.itemMainRow}>
                  <Text style={[styles.itemIcon, !owned && styles.lockedIcon]}>{item.icon}</Text>
                  <View style={styles.itemMeta}>
                    <Text style={[styles.itemName, !owned && styles.lockedText]}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemDesc}>{item.description}</Text>
                  </View>
                </View>

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
                  ) : (
                    <Pressable
                      onPress={() => router.push('/store' as never)}
                      style={({ pressed }) => [styles.storeBtn, pressed && styles.pressed]}
                    >
                      <Text style={styles.storeBtnText}>🔒 Desbloquear en Tienda</Text>
                    </Pressable>
                  )}
                </View>
              </View>
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
  storeShortcutBtn: {
    backgroundColor: '#162230',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00E5FF44',
  },
  storeShortcutText: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#0E1724',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E3247',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  statLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#1E2D3E',
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
  itemsList: {
    gap: 10,
  },
  itemCard: {
    backgroundColor: '#0E1724',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1A293B',
    gap: 10,
  },
  itemCardLocked: {
    opacity: 0.65,
    backgroundColor: '#0A1017',
  },
  itemCardEquipped: {
    borderColor: '#F5C518',
    backgroundColor: '#101B29',
  },
  itemMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIcon: {
    fontSize: 28,
  },
  lockedIcon: {
    opacity: 0.4,
  },
  itemMeta: {
    flex: 1,
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  lockedText: {
    color: '#94A3B8',
  },
  itemDesc: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  itemActionRow: {
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
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00E5FF88',
  },
  equipBtnText: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '900',
  },
  storeBtn: {
    backgroundColor: '#162230',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  storeBtnText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
