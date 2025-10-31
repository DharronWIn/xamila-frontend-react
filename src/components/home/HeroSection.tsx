import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Target, FileText,
  BarChart3,
  Users,
  Crown,
  CreditCard, PiggyBank,
  Trophy,
  CheckCircle, DollarSign, Settings,
  Phone,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RegistrationModal } from "@/components/home/RegistrationModal";
import heroImage from "@/assets/challenge-epargne.png";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const heroFeatures = [
  {
    icon: PiggyBank,
    title: "Epargne productive",
    description: "Accédez à un compte bancaire dédié ou des produits financiers intéressants",
  },
  {
    icon: Target,
    title: "Discipline financière",
    description: "Améliorez la gestion de vos ressources grâce à nos ressources pensées pour vous",
  },
  {
    icon: Users,
    title: "Elan communautaire",
    description: "Bénéficiez de la force du groupe pour aller plus loin que vous n'aurez été seul",
  },
];

const mainFeatures = [
  {
    icon: FileText,
    title: "Plan épargne",
    description:
      "Épargnez automatiquement 10% de vos revenus via nos partenaires bancaires NSIA et ADEC",
    features: [
      "Virement automatique",
      "Partenaires NSIA et ADEC",
      "Suivi en temps réel",
    ],
    color: "from-blue-500 to-blue-600",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&crop=center",
    bgGradient: "from-blue-50 to-blue-100",
    textColor: "text-blue-900",
  },
  {
    icon: BarChart3,
    title: "Capture du flux financier",
    description:
      "Interface moderne pour gérer vos revenus et dépenses comme une vraie app bancaire",
    features: [
      "Ajout/modification de transactions",
      "Graphiques interactifs",
      "Analyses par catégories",
    ],
    color: "from-green-500 to-green-600",
    isPremium: true,
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop&crop=center",
    bgGradient: "from-green-50 to-green-100",
    textColor: "text-green-900",
  },
  {
    icon: PiggyBank,
    title: "Challenge d'épargne personnalisé",
    description:
      "Programme sur 6 mois avec calcul automatique basé sur vos revenus",
    features: [
      "Objectifs intelligents",
      "Suivi de progression",
      "Classement global",
    ],
    color: "from-purple-500 to-purple-600",
    isPremium: true,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop&crop=center",
    bgGradient: "from-purple-50 to-purple-100",
    textColor: "text-purple-900",
  },
  {
    icon: CreditCard,
    title: "Ouverture compte bancaire",
    description:
      "Trouvez et ouvrez un compte chez nos partenaires bancaires avec des taux avantageux",
    features: ["Comparaison d'offres", "Taux préférentiels", "Support dédié"],
    color: "from-orange-500 to-orange-600",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&crop=center",
    bgGradient: "from-orange-50 to-orange-100",
    textColor: "text-orange-900",
  },
];

const pricingFeatures = [
  {
    feature: "Ouverture de compte sur le site",
    standard: true,
    premium: true,
  },
  {
    feature: "Participation aux challenges épargne",
    standard: true,
    premium: true,
  },
  {
    feature: "Participation aux défis épargne (spécialisés)",
    standard: false,
    premium: true,
  },
  {
    feature: "Ouverture de compte bancaire (épargne)",
    standard: true,
    premium: true,
  },
  {
    feature: "Forum",
    standard: true,
    premium: true,
  },
  {
    feature: "Application de suivi des finances personnelles",
    standard: false,
    premium: true,
  },
  {
    feature: "Accès au plan épargne Niveau 1",
    standard: false,
    premium: true,
  },
  {
    feature: "Charte de l'épargnant personnalisée",
    standard: false,
    premium: true,
  },
  {
    feature: "Certificat d'engagement au challenge personnalisé",
    standard: false,
    premium: true,
  },
  {
    feature: "Carte d'adhérent à la Communauté des Epargnants",
    standard: false,
    premium: true,
  },
  {
    feature: "Certificat de réussite au challenge épargne",
    standard: false,
    premium: true,
  },
  {
    feature: "Première séance de 30 mn de coaching personnalisé",
    standard: true,
    premium: true,
  },
  {
    feature: "Webinaires",
    standard: "Limité",
    premium: true,
  },
  {
    feature: "Ressources vidéos",
    standard: "Limité",
    premium: true,
  },
  {
    feature: "Ressources audios",
    standard: "Limité",
    premium: true,
  },
  {
    feature: "Ressources documentaires",
    standard: "Limité",
    premium: true,
  },
  {
    feature: "Séance de coaching personnalisé de 30 mn",
    standard: "20 000 FCFA",
    premium: "15 000 FCFA",
  },
];

