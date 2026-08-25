import { useAudioPlayer } from 'expo-audio';

export function useAudioSfx(enabled: boolean = true) {
  const move = useAudioPlayer(require('../../assets/sounds/move.wav'));
  const capture = useAudioPlayer(require('../../assets/sounds/capture.wav'));
  const check = useAudioPlayer(require('../../assets/sounds/check.wav'));
  const victory = useAudioPlayer(require('../../assets/sounds/victory.wav'));

  const playMove = (): void => {
    if (!enabled) return;
    void move.seekTo(0).then(() => {
      move.play();
    }).catch(() => {
      if (__DEV__) console.warn('Failed to play move sound');
    });
  };

  const playCapture = (): void => {
    if (!enabled) return;
    void capture.seekTo(0).then(() => {
      capture.play();
    }).catch(() => {
      if (__DEV__) console.warn('Failed to play capture sound');
    });
  };

  const playCheck = (): void => {
    if (!enabled) return;
    void check.seekTo(0).then(() => {
      check.play();
    }).catch(() => {
      if (__DEV__) console.warn('Failed to play check sound');
    });
  };

  const playVictory = (): void => {
    if (!enabled) return;
    void victory.seekTo(0).then(() => {
      victory.play();
    }).catch(() => {
      if (__DEV__) console.warn('Failed to play victory sound');
    });
  };

  return { playMove, playCapture, playCheck, playVictory };
}
