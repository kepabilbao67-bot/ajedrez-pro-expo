import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { useAudioSfx } from './use-audio-sfx';
import { useAudioPlayer } from 'expo-audio';
// @ts-ignore
import Module from 'module';

// Patch Node's require to return a string for .wav files during tests
const originalRequire = (Module as any).prototype.require;
(Module as any).prototype.require = function (id: string) {
  if (id.endsWith('.wav')) return id;
  return originalRequire.apply(this, arguments);
};

// Mock expo-audio
vi.mock('expo-audio', () => ({
  useAudioPlayer: vi.fn()
}));

const flushPromises = () => new Promise(resolve => setImmediate(() => resolve(undefined)));

describe('useAudioSfx', () => {
  const mockSeekTo = vi.fn().mockResolvedValue(undefined);
  const mockPlay = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAudioPlayer as Mock).mockReturnValue({
      seekTo: mockSeekTo,
      play: mockPlay
    });
  });

  it('should play move sound', async () => {
    const result = useAudioSfx(true);
    result.playMove();

    await flushPromises();
    expect(mockSeekTo).toHaveBeenCalledWith(0);
    expect(mockPlay).toHaveBeenCalled();
  });

  it('should play capture sound', async () => {
    const result = useAudioSfx(true);
    result.playCapture();

    await flushPromises();
    expect(mockSeekTo).toHaveBeenCalledWith(0);
    expect(mockPlay).toHaveBeenCalled();
  });

  it('should play check sound', async () => {
    const result = useAudioSfx(true);
    result.playCheck();

    await flushPromises();
    expect(mockSeekTo).toHaveBeenCalledWith(0);
    expect(mockPlay).toHaveBeenCalled();
  });

  it('should play victory sound', async () => {
    const result = useAudioSfx(true);
    result.playVictory();

    await flushPromises();
    expect(mockSeekTo).toHaveBeenCalledWith(0);
    expect(mockPlay).toHaveBeenCalled();
  });
  
  it('should not play if disabled', async () => {
    const result = useAudioSfx(false);
    result.playMove();
    await flushPromises();
    expect(mockSeekTo).not.toHaveBeenCalled();
  });
});




