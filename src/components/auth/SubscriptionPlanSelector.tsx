import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Shield, Users } from 'lucide-react';
import { SubscriptionPlan, subscriptionPlans } from '@/types/subscription';

interface SubscriptionPlanSelectorProps {
  selectedPlan: SubscriptionPlan;
  onPlanChange: (plan: SubscriptionPlan) => void;
  disabled?: boolean;
}

const SubscriptionPlanSelector = ({ 
  selectedPlan, 
  onPlanChange, 
  disabled = false 
}: SubscriptionPlanSelectorProps) => {
  const getPlanIcon = (plan: SubscriptionPlan) => {
    switch (plan) {
      case SubscriptionPlan.FREE:
        return <Zap className="h-5 w-5 text-blue-500" />;
      case SubscriptionPlan.TRIAL:
        return <Star className="h-5 w-5 text-yellow-500" />;
      case SubscriptionPlan.PREMIUM:
        return <Shield className="h-5 w-5 text-purple-500" />;
      case SubscriptionPlan.SIX_MONTHS:
        return <Users className="h-5 w-5 text-green-500" />;
      default:
        return <Zap className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Gratuit';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choisissez votre plan</h3>
        <p className="text-sm text-gray-600">
          Sélectionnez le plan qui correspond le mieux à vos besoins
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subscriptionPlans.map((plan) => (
          <Card
            key={plan.value}
            className={`cursor-pointer transition-all ${
              selectedPlan === plan.value
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onPlanChange(plan.value)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getPlanIcon(plan.value)}
                  <CardTitle className="text-lg">{plan.label}</CardTitle>
                </div>
                {selectedPlan === plan.value && (
                  <Check className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(plan.price)}
                </span>
                {plan.duration && (
                  <Badge variant="secondary" className="text-xs">
                    {plan.duration}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlanSelector;
