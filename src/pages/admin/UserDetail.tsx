import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft, Edit,
    Trash2, XCircle, Loader2, Target,
    TrendingUp, MessageSquare, DollarSign, Eye,
    EyeOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { useAdminUsers } from "@/lib/apiComponent/hooks/useAdmin";
import { UserResponse } from "@/types/admin";
import { toast } from "sonner";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const UserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const {
    getUserById,
    updateUser,
    deleteUser,
    approveUser,
    rejectUser,
    upgradeUserToPremium,
    approveAndUpgradeToPremium,
    toggleUserActive,
    toggleUserVerified,
    regenerateUserAccess,
  } = useAdminUsers();

  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Charger les données de l'utilisateur
  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        const userData = await getUserById(userId);
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error);
        toast.error("Erreur lors du chargement de l'utilisateur");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [userId, getUserById]);

  const handleAction = async (action: string, data?: unknown) => {
    if (!user) return;
    
    try {
      setIsUpdating(true);
      
      switch (action) {
        case 'approve':
          await approveUser(user.id);
          setUser({ ...user, approvalStatus: 'APPROVED' });
          toast.success("Utilisateur approuvé");
          break;
        case 'reject':
          await rejectUser(user.id, { reason: "Rejeté par l'administrateur" });
          setUser({ ...user, approvalStatus: 'REJECTED' });
          toast.success("Utilisateur rejeté");
          break;
        case 'upgrade':
          await upgradeUserToPremium(user.id, { plan: 'PREMIUM' });
          setUser({ ...user, isPremium: true });
          toast.success("Utilisateur promu premium");
          break;
        case 'approveAndUpgrade':
          await approveAndUpgradeToPremium(user.id, { plan: 'PREMIUM' });
          setUser({ ...user, approvalStatus: 'APPROVED', isPremium: true });
          toast.success("Utilisateur approuvé et promu premium");
          break;
        case 'toggleActive':
          await toggleUserActive(user.id);
          setUser({ ...user, isActive: !user.isActive });
          toast.success(`Utilisateur ${user.isActive ? 'désactivé' : 'activé'}`);
          break;
        case 'toggleVerified':
          await toggleUserVerified(user.id);
          setUser({ ...user, isVerified: !user.isVerified });
          toast.success(`Utilisateur ${user.isVerified ? 'dévérifié' : 'vérifié'}`);
          break;
        case 'regenerateAccess':
          await regenerateUserAccess(user.id);
          toast.success("Identifiants régénérés avec succès. Un email a été envoyé à l'utilisateur.");
          break;
        case 'delete':
          await deleteUser(user.id);
          toast.success("Utilisateur supprimé");
          navigate("/admin-dashboard/users");
          break;
      }
    } catch (error) {
      toast.error(`Erreur lors de l'action: ${action}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (user: UserResponse) => {
    // Le statut principal est basé sur isActive
    if (!user.isActive) {
      return <Badge variant="outline" className="text-gray-600 border-gray-600">Inactif</Badge>;
    }
    return <Badge variant="outline" className="text-green-600 border-green-600">Actif</Badge>;
  };

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800">Approuvé</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGenderIcon = (gender?: string) => {
    switch (gender) {
      case "M":
        return "👨";
      case "F":
        return "👩";
      default:
        return "👤";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement de l'utilisateur...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Utilisateur non trouvé</h2>
          <p className="text-muted-foreground mb-4">L'utilisateur demandé n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate("/admin-dashboard/users")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux utilisateurs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin-dashboard/users")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.firstName.charAt(0) + user.lastName.charAt(0)
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">@{user.username || user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusBadge(user)}
                {user.isPremium && <Badge className="bg-purple-100 text-purple-800">Premium</Badge>}
                {user.isAdmin && <Badge className="bg-red-100 text-red-800">Admin</Badge>}
                {getApprovalBadge(user.approvalStatus)}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSensitiveData(!showSensitiveData)}
          >
            {showSensitiveData ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showSensitiveData ? "Masquer" : "Afficher"} données sensibles
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* TODO: Ouvrir modal d'édition */}}
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmer la suppression</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
                </p>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleAction('delete')}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Suppression...
                      </>
                    ) : (
                      "Supprimer"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Objectifs d'épargne</p>
                <p className="text-2xl font-bold">{user._count?.savingsGoals || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Challenges participés</p>
                <p className="text-2xl font-bold">{user._count?.challengeParticipants || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold">{user._count?.transactions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Posts</p>
                <p className="text-2xl font-bold">{user._count?.posts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="personal">Informations personnelles</TabsTrigger>
          <TabsTrigger value="financial">Financier</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="relations">Relations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de base</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nom complet</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-medium">{user.phone || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">WhatsApp</p>
                    <p className="font-medium">{user.whatsapp || "Non renseigné"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Genre</p>
                    <p className="font-medium">{getGenderIcon(user.gender)} {user.gender || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tranche d'âge</p>
                    <p className="font-medium">{user.ageRange || "Non renseigné"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Pays</p>
                    <p className="font-medium">{user.country || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ville</p>
                    <p className="font-medium">{user.city || "Non renseigné"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status & Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Statut et actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Statut d'approbation</span>
                    {getApprovalBadge(user.approvalStatus)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Vérifié</span>
                    <Badge className={user.isVerified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {user.isVerified ? "Oui" : "Non"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Actif</span>
                    <Badge className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {user.isActive ? "Oui" : "Non"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Premium</span>
                    <Badge className={user.isPremium ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}>
                      {user.isPremium ? "Oui" : "Non"}
                    </Badge>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Actions rapides</p>
                    
                    {/* DEBUG: Log des conditions des boutons */}
                    {console.log('🔍 DEBUG UserDetail - État utilisateur:', {
                      id: user.id,
                      approvalStatus: user.approvalStatus,
                      isPremium: user.isPremium,
                      isActive: user.isActive,
                      isVerified: user.isVerified,
                      showApproveButtons: user.approvalStatus === 'PENDING',
                      showUpgradeButton: !user.isPremium,
                      showApproveAndUpgrade: user.approvalStatus === 'PENDING' && !user.isPremium
                    })}
                    
                    <div className="grid grid-cols-2 gap-2">
                      {/* Actions d'approbation - basées sur approvalStatus */}
                      {user.approvalStatus === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAction('approve')}
                            disabled={isUpdating}
                          >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approuver"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction('reject')}
                            disabled={isUpdating}
                          >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Rejeter"}
                          </Button>
                        </>
                      )}
                      
                      {/* Régénérer les identifiants - disponible pour les utilisateurs approuvés */}
                      {user.approvalStatus === "APPROVED" && user.email && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction('regenerateAccess')}
                          disabled={isUpdating}
                        >
                          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Régénérer les identifiants"}
                        </Button>
                      )}
                      
                      {/* Actions premium - disponibles pour tous les utilisateurs non-premium */}
                      {!user.isPremium && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction('upgrade')}
                          disabled={isUpdating}
                        >
                          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Promouvoir Premium"}
                        </Button>
                      )}
                      
                      {/* Action approuver + premium - basée sur approvalStatus et isPremium */}
                      {user.approvalStatus === "PENDING" && !user.isPremium && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction('approveAndUpgrade')}
                          disabled={isUpdating}
                        >
                          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approuver + Premium"}
                        </Button>
                      )}
                      
                      {/* Action activer/désactiver - basée sur isActive */}
                      <Button
                        size="sm"
                        variant={user.isActive ? "destructive" : "outline"}
                        onClick={() => handleAction('toggleActive')}
                        disabled={isUpdating}
                      >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : user.isActive ? "Désactiver" : "Activer"}
                      </Button>
                      
                      {/* Action vérifier/dévérifier email - basée sur isVerified */}
                      <Button
                        size="sm"
                        variant={user.isVerified ? "destructive" : "outline"}
                        onClick={() => handleAction('toggleVerified')}
                        disabled={isUpdating}
                      >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : user.isVerified ? "Dévérifier email" : "Vérifier email"}
                      </Button>
                    </div>
                    
                    {/* Actions supplémentaires */}
                    <div className="pt-2 border-t">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {/* TODO: Ouvrir modal d'édition */}}
                          disabled={isUpdating}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setIsDeleteModalOpen(true)}
                          disabled={isUpdating}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Personal Info Tab */}
        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Professional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informations professionnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Statut professionnel</p>
                  <p className="font-medium">{user.professionalStatus || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Username</p>
                  <p className="font-medium">{user.username || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium">{user.phone || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">WhatsApp</p>
                  <p className="font-medium">{user.whatsapp || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pays</p>
                  <p className="font-medium">{user.country || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ville</p>
                  <p className="font-medium">{user.city || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Genre</p>
                  <p className="font-medium">{getGenderIcon(user.gender)} {user.gender || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tranche d'âge</p>
                  <p className="font-medium">{user.ageRange || "Non renseigné"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Financial Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Profil financier et épargne</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Montant max d'épargne</p>
                    <p className="font-medium">{user.maxSavingsAmount || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Habitude d'épargne</p>
                    <p className="font-medium">{user.savingsHabit || "Non renseigné"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Niveau d'épargne actuel</p>
                    <p className="font-medium">{user.currentSavingsLevel || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Usage de l'épargne</p>
                    <p className="font-medium">{user.savingsUsage || "Non renseigné"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Challenge d'épargne</p>
                  <p className="font-medium">{user.savingsChallenge || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expérience challenge précédent</p>
                  <p className="font-medium">{user.previousChallengeExperience || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Motivation</p>
                  <p className="font-medium">{user.motivation || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mode de challenge</p>
                  <p className="font-medium">{user.challengeMode || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Formule de challenge</p>
                  <p className="font-medium">{user.challengeFormula || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Comptes partenaires</p>
                  <p className="font-medium">{user.partnerAccounts || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Suivi des dépenses</p>
                  <p className="font-medium">{user.expenseTracking || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Intérêts futurs</p>
                  <p className="font-medium">{user.futureInterest || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Préoccupations</p>
                  <p className="font-medium">{user.concerns || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mois de début du challenge</p>
                  <p className="font-medium">{user.challengeStartMonth || "Non renseigné"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Savings Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Objectifs d'épargne ({user.savingsGoals?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {user.savingsGoals && user.savingsGoals.length > 0 ? (
                  <div className="space-y-4">
                    {user.savingsGoals.map((goal) => (
                      <div key={goal.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{goal.title}</h4>
                          <Badge className={goal.isCompleted ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                            {goal.isCompleted ? "Terminé" : "En cours"}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{formatCurrency(goal.currentAmount)}</span>
                            <span>{formatCurrency(goal.targetAmount)}</span>
                          </div>
                          <Progress 
                            value={(goal.currentAmount / goal.targetAmount) * 100} 
                            className="h-2" 
                          />
                          <p className="text-xs text-gray-500">
                            {Math.round((goal.currentAmount / goal.targetAmount) * 100)}% complété
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucun objectif d'épargne</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Transactions récentes ({user.transactions?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {user.transactions && user.transactions.length > 0 ? (
                  <div className="space-y-3">
                    {user.transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between py-2 border-b">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.category}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucune transaction</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Participations */}
            <Card>
              <CardHeader>
                <CardTitle>Participations aux challenges ({user.challengeParticipants?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {user.challengeParticipants && user.challengeParticipants.length > 0 ? (
                  <div className="space-y-4">
                    {user.challengeParticipants.map((participation) => (
                      <div key={participation.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{participation.challenge.title}</h4>
                          <Badge className={
                            participation.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                            participation.status === "COMPLETED" ? "bg-blue-100 text-blue-800" :
                            "bg-red-100 text-red-800"
                          }>
                            {participation.status === "ACTIVE" ? "Actif" :
                             participation.status === "COMPLETED" ? "Terminé" : "Abandonné"}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Montant actuel</span>
                            <span className="font-medium">{formatCurrency(participation.currentAmount)}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Rejoint le {formatDate(participation.joinedAt)}
                          </p>
                          {participation.motivation && (
                            <p className="text-xs text-gray-500">
                              Motivation: {participation.motivation}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucune participation</p>
                )}
              </CardContent>
            </Card>

            {/* Created Challenges */}
            <Card>
              <CardHeader>
                <CardTitle>Challenges créés ({user.challenges?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {user.challenges && user.challenges.length > 0 ? (
                  <div className="space-y-4">
                    {user.challenges.map((challenge) => (
                      <div key={challenge.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{challenge.title}</h4>
                          <Badge className={
                            challenge.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                            challenge.status === "COMPLETED" ? "bg-blue-100 text-blue-800" :
                            challenge.status === "UPCOMING" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }>
                            {challenge.status === "ACTIVE" ? "Actif" :
                             challenge.status === "COMPLETED" ? "Terminé" :
                             challenge.status === "UPCOMING" ? "À venir" : "Annulé"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                        <p className="text-xs text-gray-500">
                          Créé le {formatDate(challenge.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucun challenge créé</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Activité du compte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Date d'inscription</span>
                    <span className="text-sm">{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Dernière mise à jour</span>
                    <span className="text-sm">{formatDate(user.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Dernière connexion</span>
                    <span className="text-sm">{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Jamais'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Email vérifié</span>
                    <span className="text-sm">{user.isVerified ? 'Oui' : 'Non'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Compte actif</span>
                    <span className="text-sm">{user.isActive ? 'Oui' : 'Non'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Statut d'approbation</span>
                    <span className="text-sm">{user.approvalStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Admin</span>
                    <span className="text-sm">{user.isAdmin ? 'Oui' : 'Non'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Premium</span>
                    <span className="text-sm">{user.isPremium ? 'Oui' : 'Non'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Posts récents ({user.posts?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {user.posts && user.posts.length > 0 ? (
                  <div className="space-y-4">
                    {user.posts.slice(0, 5).map((post) => (
                      <div key={post.id} className="border rounded-lg p-4">
                        <p className="text-sm">{post.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(post.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucun post</p>
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications récentes ({user.notifications?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {user.notifications && user.notifications.length > 0 ? (
                  <div className="space-y-3">
                    {user.notifications.slice(0, 5).map((notification) => (
                      <div key={notification.id} className={`border rounded-lg p-3 ${!notification.isRead ? 'bg-blue-50' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <p className="text-xs text-gray-600">{notification.message}</p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucune notification</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Relations Tab */}
        <TabsContent value="relations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscriptions */}
            <Card>
              <CardHeader>
                <CardTitle>Abonnements ({user.subscriptions?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {user.subscriptions && user.subscriptions.length > 0 ? (
                  <div className="space-y-4">
                    {user.subscriptions.map((subscription) => (
                      <div key={subscription.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{subscription.plan}</h4>
                          <Badge className={
                            subscription.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                            subscription.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }>
                            {subscription.status === "ACTIVE" ? "Actif" :
                             subscription.status === "CANCELLED" ? "Annulé" : "Expiré"}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Du {formatDate(subscription.startDate)} au {formatDate(subscription.endDate)}</p>
                          <p>Renouvellement automatique: {subscription.autoRenew ? "Oui" : "Non"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucun abonnement</p>
                )}
              </CardContent>
            </Card>

            {/* Bank Account Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Candidatures comptes bancaires ({user.bankAccountApplications?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {user.bankAccountApplications && user.bankAccountApplications.length > 0 ? (
                  <div className="space-y-4">
                    {user.bankAccountApplications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{application.bankName}</h4>
                          <Badge className={
                            application.status === "APPROVED" ? "bg-green-100 text-green-800" :
                            application.status === "REJECTED" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }>
                            {application.status === "APPROVED" ? "Approuvé" :
                             application.status === "REJECTED" ? "Rejeté" : "En attente"}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Type: {application.accountType}</p>
                          <p>Demandé le {formatDate(application.appliedAt)}</p>
                          {application.notes && (
                            <p>Notes: {application.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucune candidature</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default UserDetail;