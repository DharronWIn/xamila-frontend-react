import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    Download,
    Lock,
    BookOpen,
    Target, Crown,
    CheckCircle, Play,
    Headphones,
    Video
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { useResources } from "@/lib/apiComponent/hooks/useResources";
import { usePremiumProtection } from "@/hooks/usePremiumProtection";
import PremiumUpgradeModal from "@/components/premium/PremiumUpgradeModal";
import { DocumentEngagementModal } from "@/components/certificates/DocumentEngagementModal";
import { ChallengeSuccessModal } from "@/components/certificates/ChallengeSuccessModal";
import { MediaPlayer } from "@/components/MediaPlayer";
import { toast } from "sonner";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'PDF' | 'VIDEO' | 'TOOL' | 'ARTICLE' | 'AUDIO';
  category: string;
  isPremium: boolean;
  downloadCount?: number;
  url?: string;
  createdAt?: string;
  icon?: React.ComponentType<{ className?: string }>;
  mediaUrl?: string;
  mediaType?: 'audio' | 'video';
  mediaItems?: MediaItem[];
}

interface MediaItem {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'audio' | 'video';
  duration: string;
  thumbnail?: string;
}

// Helper function to get icon for resource type
const getResourceIcon = (type: string) => {
  switch (type) {
    case 'PDF':
      return FileText;
    case 'VIDEO':
      return Video;
    case 'AUDIO':
      return Headphones;
    case 'TOOL':
      return Target;
    case 'ARTICLE':
      return BookOpen;
    default:
      return FileText;
  }
};

