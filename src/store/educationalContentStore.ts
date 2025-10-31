// Central store for curated educational content used across resources pages

export type CatalogMediaItem = {
  id: string;
  title: string;
  description?: string;
  url?: string;
  mediaUrl?: string;
  type?: 'audio' | 'video';
  duration?: string;
  thumbnail?: string;
  isPremium?: boolean;
};

export type CatalogResource = {
  id: string;
  title: string;
  description?: string;
  type: 'PDF' | 'VIDEO' | 'TOOL' | 'ARTICLE' | 'AUDIO';
  category?: string;
  isPremium?: boolean;
  url?: string;
  createdAt?: string;
  icon?: unknown;
  mediaItems?: CatalogMediaItem[];
};

// NOTE: Keep the source of truth in one place; this can be swapped to API later.
// To avoid circular imports with pages, we colocate the catalog here.
const catalog: CatalogResource[] = [
  {
    id: '6',
    title: "Webinaires d'éducation financière",
    description: "Playlist complète de webinaires sur l'épargne et la gestion financière",
    type: 'VIDEO',
    category: 'Formation',
    isPremium: true,
    url: '/videos/webinaires',
    createdAt: '2024-01-18',
    mediaItems: [
      {
        id: 'w1',
        title: "Introduction à l'épargne intelligente",
        description: 'Les bases de l\'épargne et comment commencer',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        type: 'video',
        duration: '15:30',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
      },
      {
        id: 'w2',
        title: 'Gestion du budget familial',
        description: 'Techniques pour gérer efficacement le budget de votre famille',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        type: 'video',
        duration: '22:45',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
      },
      {
        id: 'w3',
        title: 'Investir ses économies',
        description: 'Comment faire fructifier son épargne de manière sûre',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        type: 'video',
        duration: '18:20',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
      }
    ]
  },
  {
    id: 'a1',
    title: 'Podcasts financiers',
    description: 'Sélection de podcasts pour améliorer votre culture financière',
    type: 'AUDIO',
    category: 'Formation',
    isPremium: false,
    createdAt: '2024-02-10',
    mediaItems: [
      { id: 'p1', title: 'Épargner sans douleur', description: 'Astuces simples pour épargner au quotidien', url: 'https://example.com/audio1.mp3', type: 'audio', duration: '12:05' },
      { id: 'p2', title: 'Comprendre l\'intérêt composé', description: 'Pourquoi commencer tôt change tout', url: 'https://example.com/audio2.mp3', type: 'audio', duration: '09:42' }
    ]
  },
  {
    id: 'd1',
    title: 'Règles du challenge d\'épargne',
    description: 'Les règles d\'or pour réussir votre challenge d\'épargne',
    type: 'PDF',
    category: 'Documents',
    isPremium: false,
    url: '/documents/regles-epargne.pdf',
    createdAt: '2024-01-15'
  },
  {
    id: 'd2',
    title: "CHARTE DE L'EPARGNANT",
    description: 'Définition de la charte de l\'épargnant',
    type: 'PDF',
    category: 'Documents',
    isPremium: false,
    url: '/documents/charte-epargne/download',
    createdAt: '2024-01-10'
  }
];

export const educationalContentStore = {
  getAll: (): CatalogResource[] => catalog,
  getByType: (type: CatalogResource['type']): CatalogResource[] =>
    catalog.filter((r) => r.type === type),
  getByCategory: (category: string): CatalogResource[] =>
    catalog.filter((r) => (r.category || '').toLowerCase() === category.toLowerCase()),
  // Flattened helpers
  getAllVideos: (): CatalogMediaItem[] => {
    const fromResources = catalog
      .filter((r) => r.type === 'VIDEO')
      .map<CatalogMediaItem>((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        url: r.url,
        type: 'video',
        isPremium: r.isPremium,
      }));

    const fromPlaylists = catalog
      .flatMap((r) => r.mediaItems?.map((m) => ({ ...m, isPremium: r.isPremium })) || []);

    // Ensure unique IDs by prefixing playlist items
    const normalized = fromPlaylists.map((m) => ({ ...m, id: m.id || `media-${Math.random().toString(36).slice(2)}` }));

    return [...normalized, ...fromResources];
  },
  getAllAudios: (): CatalogMediaItem[] => {
    const fromResources = catalog
      .filter((r) => r.type === 'AUDIO')
      .map<CatalogMediaItem>((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        url: r.url,
        type: 'audio',
        isPremium: r.isPremium,
      }));

    const fromPlaylists = catalog
      .flatMap((r) => r.mediaItems?.filter((m) => m.type === 'audio').map((m) => ({ ...m, isPremium: r.isPremium })) || []);

    const normalized = fromPlaylists.map((m) => ({ ...m, id: m.id || `media-${Math.random().toString(36).slice(2)}` }));
    return [...normalized, ...fromResources];
  },
  getAllDocuments: (): CatalogResource[] => {
    return catalog.filter((r) => r.type === 'PDF');
  },
};


