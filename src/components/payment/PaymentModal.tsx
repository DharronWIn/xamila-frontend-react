import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    CreditCard,
    Smartphone,
    Shield,
    Check,
    ArrowLeft,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId?: string;
  planName?: string;
  planPrice?: string;
  planPeriod?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'momo';
  icon: any;
  color: string;
  countries?: string[];
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'visa',
    name: 'Carte Visa/Mastercard',
    type: 'card',
    icon: CreditCard,
    color: 'bg-blue-600',
  },
  {
    id: 'orange',
    name: 'Orange Money',
    type: 'momo',
    icon: Smartphone,
    color: 'bg-orange-500',
    countries: ['Sénégal', 'Mali', 'Burkina Faso', 'Niger', 'Guinée', 'Côte d\'Ivoire']
  },
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    type: 'momo',
    icon: Smartphone,
    color: 'bg-yellow-500',
    countries: ['Cameroun', 'Ouganda', 'Ghana', 'Rwanda', 'Bénin', 'Congo']
  },
  {
    id: 'moov',
    name: 'Moov Money',
    type: 'momo',
    icon: Smartphone,
    color: 'bg-blue-500',
    countries: ['Bénin', 'Burkina Faso', 'Niger', 'Togo', 'Mali']
  },
  {
    id: 'wave',
    name: 'Wave',
    type: 'momo',
    icon: Smartphone,
    color: 'bg-purple-600',
    countries: ['Sénégal', 'Mali', 'Burkina Faso', 'Côte d\'Ivoire']
  }
];

type PaymentStep = 'method' | 'details' | 'confirmation' | 'processing' | 'success' | 'error';

