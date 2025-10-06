import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Download, CheckCircle, Target, Calendar, DollarSign, Star, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/stores/authStore';
import { useSavingsStore } from '@/stores/savingsStore';
import { generateSuccessCertificate } from './CertificateGenerator';
import { toast } from 'sonner';

interface ChallengeSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChallengeSuccessModal({ isOpen, onClose }: ChallengeSuccessModalProps) {
  const { user } = useAuthStore();
  const { goal } = useSavingsStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCertificate = async () => {
    if (!user || !goal) {
      toast.error('Données utilisateur ou objectif d\'épargne manquants');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulation d'un délai de génération
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      generateSuccessCertificate(user, goal);
      toast.success('Certificat de réussite généré avec succès !');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la génération du certificat:', error);
      toast.error('Erreur lors de la génération du certificat');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user || !goal) {
    return null;
  }

  const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
  const isChallengeCompleted = progressPercentage >= 100;
  const remainingAmount = goal.targetAmount - goal.currentAmount;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Certificat de Réussite du Challenge
              </DialogTitle>
            </DialogHeader>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Statut du challenge */}
              <Card className={isChallengeCompleted ? "bg-gradient-to-r from-green-50 to-green-100 border-green-200" : "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200"}>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      {isChallengeCompleted ? (
                        <div className="p-4 bg-green-500 rounded-full">
                          <Trophy className="w-12 h-12 text-white" />
                        </div>
                      ) : (
                        <div className="p-4 bg-yellow-500 rounded-full">
                          <Target className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {isChallengeCompleted ? '🎉 Félicitations !' : 'En cours...'}
                      </h3>
                      <p className="text-gray-600">
                        {isChallengeCompleted 
                          ? 'Vous avez atteint votre objectif d\'épargne !' 
                          : `Il vous reste ${remainingAmount.toLocaleString('fr-FR')} FCFA à épargner`
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Détails du challenge */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Détails de votre Challenge
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">Période du challenge</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(goal.startDate).toLocaleDateString('fr-FR', { 
                            year: 'numeric', 
                            month: 'long' 
                          })} - {new Date(goal.endDate).toLocaleDateString('fr-FR', { 
                            year: 'numeric', 
                            month: 'long' 
                          })}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">Objectif d'épargne</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {goal.targetAmount.toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">Montant épargné</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {goal.currentAmount.toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">Progression</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={progressPercentage} className="flex-1" />
                          <Badge variant={isChallengeCompleted ? "default" : "secondary"}>
                            {progressPercentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contenu du certificat */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contenu du Certificat de Réussite</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Titre officiel de réussite</p>
                        <p className="text-xs text-gray-600">Certificat personnalisé avec votre nom</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Détails de votre performance</p>
                        <p className="text-xs text-gray-600">Objectif atteint, montant épargné, période du challenge</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Design professionnel</p>
                        <p className="text-xs text-gray-600">Certificat élégant avec logo et mise en page soignée</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Date de complétion</p>
                        <p className="text-xs text-gray-600">Horodatage de votre réussite</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Avantages du certificat */}
              <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Pourquoi générer ce certificat ?
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Preuve officielle de votre réussite financière</li>
                    <li>• Source de fierté et de motivation personnelle</li>
                    <li>• Peut être partagé sur les réseaux sociaux</li>
                    <li>• Document de référence pour vos futurs objectifs</li>
                    <li>• Témoignage de votre discipline et détermination</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Note sur la disponibilité */}
              {!isChallengeCompleted && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-1">Certificat disponible</h4>
                        <p className="text-sm text-blue-700">
                          Vous pouvez générer votre certificat même si vous n'avez pas encore atteint 100% de votre objectif. 
                          Il reflétera votre progression actuelle et pourra être régénéré une fois l'objectif complètement atteint.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isGenerating}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleGenerateCertificate}
                  disabled={isGenerating}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Générer le Certificat
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}




