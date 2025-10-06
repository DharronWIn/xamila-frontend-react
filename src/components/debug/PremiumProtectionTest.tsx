import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/apiComponent/hooks/useAuth';
import { usePremiumProtection } from '@/hooks/usePremiumProtection';
import PremiumUpgradeModal from '@/components/premium/PremiumUpgradeModal';
import PremiumGuard from '@/components/premium/PremiumGuard';

const PremiumProtectionTest = () => {
  const { user } = useAuth();
  const {
    isPremium,
    isUpgradeModalOpen,
    handlePremiumFeatureClick,
    closeUpgradeModal,
    handleUpgradeToPremium,
    isLoading
  } = usePremiumProtection();
  
  const [testResults, setTestResults] = useState<any>(null);

  const testFineoPayAPI = async () => {
    try {
      setTestResults({ loading: true, message: 'Test de l\'API FineoPay...' });
      
      const response = await handleUpgradeToPremium();
      
      setTestResults({ 
        success: true, 
        message: 'API FineoPay appelée avec succès',
        data: response 
      });
    } catch (error) {
      setTestResults({ 
        success: false, 
        message: 'Erreur lors de l\'appel API FineoPay',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Test de Protection Premium</span>
            <Badge variant={isPremium ? "default" : "outline"}>
              {isPremium ? "Premium" : "Gratuit"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Testez le système de protection premium et l'intégration FineoPay
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informations utilisateur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Informations utilisateur</h4>
              <ul className="text-sm space-y-1">
                <li>• Email: {user?.email || 'Non connecté'}</li>
                <li>• Premium: {isPremium ? 'Oui' : 'Non'}</li>
                <li>• Admin: {user?.isAdmin ? 'Oui' : 'Non'}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">État du système</h4>
              <ul className="text-sm space-y-1">
                <li>• Modal ouvert: {isUpgradeModalOpen ? 'Oui' : 'Non'}</li>
                <li>• Chargement: {isLoading ? 'Oui' : 'Non'}</li>
                <li>• Hook actif: ✅</li>
              </ul>
            </div>
          </div>

          {/* Tests */}
          <div className="space-y-4">
            <h4 className="font-semibold">Tests disponibles</h4>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handlePremiumFeatureClick}
                variant="outline"
              >
                Ouvrir Modal Premium
              </Button>
              
              <Button 
                onClick={testFineoPayAPI}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? 'Test en cours...' : 'Tester API FineoPay'}
              </Button>
            </div>
          </div>

          {/* Résultats des tests */}
          {testResults && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Résultats des tests</h4>
              <div className={`p-4 rounded-lg ${
                testResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`font-medium ${
                  testResults.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResults.message}
                </p>
                {testResults.error && (
                  <p className="text-sm text-red-600 mt-1">
                    Erreur: {testResults.error}
                  </p>
                )}
                {testResults.data && (
                  <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(testResults.data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test du PremiumGuard */}
      <Card>
        <CardHeader>
          <CardTitle>Test du PremiumGuard</CardTitle>
          <CardDescription>
            Testez le composant PremiumGuard qui protège le contenu premium
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h4 className="font-semibold">Contenu protégé par PremiumGuard</h4>
            
            <PremiumGuard
              fallback={
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800">
                    Ce contenu est protégé par PremiumGuard. 
                    {isPremium ? ' Vous avez accès !' : ' Vous devez être premium pour y accéder.'}
                  </p>
                </div>
              }
            >
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">
                  🎉 Contenu Premium accessible !
                </p>
                <p className="text-green-700 text-sm mt-1">
                  Ce contenu ne s'affiche que pour les utilisateurs premium.
                </p>
              </div>
            </PremiumGuard>
          </div>
        </CardContent>
      </Card>

      {/* Modal de mise à niveau */}
      <PremiumUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        userEmail={user?.email || ''}
        userId={user?.id || ''}
        title="Test - Débloquez Premium"
        description="Testez le système de mise à niveau premium avec FineoPay"
      />
    </div>
  );
};

export default PremiumProtectionTest;
