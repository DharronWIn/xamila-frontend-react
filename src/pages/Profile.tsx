import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    Edit3,
    Settings,
    Trophy,
    Target,
  MessageCircle, Calendar, Crown,
    Star,
  Users, Award, Camera, DollarSign,
  Activity, Zap, Share2, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/ui/UserAvatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { usePosts } from "@/lib/apiComponent/hooks/useSocial";
import { useTransactions } from "@/lib/apiComponent/hooks/useFinancial";
import AvatarManager from "@/components/profile/AvatarManager";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";
import EditProfileModal from "@/components/profile/EditProfileModal";

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

const Profile = () => {
  const { user: userProfile, isLoading: authLoading, getProfile } = useAuth();
  const { posts = [], isLoading: postsLoading } = usePosts();
  const { transactions = [], isLoading: transactionsLoading } = useTransactions();

  const [isAvatarManagerOpen, setIsAvatarManagerOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Charger les données au montage
  useEffect(() => {
    // Récupérer le profil utilisateur si pas encore chargé
    if (!userProfile && !authLoading) {
      getProfile();
    }
  }, [userProfile, authLoading, getProfile]);

  // Données simulées pour les challenges et amis (en attendant les vrais hooks)
  const challenges = [];
  const friends = [];
  const currentGoal = null; // Pas encore implémenté

  // Calculer les statistiques réelles
  const stats = {
    totalSaved: transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + (t.amount || 0), 0),
    monthlyGoal: 500, // Valeur par défaut
    currentMonth: transactions.filter(t => t.type === 'INCOME' && new Date(t.createdAt).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + (t.amount || 0), 0),
    challengesCompleted: 0, // Pas encore implémenté
    challengesActive: 0, // Pas encore implémenté
    postsCount: posts.length,
    friendsCount: 0, // Pas encore implémenté
    streak: 0, // Pas encore implémenté dans l'API
    level: 1, // Pas encore implémenté dans l'API
    xp: 0, // Pas encore implémenté dans l'API
    nextLevelXp: 2000 // Valeur par défaut
  };

  const achievements = [
    { id: 1, name: "Premier Challenge", description: "A terminé son premier challenge", icon: Trophy, earned: stats.challengesCompleted > 0 },
    { id: 2, name: "Économiste", description: "A économisé plus de 1000€", icon: DollarSign, earned: stats.totalSaved >= 1000 },
    { id: 3, name: "Social", description: "A partagé 10 posts", icon: Share2, earned: stats.postsCount >= 10 },
    { id: 4, name: "Maître", description: "Niveau 10 atteint", icon: Crown, earned: stats.level >= 10 },
  ];

  // Générer les activités récentes à partir des vraies données
  const recentActivities = [
    ...challenges.slice(0, 2).map((challenge, index) => ({
      id: `challenge-${challenge.id}`,
      type: "challenge" as const,
      message: `A rejoint le challenge '${challenge.title}'`,
      time: "2h",
      icon: Target
    })),
    ...posts.slice(0, 2).map((post, index) => ({
      id: `post-${post.id}`,
      type: "post" as const,
      message: "A partagé un conseil d'épargne",
      time: "5h",
      icon: MessageCircle
    })),
    ...achievements.filter(a => a.earned).slice(0, 1).map((achievement, index) => ({
      id: `achievement-${achievement.id}`,
      type: "achievement" as const,
      message: `A débloqué l'achievement '${achievement.name}'`,
      time: "1j",
      icon: Trophy
    }))
  ].slice(0, 4);

  const progressPercentage = currentGoal ? (currentGoal.currentAmount / currentGoal.targetAmount) * 100 : 0;

  // État de chargement global
  const isLoading = postsLoading || transactionsLoading || authLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
          className="space-y-8"
    >
          {/* Header avec photo de profil */}
      <motion.div variants={fadeInUp}>
            <Card className="relative overflow-hidden border-0 shadow-xl">
              {/* Background décoratif */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-10"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-400/20 to-yellow-400/20 rounded-full translate-y-24 -translate-x-24"></div>
              
              <CardContent className="relative p-8">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                  <div className="flex items-end space-x-6">
                    <div className="relative group">
                      <UserAvatar 
                        user={userProfile}
                        size="xl"
                        className="w-32 h-32 border-4 border-white shadow-2xl ring-4 ring-blue-100"
                        fallbackClassName="text-3xl font-bold"
                      />
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 shadow-lg"
                        onClick={() => setIsAvatarManagerOpen(true)}
                      >
                        <Camera className="w-4 h-4" />
              </Button>
          </div>

                    <div className="pb-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <h1 className="text-4xl font-bold text-gray-900">
                          {userProfile?.firstName && userProfile?.lastName 
                            ? `${userProfile.firstName} ${userProfile.lastName}`
                            : userProfile?.name || 'Utilisateur'
                          }
                    </h1>
                        {userProfile?.isPremium && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 text-sm">
                            <Crown className="w-4 h-4 mr-1" />
                        Premium
                      </Badge>
                    )}
                        <Badge variant="outline" className="px-3 py-1">
                          Niveau {stats.level}
                        </Badge>
                  </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>Membre depuis {new Date(userProfile?.createdAt || '').toLocaleDateString('fr-FR', { 
                      month: 'long', 
                      year: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-green-500" />
                          <span>{currentGoal ? `${currentGoal.currentAmount}€ / ${currentGoal.targetAmount}€` : 'Pas d\'objectif'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span>Série de {stats.streak} jours</span>
                    </div>
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-purple-500" />
                          <span>{stats.xp} XP</span>
                    </div>
                  </div>
                </div>
              </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => setIsEditProfileOpen(true)}
                    >
                      <Edit3 className="w-4 h-4" />
                      Modifier le profil
                </Button>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => setIsChangePasswordOpen(true)}
                    >
                  <Settings className="w-4 h-4" />
                      Changer le mot de passe
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

          {/* Statistiques principales */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Épargné</p>
                    <p className="text-3xl font-bold">{stats.totalSaved}€</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Objectif Mensuel</p>
                    <p className="text-3xl font-bold">{stats.currentMonth}€</p>
                    <p className="text-green-200 text-xs">sur {stats.monthlyGoal}€</p>
                  </div>
                  <Target className="w-8 h-8 text-green-200" />
                </div>
                <div className="mt-3">
                  <Progress value={(stats.currentMonth / stats.monthlyGoal) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Challenges</p>
                    <p className="text-3xl font-bold">{stats.challengesCompleted}</p>
                    <p className="text-purple-200 text-xs">terminés</p>
                  </div>
                  <Trophy className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-orange-100 text-sm">Série</p>
                    <p className="text-3xl font-bold">{stats.streak}</p>
                    <p className="text-orange-200 text-xs">jours</p>
                </div>
                  <Zap className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
      </motion.div>

          {/* Contenu principal avec onglets */}
          <motion.div variants={fadeInUp}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
                <TabsTrigger value="activity">Activité</TabsTrigger>
                <TabsTrigger value="achievements">Succès</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Progression de l'objectif */}
                  <Card className="border-0 shadow-lg">
                <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-500" />
                        Progression de l'objectif
                  </CardTitle>
                </CardHeader>
                    <CardContent>
                      {currentGoal ? (
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span>Épargné ce mois</span>
                            <span className="font-semibold">{currentGoal.currentAmount}€ / {currentGoal.targetAmount}€</span>
                      </div>
                          <Progress value={progressPercentage} className="h-3" />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>0€</span>
                            <span>{currentGoal.targetAmount}€</span>
                            </div>
                          </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>Aucun objectif défini</p>
                          <Button size="sm" className="mt-2">Définir un objectif</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

                  {/* Progression du niveau */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Progression du niveau
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span>Niveau {stats.level}</span>
                          <span className="font-semibold">{stats.xp} / {stats.nextLevelXp} XP</span>
                        </div>
                        <Progress value={(stats.xp / stats.nextLevelXp) * 100} className="h-3" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0 XP</span>
                          <span>{stats.nextLevelXp} XP</span>
                        </div>
                      </div>
                  </CardContent>
                </Card>
                </div>
            </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      Activité récente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
              <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <activity.icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.message}</p>
                            <p className="text-xs text-gray-500">Il y a {activity.time}</p>
                  </div>
                </div>
                      ))}
                    </div>
                        </CardContent>
                      </Card>
            </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <Card className="border-0 shadow-lg">
            <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      Succès et récompenses
              </CardTitle>
            </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            achievement.earned
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200 bg-gray-50 opacity-60'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              achievement.earned ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              <achievement.icon className={`w-6 h-6 ${
                                achievement.earned ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{achievement.name}</h3>
                              <p className="text-sm text-gray-600">{achievement.description}</p>
                            </div>
                            {achievement.earned && (
                              <Check className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
                    </div>
            </CardContent>
          </Card>
              </TabsContent>

              <TabsContent value="social" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Amis */}
                  <Card className="border-0 shadow-lg">
            <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-500" />
                        Amis ({friends.length})
              </CardTitle>
            </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
              {friends.slice(0, 5).map((friend) => (
                <div key={friend.id} className="flex items-center space-x-3">
                  <div className="relative">
                              <UserAvatar 
                                user={friend}
                                size="md"
                                className="w-10 h-10"
                              />
                    {friend.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {friend.name}
                    </p>
                    <p className="text-xs text-gray-500">
                                {friend.isOnline ? 'En ligne' : `Vu il y a ${friend.lastSeen}`}
                    </p>
                  </div>
                </div>
              ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Posts récents */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-blue-500" />
                        Posts récents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {posts.slice(0, 3).map((post) => (
                          <div key={post.id} className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700 line-clamp-2">{post.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        ))}
                      </div>
            </CardContent>
          </Card>
                </div>
              </TabsContent>


            </Tabs>
          </motion.div>
        </motion.div>
      </div>

      {/* Modal de gestion d'avatar */}
      <AvatarManager 
        isOpen={isAvatarManagerOpen} 
        onClose={() => setIsAvatarManagerOpen(false)} 
      />
      
      {/* Modal de changement de mot de passe */}
      <ChangePasswordModal 
        isOpen={isChangePasswordOpen} 
        onClose={() => setIsChangePasswordOpen(false)} 
      />
      
      {/* Modal de modification du profil */}
      <EditProfileModal 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)} 
      />
    </div>
  );
};

export default Profile;
