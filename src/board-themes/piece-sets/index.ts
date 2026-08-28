import React from 'react';
import type { Piece } from '@/chess';
import type { PieceSetDefinition, PieceSetId } from './types';
import { renderStauntonPiece } from './staunton';
import { renderModernPiece } from './modern';
import { renderRealistic3DPiece } from './realistic-3d';

export * from './types';

export const PIECE_SETS: readonly PieceSetDefinition[] = [
  {
    id: 'staunton',
    canonicalId: 'staunton',
    name: 'Staunton Clásico',
    description: 'Siluetas tradicionales FIDE en marfil pulido y madera de ébano.',
    availability: 'free',
    renderPiece: renderStauntonPiece,
  },
  {
    id: 'modern',
    canonicalId: 'modern',
    name: 'Moderno Minimalista',
    description: 'Líneas geométricas limpias de alta visibilidad con acentos neón.',
    availability: 'free',
    renderPiece: renderModernPiece,
  },
  {
    id: '3d-realistic',
    canonicalId: '3d-realistic',
    name: 'Realista 3D (2.5D)',
    description: 'Piezas esculpidas con volumen, iluminación natural y sombra de contacto.',
    availability: 'free',
    renderPiece: renderRealistic3DPiece,
  },
];

// Map legacy IDs to new canonical sets for full backward compatibility
export function normalizePieceSetId(id: string | null | undefined): PieceSetId {
  switch (id) {
    case 'staunton':
    case 'classic':
      return 'staunton';
    case 'modern':
    case 'minimalist':
      return 'modern';
    case '3d-realistic':
    case '3d':
    case 'fantasy':
      return '3d-realistic';
    default:
      return 'staunton';
  }
}

export function pieceSetById(id: PieceSetId | string): PieceSetDefinition {
  const normalized = normalizePieceSetId(id);
  const found = PIECE_SETS.find((set) => set.id === normalized || set.canonicalId === normalized);
  return found ?? PIECE_SETS[0];
}

export interface ChessPieceViewProps {
  readonly piece: Piece;
  readonly pieceSetId?: PieceSetId | string;
  readonly size: number;
}

export function ChessPieceView({ piece, pieceSetId = 'staunton', size }: ChessPieceViewProps): React.ReactElement {
  const definition = pieceSetById(pieceSetId);
  return definition.renderPiece(piece, size);
}
