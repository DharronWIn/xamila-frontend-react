import { motion } from 'framer-motion';
import { Target, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CurrentChallengeMilestones, Milestone } from '@/types/challenge';

interface MilestonesCardProps {
  milestones: CurrentChallengeMilestones | null;
  isLoading?: boolean;
}

const MilestonesCard = ({ milestones, isLoading }: MilestonesCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <span>Jalons Collectifs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!milestones) {
    return null;
  }

  const getMilestoneIcon = (milestone: Milestone) => {
    if (milestone.isAchieved) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  const getMilestoneColor = (milestone: Milestone) => {
    if (milestone.isAchieved) {
      return 'bg-green-50 border-green-200';
    }
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-primary" />
          <span>Jalons Collectifs</span>
        </CardTitle>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>{milestones.achievedMilestones} / {milestones.totalMilestones} atteints</span>
          <Badge variant="outline" className="text-xs">
            {Math.round((milestones.achievedMilestones / milestones.totalMilestones) * 100)}% complété
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getMilestoneColor(milestone)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getMilestoneIcon(milestone)}
                  <div>
                    <h4 className="font-medium text-gray-900">{milestone.name}</h4>
                    <p className="text-sm text-gray-600">
                      {milestone.currentAmount.toLocaleString()}€ / {milestone.targetAmount.toLocaleString()}€
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {milestone.targetPercentage}%
                  </div>
                  <div className="text-xs text-gray-500">objectif</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progression</span>
                  <span>{Math.round((milestone.currentAmount / milestone.targetAmount) * 100)}%</span>
                </div>
                <Progress 
                  value={(milestone.currentAmount / milestone.targetAmount) * 100} 
                  className="h-2"
                />
              </div>

              {milestone.isAchieved && milestone.achievedAt && (
                <div className="mt-2 text-xs text-green-600">
                  ✅ Atteint le {new Date(milestone.achievedAt).toLocaleDateString('fr-FR')}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MilestonesCard;
