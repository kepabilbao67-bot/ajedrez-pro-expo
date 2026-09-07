import React from 'react';
import Svg, { Path, Circle, G, Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';
import { colorOf, typeOf, type Piece } from '@/chess';

export function renderStauntonPiece(piece: Piece, size: number): React.ReactElement {
  const isWhite = colorOf(piece) === 'w';
  const type = typeOf(piece);

  const fillMain = isWhite ? 'url(#staunton-white-grad)' : 'url(#staunton-black-grad)';
  const strokeColor = isWhite ? '#261D0D' : '#F8FAFC';
  const innerStroke = isWhite ? '#FFE5A3' : '#64748B';
  const accentColor = isWhite ? '#FFF5D0' : '#F1F5F9';
  const innerShadow = isWhite ? '#C49A3D' : '#1E293B';
  const rimLight = isWhite ? '#FFFDF5' : '#FFFFFF';
  const strokeW = isWhite ? '2.5' : '3.2';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* White Pieces: Luxurious Polished Metallic Gold with Rich Specular Highlight */}
        <LinearGradient id="staunton-white-grad" x1="0" y1="0" x2="0.3" y2="1">
          <Stop offset="0%" stopColor="#FFFDF5" />
          <Stop offset="25%" stopColor="#FFE7AB" />
          <Stop offset="65%" stopColor="#E5B869" />
          <Stop offset="100%" stopColor="#C99738" />
        </LinearGradient>

        {/* Black Pieces: Sculpted Obsidian Charcoal with Metallic Titanium Specular Volumetrics */}
        <LinearGradient id="staunton-black-grad" x1="0" y1="0" x2="0.35" y2="1">
          <Stop offset="0%" stopColor="#475569" />
          <Stop offset="25%" stopColor="#334155" />
          <Stop offset="65%" stopColor="#1E293B" />
          <Stop offset="100%" stopColor="#0F172A" />
        </LinearGradient>

        <RadialGradient id="staunton-white-radial" cx="35%" cy="30%" r="65%">
          <Stop offset="0%" stopColor="#FFFDF5" />
          <Stop offset="35%" stopColor="#FFE7AB" />
          <Stop offset="75%" stopColor="#E5B869" />
          <Stop offset="100%" stopColor="#BA8A2D" />
        </RadialGradient>

        <RadialGradient id="staunton-black-radial" cx="35%" cy="30%" r="65%">
          <Stop offset="0%" stopColor="#64748B" />
          <Stop offset="35%" stopColor="#475569" />
          <Stop offset="75%" stopColor="#1E293B" />
          <Stop offset="100%" stopColor="#0F172A" />
        </RadialGradient>
      </Defs>

      <G transform="translate(0, 0)">
        {/* Grounding Contact Drop Shadow under base */}
        <Path
          d="M 16 91 Q 50 95 84 91 Q 50 88 16 91 Z"
          fill="#000000"
          opacity={isWhite ? 0.45 : 0.35}
        />

        {/* Base pedestal for all pieces */}
        <Path
          d="M 20 83 Q 50 79 80 83 L 83 90 Q 50 93 17 90 Z"
          fill={fillMain}
          stroke={strokeColor}
          strokeWidth={strokeW}
          strokeLinejoin="round"
        />
        {/* Tiered Bevel on Base */}
        <Path
          d="M 24 80 Q 50 77 76 80 L 79 83 Q 50 79 21 83 Z"
          fill={innerShadow}
          stroke={isWhite ? 'none' : innerStroke}
          strokeWidth={isWhite ? '0' : '1.2'}
          opacity={isWhite ? 0.5 : 0.85}
        />
        {/* Base Rim Highlight */}
        <Path
          d="M 22 83 Q 50 80 78 83"
          stroke={rimLight}
          strokeWidth="1.8"
          fill="none"
          opacity={isWhite ? 0.9 : 0.95}
        />

        {/* --- PIECE SPECIFIC GEOMETRY --- */}

        {/* Pawn (Peón) */}
        {type === 'p' && (
          <G>
            {/* Body */}
            <Path
              d="M 33 80 Q 40 56 44 40 Q 37 40 37 36 Q 37 32 50 32 Q 63 32 63 36 Q 63 40 56 40 Q 60 56 67 80 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth={strokeW}
              strokeLinejoin="round"
            />
            {/* Sphere Head */}
            <Circle
              cx="50"
              cy="22"
              r="14"
              fill={isWhite ? 'url(#staunton-white-radial)' : 'url(#staunton-black-radial)'}
              stroke={strokeColor}
              strokeWidth={strokeW}
            />
            {/* Specular Glint */}
            <Circle cx="44" cy="17" r="4.2" fill={accentColor} opacity={isWhite ? 0.9 : 0.8} />
            <Circle cx="43" cy="16" r="1.8" fill="#FFFFFF" opacity={0.95} />
            {/* Rim reflex on lower sphere */}
            <Path d="M 39 30 Q 50 35 61 30" stroke={rimLight} strokeWidth="1.5" fill="none" opacity={isWhite ? 0.8 : 0.9} />
          </G>
        )}

        {/* Rook (Torre) */}
        {type === 'r' && (
          <G>
            {/* Main Castle Walls & Battlement */}
            <Path
              d="M 28 80 L 33 39 L 24 37 L 24 21 L 35 21 L 35 28 L 44 28 L 44 21 L 56 21 L 56 28 L 65 28 L 65 21 L 76 21 L 76 37 L 67 39 L 72 80 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth={strokeW}
              strokeLinejoin="round"
            />
            {/* Parapet cornice band */}
            <Path d="M 26 37 Q 50 35 74 37" stroke={strokeColor} strokeWidth="2.2" fill="none" />
            <Path d="M 28 38 Q 50 36 72 38" stroke={rimLight} strokeWidth="1.6" fill="none" opacity={0.9} />
            <Path d="M 31 45 Q 50 43 69 45" stroke={isWhite ? strokeColor : rimLight} strokeWidth="1.5" fill="none" opacity={isWhite ? 0.4 : 0.7} />
            {/* Battlement top edge highlights */}
            <Path d="M 25 22 L 34 22 M 45 22 L 55 22 M 66 22 L 75 22" stroke={accentColor} strokeWidth="1.8" strokeLinecap="round" opacity={0.95} />
          </G>
        )}

        {/* Knight (Caballo) */}
        {type === 'n' && (
          <G>
            {/* Sculpted horse body and head */}
            <Path
              d="M 26 80 Q 28 64 22 54 Q 16 43 25 36 Q 34 30 36 17 Q 43 11 53 15 Q 51 21 56 23 Q 66 19 73 28 Q 77 37 75 48 Q 73 58 74 80 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth={strokeW}
              strokeLinejoin="round"
            />
            {/* Muzzle and Jaw relief contour */}
            <Path
              d="M 24 37 Q 31 43 37 42 Q 43 41 41 47 Q 35 51 23 54"
              fill={innerShadow}
              stroke={isWhite ? 'none' : innerStroke}
              strokeWidth={isWhite ? '0' : '1.2'}
              opacity={isWhite ? 0.35 : 0.8}
            />
            {/* High-contrast Eye */}
            <Circle cx="35" cy="28" r="3.4" fill={isWhite ? '#0F172A' : '#F8FAFC'} stroke={isWhite ? '#64748B' : '#0F172A'} strokeWidth="1" />
            <Circle cx="34.5" cy="27.5" r="1.3" fill={isWhite ? '#FFFFFF' : '#0F172A'} opacity={0.95} />
            {/* Nostril / Snout accent */}
            <Path d="M 21 44 L 27 46" stroke={isWhite ? strokeColor : rimLight} strokeWidth="2.2" strokeLinecap="round" />
            {/* Flowing Mane highlight */}
            <Path d="M 51 19 Q 62 23 66 36 Q 68 49 69 62" stroke={rimLight} strokeWidth="2.4" fill="none" opacity={isWhite ? 0.85 : 0.9} />
            {/* Forehead crest gleam */}
            <Path d="M 39 15 Q 46 13 52 16" stroke={accentColor} strokeWidth="2" fill="none" strokeLinecap="round" opacity={0.95} />
          </G>
        )}

        {/* Bishop (Alfil) */}
        {type === 'b' && (
          <G>
            {/* Main Mitre Body */}
            <Path
              d="M 30 80 Q 37 58 39 43 Q 30 40 30 34 Q 30 22 50 14 Q 70 22 70 34 Q 70 40 61 43 Q 63 58 70 80 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth={strokeW}
              strokeLinejoin="round"
            />
            {/* Wide, Prominent Mitre Cut Notch (High Visibility) */}
            <Path
              d="M 43 23 L 57 37"
              stroke={isWhite ? '#0F172A' : '#F8FAFC'}
              strokeWidth="3.6"
              strokeLinecap="round"
            />
            {/* Top Sphere Finial (Pearl) */}
            <Circle
              cx="50"
              cy="11"
              r="4.6"
              fill={isWhite ? 'url(#staunton-white-radial)' : 'url(#staunton-black-radial)'}
              stroke={strokeColor}
              strokeWidth={isWhite ? '2' : '2.4'}
            />
            <Circle cx="48" cy="9.5" r="1.6" fill="#FFFFFF" opacity={0.95} />
            {/* Middle collar curve */}
            <Path d="M 34 43 Q 50 40 66 43" stroke={rimLight} strokeWidth="1.8" fill="none" opacity={0.85} />
          </G>
        )}

        {/* Queen (Dama) */}
        {type === 'q' && (
          <G>
            {/* Queen Body & 5-Point Crown */}
            <Path
              d="M 28 80 Q 36 56 39 42 L 23 29 L 36 34 L 50 19 L 64 34 L 77 29 L 61 42 Q 64 56 72 80 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth={strokeW}
              strokeLinejoin="round"
            />
            {/* 5 Distinct Crown Pearls */}
            <Circle cx="23" cy="27" r="3.6" fill={accentColor} stroke={strokeColor} strokeWidth="1.8" />
            <Circle cx="36" cy="32" r="3.6" fill={accentColor} stroke={strokeColor} strokeWidth="1.8" />
            <Circle cx="50" cy="17" r="4.8" fill={accentColor} stroke={strokeColor} strokeWidth="2" />
            <Circle cx="64" cy="32" r="3.6" fill={accentColor} stroke={strokeColor} strokeWidth="1.8" />
            <Circle cx="77" cy="27" r="3.6" fill={accentColor} stroke={strokeColor} strokeWidth="1.8" />
            {/* Center Pearl Specular Highlight */}
            <Circle cx="49" cy="15.5" r="1.6" fill="#FFFFFF" opacity={0.95} />
            {/* Royal Waist Band */}
            <Path d="M 32 44 Q 50 40 68 44" stroke={rimLight} strokeWidth="2" fill="none" opacity={0.9} />
          </G>
        )}

        {/* King (Rey) */}
        {type === 'k' && (
          <G>
            {/* Regal Crown Body */}
            <Path
              d="M 28 80 Q 36 56 36 40 L 28 29 Q 35 25 50 27 Q 65 25 72 29 L 64 40 Q 64 56 72 80 Z"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth={strokeW}
              strokeLinejoin="round"
            />
            {/* Prominent Imperial Cross */}
            {/* Outer Cross Silhouette */}
            <Path
              d="M 50 7 L 50 25 M 40 14 L 60 14"
              stroke={strokeColor}
              strokeWidth="4.2"
              strokeLinecap="square"
            />
            {/* Inner Glowing Cross Core */}
            <Path
              d="M 50 8 L 50 24 M 41 14 L 59 14"
              stroke={accentColor}
              strokeWidth="2.4"
              strokeLinecap="square"
            />
            <Circle cx="50" cy="14" r="1.8" fill="#FFFFFF" opacity={0.95} />
            {/* Crown base arches */}
            <Path d="M 32 29 Q 50 35 68 29" stroke={isWhite ? strokeColor : innerStroke} strokeWidth="2" fill="none" />
            <Path d="M 34 42 Q 50 38 66 42" stroke={rimLight} strokeWidth="2" fill="none" opacity={0.9} />
          </G>
        )}
      </G>
    </Svg>
  );
}
