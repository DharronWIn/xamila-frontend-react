import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Lock,
  BookOpen,
  Target, Crown,
  CheckCircle, Play,
  Headphones,
  Video, CreditCard,
  Wallet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorData, setCalculatorData] = useState({
    currency: 'EUR',
    monthlyIncome: 0,
    isVariableIncome: false,
    incomeHistory: [0, 0, 0, 0, 0, 0],
    timeframe: 6, // Durée en mois pour le calcul
    mode: 'free' as 'free' | 'forced',
    bankAccountId: '',
    motivation: ''
  });

  // API hooks (not used with mock data)
  const { 
    isLoading, 
    error
  } = useResources();

  const resourcesData: Resource[] = [
    // Règles de l'épargne (PDF) - GRATUIT
    {
      id: "1",
      title: "Règles du challenge d'epargne",
      description: "Les règles d'or pour réussir votre challenge d'epargne",
      type: "PDF",
      category: "Éducation",
      isPremium: false,
      downloadCount: 1250,
      url: "/documents/regles-epargne.pdf",
      createdAt: "2024-01-15",
      icon: BookOpen
    },
    {
      id: "2",
      title: "Charte de l'epargnant",
      description: "Definition de la charte de l'epargnant",
      type: "PDF",
      category: "Éducation",
      isPremium: false,
      downloadCount: 890,
      url: "/documents/charte-epargne.pdf",
      createdAt: "2024-01-10",
      icon: BookOpen
    },
    {
      id: "3",
      title: "Calculatrice d'objectifs d'épargne",
      description: "Outil interactif pour calculer vos objectifs d'épargne personnalisés",
      type: "TOOL",
      category: "Outils",
      isPremium: false,
      downloadCount: 680,
      url: "/tools/calculatrice-epargne",
      createdAt: "2024-01-08",
      icon: Target
    },
    // Documents d'engagement (PDF à générer) - GRATUIT
    {
      id: "4",
      title: "Document d'engagement personnel",
      description: "Générez votre document d'engagement officiel pour le challenge d'épargne",
      type: "TOOL",
      category: "Documents",
      isPremium: false,
      downloadCount: 450,
      url: "/tools/document-engagement",
      createdAt: "2024-01-05",
      icon: FileText
    },
    // Certificat de réussite (PDF à générer) - PREMIUM
    {
      id: "5",
      title: "Certificat de réussite du challenge",
      description: "Générez votre certificat officiel de réussite du challenge d'épargne",
      type: "TOOL",
      category: "Certificats",
      isPremium: true,
      downloadCount: 320,
      url: "/tools/certificat-reussite",
      createdAt: "2024-01-20",
      icon: Crown
    },
    // Webinaires (playlist audio et vidéo) - PREMIUM
    {
      id: "6",
      title: "Webinaires d'éducation financière",
      description: "Playlist complète de webinaires sur l'épargne et la gestion financière",
      type: "VIDEO",
      category: "Formation",
      isPremium: true,
      downloadCount: 280,
      url: "/videos/webinaires",
      createdAt: "2024-01-18",
      icon: Video,
      mediaItems: [
        {
          id: "w1",
          title: "Introduction à l'épargne intelligente",
          description: "Les bases de l'épargne et comment commencer",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          type: "video",
          duration: "15:30",
          thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
        },
        {
          id: "w2",
          title: "Gestion du budget familial",
          description: "Techniques pour gérer efficacement le budget de votre famille",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          type: "video",
          duration: "22:45",
          thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
        },
        {
          id: "w3",
          title: "Investir ses économies",
          description: "Comment faire fructifier son épargne de manière sûre",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          type: "video",
          duration: "18:20",
          thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
        }
      ]
    },
  ];

  // Use mock data instead of API
  const categories = ["Tous", "Éducation", "Outils", "Documents", "Certificats", "Formation"];
  const resources = resourcesData;

  // Handle search and filtering with local data
  const filteredResources = resources.filter(resource => {
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "Tous" || resource.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });


  // Create categories list with "Tous" option
  const allCategories = ['Tous', ...categories];

  const handleDownload = async (resource: Resource) => {
    if (resource.isPremium && !isPremium) {
      handlePremiumFeatureClick();
      return;
    }

    try {
      // Handle PDF generation tools
      if (resource.type === 'TOOL') {
        if (resource.id === '4') {
          // Document d'engagement
          setShowEngagementModal(true);
          return;
        } else if (resource.id === '5') {
          // Certificat de réussite
          setShowSuccessModal(true);
          return;
        } else if (resource.id === '3') {
          // Calculatrice d'objectifs d'épargne
          setShowCalculator(true);
          return;
        }
      }

      // Handle media items (webinaires, podcasts) - Open playlist
      if (resource.mediaItems && resource.mediaItems.length > 0) {
        setSelectedCatalog(resource);
        return;
      }

      // Handle regular downloads (PDFs)
      const link = document.createElement('a');
      link.href = resource.url || '#';
      link.download = resource.title;
      link.click();
      toast.success(`Téléchargement de "${resource.title}" commencé`);
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

  const closeCalculator = () => {
    setShowCalculator(false);
  };

  const calculateTargetAmount = () => {
    if (calculatorData.isVariableIncome) {
      const validIncomes = calculatorData.incomeHistory.filter(income => income > 0);
      if (validIncomes.length === 0) return 0;
      const average = validIncomes.reduce((sum, income) => sum + income, 0) / validIncomes.length;
      return Math.round(average * 0.1 * calculatorData.timeframe);
    } else {
      return Math.round(calculatorData.monthlyIncome * 0.1 * calculatorData.timeframe);
    }
  };

  // Mock bank accounts - comme dans le formulaire de challenge
  const bankAccounts = [
    { id: '1', name: 'Compte Courant - Crédit Agricole', balance: 2500.50 },
    { id: '2', name: 'Livret A - BNP Paribas', balance: 1200.75 },
    { id: '3', name: 'Compte Épargne - Société Générale', balance: 5000.00 }
  ];

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
          <Button onClick={() => window.location.reload()}>
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
                        Débloquer Premium
                      </>
                    ) : (
                      <>
                        {resource.type === 'TOOL' ? (
                          resource.id === '3' ? (
                            <>
                              <Target className="w-4 h-4 mr-2" />
                              Calculer
                            </>
                          ) : resource.id === '4' ? (
                            <>
                              <FileText className="w-4 h-4 mr-2" />
                              Générer
                            </>
                          ) : resource.id === '5' ? (
                            <>
                              <Crown className="w-4 h-4 mr-2" />
                              Générer
                            </>
                          ) : (
                            <>
                              <Target className="w-4 h-4 mr-2" />
                              Utiliser
                            </>
                          )
                        ) : resource.type === 'VIDEO' || resource.type === 'AUDIO' ? (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Voir la playlist
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </>
                        )}
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

      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Calculatrice d'Objectifs d'Épargne</h2>
                  <p className="text-gray-600">Calculez votre objectif d'épargne personnalisé</p>
                </div>
              </div>
              <Button
                onClick={closeCalculator}
                variant="ghost"
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            {/* Form - Basé sur le formulaire de challenge */}
            <div className="space-y-6">
              {/* Devise et Type de revenus */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Devise</Label>
                  <Select value={calculatorData.currency} onValueChange={(value) => setCalculatorData({...calculatorData, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="USD">Dollar ($)</SelectItem>
                      <SelectItem value="XOF">Franc CFA (XOF)</SelectItem>
                      <SelectItem value="MAD">Dirham (MAD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Type de revenus</Label>
                  <RadioGroup 
                    value={calculatorData.isVariableIncome ? 'variable' : 'fixed'} 
                    onValueChange={(value) => setCalculatorData({...calculatorData, isVariableIncome: value === 'variable'})}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed" id="fixed" />
                      <Label htmlFor="fixed">Revenu fixe</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="variable" id="variable" />
                      <Label htmlFor="variable">Revenus variables</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Revenus */}
              {!calculatorData.isVariableIncome ? (
                <div>
                  <Label htmlFor="monthlyIncome">Revenu mensuel fixe</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    value={calculatorData.monthlyIncome}
                    onChange={(e) => setCalculatorData({...calculatorData, monthlyIncome: parseFloat(e.target.value) || 0})}
                    placeholder="Ex: 2500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Votre objectif sera calculé à 10% de votre revenu sur {calculatorData.timeframe} mois
                  </p>
                </div>
              ) : (
                <div>
                  <Label>Vos revenus des 6 derniers mois</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {calculatorData.incomeHistory.map((income, index) => (
                      <Input
                        key={index}
                        type="number"
                        placeholder={`Mois ${index + 1}`}
                        value={income || ''}
                        onChange={(e) => {
                          const newHistory = [...calculatorData.incomeHistory];
                          newHistory[index] = parseFloat(e.target.value) || 0;
                          setCalculatorData({...calculatorData, incomeHistory: newHistory});
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Nous calculerons la moyenne pour déterminer votre objectif sur {calculatorData.timeframe} mois
                  </p>
                </div>
              )}

              {/* Durée du challenge */}
              <div>
                <Label htmlFor="timeframe">Durée du challenge (mois)</Label>
                <Input
                  id="timeframe"
                  type="number"
                  value={calculatorData.timeframe}
                  onChange={(e) => setCalculatorData({...calculatorData, timeframe: parseInt(e.target.value) || 6})}
                  placeholder="Ex: 6"
                  min="1"
                  max="24"
                />
              </div>

              {/* Mode de participation */}
              <div>
                <Label>Mode de participation</Label>
                <RadioGroup
                  value={calculatorData.mode}
                  onValueChange={(value) => setCalculatorData({ ...calculatorData, mode: value as 'free' | 'forced' })}
                  className="mt-2"
                >
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="free" id="free" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="free" className="flex items-center space-x-2 cursor-pointer">
                        <Wallet className="w-4 h-4" />
                        <span className="font-medium">Mode Libre</span>
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Vous gérez vos versements manuellement sans connexion bancaire
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="forced" id="forced" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="forced" className="flex items-center space-x-2 cursor-pointer">
                        <CreditCard className="w-4 h-4" />
                        <span className="font-medium">Mode Forcé</span>
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Vos versements sont automatiquement prélevés de votre compte bancaire
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {calculatorData.mode === 'forced' && (
                <div>
                  <Label htmlFor="bankAccount">Compte bancaire</Label>
                  <Select
                    value={calculatorData.bankAccountId}
                    onValueChange={(value) => setCalculatorData({ ...calculatorData, bankAccountId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un compte" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{account.name}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {account.balance.toLocaleString()}€
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Aperçu de l'objectif */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Aperçu de votre objectif</h4>
                <p className="text-blue-800">
                  Objectif total : <span className="font-bold">{calculateTargetAmount().toLocaleString()} {calculatorData.currency}</span>
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  Durée du challenge : {calculatorData.timeframe} mois
                </p>
                <p className="text-blue-700 text-sm">
                  Soit environ {Math.round(calculateTargetAmount() / calculatorData.timeframe).toLocaleString()} {calculatorData.currency} par mois
                </p>
              </div>

              {/* Motivation */}
              <div>
                <Label htmlFor="motivation">Motivation (optionnel)</Label>
                <Textarea
                  id="motivation"
                  placeholder="Pourquoi voulez-vous épargner ?"
                  value={calculatorData.motivation}
                  onChange={(e) => setCalculatorData({ ...calculatorData, motivation: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={closeCalculator}
                variant="outline"
                className="flex-1"
              >
                Fermer
              </Button>
              <Button
                onClick={() => {
                  const targetAmount = calculateTargetAmount();
                  if (targetAmount > 0) {
                    toast.success(`Objectif calculé : ${targetAmount.toLocaleString()} ${calculatorData.currency} sur ${calculatorData.timeframe} mois`);
                  } else {
                    toast.warning('Veuillez saisir vos revenus pour calculer l\'objectif');
                  }
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Calculer
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Resources;