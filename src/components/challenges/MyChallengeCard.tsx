import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Trophy,
    Target,
    TrendingUp,
    Calendar, Plus,
    BarChart3,
    AlertCircle,
    CheckCircle,
    Clock,
    Wallet,
    CreditCard,
    X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChallengeStore } from '@/stores/challengeStore';
import { ChallengeParticipant } from '@/types/challenge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MyChallengeCardProps {
  participation: ChallengeParticipant;
  challenge: any;
  onAddTransaction?: (challengeId: string) => void;
  onAbandon?: (challengeId: string) => void;
  onViewStats?: (challengeId: string) => void;
}

export const MyChallengeCard = ({ 
  participation, 
  challenge,
  onAddTransaction,
  onAbandon,
  onViewStats
}: MyChallengeCardProps) => {
  const [isAbandonModalOpen, setIsAbandonModalOpen] = useState(false);
  const [abandonReason, setAbandonReason] = useState('');
  const [abandonCategory, setAbandonCategory] = useState('');
  const [abandonComments, setAbandonComments] = useState('');
  const [isAbandoning, setIsAbandoning] = useState(false);

  const { canMakeTransaction, abandonChallenge } = useChallengeStore();

  const canMakeTransactions = canMakeTransaction(participation.challengeId, participation.userId);
  const progressPercentage = participation.progressPercentage;
  const remainingAmount = participation.targetAmount - participation.currentAmount;
  const isCompleted = progressPercentage >= 100;

  const getStatusBadge = () => {
    switch (participation.status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">
          <TrendingUp className="w-3 h-3 mr-1" />
          Actif
        </Badge>;
      case 'abandoned':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <X className="w-3 h-3 mr-1" />
          Abandonné
        </Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Terminé
        </Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getModeIcon = () => {
    return participation.mode === 'free' ? 
      <Wallet className="w-4 h-4" /> : 
      <CreditCard className="w-4 h-4" />;
  };

  const getModeLabel = () => {
    return participation.mode === 'free' ? 'Mode Libre' : 'Mode Forcé';
  };

  const handleAbandon = async () => {
    if (!abandonReason || !abandonCategory) return;

    setIsAbandoning(true);
    try {
      const success = await abandonChallenge(
        participation.challengeId,
        abandonReason,
        abandonCategory,
        abandonComments
      );
      
      if (success) {
        setIsAbandonModalOpen(false);
        setAbandonReason('');
        setAbandonCategory('');
        setAbandonComments('');
        onAbandon?.(participation.challengeId);
      }
    } catch (error) {
      console.error('Error abandoning challenge:', error);
    } finally {
      setIsAbandoning(false);
    }
  };

  const getTimeInfo = () => {
    const now = new Date();
    const endDate = new Date(challenge.endDate);
    
    if (now > endDate) {
      return 'Challenge terminé';
    }
    
    return `Se termine ${formatDistanceToNow(endDate, { addSuffix: true, locale: fr })}`;
  };

  if (participation.status === 'abandoned') {
    return (
      <Card className="opacity-60 border-red-200 bg-red-50/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-700">{challenge.title}</h3>
            </div>
            {getStatusBadge()}
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p>Objectif : {participation.targetAmount.toLocaleString()}€</p>
            <p>Épargné : {participation.currentAmount.toLocaleString()}€</p>
            <p>Raison d'abandon : {participation.abandonmentReason}</p>
            <p>Abandonné le : {participation.abandonedAt ? new Date(participation.abandonedAt).toLocaleDateString('fr-FR') : 'N/A'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {challenge.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {getModeIcon()}
                      {getModeLabel()}
                    </Badge>
                    {getStatusBadge()}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progression</span>
                <span className="font-semibold">{progressPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{participation.currentAmount.toLocaleString()}€ épargnés</span>
                <span>Objectif: {participation.targetAmount.toLocaleString()}€</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Restant</p>
                  <p className="font-semibold text-gray-900">
                    {remainingAmount.toLocaleString()}€
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Temps</p>
                  <p className="font-semibold text-gray-900 text-xs">
                    {getTimeInfo()}
                  </p>
                </div>
              </div>
            </div>

            {/* Last transaction */}
            {participation.lastTransactionAt && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  Dernier versement : {new Date(participation.lastTransactionAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2 pt-2">
              {canMakeTransactions && !isCompleted && (
                <Button
                  onClick={() => onAddTransaction?.(participation.challengeId)}
                  className="flex-1"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewStats?.(participation.challengeId)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Stats
              </Button>
              
              {participation.status === 'active' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAbandonModalOpen(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Abandonner
                </Button>
              )}
            </div>

            {/* Completion message */}
            {isCompleted && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Félicitations !</p>
                  <p className="text-sm text-green-700">
                    Vous avez atteint votre objectif d'épargne !
                  </p>
                </div>
              </div>
            )}

            {/* Warning for no transactions */}
            {!canMakeTransactions && !isCompleted && (
              <div className="flex items-center space-x-2 p-2 bg-amber-50 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <p className="text-xs text-amber-700">
                  Les versements ne sont possibles que pendant la période active du challenge
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Abandon Modal */}
      <Dialog open={isAbandonModalOpen} onOpenChange={setIsAbandonModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>Abandonner le challenge</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Attention :</strong> Cette action est irréversible. Vous ne pourrez plus accéder à ce challenge et perdrez votre progression actuelle.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Raison de l'abandon *</Label>
                <Select
                  value={abandonCategory}
                  onValueChange={setAbandonCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une raison" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial_difficulty">Difficultés financières</SelectItem>
                    <SelectItem value="lost_interest">Perte d'intérêt</SelectItem>
                    <SelectItem value="found_better_challenge">Meilleur challenge trouvé</SelectItem>
                    <SelectItem value="personal_issues">Problèmes personnels</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="comments">Commentaires supplémentaires</Label>
                <Textarea
                  id="comments"
                  placeholder="Expliquez votre situation..."
                  value={abandonComments}
                  onChange={(e) => setAbandonComments(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsAbandonModalOpen(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleAbandon}
                disabled={!abandonCategory || isAbandoning}
                className="bg-red-600 hover:bg-red-700"
              >
                {isAbandoning ? 'Abandon en cours...' : 'Confirmer l\'abandon'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
