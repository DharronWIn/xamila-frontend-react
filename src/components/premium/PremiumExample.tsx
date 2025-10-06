import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Zap, Shield, Users } from 'lucide-react';
import { usePremiumModalContext } from './PremiumModalProvider';

const PremiumExample = () => {
  const { showPremiumModal } = usePremiumModalContext();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
          <Star className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-xl">Fonctionnalité Premium</CardTitle>
        <CardDescription>
          Cette fonctionnalité nécessite un abonnement Premium
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span>Accès illimité aux défis</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="h-4 w-4 text-blue-500" />
            <span>Sécurité renforcée</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="h-4 w-4 text-green-500" />
            <span>Communauté exclusive</span>
          </div>
        </div>
        
        <Button 
          onClick={showPremiumModal}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold"
        >
          <Star className="h-4 w-4 mr-2" />
          Débloquer Premium
        </Button>
      </CardContent>
    </Card>
  );
};

export default PremiumExample;
