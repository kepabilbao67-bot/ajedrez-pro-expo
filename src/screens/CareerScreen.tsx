import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useCareer } from '@/hooks/use-career';
import { VIRTUAL_TITLE_DISCLAIMER } from '@/career/ranks';
import { APP_COLORS } from '@/theme/colors';

export function CareerScreen() {
  const router = useRouter();
  const {
    profile,
    loading,
    currentOpponent,
    playerColor,
    currentRank,
    rankProgress,
    tierDef,
    nextChampionship,
    restartChampionship,
  } = useCareer();

  const [activeTab, setActiveTab] = useState<'torneo' | 'clasificacion' | 'rival' | 'perfil'>('torneo');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_COLORS.blueElectric} />
        <Text style={styles.loadingText}>Cargando Modo Carrera...</Text>
      </View>
    );
  }

  const tournament = profile.currentTournament;
  const isCompleted = tournament.isCompleted;
  const playerStanding = tournament.standings.find((s) => s.participantId === 'player');
  const playerRankIndex = tournament.standings.findIndex((s) => s.participantId === 'player') + 1;
  const rivalry = currentOpponent ? profile.rivalries[currentOpponent.id] : null;

  const handleStartMatch = () => {
    if (!currentOpponent) return;
    router.push({
      pathname: '/',
      params: {
        careerMatch: 'true',
        opponentId: currentOpponent.id,
        playerColor: playerColor,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver al inicio"
          onPress={() => router.replace('/')}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <Text style={styles.backBtnText}>‹ Menú</Text>
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>MODO CARRERA</Text>
          <Text style={styles.headerSubtitle}>AjedrezPro</Text>
        </View>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>{currentRank.badge} {currentRank.name}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HERO PLAYER STATS BANNER */}
        <Animated.View entering={FadeInDown.duration(200)} style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.playerNameLabel}>JUGADOR</Text>
              <Text style={styles.playerName}>{profile.playerName}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingTitle}>RATING AJEDREZPRO</Text>
              <Text style={styles.ratingValue}>{profile.rating.currentRating}</Text>
              <Text style={styles.ratingPeak}>Máx: {profile.rating.peakRating}</Text>
            </View>
          </View>

          {/* PROGRESS BAR TO NEXT RANK */}
          <View style={styles.rankProgressSection}>
            <View style={styles.rankProgressLabels}>
              <Text style={styles.rankProgressCurrent}>{currentRank.name}</Text>
              <Text style={styles.rankProgressNext}>
                {rankProgress.nextRank ? `${rankProgress.nextRank.name} (${rankProgress.pointsNeeded} pts)` : 'Nivel Máximo'}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${rankProgress.progressPercent}%` }]} />
            </View>
          </View>

          {currentRank.isVirtualTitle && (
            <Text style={styles.disclaimerText}>⚠️ {VIRTUAL_TITLE_DISCLAIMER}</Text>
          )}
        </Animated.View>

        {/* NAVIGATION TABS */}
        <View style={styles.tabsRow}>
          <Pressable
            onPress={() => setActiveTab('torneo')}
            style={[styles.tabButton, activeTab === 'torneo' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === 'torneo' && styles.tabButtonTextActive]}>
              🏆 Competición
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('clasificacion')}
            style={[styles.tabButton, activeTab === 'clasificacion' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === 'clasificacion' && styles.tabButtonTextActive]}>
              📊 Tabla ({playerRankIndex}º)
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('rival')}
            style={[styles.tabButton, activeTab === 'rival' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === 'rival' && styles.tabButtonTextActive]}>
              ⚔️ Rival
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('perfil')}
            style={[styles.tabButton, activeTab === 'perfil' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === 'perfil' && styles.tabButtonTextActive]}>
              🎖️ Palmarés
            </Text>
          </Pressable>
        </View>

        {/* TAB 1: TOURNAMENT / MATCH OVERVIEW */}
        {activeTab === 'torneo' && (
          <Animated.View entering={FadeIn.duration(200)}>
            <View style={styles.sectionCard}>
              <View style={styles.championshipHeader}>
                <Text style={styles.championshipIcon}>{tierDef.trophyIcon}</Text>
                <View style={styles.championshipInfo}>
                  <Text style={styles.championshipTier}>{tierDef.subtitle}</Text>
                  <Text style={styles.championshipName}>{tournament.name}</Text>
                </View>
              </View>

              <Text style={styles.championshipDesc}>{tierDef.description}</Text>

              {/* ROUND INFO & STATUS */}
              {!isCompleted ? (
                <View style={styles.roundStatusBox}>
                  <View style={styles.roundPill}>
                    <Text style={styles.roundPillLabel}>RONDA ACTUAL</Text>
                    <Text style={styles.roundPillValue}>
                      {tournament.currentRound} / {tournament.totalRounds}
                    </Text>
                  </View>
                  <View style={styles.roundPill}>
                    <Text style={styles.roundPillLabel}>TU PUNTUACIÓN</Text>
                    <Text style={styles.roundPillValue}>
                      {playerStanding?.points.toFixed(1) ?? '0.0'} pts
                    </Text>
                  </View>
                  <View style={styles.roundPill}>
                    <Text style={styles.roundPillLabel}>OBJETIVO</Text>
                    <Text style={styles.roundPillTarget}>
                      Top {tournament.qualifyingThresholdRank}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={[styles.completedBanner, tournament.isChampion && styles.championBanner]}>
                  <Text style={styles.completedTitle}>
                    {tournament.isChampion ? '🏆 ¡CAMPEÓN DEL TORNEO!' : `🏁 TORNEO FINALIZADO — Posición ${tournament.finalRank}º`}
                  </Text>
                  <Text style={styles.completedSubtitle}>
                    {tournament.finalRank && tournament.finalRank <= tournament.qualifyingThresholdRank
                      ? '¡Clasificado con éxito para la siguiente etapa competitiva!'
                      : 'No lograste la plaza de clasificación. Puedes intentarlo de nuevo.'}
                  </Text>
                </View>
              )}
            </View>

            {/* UPCOMING MATCH ACTION CARD */}
            {!isCompleted && currentOpponent && (
              <Animated.View entering={FadeInRight.delay(60).duration(200)} style={styles.matchCard}>
                <Text style={styles.matchCardHeader}>PRÓXIMO EMPAREJAMIENTO</Text>

                <View style={styles.matchVersusRow}>
                  <View style={styles.matchPlayerCol}>
                    <Text style={styles.matchAvatar}>👤</Text>
                    <Text style={styles.matchName}>{profile.playerName}</Text>
                    <Text style={styles.matchRating}>{profile.rating.currentRating}</Text>
                    <Text style={styles.matchColorPill}>
                      {playerColor === 'w' ? '⚪ Blancas' : '⚫ Negras'}
                    </Text>
                  </View>

                  <View style={styles.vsBadge}>
                    <Text style={styles.vsText}>VS</Text>
                  </View>

                  <View style={styles.matchPlayerCol}>
                    <Text style={styles.matchAvatar}>{currentOpponent.avatar}</Text>
                    <Text style={styles.matchName}>{currentOpponent.name}</Text>
                    <Text style={styles.matchRating}>{currentOpponent.rating}</Text>
                    <Text style={styles.matchColorPill}>
                      {playerColor === 'w' ? '⚫ Negras' : '⚪ Blancas'}
                    </Text>
                  </View>
                </View>

                {/* OPPONENT DIALOGUE */}
                <View style={styles.dialogueBox}>
                  <Text style={styles.dialogueMark}>&ldquo;</Text>
                  <Text style={styles.dialogueText}>
                    {currentOpponent.quotes.preMatch[0]}
                  </Text>
                </View>

                {/* PLAY MATCH CTA */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Disputar partida de la ronda"
                  onPress={handleStartMatch}
                  style={({ pressed }) => [styles.playMatchBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.playMatchBtnText}>
                    ⚔️ DISPUTAR RONDA {tournament.currentRound}
                  </Text>
                </Pressable>
              </Animated.View>
            )}

            {/* COMPLETED ACTIONS */}
            {isCompleted && (
              <View style={styles.completedActions}>
                {tournament.finalRank && tournament.finalRank <= tournament.qualifyingThresholdRank ? (
                  <Pressable
                    onPress={nextChampionship}
                    style={({ pressed }) => [styles.nextTierBtn, pressed && styles.pressed]}
                  >
                    <Text style={styles.nextTierBtnText}>🚀 AVANZAR AL SIGUIENTE CAMPEONATO</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={restartChampionship}
                    style={({ pressed }) => [styles.restartBtn, pressed && styles.pressed]}
                  >
                    <Text style={styles.restartBtnText}>🔄 REINTENTAR CAMPEONATO</Text>
                  </Pressable>
                )}
              </View>
            )}
          </Animated.View>
        )}

        {/* TAB 2: STANDINGS TABLE */}
        {activeTab === 'clasificacion' && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.sectionCard}>
            <Text style={styles.tableTitle}>CLASIFICACIÓN OFICIAL</Text>
            <Text style={styles.tableSubtitle}>
              {tournament.name} — Ronda {tournament.currentRound} de {tournament.totalRounds}
            </Text>

            <View style={styles.tableHeaderRow}>
              <Text style={[styles.thCell, styles.thPos]}>Pos</Text>
              <Text style={[styles.thCell, styles.thName]}>Jugador</Text>
              <Text style={[styles.thCell, styles.thPlayed]}>PJ</Text>
              <Text style={[styles.thCell, styles.thWdl]}>V/T/D</Text>
              <Text style={[styles.thCell, styles.thPts]}>PTS</Text>
            </View>

            {tournament.standings.map((row, index) => {
              const isPlayer = row.participantId === 'player';
              const isQualifyingZone = index < tournament.qualifyingThresholdRank;

              return (
                <View
                  key={row.participantId}
                  style={[
                    styles.tableRow,
                    isPlayer && styles.tableRowPlayer,
                    isQualifyingZone && styles.tableRowQualifying,
                  ]}
                >
                  <View style={styles.posCellWrap}>
                    <Text style={[styles.tdPos, isPlayer && styles.tdPlayerText]}>{index + 1}º</Text>
                    {index === 0 && <Text style={styles.crown}>👑</Text>}
                  </View>

                  <View style={styles.nameCellWrap}>
                    <Text style={styles.rowAvatar}>{row.avatar}</Text>
                    <View>
                      <Text style={[styles.tdName, isPlayer && styles.tdPlayerText]}>
                        {row.name} {isPlayer && '(Tú)'}
                      </Text>
                      <Text style={styles.tdRating}>{row.rating}</Text>
                    </View>
                  </View>

                  <Text style={[styles.tdPlayed, isPlayer && styles.tdPlayerText]}>{row.played}</Text>
                  <Text style={[styles.tdWdl, isPlayer && styles.tdPlayerText]}>
                    {row.wins}/{row.draws}/{row.losses}
                  </Text>
                  <Text style={[styles.tdPts, isPlayer && styles.tdPlayerPts]}>
                    {row.points.toFixed(1)}
                  </Text>
                </View>
              );
            })}

            <View style={styles.tableLegend}>
              <View style={styles.legendColor} />
              <Text style={styles.legendText}>
                Zona de ascenso / clasificación (Top {tournament.qualifyingThresholdRank})
              </Text>
            </View>
          </Animated.View>
        )}

        {/* TAB 3: CURRENT OPPONENT DETAIL & RIVALRY */}
        {activeTab === 'rival' && currentOpponent && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.sectionCard}>
            <View style={styles.opponentHeroRow}>
              <Text style={styles.opponentBigAvatar}>{currentOpponent.avatar}</Text>
              <View style={styles.opponentHeroMeta}>
                <Text style={styles.opponentTitleBadge}>{currentOpponent.title ?? 'Rival AjedrezPro'}</Text>
                <Text style={styles.opponentHeroName}>{currentOpponent.name}</Text>
                <Text style={styles.opponentHeroRating}>Rating: {currentOpponent.rating}</Text>
                <Text style={styles.opponentStyleTag}>Estilo: {currentOpponent.styleDescription.toUpperCase()}</Text>
              </View>
            </View>

            <Text style={styles.opponentBio}>{currentOpponent.bio}</Text>

            {/* STRENGTHS & WEAKNESSES */}
            <View style={styles.traitsGrid}>
              <View style={styles.traitCard}>
                <Text style={styles.traitTitleGreen}>💪 FORTALEZA</Text>
                <Text style={styles.traitDesc}>{currentOpponent.strength}</Text>
              </View>
              <View style={styles.traitCard}>
                <Text style={styles.traitTitleRed}>⚠️ DEBILIDAD</Text>
                <Text style={styles.traitDesc}>{currentOpponent.weakness}</Text>
              </View>
            </View>

            {/* PREFERRED OPENINGS */}
            <View style={styles.openingsCard}>
              <Text style={styles.openingsTitle}>📖 APERTURAS PREFERIDAS</Text>
              <Text style={styles.openingsList}>
                {currentOpponent.preferredOpenings.join(' • ')}
              </Text>
            </View>

            {/* HEAD TO HEAD RIVALRY */}
            <View style={styles.rivalryCard}>
              <Text style={styles.rivalryTitle}>HISTORIAL CARA A CARA</Text>
              {rivalry && rivalry.gamesPlayed > 0 ? (
                <View style={styles.rivalryStatsRow}>
                  <View style={styles.rivalryStatItem}>
                    <Text style={styles.rivalryStatValWin}>{rivalry.wins}</Text>
                    <Text style={styles.rivalryStatLabel}>Victorias</Text>
                  </View>
                  <View style={styles.rivalryStatItem}>
                    <Text style={styles.rivalryStatValDraw}>{rivalry.draws}</Text>
                    <Text style={styles.rivalryStatLabel}>Tablas</Text>
                  </View>
                  <View style={styles.rivalryStatItem}>
                    <Text style={styles.rivalryStatValLoss}>{rivalry.losses}</Text>
                    <Text style={styles.rivalryStatLabel}>Derrotas</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.rivalryEmpty}>
                  Primera vez que os enfrentáis en el circuito oficial.
                </Text>
              )}
            </View>
          </Animated.View>
        )}

        {/* TAB 4: PROFILE & TROPHIES */}
        {activeTab === 'perfil' && (
          <Animated.View entering={FadeIn.duration(200)}>
            {/* STATS SUMMARY */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeaderTitle}>ESTADÍSTICAS DE CARRERA</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxVal}>{profile.rating.gamesPlayed}</Text>
                  <Text style={styles.statBoxLabel}>Partidas</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxVal}>{profile.rating.wins}</Text>
                  <Text style={styles.statBoxLabel}>Victorias</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxVal}>{profile.rating.draws}</Text>
                  <Text style={styles.statBoxLabel}>Tablas</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxVal}>{profile.rating.losses}</Text>
                  <Text style={styles.statBoxLabel}>Derrotas</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxVal}>{profile.rating.currentStreak}</Text>
                  <Text style={styles.statBoxLabel}>Racha Actual</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxVal}>{profile.rating.bestStreak}</Text>
                  <Text style={styles.statBoxLabel}>Mejor Racha</Text>
                </View>
              </View>
            </View>

            {/* TROPHIES PALMARÉS */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeaderTitle}>PALMARÉS Y TROFEOS</Text>
              {profile.trophies.length > 0 ? (
                <View style={styles.trophyList}>
                  {profile.trophies.map((tr) => (
                    <View key={tr.id} style={styles.trophyRow}>
                      <Text style={styles.trophyIconLarge}>{tr.icon}</Text>
                      <View style={styles.trophyMeta}>
                        <Text style={styles.trophyName}>{tr.tournamentName}</Text>
                        <Text style={styles.trophyPlacement}>
                          {tr.placement === 1 ? '🥇 Campeón Absoluto' : `Posición: ${tr.placement}º puesto`}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyTrophies}>
                  Aún no has completado tu primer torneo. ¡Gana el Torneo de Promesas para inaugurar tu vitrina!
                </Text>
              )}
            </View>
          </Animated.View>
        )}
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
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    color: '#F5C518',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  badgeWrap: {
    backgroundColor: '#1E2B38',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  heroCard: {
    backgroundColor: '#0E1724',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E3247',
    gap: 12,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerNameLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  ratingBadge: {
    alignItems: 'flex-end',
    backgroundColor: '#152436',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00E5FF44',
  },
  ratingTitle: {
    color: '#00E5FF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  ratingValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  ratingPeak: {
    color: '#94A3B8',
    fontSize: 10,
  },
  rankProgressSection: {
    gap: 6,
  },
  rankProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rankProgressCurrent: {
    color: '#F5C518',
    fontSize: 12,
    fontWeight: '700',
  },
  rankProgressNext: {
    color: '#64748B',
    fontSize: 11,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#1A293B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00E5FF',
    borderRadius: 3,
  },
  disclaimerText: {
    color: '#F59E0B',
    fontSize: 10,
    lineHeight: 13,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#0A121C',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#172738',
  },
  tabButtonText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#00E5FF',
  },
  sectionCard: {
    backgroundColor: '#0E1724',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E3247',
    gap: 12,
  },
  championshipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  championshipIcon: {
    fontSize: 36,
  },
  championshipInfo: {
    flex: 1,
  },
  championshipTier: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  championshipName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  championshipDesc: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
  },
  roundStatusBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#142030',
    padding: 12,
    borderRadius: 12,
  },
  roundPill: {
    flex: 1,
    alignItems: 'center',
  },
  roundPillLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
  },
  roundPillValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  roundPillTarget: {
    color: '#F5C518',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  completedBanner: {
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  championBanner: {
    backgroundColor: 'rgba(245, 197, 24, 0.15)',
    borderWidth: 1,
    borderColor: '#F5C518',
  },
  completedTitle: {
    color: '#F5C518',
    fontSize: 15,
    fontWeight: '900',
  },
  completedSubtitle: {
    color: '#E2E8F0',
    fontSize: 12,
    textAlign: 'center',
  },
  matchCard: {
    backgroundColor: '#111D2D',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#00E5FF44',
    gap: 14,
  },
  matchCardHeader: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  matchVersusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  matchPlayerCol: {
    alignItems: 'center',
    gap: 2,
    width: 110,
  },
  matchAvatar: {
    fontSize: 34,
  },
  matchName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  matchRating: {
    color: '#94A3B8',
    fontSize: 12,
  },
  matchColorPill: {
    color: '#E2E8F0',
    fontSize: 10,
    backgroundColor: '#1E2C3D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  vsBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E2F42',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00E5FF66',
  },
  vsText: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '900',
  },
  dialogueBox: {
    backgroundColor: '#0B1420',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#F5C518',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dialogueMark: {
    color: '#F5C518',
    fontSize: 22,
    fontWeight: '900',
    marginRight: 6,
  },
  dialogueText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
  },
  playMatchBtn: {
    backgroundColor: '#00E5FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  playMatchBtnText: {
    color: '#070C12',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  completedActions: {
    gap: 8,
  },
  nextTierBtn: {
    backgroundColor: '#F5C518',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextTierBtnText: {
    color: '#070C12',
    fontSize: 14,
    fontWeight: '900',
  },
  restartBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  restartBtnText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
  },
  tableTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  tableSubtitle: {
    color: '#64748B',
    fontSize: 11,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2D3E',
  },
  thCell: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
  },
  thPos: { width: 34, textAlign: 'center' },
  thName: { flex: 1, paddingLeft: 6 },
  thPlayed: { width: 32, textAlign: 'center' },
  thWdl: { width: 56, textAlign: 'center' },
  thPts: { width: 44, textAlign: 'right', paddingRight: 6 },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#14202E',
  },
  tableRowPlayer: {
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderRadius: 8,
  },
  tableRowQualifying: {
    borderLeftWidth: 3,
    borderLeftColor: '#F5C518',
    paddingLeft: 4,
  },
  posCellWrap: {
    width: 34,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tdPos: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
  },
  crown: {
    fontSize: 10,
    marginLeft: 2,
  },
  nameCellWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 6,
  },
  rowAvatar: {
    fontSize: 18,
  },
  tdName: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '700',
  },
  tdRating: {
    color: '#64748B',
    fontSize: 10,
  },
  tdPlayed: {
    width: 32,
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
  },
  tdWdl: {
    width: 56,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 11,
  },
  tdPts: {
    width: 44,
    textAlign: 'right',
    paddingRight: 6,
    color: '#F5C518',
    fontSize: 14,
    fontWeight: '900',
  },
  tdPlayerText: {
    color: '#00E5FF',
    fontWeight: '900',
  },
  tdPlayerPts: {
    color: '#00E5FF',
    fontWeight: '900',
  },
  tableLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#F5C518',
  },
  legendText: {
    color: '#64748B',
    fontSize: 11,
  },
  opponentHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  opponentBigAvatar: {
    fontSize: 54,
  },
  opponentHeroMeta: {
    flex: 1,
    gap: 2,
  },
  opponentTitleBadge: {
    color: '#F5C518',
    fontSize: 10,
    fontWeight: '800',
  },
  opponentHeroName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  opponentHeroRating: {
    color: '#94A3B8',
    fontSize: 12,
  },
  opponentStyleTag: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '700',
  },
  opponentBio: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
  },
  traitsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  traitCard: {
    flex: 1,
    backgroundColor: '#131F2E',
    padding: 10,
    borderRadius: 10,
    gap: 4,
  },
  traitTitleGreen: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  traitTitleRed: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '800',
  },
  traitDesc: {
    color: '#E2E8F0',
    fontSize: 11,
    lineHeight: 15,
  },
  openingsCard: {
    backgroundColor: '#131F2E',
    padding: 10,
    borderRadius: 10,
    gap: 4,
  },
  openingsTitle: {
    color: '#F5C518',
    fontSize: 10,
    fontWeight: '800',
  },
  openingsList: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  rivalryCard: {
    backgroundColor: '#0B131E',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  rivalryTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  rivalryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rivalryStatItem: {
    alignItems: 'center',
  },
  rivalryStatValWin: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '900',
  },
  rivalryStatValDraw: {
    color: '#F59E0B',
    fontSize: 18,
    fontWeight: '900',
  },
  rivalryStatValLoss: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '900',
  },
  rivalryStatLabel: {
    color: '#64748B',
    fontSize: 10,
  },
  rivalryEmpty: {
    color: '#94A3B8',
    fontSize: 12,
    fontStyle: 'italic',
  },
  sectionHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBox: {
    width: '31%',
    backgroundColor: '#142030',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  statBoxVal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  statBoxLabel: {
    color: '#64748B',
    fontSize: 10,
  },
  trophyList: {
    gap: 8,
  },
  trophyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#142030',
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  trophyIconLarge: {
    fontSize: 28,
  },
  trophyMeta: {
    flex: 1,
  },
  trophyName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  trophyPlacement: {
    color: '#F5C518',
    fontSize: 12,
  },
  emptyTrophies: {
    color: '#64748B',
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
