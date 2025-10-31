import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    // Handler pour mettre à jour la taille
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Ajouter l'event listener
    window.addEventListener('resize', handleResize);

    // Appeler immédiatement pour avoir la taille initiale
    handleResize();

    // Nettoyer l'event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

