import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Award, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserTrophy, UserBadge, LevelUp } from '@/lib/apiComponent/hooks/useGamificationRewards';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'trophy' | 'badge' | 'levelup';
  data: UserTrophy[] | UserBadge[] | LevelUp | null;
}

const rarityColors = {
  common: 'bg-gray-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500',
};

const rarityGradients = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-yellow-600',
};

export function RewardModal({ isOpen, onClose, type, data }: RewardModalProps) {
  if (!isOpen || !data) return null;

  const renderTrophyContent = () => {
    const trophies = data as UserTrophy[];
    
    return (
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center"
        >
          <Trophy className="w-12 h-12 text-white" />
        </motion.div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {trophies.length === 1 ? '🏆 Nouveau trophée !' : '🎉 COMBO DE TROPHÉES !'}
          </h2>
          <p className="text-gray-600">
            {trophies.length === 1 
              ? 'Félicitations pour ce nouveau trophée !' 
              : `${trophies.length} nouveaux trophées débloqués !`
            }
          </p>
        </div>

        <div className="space-y-4">
          {trophies.map((trophy, index) => (
            <motion.div
              key={trophy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${rarityGradients[trophy.rarity]} flex items-center justify-center`}>
                      <span className="text-2xl">{trophy.icon}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-gray-900">{trophy.name}</h3>
                      <p className="text-sm text-gray-600">{trophy.description}</p>
                      <Badge 
                        variant="secondary" 
                        className={`mt-1 ${rarityColors[trophy.rarity]} text-white`}
                      >
                        {trophy.rarity.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderBadgeContent = () => {
    const badges = data as UserBadge[];
    
    return (
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center"
        >
          <Award className="w-12 h-12 text-white" />
        </motion.div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {badges.length === 1 ? '🎖️ Nouveau badge !' : '🎉 COMBO DE BADGES !'}
          </h2>
          <p className="text-gray-600">
            {badges.length === 1 
              ? 'Félicitations pour ce nouveau badge !' 
              : `${badges.length} nouveaux badges débloqués !`
            }
          </p>
        </div>

        <div className="space-y-4">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: badge.color }}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-gray-900">{badge.name}</h3>
                      <p className="text-sm text-gray-600">{badge.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderLevelUpContent = () => {
    const levelUp = data as LevelUp;
    
    return (
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center"
        >
          <Crown className="w-12 h-12 text-white" />
        </motion.div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {levelUp.newRank ? '🎊 Nouveau rang !' : '📈 Montée de niveau !'}
          </h2>
          <p className="text-gray-600">
            {levelUp.newRank 
              ? `Vous êtes maintenant ${levelUp.newRank} !` 
              : 'Félicitations pour votre progression !'
            }
          </p>
        </div>

        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{levelUp.oldLevel}</div>
                <div className="text-sm text-gray-600">Ancien niveau</div>
              </div>
              
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-2xl"
              >
                →
              </motion.div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{levelUp.newLevel}</div>
                <div className="text-sm text-gray-600">Nouveau niveau</div>
              </div>
            </div>
            
            {levelUp.newRank && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 pt-4 border-t border-green-200"
              >
                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-lg px-4 py-2">
                  <Crown className="w-4 h-4 mr-2" />
                  {levelUp.newRank}
                </Badge>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-end mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {type === 'trophy' && renderTrophyContent()}
              {type === 'badge' && renderBadgeContent()}
              {type === 'levelup' && renderLevelUpContent()}
              
              <div className="mt-8 flex justify-center">
                <Button onClick={onClose} className="px-8">
                  Continuer
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
