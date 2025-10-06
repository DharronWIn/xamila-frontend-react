import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/apiComponent/hooks/useAuth';

export const usePremiumProtection = () => {
  const { user, getFineoPayCheckoutLink } = useAuth();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isPremium = user?.isPremium || user?.isAdmin || false;

  const handlePremiumFeatureClick = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Les admins n'ont pas besoin de passer premium
    if (!isPremium && !user?.isAdmin) {
      setIsUpgradeModalOpen(true);
    }
  }, [isPremium, user?.isAdmin]);

  const handleUpgradeToPremium = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Appeler l'API FineoPay pour obtenir le lien de checkout
      const response = await getFineoPayCheckoutLink();
      
      if (response.success && response.data.checkoutLink) {
        // Rediriger vers le lien de checkout FineoPay
        window.open(response.data.checkoutLink, '_blank');
        
        // Fermer le modal
        setIsUpgradeModalOpen(false);
      } else {
        throw new Error(response.message || 'Erreur lors de la génération du lien de paiement');
      }
    } catch (error) {
      console.error('Erreur lors de la génération du lien de paiement:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getFineoPayCheckoutLink]);

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
  }, []);

  return {
    isPremium,
    isUpgradeModalOpen,
    isLoading,
    handlePremiumFeatureClick,
    handleUpgradeToPremium,
    closeUpgradeModal,
    userEmail: user?.email || ''
  };
};
