import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/lib/apiComponent/hooks/useAuth';

/**
 * Hook pour écouter les mises à jour d'avatar et forcer le re-render
 */
export const useAvatarUpdate = () => {
  const [avatarUpdateCount, setAvatarUpdateCount] = useState(0);
  const { user: userFromStore } = useAuthStore();
  const { user: userFromAuth } = useAuth();
  
  // Priorité à useAuth, fallback sur useAuthStore
  const user = userFromAuth || userFromStore;

  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      console.log('Avatar update event received:', event.detail);
      setAvatarUpdateCount(prev => prev + 1);
    };

    const handleForceRerender = () => {
      console.log('Force rerender event received');
      setAvatarUpdateCount(prev => prev + 1);
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    window.addEventListener('forceRerender', handleForceRerender);

    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
      window.removeEventListener('forceRerender', handleForceRerender);
    };
  }, []);

  // Forcer le re-render quand l'avatar change
  useEffect(() => {
    setAvatarUpdateCount(prev => prev + 1);
  }, [user?.pictureProfilUrl]);

  return {
    avatarUpdateCount,
    user,
    pictureProfilUrl: user?.pictureProfilUrl
  };
};