const stats = [
  { label: "Inscrits sur la plateforme", value: "1,247+", icon: Users },
  { label: "Challenges", value: "89+", icon: Target },
  { label: "Objectifs atteints", value: "78%", icon: CheckCircle },
  { label: "Épargne mobilisée", value: "2,450,000 FCFA", icon: DollarSign },
  { label: "Satisfaction", value: "4.8/5", icon: Trophy },
];

interface HeroSectionProps {
  onGetStarted: () => void;
}

interface HomePageProps {
  onGetStarted: () => void;
  isAuthenticated?: boolean;
  onGoToDashboard?: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const navigate = useNavigate();
  
  const scrollToInscription = () => {
    const element = document.getElementById('inscription');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToRegistration = () => {
    navigate('/registration');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background Image without Filter */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Financial growth concept"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10 backdrop-blur-sm"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto"
        >
          {/* Main Title */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            Relevez le challenge !
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Epargnez pendant 6 mois, 10% de tout ce qui vous passera dans les mains, 
            et apprenez à faire fructifier votre épargne, en toute sécurité
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button
              variant="hero"
              size="xl"
              className="group"
            >
              Télécharger la brochure
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="glass"
              size="xl"
              onClick={goToRegistration}
              className="text-white hover:text-foreground"
            >
              Remplir le formulaire
            </Button>
          </motion.div>

          {/* Hero Features Grid */}
          <motion.div
            variants={fadeInUp}
            className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {heroFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.2, duration: 0.6 }}
                className="bg-glass backdrop-blur-glass border border-glass rounded-2xl p-6 hover:bg-glass/80 transition-all duration-300"
              >
                <feature.icon className="w-12 h-12 text-white mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/80 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/70 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

// New Complete Homepage Component
export function HomePage({
  onGetStarted,
  isAuthenticated,
  onGoToDashboard,
}: HomePageProps) {
  const navigate = useNavigate();
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const goToRegistration = () => {
    navigate('/registration');
  };

  const handlePlanSelection = (planType: string) => {
    setSelectedPlan(planType);
    setIsRegistrationModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsRegistrationModalOpen(false);
    setSelectedPlan(null);
  };

  return (
    <>
      <HeroSection onGetStarted={onGetStarted} />

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Rejoignez des milliers de participants
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Le Challenge d'Épargne transforme déjà la vie financière de
              nombreuses personnes
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-4">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Toutes les fonctionnalités pour réussir
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une suite complète d'outils pour transformer votre relation à
              l'argent
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className="group"
              >
                <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm group-hover:bg-white/90">
                  {/* Image Header */}
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    
                    {/* Premium Badge */}
                    <div className="absolute top-3 right-3">
                          {feature.isPremium && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                    
                    {/* Floating Icon */}
                    <div className="absolute bottom-3 left-3">
                      <motion.div
                        className={`p-2 sm:p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-lg`}
                        whileHover={{ 
                          scale: 1.1,
                          rotate: 360,
                          transition: { duration: 0.5 }
                        }}
                      >
                        <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </motion.div>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className={`text-lg sm:text-xl font-bold ${feature.textColor} group-hover:scale-105 transition-transform duration-300`}>
                      {feature.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-0 pb-4">
                    <p className="text-gray-600 mb-3 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 text-sm">
                      {feature.description}
                    </p>
                    
                    <div className="space-y-2">
                      {feature.features.map((item, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center text-xs sm:text-sm text-gray-700 group-hover:text-gray-800 transition-colors duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1, duration: 0.3 }}
                          viewport={{ once: true }}
                        >
                          <motion.div
                            className="mr-2 flex-shrink-0"
                            whileHover={{ scale: 1.2 }}
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </motion.div>
                          <span className="font-medium">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl mb-6">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              FORFAITS
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Comparez nos offres Standard et Premium
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <thead className="bg-gradient-to-r from-primary to-primary/80 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Fonctionnalités</th>
                    <th className="px-6 py-4 text-center font-semibold">Standard</th>
                    <th className="px-6 py-4 text-center font-semibold">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingFeatures.map((item, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      viewport={{ once: true }}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.feature}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.standard === true ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                        ) : item.standard === false ? (
                          <div className="w-5 h-5 mx-auto"></div>
                        ) : (
                          <span className="text-sm text-gray-600 font-medium">{item.standard}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.premium === true ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                        ) : item.premium === false ? (
                          <div className="w-5 h-5 mx-auto"></div>
                        ) : (
                          <span className="text-sm text-gray-600 font-medium">{item.premium}</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td className="px-6 py-4 text-lg font-bold text-gray-900">Prix</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-2xl font-bold text-gray-900">Gratuit</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-2xl font-bold text-primary">10 000 FCFA/AN</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Un processus simple en 4 étapes pour transformer vos habitudes
              d'épargne
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Pré-inscription",
                description:
                  "Remplissez le formulaire pour ouvrir votre compte sur le site",
                icon: Users,
              },
              {
                step: "2",
                title: "Validation",
                description:
                  "Après validation, vous recevrez vos accès par email et vous pourrez vous connecter sur le site",
                icon: CheckCircle,
              },
              {
                step: "3",
                title: "Immersion",
                description:
                  "Découvrez les fonctionnalités du site et testez les, ouvrez votre compte d'épargne par exemple !",
                icon: Target,
              },
              {
                step: "4",
                title: "Inscrivez vous au challenge",
                description:
                  "Inscrivez vous au challenge d'épargne disponible et suivez votre progression ainsi que celle du groupe",
                icon: Trophy,
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl text-white font-bold text-xl mb-4">
                    {step.step}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                    <step.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=700&fit=crop&crop=center"
                  alt="Personne prête à épargner avec des pièces de monnaie"
                  className="w-full h-[500px] sm:h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-green-500/20 rounded-full blur-xl"></div>
            </motion.div>

            {/* Text Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
          <motion.div
                  initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl mb-6"
          >
              <Settings className="w-8 h-8 text-white" />
          </motion.div>

                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Plan épargne
                </h2>
                
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Épargnez 10% de vos revenus via nos partenaires bancaires NSIA et ADEC.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    step: "🏦",
                    title: "Partenaires bancaires",
                    description: "NSIA et ADEC, virement automatique sécurisé."
                  },
                  {
                    step: "💰", 
                    title: "10% automatique",
                    description: "Épargne automatique de 10% de vos revenus."
                  },
                  {
                    step: "📈",
                    title: "Suivi en temps réel",
                    description: "Visualisez votre progression et vos gains."
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.2, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="flex space-x-4 group"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform duration-300">
                        {item.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="inscription" className="py-12 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Prêt à transformer votre épargne ?
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Rejoignez le Challenge d'Épargne 6 mois et découvrez votre
              potentiel financier
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={onGoToDashboard}
                    className="group"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Accéder à mon espace
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-primary"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Nous contacter
                  </Button>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                    
                    {/* Main button */}
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={goToRegistration}
                      className="relative group bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-0"
                    >
                      <motion.span
                        className="flex items-center"
                        animate={{ 
                          textShadow: [
                            "0 0 0px rgba(255,255,255,0)",
                            "0 0 10px rgba(255,255,255,0.5)",
                            "0 0 0px rgba(255,255,255,0)"
                          ]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                      >
                      S'inscrire maintenant
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                          }}
                        >
                          <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                        </motion.div>
                      </motion.span>
                    </Button>
                  </motion.div>
                </>
              )}
            </div>

            <div className="text-white/70 text-sm">
              📞 +225 07 06 49 49 16 | ✉️ financeendogene@gmail.com
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partners & Sponsors Section */}

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
