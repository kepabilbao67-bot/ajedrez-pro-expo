import React from 'react';
import Svg, {
  Path,
  Circle,
  Ellipse,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { colorOf, typeOf, type Piece } from '@/chess';

export function renderRealistic3DPiece(piece: Piece, size: number): React.ReactElement {
  const isWhite = colorOf(piece) === 'w';
  const type = typeOf(piece);

  const prefix = isWhite ? 'r3d-w-' : 'r3d-b-';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* Gradients for White 3D Pieces (Alabaster / Ivory Volume) */}
        <RadialGradient id="r3d-w-sphere" cx="42%" cy="35%" r="60%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="45%" stopColor="#FAF4E6" />
          <Stop offset="80%" stopColor="#D5C5A8" />
          <Stop offset="100%" stopColor="#9C896B" />
        </RadialGradient>
        <LinearGradient id="r3d-w-body" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#FAF6ED" />
          <Stop offset="30%" stopColor="#FFFFFF" />
          <Stop offset="70%" stopColor="#D8CAAF" />
          <Stop offset="100%" stopColor="#9E8D70" />
        </LinearGradient>
        <LinearGradient id="r3d-w-bevel" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#8A775C" />
        </LinearGradient>

        {/* Gradients for Black 3D Pieces (Polished Obsidian Volume) */}
        <RadialGradient id="r3d-b-sphere" cx="40%" cy="35%" r="60%">
          <Stop offset="0%" stopColor="#63554A" />
          <Stop offset="45%" stopColor="#30261E" />
          <Stop offset="80%" stopColor="#17110C" />
          <Stop offset="100%" stopColor="#050302" />
        </RadialGradient>
        <LinearGradient id="r3d-b-body" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#4A3F36" />
          <Stop offset="30%" stopColor="#6B5C50" />
          <Stop offset="70%" stopColor="#221A14" />
          <Stop offset="100%" stopColor="#0A0705" />
        </LinearGradient>
        <LinearGradient id="r3d-b-bevel" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#5E4E42" />
          <Stop offset="100%" stopColor="#050302" />
        </LinearGradient>
      </Defs>

      <G>
        {/* Soft Contact Drop Shadow underneath base on the square */}
        <Ellipse cx="50" cy="89" rx="30" ry="6.5" fill="#000000" opacity="0.36" />
        <Ellipse cx="50" cy="88" rx="26" ry="4.5" fill="#000000" opacity="0.22" />

        {/* 3D Tiered Base */}
        <Ellipse
          cx="50"
          cy="85"
          rx="27"
          ry="7"
          fill={`url(#${prefix}bevel)`}
          stroke={isWhite ? '#6E5D47' : '#080503'}
          strokeWidth="1.2"
        />
        <Path
          d="M 23 85 Q 50 82 77 85 L 75 79 Q 50 76 25 79 Z"
          fill={`url(#${prefix}body)`}
          stroke={isWhite ? '#7D6A52' : '#0A0704'}
          strokeWidth="1"
        />
        <Ellipse
          cx="50"
          cy="79"
          rx="25"
          ry="5.5"
          fill={`url(#${prefix}bevel)`}
          stroke={isWhite ? '#8A775C' : '#120D08'}
          strokeWidth="1"
        />

        {/* 3D Pawn */}
        {type === 'p' && (
          <G>
            {/* 3D Body Stem */}
            <Path
              d="M 33 79 Q 44 54 44 42 Q 38 41 38 38 Q 38 34 50 34 Q 62 34 62 38 Q 62 41 56 42 Q 56 54 67 79 Z"
              fill={`url(#${prefix}body)`}
              stroke={isWhite ? '#7D6A52' : '#080503'}
              strokeWidth="1.5"
            />
            {/* 3D Ring Collar */}
            <Ellipse cx="50" cy="38" rx="12" ry="3.5" fill={`url(#${prefix}bevel)`} />
            {/* 3D Spherical Head */}
            <Circle
              cx="50"
              cy="23"
              r="13.5"
              fill={`url(#${prefix}sphere)`}
              stroke={isWhite ? '#7D6A52' : '#080503'}
              strokeWidth="1.2"
            />
            {/* Specular Glint */}
            <Circle cx="44" cy="18" r="3.2" fill="#FFFFFF" opacity={isWhite ? 0.8 : 0.35} />
          </G>
        )}

        {/* 3D Rook */}
        {type === 'r' && (
          <G>
            {/* 3D Cylindrical Castle */}
            <Path
              d="M 31 79 L 34 40 L 26 38 L 26 23 L 36 23 L 36 29 L 45 29 L 45 23 L 55 23 L 55 29 L 64 29 L 64 23 L 74 23 L 74 38 L 66 40 L 69 79 Z"
              fill={`url(#${prefix}body)`}
              stroke={isWhite ? '#7D6A52' : '#080503'}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* 3D Embossed Belt */}
            <Path d="M 28 38 Q 50 42 72 38" stroke={isWhite ? '#FFFFFF' : '#45382E'} strokeWidth="2.5" fill="none" opacity="0.75" />
            <Path d="M 31 46 Q 50 50 69 46" stroke={isWhite ? '#66533D' : '#0A0704'} strokeWidth="2" fill="none" />
          </G>
        )}

        {/* 3D Knight */}
        {type === 'n' && (
          <G>
            {/* 3D Horse Sculpted Head */}
            <Path
              d="M 27 79 Q 29 64 23 54 Q 17 44 26 37 Q 34 31 37 19 Q 44 13 54 17 Q 52 23 57 25 Q 66 21 73 30 Q 77 39 74 49 Q 72 59 72 79 Z"
              fill={`url(#${prefix}body)`}
              stroke={isWhite ? '#7D6A52' : '#080503'}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {/* 3D Muzzle & Eye Relief */}
            <Path
              d="M 25 38 Q 33 45 39 44 Q 45 43 43 49 Q 36 53 23 55"
              fill={isWhite ? '#D8CAAF' : '#140E0A'}
              opacity="0.5"
            />
            <Circle cx="37" cy="29" r="3.5" fill={isWhite ? '#2C2117' : '#0A0704'} />
            <Circle cx="36" cy="28" r="1.2" fill="#FFFFFF" opacity="0.8" />
            {/* Mane Depth highlight */}
            <Path d="M 52 21 Q 62 25 66 38 Q 68 51 69 63" stroke={isWhite ? '#FFFFFF' : '#5A4A3E'} strokeWidth="2.5" fill="none" opacity="0.6" />
          </G>
        )}

        {/* 3D Bishop */}
        {type === 'b' && (
          <G>
            {/* 3D Mitre Body */}
            <Path
              d="M 32 79 Q 39 58 40 44 Q 31 40 31 34 Q 31 24 50 15 Q 69 24 69 34 Q 69 40 60 44 Q 61 58 68 79 Z"
              fill={`url(#${prefix}body)`}
              stroke={isWhite ? '#7D6A52' : '#080503'}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* 3D Mitre Cut */}
            <Path d="M 43 25 L 57 37" stroke={isWhite ? '#4D3E2D' : '#050302'} strokeWidth="3.2" strokeLinecap="round" />
            {/* Mitre Top Sphere */}
            <Circle cx="50" cy="13" r="4.2" fill={`url(#${prefix}sphere)`} stroke={isWhite ? '#7D6A52' : '#080503'} strokeWidth="1" />
            <Circle cx="48" cy="11.5" r="1.4" fill="#FFFFFF" opacity={isWhite ? 0.9 : 0.4} />
          </G>
        )}

        {/* 3D Queen */}
        {type === 'q' && (
          <G>
            {/* 3D Flared Coronet Body */}
            <Path
              d="M 29 79 Q 37 57 40 43 L 24 31 L 37 35 L 50 21 L 63 35 L 76 31 L 60 43 Q 63 57 71 79 Z"
              fill={`url(#${prefix}body)`}
              stroke={isWhite ? '#7D6A52' : '#080503'}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* 3D Coronet Pearls */}
            <Circle cx="24" cy="29" r="3.5" fill={`url(#${prefix}sphere)`} />
            <Circle cx="37" cy="33" r="3.5" fill={`url(#${prefix}sphere)`} />
            <Circle cx="50" cy="19" r="4.2" fill={`url(#${prefix}sphere)`} />
            <Circle cx="63" cy="33" r="3.5" fill={`url(#${prefix}sphere)`} />
            <Circle cx="76" cy="29" r="3.5" fill={`url(#${prefix}sphere)`} />
            <Path d="M 33 46 Q 50 50 67 46" stroke={isWhite ? '#FFFFFF' : '#5A4A3E'} strokeWidth="2.2" fill="none" opacity="0.65" />
          </G>
        )}

        {/* 3D King */}
        {type === 'k' && (
          <G>
            {/* 3D Imperial Crown Body */}
            <Path
              d="M 29 79 Q 38 57 38 41 L 29 31 Q 36 27 50 29 Q 64 27 71 31 L 62 41 Q 62 57 71 79 Z"
              fill={`url(#${prefix}body)`}
              stroke={isWhite ? '#7D6A52' : '#080503'}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {/* 3D Cross on Top */}
            <Path
              d="M 50 10 L 50 25 M 42 16 L 58 16"
              stroke={isWhite ? '#7D6A52' : '#080503'}
              strokeWidth="3.8"
              strokeLinecap="square"
            />
            <Path
              d="M 50 11 L 50 24 M 43 16 L 57 16"
              stroke={isWhite ? '#FFFFFF' : '#6E5C4E'}
              strokeWidth="1.8"
              strokeLinecap="square"
            />
          </G>
        )}
      </G>
    </Svg>
  );
}
