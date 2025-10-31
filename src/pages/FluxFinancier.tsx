import { FluxDashboard } from "@/components/flux/FluxDashboard";
import { usePremiumProtection } from "@/hooks/usePremiumProtection";
import PremiumUpgradeModal from "@/components/premium/PremiumUpgradeModal";

export default function FluxFinancier() {
  const {
    isPremium,
    isUpgradeModalOpen,
    handlePremiumFeatureClick,
    closeUpgradeModal
  } = usePremiumProtection();

  // Check if user has premium access
    if (!isPremium) {
  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Accès Premium Requis
          </h1>
          <p className="text-gray-600 mb-6">
            Le flux financier est une fonctionnalité premium. 
            <br />
            Upgradez votre compte pour y accéder.
          </p>
          <button
            onClick={handlePremiumFeatureClick}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voir les offres Premium
          </button>
          </div>
        <PremiumUpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={closeUpgradeModal}
          userEmail=""
          userId=""
        />
      </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-1 py-8">
        <FluxDashboard />
      </div>
    </div>
  );
}