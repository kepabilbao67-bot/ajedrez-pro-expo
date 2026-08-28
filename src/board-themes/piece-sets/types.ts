import React from 'react';
import type { Piece } from '@/chess';

export type PieceSetId =
  | 'staunton'
  | 'modern'
  | '3d-realistic'
  // Legacy aliases for backward compatibility:
  | 'classic'
  | '3d'
  | 'fantasy'
  | 'minimalist';

export interface PieceSetDefinition {
  readonly id: PieceSetId;
  readonly canonicalId: 'staunton' | 'modern' | '3d-realistic';
  readonly name: string;
  readonly description: string;
  readonly availability: 'free' | 'prepared';
  readonly renderPiece: (piece: Piece, size: number) => React.ReactElement;
}
