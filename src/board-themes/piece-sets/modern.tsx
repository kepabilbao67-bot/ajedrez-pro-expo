import React from 'react';
import Svg, { Path, Polygon, Circle, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colorOf, typeOf, type Piece } from '@/chess';

export function renderModernPiece(piece: Piece, size: number): React.ReactElement {
  const isWhite = colorOf(piece) === 'w';
  const type = typeOf(piece);

  const fillMain = isWhite ? 'url(#modern-w-grad)' : 'url(#modern-b-grad)';
  const strokeColor = isWhite ? '#0B131D' : '#04070B';
  const accentColor = isWhite ? '#00E5B4' : '#F2C94C';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="modern-w-grad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#E6EEF8" />
        </LinearGradient>
        <LinearGradient id="modern-b-grad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#253241" />
          <Stop offset="100%" stopColor="#101721" />
        </LinearGradient>
      </Defs>

      <G transform="translate(0, 0)">
        {/* Minimalist modern base */}
        <Rect
          x="24"
          y="84"
          width="52"
          height="8"
          rx="4"
          fill={fillMain}
          stroke={strokeColor}
          strokeWidth="3"
        />
        {/* Modern accent stripe on base */}
        <Rect x="30" y="86" width="40" height="3" rx="1.5" fill={accentColor} />

        {/* Piece specific geometric shapes */}
        {type === 'p' && (
          <G>
            {/* Triangular Minimalist Pawn */}
            <Polygon
              points="50,22 32,82 68,82"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <Circle cx="50" cy="36" r="6" fill={accentColor} stroke={strokeColor} strokeWidth="2.5" />
          </G>
        )}

        {type === 'r' && (
          <G>
            {/* Crisp Geometric Rook */}
            <Polygon
              points="30,82 34,42 26,42 26,22 40,22 40,32 60,32 60,22 74,22 74,42 66,42 70,82"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Horizontal modern slit */}
            <Rect x="36" y="50" width="28" height="4" rx="2" fill={accentColor} />
          </G>
        )}

        {type === 'n' && (
          <G>
            {/* Angular Origami / Low-Poly Knight */}
            <Polygon
              points="28,82 24,52 38,36 34,18 54,26 68,40 72,82"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <Polygon
              points="24,52 42,48 50,60 36,66"
              fill={accentColor}
              opacity="0.85"
            />
            <Circle cx="44" cy="34" r="3.5" fill={strokeColor} />
          </G>
        )}

        {type === 'b' && (
          <G>
            {/* Diamond / Hexagonal Bishop */}
            <Polygon
              points="50,14 68,38 58,82 42,82 32,38"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Bishop cross slit */}
            <Path d="M 50 26 L 50 56 M 40 38 L 60 38" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" />
          </G>
        )}

        {type === 'q' && (
          <G>
            {/* Sharp 3-prong Queen */}
            <Polygon
              points="30,82 36,46 22,30 40,40 50,16 60,40 78,30 64,46 70,82"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <Circle cx="50" cy="54" r="5" fill={accentColor} stroke={strokeColor} strokeWidth="2" />
          </G>
        )}

        {type === 'k' && (
          <G>
            {/* Monolithic King */}
            <Polygon
              points="32,82 36,42 28,34 50,26 72,34 64,42 68,82"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Modern top cross */}
            <Path
              d="M 50 10 L 50 24 M 42 16 L 58 16"
              stroke={accentColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </G>
        )}
      </G>
    </Svg>
  );
}
