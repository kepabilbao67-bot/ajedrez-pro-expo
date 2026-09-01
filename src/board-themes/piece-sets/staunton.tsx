import React from 'react';
import Svg, { Path, Circle, G, Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';
import { colorOf, typeOf, type Piece } from '@/chess';

export function renderStauntonPiece(piece: Piece, size: number): React.ReactElement {
  const isWhite = colorOf(piece) === 'w';
  const type = typeOf(piece);

  const fillMain = isWhite ? 'url(#staunton-gold-grad)' : 'url(#staunton-obsidian-grad)';
  const strokeColor = isWhite ? '#785208' : '#03080E';
  const accentColor = isWhite ? '#FFF8D6' : '#00D2FF';
  const innerShadow = isWhite ? '#B8860B' : '#002B4D';
  const rimLight = isWhite ? '#FFE89C' : '#00E5FF';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* White Pieces: Rich Metallic Gold Gradient */}
        <LinearGradient id="staunton-gold-grad" x1="0" y1="0" x2="0.3" y2="1">
          <Stop offset="0%" stopColor="#FFF2B2" />
          <Stop offset="25%" stopColor="#FFDE6A" />
          <Stop offset="65%" stopColor="#E5B842" />
          <Stop offset="90%" stopColor="#BA8821" />
          <Stop offset="100%" stopColor="#785208" />
        </LinearGradient>

        {/* Black Pieces: Deep Polished Obsidian with Electric Blue Undertone */}
        <LinearGradient id="staunton-obsidian-grad" x1="0" y1="0" x2="0.3" y2="1">
          <Stop offset="0%" stopColor="#2A3C4D" />
          <Stop offset="25%" stopColor="#152230" />
          <Stop offset="65%" stopColor="#0B131C" />
          <Stop offset="100%" stopColor="#04080E" />
        </LinearGradient>

        <RadialGradient id="staunton-gold-radial" cx="35%" cy="30%" r="65%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="40%" stopColor="#FFE07A" />
          <Stop offset="80%" stopColor="#D4A017" />
          <Stop offset="100%" stopColor="#7A5200" />
        </RadialGradient>

        <RadialGradient id="staunton-obsidian-radial" cx="35%" cy="30%" r="65%">
          <Stop offset="0%" stopColor="#3A506B" />
          <Stop offset="40%" stopColor="#1C2541" />
          <Stop offset="80%" stopColor="#0B131F" />
          <Stop offset="100%" stopColor="#02060B" />
        </RadialGradient>
      </Defs>

      <G transform="translate(0, 0)">
        {/* Soft Drop Shadow under base */}
        <Path
          d="M 17 91 Q 50 95 83 91 Q 50 88 17 91 Z"
          fill="#000000"
          opacity="0.45"
        />

        {/* Base pedestal for all pieces */}
        <Path
          d="M 22 84 Q 50 80 78 84 L 81 90 Q 50 93 19 90 Z"
          fill={fillMain}
          stroke={strokeColor}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {/* Metallic Bevel Ring on Base */}
        <Path
          d="M 25 81 Q 50 78 75 81 L 78 84 Q 50 80 22 84 Z"
          fill={innerShadow}
          opacity={isWhite ? 0.45 : 0.6}
        />
        {/* Base Rim Highlight */}
        <Path
          d="M 24 84 Q 50 81 76 84"
          stroke={rimLight}
          strokeWidth="1.2"
          fill="none"
          opacity={isWhite ? 0.85 : 0.6}
        />

        {/* --- PIECE SPECIFIC GEOMETRY --- */}

        {/* Pawn */}
        {type === 'p' && (
          <G>
            {/* Body */}
            <Path
              d="M 34 81 Q 40 58 45 42 Q 38 42 38 38 Q 38 34 50 34 Q 62 34 62 38 Q 62 42 55 42 Q 60 58 66 81 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            {/* Sphere Head */}
            <Circle
              cx="50"
              cy="24"
              r="13"
              fill={isWhite ? 'url(#staunton-gold-radial)' : 'url(#staunton-obsidian-radial)'}
              stroke={strokeColor}
              strokeWidth="2.4"
            />
            {/* Metallic Specular Glint */}
            <Circle cx="45" cy="19" r="4.2" fill={accentColor} opacity={isWhite ? 0.85 : 0.55} />
            <Circle cx="44" cy="18" r="1.8" fill="#FFFFFF" opacity={isWhite ? 0.95 : 0.7} />
          </G>
        )}

        {/* Rook */}
        {type === 'r' && (
          <G>
            <Path
              d="M 30 81 L 34 40 L 26 38 L 26 23 L 36 23 L 36 30 L 45 30 L 45 23 L 55 23 L 55 30 L 64 30 L 64 23 L 74 23 L 74 38 L 66 40 L 70 81 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            {/* Parapet line & Embossed metallic band */}
            <Path d="M 28 38 Q 50 36 72 38" stroke={strokeColor} strokeWidth="2" fill="none" />
            <Path d="M 30 39 Q 50 37 70 39" stroke={rimLight} strokeWidth="1.2" fill="none" opacity={0.7} />
            <Path d="M 33 46 Q 50 44 67 46" stroke={strokeColor} strokeWidth="1.8" fill="none" opacity="0.6" />
          </G>
        )}

        {/* Knight */}
        {type === 'n' && (
          <G>
            <Path
              d="M 28 81 Q 30 65 24 55 Q 18 45 26 38 Q 34 32 37 20 Q 44 14 54 18 Q 52 24 57 26 Q 66 22 72 30 Q 76 38 74 48 Q 72 58 72 81 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            {/* Muzzle and Jaw relief */}
            <Path
              d="M 26 38 Q 32 44 38 43 Q 44 42 42 48 Q 36 52 24 55"
              fill={innerShadow}
              opacity={isWhite ? 0.35 : 0.6}
            />
            {/* Eye */}
            <Circle cx="36" cy="30" r="3.2" fill={isWhite ? '#4A3305' : '#00D2FF'} />
            <Circle cx="35.5" cy="29.5" r="1.2" fill="#FFFFFF" opacity={0.9} />
            {/* Snout line */}
            <Path d="M 22 45 L 28 47" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
            {/* Flowing Mane highlight */}
            <Path d="M 52 22 Q 62 26 65 38 Q 67 50 68 62" stroke={rimLight} strokeWidth="2.2" fill="none" opacity={isWhite ? 0.8 : 0.6} />
          </G>
        )}

        {/* Bishop */}
        {type === 'b' && (
          <G>
            <Path
              d="M 32 81 Q 38 60 40 45 Q 32 42 32 36 Q 32 25 50 16 Q 68 25 68 36 Q 68 42 60 45 Q 62 60 68 81 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            {/* Mitre cut slit */}
            <Path d="M 44 26 L 56 38" stroke={isWhite ? '#5A3E06' : '#00D2FF'} strokeWidth="2.8" strokeLinecap="round" />
            {/* Top sphere pearl */}
            <Circle cx="50" cy="13" r="4" fill={isWhite ? 'url(#staunton-gold-radial)' : 'url(#staunton-obsidian-radial)'} stroke={strokeColor} strokeWidth="2" />
            <Circle cx="48" cy="11.5" r="1.4" fill="#FFFFFF" opacity={0.9} />
            <Path d="M 36 45 Q 50 42 64 45" stroke={strokeColor} strokeWidth="2" fill="none" />
          </G>
        )}

        {/* Queen */}
        {type === 'q' && (
          <G>
            <Path
              d="M 30 81 Q 38 58 40 44 L 25 32 L 37 36 L 50 22 L 63 36 L 75 32 L 60 44 Q 62 58 70 81 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            {/* Crown pearls in gleaming gold / cyan */}
            <Circle cx="25" cy="30" r="3.2" fill={isWhite ? '#FFE5A3' : '#00D2FF'} stroke={strokeColor} strokeWidth="1.8" />
            <Circle cx="37" cy="34" r="3.2" fill={isWhite ? '#FFE5A3' : '#00D2FF'} stroke={strokeColor} strokeWidth="1.8" />
            <Circle cx="50" cy="20" r="4" fill={isWhite ? '#FFE5A3' : '#00D2FF'} stroke={strokeColor} strokeWidth="2" />
            <Circle cx="63" cy="34" r="3.2" fill={isWhite ? '#FFE5A3' : '#00D2FF'} stroke={strokeColor} strokeWidth="1.8" />
            <Circle cx="75" cy="30" r="3.2" fill={isWhite ? '#FFE5A3' : '#00D2FF'} stroke={strokeColor} strokeWidth="1.8" />
            <Path d="M 34 46 Q 50 42 66 46" stroke={rimLight} strokeWidth="1.8" fill="none" opacity={0.7} />
          </G>
        )}

        {/* King */}
        {type === 'k' && (
          <G>
            <Path
              d="M 30 81 Q 38 58 38 42 L 30 32 Q 36 28 50 30 Q 64 28 70 32 L 62 42 Q 62 58 70 81 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            {/* Imperial Cross with dual-tone gleam */}
            <Path
              d="M 50 11 L 50 26 M 43 17 L 57 17"
              stroke={strokeColor}
              strokeWidth="3.2"
              strokeLinecap="square"
            />
            <Path
              d="M 50 12 L 50 25 M 44 17 L 56 17"
              stroke={rimLight}
              strokeWidth="1.6"
              strokeLinecap="square"
            />
            <Path d="M 34 32 Q 50 38 66 32" stroke={strokeColor} strokeWidth="2" fill="none" />
            <Path d="M 36 44 Q 50 40 64 44" stroke={rimLight} strokeWidth="1.8" fill="none" opacity={0.65} />
          </G>
        )}
      </G>
    </Svg>
  );
}
