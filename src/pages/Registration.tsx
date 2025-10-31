import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  User, Target,
  CheckCircle,
  Eye, Users,
  PiggyBank,
  Shield, ArrowRight, FileText, Award,
  TrendingUp, X, Loader2, Mail, MapPin, Briefcase, Calendar, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionPlan } from "@/types/subscription";
import SubscriptionPlanSelector from "@/components/auth/SubscriptionPlanSelector";
import { CountryPhoneSelector } from "@/components/auth/CountryPhoneSelector";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import type { RegisterResponse } from "@/lib/apiComponent/hooks/useAuth";
import { useCountries } from "@/lib/apiComponent/hooks/useCountries";
import type { Country } from "@/lib/apiComponent/hooks/useCountries";
import logoApp from "@/assets/images/logo-challenge-epargne.jpg";
// Schéma de validation Zod (identique au RegistrationModal)
const registrationSchema = z.object({
  // Step 1: Informations personnelles
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  gender: z.enum(["masculin", "feminin"], {
    required_error: "Veuillez sélectionner votre genre",
  }),
  ageRange: z.string().min(1, "Veuillez sélectionner votre tranche d'âge"),

  // Step 2: Contact et localisation
  whatsapp: z.string().min(8, "Numéro WhatsApp invalide"),
  email: z.string().email("Email invalide"),
  country: z.string().min(2, "Veuillez indiquer votre pays de résidence"),
  city: z.string().min(2, "Veuillez indiquer votre ville de résidence"),

  // Step 3: Situation professionnelle
  professionalStatus: z
    .string()
    .min(1, "Veuillez sélectionner votre statut professionnel"),

  // Step 4: Culture d'épargne actuelle
  maxSavingsAmount: z
    .string()
    .min(1, "Veuillez indiquer votre plus grand montant épargné"),
  savingsHabit: z
    .string()
    .min(1, "Veuillez sélectionner votre habitude d'épargne"),
  currentSavingsLevel: z
    .string()
    .min(1, "Veuillez indiquer votre niveau d'épargne actuel"),
  savingsUsage: z.string().min(1, "Veuillez indiquer l'usage de votre épargne"),
  savingsChallenge: z.string().min(1, "Veuillez décrire votre défi d'épargne"),

  // Step 5: Sur le challenge épargne
  previousChallengeExperience: z
    .string()
    .min(1, "Veuillez indiquer si vous avez déjà participé"),
  motivation: z.string().min(1, "Veuillez indiquer votre motivation"),
  challengeMode: z.nativeEnum(SubscriptionPlan, {
    required_error: "Veuillez choisir un mode de challenge",
  }),
  partnerAccounts: z
    .string()
    .min(1, "Veuillez indiquer vos comptes partenaires"),
  expenseTracking: z
    .string()
    .min(1, "Veuillez indiquer votre expérience de suivi"),
  futureInterest: z.string().min(1, "Veuillez indiquer vos intérêts futurs"),
  concerns: z.string().min(1, "Veuillez indiquer vos préoccupations"),

  // Step 6: Configuration du compte
  challengeStartMonth: z
    .string()
    .min(1, "Veuillez sélectionner un mois de départ"),
});

type ExtendedRegisterData = {
  firstName: string;
  lastName: string;
  gender: "masculin" | "feminin";
  ageRange: string;
  whatsapp: string;
  email: string;
  country: string;
  city: string;
  phoneNumber?: string; // Numéro sans préfixe
  phoneCountryCode?: string; // Code alpha2 du pays pour le téléphone
  countryCode?: string; // Code alpha2 du pays de résidence
  professionalStatus: string;
  maxSavingsAmount: string;
  savingsHabit: string;
  currentSavingsLevel: string;
  savingsUsage: string;
  savingsChallenge: string;
  previousChallengeExperience: string;
  motivation: string;
  challengeMode: string;
  partnerAccounts: string;
  expenseTracking: string;
  futureInterest: string;
  concerns: string;
  challengeStartMonth: string;
};

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const benefits = [
  {
    icon: PiggyBank,
    title: "Épargne automatique",
    description: "10% de vos revenus épargnés automatiquement"
  },
  {
    icon: Target,
    title: "Objectifs personnalisés",
    description: "Défis adaptés à votre situation financière"
  },
  {
    icon: Users,
    title: "Communauté active",
    description: "Rejoignez des milliers d'épargnants motivés"
  },
  {
    icon: Shield,
    title: "Sécurité garantie",
    description: "Vos données et votre argent sont protégés"
  },
  {
    icon: Award,
    title: "Certificats de réussite",
    description: "Reconnaissance de vos accomplissements"
  },
  {
    icon: TrendingUp,
    title: "Suivi de progression",
    description: "Visualisez votre évolution financière"
  }
];

