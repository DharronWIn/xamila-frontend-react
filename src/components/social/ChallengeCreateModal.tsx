import { useState } from "react";
import { motion } from "framer-motion";
import {
    X,
    Trophy,
    Calendar,
    Clock,
    Target,
    Users,
    Award,
    Euro, Plus
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSocialStore } from "@/stores/socialStore";
import { useAuthStore } from "@/stores/authStore";
import { getUserProfilePicture } from "@/lib/utils";

interface ChallengeCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChallengeCreateModal = ({ isOpen, onClose }: ChallengeCreateModalProps) => {
  const { createChallenge } = useSocialStore();
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("monthly");
  const [targetAmount, setTargetAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [rewards, setRewards] = useState<string[]>([]);
  const [newReward, setNewReward] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const challengeTypes = [
    {
      value: "monthly",
      label: "Mensuel",
      icon: Calendar,
      description: "Défi sur un mois",
      color: "bg-blue-100 text-blue-800"
    },
    {
      value: "weekly",
      label: "Hebdomadaire",
      icon: Clock,
      description: "Défi sur une semaine",
      color: "bg-green-100 text-green-800"
    },
    {
      value: "daily",
      label: "Quotidien",
      icon: Target,
      description: "Défi quotidien",
      color: "bg-purple-100 text-purple-800"
    },
    {
      value: "custom",
      label: "Personnalisé",
      icon: Trophy,
      description: "Durée personnalisée",
      color: "bg-orange-100 text-orange-800"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !targetAmount || !duration) return;

    const challengeData = {
      title: title.trim(),
      description: description.trim(),
      type: type as any,
      targetAmount: parseFloat(targetAmount),
      duration: parseInt(duration),
      isActive: true,
      createdBy: user?.id || "",
      createdByName: user?.name || "Utilisateur",
      createdByAvatar: getUserProfilePicture(user),
      rewards: rewards.filter(r => r.trim()),
    };

    try {
      await createChallenge(challengeData);
      handleClose();
    } catch (error) {
      console.error("Error creating challenge:", error);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setType("monthly");
    setTargetAmount("");
    setDuration("");
    setRewards([]);
    setNewReward("");
    setIsPrivate(false);
    onClose();
  };

  const addReward = () => {
    if (newReward.trim() && rewards.length < 5) {
      setRewards(prev => [...prev, newReward.trim()]);
      setNewReward("");
    }
  };

  const removeReward = (index: number) => {
    setRewards(prev => prev.filter((_, i) => i !== index));
  };

  const selectedType = challengeTypes.find(t => t.value === type);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-primary" />
            <span>Créer un nouveau défi</span>
            {selectedType && (
              <Badge className={selectedType.color}>
                <selectedType.icon className="w-3 h-3 mr-1" />
                {selectedType.label}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Challenge Type Selection */}
          <div className="space-y-3">
            <Label>Type de défi</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {challengeTypes.map((challengeType) => (
                <motion.div
                  key={challengeType.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    type="button"
                    onClick={() => setType(challengeType.value)}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      type === challengeType.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <challengeType.icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{challengeType.label}</span>
                    </div>
                    <p className="text-xs text-gray-600 text-left">
                      {challengeType.description}
                    </p>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du défi *</Label>
              <Input
                id="title"
                placeholder="ex: Défi Épargne de Noël"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Montant cible (€) *</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="targetAmount"
                  type="number"
                  placeholder="500"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Décrivez le défi, ses objectifs et les règles..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Décrivez clairement les objectifs et règles</span>
              <span>{description.length}/500</span>
            </div>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Durée *</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="duration"
                  type="number"
                  placeholder="30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="flex-1"
                />
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">jours</SelectItem>
                    <SelectItem value="weekly">semaines</SelectItem>
                    <SelectItem value="monthly">mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Visibilité</Label>
              <Select value={isPrivate ? "private" : "public"} onValueChange={(value) => setIsPrivate(value === "private")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Privé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rewards */}
          <div className="space-y-3">
            <Label>Récompenses (optionnel)</Label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  placeholder="ex: Badge Économiste"
                  value={newReward}
                  onChange={(e) => setNewReward(e.target.value)}
                  maxLength={30}
                />
                <Button
                  type="button"
                  onClick={addReward}
                  disabled={!newReward.trim() || rewards.length >= 5}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {rewards.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {rewards.map((reward, index) => (
                    <Badge key={index} variant="outline" className="flex items-center space-x-1">
                      <Award className="w-3 h-3" />
                      <span>{reward}</span>
                      <button
                        type="button"
                        onClick={() => removeReward(index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500">
                Ajoutez jusqu'à 5 récompenses pour motiver les participants
              </p>
            </div>
          </div>

          {/* Preview */}
          {title && description && targetAmount && duration && (
            <div className="space-y-3">
              <Label>Aperçu</Label>
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2 mb-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{title}</h3>
                  <Badge className={selectedType?.color}>
                    {selectedType?.label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Euro className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{targetAmount}€</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>{duration} {type === 'daily' ? 'jours' : type === 'weekly' ? 'semaines' : 'mois'}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>0 participants</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || !description.trim() || !targetAmount || !duration}
              className="bg-primary hover:bg-primary/90"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Créer le défi
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { ChallengeCreateModal };
export default ChallengeCreateModal;
