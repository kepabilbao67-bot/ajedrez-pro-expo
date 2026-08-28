import { describe, expect, it } from 'vitest';
import { PIECE_SETS, pieceSetById, normalizePieceSetId, ChessPieceView } from './piece-sets';
import type { Piece } from '@/chess';
import React from 'react';

const ALL_PIECES: readonly Piece[] = [
  'K', 'Q', 'R', 'B', 'N', 'P',
  'k', 'q', 'r', 'b', 'n', 'p',
];

describe('Piece Sets Architecture (Sprint Visual 2)', () => {
  it('defines 3 distinct canonical collections', () => {
    expect(PIECE_SETS).toHaveLength(3);
    const ids = PIECE_SETS.map((s) => s.id);
    expect(ids).toContain('staunton');
    expect(ids).toContain('modern');
    expect(ids).toContain('3d-realistic');
  });

  it('each collection contains valid rendering functions for all 12 pieces', () => {
    for (const set of PIECE_SETS) {
      for (const piece of ALL_PIECES) {
        const element = set.renderPiece(piece, 48);
        expect(React.isValidElement(element)).toBe(true);
        const props = (element as React.ReactElement<{ width?: number; height?: number }>).props;
        expect(props.width).toBe(48);
        expect(props.height).toBe(48);
      }
    }
  });

  it('normalizes legacy IDs safely to prevent broken preferences', () => {
    expect(normalizePieceSetId('classic')).toBe('staunton');
    expect(normalizePieceSetId('3d')).toBe('3d-realistic');
    expect(normalizePieceSetId('fantasy')).toBe('3d-realistic');
    expect(normalizePieceSetId('minimalist')).toBe('modern');
    expect(normalizePieceSetId('staunton')).toBe('staunton');
    expect(normalizePieceSetId('modern')).toBe('modern');
    expect(normalizePieceSetId('3d-realistic')).toBe('3d-realistic');
    expect(normalizePieceSetId(undefined)).toBe('staunton');
  });

  it('ChessPieceView component renders successfully without errors', () => {
    const view = ChessPieceView({ piece: 'N', pieceSetId: 'staunton', size: 50 });
    expect(React.isValidElement(view)).toBe(true);
  });

  it('the 3 collections produce distinct component hierarchies', () => {
    const stauntonKnight = pieceSetById('staunton').renderPiece('N', 48);
    const modernKnight = pieceSetById('modern').renderPiece('N', 48);
    const realisticKnight = pieceSetById('3d-realistic').renderPiece('N', 48);

    expect(stauntonKnight).not.toEqual(modernKnight);
    expect(stauntonKnight).not.toEqual(realisticKnight);
    expect(modernKnight).not.toEqual(realisticKnight);
  });
});