const steps = [
  {
    number: "1",
    title: "Pré-inscription",
    description: "Remplissez le formulaire détaillé",
    icon: FileText,
    completed: false
  },
  {
    number: "2", 
    title: "Validation",
    description: "Vérification et validation de votre dossier",
    icon: CheckCircle,
    completed: false
  },
  {
    number: "3",
    title: "Immersion",
    description: "Découverte des fonctionnalités",
    icon: Eye,
    completed: false
  },
  {
    number: "4",
    title: "Challenge",
    description: "Démarrage de votre défi d'épargne",
    icon: Target,
    completed: false
  }
];

// Fonctions de mapping pour transformer les valeurs avec tirets en valeurs lisibles
const mapProfessionalStatus = (value: string): string => {
  const mapping: Record<string, string> = {
    "etudiant": "Étudiant(e)",
    "employe-prive": "Employé du privé",
    "fonctionnaire": "Fonctionnaire",
    "fonction-liberale": "Fonction libérale",
    "chef-entreprise": "Chef d'entreprise",
    "auto-entrepreneur": "Auto-entrepreneur",
    "activite-revenus": "Activité génératrice de revenus",
    "sans-emploi": "Sans emploi ou activité",
  };
  return mapping[value] || value;
};

const mapSavingsHabit = (value: string): string => {
  const mapping: Record<string, string> = {
    "jamais-reussi": "Je n'ai jamais réussi à épargner réellement",
    "temps-en-temps": "J'épargne de temps en temps, mais je réutilise l'argent moins de 3 mois après",
    "epargne-constituee": "J'ai une épargne constituée que j'accrois depuis au moins six mois",
    "habitude": "L'épargne est devenue une habitude pour moi",
  };
  return mapping[value] || value;
};

const mapSavingsUsage = (value: string): string => {
  const mapping: Record<string, string> = {
    "conserver": "Rien, je le conserve sur mon compte d'épargne",
    "besoins-personnels": "Je l'utilise pour financer mes besoins personnels",
    "urgences": "Je l'utilise pour régler des urgences en famille ou personnelles",
    "projets-rentables": "Je l'investis dans des projets qui m'ont rapporté plus d'argent",
    "marches-financiers": "Je le réinvestis sur les marchés financiers",
    "objectif-precis": "J'épargne toujours pour un but, donc j'utilise l'argent dans ce sens",
  };
  return mapping[value] || value;
};

const mapPartnerAccounts = (value: string): string => {
  const mapping: Record<string, string> = {
    "adec": "ADEC (Compte épargne)",
    "nsia": "NSIA ASSET MANAGEMENT (Compte FCP)",
    "aucun": "Aucun",
  };
  return mapping[value] || value;
};

const mapExpenseTracking = (value: string): string => {
  const mapping: Record<string, string> = {
    "oui-manuel": "Oui, manuellement dans un cahier",
    "oui-application": "Oui, sur une plateforme ou application en ligne",
    "moins-un-mois": "Je l'ai fait mais durant moins d'un mois",
    "jamais": "Je ne l'ai jamais fait",
  };
  return mapping[value] || value;
};

const mapFutureInterest = (value: string): string => {
  const mapping: Record<string, string> = {
    "continuer-6-mois": "Continuer le challenge encore pour 6 mois",
    "plan-epargne": "Adhérer au Plan Épargne pour continuer à épargner sur trois ans",
    "bourse-fcp": "Rentabiliser mon épargne sur la bourse ou les fonds communs de placement",
    "pas-sur": "Je ne sais pas encore ce que je ferai de mon épargne",
    "conserver": "Conserver mon épargne sur le compte",
    "utiliser-projets": "Utiliser mon épargne pour mes besoins ou projets",
  };
  return mapping[value] || value;
};

