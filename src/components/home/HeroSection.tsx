import { motion } from "framer-motion";
import {
  ArrowRight,
  Target,
  TrendingUp,
  Shield,
  FileText,
  BarChart3,
  Users,
  Crown,
  CreditCard,
  Bell,
  PiggyBank,
  Trophy,
  CheckCircle,
  Smartphone,
  DollarSign, Award, Settings,
  Phone, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero-savings.jpg";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const heroFeatures = [
  {
    icon: Target,
    title: "Objectifs personnalisés",
    description: "Fixez vos objectifs d'épargne selon vos revenus"
  },
  {
    icon: TrendingUp,
    title: "Suivi intelligent",
    description: "Visualisez votre progression en temps réel"
  },
  {
    icon: Shield,
    title: "Sécurisé & fiable",
    description: "Vos données financières sont protégées"
  }
];

const mainFeatures = [
  {
    icon: FileText,
    title: "Ressources éducatives",
    description: "Accédez à des guides, PDF téléchargeables et outils pour maîtriser l'épargne",
    features: ["Guides gratuits", "Documents premium", "Certificats de participation"],
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: BarChart3,
    title: "Capture du flux financier",
    description: "Interface moderne pour gérer vos revenus et dépenses comme une vraie app bancaire",
    features: ["Ajout/modification de transactions", "Graphiques interactifs", "Analyses par catégories"],
    color: "from-green-500 to-green-600",
    isPremium: true
  },
  {
    icon: PiggyBank,
    title: "Challenge d'épargne personnalisé",
    description: "Programme sur 6 mois avec calcul automatique basé sur vos revenus",
    features: ["Objectifs intelligents", "Suivi de progression", "Classement global"],
    color: "from-purple-500 to-purple-600",
    isPremium: true
  },
  {
    icon: CreditCard,
    title: "Ouverture compte bancaire",
    description: "Trouvez et ouvrez un compte chez nos partenaires bancaires avec des taux avantageux",
    features: ["Comparaison d'offres", "Taux préférentiels", "Support dédié"],
    color: "from-orange-500 to-orange-600"
  }
];

const premiumFeatures = [
  {
    icon: Crown,
    title: "Fonctionnalités Premium",
    description: "Débloquez l'expérience complète",
    items: [
      "Analyse financière avancée",
      "Challenge d'épargne personnalisé", 
      "Classement et compétition",
      "Certificats de réussite",
      "Support prioritaire"
    ]
  },
  {
    icon: Smartphone,
    title: "Paiements flexibles", 
    description: "Méthodes de paiement adaptées à votre région",
    items: [
      "Orange Money, MTN, Moov",
      "Wave Money",
      "Cartes Visa/Mastercard",
      "Paiement sécurisé",
      "Annulation possible"
    ]
  },
  {
    icon: Users,
    title: "Communauté active",
    description: "Rejoignez une communauté motivée",
    items: [
      "Classement en temps réel",
      "Partage d'expériences",
      "Motivation collective",
      "Événements exclusifs",
      "Réseau d'entraide"
    ]
  }
];

const stats = [
  { label: "Participants actifs", value: "1,247+", icon: Users },
  { label: "Objectifs atteints", value: "89%", icon: Target },
  { label: "Épargne moyenne", value: "2,450€", icon: DollarSign },
  { label: "Satisfaction", value: "4.8/5", icon: Trophy }
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
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Financial growth concept"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-hero/90" />
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
              ease: "easeInOut"
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
            Challenge
            <span className="block bg-gradient-to-r from-white to-accent-light bg-clip-text text-transparent">
              d'Épargne
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={fadeInUp}
            className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Transformez votre relation à l'argent avec un défi d'épargne sur 6 mois. 
            Atteignez vos objectifs financiers avec notre accompagnement personnalisé.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button 
              variant="hero" 
              size="xl"
              onClick={onGetStarted}
              className="group"
            >
              Je suis intéressé
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="glass" 
              size="xl"
              className="text-white hover:text-foreground"
            >
              En savoir plus
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
                <p className="text-white/80 text-sm">
                  {feature.description}
                </p>
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
export function HomePage({ onGetStarted, isAuthenticated, onGoToDashboard }: HomePageProps) {
  return (
    <>
      <HeroSection onGetStarted={onGetStarted} />
      
      {/* Stats Section */}
      <section className="py-20 bg-white">
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
              Le Challenge d'Épargne transforme déjà la vie financière de nombreuses personnes
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
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
                <div className="text-gray-600 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-20 bg-gray-50">
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
              Une suite complète d'outils pour transformer votre relation à l'argent
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white`}>
                          <feature.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{feature.title}</CardTitle>
                          {feature.isPremium && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white mt-1">
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.features.map((item, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl mb-6">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Premium ?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Débloquez toutes les fonctionnalités avancées pour maximiser votre réussite
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feature.items.map((item, i) => (
                        <li key={i} className="flex items-start text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
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
              Un processus simple en 4 étapes pour transformer vos habitudes d'épargne
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { 
                step: "1", 
                title: "Inscription", 
                description: "Remplissez le formulaire détaillé pour personnaliser votre expérience",
                icon: Users
              },
              { 
                step: "2", 
                title: "Validation", 
                description: "Votre demande est examinée et vous recevez vos accès par email",
                icon: CheckCircle
              },
              { 
                step: "3", 
                title: "Configuration", 
                description: "Définissez votre objectif d'épargne basé sur vos revenus",
                icon: Target
              },
              { 
                step: "4", 
                title: "Challenge", 
                description: "Suivez votre progression pendant 6 mois et atteignez vos objectifs",
                icon: Trophy
              }
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
                <p className="text-gray-600 text-sm">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Interface d'administration complète
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Gestion professionnelle de votre plateforme Challenge d'Épargne
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Gestion des utilisateurs",
                description: "CRUD complet, validation des inscriptions, statistiques par utilisateur"
              },
              {
                icon: BarChart3,
                title: "Analytics avancées",
                description: "Métriques en temps réel, graphiques de croissance, tableaux de bord"
              },
              {
                icon: FileText,
                title: "Gestion des ressources",
                description: "CRUD des documents, attribution aux utilisateurs, statistiques de téléchargement"
              },
              {
                icon: Bell,
                title: "Communications",
                description: "Notifications personnalisées, emails groupés, messages individuels"
              },
              {
                icon: DollarSign,
                title: "Revenus & Paiements",
                description: "Suivi des abonnements, analytics de conversion, gestion des factures"
              },
              {
                icon: Award,
                title: "Validation & Certificats",
                description: "Approbation des inscriptions, génération de certificats, suivi des objectifs"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/80 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
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
              Rejoignez le Challenge d'Épargne 6 mois et découvrez votre potentiel financier
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
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={onGetStarted}
                    className="group"
                  >
                    Commencer le challenge
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
              )}
            </div>

            <div className="text-white/70 text-sm">
              📞 +225 07 06 49 49 16 | ✉️ financeendogene@gmail.com
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}