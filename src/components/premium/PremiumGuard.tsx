import { useState, ReactNode } from 'react';
import { useAuth } from '@/lib/apiComponent/hooks/useAuth';
import PremiumUpgradeModal from './PremiumUpgradeModal';

interface PremiumGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradeModal?: boolean;
  onUpgradeClick?: () => void;
}

const PremiumGuard = ({ 
  children, 
  fallback, 
  showUpgradeModal = true,
  onUpgradeClick 
}: PremiumGuardProps) => {
  const { user } = useAuth();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  const isPremium = user?.isPremium || user?.isAdmin || false;

  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else if (showUpgradeModal) {
      setIsUpgradeModalOpen(true);
    }
  };

  // Si l'utilisateur est premium ou admin, afficher le contenu
  if (isPremium) {
    return <>{children}</>;
  }

  // Si un fallback est fourni, l'afficher
  if (fallback) {
    return <>{fallback}</>;
  }

  // Sinon, afficher un message de protection par défaut
  return (
    <>
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Fonctionnalité Premium
          </h3>
          <p className="text-yellow-700 mb-4">
            Cette fonctionnalité nécessite un abonnement premium pour y accéder.
          </p>
          <button
            onClick={handleUpgradeClick}
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Passer au Premium
          </button>
        </div>
      </div>

      {showUpgradeModal && (
        <PremiumUpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          userEmail={user?.email || ''}
          userId={user?.id || ''}
        />
      )}
    </>
  );
};

export default PremiumGuard;
