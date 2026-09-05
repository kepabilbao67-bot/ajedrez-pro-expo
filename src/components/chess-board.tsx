import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import type { BoardThemeDefinition } from '@/board-themes/board-themes';
import { ChessPieceView, type PieceSetDefinition } from '@/board-themes/piece-sets';
import {
  colorOf,
  squareToAlgebraic,
  typeOf,
  type Move,
  type Piece,
  type Position,
  type Square,
} from '@/chess';

const PIECE_NAMES = {
  k: 'rey',
  q: 'dama',
  r: 'torre',
  b: 'alfil',
  n: 'caballo',
  p: 'peón',
} as const;

interface ChessBoardProps {
  readonly position: Position;
  readonly size: number;
  readonly selected: Square | null;
  readonly legalMoves: readonly Move[];
  readonly flipped: boolean;
  readonly disabled?: boolean;
  readonly lastMove: Move | null;
  readonly inCheck: boolean;
  readonly boardTheme: BoardThemeDefinition;
  readonly pieceSet: PieceSetDefinition;
  readonly onSquarePress: (square: Square) => void;
}

function MovingPiece({
  move,
  piece,
  size,
  flipped,
  pieceSet,
}: {
  readonly move: Move;
  readonly piece: Piece;
  readonly size: number;
  readonly flipped: boolean;
  readonly pieceSet: PieceSetDefinition;
}) {
  const progress = useSharedValue(0);
  const squareSize = size / 8;
  const displayIndex = (square: Square) => (flipped ? 63 - square : square);
  const fromIndex = displayIndex(move.from);
  const toIndex = displayIndex(move.to);
  const fromX = (fromIndex % 8) * squareSize;
  const fromY = Math.floor(fromIndex / 8) * squareSize;
  const deltaX = (toIndex % 8) * squareSize - fromX;
  const deltaY = Math.floor(toIndex / 8) * squareSize - fromY;

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 180 });
  }, [move, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.9, 1], [1, 1, 0]),
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [0, deltaX]) },
      { translateY: interpolate(progress.value, [0, 1], [0, deltaY]) },
    ],
  }));

  return (
    <Animated.View
      accessibilityElementsHidden
      pointerEvents="none"
      style={[
        styles.movingPiece,
        {
          left: fromX,
          top: fromY,
          width: squareSize,
          height: squareSize,
        },
        animatedStyle,
      ]}
    >
      <ChessPieceView piece={piece} pieceSetId={pieceSet.id} size={squareSize * 0.88} />
    </Animated.View>
  );
}

