import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Globe, Lock, UserCheck, Plus, X, ArrowLeft, ArrowRight } from "lucide-react";
import { useDefiStore } from "@/stores/defiStore";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import type { DefiType, DefiVisibility } from "@/types/defi";

interface CreateDefiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = 1 | 2 | 3 | 4;

export const CreateDefiModal = ({ isOpen, onClose, onSuccess }: CreateDefiModalProps) => {
  const { user } = useAuth();
  const { createDefi, isCreating } = useDefiStore();
  
  const [currentStep, setCurrentStep] = useState<Step>(1);
  
  // Step 1: Basic Info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<DefiType>("MONTHLY");
  
  // Step 2: Dates
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hasNoEndDate, setHasNoEndDate] = useState(false);
  
  // Step 3: Participants & Visibility
  const [visibility, setVisibility] = useState<DefiVisibility>("PUBLIC");
  const [isUnlimited, setIsUnlimited] = useState(true);
  const [maxParticipants, setMaxParticipants] = useState<number>(100);
  
  // Step 4: Rewards
  const [rewards, setRewards] = useState<string[]>([]);
  const [currentReward, setCurrentReward] = useState("");

  const resetForm = () => {
    setCurrentStep(1);
    setTitle("");
    setDescription("");
    setType("MONTHLY");
    setStartDate("");
    setEndDate("");
    setHasNoEndDate(false);
    setVisibility("PUBLIC");
    setIsUnlimited(true);
    setMaxParticipants(100);
    setRewards([]);
    setCurrentReward("");
  };

  const handleAddReward = () => {
    if (currentReward.trim()) {
      setRewards([...rewards, currentReward.trim()]);
      setCurrentReward("");
    }
  };

  const handleRemoveReward = (index: number) => {
    setRewards(rewards.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep < 4) {
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
        if (!title.trim()) {
          toast({
            title: "Erreur",
            description: "Le titre est requis",
            variant: "destructive"
          });
          return false;
        }
        if (!description.trim()) {
          toast({
            title: "Erreur",
            description: "La description est requise",
            variant: "destructive"
          });
          return false;
        }
        return true;
      
      case 2:
        if (!startDate) {
          toast({
            title: "Erreur",
            description: "La date de début est requise",
            variant: "destructive"
          });
          return false;
        }
        if (!hasNoEndDate && !endDate) {
          toast({
            title: "Erreur",
            description: "La date de fin est requise ou activez 'Défi permanent'",
            variant: "destructive"
          });
          return false;
        }
        if (!hasNoEndDate && endDate && new Date(endDate) <= new Date(startDate)) {
          toast({
            title: "Erreur",
            description: "La date de fin doit être après la date de début",
            variant: "destructive"
          });
          return false;
        }
        return true;
      
      case 3:
        if (!isUnlimited && (!maxParticipants || maxParticipants < 1)) {
          toast({
            title: "Erreur",
            description: "Le nombre de participants doit être au moins 1",
            variant: "destructive"
          });
          return false;
        }
        return true;
      
      case 4:
        return true;
      
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    try {
      const defiData = {
        title: title.trim(),
        description: description.trim(),
        type,
        startDate,
        endDate: hasNoEndDate ? undefined : endDate,
        hasNoEndDate,
        isUnlimited,
        maxParticipants: isUnlimited ? undefined : maxParticipants,
        visibility,
        rewards: rewards.length > 0 ? rewards : []
      };

      const result = await createDefi(defiData);
      
      if (result) {
        toast({
          title: "Succès !",
          description: "Votre défi a été créé avec succès",
        });
        resetForm();
        onClose();
        onSuccess?.();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création du défi",
        variant: "destructive"
      });
    }
  };

  const handleNextWithValidation = () => {
    if (validateStep(currentStep)) {
      handleNext();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du défi *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Challenge 52 semaines"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre défi..."
                rows={5}
                maxLength={500}
              />
              <p className="text-xs text-gray-500">
                {description.length}/500 caractères
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de défi *</Label>
              <Select value={type} onValueChange={(v) => setType(v as DefiType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Quotidien</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="WEEKLY">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Hebdomadaire</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="MONTHLY">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Mensuel</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="CUSTOM">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4" />
                      <span>Personnalisé</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="hasNoEndDate"
                checked={hasNoEndDate}
                onCheckedChange={setHasNoEndDate}
              />
              <Label htmlFor="hasNoEndDate" className="cursor-pointer">
                Défi permanent (sans date de fin)
              </Label>
            </div>

            {!hasNoEndDate && (
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
            )}

            {startDate && endDate && !hasNoEndDate && (
              <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                <p className="font-semibold">Durée calculée:</p>
                <p>
                  {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} jours
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibilité *</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as DefiVisibility)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <div>
                        <p className="font-semibold">Public</p>
                        <p className="text-xs text-gray-500">Tout le monde peut voir et rejoindre</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="PRIVATE">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <div>
                        <p className="font-semibold">Privé</p>
                        <p className="text-xs text-gray-500">Uniquement avec le lien</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="FRIENDS">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-4 h-4" />
                      <div>
                        <p className="font-semibold">Amis uniquement</p>
                        <p className="text-xs text-gray-500">Visible par vos amis</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isUnlimited"
                checked={isUnlimited}
                onCheckedChange={setIsUnlimited}
              />
              <Label htmlFor="isUnlimited" className="cursor-pointer">
                Nombre de participants illimité
              </Label>
            </div>

            {!isUnlimited && (
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Nombre maximum de participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 1)}
                  min={1}
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Récompenses (optionnel)</Label>
              <div className="flex space-x-2">
                <Input
                  value={currentReward}
                  onChange={(e) => setCurrentReward(e.target.value)}
                  placeholder="Ajouter une récompense..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddReward();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={handleAddReward}
                  variant="outline"
                  size="icon"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {rewards.length > 0 && (
              <div className="space-y-2">
                <Label>Récompenses ajoutées:</Label>
                <div className="space-y-2">
                  {rewards.map((reward, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{reward}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveReward(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Suggestions de récompenses:</Label>
              <div className="flex flex-wrap gap-2">
                {["Badge d'honneur", "Certificat de réussite", "Mention spéciale", "Trophée virtuel"].map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                    onClick={() => {
                      if (!rewards.includes(suggestion)) {
                        setRewards([...rewards, suggestion]);
                      }
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Créer un nouveau défi
          </DialogTitle>
          <DialogDescription>
            Étape {currentStep} sur 4
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((step) => (
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
              {step < 4 && (
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
            disabled={isCreating}
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

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={handleNextWithValidation}
              disabled={isCreating}
            >
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isCreating}
            >
              {isCreating ? 'Création...' : 'Créer le défi'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

