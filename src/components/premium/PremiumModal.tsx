import { useState } from 'react';
import { X, Check, Star, Zap, Shield, Users, CreditCard, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userEmail?: string;
  title?: string;
  description?: string;
  showSkipOption?: boolean;
  checkoutLink?: string;
  onDirectPayment?: () => void;
}

const PremiumModal = ({
  isOpen,
  onClose,
  onSuccess,
  userEmail,
  title = "Passez au Premium",
  description = "Débloquez toutes les fonctionnalités avancées du Challenge d'Épargne",
  showSkipOption = true,
  checkoutLink,
  onDirectPayment
}: PremiumModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'momo' | 'card'>('momo');

  const premiumPrice = 10000; // 10M FCFA
  const formattedPrice = new Intl.NumberFormat('fr-FR', {
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

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Si on a un checkoutLink direct, l'utiliser
      if (checkoutLink && onDirectPayment) {
        onDirectPayment();
        toast({
          title: "Redirection vers le paiement",
          description: "Vous allez être redirigé vers notre partenaire de paiement sécurisé.",
        });
        setIsProcessing(false);
        return;
      }
      
      // Sinon, simuler l'initiation du paiement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ici, vous intégrerez avec votre fournisseur de paiement
      // Pour l'instant, on simule un succès
      const paymentUrl = `https://payment-provider.com/pay?amount=${premiumPrice}&email=${userEmail}&method=${selectedPaymentMethod}`;
      
      // Ouvrir le lien de paiement dans une nouvelle fenêtre
      window.open(paymentUrl, '_blank');
      
      toast({
        title: "Redirection vers le paiement",
        description: "Vous allez être redirigé vers notre partenaire de paiement sécurisé.",
      });
      
      // Simuler le succès du paiement après un délai
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess();
        toast({
          title: "Paiement réussi !",
          description: "Bienvenue dans la communauté Premium !",
        });
      }, 3000);
      
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Erreur de paiement",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
                <DialogDescription className="text-gray-600">
                  {description}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Prix et badge */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2">
              <span className="text-4xl font-bold text-gray-900">{formattedPrice}</span>
              <Badge variant="secondary" className="text-sm">
                Par mois
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Annulation possible à tout moment
            </p>
          </div>

          {/* Fonctionnalités */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Fonctionnalités Premium</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Méthodes de paiement */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Méthode de paiement</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all ${
                  selectedPaymentMethod === 'momo' 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPaymentMethod('momo')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-6 w-6 text-green-600" />
                    <div>
                      <h4 className="font-medium">Mobile Money</h4>
                      <p className="text-sm text-gray-600">Orange Money, MTN Money</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${
                  selectedPaymentMethod === 'card' 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPaymentMethod('card')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Carte bancaire</h4>
                      <p className="text-sm text-gray-600">Visa, Mastercard</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-3"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Passer au Premium - {formattedPrice}
                </>
              )}
            </Button>
            
            {showSkipOption && (
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1"
              >
                Continuer sans Premium
              </Button>
            )}
          </div>

          {/* Sécurité */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              🔒 Paiement sécurisé par nos partenaires certifiés
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumModal;
