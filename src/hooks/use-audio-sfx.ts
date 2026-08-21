import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';

export function useAudioSfx() {
  const [sounds, setSounds] = useState<{
    move?: Audio.Sound;
    capture?: Audio.Sound;
    check?: Audio.Sound;
    victory?: Audio.Sound;
  }>({});

  useEffect(() => {
    // In a real app, we would load local audio files here using require()
    // For this demonstration, we'll try to load them if available or mock the API if they are missing
    async function loadSounds() {
      try {
        // const { sound: move } = await Audio.Sound.createAsync(require('../../assets/sounds/move.mp3'));
        // const { sound: capture } = await Audio.Sound.createAsync(require('../../assets/sounds/capture.mp3'));
        // const { sound: check } = await Audio.Sound.createAsync(require('../../assets/sounds/check.mp3'));
        // const { sound: victory } = await Audio.Sound.createAsync(require('../../assets/sounds/victory.mp3'));
        // setSounds({ move, capture, check, victory });
      } catch (e) {
        console.warn('Audio files not found. Audio SFX disabled.', e);
      }
    }
    void loadSounds();

    return () => {
      // Unload sounds to prevent memory leaks
      Object.values(sounds).forEach(sound => {
        sound?.unloadAsync().catch(() => {});
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const playMove = () => void sounds.move?.replayAsync().catch(() => {});
  const playCapture = () => void sounds.capture?.replayAsync().catch(() => {});
  const playCheck = () => void sounds.check?.replayAsync().catch(() => {});
  const playVictory = () => void sounds.victory?.replayAsync().catch(() => {});

  return { playMove, playCapture, playCheck, playVictory };
}
