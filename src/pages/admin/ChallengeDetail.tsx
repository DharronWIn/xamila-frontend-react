import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Edit,
    Trash2,
    Users,
    Target,
    TrendingUp, Award, Activity,
    BarChart3,
    PieChart,
    Download, Loader2, XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useAdminChallenges } from "@/lib/apiComponent/hooks/useAdmin";
import { Challenge } from "@/types/admin";
import { toast } from "sonner";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

interface ChallengeDetailData extends Challenge {
  collectiveTarget: number;
  collectiveCurrentAmount: number;
  collectiveProgress: number;
  createdByUser: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  participants: Array<{
    id: string;
    userId: string;
    currentAmount: number;
    status: string;
    mode: string;
    bankAccountId?: string;
    motivation?: string;
    abandonReason?: string;
    abandonCategory?: string;
    joinedAt: string;
    completedAt?: string;
    abandonedAt?: string;
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    goal: {
      id: string;
      targetAmount: number;
      currentAmount: number;
      progress: number;
      isAchieved: boolean;
      achievedAt?: string;
      currency: string;
      monthlyIncome: number;
      isVariableIncome: boolean;
      incomeHistory: number[];
      additionalNotes?: string;
    };
  }>;
  transactions: Array<{
    id: string;
    participantId: string;
    userId: string;
    amount: number;
    type: string;
    description: string;
    date: string;
    createdAt: string;
  }>;
  _count: {
    participants: number;
    transactions: number;
  };
}

const ChallengeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getChallengeById,
    updateChallenge,
    deleteChallenge,
    getChallengeStats,
    getChallengeParticipants,
    getChallengeTransactions,
    getChallengeLeaderboard,
    getChallengeProgress
  } = useAdminChallenges();

  const [challenge, setChallenge] = useState<ChallengeDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Charger les données du challenge
  useEffect(() => {
    const loadChallengeData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const [challengeData, participants, transactions, leaderboard, progress] = await Promise.all([
          getChallengeById(id),
          getChallengeParticipants(id),
          getChallengeTransactions(id),
          getChallengeLeaderboard(id),
          getChallengeProgress(id)
        ]);

        if (challengeData) {
          // Debug: Log des structures de données
          console.log("Challenge data:", challengeData);
          console.log("Participants:", participants);
          console.log("Transactions:", transactions);
          
          // S'assurer que participants est un tableau
          const participantsArray = Array.isArray(participants) ? participants : [];
          const transactionsArray = Array.isArray(transactions) ? transactions : [];
          
          console.log("Participants array:", participantsArray);
          console.log("Transactions array:", transactionsArray);
          
          // Calculer les montants collectés
          const collectiveCurrentAmount = participantsArray.reduce((sum, p) => {
            return sum + (p.currentAmount || 0);
          }, 0);
          
          const collectiveProgress = challengeData.targetAmount ? 
            Math.round((collectiveCurrentAmount / challengeData.targetAmount) * 100) : 0;

          // Créer l'objet challenge avec des valeurs par défaut
          const challengeDetailData: ChallengeDetailData = {
            ...challengeData,
            participants: participantsArray,
            transactions: transactionsArray,
            collectiveTarget: challengeData.targetAmount || 0,
            collectiveCurrentAmount,
            collectiveProgress,
            createdByUser: challengeData.createdByUser || {
              id: challengeData.createdBy || '',
              username: 'Utilisateur inconnu',
              firstName: 'Utilisateur',
              lastName: 'Inconnu'
            },
            _count: {
              participants: participantsArray.length,
              transactions: transactionsArray.length
            }
          };

          setChallenge(challengeDetailData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du challenge:", error);
        toast.error("Erreur lors du chargement du challenge");
      } finally {
        setIsLoading(false);
      }
    };

    loadChallengeData();
  }, [id, getChallengeById, getChallengeParticipants, getChallengeTransactions, getChallengeLeaderboard, getChallengeProgress]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!challenge) return;
    
    try {
      setIsUpdating(true);
      await updateChallenge(challenge.id, { status: newStatus as any });
      setChallenge({ ...challenge, status: newStatus as any });
      toast.success("Statut du challenge mis à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteChallenge = async () => {
    if (!challenge) return;
    
    try {
      setIsDeleting(true);
      await deleteChallenge(challenge.id);
      toast.success("Challenge supprimé avec succès");
      navigate("/admin-dashboard/challenges");
    } catch (error) {
      toast.error("Erreur lors de la suppression du challenge");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return <Badge className="bg-blue-100 text-blue-800">À venir</Badge>;
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case "COMPLETED":
        return <Badge className="bg-gray-100 text-gray-800">Terminé</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement du challenge...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Challenge non trouvé</h2>
          <p className="text-muted-foreground mb-4">Le challenge demandé n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate("/admin-dashboard/challenges")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux challenges
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
            onClick={() => navigate("/admin-dashboard/challenges")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{challenge.title}</h1>
            <p className="text-gray-600 mt-1">{challenge.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(challenge.status)}
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
                  Êtes-vous sûr de vouloir supprimer ce challenge ? Cette action est irréversible.
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
                    onClick={handleDeleteChallenge}
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
                <p className="text-sm text-gray-600">Objectif collectif</p>
                <p className="text-2xl font-bold">{formatCurrency(challenge.collectiveTarget)}</p>
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
                <p className="text-sm text-gray-600">Montant collecté</p>
                <p className="text-2xl font-bold">{formatCurrency(challenge.collectiveCurrentAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Participants</p>
                <p className="text-2xl font-bold">{challenge._count.participants}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Progression</p>
                <p className="text-2xl font-bold">{challenge.collectiveProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Progression collective</h3>
              <span className="text-sm text-gray-600">
                {formatCurrency(challenge.collectiveCurrentAmount)} / {formatCurrency(challenge.collectiveTarget)}
              </span>
            </div>
            <Progress value={Math.min(challenge.collectiveProgress, 100)} className="h-3" />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>0%</span>
              <span className="font-medium">{challenge.collectiveProgress}%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Challenge Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informations du challenge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Statut</p>
                    <div className="mt-1">{getStatusBadge(challenge.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Créé par</p>
                    <p className="font-medium">{challenge.createdByUser.firstName} {challenge.createdByUser.lastName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date de début</p>
                    <p className="font-medium">{formatDate(challenge.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date de fin</p>
                    <p className="font-medium">{formatDate(challenge.endDate)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Récompenses</p>
                  <div className="mt-2 space-y-1">
                    {challenge.rewards.map((reward, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">{reward}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Changer le statut</p>
                  <div className="flex space-x-2">
                    {challenge.status !== "UPCOMING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus("UPCOMING")}
                        disabled={isUpdating}
                      >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "À venir"}
                      </Button>
                    )}
                    {challenge.status !== "ACTIVE" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus("ACTIVE")}
                        disabled={isUpdating}
                      >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Activer"}
                      </Button>
                    )}
                    {challenge.status !== "COMPLETED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus("COMPLETED")}
                        disabled={isUpdating}
                      >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Terminer"}
                      </Button>
                    )}
                    {challenge.status !== "CANCELLED" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUpdateStatus("CANCELLED")}
                        disabled={isUpdating}
                      >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Annuler"}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter les données
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle>Participants ({challenge._count.participants})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Objectif</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Rejoint le</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {challenge.participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{participant.user.firstName} {participant.user.lastName}</p>
                            <p className="text-sm text-gray-500">@{participant.user.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(participant.goal.targetAmount)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{formatCurrency(participant.currentAmount)}</span>
                            <span>{participant.goal.progress}%</span>
                          </div>
                          <Progress value={participant.goal.progress} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          participant.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                          participant.status === "COMPLETED" ? "bg-blue-100 text-blue-800" :
                          "bg-red-100 text-red-800"
                        }>
                          {participant.status === "ACTIVE" ? "Actif" :
                           participant.status === "COMPLETED" ? "Terminé" : "Abandonné"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(participant.joinedAt)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Activity className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transactions ({challenge._count.transactions})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {challenge.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">Participant {transaction.userId.slice(-4)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.type}</Badge>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progression dans le temps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                    <p>Graphique de progression</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition des participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 mx-auto mb-2" />
                    <p>Graphique de répartition</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default ChallengeDetail;
