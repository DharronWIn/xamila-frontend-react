import { useState } from 'react';

interface UsePremiumModalReturn {
  showPremiumModal: () => void;
  hidePremiumModal: () => void;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const usePremiumModal = (): UsePremiumModalReturn => {
  const [isOpen, setIsOpen] = useState(false);

  const showPremiumModal = () => setIsOpen(true);
  const hidePremiumModal = () => setIsOpen(false);

  const onClose = () => {
    setIsOpen(false);
  };

  const onSuccess = () => {
    setIsOpen(false);
    // Ici vous pouvez ajouter d'autres actions après un succès de paiement
    // Par exemple, mettre à jour le store d'authentification, rediriger, etc.
  };

  return {
    showPremiumModal,
    hidePremiumModal,
    isOpen,
    onClose,
    onSuccess
  };
};
