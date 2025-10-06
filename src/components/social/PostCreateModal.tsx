import { useState } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Lightbulb,
  HelpCircle,
  PartyPopper,
  TrendingUp,
  Euro
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { usePosts } from "@/lib/apiComponent/hooks/useSocial";
import { useToast } from "@/hooks/use-toast";

interface PostCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

const PostCreateModal = ({ isOpen, onClose, onPostCreated }: PostCreateModalProps) => {
  const { createPost, isLoading: isPosting } = usePosts();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [content, setContent] = useState("");
  const [type, setType] = useState("MOTIVATION");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [goal, setGoal] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const postTypes = [
    {
      value: "SAVINGS_MILESTONE",
      label: "Objectif atteint",
      icon: Target,
      color: "bg-green-100 text-green-800",
      description: "Partagez vos réussites d'épargne",
    },
    {
      value: "MOTIVATION",
      label: "Motivation",
      icon: TrendingUp,
      color: "bg-blue-100 text-blue-800",
      description: "Encouragez la communauté",
    },
    {
      value: "TIP",
      label: "Conseil",
      icon: Lightbulb,
      color: "bg-yellow-100 text-yellow-800",
      description: "Partagez vos astuces",
    },
    {
      value: "QUESTION",
      label: "Question",
      icon: HelpCircle,
      color: "bg-purple-100 text-purple-800",
      description: "Demandez de l'aide",
    },
    {
      value: "CELEBRATION",
      label: "Célébration",
      icon: PartyPopper,
      color: "bg-pink-100 text-pink-800",
      description: "Célébrez vos succès",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    const postData = {
      content: content.trim(),
      type: type as
        | "SAVINGS_MILESTONE"
        | "MOTIVATION"
        | "TIP"
        | "QUESTION"
        | "CELEBRATION",
      ...(title && { title: title.trim() }),
      ...(amount && { amount: parseFloat(amount) }),
      ...(goal && { goal: goal.trim() }),
      ...(images.length > 0 && { images }),
    };

    console.log("📝 Données du post à envoyer:", postData);

    try {
      await createPost(postData);
      console.log("✅ Post créé avec succès, fermeture du modal");
      
      // Afficher un toast de succès
      toast({
        title: "Post publié ! 🎉",
        description: "Votre post a été publié avec succès dans le feed.",
        variant: "default",
      });
      
      // Actualiser le feed
      if (onPostCreated) {
        onPostCreated();
      }
      
      handleClose();
    } catch (error) {
      console.error("❌ Erreur lors de la création du post:", error);
      
      // Afficher un toast d'erreur
      toast({
        title: "Erreur de publication",
        description: "Impossible de publier votre post. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setContent("");
    setType("MOTIVATION");
    setTitle("");
    setAmount("");
    setGoal("");
    setImages([]);
    onClose();
  };

  const selectedType = postTypes.find((t) => t.value === type);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <span>Créer un nouveau post</span>
            {selectedType && (
              <Badge className={selectedType.color}>
                <selectedType.icon className="w-3 h-3 mr-1" />
                {selectedType.label}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Post Type Selection */}
            <div className="space-y-3">
              <Label>Type de post</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {postTypes.map((postType) => (
                  <motion.div
                    key={postType.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      type="button"
                      onClick={() => setType(postType.value)}
                      className={`w-full p-3 rounded-lg border-2 transition-all ${
                        type === postType.value
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <postType.icon className="w-4 h-4" />
                        <span className="font-medium text-sm">
                          {postType.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 text-left">
                        {postType.description}
                      </p>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                placeholder="Ajoutez un titre accrocheur..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Un titre peut rendre votre post plus visible</span>
                <span>{title.length}/100</span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <Label htmlFor="content">Contenu du post</Label>
              <Textarea
                id="content"
                placeholder="Partagez votre expérience avec la communauté..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Utilisez des hashtags pour plus de visibilité</span>
                <span>{content.length}/500</span>
              </div>
            </div>

            {/* Additional Fields based on type */}
            {(type === "SAVINGS_MILESTONE" || type === "CELEBRATION") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant épargné (€)</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal">Objectif</Label>
                  <Input
                    id="goal"
                    placeholder="ex: Vacances d'été"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Image Upload */}
            {/* <div className="space-y-3">
              <Label>Images (optionnel)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Glissez-déposez vos images ici ou cliquez pour sélectionner
                </p>
                <Button type="button" variant="outline" size="sm">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Ajouter des images
                </Button>
              </div>
            </div> */}

            {/* Preview */}
            {content && (
              <div className="space-y-3">
                <Label>Aperçu</Label>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {user?.name || "Utilisateur"}
                      </p>
                      <p className="text-xs text-gray-500">Maintenant</p>
                    </div>
                  </div>
                  {title && (
                    <h4 className="font-bold text-gray-900 text-base mb-2">
                      {title}
                    </h4>
                  )}
                  <p className="text-sm">{content}</p>
                  {amount && (
                    <div className="mt-3 p-2 bg-green-100 rounded text-sm">
                      <span className="font-semibold text-green-800">
                        {amount}€
                      </span>
                      {goal && (
                        <span className="text-green-600"> pour {goal}</span>
                      )}
                    </div>
                  )}
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
                disabled={!content.trim() || isPosting}
                className="bg-primary hover:bg-primary/90"
              >
                {isPosting ? "Publication..." : "Publier"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { PostCreateModal };
export default PostCreateModal;
