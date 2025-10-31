import { motion } from 'framer-motion';
import { Award, Star, Zap, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CurrentChallengeAchievements, Achievement } from '@/types/challenge';

interface AchievementsCardProps {
  achievements: CurrentChallengeAchievements | null;
  isLoading?: boolean;
}

const AchievementsCard = ({ achievements, isLoading }: AchievementsCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-primary" />
            <span>Succès Collectifs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!achievements) {
    return null;
  }

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'epic':
        return <Star className="w-4 h-4 text-purple-500" />;
      case 'rare':
        return <Zap className="w-4 h-4 text-blue-500" />;
      default:
        return <Award className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'epic':
        return 'bg-gradient-to-r from-purple-400 to-purple-600 text-white';
      case 'rare':
        return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getAchievementStatus = (achievement: Achievement) => {
    if (achievement.isUnlocked) {
      return 'bg-green-50 border-green-200';
    }
    return 'bg-gray-50 border-gray-200 opacity-60';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-primary" />
          <span>Succès Collectifs</span>
        </CardTitle>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>
            {achievements.unlockedAchievements || 0} / {achievements.totalAchievements || 0} débloqués
          </span>
          <Badge variant="outline" className="text-xs">
            {achievements.completionRate || 0}% complété
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(achievements.achievements || []).map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getAchievementStatus(achievement)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    achievement.isUnlocked ? 'bg-white' : 'bg-gray-100'
                  }`}>
                    {achievement.isUnlocked ? achievement.icon : '🔒'}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className={`font-medium ${
                      achievement.isUnlocked ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {achievement.name}
                    </h4>
                    <Badge 
                      className={`text-xs ${getRarityColor(achievement.rarity)}`}
                    >
                      {getRarityIcon(achievement.rarity)}
                      <span className="ml-1 capitalize">{achievement.rarity}</span>
                    </Badge>
                  </div>
                  
                  <p className={`text-sm ${
                    achievement.isUnlocked ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {achievement.description}
                  </p>
                  
                  {achievement.isUnlocked && achievement.unlockedAt && (
                    <div className="mt-2 text-xs text-green-600">
                      ✅ Débloqué le {new Date(achievement.unlockedAt).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementsCard;
