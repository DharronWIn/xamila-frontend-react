import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AvatarService } from '../services/avatarService';
import { Avatar, AvatarApiResponse, UpdateUserPictureRequest } from '@/types/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';

export const useAvatars = (category?: string) => {
  return useQuery<AvatarApiResponse>({
    queryKey: ['avatars', category],
    queryFn: () => AvatarService.getAvatars(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAvatarCategories = () => {
  return useQuery<string[]>({
    queryKey: ['avatar-categories'],
    queryFn: () => AvatarService.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAvatar = (id: string) => {
  return useQuery<Avatar>({
    queryKey: ['avatar', id],
    queryFn: () => AvatarService.getAvatarById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateUserPicture = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: userFromStore, setUser: setUserStore } = useAuthStore();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserPictureRequest }) =>
      AvatarService.updateUserPicture(userId, data),
    onSuccess: (response) => {
      console.log('useUpdateUserPicture - Success response:', response);
      console.log('useUpdateUserPicture - Current user from store:', userFromStore);
      
      // Mettre à jour le store d'authentification Zustand
      if (userFromStore) {
        const updatedUser = {
          ...userFromStore,
          pictureProfilUrl: response.pictureProfilUrl,
        };
        console.log('useUpdateUserPicture - Updated user:', updatedUser);
        setUserStore(updatedUser);
      }
      
      // Invalider toutes les requêtes liées à l'utilisateur et aux données
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      
      // Forcer le re-render des composants
      queryClient.refetchQueries({ queryKey: ['user'] });
      queryClient.refetchQueries({ queryKey: ['profile'] });
      
      // Déclencher un événement personnalisé pour forcer la mise à jour
      window.dispatchEvent(new CustomEvent('avatarUpdated', { 
        detail: { pictureProfilUrl: response.pictureProfilUrl } 
      }));
      
      // Forcer le re-render de tous les composants
      window.dispatchEvent(new CustomEvent('forceRerender'));
      
      // Forcer la mise à jour immédiate de tous les composants
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('avatarUpdated', { 
          detail: { pictureProfilUrl: response.pictureProfilUrl } 
        }));
        window.dispatchEvent(new CustomEvent('forceRerender'));
      }, 100);
      
      toast({
        title: "Photo de profil mise à jour",
        description: "Votre photo de profil a été mise à jour avec succès.",
      });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Impossible de mettre à jour la photo de profil.";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteUserPicture = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: userFromStore, setUser: setUserStore } = useAuthStore();

  return useMutation({
    mutationFn: (userId: string) => AvatarService.deleteUserPicture(userId),
    onSuccess: () => {
      // Mettre à jour le store d'authentification Zustand
      if (userFromStore) {
        setUserStore({
          ...userFromStore,
          pictureProfilUrl: undefined,
        });
      }
      
      // Invalider les requêtes liées à l'utilisateur
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      // Déclencher un événement personnalisé pour forcer la mise à jour
      window.dispatchEvent(new CustomEvent('avatarUpdated', { 
        detail: { pictureProfilUrl: undefined } 
      }));
      
      // Forcer le re-render de tous les composants
      window.dispatchEvent(new CustomEvent('forceRerender'));
      
      toast({
        title: "Photo de profil supprimée",
        description: "Votre photo de profil a été supprimée avec succès.",
      });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Impossible de supprimer la photo de profil.";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

export const useUploadCustomPicture = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: userFromStore, setUser: setUserStore } = useAuthStore();

  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      AvatarService.uploadCustomPicture(userId, file),
    onSuccess: (response) => {
      // Mettre à jour le store d'authentification Zustand
      if (userFromStore) {
        setUserStore({
          ...userFromStore,
          pictureProfilUrl: response.pictureProfilUrl,
        });
      }
      
      // Invalider les requêtes liées à l'utilisateur
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      // Déclencher un événement personnalisé pour forcer la mise à jour
      window.dispatchEvent(new CustomEvent('avatarUpdated', { 
        detail: { pictureProfilUrl: response.pictureProfilUrl } 
      }));
      
      // Forcer le re-render de tous les composants
      window.dispatchEvent(new CustomEvent('forceRerender'));
      
      toast({
        title: "Photo personnalisée uploadée",
        description: "Votre photo personnalisée a été uploadée avec succès.",
      });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Impossible d'uploader la photo personnalisée.";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

// Hook personnalisé pour gérer l'état de sélection d'avatar
export const useAvatarSelection = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const selectAvatar = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
  };

  const clearSelection = () => {
    setSelectedAvatar(null);
  };

  return {
    selectedAvatar,
    isUploading,
    selectAvatar,
    clearSelection,
    setIsUploading,
  };
};
