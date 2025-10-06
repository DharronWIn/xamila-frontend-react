import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Zap, Shield, Users, Star, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/apiComponent/hooks/useAuth';
import { toast } from 'sonner';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userId: string;
  title?: string;
  description?: string;
}

const PremiumUpgradeModal = ({
  isOpen,
  onClose,
  userEmail,
  userId,
  title = "Passez au Premium",
  description = "Débloquez toutes les fonctionnalités avancées de Challenge d'Épargne"
}: PremiumUpgradeModalProps) => {
  const { getFineoPayCheckoutLink } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const premiumPrice = 10000; // 10M FCFA
  const formattedPrice = new Intl.NumberFormat('fr-FR', 
    {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(premiumPrice);

  const features = [
    {
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      title: "Défis illimités",
      description: "Créez et participez à autant de défis que vous voulez"
    },
    {
      icon: <Shield className="h-5 w-5 text-blue-500" />,
      title: "Sécurité renforcée",
      description: "Protection avancée de vos données financières"
    },
    {
      icon: <Users className="h-5 w-5 text-green-500" />,
      title: "Communauté premium",
      description: "Accès exclusif aux groupes et événements premium"
    },
    {
      icon: <Star className="h-5 w-5 text-purple-500" />,
      title: "Support prioritaire",
      description: "Assistance clientèle dédiée 24/7"
    }
  ];

  const handleUpgradeToPremium = async () => {
    try {
      setIsLoading(true);
      
      // Appeler l'API FineoPay pour obtenir le lien de checkout avec userId et amount
      const response = await getFineoPayCheckoutLink({
        userId: userId,
        amount: premiumPrice
      });
      
      if (response.success && response.data.checkoutLink) {
        // Rediriger vers le lien de checkout FineoPay
        window.open(response.data.checkoutLink, '_blank');
        
        toast.success("Redirection vers le paiement...", {
          description: "Vous allez être redirigé vers notre partenaire de paiement sécurisé."
        });
        
        // Fermer le modal après un court délai
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error(response.message || 'Erreur lors de la génération du lien de paiement');
      }
    } catch (error) {
      console.error('Erreur lors de la génération du lien de paiement:', error);
      toast.error("Erreur lors de la génération du lien de paiement", {
        description: error instanceof Error ? error.message : "Veuillez réessayer plus tard."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-lg">
                    {description}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="absolute top-4 right-4 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Prix */}
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {formattedPrice}
                </div>
                <Badge variant="outline" className="text-sm">
                  Abonnement Premium
                </Badge>
              </div>

              <Separator />

              {/* Fonctionnalités */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Fonctionnalités incluses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Informations de paiement */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Paiement sécurisé
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Votre paiement sera traité de manière sécurisée par FineoPay, 
                  notre partenaire de paiement de confiance.
                </p>
                <div className="flex items-center text-sm text-blue-600">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Paiement 100% sécurisé et crypté</span>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Plus tard
                </Button>
                <Button
                  onClick={handleUpgradeToPremium}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Génération du lien...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Passer au Premium
                    </>
                  )}
                </Button>
              </div>

              {/* Note de sécurité */}
              <div className="text-center text-xs text-gray-500">
                <p>
                  En cliquant sur "Passer au Premium", vous serez redirigé vers 
                  notre partenaire de paiement sécurisé FineoPay.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PremiumUpgradeModal;
