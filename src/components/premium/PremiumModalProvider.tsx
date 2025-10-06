import { createContext, useContext, ReactNode } from 'react';
import { usePremiumModal } from '@/hooks/usePremiumModal';
import PremiumModal from './PremiumModal';

interface PremiumModalContextType {
  showPremiumModal: () => void;
  hidePremiumModal: () => void;
}

const PremiumModalContext = createContext<PremiumModalContextType | undefined>(undefined);

interface PremiumModalProviderProps {
  children: ReactNode;
}

export const PremiumModalProvider = ({ children }: PremiumModalProviderProps) => {
  const { showPremiumModal, hidePremiumModal, isOpen, onClose, onSuccess } = usePremiumModal();

  return (
    <PremiumModalContext.Provider value={{ showPremiumModal, hidePremiumModal }}>
      {children}
      <PremiumModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={onSuccess}
        showSkipOption={true}
      />
    </PremiumModalContext.Provider>
  );
};

export const usePremiumModalContext = () => {
  const context = useContext(PremiumModalContext);
  if (context === undefined) {
    throw new Error('usePremiumModalContext must be used within a PremiumModalProvider');
  }
  return context;
};
