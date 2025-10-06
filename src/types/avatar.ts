export interface Avatar {
  id: string;
  name: string;
  url: string;
  category: string; // Catégorie dynamique retournée par l'API
  isPremium?: boolean;
  createdAt?: string;
}

export interface AvatarApiResponse {
  success: boolean;
  data: Avatar[];
  message: string[];
  errors: string[];
}

export interface AvatarListResponse {
  avatars: Avatar[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateUserPictureRequest {
  avatarId?: string;
  pictureProfilUrl?: string;
}

export interface UpdateUserPictureResponse {
  success: boolean;
  message: string;
  pictureProfilUrl: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  pictureProfilUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  isPremium: boolean;
  createdAt: string;
  lastLoginAt: string;
}
