import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Crown, Target, Activity, Star, Trophy as TrophyIcon, MessageCircle, Award, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import UserAvatar from '@/components/ui/UserAvatar';
import { motion } from 'framer-motion';

export const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { profile, loading, error, loadProfile, isOwnProfile, currentUserId } = usePublicProfile();

  useEffect(() => {
    if (userId) {
      loadProfile(userId);
    }
  }, [userId, loadProfile]);

  // Rediriger vers son propre profil si c'est l'utilisateur actuel
  useEffect(() => {
    if (userId && currentUserId && isOwnProfile(userId)) {
      navigate('/user-dashboard/profile');
    }
  }, [userId, currentUserId, isOwnProfile, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center space-y-4">
          <div className="text-red-600 text-lg">{error}</div>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Profil non trouvé</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

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

  const fullName = profile.firstName && profile.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : profile.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <Button onClick={() => navigate(-1)} variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            {/* <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Message
              </Button>
              <Button className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Suivre
              </Button>
            </div> */}
          </div>

          {/* Header profil (même design que privé, sans actions d'édition) */}
          <motion.div variants={fadeInUp}>
            <Card className="relative overflow-hidden border-0 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-10"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-400/20 to-yellow-400/20 rounded-full translate-y-24 -translate-x-24"></div>

              <CardContent className="relative p-8">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                  <div className="flex items-end space-x-6">
                    <div className="relative group">
                      <UserAvatar 
                        user={{ name: fullName, pictureProfilUrl: profile.pictureProfilUrl }}
                        size="xl"
                        className="w-32 h-32 border-4 border-white shadow-2xl ring-4 ring-blue-100"
                        fallbackClassName="text-3xl font-bold"
                      />
                    </div>

                    <div className="pb-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <h1 className="text-4xl font-bold text-gray-900">{fullName}</h1>
                        {profile.isPremium && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 text-sm">
                            <Crown className="w-4 h-4 mr-1" />
                            Premium
                          </Badge>
                        )}
                        <Badge variant="outline" className="px-3 py-1">
                          Niveau {profile.gamification?.level ?? 1}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>Membre depuis {new Date(profile.memberSince || '').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>Total XP {profile.gamification?.totalXP ?? 0}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrophyIcon className="w-4 h-4 text-purple-500" />
                          <span>Trophées {profile.gamification?.totalTrophies ?? 0}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-green-500" />
                          <span>Badges {profile.gamification?.totalBadges ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* <div className="flex gap-3">
                    <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate('/user-dashboard/resources')}>
                      <FileText className="w-4 h-4" />
                      Voir ses ressources
                    </Button>
                  </div> */}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Statistiques principales (adaptées aux champs publics) */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Challenges</p>
                    <p className="text-3xl font-bold">{profile.stats?.challengesParticipated ?? 0}</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Défis</p>
                    <p className="text-3xl font-bold">{profile.stats?.defisParticipated ?? 0}</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Posts</p>
                    <p className="text-3xl font-bold">{profile.stats?.postsCreated ?? 0}</p>
                  </div>
                  <MessageCircle className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Niveau</p>
                    <p className="text-3xl font-bold">{profile.gamification?.level ?? 1}</p>
                  </div>
                  <Star className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trophées récents */}
          <motion.div variants={fadeInUp}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-yellow-500" />
                  Trophées récents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.gamification?.recentTrophies?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profile.gamification.recentTrophies.map((trophy) => (
                      <div key={trophy.id} className="p-4 rounded-lg border bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <TrophyIcon className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{trophy.trophy?.nameFr || trophy.trophy?.name}</p>
                            <p className="text-xs text-gray-500">{trophy.trophy?.descriptionFr || trophy.trophy?.descriptionEn}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Aucun trophée récent</div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Badges */}
          <motion.div variants={fadeInUp}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.gamification?.badges?.length ? (
                  <div className="flex flex-wrap gap-3">
                    {profile.gamification.badges.map((badgeItem) => (
                      <Badge key={badgeItem.id} variant="secondary" className="px-3 py-1">
                        {badgeItem.badge?.nameFr || badgeItem.badge?.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Aucun badge</div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
