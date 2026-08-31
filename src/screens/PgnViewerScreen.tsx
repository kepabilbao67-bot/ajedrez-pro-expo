import { useEffect, useRef, useState } from 'react';
import {
  Modal,
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

import { ChessGame, type Move, type Position } from '@/chess';
import { ChessBoard } from '@/components/chess-board';
import { MASTER_GAMES, parsePgn, type ParsedPgnGame } from '@/services/pgnExporter';
import { useVisualPreferences } from '@/hooks/use-visual-preferences';
import { useHaptics } from '@/hooks/use-haptics';
import { useAudioSfx } from '@/hooks/use-audio-sfx';

export function PgnViewerScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { boardTheme, pieceSet, visualPreferences } = useVisualPreferences();
  const { hapticMove } = useHaptics();
  const { playMove } = useAudioSfx(visualPreferences.soundsEnabled);

  const [activeMasterGame, setActiveMasterGame] = useState(MASTER_GAMES[0]);
  const [parsedGame, setParsedGame] = useState<ParsedPgnGame>(() => parsePgn(MASTER_GAMES[0].pgn));
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0); // 0 = initial pos
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [pasteModalVisible, setPasteModalVisible] = useState<boolean>(false);
  const [customPgnInput, setCustomPgnInput] = useState<string>('');

  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Build the game state up to currentMoveIndex
  const buildBoardAtStep = (moves: string[], step: number): { position: Position; lastMove: Move | null; inCheck: boolean } => {
    const game = new ChessGame();
    let lastMove: Move | null = null;

    for (let i = 0; i < step && i < moves.length; i++) {
      const san = moves[i];
      const legal = game.legalMoves();
      for (const m of legal) {
        const testGame = new ChessGame(game.fen());
        const record = testGame.move(m);
        if (record && record.san.replace(/[+#]$/, '') === san.replace(/[+#]$/, '')) {
          lastMove = m;
          game.move(m);
          break;
        }
      }
    }

    return {
      position: game.getPosition(),
      lastMove,
      inCheck: game.status().check,
    };
  };

  const { position, lastMove, inCheck } = buildBoardAtStep(parsedGame.moves, currentMoveIndex);

  const availableWidth = width - 32;
  const boardSize = Math.min(Math.max(availableWidth, 240), 380);

  // Auto-play mechanism
  useEffect(() => {
    if (isPlaying) {
      autoPlayTimerRef.current = setInterval(() => {
        setCurrentMoveIndex((prev) => {
          if (prev >= parsedGame.moves.length) {
            setIsPlaying(false);
            return prev;
          }
          hapticMove();
          playMove();
          return prev + 1;
        });
      }, 1100);
    } else {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    }

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPlaying, parsedGame.moves.length, hapticMove, playMove]);

  const loadGame = (gameItem: typeof MASTER_GAMES[0]) => {
    setIsPlaying(false);
    setActiveMasterGame(gameItem);
    const parsed = parsePgn(gameItem.pgn);
    setParsedGame(parsed);
    setCurrentMoveIndex(0);
  };

  const handleCustomPgnSubmit = () => {
    if (!customPgnInput.trim()) return;
    setIsPlaying(false);
    const parsed = parsePgn(customPgnInput);
    setParsedGame(parsed);
    setCurrentMoveIndex(0);
    setPasteModalVisible(false);
  };

  const goToStart = () => {
    setIsPlaying(false);
    setCurrentMoveIndex(0);
  };

  const goToEnd = () => {
    setIsPlaying(false);
    setCurrentMoveIndex(parsedGame.moves.length);
  };

  const goPrev = () => {
    setIsPlaying(false);
    setCurrentMoveIndex((prev) => Math.max(0, prev - 1));
  };

  const goNext = () => {
    setIsPlaying(false);
    setCurrentMoveIndex((prev) => Math.min(parsedGame.moves.length, prev + 1));
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Visor y Reproductor PGN</Text>
          <Pressable accessibilityRole="button" onPress={() => setPasteModalVisible(true)} style={styles.pasteButton}>
            <Text style={styles.pasteButtonText}>+ Pegar PGN</Text>
          </Pressable>
        </View>

        {/* MASTER GAMES SELECTOR CHIPS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.masterGamesRow}>
          {MASTER_GAMES.map((mg) => (
            <Pressable
              key={mg.id}
              accessibilityRole="button"
              onPress={() => loadGame(mg)}
              style={[styles.masterGameChip, activeMasterGame.id === mg.id && styles.masterGameChipActive]}
            >
              <Text style={[styles.masterGameChipText, activeMasterGame.id === mg.id && styles.masterGameChipTextActive]}>
                {mg.title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* GAME INFO CARD */}
        <View style={styles.infoCard}>
          <View style={styles.infoTopRow}>
            <Text style={styles.infoEvent}>{parsedGame.headers.Event ?? 'Partida Histórica'}</Text>
            <View style={styles.resultBadge}>
              <Text style={styles.resultBadgeText}>{parsedGame.result}</Text>
            </View>
          </View>
          <Text style={styles.playersText}>
            ⚪ {parsedGame.headers.White ?? 'Blancas'} vs ⚫ {parsedGame.headers.Black ?? 'Negras'}
          </Text>
          <Text style={styles.metaSub}>
            {parsedGame.headers.Date ?? ''} · {parsedGame.headers.Site ?? ''} · ECO: {parsedGame.headers.ECO ?? 'N/A'}
          </Text>
        </View>

        {/* CHESS BOARD */}
        <View style={styles.boardWrapper}>
          <ChessBoard
            position={position}
            size={boardSize}
            selected={null}
            legalMoves={[]}
            flipped={false}
            disabled
            lastMove={lastMove}
            inCheck={inCheck}
            boardTheme={boardTheme}
            pieceSet={pieceSet}
            onSquarePress={() => {}}
          />
        </View>

        {/* PLAYBACK CONTROLS */}
        <View style={styles.controlsBar}>
          <Pressable accessibilityRole="button" onPress={goToStart} style={styles.controlBtn}>
            <Text style={styles.controlBtnText}>|◀◀</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={goPrev} style={styles.controlBtn}>
            <Text style={styles.controlBtnText}>◀</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsPlaying((p) => !p)}
            style={[styles.controlBtn, styles.playPauseBtn]}
          >
            <Text style={styles.playPauseBtnText}>{isPlaying ? '⏸ Pausa' : '▶ Play'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={goNext} style={styles.controlBtn}>
            <Text style={styles.controlBtnText}>▶</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={goToEnd} style={styles.controlBtn}>
            <Text style={styles.controlBtnText}>▶▶|</Text>
          </Pressable>
        </View>

        <Text style={styles.moveCounterText}>
          Jugada {currentMoveIndex} de {parsedGame.moves.length}
        </Text>

        {/* MOVES NOTATION LIST */}
        <View style={styles.movesListCard}>
          <Text style={styles.movesListTitle}>Notación de la Partida</Text>
          <View style={styles.movesGrid}>
            {parsedGame.moves.map((san, idx) => {
              const moveNum = Math.floor(idx / 2) + 1;
              const isWhite = idx % 2 === 0;
              const isCurrent = idx === currentMoveIndex - 1;
              return (
                <Pressable
                  key={idx}
                  accessibilityRole="button"
                  onPress={() => {
                    setIsPlaying(false);
                    setCurrentMoveIndex(idx + 1);
                  }}
                  style={[styles.moveItem, isCurrent && styles.moveItemActive]}
                >
                  <Text style={[styles.moveItemText, isCurrent && styles.moveItemTextActive]}>
                    {isWhite ? `${moveNum}. ${san}` : san}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* PASTE PGN MODAL */}
      <Modal
        visible={pasteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPasteModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Importar Partida PGN</Text>
            <Text style={styles.modalSub}>Pega el texto PGN estándar de cualquier partida:</Text>

            <TextInput
              multiline
              numberOfLines={8}
              placeholder="[Event &quot;...&quot;]&#10;1. e4 e5 2. Nf3 Nc6..."
              placeholderTextColor="#6D8276"
              value={customPgnInput}
              onChangeText={setCustomPgnInput}
              style={styles.pgnInput}
            />

            <View style={styles.modalBtnRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setPasteModalVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={handleCustomPgnSubmit}
                style={styles.modalSubmitBtn}
              >
                <Text style={styles.modalSubmitText}>Cargar Partida</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#09130F' },
  container: { padding: 16, alignItems: 'center', gap: 12 },
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
    backgroundColor: '#14241D',
    borderWidth: 1,
    borderColor: '#294235',
  },
  backButtonText: { color: '#00E5B4', fontSize: 13, fontWeight: '800' },
  headerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  pasteButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#1E3529',
    borderWidth: 1,
    borderColor: '#00E5B4',
  },
  pasteButtonText: { color: '#00E5B4', fontSize: 12, fontWeight: '800' },
  masterGamesRow: { gap: 8, paddingVertical: 4 },
  masterGameChip: {
    backgroundColor: '#14241D',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#294235',
  },
  masterGameChipActive: { backgroundColor: '#00E5B4', borderColor: '#00E5B4' },
  masterGameChipText: { color: '#9EAFA5', fontSize: 12, fontWeight: '800' },
  masterGameChipTextActive: { color: '#09130F' },
  infoCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#14241D',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#294235',
    gap: 4,
  },
  infoTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoEvent: { color: '#00E5B4', fontSize: 12, fontWeight: '900' },
  resultBadge: {
    backgroundColor: '#1B3025',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3B5A49',
  },
  resultBadgeText: { color: '#F5C451', fontSize: 11, fontWeight: '900' },
  playersText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  metaSub: { color: '#9EAFA5', fontSize: 11, marginTop: 2 },
  boardWrapper: { alignItems: 'center', justifyContent: 'center' },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 440,
  },
  controlBtn: {
    backgroundColor: '#14241D',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#294235',
  },
  controlBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  playPauseBtn: {
    backgroundColor: '#00E5B4',
    borderColor: '#00E5B4',
    paddingHorizontal: 18,
  },
  playPauseBtnText: { color: '#09130F', fontSize: 13, fontWeight: '900' },
  moveCounterText: { color: '#9EAFA5', fontSize: 12, fontWeight: '700' },
  movesListCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#14241D',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#294235',
    gap: 8,
  },
  movesListTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  movesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  moveItem: {
    backgroundColor: '#1B3025',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  moveItemActive: {
    backgroundColor: '#00E5B4',
  },
  moveItemText: { color: '#C5D0C9', fontSize: 12, fontWeight: '700' },
  moveItemTextActive: { color: '#09130F', fontWeight: '900' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 12, 9, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#14241D',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#345242',
    gap: 10,
  },
  modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  modalSub: { color: '#9EAFA5', fontSize: 12 },
  pgnInput: {
    backgroundColor: '#0E1A14',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#294235',
    color: '#FFFFFF',
    padding: 12,
    fontSize: 12,
    fontFamily: 'monospace',
    height: 140,
    textAlignVertical: 'top',
  },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#1E3529',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelText: { color: '#C5D0C9', fontSize: 13, fontWeight: '800' },
  modalSubmitBtn: {
    flex: 1.5,
    backgroundColor: '#00E5B4',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSubmitText: { color: '#09130F', fontSize: 13, fontWeight: '900' },
});
