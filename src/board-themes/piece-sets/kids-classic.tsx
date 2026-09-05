import React from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import { colorOf, typeOf, type Piece } from '@/chess';

export function renderKidsClassicPiece(piece: Piece, size: number): React.ReactElement {
  const isWhite = colorOf(piece) === 'w';
  const type = typeOf(piece);

  const fillMain = isWhite ? 'url(#kids-white-grad)' : 'url(#kids-black-grad)';
  const strokeColor = isWhite ? '#1E293B' : '#00E5FF';
  const strokeW = isWhite ? '2.4' : '2.6';
  const eyeColor = isWhite ? '#0F172A' : '#7DD3FC';
  const smileColor = isWhite ? '#334155' : '#38BDF8';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="kids-white-grad" x1="0" y1="0" x2="0.2" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="40%" stopColor="#FEF3C7" />
          <Stop offset="100%" stopColor="#FDE68A" />
        </LinearGradient>
        <LinearGradient id="kids-black-grad" x1="0" y1="0" x2="0.2" y2="1">
          <Stop offset="0%" stopColor="#38BDF8" />
          <Stop offset="40%" stopColor="#1E293B" />
          <Stop offset="100%" stopColor="#090D16" />
        </LinearGradient>
        <RadialGradient id="kids-blush" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FB7185" stopOpacity="0.6" />
          <Stop offset="100%" stopColor="#FB7185" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <G>
        {/* Contact shadow */}
        <Path d="M 18 90 Q 50 94 82 90 Q 50 87 18 90 Z" fill="#000000" opacity={0.35} />

        {/* Rounded friendly pedestal base */}
        <Path
          d="M 22 82 Q 50 78 78 82 L 80 88 Q 50 91 20 88 Z"
          fill={fillMain}
          stroke={strokeColor}
          strokeWidth={strokeW}
          strokeLinejoin="round"
        />

        {/* --- PIECE SPECIFIC FRIENDLY STAUNTON SHAPES --- */}

        {/* 1. PAWN (Peón Soldado) */}
        {type === 'p' && (
          <G>
            <Path
              d="M 33 82 Q 40 58 44 42 Q 38 42 38 38 Q 38 34 50 34 Q 62 34 62 38 Q 62 42 56 42 Q 60 58 67 82 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth={strokeW}
              strokeLinejoin="round"
            />
            {/* Friendly Sphere */}
            <Circle cx="50" cy="24" r="14" fill={fillMain} stroke={strokeColor} strokeWidth={strokeW} />
            {/* Cheerful face */}
            <Circle cx="45" cy="23" r="1.8" fill={eyeColor} />
            <Circle cx="55" cy="23" r="1.8" fill={eyeColor} />
            <Path d="M 47 28 Q 50 31 53 28" stroke={smileColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </G>
        )}

        {/* 2. KNIGHT (Caballito Valiente) */}
        {type === 'n' && (
          <G>
            <Path
              d="M 32 82 C 34 68 30 52 38 40 C 42 34 46 22 56 18 C 66 18 72 26 70 34 C 74 34 78 38 78 44 C 78 50 70 54 62 52 C 58 58 62 70 68 82 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth={strokeW}
              strokeLinejoin="round"
            />
            {/* Eye and Ear */}
            <Path d="M 54 18 L 52 10 L 58 14 Z" fill={fillMain} stroke={strokeColor} strokeWidth={strokeW} />
            <Circle cx="64" cy="32" r="2.2" fill={eyeColor} />
            <Circle cx="65" cy="31" r="0.8" fill="#FFFFFF" />
            {/* Friendly snout */}
            <Circle cx="73" cy="42" r="1.2" fill={smileColor} />
          </G>
        )}

        {/* 3. BISHOP (Alfil Mago) */}
        {type === 'b' && (
          <G>
            <Path
              d="M 33 82 Q 40 56 43 42 Q 36 42 36 38 Q 36 34 50 34 Q 64 34 64 38 Q 64 42 57 42 Q 60 56 67 82 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />
            {/* Friendly Mitre Head */}
            <Path
              d="M 35 34 C 35 18 50 12 50 12 C 50 12 65 18 65 34 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />
            {/* Top Pommel */}
            <Circle cx="50" cy="11" r="3.5" fill={fillMain} stroke={strokeColor} strokeWidth={strokeW} />
            {/* Mitre cut */}
            <Path d="M 44 20 L 56 28" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
            <Circle cx="45" cy="26" r="1.8" fill={eyeColor} />
            <Circle cx="55" cy="26" r="1.8" fill={eyeColor} />
          </G>
        )}

        {/* 4. ROOK (Torre Castillo) */}
        {type === 'r' && (
          <G>
            {/* Castle Body */}
            <Path
              d="M 32 82 L 35 44 L 65 44 L 68 82 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth={strokeW}
              strokeLinejoin="round"
            />
            {/* Crenellated Castle Top */}
            <Path
              d="M 28 44 L 28 26 L 36 26 L 36 33 L 45 33 L 45 26 L 55 26 L 55 33 L 64 33 L 64 26 L 72 26 L 72 44 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth={strokeW}
              strokeLinejoin="round"
            />
            {/* Castle Window Eyes */}
            <Circle cx="45" cy="56" r="2.2" fill={eyeColor} />
            <Circle cx="55" cy="56" r="2.2" fill={eyeColor} />
            <Path d="M 47 64 Q 50 67 53 64" stroke={smileColor} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </G>
        )}

        {/* 5. QUEEN (Reina Estrella) */}
        {type === 'q' && (
          <G>
            <Path
              d="M 30 82 Q 38 56 42 42 Q 34 42 34 38 Q 34 34 50 34 Q 66 34 66 38 Q 66 42 58 42 Q 62 56 70 82 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />
            {/* Tiara / 5 Points Crown */}
            <Path
              d="M 26 34 L 30 18 L 40 28 L 50 14 L 60 28 L 70 18 L 74 34 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth={strokeW}
              strokeLinejoin="round"
            />
            {/* Jewels on crown */}
            <Circle cx="30" cy="17" r="2.5" fill="#F59E0B" />
            <Circle cx="50" cy="13" r="3" fill="#EC4899" />
            <Circle cx="70" cy="17" r="2.5" fill="#F59E0B" />
            {/* Royal Queen Face */}
            <Circle cx="45" cy="48" r="2" fill={eyeColor} />
            <Circle cx="55" cy="48" r="2" fill={eyeColor} />
            <Path d="M 47 55 Q 50 58 53 55" stroke={smileColor} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </G>
        )}

        {/* 6. KING (Rey Sabio) */}
        {type === 'k' && (
          <G>
            <Path
              d="M 30 82 Q 38 56 42 42 Q 34 42 34 38 Q 34 34 50 34 Q 66 34 66 38 Q 66 42 58 42 Q 62 56 70 82 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />
            {/* Rounded King Crown */}
            <Path
              d="M 28 34 C 28 20 40 18 50 18 C 60 18 72 20 72 34 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />
            {/* Big Royal Cross */}
            <Path d="M 50 6 L 50 18 M 44 11 L 56 11" stroke="#F59E0B" strokeWidth="3.2" strokeLinecap="round" />
            {/* King Face */}
            <Circle cx="45" cy="27" r="2.2" fill={eyeColor} />
            <Circle cx="55" cy="27" r="2.2" fill={eyeColor} />
            <Path d="M 46 31 Q 50 34 54 31" stroke={smileColor} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </G>
        )}
      </G>
    </Svg>
  );
}
