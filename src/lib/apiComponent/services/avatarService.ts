import { api } from '../apiClient';
import { avatarEndpoints } from '../endpoints';
import { Avatar, AvatarApiResponse, UpdateUserPictureRequest, UpdateUserPictureResponse } from '@/types/avatar';

export class AvatarService {
  /**
   * Récupère la liste de tous les avatars disponibles
   */
  static async getAvatars(category?: string): Promise<AvatarApiResponse> {
    const endpoint = category 
      ? avatarEndpoints.avatarsByCategory(category)
      : avatarEndpoints.avatars;
    
    const response = await api.get<AvatarApiResponse>(endpoint);
    return response;
  }

  /**
   * Récupère les catégories disponibles depuis les avatars
   */
  static async getCategories(): Promise<string[]> {
    const response = await this.getAvatars();
    if (response.success && response.data) {
      const categories = [...new Set(response.data.map(avatar => avatar.category))];
      return categories.sort();
    }
    return [];
  }

  /**
   * Récupère un avatar par son ID
   */
  static async getAvatarById(id: string): Promise<Avatar> {
    const response = await api.get<Avatar>(avatarEndpoints.avatarById(id));
    return response;
  }

  /**
   * Met à jour la photo de profil d'un utilisateur
   */
  static async updateUserPicture(
    userId: string,
    data: UpdateUserPictureRequest
  ): Promise<UpdateUserPictureResponse> {
    // Debug: log des données envoyées
    console.log('AvatarService.updateUserPicture - userId:', userId);
    console.log('AvatarService.updateUserPicture - data:', data);
    console.log('AvatarService.updateUserPicture - endpoint:', avatarEndpoints.updateUserPicture(userId));

    // Transformer les données pour correspondre au format attendu par l'API
    const apiData = {
      pictureUrl: data.pictureProfilUrl || data.avatarId
    };

    console.log('AvatarService.updateUserPicture - apiData:', apiData);

    const response = await api.put<{ success: boolean; data: { pictureProfilUrl: string }; message: string[] }, { pictureUrl: string }>(avatarEndpoints.updateUserPicture(userId), apiData);
    
    // Extraire la bonne valeur de la réponse
    const extractedResponse: UpdateUserPictureResponse = {
      success: response.success,
      message: response.message?.[0] || "Photo de profil mise à jour avec succès",
      pictureProfilUrl: response.data?.pictureProfilUrl || ""
    };
    
    console.log('AvatarService.updateUserPicture - extracted response:', extractedResponse);
    return extractedResponse;
  }

  /**
   * Supprime la photo de profil d'un utilisateur
   */
  static async deleteUserPicture(userId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(avatarEndpoints.deleteUserPicture(userId));
    return response;
  }

  /**
   * Upload une image personnalisée comme photo de profil
   */
  static async uploadCustomPicture(
    userId: string, 
    file: File
  ): Promise<UpdateUserPictureResponse> {
    const formData = new FormData();
    formData.append('picture', file);
    
    const response = await api.put<UpdateUserPictureResponse, FormData>(
      avatarEndpoints.updateUserPicture(userId), 
      formData
    );
    return response;
  }
}