export function PaymentModal({ isOpen, onClose, planId = "premium", planName = "Premium", planPrice = "29.99", planPeriod = "/6 mois" }: PaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>('method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, upgradeToPremium } = useAuthStore();

  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    country: '',
  });

  const [momoData, setMomoData] = useState({
    phone: '',
    country: '',
    operator: '',
  });

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('details');
  };

  const handlePaymentSubmit = async () => {
    setIsProcessing(true);
    setStep('processing');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate success (90% success rate)
      if (Math.random() > 0.1) {
        upgradeToPremium();
        setStep('success');
        toast.success('Paiement réussi ! Bienvenue dans la version Premium.');
      } else {
        setStep('error');
        toast.error('Échec du paiement. Veuillez réessayer.');
      }
    } catch (error) {
      setStep('error');
      toast.error('Une erreur est survenue lors du paiement.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetPayment = () => {
    setStep('method');
    setSelectedMethod(null);
    setCardData({ number: '', expiry: '', cvv: '', name: '', country: '' });
    setMomoData({ phone: '', country: '', operator: '' });
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetPayment();
      onClose();
    }
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
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {step !== 'method' && step !== 'success' && step !== 'error' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep(step === 'details' ? 'method' : 'details')}
                      className="text-white hover:bg-white/20"
                      disabled={isProcessing}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {step === 'method' && 'Choisir votre méthode de paiement'}
                      {step === 'details' && `Paiement par ${selectedMethod?.name}`}
                      {step === 'confirmation' && 'Confirmer votre paiement'}
                      {step === 'processing' && 'Traitement en cours...'}
                      {step === 'success' && 'Paiement réussi !'}
                      {step === 'error' && 'Échec du paiement'}
                    </h2>
                    <p className="text-white/90 text-sm">
                      {planName} - {planPrice}€{planPeriod}
                    </p>
                  </div>
                </div>
                
                {!isProcessing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Progress Steps */}
              <div className="flex space-x-2 mt-4">
                <div className={`h-2 flex-1 rounded-full transition-colors ${
                  ['method', 'details', 'confirmation', 'processing', 'success'].includes(step) ? 'bg-white' : 'bg-white/30'
                }`} />
                <div className={`h-2 flex-1 rounded-full transition-colors ${
                  ['details', 'confirmation', 'processing', 'success'].includes(step) ? 'bg-white' : 'bg-white/30'
                }`} />
                <div className={`h-2 flex-1 rounded-full transition-colors ${
                  ['confirmation', 'processing', 'success'].includes(step) ? 'bg-white' : 'bg-white/30'
                }`} />
                <div className={`h-2 flex-1 rounded-full transition-colors ${
                  step === 'success' ? 'bg-white' : 'bg-white/30'
                }`} />
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* Method Selection */}
                {step === 'method' && (
                  <motion.div
                    key="method"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="grid gap-3">
                      {paymentMethods.map((method) => (
                        <motion.button
                          key={method.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleMethodSelect(method)}
                          className="p-4 border border-gray-200 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-left"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-lg ${method.color} text-white`}>
                              <method.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{method.name}</h3>
                              {method.countries && (
                                <p className="text-sm text-gray-500">
                                  Disponible: {method.countries.slice(0, 3).join(', ')}
                                  {method.countries.length > 3 && '...'}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {method.type === 'card' ? 'Carte bancaire' : 'Mobile Money'}
                            </Badge>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-900">Paiement 100% sécurisé</span>
                      </div>
                      <p className="text-green-700 text-sm mt-1">
                        Vos informations de paiement sont chiffrées et protégées
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Payment Details */}
                {step === 'details' && selectedMethod && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {selectedMethod.type === 'card' ? (
                      <CardPaymentForm 
                        cardData={cardData}
                        setCardData={setCardData}
                        onSubmit={() => setStep('confirmation')}
                      />
                    ) : (
                      <MomoPaymentForm 
                        momoData={momoData}
                        setMomoData={setMomoData}
                        method={selectedMethod}
                        onSubmit={() => setStep('confirmation')}
                      />
                    )}
                  </motion.div>
                )}

                {/* Confirmation */}
                {step === 'confirmation' && (
                  <motion.div
                    key="confirmation"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Récapitulatif de commande</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span>Plan sélectionné</span>
                          <span className="font-medium">{planName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prix</span>
                          <span className="font-medium">{planPrice}€{planPeriod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Méthode de paiement</span>
                          <span className="font-medium">{selectedMethod?.name}</span>
                        </div>
                        <div className="border-t pt-4">
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>{planPrice}€</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Button 
                      onClick={handlePaymentSubmit}
                      className="w-full"
                      size="lg"
                      disabled={isProcessing}
                    >
                      Confirmer le paiement
                    </Button>
                  </motion.div>
                )}

                {/* Processing */}
                {step === 'processing' && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-12"
                  >
                    <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Traitement de votre paiement...</h3>
                    <p className="text-gray-600">
                      Veuillez ne pas fermer cette fenêtre pendant le traitement
                    </p>
                  </motion.div>
                )}

                {/* Success */}
                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Paiement réussi !</h3>
                    <p className="text-gray-600 mb-6">
                      Bienvenue dans la version Premium du Challenge d'Épargne
                    </p>
                    <Button onClick={handleClose} size="lg">
                      Continuer
                    </Button>
                  </motion.div>
                )}

                {/* Error */}
                {step === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <X className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Échec du paiement</h3>
                    <p className="text-gray-600 mb-6">
                      Une erreur est survenue lors du traitement. Veuillez réessayer.
                    </p>
                    <div className="flex space-x-3 justify-center">
                      <Button variant="outline" onClick={resetPayment}>
                        Réessayer
                      </Button>
                      <Button onClick={handleClose}>
                        Fermer
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Card Payment Form Component
interface CardPaymentFormProps {
  cardData: any;
  setCardData: (data: any) => void;
  onSubmit: () => void;
}

function CardPaymentForm({ cardData, setCardData, onSubmit }: CardPaymentFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="cardName">Nom sur la carte</Label>
        <Input
          id="cardName"
          value={cardData.name}
          onChange={(e) => setCardData({...cardData, name: e.target.value})}
          placeholder="John Doe"
          required
        />
      </div>

      <div>
        <Label htmlFor="cardNumber">Numéro de carte</Label>
        <Input
          id="cardNumber"
          value={cardData.number}
          onChange={(e) => setCardData({...cardData, number: e.target.value})}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expiry">Date d'expiration</Label>
          <Input
            id="expiry"
            value={cardData.expiry}
            onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
            placeholder="MM/YY"
            maxLength={5}
            required
          />
        </div>
        <div>
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            value={cardData.cvv}
            onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
            placeholder="123"
            maxLength={4}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="country">Pays</Label>
        <Select value={cardData.country} onValueChange={(value) => setCardData({...cardData, country: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner votre pays" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fr">France</SelectItem>
            <SelectItem value="sn">Sénégal</SelectItem>
            <SelectItem value="ci">Côte d'Ivoire</SelectItem>
            <SelectItem value="ma">Maroc</SelectItem>
            <SelectItem value="tn">Tunisie</SelectItem>
            <SelectItem value="ca">Canada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" size="lg">
        Continuer
      </Button>
    </form>
  );
}

// Mobile Money Payment Form Component
interface MomoPaymentFormProps {
  momoData: any;
  setMomoData: (data: any) => void;
  method: PaymentMethod;
  onSubmit: () => void;
}

function MomoPaymentForm({ momoData, setMomoData, method, onSubmit }: MomoPaymentFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="country">Pays</Label>
        <Select value={momoData.country} onValueChange={(value) => setMomoData({...momoData, country: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner votre pays" />
          </SelectTrigger>
          <SelectContent>
            {method.countries?.map((country) => (
              <SelectItem key={country} value={country.toLowerCase()}>{country}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="phone">Numéro de téléphone</Label>
        <Input
          id="phone"
          value={momoData.phone}
          onChange={(e) => setMomoData({...momoData, phone: e.target.value})}
          placeholder="+221 77 123 45 67"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Numéro associé à votre compte {method.name}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Instructions de paiement</h3>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Vous recevrez un message de confirmation sur votre téléphone</li>
          <li>2. Suivez les instructions pour autoriser le paiement</li>
          <li>3. Saisissez votre code PIN {method.name}</li>
        </ol>
      </div>

      <Button type="submit" className="w-full" size="lg">
        Continuer
      </Button>
    </form>
  );
}
