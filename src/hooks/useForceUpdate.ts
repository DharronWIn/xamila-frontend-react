import { useState, useCallback } from 'react';

/**
 * Hook pour forcer la mise à jour d'un composant
 */
export const useForceUpdate = () => {
  const [, setTick] = useState(0);
  
  const forceUpdate = useCallback(() => {
    setTick(tick => tick + 1);
  }, []);

  return forceUpdate;
};

/**
 * Hook pour écouter les mises à jour d'avatar et forcer le re-render
 */
export const useAvatarForceUpdate = () => {
  const forceUpdate = useForceUpdate();

  // Écouter les événements de mise à jour d'avatar
  useState(() => {
    const handleAvatarUpdate = () => {
      console.log('Avatar force update triggered');
      forceUpdate();
    };

    const handleForceRerender = () => {
      console.log('Force rerender triggered');
      forceUpdate();
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    window.addEventListener('forceRerender', handleForceRerender);

    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
      window.removeEventListener('forceRerender', handleForceRerender);
    };
  });

  return forceUpdate;
};
