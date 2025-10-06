import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, CheckCircle, Target, Calendar, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { useSavingsStore } from '@/stores/savingsStore';
import { generateEngagementDocument } from './CertificateGenerator';
import { toast } from 'sonner';

interface DocumentEngagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentEngagementModal({ isOpen, onClose }: DocumentEngagementModalProps) {
  const { user } = useAuthStore();
  const { goal } = useSavingsStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDocument = async () => {
    if (!user || !goal) {
      toast.error('Données utilisateur ou objectif d\'épargne manquants');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulation d'un délai de génération
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      generateEngagementDocument(user, goal);
      toast.success('Document d\'engagement généré avec succès !');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la génération du document:', error);
      toast.error('Erreur lors de la génération du document');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user || !goal) {
    return null;
  }

  const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
  const remainingAmount = goal.targetAmount - goal.currentAmount;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Document d'Engagement Personnel
              </DialogTitle>
            </DialogHeader>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Informations du challenge */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Votre Challenge d'Épargne
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progression actuelle</span>
                      <Badge variant="secondary">
                        {progressPercentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {goal.currentAmount.toLocaleString('fr-FR')} FCFA épargnés sur {goal.targetAmount.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contenu du document */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contenu du Document d'Engagement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Informations personnelles</p>
                        <p className="text-xs text-gray-600">Vos coordonnées et détails du challenge</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Engagement solennel</p>
                        <p className="text-xs text-gray-600">Contrat moral pour respecter votre objectif d'épargne</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Règles du challenge</p>
                        <p className="text-xs text-gray-600">Engagements spécifiques à respecter pendant 6 mois</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Signature personnelle</p>
                        <p className="text-xs text-gray-600">Espace pour votre signature et la date</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Avantages du document */}
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-primary mb-2">Pourquoi générer ce document ?</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Renforce votre engagement personnel</li>
                    <li>• Sert de rappel visuel de vos objectifs</li>
                    <li>• Peut être partagé avec votre entourage pour plus de motivation</li>
                    <li>• Document officiel de votre participation au challenge</li>
                  </ul>
                </CardContent>
              </Card>

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
                  onClick={handleGenerateDocument}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Générer le PDF
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