export default function Registration() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { registerWithPlan } = useAuth();
  const { countries, getCountryByCode } = useCountries();
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<RegisterResponse | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>("CI"); // Côte d'Ivoire par défaut
  const [countryCode, setCountryCode] = useState<string>("CI"); // Côte d'Ivoire par défaut
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [countrySearchQuery, setCountrySearchQuery] = useState<string>("");
  const [isCountrySelectOpen, setIsCountrySelectOpen] = useState(false);
  const countrySearchInputRef = useRef<HTMLInputElement>(null);

  // Filtrer les pays selon la recherche
  const filteredCountries = useMemo(() => {
    if (!countrySearchQuery.trim()) return countries;
    
    const query = countrySearchQuery.toLowerCase();
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.translations.fr?.toLowerCase().includes(query) ||
        country.alpha2Code.toLowerCase().includes(query) ||
        country.alpha3Code.toLowerCase().includes(query)
    );
  }, [countries, countrySearchQuery]);

  // Focus sur le champ de recherche quand le select s'ouvre
  useEffect(() => {
    if (isCountrySelectOpen && countrySearchInputRef.current) {
      setTimeout(() => {
        countrySearchInputRef.current?.focus();
      }, 100);
    }
  }, [isCountrySelectOpen]);

  const form = useForm<ExtendedRegisterData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "masculin",
      ageRange: "",
      whatsapp: "",
      email: "",
      country: "",
      city: "",
      professionalStatus: "",
      maxSavingsAmount: "",
      savingsHabit: "",
      currentSavingsLevel: "",
      savingsUsage: "",
      savingsChallenge: "",
      previousChallengeExperience: "",
      motivation: "",
      challengeMode: "",
      partnerAccounts: "",
      expenseTracking: "",
      futureInterest: "",
      concerns: "",
      challengeStartMonth: "",
    },
  });

  const handleCloseResponseModal = () => {
    setShowResponseModal(false);
    setApiResponse(null);
    navigate("/");
    setCurrentStep(1);
    form.reset();
  };

  // Fonction pour formater les noms : première lettre en majuscule, reste en minuscule
  const formatName = (name: string): string => {
    if (!name) return name;
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const onSubmit = async (data: ExtendedRegisterData) => {
    try {
      setIsLoading(true);

      // Préparer les données pour l'API
      const mappedGender: "M" | "F" | "Autre" = data.gender === "masculin" ? "M" : data.gender === "feminin" ? "F" : "Autre";
      
      // Obtenir le code d'appel du pays sélectionné
      const phoneCountry = getCountryByCode(phoneCountryCode);
      const callingCode = phoneCountry?.callingCode || "";
      
      // Construire le numéro de téléphone avec le préfixe du pays
      const fullPhoneNumber = phoneNumber && callingCode
        ? `+${callingCode}${phoneNumber}` 
        : data.whatsapp; // Fallback sur whatsapp si phoneNumber n'est pas défini
      
      // Formater les noms : première lettre en majuscule, reste en minuscule
      const formattedFirstName = formatName(data.firstName);
      const formattedLastName = formatName(data.lastName);
      
      const registerData = {
        // Informations personnelles
        email: data.email,
        firstName: formattedFirstName,
        lastName: formattedLastName,
        // Map vers le format backend: "M" | "F" | "Autre"
        gender: mappedGender,
        ageRange: data.ageRange,

        // Contact et localisation
        phone: fullPhoneNumber,
        username: formattedFirstName.toLowerCase().replace(/\s+/g, '') + formattedLastName.toLowerCase().replace(/\s+/g, ''),
        country: data.country,
        city: data.city,
        whatsapp: fullPhoneNumber,
        // phoneCountryCode: phoneCountryCode || data.phoneCountryCode,
        // countryCode: countryCode || data.countryCode,

        // Situation professionnelle - mapper les valeurs avec tirets
        professionalStatus: mapProfessionalStatus(data.professionalStatus),

        // Culture d'épargne actuelle - mapper les valeurs avec tirets
        maxSavingsAmount: data.maxSavingsAmount,
        savingsHabit: mapSavingsHabit(data.savingsHabit),
        currentSavingsLevel: data.currentSavingsLevel,
        savingsUsage: mapSavingsUsage(data.savingsUsage),
        savingsChallenge: data.savingsChallenge,

        // Sur le challenge épargne - mapper les valeurs avec tirets
        previousChallengeExperience: data.previousChallengeExperience,
        motivation: data.motivation,
        challengeMode: (data.challengeMode || "FREE") as SubscriptionPlan,
        challengeFormula: data.challengeMode === "FREE" ? "Standard" : "Premium",
        partnerAccounts: mapPartnerAccounts(data.partnerAccounts),
        expenseTracking: mapExpenseTracking(data.expenseTracking),
        futureInterest: mapFutureInterest(data.futureInterest),
        concerns: data.concerns,

        challengeStartMonth: data.challengeStartMonth,
      };
      console.log('🚀 DEBUG - Données transformées pour l\'API:');
      console.log('📤 Données complètes envoyées:', registerData);
      console.log('📊 Nombre de champs API:', Object.keys(registerData).length);

      // Appel à l'API d'inscription
      const response = await registerWithPlan(registerData);
      console.log('Registration response:', response);

      // Stocker la réponse et afficher le modal de réponse
      setApiResponse(response);
      setShowResponseModal(true);
      
    } catch (error: unknown) {
      console.error("Erreur inscription:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'inscription. Veuillez réessayer.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof ExtendedRegisterData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ["firstName", "lastName", "gender", "ageRange"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["whatsapp", "email", "country", "city"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["professionalStatus"];
    } else if (currentStep === 4) {
      fieldsToValidate = [
        "maxSavingsAmount",
        "savingsHabit",
        "currentSavingsLevel",
        "savingsUsage",
        "savingsChallenge",
      ];
    } else if (currentStep === 5) {
      fieldsToValidate = [
        "previousChallengeExperience",
        "motivation",
        "challengeMode",
        "partnerAccounts",
        "expenseTracking",
        "futureInterest",
        "concerns",
      ];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid && currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + i,
        1
      );
      const value = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      const label = date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
      });
      options.push({ value, label });
    }

    return options;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-2 block">
                  Prénom *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                    className="pl-10 h-12"
                    placeholder="Prénom"
                  />
                </div>
                {form.formState.errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-2 block">
                  Nom *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="lastName"
                    {...form.register("lastName")}
                    className="pl-10 h-12"
                    placeholder="Nom de famille"
                  />
                </div>
                {form.formState.errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Genre *
              </Label>
              <Select
                onValueChange={(value: "masculin" | "feminin") =>
                  form.setValue("gender", value)
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionner votre genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculin">Masculin</SelectItem>
                  <SelectItem value="feminin">Féminin</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.gender && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.gender.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Tranche d'âge *
              </Label>
              <Select
                onValueChange={(value) =>
                  form.setValue("ageRange", value)
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionner votre tranche d'âge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Moins de 18 ans">Moins de 18 ans</SelectItem>
                  <SelectItem value="18 - 24 ans">18 - 24 ans</SelectItem>
                  <SelectItem value="25 - 30 ans">25 - 30 ans</SelectItem>
                  <SelectItem value="31 - 35 ans">31 - 35 ans</SelectItem>
                  <SelectItem value="36 - 45 ans">36 - 45 ans</SelectItem>
                  <SelectItem value="45 - 55 ans">45 - 55 ans</SelectItem>
                  <SelectItem value="Plus de 55 ans">Plus de 55 ans</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.ageRange && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.ageRange.message}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Contact WhatsApp *
              </Label>
              <CountryPhoneSelector
                countryCode={phoneCountryCode}
                phoneNumber={phoneNumber}
                onCountryChange={(country: Country) => {
                  setPhoneCountryCode(country.alpha2Code);
                  form.setValue("phoneCountryCode", country.alpha2Code);
                  
                  // Synchroniser automatiquement le pays de résidence avec le pays du téléphone
                  setCountryCode(country.alpha2Code);
                  form.setValue("country", country.translations.fr || country.name);
                  form.setValue("countryCode", country.alpha2Code);
                }}
                onPhoneChange={(phone: string) => {
                  setPhoneNumber(phone);
                  // Garder whatsapp en sync pour la validation
                  const currentPhoneCountryCode = phoneCountryCode;
                  const phoneCountry = getCountryByCode(currentPhoneCountryCode);
                  const callingCode = phoneCountry?.callingCode || "";
                  form.setValue("whatsapp", phone && callingCode ? `+${callingCode}${phone}` : "");
                }}
                error={form.formState.errors.whatsapp?.message}
                disabled={isLoading}
                placeholder="Numéro de téléphone"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                Adresse e-mail *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  className="pl-10 h-12"
                  placeholder="financeendogene@gmail.com"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Pays de résidence *
              </Label>
              <Select
                value={countryCode}
                onValueChange={(value) => {
                  setCountryCode(value);
                  const country = countries.find((c) => c.alpha2Code === value || c.alpha3Code === value);
                  if (country) {
                    form.setValue("country", country.translations.fr || country.name);
                    form.setValue("countryCode", country.alpha2Code);
                  }
                  setIsCountrySelectOpen(false);
                  setCountrySearchQuery("");
                }}
                open={isCountrySelectOpen}
                onOpenChange={setIsCountrySelectOpen}
              >
                <SelectTrigger className="h-12">
                  <div className="flex items-center gap-2">
                   
                    <SelectValue placeholder="Sélectionner votre pays de résidence" />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-[400px] w-[350px]">
                  {/* Barre de recherche */}
                  <div className="sticky top-0 z-10 bg-background border-b p-2">
              <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                        ref={countrySearchInputRef}
                        type="text"
                        placeholder="Rechercher un pays..."
                        value={countrySearchQuery}
                        onChange={(e) => setCountrySearchQuery(e.target.value)}
                        className="pl-8 h-9"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            // Sélectionner le premier pays filtré
                            const first = filteredCountries[0];
                            if (first) {
                              setCountryCode(first.alpha2Code);
                              form.setValue("country", first.translations.fr || first.name);
                              form.setValue("countryCode", first.alpha2Code);
                              setIsCountrySelectOpen(false);
                              setCountrySearchQuery("");
                            }
                          }
                        }}
                />
              </div>
                  </div>

                  {/* Liste des pays filtrés */}
                  <div className="max-h-[300px] overflow-y-auto">
                    {filteredCountries.length === 0 ? (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        Aucun pays trouvé
                      </div>
                    ) : (
                      filteredCountries.map((country) => (
                        <SelectItem key={country.alpha2Code} value={country.alpha2Code}>
                          <div className="flex items-center gap-2">
                            <img
                              src={country.flag}
                              alt={country.name}
                              className="w-6 h-4 object-cover rounded"
                            />
                            <span>{country.translations.fr || country.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </div>
                </SelectContent>
              </Select>
              {form.formState.errors.country && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.country.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="city" className="text-sm font-medium text-gray-700 mb-2 block">
                Ville de résidence *
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="city"
                  {...form.register("city")}
                  className="pl-10 h-12"
                  placeholder="Ex: Abidjan, Paris, Dakar..."
                />
              </div>
              {form.formState.errors.city && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.city.message}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Statut professionnel *
              </Label>
              <Select
                onValueChange={(value) =>
                  form.setValue("professionalStatus", value)
                }
              >
                <SelectTrigger className="h-12">
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
                    <SelectValue placeholder="Sélectionner votre statut professionnel" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Etudiant(e)">Etudiant(e)</SelectItem>
                  <SelectItem value="Employé du privé">Employé du privé</SelectItem>
                  <SelectItem value="Fonctionnaire">Fonctionnaire</SelectItem>
                  <SelectItem value="Fonction libérale">Fonction libérale</SelectItem>
                  <SelectItem value="Chef d'entreprise">Chef d'entreprise</SelectItem>
                  <SelectItem value="Auto-entrepreneur">Auto-entrepreneur</SelectItem>
                  <SelectItem value="Activité génératrice de revenus">Activité génératrice de revenus</SelectItem>
                  <SelectItem value="Sans emploi ou activité">Sans emploi ou activité</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.professionalStatus && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.professionalStatus.message}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 max-h-96 overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Culture d'épargne actuelle
            </h3>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Quel est approximativement, le plus grand montant que vous avez déjà épargné et conservé pendant plus de 3 mois? *
              </Label>
              <Textarea
                {...form.register("maxSavingsAmount")}
                className="min-h-[100px]"
                placeholder="Décrivez le montant et la période..."
                rows={2}
              />
              {form.formState.errors.maxSavingsAmount && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.maxSavingsAmount.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Quelle est votre habitude d'épargne? *
              </Label>
              <Select
                onValueChange={(value) =>
                  form.setValue("savingsHabit", value)
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionner votre habitude d'épargne" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Je n'ai jamais réussi à épargner réellement">Je n'ai jamais réussi à épargner réellement</SelectItem>
                  <SelectItem value="J'épargne de temps en temps, mais je réutilise l'argent moins de 3 mois après">J'épargne de temps en temps, mais je réutilise l'argent moins de 3 mois après</SelectItem>
                  <SelectItem value="J'ai une épargne constituée que j'accrois depuis au moins six mois">J'ai une épargne constituée que j'accrois depuis au moins six mois</SelectItem>
                  <SelectItem value="L'épargne est devenue une habitude pour moi">L'épargne est devenue une habitude pour moi</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.savingsHabit && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.savingsHabit.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                A combien s'élève actuellement votre épargne *
              </Label>
              <Select
                onValueChange={(value) =>
                  form.setValue("currentSavingsLevel", value)
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionner le niveau de votre épargne" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aucune">Aucune</SelectItem>
                  <SelectItem value="Aucune épargne et endetté">Aucune épargne et endetté</SelectItem>
                  <SelectItem value="Moins de 25 000 FCFA">Moins de 25 000 FCFA</SelectItem>
                  <SelectItem value="Entre 26 000 FCFA et 100 000 FCFA">Entre 26 000 FCFA et 100 000 FCFA</SelectItem>
                  <SelectItem value="Entre 101 000 et 300 000 FCFA">Entre 101 000 et 300 000 FCFA</SelectItem>
                  <SelectItem value="Entre 301 000 et 500 000 FCFA">Entre 301 000 et 500 000 FCFA</SelectItem>
                  <SelectItem value="Entre 501 000 et 1 000 000 FCFA">Entre 501 000 et 1 000 000 FCFA</SelectItem>
                  <SelectItem value="Entre 1 001 000 et 5 000 000 FCFA">Entre 1 001 000 et 5 000 000 FCFA</SelectItem>
                  <SelectItem value="Plus de 5 000 000 FCFA">Plus de 5 000 000 FCFA</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.currentSavingsLevel && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.currentSavingsLevel.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Si vous avez déjà épargné, que faites-vous de l'argent épargné ensuite? *
              </Label>
              <Select
                onValueChange={(value) =>
                  form.setValue("savingsUsage", value)
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionner l'usage de votre épargne" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rien, je le conserve sur mon compte d'épargne">Rien, je le conserve sur mon compte d'épargne</SelectItem>
                  <SelectItem value="Je l'utilise pour financer mes besoins personnels">Je l'utilise pour financer mes besoins personnels</SelectItem>
                  <SelectItem value="Je l'utilise pour régler des urgences en famille ou personnelles">Je l'utilise pour régler des urgences en famille ou personnelles</SelectItem>
                  <SelectItem value="Je l'investis dans des projets qui m'ont rapporté plus d'argent">Je l'investis dans des projets qui m'ont rapporté plus d'argent</SelectItem>
                  <SelectItem value="Je le réinvestis sur les marchés financiers">Je le réinvestis sur les marchés financiers</SelectItem>
                  <SelectItem value="J'épargne toujours pour un but, donc j'utilise l'argent dans ce sens">J'épargne toujours pour un but, donc j'utilise l'argent dans ce sens</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.savingsUsage && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.savingsUsage.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Quel est votre défi majeur en matière d'épargne? *
              </Label>
              <Textarea
                {...form.register("savingsChallenge")}
                className="min-h-[120px]"
                placeholder="Décrivez votre principal défi en matière d'épargne..."
                rows={3}
              />
              {form.formState.errors.savingsChallenge && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.savingsChallenge.message}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 max-h-96 overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sur le challenge épargne
            </h3>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Avez-vous déjà participé à un challenge d'épargne? *
              </Label>
              <Select
                onValueChange={(value) =>
                  form.setValue("previousChallengeExperience", value)
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionner votre expérience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oui">Oui</SelectItem>
                  <SelectItem value="Non">Non</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.previousChallengeExperience && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.previousChallengeExperience.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Quelle est la motivation qui vous pousse à participer au challenge d'épargne "6 mois c'est 6 mois"? *
              </Label>
              <Textarea
                {...form.register("motivation")}
                className="min-h-[120px]"
                placeholder="Décrivez votre motivation..."
                rows={3}
              />
              {form.formState.errors.motivation && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.motivation.message}
                </p>
              )}
            </div>

            <div>
              <SubscriptionPlanSelector
                selectedPlan={
                  form.watch("challengeMode") as SubscriptionPlan
                }
                onPlanChange={(plan) =>
                  form.setValue("challengeMode", plan)
                }
                disabled={isLoading}
              />
              {form.formState.errors.challengeMode && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.challengeMode.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Avez-vous déjà un compte chez ces partenaires en Côte d'Ivoire? *
              </Label>
              <Select
                onValueChange={(value) =>
                  form.setValue("partnerAccounts", value)
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionner vos comptes existants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADEC">ADEC (Compte épargne)</SelectItem>
                  <SelectItem value="NSIA">NSIA ASSET MANAGEMENT (Compte FCP)</SelectItem>
                  <SelectItem value="Aucun">Aucun</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.partnerAccounts && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.partnerAccounts.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Avez-vous déjà suivi vos dépenses et entrées, en les enregistrant manuellement ou via une application, durant un mois ou plus? *
              </Label>
              <Select
                onValueChange={(value) =>
                  form.setValue("expenseTracking", value)
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionner votre expérience de suivi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oui, manuellement dans un cahier">Oui, manuellement dans un cahier</SelectItem>
                  <SelectItem value="Oui, sur une plateforme ou application en ligne">Oui, sur une plateforme ou application en ligne</SelectItem>
                  <SelectItem value="Je l'ai fait mais durant moins d'un mois">Je l'ai fait mais durant moins d'un mois</SelectItem>
                  <SelectItem value="Je ne l'ai jamais fait">Je ne l'ai jamais fait</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.expenseTracking && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.expenseTracking.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Si vous réussissez le challenge, qu'est-ce qui vous intéressera dans la suite? *
              </Label>
              <Select
                onValueChange={(value) =>
                  form.setValue("futureInterest", value)
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionner vos intérêts futurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Continuer le challenge encore pour 6 mois">Continuer le challenge encore pour 6 mois</SelectItem>
                  <SelectItem value="Adhérer au Plan Épargne pour continuer à épargner sur trois ans">Adhérer au Plan Épargne pour continuer à épargner sur trois ans</SelectItem>
                  <SelectItem value="Rentabiliser mon épargne sur la bourse ou les fonds communs de placement">Rentabiliser mon épargne sur la bourse ou les fonds communs de placement</SelectItem>
                  <SelectItem value="Je ne sais pas encore ce que je ferai de mon épargne">Je ne sais pas encore ce que je ferai de mon épargne</SelectItem>
                  <SelectItem value="Conserver mon épargne sur le compte">Conserver mon épargne sur le compte</SelectItem>
                  <SelectItem value="Utiliser mon épargne pour mes besoins ou projets">Utiliser mon épargne pour mes besoins ou projets</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.futureInterest && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.futureInterest.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Avez-vous des préoccupations en particulier? *
              </Label>
              <Textarea
                {...form.register("concerns")}
                className="min-h-[120px]"
                placeholder="Décrivez vos préoccupations concernant le challenge..."
                rows={3}
              />
              {form.formState.errors.concerns && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.concerns.message}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="challengeStartMonth" className="text-sm font-medium text-gray-700 mb-2 block">
                Mois de départ du challenge (6 mois) *
              </Label>
              <Select
                onValueChange={(value) =>
                  form.setValue("challengeStartMonth", value)
                }
              >
                <SelectTrigger className="h-12">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <SelectValue placeholder="Sélectionner le mois de départ" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {generateMonthOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.challengeStartMonth && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.challengeStartMonth.message}
                </p>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">
                🎯 Finalisation de votre inscription
              </h3>
              <p className="text-green-800 text-sm">
                Votre inscription sera soumise pour validation. Vous recevrez un email avec vos accès une fois votre demande approuvée par notre équipe dans un délai de 24-48h.
              </p>
              <p className="text-green-700 text-xs mt-2">
                <strong>Contact :</strong> +225 07 06 49 49 16 | financeendogene@gmail.com
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à l'accueil</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <img src={logoApp} alt="Logo" className="w-20 h-20" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar avec informations */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="sticky top-8"
            >
              <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold mb-2">
                    Rejoignez le Challenge d'Épargne
                  </CardTitle>
                  <p className="text-white/90 text-sm">
                    Transformez votre relation à l'argent en 6 mois
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Étapes */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Processus d'inscription</h3>
                    {steps.map((step, index) => (
                      <div key={step.number} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          currentStep > index ? 'bg-white text-primary' : 
                          currentStep === index ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70'
                        }`}>
                          {step.number}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            currentStep >= index ? 'text-white' : 'text-white/70'
                          }`}>
                            {step.title}
                          </p>
                          <p className={`text-xs ${
                            currentStep >= index ? 'text-white/80' : 'text-white/50'
                          }`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Avantages */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Avantages inclus</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <benefit.icon className="w-4 h-4 text-white/80" />
                          <span className="text-xs text-white/90">{benefit.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques */}
              <Card className="mt-6 bg-white shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Rejoignez la communauté</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">1,247+</div>
                      <div className="text-xs text-gray-600">Inscrits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">78%</div>
                      <div className="text-xs text-gray-600">Réussite</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">89+</div>
                      <div className="text-xs text-gray-600">Challenges</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">4.8/5</div>
                      <div className="text-xs text-gray-600">Satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Formulaire principal */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white shadow-xl border-0">
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                    Inscription au Challenge d'Épargne
                  </CardTitle>
                  <p className="text-gray-600">
                    Étape {currentStep} sur 6 - {steps[currentStep - 1]?.title}
                  </p>
                  
                  {/* Barre de progression */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-6">
                    <div 
                      className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(currentStep / 6) * 100}%` }}
                    />
                  </div>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    {renderStepContent()}

                    {/* Boutons de navigation */}
                    <div className="flex justify-between mt-8 pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="flex items-center space-x-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Précédent</span>
                      </Button>

                      {currentStep < 6 ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        >
                          <span>Suivant</span>
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Inscription...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Finaliser l'inscription</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de réponse API */}
      <AnimatePresence>
        {showResponseModal && apiResponse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                {/* En-tête */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Inscription réussie !
                      </h2>
                      <p className="text-sm text-gray-600">
                        Votre compte a été créé avec succès
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseResponseModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Message de l'API */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-green-800 font-medium">
                        {Array.isArray(apiResponse.message)
                          ? apiResponse.message.join(" \n ")
                          : apiResponse.message || "Inscription réussie ! Vérifiez votre email pour activer votre compte."}
                        </p>
                    </div>
                  </div>
                </div>

                {/* Détails de l'utilisateur créé */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Détails de votre compte
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nom complet</label>
                        <p className="text-gray-900">
                          {apiResponse.user.firstName} {apiResponse.user.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="text-gray-900">{apiResponse.user.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Téléphone</label>
                        <p className="text-gray-900">{apiResponse.user.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Pays</label>
                        <p className="text-gray-900">{apiResponse.user.country}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Ville</label>
                        <p className="text-gray-900">{apiResponse.user.city}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Mode de challenge</label>
                        <p className="text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            apiResponse.user.challengeMode === 'PREMIUM' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {apiResponse.user.challengeFormula}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Statut</label>
                        <p className="text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            apiResponse.user.isVerified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {apiResponse.user.isVerified ? 'Vérifié' : 'En attente de vérification'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Date de création</label>
                        <p className="text-gray-900">
                          {new Date(apiResponse.user.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleCloseResponseModal}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Parfait, j'ai compris
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
