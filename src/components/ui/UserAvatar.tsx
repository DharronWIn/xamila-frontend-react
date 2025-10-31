import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUserProfilePicture, generateAvatarFromInitials } from '@/lib/utils';
import { User } from '@/lib/apiComponent/types';
import { useAvatarForceUpdate } from '@/hooks/useForceUpdate';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/lib/apiComponent/hooks/useAuth';

interface UserAvatarProps {
  user?: { 
    avatar?: string; 
    pictureProfilUrl?: string; 
    name?: string;
    firstName?: string;
    lastName?: string;
    id?: string;
  } | null;
  src?: string; // URL directe de l'image
  alt?: string; // Nom pour le fallback
  userId?: string; // ID pour la navigation
  className?: string;
  fallbackClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFallback?: boolean;
  clickable?: boolean; // Rendre l'avatar cliquable
  onClick?: () => void; // Action personnalisée au clic
  disableWrapper?: boolean; // Désactiver le wrapper button
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10', 
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

export const UserAvatar = ({ 
  user,
  src,
  alt,
  userId,
  className = '', 
  fallbackClassName = '',
  size = 'md',
  showFallback = true,
  clickable = false,
  onClick,
  disableWrapper = false
}: UserAvatarProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const forceUpdate = useAvatarForceUpdate(); // Force re-render on avatar update
  
  // Récupérer l'utilisateur depuis les différents stores
  const { user: userFromStore } = useAuthStore();
  const { user: userFromAuth } = useAuth();
  
  // Priorité : user passé en props > useAuth > useAuthStore
  const currentUser = user || userFromAuth || userFromStore;
  
  // Déterminer l'ID de l'utilisateur pour la navigation
  const profileUserId = userId || user?.id || currentUser?.id;
  
  // Forcer la mise à jour quand l'avatar change
  useEffect(() => {
    console.log('UserAvatar - Avatar changed:', {
      pictureProfilUrl: currentUser?.pictureProfilUrl,
      avatar: currentUser?.avatar,
      user: currentUser
    });
    forceUpdate();
  }, [currentUser, forceUpdate]);

  // Déterminer l'URL de l'avatar
  const avatarUrl = src || getUserProfilePicture(currentUser as User);
  const userWithNames = currentUser as User & { firstName?: string; lastName?: string };
  const displayName = alt || currentUser?.name || '';
  const fallbackText = userWithNames?.firstName?.charAt(0)?.toUpperCase() || displayName?.charAt(0)?.toUpperCase() || 'U';
  const fullName = userWithNames?.firstName && userWithNames?.lastName ? `${userWithNames.firstName} ${userWithNames.lastName}` : displayName;
  const generatedAvatarUrl = fullName ? generateAvatarFromInitials(fullName) : null;

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if ((clickable || profileUserId) && profileUserId) {
      navigate(`/user-dashboard/profile/${profileUserId}`);
    }
  };

  // Priorité : avatarUrl > generatedAvatarUrl
  const finalImageUrl = avatarUrl || generatedAvatarUrl;

  const avatarElement = (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {finalImageUrl && (
        <AvatarImage 
          src={finalImageUrl}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={isLoading ? 'opacity-0' : 'opacity-100'}
        />
      )}
      {showFallback && (
        <AvatarFallback 
          className={`${textSizeClasses[size]} font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white ${fallbackClassName}`}
        >
          {isLoading ? (
            <div className="animate-pulse bg-gray-300 rounded-full w-full h-full" />
          ) : (
            fallbackText
          )}
        </AvatarFallback>
      )}
    </Avatar>
  );

  // Si cliquable ou userId fourni, wrapper dans un button
  if (!disableWrapper && (clickable || onClick || profileUserId)) {
    return (
      <button
        onClick={handleClick}
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full transition-transform hover:scale-105"
        type="button"
      >
        {avatarElement}
      </button>
    );
  }

  return avatarElement;
};

export default UserAvatar;
