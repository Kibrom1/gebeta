import { useRef, useEffect } from 'react';

export const useSounds = () => {
  const clickSoundRef = useRef(null);
  const finishSoundRef = useRef(null);
  const clapSoundRef = useRef(null);

  useEffect(() => {
    try {
      clickSoundRef.current = new Audio(process.env.PUBLIC_URL + '/sounds/click.mp3');
      finishSoundRef.current = new Audio(process.env.PUBLIC_URL + '/sounds/finish.mp3');
      clapSoundRef.current = new Audio(process.env.PUBLIC_URL + '/sounds/clap.mp3');
    } catch (error) {
      console.warn('Failed to load sounds:', error);
    }
  }, []);

  const playSound = (audioRef) => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          // Silently fail if audio can't play (e.g., user hasn't interacted with page)
        });
      } catch (error) {
        console.warn('Failed to play sound:', error);
      }
    }
  };

  return {
    clickSoundRef,
    finishSoundRef,
    clapSoundRef,
    playSound
  };
};
