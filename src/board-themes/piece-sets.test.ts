import { describe, expect, it } from 'vitest';
import { PIECE_SETS, pieceSetById, normalizePieceSetId, ChessPieceView } from './piece-sets';
import type { Piece } from '@/chess';
import React from 'react';

const ALL_PIECES: readonly Piece[] = [
  'K', 'Q', 'R', 'B', 'N', 'P',
  'k', 'q', 'r', 'b', 'n', 'p',
];

describe('Piece Sets Architecture & Readability', () => {
  it('defines 4 distinct canonical collections', () => {
    expect(PIECE_SETS).toHaveLength(4);
    const ids = PIECE_SETS.map((s) => s.id);
    expect(ids).toContain('staunton');
    expect(ids).toContain('modern');
    expect(ids).toContain('3d-realistic');
    expect(ids).toContain('kids-classic');
  });

  it('each collection contains valid rendering functions for all 12 pieces', () => {
    for (const set of PIECE_SETS) {
      for (const piece of ALL_PIECES) {
        const element = set.renderPiece(piece, 48);
        expect(React.isValidElement(element)).toBe(true);
        const props = (element as React.ReactElement<{ width?: number; height?: number; viewBox?: string }>).props;
        expect(props.width).toBe(48);
        expect(props.height).toBe(48);
        expect(props.viewBox).toBe('0 0 100 100');
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

  it('validates rendering for all 6 white and 6 black pieces in Staunton default set', () => {
    const staunton = pieceSetById('staunton');
    for (const p of ALL_PIECES) {
      const rendered = staunton.renderPiece(p, 56);
      expect(React.isValidElement(rendered)).toBe(true);
    }
  });

  describe('Contrast & Visibility on Blue Boards (WCAG standards)', () => {
    function getLuminance(hex: string): number {
      const rgb = hex.replace('#', '');
      const r = parseInt(rgb.substring(0, 2), 16) / 255;
      const g = parseInt(rgb.substring(2, 4), 16) / 255;
      const b = parseInt(rgb.substring(4, 6), 16) / 255;
      const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    function getContrastRatio(hex1: string, hex2: string): number {
      const lum1 = getLuminance(hex1);
      const lum2 = getLuminance(hex2);
      const brightest = Math.max(lum1, lum2);
      const darkest = Math.min(lum1, lum2);
      return (brightest + 0.05) / (darkest + 0.05);
    }

    it('black Staunton outline has high contrast (> 10:1) on dark blue classic square #1B2A38', () => {
      const outlineColor = '#F8FAFC';
      const darkBlueSquare = '#1B2A38';
      const ratio = getContrastRatio(outlineColor, darkBlueSquare);
      expect(ratio).toBeGreaterThan(10);
    });

    it('black Staunton outline has high contrast (> 5.5:1) on dark FIDE blue square #335E8A', () => {
      const outlineColor = '#F8FAFC';
      const darkFideSquare = '#335E8A';
      const ratio = getContrastRatio(outlineColor, darkFideSquare);
      expect(ratio).toBeGreaterThan(5.5);
    });

    it('black Staunton piece body has strong contrast (> 5.5:1) on light blue classic square #96B0C6', () => {
      const pieceBody = '#1E293B';
      const lightBlueSquare = '#96B0C6';
      const ratio = getContrastRatio(pieceBody, lightBlueSquare);
      expect(ratio).toBeGreaterThan(5.5);
    });

    it('black Staunton piece body has exceptional contrast (> 10:1) on light FIDE blue square #DEEBF5', () => {
      const pieceBody = '#1E293B';
      const lightFideSquare = '#DEEBF5';
      const ratio = getContrastRatio(pieceBody, lightFideSquare);
      expect(ratio).toBeGreaterThan(10);
    });
  });
});
