import React from 'react';
import Svg, { Path, Polygon, Circle, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colorOf, typeOf, type Piece } from '@/chess';

export function renderModernPiece(piece: Piece, size: number): React.ReactElement {
  const isWhite = colorOf(piece) === 'w';
  const type = typeOf(piece);

  const fillMain = isWhite ? 'url(#modern-white-grad)' : 'url(#modern-black-grad)';
  const strokeColor = isWhite ? '#1E293B' : '#38BDF8';
  const accentColor = isWhite ? '#0284C7' : '#00E5FF';
  const innerAccent = isWhite ? '#38BDF8' : '#00E5FF';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="modern-white-grad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="60%" stopColor="#F1F5F9" />
          <Stop offset="100%" stopColor="#E2E8F0" />
        </LinearGradient>
        <LinearGradient id="modern-black-grad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#334155" />
          <Stop offset="40%" stopColor="#1E293B" />
          <Stop offset="80%" stopColor="#0F172A" />
          <Stop offset="100%" stopColor="#070C12" />
        </LinearGradient>
      </Defs>

      <G transform="translate(0, 0)">
        {/* Minimalist modern base */}
        <Rect
          x="22"
          y="83"
          width="56"
          height="9"
          rx="4.5"
          fill={fillMain}
          stroke={strokeColor}
          strokeWidth="2.6"
        />
        {/* Modern accent stripe on base */}
        <Rect x="28" y="85.5" width="44" height="3" rx="1.5" fill={innerAccent} />

        {/* Piece specific geometric shapes */}
        {type === 'p' && (
          <G>
            {/* Triangular Minimalist Pawn */}
            <Polygon
              points="50,22 31,81 69,81"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            <Circle cx="50" cy="36" r="6.5" fill={accentColor} stroke={strokeColor} strokeWidth="1.8" />
          </G>
        )}

        {type === 'r' && (
          <G>
            {/* Crisp Geometric Rook */}
            <Polygon
              points="28,81 33,42 24,42 24,22 39,22 39,32 61,32 61,22 76,22 76,42 67,42 72,81"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            {/* Horizontal modern slit */}
            <Rect x="34" y="50" width="32" height="4.5" rx="2.2" fill={accentColor} />
          </G>
        )}

        {type === 'n' && (
          <G>
            {/* Angular Origami / Low-Poly Knight */}
            <Polygon
              points="27,81 22,52 37,35 33,17 54,25 69,40 73,81"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            <Polygon
              points="22,52 42,48 50,60 36,66"
              fill={innerAccent}
              opacity="0.9"
            />
            <Circle cx="43" cy="33" r="3.6" fill={strokeColor} />
          </G>
        )}

        {type === 'b' && (
          <G>
            {/* Diamond / Hexagonal Bishop */}
            <Polygon
              points="50,13 69,37 59,81 41,81 31,37"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            {/* Bishop cross slit */}
            <Path d="M 50 25 L 50 56 M 39 37 L 61 37" stroke={innerAccent} strokeWidth="3.2" strokeLinecap="round" />
          </G>
        )}

        {type === 'q' && (
          <G>
            {/* Sharp 5-prong Modern Queen */}
            <Polygon
              points="28,81 35,46 20,29 37,39 50,15 63,39 80,29 65,46 72,81"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            <Circle cx="50" cy="54" r="5.5" fill={accentColor} stroke={strokeColor} strokeWidth="1.8" />
          </G>
        )}

        {type === 'k' && (
          <G>
            {/* Monolithic King */}
            <Polygon
              points="30,81 35,42 26,33 50,25 74,33 65,42 70,81"
              fill={fillMain}
              stroke={strokeColor}
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            {/* Modern top cross */}
            <Path
              d="M 50 8 L 50 24 M 41 15 L 59 15"
              stroke={innerAccent}
              strokeWidth="3.8"
              strokeLinecap="round"
            />
          </G>
        )}
      </G>
    </Svg>
  );
}
