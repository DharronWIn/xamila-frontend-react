import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/apiComponent/hooks/useAuth';
import { PublicProfile } from '@/types/gamification';

export const usePublicProfile = () => {
  const { getPublicProfile, user: currentUser } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (userId: string): Promise<PublicProfile | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getPublicProfile(userId) as PublicProfile;
      setProfile(data);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Erreur lors du chargement du profil';
      setError(errorMessage);
      console.error('Error loading public profile:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getPublicProfile]);

  const isOwnProfile = useCallback((profileId: string): boolean => {
    return currentUser?.id === profileId;
  }, [currentUser]);

  return {
    profile,
    loading,
    error,
    loadProfile,
    isOwnProfile,
    currentUserId: currentUser?.id,
  };
};
