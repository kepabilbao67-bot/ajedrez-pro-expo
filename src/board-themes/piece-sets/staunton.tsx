import React from 'react';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colorOf, typeOf, type Piece } from '@/chess';

export function renderStauntonPiece(piece: Piece, size: number): React.ReactElement {
  const isWhite = colorOf(piece) === 'w';
  const type = typeOf(piece);

  const fillMain = isWhite ? 'url(#staunton-w-grad)' : 'url(#staunton-b-grad)';
  const strokeColor = isWhite ? '#2C2117' : '#0B0806';
  const accentColor = isWhite ? '#FFFDF8' : '#4E3E34';
  const innerShadow = isWhite ? '#D8CBB2' : '#140E0A';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="staunton-w-grad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="60%" stopColor="#F9F5EC" />
          <Stop offset="100%" stopColor="#E3D7BF" />
        </LinearGradient>
        <LinearGradient id="staunton-b-grad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#3E3128" />
          <Stop offset="50%" stopColor="#251C16" />
          <Stop offset="100%" stopColor="#120D0A" />
        </LinearGradient>
      </Defs>

      <G transform="translate(0, 0)">
        {/* Base pedestal for all pieces */}
        <Path
          d="M 22 84 Q 50 80 78 84 L 81 90 Q 50 93 19 90 Z"
          fill={fillMain}
          stroke={strokeColor}
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        <Path
          d="M 25 81 Q 50 78 75 81 L 78 84 Q 50 80 22 84 Z"
          fill={innerShadow}
          opacity="0.4"
        />

        {/* Piece specific geometry */}
        {type === 'p' && (
          <G>
            {/* Pawn Body & Head */}
            <Path
              d="M 34 81 Q 40 58 45 42 Q 38 42 38 38 Q 38 34 50 34 Q 62 34 62 38 Q 62 42 55 42 Q 60 58 66 81 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            <Circle
              cx="50"
              cy="24"
              r="13"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="2.8"
            />
            {/* Highlight */}
            <Circle cx="46" cy="20" r="4.5" fill={accentColor} opacity="0.65" />
          </G>
        )}

        {type === 'r' && (
          <G>
            {/* Rook Tower */}
            <Path
              d="M 30 81 L 34 40 L 26 38 L 26 23 L 36 23 L 36 30 L 45 30 L 45 23 L 55 23 L 55 30 L 64 30 L 64 23 L 74 23 L 74 38 L 66 40 L 70 81 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            {/* Brick / parapet line */}
            <Path d="M 28 38 Q 50 36 72 38" stroke={strokeColor} strokeWidth="2.2" fill="none" />
            <Path d="M 33 46 Q 50 44 67 46" stroke={strokeColor} strokeWidth="1.8" fill="none" opacity="0.6" />
          </G>
        )}

        {type === 'n' && (
          <G>
            {/* Knight Horse Head */}
            <Path
              d="M 28 81 Q 30 65 24 55 Q 18 45 26 38 Q 34 32 37 20 Q 44 14 54 18 Q 52 24 57 26 Q 66 22 72 30 Q 76 38 74 48 Q 72 58 72 81 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            {/* Mane & Snout details */}
            <Path
              d="M 26 38 Q 32 44 38 43 Q 44 42 42 48 Q 36 52 24 55"
              fill={innerShadow}
              opacity="0.35"
            />
            <Circle cx="36" cy="30" r="3.2" fill={strokeColor} />
            <Path d="M 22 45 L 28 47" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
            <Path d="M 52 22 Q 62 26 65 38 Q 67 50 68 62" stroke={strokeColor} strokeWidth="2.2" fill="none" opacity="0.75" />
          </G>
        )}

        {type === 'b' && (
          <G>
            {/* Bishop Mitre */}
            <Path
              d="M 32 81 Q 38 60 40 45 Q 32 42 32 36 Q 32 25 50 16 Q 68 25 68 36 Q 68 42 60 45 Q 62 60 68 81 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            {/* Bishop cut / slit */}
            <Path d="M 44 26 L 56 38" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            <Circle cx="50" cy="13" r="3.8" fill={fillMain} stroke={strokeColor} strokeWidth="2.2" />
            <Path d="M 36 45 Q 50 42 64 45" stroke={strokeColor} strokeWidth="2" fill="none" />
          </G>
        )}

        {type === 'q' && (
          <G>
            {/* Queen Coronet & Robe */}
            <Path
              d="M 30 81 Q 38 58 40 44 L 25 32 L 37 36 L 50 22 L 63 36 L 75 32 L 60 44 Q 62 58 70 81 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            {/* Crown pearls */}
            <Circle cx="25" cy="30" r="3.2" fill={fillMain} stroke={strokeColor} strokeWidth="2" />
            <Circle cx="37" cy="34" r="3.2" fill={fillMain} stroke={strokeColor} strokeWidth="2" />
            <Circle cx="50" cy="20" r="3.8" fill={fillMain} stroke={strokeColor} strokeWidth="2" />
            <Circle cx="63" cy="34" r="3.2" fill={fillMain} stroke={strokeColor} strokeWidth="2" />
            <Circle cx="75" cy="30" r="3.2" fill={fillMain} stroke={strokeColor} strokeWidth="2" />
            <Path d="M 34 46 Q 50 42 66 46" stroke={strokeColor} strokeWidth="2.2" fill="none" />
          </G>
        )}

        {type === 'k' && (
          <G>
            {/* King Imperial Crown */}
            <Path
              d="M 30 81 Q 38 58 38 42 L 30 32 Q 36 28 50 30 Q 64 28 70 32 L 62 42 Q 62 58 70 81 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            {/* Cross on top */}
            <Path
              d="M 50 12 L 50 26 M 43 17 L 57 17"
              stroke={strokeColor}
              strokeWidth="3.2"
              strokeLinecap="square"
            />
            {/* Crown arches */}
            <Path d="M 34 32 Q 50 38 66 32" stroke={strokeColor} strokeWidth="2.2" fill="none" />
            <Path d="M 36 44 Q 50 40 64 44" stroke={strokeColor} strokeWidth="2" fill="none" />
          </G>
        )}
      </G>
    </Svg>
  );
}
