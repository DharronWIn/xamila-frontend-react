import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Check, Crown, Camera, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/ui/UserAvatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAvatars,
  useUpdateUserPicture,
  useDeleteUserPicture,
  useUploadCustomPicture,
  useAvatarSelection,
} from "@/lib/apiComponent/hooks/useAvatar";
import { useAuthStore } from "@/stores/authStore";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { useGlobalAvatarSync } from "@/hooks/useGlobalAvatarSync";
import { useEffect } from "react";
import { getUserProfilePicture } from "@/lib/utils";
import { Avatar as AvatarType } from "@/types/avatar";
import { User } from "@/lib/apiComponent/types";

interface AvatarManagerProps {
  isOpen: boolean;
  onClose: () => void;
}


const AvatarManager = ({ isOpen, onClose }: AvatarManagerProps) => {
  const { user: userFromStore, setUser } = useAuthStore();
  const { user: userFromAuth } = useAuth();
  const { user: globalUser, syncKey } = useGlobalAvatarSync();
  const user = globalUser || userFromAuth || userFromStore; // Priorité à useGlobalAvatarSync
  
  // Générer un ID utilisateur unique si nécessaire
  const getUserId = () => {
    if (user?.id && user.id !== '1') {
      return user.id;
    }
    // Générer un ID basé sur l'email ou utiliser un ID par défaut
    if (user?.email) {
      return user.email.split('@')[0] + '_' + Date.now().toString(36);
    }
    return 'user_' + Date.now().toString(36);
  };
  
  const [uploadMode, setUploadMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    selectedAvatar,
    selectAvatar,
    clearSelection,
    isUploading,
    setIsUploading,
  } = useAvatarSelection();

  const { data: avatarsData, isLoading: avatarsLoading } = useAvatars();

  const updatePictureMutation = useUpdateUserPicture();
  const deletePictureMutation = useDeleteUserPicture();
  const uploadCustomMutation = useUploadCustomPicture();

  // Données de fallback si l'API n'est pas disponible
  const fallbackAvatars = [
    {
      id: "male_001",
      name: "Homme Professionnel",
      url: "https://avatar.iran.liara.run/public/32",
      category: "male",
      isPremium: false,
    },
    {
      id: "male_002",
      name: "Homme Jeune",
      url: "https://avatar.iran.liara.run/public/14",
      category: "male",
      isPremium: false,
    },
    {
      id: "male_003",
      name: "Homme Souriant",
      url: "https://avatar.iran.liara.run/public/19",
      category: "male",
      isPremium: false,
    },
    {
      id: "female_001",
      name: "Femme Professionnelle",
      url: "https://avatar.iran.liara.run/public/76",
      category: "female",
      isPremium: false,
    },
    {
      id: "female_002",
      name: "Femme Jeune",
      url: "https://avatar.iran.liara.run/public/85",
      category: "female",
      isPremium: false,
    },
    {
      id: "female_003",
      name: "Femme Souriante",
      url: "https://avatar.iran.liara.run/public/94",
      category: "female",
      isPremium: false,
    },
    {
      id: "neutral_001",
      name: "Avatar Neutre 1",
      url: "https://avatar.iran.liara.run/public/job/astronomer/female",
      category: "neutral",
      isPremium: false,
    },
    {
      id: "neutral_002",
      name: "Avatar Neutre 2",
      url: "https://avatar.iran.liara.run/public/job/firefighters/female",
      category: "neutral",
      isPremium: false,
    },
    {
      id: "job_001",
      name: "Fermier",
      url: "https://avatar.iran.liara.run/public/job/farmer/female",
      category: "job",
      isPremium: true,
    },
    {
      id: "job_002",
      name: "Policier",
      url: "https://avatar.iran.liara.run/public/job/police/male",
      category: "job",
      isPremium: true,
    },
    {
      id: "job_003",
      name: "Professeur",
      url: "https://avatar.iran.liara.run/public/job/teacher/male",
      category: "job",
      isPremium: true,
    },
    {
      id: "job_004",
      name: "Astronome",
      url: "https://avatar.iran.liara.run/public/job/astronomer/male",
      category: "job",
      isPremium: true,
    },
  ];

  const avatars = avatarsData?.data || fallbackAvatars;

  const handleAvatarSelect = (avatar: AvatarType) => {
    selectAvatar(avatar);
  };

  const handleApplyAvatar = async () => {
    if (!selectedAvatar || !user) return;

    const userId = getUserId();
    console.log('AvatarManager - User ID:', userId);
    console.log('AvatarManager - Selected Avatar:', selectedAvatar);

    try {
      await updatePictureMutation.mutateAsync({
        userId: userId,
        data: { 
          pictureProfilUrl: selectedAvatar.url
        },
      });
      
      onClose();
    } catch (error) {
      console.error("Error applying avatar:", error);
    }
  };

  const handleDeletePicture = async () => {
    if (!user) return;

    const userId = getUserId();
    try {
      await deletePictureMutation.mutateAsync(userId);
      onClose();
    } catch (error) {
      console.error("Error deleting picture:", error);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Le fichier est trop volumineux. Taille maximale : 5MB");
      return;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner un fichier image");
      return;
    }

    try {
      setIsUploading(true);
      const userId = getUserId();
      await uploadCustomMutation.mutateAsync({
        userId: userId,
        file,
      });
      onClose();
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const currentPictureUrl = getUserProfilePicture(user as User);

  // Forcer la mise à jour des composants après la mutation
  useEffect(() => {
    if (updatePictureMutation.isSuccess) {
      // Déclencher un événement personnalisé pour notifier les composants
      window.dispatchEvent(new CustomEvent('avatarUpdated', { 
        detail: { pictureProfilUrl: selectedAvatar?.url } 
      }));
    }
  }, [updatePictureMutation.isSuccess, selectedAvatar?.url]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Gérer ma photo de profil
          </DialogTitle>
          <DialogDescription>
            Choisissez un avatar dans la galerie ou uploadez votre propre photo
            de profil.
            {!avatarsData && (
              <span className="block mt-2 text-amber-600 text-sm">
                ℹ️ Mode démonstration - Données d'exemple affichées
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Photo actuelle */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <UserAvatar user={user} size="xl" className="w-16 h-16" />
            <div className="flex-1">
              <h3 className="font-semibold">Photo actuelle</h3>
              <p className="text-sm text-gray-600">
                {currentPictureUrl ? "Photo personnalisée" : "Aucune photo"}
              </p>
            </div>
            {currentPictureUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeletePicture}
                disabled={deletePictureMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            )}
          </div>

          <Tabs defaultValue="gallery" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="gallery">Galerie d'avatars</TabsTrigger>
              <TabsTrigger value="upload">Photo personnalisée</TabsTrigger>
            </TabsList>

            <TabsContent
              value="gallery"
              className="flex-1 flex flex-col space-y-4"
            >
              {/* Grille d'avatars */}
              <div className="flex-1 overflow-y-auto">
                {avatarsLoading ? (
                  <div className="grid grid-cols-8 gap-3">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-gray-200 rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-8 gap-3">
                    {avatars.map((avatar) => (
                      <motion.div
                        key={avatar.id}
                        className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          selectedAvatar?.id === avatar.id
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleAvatarSelect(avatar)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img
                          src={avatar.url}
                          alt={avatar.name}
                          className="w-full h-full object-cover"
                        />
                        {avatar.isPremium && (
                          <div className="absolute top-1 right-1">
                            <Crown className="w-3 h-3 text-yellow-500" />
                          </div>
                        )}
                        {selectedAvatar?.id === avatar.id && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent
              value="upload"
              className="flex-1 flex flex-col space-y-4"
            >
              <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center flex flex-col justify-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Uploader une photo personnalisée
                </h3>
                <p className="text-gray-600 mb-4">
                  Formats acceptés : JPG, PNG, GIF (max 5MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || uploadCustomMutation.isPending}
                >
                  {isUploading || uploadCustomMutation.isPending
                    ? "Upload..."
                    : "Sélectionner un fichier"}
                </Button>
              </div>

              {/* Actions pour l'upload */}
              <div className="flex justify-between pt-4 border-t flex-shrink-0">
                <Button variant="outline" onClick={clearSelection}>
                  Annuler
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || uploadCustomMutation.isPending}
                >
                  {isUploading || uploadCustomMutation.isPending
                    ? "Upload..."
                    : "Sélectionner un fichier"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

         
        </div>
         {/* Actions - Toujours visibles */}
         <div className="flex justify-between pt-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={clearSelection}>
              Annuler
            </Button>
            <Button
              onClick={handleApplyAvatar}
              disabled={!selectedAvatar || updatePictureMutation.isPending}
            >
              {updatePictureMutation.isPending ? "Application..." : "Appliquer"}
            </Button>
          </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarManager;
