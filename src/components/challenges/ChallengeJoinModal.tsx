import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Target,
  Banknote,
  CreditCard,
  Wallet, CheckCircle,
  Info
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SavingsChallenge } from '@/types/challenge';

interface GoalFormData {
  currency: string;
  monthlyIncome: number;
  isVariableIncome: boolean;
  incomeHistory: number[];
  startDate: string;
  endDate: string;
}

interface ChallengeJoinModalProps {
  challenge: SavingsChallenge | null;
  isOpen: boolean;
  onClose: () => void;
  onJoin: (goalData: { 
    targetAmount: number; 
    mode: 'free' | 'forced'; 
    bankAccountId?: string;
    motivation?: string;
    goalFormData: GoalFormData;
  }) => void;
  isLoading?: boolean;
}

export const ChallengeJoinModal = ({ 
  challenge, 
  isOpen, 
  onClose, 
  onJoin,
  isLoading = false
}: ChallengeJoinModalProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    mode: 'free' as 'free' | 'forced',
    bankAccountId: '',
    motivation: ''
  });
  const [goalFormData, setGoalFormData] = useState<GoalFormData>({
    currency: 'EUR',
    monthlyIncome: 0,
    isVariableIncome: false,
    incomeHistory: [0, 0, 0, 0, 0, 0],
    startDate: challenge?.startDate || new Date().toISOString().split('T')[0],
    endDate: challenge?.endDate || new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock bank accounts - dans une vraie app, ceci viendrait du store
  const bankAccounts = [
    { id: '1', name: 'Compte Courant - Crédit Agricole', balance: 2500.50 },
    { id: '2', name: 'Livret A - BNP Paribas', balance: 1200.75 },
    { id: '3', name: 'Compte Épargne - Société Générale', balance: 5000.00 }
  ];

  const getChallengeDurationMonths = () => {
    if (!challenge) return 1;
    const startDate = new Date(challenge.startDate);
    const endDate = new Date(challenge.endDate);
    return Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  };

  const calculateTargetAmount = () => {
    if (!challenge) return 0;
    
    const challengeDurationMonths = getChallengeDurationMonths();
    
    if (goalFormData.isVariableIncome) {
      const validIncomes = goalFormData.incomeHistory.filter(income => income > 0);
      if (validIncomes.length === 0) return 0;
      const average = validIncomes.reduce((sum, income) => sum + income, 0) / validIncomes.length;
      return Math.round(average * 0.1 * challengeDurationMonths);
    } else {
      return Math.round(goalFormData.monthlyIncome * 0.1 * challengeDurationMonths);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validation du formulaire d'objectif
    if (goalFormData.isVariableIncome) {
      const validIncomes = goalFormData.incomeHistory.filter(income => income > 0);
      if (validIncomes.length === 0) {
        newErrors.incomeHistory = 'Veuillez saisir au moins un revenu valide';
      }
    } else {
      if (!goalFormData.monthlyIncome || goalFormData.monthlyIncome <= 0) {
        newErrors.monthlyIncome = 'Veuillez entrer un revenu mensuel valide';
      }
    }

    // Les dates sont définies par le challenge, pas de validation nécessaire

    // Validation du mode de participation
    if (formData.mode === 'forced' && !formData.bankAccountId) {
      newErrors.bankAccountId = 'Veuillez sélectionner un compte bancaire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateForm()) {
      setStep(2);
    }
  };

  const handleJoin = () => {
    if (validateForm()) {
      onJoin({
        targetAmount: calculateTargetAmount(),
        mode: formData.mode,
        bankAccountId: formData.mode === 'forced' ? formData.bankAccountId : undefined,
        motivation: formData.motivation,
        goalFormData: goalFormData
      });
      // Don't call onClose() here - let the parent handle it after loading
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      mode: 'free',
      bankAccountId: '',
      motivation: ''
    });
    setGoalFormData({
      currency: 'EUR',
      monthlyIncome: 0,
      isVariableIncome: false,
      incomeHistory: [0, 0, 0, 0, 0, 0],
      startDate: challenge?.startDate || new Date().toISOString().split('T')[0],
      endDate: challenge?.endDate || new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setErrors({});
    onClose();
  };

  if (!challenge) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-primary" />
            <span>Rejoindre le challenge</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Challenge Info */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2">{challenge.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Target className="w-4 h-4" />
                    <span>{challenge.targetAmount.toLocaleString()}€</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Banknote className="w-4 h-4" />
                    <span>{challenge.duration} jours</span>
                  </span>
                </div>
                <Badge variant="outline">
                  {challenge.type === 'monthly' ? 'Mensuel' : 
                   challenge.type === 'weekly' ? 'Hebdomadaire' : 
                   challenge.type === 'daily' ? 'Quotidien' : 'Personnalisé'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Goal Setting */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold mb-4">1. Configuration de votre objectif d'épargne</h3>
                
                <div className="space-y-6">
                  {/* Devise et Type de revenus */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currency">Devise</Label>
                      <Select value={goalFormData.currency} onValueChange={(value) => setGoalFormData({...goalFormData, currency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                          <SelectItem value="USD">Dollar ($)</SelectItem>
                          <SelectItem value="XOF">Franc CFA (XOF)</SelectItem>
                          <SelectItem value="MAD">Dirham (MAD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Type de revenus</Label>
                      <RadioGroup 
                        value={goalFormData.isVariableIncome ? 'variable' : 'fixed'} 
                        onValueChange={(value) => setGoalFormData({...goalFormData, isVariableIncome: value === 'variable'})}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fixed" id="fixed" />
                          <Label htmlFor="fixed">Revenu fixe</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="variable" id="variable" />
                          <Label htmlFor="variable">Revenus variables</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  {/* Revenus */}
                  {!goalFormData.isVariableIncome ? (
                    <div>
                      <Label htmlFor="monthlyIncome">Revenu mensuel fixe</Label>
                      <Input
                        id="monthlyIncome"
                        type="number"
                        value={goalFormData.monthlyIncome}
                        onChange={(e) => setGoalFormData({...goalFormData, monthlyIncome: parseFloat(e.target.value) || 0})}
                        placeholder="Ex: 2500"
                        className={errors.monthlyIncome ? 'border-red-500' : ''}
                        required
                      />
                      {errors.monthlyIncome && (
                        <p className="text-sm text-red-500 mt-1">{errors.monthlyIncome}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Votre objectif sera calculé à 10% de votre revenu sur la durée du challenge ({getChallengeDurationMonths()} mois)
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Label>Vos revenus des 6 derniers mois</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {goalFormData.incomeHistory.map((income, index) => (
                          <Input
                            key={index}
                            type="number"
                            placeholder={`Mois ${index + 1}`}
                            value={income || ''}
                            onChange={(e) => {
                              const newHistory = [...goalFormData.incomeHistory];
                              newHistory[index] = parseFloat(e.target.value) || 0;
                              setGoalFormData({...goalFormData, incomeHistory: newHistory});
                            }}
                            className={errors.incomeHistory ? 'border-red-500' : ''}
                          />
                        ))}
                      </div>
                      {errors.incomeHistory && (
                        <p className="text-sm text-red-500 mt-1">{errors.incomeHistory}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Nous calculerons la moyenne pour déterminer votre objectif sur la durée du challenge ({getChallengeDurationMonths()} mois)
                      </p>
                    </div>
                  )}

                  {/* Informations du challenge */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Informations du challenge</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Début :</span>
                        <span className="ml-2 font-medium">{new Date(challenge.startDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Fin :</span>
                        <span className="ml-2 font-medium">{new Date(challenge.endDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Durée :</span>
                        <span className="ml-2 font-medium">{getChallengeDurationMonths()} mois</span>
                      </div>
                    </div>
                  </div>

                  {/* Aperçu de l'objectif */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Aperçu de votre objectif</h4>
                    <p className="text-blue-800">
                      Objectif total : <span className="font-bold">{calculateTargetAmount().toLocaleString()} {goalFormData.currency}</span>
                    </p>
                    <p className="text-blue-700 text-sm mt-1">
                      Durée du challenge : {getChallengeDurationMonths()} mois
                    </p>
                    <p className="text-blue-700 text-sm">
                      Soit environ {Math.round(calculateTargetAmount() / getChallengeDurationMonths()).toLocaleString()} {goalFormData.currency} par mois
                    </p>
                  </div>

                  {/* Mode de participation */}
                  <div>
                    <Label>Mode de participation *</Label>
                    <RadioGroup
                      value={formData.mode}
                      onValueChange={(value) => setFormData({ ...formData, mode: value as 'free' | 'forced' })}
                      className="mt-2"
                    >
                      <div className="flex items-start space-x-3 p-3 border rounded-lg">
                        <RadioGroupItem value="free" id="free" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="free" className="flex items-center space-x-2 cursor-pointer">
                            <Wallet className="w-4 h-4" />
                            <span className="font-medium">Mode Libre</span>
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            Vous gérez vos versements manuellement sans connexion bancaire
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-3 border rounded-lg">
                        <RadioGroupItem value="forced" id="forced" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="forced" className="flex items-center space-x-2 cursor-pointer">
                            <CreditCard className="w-4 h-4" />
                            <span className="font-medium">Mode Forcé</span>
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            Vos versements sont automatiquement prélevés de votre compte bancaire
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.mode === 'forced' && (
                    <div>
                      <Label htmlFor="bankAccount">Compte bancaire *</Label>
                      <Select
                        value={formData.bankAccountId}
                        onValueChange={(value) => setFormData({ ...formData, bankAccountId: value })}
                      >
                        <SelectTrigger className={errors.bankAccountId ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Sélectionnez un compte" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{account.name}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                  {account.balance.toLocaleString()}€
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.bankAccountId && (
                        <p className="text-sm text-red-500 mt-1">{errors.bankAccountId}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Confirmation */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-lg font-semibold mb-4">2. Confirmez votre participation</h3>
                
                <Card className="bg-gray-50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Objectif d'épargne :</span>
                      <span className="text-lg font-bold text-primary">
                        {calculateTargetAmount().toLocaleString()} {goalFormData.currency}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Type de revenus :</span>
                      <span className="text-sm">
                        {goalFormData.isVariableIncome ? 'Revenus variables' : 'Revenu fixe'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Période :</span>
                      <span className="text-sm">
                        Du {new Date(goalFormData.startDate).toLocaleDateString('fr-FR')} au {new Date(goalFormData.endDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Mode :</span>
                      <Badge variant={formData.mode === 'free' ? 'outline' : 'default'}>
                        {formData.mode === 'free' ? 'Mode Libre' : 'Mode Forcé'}
                      </Badge>
                    </div>
                    
                    {formData.mode === 'forced' && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Compte bancaire :</span>
                        <span className="text-sm">
                          {bankAccounts.find(a => a.id === formData.bankAccountId)?.name}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Important :</p>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li>• Vous ne pourrez rejoindre qu'un seul challenge à la fois</li>
                        <li>• Les versements ne seront possibles qu'entre le {new Date(goalFormData.startDate).toLocaleDateString('fr-FR')} et le {new Date(goalFormData.endDate).toLocaleDateString('fr-FR')}</li>
                        <li>• Vous pourrez abandonner le challenge à tout moment</li>
                        {formData.mode === 'forced' && (
                          <li>• Les prélèvements automatiques commenceront à la date de début du challenge</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="motivation">Motivation (optionnel)</Label>
                    <Textarea
                      id="motivation"
                      placeholder="Pourquoi voulez-vous participer à ce challenge ?"
                      value={formData.motivation}
                      onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={step === 1 ? handleClose : () => setStep(1)}
            >
              {step === 1 ? 'Annuler' : 'Retour'}
            </Button>
            
            {step === 1 ? (
              <Button onClick={handleNext} disabled={isLoading}>
                Continuer
              </Button>
            ) : (
              <Button 
                onClick={handleJoin} 
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Rejoindre...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Rejoindre le challenge
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
