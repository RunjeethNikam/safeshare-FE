// src/hooks/useKeyboardNavigation.ts
import { useEffect } from 'react';

export const useKeyboardNavigation = (
  fullscreenIndex: number | null,
  goToPrevious: () => void,
  goToNext: () => void,
  closeFullscreen: () => void
) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (fullscreenIndex === null) return;
      
      if (e.key === 'Escape') {
        closeFullscreen();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    if (fullscreenIndex !== null) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [fullscreenIndex, goToPrevious, goToNext, closeFullscreen]);
};