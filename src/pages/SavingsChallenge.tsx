import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Target,
    TrendingUp,
    TrendingDown,
    Calendar,
    DollarSign, Trophy,
    Plus,
    Crown,
    CheckCircle,
    Medal, Zap,
    BarChart3,
    Star,
    Edit,
    RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { usePremiumProtection } from "@/hooks/usePremiumProtection";
import PremiumUpgradeModal from "@/components/premium/PremiumUpgradeModal";
import { toast } from "sonner";
import { useSavingsStore, SavingsGoal } from "@/stores/savingsStore";

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

interface GoalFormData {
  currency: string;
  monthlyIncome: number;
  isVariableIncome: boolean;
  incomeHistory: number[];
  startDate: string;
  endDate: string;
}

const SavingsChallenge = () => {
  const { user } = useAuth();
  const { 
    goal, 
    transactions, 
    leaderboard, 
    isLoading,
    createGoal, 
    addTransaction, 
    updateGoal,
    fetchLeaderboard,
    calculateMonthlyTarget
  } = useSavingsStore();
  
  const {
    isPremium,
    isUpgradeModalOpen,
    handlePremiumFeatureClick,
    closeUpgradeModal
  } = usePremiumProtection();
  
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  useEffect(() => {
    if (isPremium) {
      fetchLeaderboard();
    }
  }, [isPremium, fetchLeaderboard]);

  const handleCreateGoal = (formData: GoalFormData) => {
    if (!isPremium) {
      handlePremiumFeatureClick();
      return;
    }

    const income = formData.isVariableIncome ? formData.incomeHistory : [formData.monthlyIncome];
    const monthlyTarget = calculateMonthlyTarget(formData.isVariableIncome ? formData.incomeHistory : formData.monthlyIncome);
    const targetAmount = monthlyTarget * 6; // 6 months challenge

    if (goal) {
      // Update existing goal
      updateGoal(goal.id, {
        targetAmount,
        currency: formData.currency,
        monthlyIncome: formData.monthlyIncome,
        isVariableIncome: formData.isVariableIncome,
        incomeHistory: formData.incomeHistory,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
      toast.success('Objectif d\'épargne mis à jour avec succès !');
    } else {
      // Create new goal
      createGoal({
        userId: user?.id || '',
        targetAmount,
        currency: formData.currency,
        monthlyIncome: formData.monthlyIncome,
        isVariableIncome: formData.isVariableIncome,
        incomeHistory: formData.incomeHistory,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
      toast.success('Objectif d\'épargne créé avec succès !');
    }

    setIsGoalModalOpen(false);
  };

  const handleAddTransaction = (formData: { amount: number; description: string; date: string; type: 'deposit' | 'withdrawal' }) => {
    if (!isPremium) {
      handlePremiumFeatureClick();
      return;
    }

    addTransaction({
      userId: user?.id || '',
      ...formData,
    });

    setIsTransactionModalOpen(false);
    toast.success('Transaction enregistrée avec succès !');
  };

  const progressPercentage = goal ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const remainingAmount = goal ? goal.targetAmount - goal.currentAmount : 0;
  const monthlyTarget = goal ? goal.targetAmount / 6 : 0;

  // Calculate days remaining
  const today = new Date();
  const endDate = goal ? new Date(goal.endDate) : new Date();
  const daysRemaining = goal ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24)) : 180;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Challenge d'Épargne</h1>
          <p className="text-gray-600 mt-1">
            Atteignez vos objectifs d'épargne sur 6 mois avec notre programme personnalisé
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge 
            variant={isPremium ? "default" : "secondary"} 
            className={`px-3 py-1 ${isPremium ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' : ''}`}
          >
            {isPremium ? (
              <>
                <Crown className="w-4 h-4 mr-1" />
          Premium
              </>
            ) : 'Fonctionnalité Premium'}
        </Badge>
        </div>
      </motion.div>

      {/* Main Content */}
      {!isPremium ? (
        <motion.div variants={fadeInUp}>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-12 text-center">
              <Crown className="w-20 h-20 text-primary mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Challenge d'Épargne Premium
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Débloquez le challenge d'épargne personnalisé avec fixation d'objectifs, 
                suivi de progression, classement global et certificat de participation.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <Target className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Objectifs personnalisés</h3>
                  <p className="text-sm text-gray-600">Calcul automatique basé sur vos revenus</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <Trophy className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Classement global</h3>
                  <p className="text-sm text-gray-600">Comparez votre progression avec les autres participants</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <Medal className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Certificat de réussite</h3>
                  <p className="text-sm text-gray-600">Recevez votre certificat de participation</p>
                </div>
      </div>

              <Button 
                size="lg"
                onClick={handlePremiumFeatureClick}
                className="px-8"
              >
                Démarrer le Challenge Premium
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Goal Setup or Display */}
          <motion.div variants={fadeInUp}>
            {!goal ? (
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-8 text-center">
                  <Target className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-blue-900 mb-2">
                    Configurez votre objectif d'épargne
                  </h2>
                  <p className="text-blue-800 mb-6">
                    Commençons par définir votre objectif personnalisé basé sur vos revenus
                  </p>
                  <Dialog open={isGoalModalOpen} onOpenChange={setIsGoalModalOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                        <Target className="w-4 h-4 mr-2" />
                        Définir mon objectif
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>
                          {goal ? 'Modifier votre objectif d\'épargne' : 'Configuration de votre objectif d\'épargne'}
                        </DialogTitle>
                      </DialogHeader>
                      <GoalForm onSubmit={handleCreateGoal} existingGoal={goal} />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <Card>
        <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-primary" />
                      <span>Mon Objectif d'Épargne</span>
          </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setIsGoalModalOpen(true)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                  </div>
        </CardHeader>
        <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{goal.targetAmount.toLocaleString()} {goal.currency}</div>
                      <p className="text-sm text-gray-600">Objectif total</p>
                    </div>
            <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{monthlyTarget.toLocaleString()} {goal.currency}</div>
                      <p className="text-sm text-gray-600">Par mois</p>
            </div>
            <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{goal.currentAmount.toLocaleString()} {goal.currency}</div>
                      <p className="text-sm text-gray-600">Épargné</p>
            </div>
            <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{daysRemaining}</div>
                      <p className="text-sm text-gray-600">Jours restants</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression du challenge</span>
                      <span className="font-medium">
                        {goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()} {goal.currency}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                    <div className="text-center">
                      <span className="text-2xl font-bold text-primary">
                        {progressPercentage.toFixed(1)}%
                      </span>
                      <p className="text-sm text-gray-600">de l'objectif atteint</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {goal && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Savings Dashboard */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Stats */}
                <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total épargné</p>
                          <p className="text-xl font-bold text-green-600">{goal.currentAmount.toLocaleString()} {goal.currency}</p>
            </div>
          </div>
        </CardContent>
      </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Target className="w-5 h-5 text-blue-600" />
                </div>
                        <div>
                          <p className="text-sm text-gray-600">Restant à épargner</p>
                          <p className="text-xl font-bold text-blue-600">{remainingAmount.toLocaleString()} {goal.currency}</p>
                </div>
              </div>
            </CardContent>
          </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <BarChart3 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Transactions</p>
                          <p className="text-xl font-bold text-purple-600">{transactions.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Transactions History */}
                <motion.div variants={fadeInUp}>
                  <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <Calendar className="w-5 h-5 text-primary" />
                          <span>Historique des versements</span>
                </CardTitle>
                        <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
                  <DialogTrigger asChild>
                            <Button>
                              <Plus className="w-4 h-4 mr-2" />
                              Nouveau versement
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                              <DialogTitle>Enregistrer un versement</DialogTitle>
                    </DialogHeader>
                            <TransactionForm onSubmit={handleAddTransaction} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
                      {transactions.length === 0 ? (
                        <div className="text-center py-8">
                          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="font-semibold text-gray-900 mb-2">Aucun versement</h3>
                          <p className="text-gray-600 mb-4">
                            Commencez à enregistrer vos versements d'épargne
                          </p>
                          <Button onClick={() => setIsTransactionModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Premier versement
                          </Button>
                        </div>
                      ) : (
              <div className="space-y-3">
                          {transactions.map((transaction, index) => (
                  <motion.div
                              key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full ${
                                  transaction.type === 'deposit' 
                                    ? 'bg-green-100 text-green-600' 
                                    : 'bg-red-100 text-red-600'
                                }`}>
                                  {transaction.type === 'deposit' ? (
                                    <TrendingUp className="w-4 h-4" />
                                  ) : (
                                    <TrendingDown className="w-4 h-4" />
                                  )}
                      </div>
                      <div>
                                  <p className="font-medium">{transaction.description}</p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(transaction.date).toLocaleDateString('fr-FR')}
                                  </p>
                      </div>
                    </div>
                              <div className={`font-semibold ${
                                transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount.toLocaleString()} {goal.currency}
                    </div>
                  </motion.div>
                ))}
              </div>
                      )}
            </CardContent>
          </Card>
                </motion.div>
        </div>

              {/* Leaderboard and Stats */}
        <div className="space-y-6">
                {/* Personal Rank */}
                <motion.div variants={fadeInUp}>
                  <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Medal className="w-5 h-5 text-yellow-600" />
                        <span>Mon classement</span>
              </CardTitle>
            </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-600 mb-2">
                          #{leaderboard.find(p => p.userId === user?.id)?.rank || 'N/A'}
                        </div>
                        <p className="text-sm text-yellow-800">
                          Sur {leaderboard.length} participants
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Global Leaderboard */}
                <motion.div variants={fadeInUp}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <Trophy className="w-5 h-5 text-primary" />
                          <span>Classement global</span>
                        </CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => fetchLeaderboard()}
                          disabled={isLoading}
                        >
                          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                    </CardHeader>
            <CardContent>
              <div className="space-y-3">
                        {leaderboard.slice(0, 10).map((participant, index) => (
                  <motion.div
                            key={participant.userId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center space-x-3 p-3 rounded-lg ${
                              participant.userId === user?.id 
                                ? 'bg-primary/10 border-2 border-primary/30' 
                                : 'bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              participant.rank <= 3 
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' 
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {participant.rank}
                    </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {participant.userId === user?.id ? 'Vous' : participant.userName}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>{participant.totalSaved.toLocaleString()}€</span>
                        <span>/</span>
                                <span>{participant.goalAmount.toLocaleString()}€</span>
                                <span>({participant.progressPercentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                            {participant.rank <= 3 && (
                              <div className="flex items-center">
                                {participant.rank === 1 && <Trophy className="w-4 h-4 text-yellow-500" />}
                                {participant.rank === 2 && <Medal className="w-4 h-4 text-gray-400" />}
                                {participant.rank === 3 && <Medal className="w-4 h-4 text-amber-600" />}
                              </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
                </motion.div>

                {/* Motivation Card */}
                <motion.div variants={fadeInUp}>
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
                      <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-green-900 mb-2">
                        Continuez sur cette lancée !
                      </h3>
                      <p className="text-green-800 text-sm mb-3">
                        Vous êtes à {(100 - progressPercentage).toFixed(1)}% de votre objectif
                      </p>
                      <div className="flex justify-center">
                        <Badge className="bg-green-600 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          En bonne voie
                        </Badge>
                      </div>
            </CardContent>
          </Card>
                </motion.div>
        </div>
      </div>
          )}
        </>
      )}

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        userEmail={user?.email || ''}
        userId={user?.id || ''}
        title="Débloquez le Challenge d'Épargne Premium"
        description="Accédez à toutes les fonctionnalités avancées du challenge d'épargne"
      />
    </motion.div>
  );
};

// Goal Configuration Form
interface GoalFormProps {
  onSubmit: (data: GoalFormData) => void;
  existingGoal?: SavingsGoal | null;
}

function GoalForm({ onSubmit, existingGoal }: GoalFormProps) {
  const [formData, setFormData] = useState<GoalFormData>({
    currency: existingGoal?.currency || 'EUR',
    monthlyIncome: existingGoal?.monthlyIncome || 0,
    isVariableIncome: existingGoal?.isVariableIncome || false,
    incomeHistory: existingGoal?.incomeHistory || [0, 0, 0, 0, 0, 0],
    startDate: existingGoal?.startDate || new Date().toISOString().split('T')[0],
    endDate: existingGoal?.endDate || new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const calculatePreviewTarget = () => {
    if (formData.isVariableIncome) {
      const validIncomes = formData.incomeHistory.filter(income => income > 0);
      if (validIncomes.length === 0) return 0;
      const average = validIncomes.reduce((sum, income) => sum + income, 0) / validIncomes.length;
      return Math.round(average * 0.1 * 6);
    } else {
      return Math.round(formData.monthlyIncome * 0.1 * 6);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currency">Devise</Label>
        <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
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
            value={formData.isVariableIncome ? 'variable' : 'fixed'} 
            onValueChange={(value) => setFormData({...formData, isVariableIncome: value === 'variable'})}
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

      {!formData.isVariableIncome ? (
        <div>
          <Label htmlFor="monthlyIncome">Revenu mensuel fixe</Label>
          <Input
            id="monthlyIncome"
            type="number"
            value={formData.monthlyIncome}
            onChange={(e) => setFormData({...formData, monthlyIncome: parseFloat(e.target.value) || 0})}
            placeholder="Ex: 2500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Votre objectif sera calculé à 10% de votre revenu sur 6 mois
          </p>
        </div>
      ) : (
        <div>
          <Label>Vos revenus des 6 derniers mois</Label>
          <div className="grid grid-cols-2 gap-2">
            {formData.incomeHistory.map((income, index) => (
              <Input
                key={index}
                type="number"
                placeholder={`Mois ${index + 1}`}
                value={income || ''}
                onChange={(e) => {
                  const newHistory = [...formData.incomeHistory];
                  newHistory[index] = parseFloat(e.target.value) || 0;
                  setFormData({...formData, incomeHistory: newHistory});
                }}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Nous calculerons la moyenne pour déterminer votre objectif
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Date de début</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">Date de fin</Label>
        <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
            required
          />
        </div>
      </div>

      {/* Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Aperçu de votre objectif</h3>
        <p className="text-blue-800">
          Objectif total : <span className="font-bold">{calculatePreviewTarget().toLocaleString()} {formData.currency}</span>
        </p>
        <p className="text-blue-700 text-sm mt-1">
          Soit environ {Math.round(calculatePreviewTarget() / 6).toLocaleString()} {formData.currency} par mois
        </p>
      </div>

      <Button type="submit" className="w-full" size="lg">
        <CheckCircle className="w-4 h-4 mr-2" />
        {existingGoal ? 'Mettre à jour mon objectif' : 'Créer mon objectif d\'épargne'}
      </Button>
    </form>
  );
}

// Transaction Form
interface TransactionFormProps {
  onSubmit: (data: { amount: number; description: string; date: string; type: 'deposit' | 'withdrawal' }) => void;
}

function TransactionForm({ onSubmit }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'deposit' as 'deposit' | 'withdrawal',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Type de transaction</Label>
        <RadioGroup 
          value={formData.type} 
          onValueChange={(value: 'deposit' | 'withdrawal') => setFormData({...formData, type: value})}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="deposit" id="deposit" />
            <Label htmlFor="deposit">Versement (dépôt)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="withdrawal" id="withdrawal" />
            <Label htmlFor="withdrawal">Retrait</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="amount">Montant</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
          placeholder="100.00"
          required
          min="0"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Ex: Versement mensuel, épargne bonus..."
          required
        />
      </div>
      
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
          required
        />
      </div>
      
      <Button type="submit" className="w-full">
        <CheckCircle className="w-4 h-4 mr-2" />
        Enregistrer la transaction
      </Button>
    </form>
  );
}

export default SavingsChallenge;