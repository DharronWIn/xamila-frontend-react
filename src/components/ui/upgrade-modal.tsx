import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Check, X, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaymentModal } from "@/components/payment/PaymentModal";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

const plans = [
  {
    id: "premium",
    name: "Premium",
    price: "29.99",
    period: "/6 mois",
    description: "Accès complet à la plateforme",
    features: [
      "Suivi financier complet",
      "Challenge d'épargne personnalisé",
      "Accès aux ressources premium",
      "Classement global",
      "Support prioritaire",
      "Analyses approfondies",
      "Conseils personnalisés",
      "Certificat de participation",
      "Accès anticipé aux nouveautés",
      "Coaching financier personnalisé",
      "Rapport détaillé",
      "Support dédié"
    ],
    popular: true
  }
];

const paymentMethods = [
  { id: "card", name: "Carte bancaire", icon: CreditCard, type: "Visa, Mastercard" },
  { id: "orange", name: "Orange Money", icon: Smartphone, type: "Mobile Money" },
  { id: "mtn", name: "MTN Money", icon: Smartphone, type: "Mobile Money" },
  { id: "moov", name: "Moov Money", icon: Smartphone, type: "Mobile Money" },
  { id: "wave", name: "Wave", icon: Smartphone, type: "Mobile Money" },
];

export function UpgradeModal({ isOpen, onClose, feature }: UpgradeModalProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);

  const handlePlanSelect = (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-primary to-primary/80 px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Passer à Premium</h2>
                    <p className="text-white/90 text-sm">
                      {feature ? `Pour accéder à ${feature}, ` : ""}
                      Débloquez toutes les fonctionnalités avancées du Challenge d'Épargne
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-6">
              {/* Plans */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Abonnement Premium</h3>
                <div className="flex justify-center">
                  <div className="w-full max-w-md">
                  {plans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative p-6 border-2 rounded-2xl transition-all duration-300 hover:shadow-lg ${
                        plan.popular 
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      {plan.popular && (
                        <Badge className="absolute -top-3 left-6 bg-primary text-white">
                          Recommandé
                        </Badge>
                      )}
                      
                      {plan.savings && (
                        <Badge variant="secondary" className="absolute -top-3 right-6 bg-green-100 text-green-700">
                          {plan.savings}
                        </Badge>
                      )}

                      <div className="text-center mb-4">
                        <h4 className="font-semibold text-lg">{plan.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                        <div className="flex items-baseline justify-center">
                          <span className="text-3xl font-bold">{plan.price}€</span>
                          <span className="text-gray-500 ml-1">{plan.period}</span>
                        </div>
                      </div>

                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button 
                        className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                        variant={plan.popular ? 'default' : 'outline'}
                        onClick={() => handlePlanSelect(plan)}
                      >
                        S'abonner maintenant
                      </Button>
                    </motion.div>
                  ))}
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Méthode de paiement</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {paymentMethods.map((method) => (
                    <motion.button
                      key={method.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 border border-gray-200 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group"
                    >
                      <method.icon className="w-6 h-6 mx-auto mb-2 text-gray-600 group-hover:text-primary" />
                      <div className="text-sm font-medium text-gray-900">{method.name}</div>
                      <div className="text-xs text-gray-500">{method.type}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 text-center">
                  <Check className="w-4 h-4 inline mr-1" />
                  Paiement sécurisé. Annulation possible à tout moment.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          planPrice={selectedPlan.price}
          planPeriod={selectedPlan.period}
        />
      )}
    </AnimatePresence>
  );
}
