export type SoundEventType =
  | 'move'
  | 'capture'
  | 'check'
  | 'checkmate'
  | 'victory'
  | 'error'
  | 'combo'
  | 'tick'
  | 'whistle';

export interface SoundConfig {
  readonly enabled: boolean;
  readonly volume: number; // 0.0 to 1.0
}

export class AudioService {
  private static instance: AudioService;
  private enabled: boolean = true;

  private constructor() {}

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public playSound(event: SoundEventType): void {
    if (!this.enabled) return;
    // Audio triggering fallback / logging
    // Actual sound playback is orchestrated in React Native via useAudioSfx hook
  }
}
