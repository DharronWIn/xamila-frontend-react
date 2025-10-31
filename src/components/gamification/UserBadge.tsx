import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserLevelInfo, RANK_EMOJIS, RANK_COLORS, RANK_LABELS } from '@/types/gamification';

interface UserBadgeProps {
  userLevel: UserLevelInfo;
  userId?: string; // ID de l'utilisateur pour la navigation
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showLevel?: boolean;
  showRank?: boolean;
  className?: string;
}

export const UserBadge: React.FC<UserBadgeProps> = ({ 
  userLevel,
  userId,
  onPress, 
  size = 'md',
  showLevel = true,
  showRank = true,
  className = ''
}) => {
  const navigate = useNavigate();
  const rankIcon = RANK_EMOJIS[userLevel.rank];
  const rankColor = RANK_COLORS[userLevel.rank];
  const rankLabel = RANK_LABELS[userLevel.rank].fr;

  const handleClick = () => {
    if (onPress) {
      onPress();
    } else if (userId) {
      navigate(`/user-dashboard/profile/${userId}`);
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const BadgeContent = () => (
    <div className={`inline-flex items-center gap-1.5 rounded-full border bg-white/80 backdrop-blur-sm transition-all hover:bg-white/90 ${sizeClasses[size]} ${className}`}>
      <span className={iconSizes[size]}>{rankIcon}</span>
      {showLevel && (
        <span className="font-medium text-gray-700">
          Niveau {userLevel.level}
        </span>
      )}
      {showRank && (
        <span 
          className="font-semibold"
          style={{ color: rankColor }}
        >
          {rankLabel}
        </span>
      )}
    </div>
  );

  if (onPress || userId) {
    return (
      <button
        onClick={handleClick}
        className="transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
      >
        <BadgeContent />
      </button>
    );
  }

  return <BadgeContent />;
};

// Composant pour afficher uniquement l'icône de rang
export const RankIcon: React.FC<{
  rank: UserLevelInfo['rank'];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ rank, size = 'md', className = '' }) => {
  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <span className={`${iconSizes[size]} ${className}`}>
      {RANK_EMOJIS[rank]}
    </span>
  );
};

// Composant pour afficher uniquement le niveau
export const LevelDisplay: React.FC<{
  level: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ level, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <span className={`font-medium text-gray-700 ${sizeClasses[size]} ${className}`}>
      Niveau {level}
    </span>
  );
};

// Composant pour afficher uniquement le rang
export const RankDisplay: React.FC<{
  rank: UserLevelInfo['rank'];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ rank, size = 'md', className = '' }) => {
  const rankColor = RANK_COLORS[rank];
  const rankLabel = RANK_LABELS[rank].fr;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <span 
      className={`font-semibold ${sizeClasses[size]} ${className}`}
      style={{ color: rankColor }}
    >
      {rankLabel}
    </span>
  );
};
