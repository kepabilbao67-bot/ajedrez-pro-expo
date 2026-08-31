export type ClockTimeCategory = 'bullet' | 'blitz' | 'rapid' | 'custom';

export interface ClockPreset {
  readonly id: string;
  readonly name: string;
  readonly category: ClockTimeCategory;
  readonly baseMinutes: number;
  readonly incrementSeconds: number;
  readonly label: string;
}

export const CLOCK_PRESETS: readonly ClockPreset[] = [
  // Bullet
  { id: 'bullet-1-0', name: 'Bullet 1+0', category: 'bullet', baseMinutes: 1, incrementSeconds: 0, label: '1 min' },
  { id: 'bullet-1-1', name: 'Bullet 1+1', category: 'bullet', baseMinutes: 1, incrementSeconds: 1, label: '1 min | 1s' },
  { id: 'bullet-2-1', name: 'Bullet 2+1', category: 'bullet', baseMinutes: 2, incrementSeconds: 1, label: '2 min | 1s' },

  // Blitz
  { id: 'blitz-3-0', name: 'Blitz 3+0', category: 'blitz', baseMinutes: 3, incrementSeconds: 0, label: '3 min' },
  { id: 'blitz-3-2', name: 'Blitz 3+2', category: 'blitz', baseMinutes: 3, incrementSeconds: 2, label: '3 min | 2s (FIDE)' },
  { id: 'blitz-5-0', name: 'Blitz 5+0', category: 'blitz', baseMinutes: 5, incrementSeconds: 0, label: '5 min' },
  { id: 'blitz-5-3', name: 'Blitz 5+3', category: 'blitz', baseMinutes: 5, incrementSeconds: 3, label: '5 min | 3s (FIDE)' },

  // Rapid
  { id: 'rapid-10-0', name: 'Rápida 10+0', category: 'rapid', baseMinutes: 10, incrementSeconds: 0, label: '10 min' },
  { id: 'rapid-10-5', name: 'Rápida 10+5', category: 'rapid', baseMinutes: 10, incrementSeconds: 5, label: '10 min | 5s' },
  { id: 'rapid-15-10', name: 'Rápida 15+10', category: 'rapid', baseMinutes: 15, incrementSeconds: 10, label: '15 min | 10s (FIDE)' },
];

export interface PlayerClockState {
  readonly timeRemainingMs: number;
  readonly movesCount: number;
  readonly isFlagged: boolean;
}

export type ClockStatus = 'ready' | 'running' | 'paused' | 'flagged';
