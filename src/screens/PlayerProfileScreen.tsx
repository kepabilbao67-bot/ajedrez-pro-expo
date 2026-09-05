import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useCosmetics } from '@/hooks/use-cosmetics';
import { useCareer } from '@/hooks/use-career';
import { APP_COLORS } from '@/theme/colors';

const AVAILABLE_COUNTRIES = [
  { code: 'ES', name: 'España', flag: '🇪🇸' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪' },
  { code: 'US', name: 'EE. UU.', flag: '🇺🇸' },
  { code: 'INT', name: 'Internacional', flag: '🌐' },
];

export function PlayerProfileScreen() {
  const router = useRouter();
  const {
    customization,
    loading: cosmeticsLoading,
    getCosmeticsByCategory,
    updateProfileCustomization,
    isItemOwned,
  } = useCosmetics();
  const { profile: careerProfile, setPlayerName: setCareerPlayerName } = useCareer();

  const [nameInput, setNameInput] = useState(customization.name);
  const [selectedAvatarId, setSelectedAvatarId] = useState(customization.avatarId);
  const [selectedFrameId, setSelectedFrameId] = useState(customization.frameId);
  const [selectedCountry, setSelectedCountry] = useState(customization.countryCode);
  const [mottoInput, setMottoInput] = useState(customization.motto);
  const [saving, setSaving] = useState(false);

  if (cosmeticsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_COLORS.blueElectric} />
        <Text style={styles.loadingText}>Cargando Perfil...</Text>
      </View>
    );
  }

  const avatars = getCosmeticsByCategory('avatars');
  const frames = getCosmeticsByCategory('frames');

  const selectedAvatar = avatars.find((a) => a.id === selectedAvatarId) ?? avatars[0];
  const selectedFrame = frames.find((f) => f.id === selectedFrameId) ?? frames[0];
  const currentFlag = AVAILABLE_COUNTRIES.find((c) => c.code === selectedCountry)?.flag ?? '🌐';

  const handleSave = async () => {
    if (!nameInput.trim()) {
      Alert.alert('Nombre requerido', 'Por favor ingresa un nombre para tu jugador.');
      return;
    }
    setSaving(true);
    await updateProfileCustomization({
      name: nameInput.trim(),
      avatarId: selectedAvatarId,
      frameId: selectedFrameId,
      countryCode: selectedCountry,
      motto: mottoInput.trim(),
    });
    await setCareerPlayerName(nameInput.trim());
    setSaving(false);
    Alert.alert('¡Perfil Guardado!', 'Tus cambios han sido actualizados correctamente.', [
      { text: 'Aceptar', onPress: () => router.replace('/') },
    ]);
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
          <Text style={styles.headerTitle}>CREA TU JUGADOR</Text>
          <Text style={styles.headerSubtitle}>Identidad & Estilo</Text>
        </View>
        <Pressable
          disabled={saving}
          onPress={() => void handleSave()}
          style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Guardando…' : 'Guardar'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* LIVE PROFILE CARD PREVIEW */}
        <Animated.View entering={FadeInDown.duration(200)} style={styles.previewCard}>
          <Text style={styles.previewTitle}>FICHA OFICIAL DE JUGADOR</Text>

          <View style={styles.heroRow}>
            <View
              style={[
                styles.avatarFrame,
                { borderColor: selectedFrame.previewAsset },
              ]}
            >
              <Text style={styles.avatarEmoji}>{selectedAvatar.icon}</Text>
            </View>

            <View style={styles.playerMeta}>
              <View style={styles.nameRow}>
                <Text style={styles.flagEmoji}>{currentFlag}</Text>
                <Text style={styles.playerNameText}>{nameInput || 'Tu Nombre'}</Text>
              </View>
              <Text style={styles.characterSub}>{selectedAvatar.name} — {selectedAvatar.description}</Text>
              <Text style={styles.mottoText}>&ldquo;{mottoInput || 'Tu lema aquí'}&rdquo;</Text>
            </View>
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingLabel}>RATING AJEDREZPRO</Text>
              <Text style={styles.ratingVal}>{careerProfile.rating.currentRating}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingLabel}>RANGO</Text>
              <Text style={styles.rankVal}>
                {careerProfile.currentTournament.tierId === 'academia' ? 'Aspirante' : 'Competidor'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* INPUT: NOMBRE */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>NOMBRE DEL JUGADOR</Text>
          <TextInput
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="Introduce tu nombre o apodo"
            placeholderTextColor="#64748B"
            maxLength={20}
            style={styles.textInput}
          />
        </View>

        {/* INPUT: LEMA */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>LEMA O FRASE DE COMPETICIÓN</Text>
          <TextInput
            value={mottoInput}
            onChangeText={setMottoInput}
            placeholder="Ej: El cálculo puro vence al azar"
            placeholderTextColor="#64748B"
            maxLength={50}
            style={styles.textInput}
          />
        </View>

        {/* SELECTOR: PAÍS / BANDERA */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>BANDERA / PAÍS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.countryList}>
            {AVAILABLE_COUNTRIES.map((c) => {
              const isSelected = selectedCountry === c.code;
              return (
                <Pressable
                  key={c.code}
                  onPress={() => setSelectedCountry(c.code)}
                  style={[styles.countryChip, isSelected && styles.countryChipActive]}
                >
                  <Text style={styles.countryFlag}>{c.flag}</Text>
                  <Text style={[styles.countryName, isSelected && styles.countryNameActive]}>
                    {c.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* SELECTOR: PERSONAJE / AVATAR */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>PERSONAJE / AVATAR</Text>
          <View style={styles.avatarGrid}>
            {avatars.map((av) => {
              const owned = isItemOwned(av.id);
              const isSelected = selectedAvatarId === av.id;

              return (
                <Pressable
                  key={av.id}
                  disabled={!owned}
                  onPress={() => setSelectedAvatarId(av.id)}
                  style={[
                    styles.avatarSelectCard,
                    !owned && styles.avatarLocked,
                    isSelected && styles.avatarSelected,
                  ]}
                >
                  <Text style={styles.avatarCardIcon}>{av.icon}</Text>
                  <Text numberOfLines={1} style={styles.avatarCardName}>{av.name}</Text>
                  {!owned && <Text style={styles.lockedSmall}>🔒 Bloqueado</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* SELECTOR: MARCO */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>MARCO DE PERFIL</Text>
          <View style={styles.framesGrid}>
            {frames.map((fr) => {
              const owned = isItemOwned(fr.id);
              const isSelected = selectedFrameId === fr.id;

              return (
                <Pressable
                  key={fr.id}
                  disabled={!owned}
                  onPress={() => setSelectedFrameId(fr.id)}
                  style={[
                    styles.frameSelectCard,
                    !owned && styles.avatarLocked,
                    isSelected && styles.frameSelected,
                  ]}
                >
                  <View style={[styles.framePreviewCircle, { borderColor: fr.previewAsset }]} />
                  <Text numberOfLines={1} style={styles.frameCardName}>{fr.name}</Text>
                  {!owned && <Text style={styles.lockedSmall}>🔒 Bloqueado</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>
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
  saveBtn: {
    backgroundColor: '#00E5FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#070C12',
    fontSize: 13,
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
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E3247',
    gap: 12,
  },
  previewTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarFrame: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#142030',
  },
  avatarEmoji: {
    fontSize: 34,
  },
  playerMeta: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flagEmoji: {
    fontSize: 18,
  },
  playerNameText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  characterSub: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '700',
  },
  mottoText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#142030',
    padding: 10,
    borderRadius: 10,
  },
  ratingBadge: {
    flex: 1,
    alignItems: 'center',
  },
  ratingLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
  },
  ratingVal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  rankVal: {
    color: '#F5C518',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#0E1724',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E3247',
    gap: 10,
  },
  sectionTitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  textInput: {
    backgroundColor: '#142030',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E2D3E',
  },
  countryList: {
    gap: 8,
  },
  countryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#142030',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E2D3E',
    gap: 6,
  },
  countryChipActive: {
    borderColor: '#00E5FF',
    backgroundColor: '#16283D',
  },
  countryFlag: {
    fontSize: 16,
  },
  countryName: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  countryNameActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  avatarSelectCard: {
    width: '23%',
    backgroundColor: '#142030',
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E2D3E',
    gap: 4,
  },
  avatarSelected: {
    borderColor: '#00E5FF',
    backgroundColor: '#16283D',
  },
  avatarLocked: {
    opacity: 0.45,
  },
  avatarCardIcon: {
    fontSize: 26,
  },
  avatarCardName: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '700',
  },
  lockedSmall: {
    color: '#EF4444',
    fontSize: 8,
    fontWeight: '800',
  },
  framesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frameSelectCard: {
    width: '31%',
    backgroundColor: '#142030',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E2D3E',
    gap: 4,
  },
  frameSelected: {
    borderColor: '#00E5FF',
    backgroundColor: '#16283D',
  },
  framePreviewCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
  },
  frameCardName: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