export function ChessBoard({
  position,
  size,
  selected,
  legalMoves,
  flipped,
  disabled,
  lastMove,
  inCheck,
  boardTheme,
  pieceSet,
  onSquarePress,
}: ChessBoardProps) {
  const squareSize = size / 8;
  const squares = Array.from({ length: 64 }, (_, index) => (flipped ? 63 - index : index));
  const legalTargets = new Map(legalMoves.map((move) => [move.to, move]));
  const checkedKing = inCheck
    ? position.board.findIndex((piece) => piece === (position.turn === 'w' ? 'K' : 'k'))
    : -1;

  return (
    <View
      accessibilityLabel={`Tablero de ajedrez tema ${boardTheme.name}`}
      accessibilityRole="summary"
      style={[
        styles.outerBevel,
        {
          borderColor: boardTheme.frame,
          width: size + 8,
          height: size + 8,
        },
      ]}
    >
      <View
        style={[
          styles.frame,
          {
            backgroundColor: '#070B0E',
            borderColor: 'rgba(212, 175, 55, 0.45)',
            width: size + 4,
            height: size + 4,
          },
        ]}
      >
        <View style={[styles.board, { width: size, height: size }]}>
          {squares.map((square, displayIndex) => {
            const piece = position.board[square];
            const move = legalTargets.get(square);
            const algebraic = squareToAlgebraic(square);
            const displayRow = Math.floor(displayIndex / 8);
            const displayColumn = displayIndex % 8;
            const showFile = displayRow === 7;
            const showRank = displayColumn === 0;
            const isLight = (Math.floor(square / 8) + (square % 8)) % 2 === 0;
            const isLastMove = lastMove?.from === square || lastMove?.to === square;
            const isCaptureDestination = lastMove?.capture === true && lastMove.to === square;
            const pieceLabel = piece
              ? `${PIECE_NAMES[typeOf(piece)]} ${colorOf(piece) === 'w' ? 'blanco' : 'negro'}`
              : 'vacía';

            return (
              <Pressable
                key={square}
                accessibilityLabel={`${algebraic}, ${pieceLabel}${move ? ', movimiento legal' : ''}`}
                accessibilityRole="button"
                accessibilityState={{ disabled, selected: selected === square }}
                disabled={disabled}
                onPress={() => {
                  if (!disabled) {
                    if (move) {
                      Haptics.impactAsync(
                        move.capture
                          ? Haptics.ImpactFeedbackStyle.Medium
                          : Haptics.ImpactFeedbackStyle.Light
                      );
                    } else if (piece) {
                      Haptics.selectionAsync();
                    }
                    onSquarePress(square);
                  }
                }}
                style={({ pressed }) => [
                  styles.square,
                  {
                    width: squareSize,
                    height: squareSize,
                    backgroundColor: isLight ? boardTheme.lightSquare : boardTheme.darkSquare,
                  },
                  pressed && !disabled && styles.pressed,
                ]}
              >
                {/* Last Move Glow overlay (Amber tint with crisp border) */}
                {isLastMove ? (
                  <View style={styles.lastMoveGlow} />
                ) : null}

                {/* Selected Square Highlight overlay */}
                {selected === square ? (
                  <View style={styles.selectedOverlay} />
                ) : null}

                {/* King in Check Red Alert Halo */}
                {square === checkedKing ? (
                  <View style={styles.checkedKingOverlay} />
                ) : null}

                {/* Capture Flash animation */}
                {isCaptureDestination ? (
                  <Animated.View entering={FadeIn.duration(180)} style={styles.captureFlash} />
                ) : null}

                {/* Piece Rendering with optimal scale */}
                {piece ? (
                  <Animated.View
                    key={`${piece}-${square}`}
                    entering={lastMove?.to === square ? ZoomIn.duration(160) : undefined}
                    accessibilityElementsHidden
                    style={styles.pieceContainer}
                  >
                    <ChessPieceView piece={piece} pieceSetId={pieceSet.id} size={squareSize * 0.88} />
                  </Animated.View>
                ) : null}

                {/* Legal Move Indicators (Accessibility: Dot for move, Ring for capture) */}
                {move ? (
                  move.capture ? (
                    <Animated.View
                      entering={ZoomIn.duration(140)}
                      accessibilityElementsHidden
                      style={[
                        styles.captureTarget,
                        { width: squareSize - 6, height: squareSize - 6, borderRadius: (squareSize - 6) / 2 },
                      ]}
                    />
                  ) : (
                    <Animated.View
                      entering={ZoomIn.duration(140)}
                      accessibilityElementsHidden
                      style={[
                        styles.moveTarget,
                        {
                          width: Math.max(12, squareSize * 0.28),
                          height: Math.max(12, squareSize * 0.28),
                          borderRadius: Math.max(12, squareSize * 0.28) / 2,
                        },
                      ]}
                    />
                  )
                ) : null}

                {/* Coordinates */}
                {showRank ? (
                  <Text
                    accessibilityElementsHidden
                    style={[
                      styles.coordinate,
                      styles.rank,
                      {
                        color: isLight ? boardTheme.coordinateLight : boardTheme.coordinateDark,
                      },
                    ]}
                  >
                    {algebraic[1]}
                  </Text>
                ) : null}
                {showFile ? (
                  <Text
                    accessibilityElementsHidden
                    style={[
                      styles.coordinate,
                      styles.file,
                      {
                        color: isLight ? boardTheme.coordinateLight : boardTheme.coordinateDark,
                      },
                    ]}
                  >
                    {algebraic[0]}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}

          {lastMove && position.board[lastMove.to] ? (
            <MovingPiece
              key={`${lastMove.from}-${lastMove.to}-${position.fullmoveNumber}-${position.turn}`}
              move={lastMove}
              piece={position.board[lastMove.to]!}
              size={size}
              flipped={flipped}
              pieceSet={pieceSet}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerBevel: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderCurve: 'continuous',
    borderWidth: 2,
    backgroundColor: '#0B1117',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.65), 0 0 14px rgba(212, 175, 55, 0.25)',
  },
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
    borderRadius: 12,
    borderCurve: 'continuous',
  },
  square: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectedOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    borderWidth: 2.5,
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0, 229, 255, 0.22)',
  },
  lastMoveGlow: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 197, 24, 0.55)',
    backgroundColor: 'rgba(245, 197, 24, 0.22)',
  },
  checkedKingOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.42)',
    borderWidth: 2.5,
    borderColor: '#EF4444',
    boxShadow: 'inset 0 0 14px rgba(239, 68, 68, 0.75)',
  },
  pressed: {
    opacity: 0.82,
  },
  pieceContainer: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  movingPiece: {
    position: 'absolute',
    zIndex: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveTarget: {
    position: 'absolute',
    zIndex: 3,
    backgroundColor: '#00E5FF',
    borderWidth: 1.5,
    borderColor: 'rgba(7, 11, 14, 0.65)',
    boxShadow: '0 0 8px rgba(0, 229, 255, 0.75)',
  },
  captureTarget: {
    position: 'absolute',
    zIndex: 3,
    borderWidth: 3.5,
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255, 59, 48, 0.16)',
    boxShadow: '0 0 10px rgba(255, 59, 48, 0.65)',
  },
  captureFlash: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    backgroundColor: 'rgba(255, 59, 48, 0.35)',
  },
  coordinate: {
    position: 'absolute',
    zIndex: 4,
    fontSize: 10,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.2,
  },
  rank: {
    left: 3,
    top: 2,
  },
  file: {
    right: 3,
    bottom: 2,
  },
});