const Resources = () => {
  const { user } = useAuth();
  const {
    isPremium,
    isUpgradeModalOpen,
    handlePremiumFeatureClick,
    closeUpgradeModal
  } = usePremiumProtection();
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEngagementModal, setShowEngagementModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null);
  const [showMediaPlayer, setShowMediaPlayer] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<Resource | null>(null);

  // API hooks
  const { 
    resources, 
    categories, 
    isLoading, 
    error, 
    getResources, 
    getCategories, 
    searchResources,
    downloadResource 
  } = useResources();

  // Load resources and categories on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          getResources(),
          getCategories()
        ]);
      } catch (err) {
        console.error('Failed to load resources:', err);
        toast.error('Erreur lors du chargement des ressources');
      }
    };
    
    loadData();
  }, [getResources, getCategories]);

  // Handle search
  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim()) {
        try {
          await searchResources(searchQuery);
        } catch (err) {
          console.error('Search failed:', err);
        }
      } else {
        try {
          await getResources();
        } catch (err) {
          console.error('Failed to load resources:', err);
        }
      }
    };

    const timeoutId = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchResources, getResources]);

  // Handle category filter
  useEffect(() => {
    const handleCategoryFilter = async () => {
      try {
        if (selectedCategory === 'Tous') {
          await getResources();
        } else {
          await getResources({ category: selectedCategory });
        }
      } catch (err) {
        console.error('Failed to filter resources:', err);
      }
    };

    handleCategoryFilter();
  }, [selectedCategory, getResources]);

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'Tous' || resource.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Create categories list with "Tous" option
  const allCategories = ['Tous', ...categories];

  const handleDownload = async (resource: Resource) => {
    if (resource.isPremium && !isPremium) {
      handlePremiumFeatureClick();
      return;
    }

    try {
      // Handle certificate generation for special resources
      if (resource.title.includes('engagement') || resource.title.includes('Document d\'engagement')) {
        setShowEngagementModal(true);
      } else if (resource.title.includes('certificat') || resource.title.includes('Certificat')) {
        setShowSuccessModal(true);
      } else {
        // Use API for actual download
        await downloadResource(resource.id);
        toast.success(`Téléchargement de "${resource.title}" commencé`);
      }
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handlePlayMedia = (mediaItem: MediaItem) => {
    if (!isPremium) {
      handlePremiumFeatureClick();
      return;
    }
    
    setCurrentMedia(mediaItem);
    setShowMediaPlayer(true);
  };

  const closeMediaPlayer = () => {
    setShowMediaPlayer(false);
    setCurrentMedia(null);
  };

  const openCatalog = (resource: Resource) => {
    if (resource.isPremium && !isPremium) {
      handlePremiumFeatureClick();
      return;
    }
    setSelectedCatalog(resource);
  };

  const closeCatalog = () => {
    setSelectedCatalog(null);
  };

  const getTypeIcon = (type: string) => {
    return getResourceIcon(type);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'PDF':
        return { label: 'PDF', color: 'bg-red-100 text-red-700' };
      case 'VIDEO':
        return { label: 'Vidéo', color: 'bg-blue-100 text-blue-700' };
      case 'AUDIO':
        return { label: 'Audio', color: 'bg-purple-100 text-purple-700' };
      case 'TOOL':
        return { label: 'Outil', color: 'bg-green-100 text-green-700' };
      case 'ARTICLE':
        return { label: 'Article', color: 'bg-purple-100 text-purple-700' };
      default:
        return { label: 'Document', color: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {!selectedCatalog ? (
        <>
          {/* Header */}
          <motion.div variants={fadeInUp}>
            <h1 className="text-3xl font-bold text-gray-900">Ressources</h1>
            <p className="text-gray-600 mt-1">
              Accédez à nos guides, outils et documents pour réussir votre challenge d'épargne
            </p>
          </motion.div>

      {/* Search and Filters */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher une ressource..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {allCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ressources disponibles</p>
                <p className="text-2xl font-bold">{resources.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Accès gratuit</p>
                <p className="text-2xl font-bold">{resources.filter(r => !r.isPremium).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Crown className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Contenu Premium</p>
                <p className="text-2xl font-bold">{resources.filter(r => r.isPremium).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <motion.div variants={fadeInUp} className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des ressources...</p>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div variants={fadeInUp} className="text-center py-12">
          <div className="text-red-500 mb-4">
            <FileText className="w-16 h-16 mx-auto mb-2" />
            <p className="text-lg font-semibold">Erreur de chargement</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={() => getResources()}>
            Réessayer
          </Button>
        </motion.div>
      )}

      {/* Resources Grid */}
      {!isLoading && !error && (
        <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => {
          const TypeIcon = getTypeIcon(resource.type);
          const typeBadge = getTypeBadge(resource.type);
          
          return (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`h-full transition-all duration-300 hover:shadow-lg ${
                resource.isPremium && !isPremium ? 'relative overflow-hidden' : ''
              }`}>
                {resource.isPremium && !isPremium && (
                  <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/10 backdrop-blur-[1px] z-10" />
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {React.createElement(getResourceIcon(resource.type), { className: "w-5 h-5 text-primary" })}
                    </div>
                      <div className="flex-1">
                        <Badge className={`${typeBadge.color} text-xs`}>
                          {typeBadge.label}
                        </Badge>
                      </div>
                    </div>
                    {resource.isPremium && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {resource.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{resource.category}</span>
                    {resource.downloadCount && <span>{resource.downloadCount} téléchargements</span>}
                  </div>
                  
                  <Button 
                    className="w-full"
                    variant={resource.isPremium && !isPremium ? "outline" : "default"}
                    onClick={() => handleDownload(resource)}
                  >
                    {resource.isPremium && !isPremium ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Débloquer
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        {resource.type === 'TOOL' ? 'Utiliser' : 
                         resource.title.includes('engagement') || resource.title.includes('certificat') ? 'Générer' : 'Télécharger'}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
          })}
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredResources.length === 0 && (
        <motion.div variants={fadeInUp} className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune ressource trouvée</h3>
          <p className="text-gray-600">
            Essayez de modifier vos critères de recherche ou sélectionnez une autre catégorie.
          </p>
        </motion.div>
      )}

      {/* Premium Upgrade Section */}
      {!isPremium && (
        <motion.div variants={fadeInUp}>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Débloquez toutes les ressources Premium
              </h3>
              <p className="text-gray-600 mb-4">
                Accédez à des guides exclusifs, documents d'engagement et certificats de participation
              </p>
              <Button onClick={handlePremiumFeatureClick}>
                Passer Premium
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        userEmail={user?.email || ''}
        userId={user?.id || ''}
        title="Débloquez les Ressources Premium"
        description="Accédez à tous les guides exclusifs, documents d'engagement et certificats"
      />

      {/* Certificate Generation Modals */}
      <DocumentEngagementModal
        isOpen={showEngagementModal}
        onClose={() => setShowEngagementModal(false)}
      />
      
      <ChallengeSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />

        </>
      ) : (
        /* Catalog View */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          {/* Catalog Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedCatalog.title}</h2>
              <p className="text-gray-600 mt-1">{selectedCatalog.description}</p>
            </div>
            <Button variant="outline" onClick={closeCatalog}>
              Retour aux ressources
            </Button>
          </div>

          {/* Media Items Playlist */}
          {selectedCatalog.mediaItems && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Playlist - {selectedCatalog.mediaItems.length} éléments</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {selectedCatalog.mediaItems.map((mediaItem, index) => (
                  <motion.div
                    key={mediaItem.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200 group"
                  >
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      {/* Track Number */}
                      <div className="flex-shrink-0 w-8 text-center text-sm text-gray-500 font-medium">
                        {index + 1}
                      </div>
                      
                      {/* Media Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {mediaItem.type === 'audio' ? (
                            <Headphones className="w-5 h-5 text-primary" />
                          ) : (
                            <Video className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </div>
                      
                      {/* Media Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {mediaItem.title}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {mediaItem.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`${
                            mediaItem.type === 'audio' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-blue-100 text-blue-700'
                          } text-xs px-2 py-0.5`}>
                            {mediaItem.type === 'audio' ? 'Audio' : 'Vidéo'}
                          </Badge>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{mediaItem.duration}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Play Button */}
                    <div className="flex-shrink-0 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePlayMedia(mediaItem)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-primary/10"
                      >
                        <Play className="w-4 h-4 text-primary" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Media Player Modal */}
      {showMediaPlayer && currentMedia && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl">
            <MediaPlayer
              src={currentMedia.url}
              type={currentMedia.type}
              title={currentMedia.title}
              thumbnail={currentMedia.thumbnail}
              onClose={closeMediaPlayer}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Resources;