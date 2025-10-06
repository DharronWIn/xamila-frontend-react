import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/lib/apiComponent/hooks/useAuth';

/**
 * Hook global pour synchroniser les avatars entre tous les stores
 */
export const useGlobalAvatarSync = () => {
  const [syncKey, setSyncKey] = useState(0);
  const { user: userFromStore } = useAuthStore();
  const { user: userFromAuth } = useAuth();

  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      console.log('Global avatar sync - event received:', event.detail);
      setSyncKey(prev => prev + 1);
    };

    const handleForceRerender = () => {
      console.log('Global avatar sync - force rerender');
      setSyncKey(prev => prev + 1);
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    window.addEventListener('forceRerender', handleForceRerender);

    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
      window.removeEventListener('forceRerender', handleForceRerender);
    };
  }, []);

  // Forcer la synchronisation quand l'avatar change dans n'importe quel store
  useEffect(() => {
    setSyncKey(prev => prev + 1);
  }, [userFromStore?.pictureProfilUrl, userFromAuth?.pictureProfilUrl]);

  return {
    syncKey,
    userFromStore,
    userFromAuth,
    // Priorité à useAuth, fallback sur useAuthStore
    user: userFromAuth || userFromStore,
    pictureProfilUrl: userFromAuth?.pictureProfilUrl || userFromStore?.pictureProfilUrl
  };
};
