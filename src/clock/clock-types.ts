export type TimeCategory = 'none' | 'bullet' | 'blitz' | 'rapid' | 'classical' | 'hourglass' | 'custom';
export type ClockThemeId = 'digital_pro' | 'classic' | 'button_physical' | 'hourglass' | 'neon' | 'wood' | 'gold';

export interface TimeControlPreset {
  readonly id: string;
  readonly name: string;
  readonly category: TimeCategory;
  readonly baseMinutes: number;
  readonly incrementSeconds: number;
  readonly delaySeconds?: number;
  readonly isHourglass?: boolean;
  readonly label: string;
  readonly icon: string;
}

export interface PlayerTimeState {
  readonly timeRemainingMs: number;
  readonly movesCount: number;
  readonly isFlagged: boolean;
  readonly isInDelay?: boolean;
}

export interface GameClockState {
  readonly preset: TimeControlPreset;
  readonly theme: ClockThemeId;
  readonly whiteMs: number;
  readonly blackMs: number;
  readonly activeSide: 'w' | 'b' | null;
  readonly isRunning: boolean;
  readonly isPaused: boolean;
  readonly isFlagged: boolean;
  readonly flaggedSide: 'w' | 'b' | null;
  readonly lastTimestamp: number | null;
  readonly currentDelayRemainingMs: number;
}
