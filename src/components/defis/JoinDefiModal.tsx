import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, DollarSign, Target, Heart } from "lucide-react";
import { useDefiStore } from "@/stores/defiStore";
import { toast } from "@/hooks/use-toast";
import type { Defi } from "@/types/defi";

interface JoinDefiModalProps {
  isOpen: boolean;
  onClose: () => void;
  defi: Defi | null;
  onSuccess?: () => void;
}

type Step = 1 | 2 | 3;

export const JoinDefiModal = ({ isOpen, onClose, defi, onSuccess }: JoinDefiModalProps) => {
  const { joinDefi, configureGoal, isJoining } = useDefiStore();
  
  const [currentStep, setCurrentStep] = useState<Step>(1);
  
  // Step 2: Goal
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [mode, setMode] = useState<'free' | 'forced'>('free');
  
  // Step 3: Optional Configuration
  const [currency, setCurrency] = useState("XOF");
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [isVariableIncome, setIsVariableIncome] = useState(false);
  const [motivation, setMotivation] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const resetForm = () => {
    setCurrentStep(1);
    setTargetAmount(0);
    setMode('free');
    setCurrency("XOF");
    setMonthlyIncome(0);
    setIsVariableIncome(false);
    setMotivation("");
    setAdditionalNotes("");
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 1:
        return true;
      
      case 2:
        if (!targetAmount || targetAmount <= 0) {
          toast({
            title: "Erreur",
            description: "Le montant objectif doit être supérieur à 0",
            variant: "destructive"
          });
          return false;
        }
        return true;
      
      case 3:
        return true;
      
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!defi || !validateStep(2)) return;

    try {
      // First, join the defi
      const joinSuccess = await joinDefi(defi.id, {
        targetAmount,
        mode,
        motivation: motivation.trim() || undefined
      });
      
      if (joinSuccess) {
        // If step 3 data is provided, configure the goal
        if (currentStep === 3 && (monthlyIncome || additionalNotes)) {
          await configureGoal(defi.id, {
            targetAmount,
            mode,
            currency,
            monthlyIncome: monthlyIncome || undefined,
            isVariableIncome,
            motivation: motivation.trim() || undefined,
            additionalNotes: additionalNotes.trim() || undefined
          });
        }
        
        toast({
          title: "Félicitations !",
          description: "Vous participez maintenant au défi !",
        });
        
        resetForm();
        onClose();
        onSuccess?.();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  const handleNextWithValidation = () => {
    if (validateStep(currentStep)) {
      handleNext();
    }
  };

  const calculateWeeklySuggestion = () => {
    if (!defi || !targetAmount || !defi.duration) return 0;
    const weeks = Math.ceil(defi.duration / 7);
    return Math.ceil(targetAmount / weeks);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">{defi?.title}</h4>
                    <p className="text-sm text-gray-600">{defi?.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Type:</p>
                      <p className="font-semibold">{defi?.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Statut:</p>
                      <p className="font-semibold">{defi?.status}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Participants:</p>
                      <p className="font-semibold">{defi?._count?.participants || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Durée:</p>
                      <p className="font-semibold">
                        {defi?.hasNoEndDate ? 'Permanent' : `${defi?.duration || 0} jours`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Vous êtes sur le point de rejoindre ce défi. 
                À l'étape suivante, vous définirez votre objectif d'épargne personnel.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Combien voulez-vous épargner ? *</span>
                </div>
              </Label>
              <div className="relative">
                <Input
                  id="targetAmount"
                  type="number"
                  value={targetAmount || ""}
                  onChange={(e) => setTargetAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 50000"
                  className="pr-16"
                  min={0}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 text-sm">{currency}</span>
                </div>
              </div>
            </div>

            {targetAmount > 0 && defi?.duration && (
              <div className="space-y-2 p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-semibold text-green-700">
                  Suggestions basées sur la durée:
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-white rounded">
                    <p className="text-gray-600">Par semaine</p>
                    <p className="font-bold text-green-700">
                      {calculateWeeklySuggestion()} {currency}
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <p className="text-gray-600">Par jour</p>
                    <p className="font-bold text-green-700">
                      {Math.ceil(targetAmount / defi.duration)} {currency}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="motivation">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span>Votre motivation (optionnel)</span>
                </div>
              </Label>
              <Textarea
                id="motivation"
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder="Ex: Pour mes vacances d'été..."
                rows={3}
                maxLength={200}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Ces informations sont optionnelles mais nous aident à vous fournir de meilleures recommandations.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Devise</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XOF">XOF (Franc CFA)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  <SelectItem value="USD">USD (Dollar)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Revenu mensuel (optionnel)</span>
                </div>
              </Label>
              <div className="relative">
                <Input
                  id="monthlyIncome"
                  type="number"
                  value={monthlyIncome || ""}
                  onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 100000"
                  className="pr-16"
                  min={0}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 text-sm">{currency}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isVariableIncome"
                checked={isVariableIncome}
                onCheckedChange={setIsVariableIncome}
              />
              <Label htmlFor="isVariableIncome" className="cursor-pointer">
                Revenus variables
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Notes additionnelles</Label>
              <Textarea
                id="additionalNotes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Informations supplémentaires..."
                rows={3}
                maxLength={300}
              />
            </div>
          </div>
        );
    }
  };

  if (!defi) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Rejoindre le défi
          </DialogTitle>
          <DialogDescription>
            Étape {currentStep} sur 3
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= step
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? onClose : handlePrevious}
            disabled={isJoining}
          >
            {currentStep === 1 ? (
              'Annuler'
            ) : (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </>
            )}
          </Button>

          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={handleNextWithValidation}
              disabled={isJoining}
            >
              {currentStep === 2 ? 'Passer' : 'Suivant'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isJoining}
            >
              {isJoining ? 'Rejoindre...' : 'Finaliser'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

