import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  X,
  Mail,
  Phone,
  User, Calendar,
  Loader2,
  MapPin,
  Briefcase,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SubscriptionPlan } from "@/types/subscription";
import SubscriptionPlanSelector from "@/components/auth/SubscriptionPlanSelector";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import type { RegisterResponse } from "@/lib/apiComponent/hooks/useAuth";

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

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExtendedRegisterData = {
  firstName: string;
  lastName: string;
  gender: "masculin" | "feminin";
  ageRange: string;
  whatsapp: string;
  email: string;
  country: string;
  city: string;
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

export function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  const [step, setStep] = useState(1);
  const { registerWithPlan } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<RegisterResponse | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);

  const handleCloseResponseModal = () => {
    setShowResponseModal(false);
    setApiResponse(null);
    onClose();
    setStep(1);
    form.reset();
  };

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

  const onSubmit = async (data: ExtendedRegisterData) => {
    try {
      setIsLoading(true);
      
      // DEBUG: Vérification de l'état du formulaire
      console.log('🎯 DEBUG - État du formulaire avant soumission:');
      console.log('📋 Étape actuelle:', step);
      console.log('✅ Formulaire valide:', form.formState.isValid);
      console.log('❌ Erreurs du formulaire:', form.formState.errors);
      console.log('🔄 Formulaire en cours de soumission:', form.formState.isSubmitting);

      // DEBUG: Log détaillé des données reçues du formulaire
      console.log('🔍 DEBUG - Données reçues du formulaire:');
      console.log('📋 Toutes les données:', data);
      console.log('📊 Nombre de champs:', Object.keys(data).length);
      
      // DEBUG: Log par étape
      console.log('📝 Step 1 - Informations personnelles:');
      console.log('  - firstName:', data.firstName);
      console.log('  - lastName:', data.lastName);
      console.log('  - gender:', data.gender);
      console.log('  - ageRange:', data.ageRange);
      
      console.log('📝 Step 2 - Contact et localisation:');
      console.log('  - whatsapp:', data.whatsapp);
      console.log('  - email:', data.email);
      console.log('  - country:', data.country);
      console.log('  - city:', data.city);
      
      console.log('📝 Step 3 - Situation professionnelle:');
      console.log('  - professionalStatus:', data.professionalStatus);
      
      console.log('📝 Step 4 - Culture d\'épargne:');
      console.log('  - maxSavingsAmount:', data.maxSavingsAmount);
      console.log('  - savingsHabit:', data.savingsHabit);
      console.log('  - currentSavingsLevel:', data.currentSavingsLevel);
      console.log('  - savingsUsage:', data.savingsUsage);
      console.log('  - savingsChallenge:', data.savingsChallenge);
      
      console.log('📝 Step 5 - Challenge épargne:');
      console.log('  - previousChallengeExperience:', data.previousChallengeExperience);
      console.log('  - motivation:', data.motivation);
      console.log('  - challengeMode:', data.challengeMode);
      console.log('  - partnerAccounts:', data.partnerAccounts);
      console.log('  - expenseTracking:', data.expenseTracking);
      console.log('  - futureInterest:', data.futureInterest);
      console.log('  - concerns:', data.concerns);
      
      console.log('📝 Step 6 - Configuration:');
      console.log('  - challengeStartMonth:', data.challengeStartMonth);

      // Préparer les données pour l'API
      const registerData = {
        // Informations personnelles
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        ageRange: data.ageRange,

        // Contact et localisation
        phone: data.whatsapp,
        username: data.firstName.toLowerCase() + data.lastName.toLowerCase(), // Générer un username
        country: data.country,
        city: data.city,
        whatsapp: data.whatsapp,

        // Situation professionnelle
        professionalStatus: data.professionalStatus,

        // Culture d'épargne actuelle
        maxSavingsAmount: data.maxSavingsAmount,
        savingsHabit: data.savingsHabit,
        currentSavingsLevel: data.currentSavingsLevel,
        savingsUsage: data.savingsUsage,
        savingsChallenge: data.savingsChallenge,

        // Sur le challenge épargne
        previousChallengeExperience: data.previousChallengeExperience,
        motivation: data.motivation,
        challengeMode: data.challengeMode as SubscriptionPlan,
        challengeFormula: data.challengeMode === "FREE" ? "Classique" : "Premium", // Automatiquement défini selon le plan
        partnerAccounts: data.partnerAccounts,
        expenseTracking: data.expenseTracking,
        futureInterest: data.futureInterest,
        concerns: data.concerns,

        // Configuration du compte
        challengeStartMonth: data.challengeStartMonth,
      };

      // DEBUG: Log des données transformées pour l'API
      console.log('🚀 DEBUG - Données transformées pour l\'API:');
      console.log('📤 Données complètes envoyées:', registerData);
      console.log('📊 Nombre de champs API:', Object.keys(registerData).length);
      
      // DEBUG: Vérification des champs générés
      console.log('🔧 Champs générés automatiquement:');
      console.log('  - username généré:', registerData.username);
      console.log('  - challengeFormula dérivé:', registerData.challengeFormula);
      console.log('  - phone (copie de whatsapp):', registerData.phone);
      
      // DEBUG: Vérification des champs critiques
      console.log('⚠️ Vérification des champs critiques:');
      console.log('  - Email valide:', data.email ? '✅' : '❌');
      console.log('  - Nom complet:', data.firstName && data.lastName ? '✅' : '❌');
      console.log('  - Mode challenge:', data.challengeMode ? '✅' : '❌');
      console.log('  - Téléphone:', data.whatsapp ? '✅' : '❌');
      
      // Vérification que tous les champs sont bien mappés :
      // ✅ firstName, lastName, gender, ageRange (Step 1)
      // ✅ whatsapp, email, country, city (Step 2) 
      // ✅ professionalStatus (Step 3)
      // ✅ maxSavingsAmount, savingsHabit, currentSavingsLevel, savingsUsage, savingsChallenge (Step 4)
      // ✅ previousChallengeExperience, motivation, challengeMode, partnerAccounts, expenseTracking, futureInterest, concerns (Step 5)
      // ✅ challengeStartMonth (Step 6)
      // ✅ username (généré automatiquement)
      // ✅ challengeFormula (dérivé de challengeMode)

      // Appel à l'API d'inscription
      const response = await registerWithPlan(registerData);

      // L'apiClient extrait déjà les données, donc response contient directement { user, message, errors }
      console.log('Registration response:', response);

      // Stocker la réponse et afficher le modal de réponse
      setApiResponse(response);
      setShowResponseModal(true);
      
      // Ne pas fermer le modal principal, juste afficher la réponse
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

    if (step === 1) {
      fieldsToValidate = ["firstName", "lastName", "gender", "ageRange"];
    } else if (step === 2) {
      fieldsToValidate = ["whatsapp", "email", "country", "city"];
    } else if (step === 3) {
      fieldsToValidate = ["professionalStatus"];
    } else if (step === 4) {
      fieldsToValidate = [
        "maxSavingsAmount",
        "savingsHabit",
        "currentSavingsLevel",
        "savingsUsage",
        "savingsChallenge",
      ];
    } else if (step === 5) {
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
    if (isValid && step < 6) {
      setStep(step + 1);
    }
  };

  const previousStep = () => {
    if (step > 1) {
      setStep(step - 1);
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
              <h2 className="text-xl font-bold text-white">
                {step === 1 && "Informations personnelles"}
                {step === 2 && "Contact et localisation"}
                {step === 3 && "Situation professionnelle"}
                {step === 4 && "Culture d'épargne actuelle"}
                {step === 5 && "Sur le challenge épargne"}
                {step === 6 && "Configuration du compte"}
              </h2>
              <p className="text-white/90 text-sm mt-1">
                Challenge Épargne 6 mois - Étape {step} sur 6
              </p>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Step Indicator */}
              <div className="flex space-x-1 mt-4">
                <div
                  className={`h-2 flex-1 rounded-full transition-all ${
                    step >= 1 ? "bg-white" : "bg-white/30"
                  }`}
                />
                <div
                  className={`h-2 flex-1 rounded-full transition-all ${
                    step >= 2 ? "bg-white" : "bg-white/30"
                  }`}
                />
                <div
                  className={`h-2 flex-1 rounded-full transition-all ${
                    step >= 3 ? "bg-white" : "bg-white/30"
                  }`}
                />
                <div
                  className={`h-2 flex-1 rounded-full transition-all ${
                    step >= 4 ? "bg-white" : "bg-white/30"
                  }`}
                />
                <div
                  className={`h-2 flex-1 rounded-full transition-all ${
                    step >= 5 ? "bg-white" : "bg-white/30"
                  }`}
                />
                <div
                  className={`h-2 flex-1 rounded-full transition-all ${
                    step >= 6 ? "bg-white" : "bg-white/30"
                  }`}
                />
              </div>
            </div>

            {/* Introduction */}
            {step === 1 && (
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Bienvenue au Challenge Épargne 6 mois !
                </h3>
                <p className="text-sm text-gray-600">
                  Afin de prendre en compte vos besoins pour une expérience
                  optimale, nous vous proposons de remplir ce formulaire
                  d'intérêt. Le remplissage vous prendra moins de 4 minutes.
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Informations personnelles */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {/* Prénom */}
                      <div>
                        <Label
                          htmlFor="firstName"
                          className="text-sm font-medium text-gray-700"
                        >
                          Prénom *
                        </Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="firstName"
                            {...form.register("firstName")}
                            className="pl-10"
                            placeholder="Prénom"
                          />
                        </div>
                        {form.formState.errors.firstName && (
                          <p className="text-red-500 text-xs mt-1">
                            {form.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>

                      {/* Nom */}
                      <div>
                        <Label
                          htmlFor="lastName"
                          className="text-sm font-medium text-gray-700"
                        >
                          Nom *
                        </Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="lastName"
                            {...form.register("lastName")}
                            className="pl-10"
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

                    {/* Genre */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Genre *
                      </Label>
                      <Select
                        onValueChange={(value: "masculin" | "feminin") =>
                          form.setValue("gender", value)
                        }
                      >
                        <SelectTrigger className="w-full mt-1">
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

                    {/* Tranche d'âge */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Tranche d'âge *
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          form.setValue("ageRange", value)
                        }
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Sélectionner votre tranche d'âge" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="moins-18">
                            Moins de 18 ans
                          </SelectItem>
                          <SelectItem value="18-24">18 - 24 ans</SelectItem>
                          <SelectItem value="25-30">25 - 30 ans</SelectItem>
                          <SelectItem value="31-35">31 - 35 ans</SelectItem>
                          <SelectItem value="36-45">36 - 45 ans</SelectItem>
                          <SelectItem value="45-55">45 - 55 ans</SelectItem>
                          <SelectItem value="plus-55">
                            Plus de 55 ans
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.ageRange && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.ageRange.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="button"
                      onClick={nextStep}
                      className="w-full mt-6"
                    >
                      Continuer
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Contact et localisation */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Contact WhatsApp */}
                    <div>
                      <Label
                        htmlFor="whatsapp"
                        className="text-sm font-medium text-gray-700"
                      >
                        Contact WhatsApp (sans indicatif) *
                      </Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="whatsapp"
                          {...form.register("whatsapp")}
                          className="pl-10"
                          placeholder="Ex: 07 06 49 49 16"
                        />
                      </div>
                      {form.formState.errors.whatsapp && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.whatsapp.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700"
                      >
                        Adresse e-mail *
                      </Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          {...form.register("email")}
                          className="pl-10"
                          placeholder="financeendogene@gmail.com"
                        />
                      </div>
                      {form.formState.errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Pays de résidence */}
                    <div>
                      <Label
                        htmlFor="country"
                        className="text-sm font-medium text-gray-700"
                      >
                        Pays de résidence *
                      </Label>
                      <div className="relative mt-1">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="country"
                          {...form.register("country")}
                          className="pl-10"
                          placeholder="Ex: Côte d'Ivoire, France, Sénégal..."
                        />
                      </div>
                      {form.formState.errors.country && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.country.message}
                        </p>
                      )}
                    </div>

                    {/* Ville de résidence */}
                    <div>
                      <Label
                        htmlFor="city"
                        className="text-sm font-medium text-gray-700"
                      >
                        Ville de résidence *
                      </Label>
                      <div className="relative mt-1">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="city"
                          {...form.register("city")}
                          className="pl-10"
                          placeholder="Ex: Abidjan, Paris, Dakar..."
                        />
                      </div>
                      {form.formState.errors.city && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.city.message}
                        </p>
                      )}
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h3 className="font-medium text-amber-900 mb-2">
                        📞 Besoin d'aide ?
                      </h3>
                      <p className="text-amber-800 text-sm">
                        En cas de doute, contactez-nous au{" "}
                        <strong>+225 07 06 49 49 16</strong> ou par email à{" "}
                        <strong>financeendogene@gmail.com</strong>
                      </p>
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={previousStep}
                        className="flex-1"
                      >
                        Retour
                      </Button>
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="flex-1"
                      >
                        Continuer
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Situation professionnelle */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Statut professionnel */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Statut professionnel *
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          form.setValue("professionalStatus", value)
                        }
                      >
                        <SelectTrigger className="w-full mt-1">
                          <div className="flex items-center">
                            <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
                            <SelectValue placeholder="Sélectionner votre statut professionnel" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="etudiant">Étudiant(e)</SelectItem>
                          <SelectItem value="employe-prive">
                            Employé du privé
                          </SelectItem>
                          <SelectItem value="fonctionnaire">
                            Fonctionnaire
                          </SelectItem>
                          <SelectItem value="fonction-liberale">
                            Fonction libérale
                          </SelectItem>
                          <SelectItem value="chef-entreprise">
                            Chef d'entreprise (Entreprise déclarée avec des
                            employés à charge)
                          </SelectItem>
                          <SelectItem value="auto-entrepreneur">
                            Auto-entrepreneur (Entreprise déclarée sans
                            employés)
                          </SelectItem>
                          <SelectItem value="activite-revenus">
                            Activité génératrice de revenus (Entreprise non
                            déclarée)
                          </SelectItem>
                          <SelectItem value="sans-emploi">
                            Sans emploi ou activité
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.professionalStatus && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.professionalStatus.message}
                        </p>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-900 mb-2">
                        Information importante
                      </h3>
                      <p className="text-blue-800 text-sm">
                        Cette information nous aide à personnaliser votre
                        expérience Challenge d'Épargne selon votre situation
                        professionnelle.
                      </p>
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={previousStep}
                        className="flex-1"
                      >
                        Retour
                      </Button>
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="flex-1"
                      >
                        Continuer
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Culture d'épargne actuelle */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4 max-h-96 overflow-y-auto"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Culture d'épargne actuelle
                    </h3>

                    {/* Plus grand montant épargné */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Quel est approximativement, le plus grand montant que
                        vous avez déjà épargné et conservé pendant plus de 3
                        mois? *
                      </Label>
                      <Textarea
                        {...form.register("maxSavingsAmount")}
                        className="mt-1"
                        placeholder="Décrivez le montant et la période..."
                        rows={2}
                      />
                      {form.formState.errors.maxSavingsAmount && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.maxSavingsAmount.message}
                        </p>
                      )}
                    </div>

                    {/* Habitude d'épargne */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Quelle est votre habitude d'épargne? *
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          form.setValue("savingsHabit", value)
                        }
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Sélectionner votre habitude d'épargne" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jamais-reussi">
                            Je n'ai jamais réussi à épargner réellement
                          </SelectItem>
                          <SelectItem value="temps-en-temps">
                            J'épargne de temps en temps, mais je réutilise
                            l'argent moins de 3 mois après
                          </SelectItem>
                          <SelectItem value="epargne-constituee">
                            J'ai une épargne constituée que j'accrois depuis au
                            moins six mois
                          </SelectItem>
                          <SelectItem value="habitude">
                            L'épargne est devenue une habitude pour moi
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.savingsHabit && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.savingsHabit.message}
                        </p>
                      )}
                    </div>

                    {/* Niveau d'épargne actuel */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        A combien s'élève actuellement votre épargne *
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          form.setValue("currentSavingsLevel", value)
                        }
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Sélectionner le niveau de votre épargne" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aucune">Aucune</SelectItem>
                          <SelectItem value="endette">
                            Aucune épargne et endetté
                          </SelectItem>
                          <SelectItem value="moins-25k">
                            Moins de 25 000 FCFA
                          </SelectItem>
                          <SelectItem value="26k-100k">
                            Entre 26 000 FCFA et 100 000 FCFA
                          </SelectItem>
                          <SelectItem value="101k-300k">
                            Entre 101 000 et 300 000 FCFA
                          </SelectItem>
                          <SelectItem value="301k-500k">
                            Entre 301 000 et 500 000 FCFA
                          </SelectItem>
                          <SelectItem value="501k-1m">
                            Entre 501 000 et 1 000 000 FCFA
                          </SelectItem>
                          <SelectItem value="1m-5m">
                            Entre 1 001 000 et 5 000 000 FCFA
                          </SelectItem>
                          <SelectItem value="plus-5m">
                            Plus de 5 000 000 FCFA
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.currentSavingsLevel && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.currentSavingsLevel.message}
                        </p>
                      )}
                    </div>

                    {/* Usage de l'épargne */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Si vous avez déjà épargné, que faites-vous de l'argent
                        épargné ensuite? *
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          form.setValue("savingsUsage", value)
                        }
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Sélectionner l'usage de votre épargne" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conserver">
                            Rien, je le conserve sur mon compte d'épargne
                          </SelectItem>
                          <SelectItem value="besoins-personnels">
                            Je l'utilise pour financer mes besoins personnels
                            (formation, achat de biens, caution de maison...)
                          </SelectItem>
                          <SelectItem value="urgences">
                            Je l'utilise pour régler des urgences en famille ou
                            personnelles
                          </SelectItem>
                          <SelectItem value="projets-rentables">
                            Je l'investis dans des projets qui m'ont rapporté
                            plus d'argent
                          </SelectItem>
                          <SelectItem value="marches-financiers">
                            Je le réinvestis sur les marchés financiers
                          </SelectItem>
                          <SelectItem value="objectif-precis">
                            J'épargne toujours pour un but, donc j'utilise
                            l'argent dans ce sens
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.savingsUsage && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.savingsUsage.message}
                        </p>
                      )}
                    </div>

                    {/* Défi d'épargne */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Quel est votre défi majeur en matière d'épargne? *
                      </Label>
                      <Textarea
                        {...form.register("savingsChallenge")}
                        className="mt-1"
                        placeholder="Décrivez votre principal défi en matière d'épargne..."
                        rows={3}
                      />
                      {form.formState.errors.savingsChallenge && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.savingsChallenge.message}
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={previousStep}
                        className="flex-1"
                      >
                        Retour
                      </Button>
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="flex-1"
                      >
                        Continuer
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Sur le challenge épargne */}
                {step === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4 max-h-96 overflow-y-auto"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Sur le challenge épargne
                    </h3>

                    {/* Expérience précédente */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Avez-vous déjà participé à un challenge d'épargne? *
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          form.setValue("previousChallengeExperience", value)
                        }
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Sélectionner votre expérience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oui">Oui</SelectItem>
                          <SelectItem value="non">Non</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.previousChallengeExperience && (
                        <p className="text-red-500 text-xs mt-1">
                          {
                            form.formState.errors.previousChallengeExperience
                              .message
                          }
                        </p>
                      )}
                    </div>

                    {/* Motivation */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Quelle est la motivation qui vous pousse à participer au
                        challenge d'épargne "6 mois c'est 6 mois"? *
                      </Label>
                      <Textarea
                        {...form.register("motivation")}
                        className="mt-1"
                        placeholder="Décrivez votre motivation..."
                        rows={3}
                      />
                      {form.formState.errors.motivation && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.motivation.message}
                        </p>
                      )}
                    </div>

                    {/* Sélection du plan d'abonnement */}
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


                    {/* Comptes partenaires */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Avez-vous déjà un compte chez ces partenaires en Côte
                        d'Ivoire? *
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          form.setValue("partnerAccounts", value)
                        }
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Sélectionner vos comptes existants" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adec">
                            ADEC (Compte épargne)
                          </SelectItem>
                          <SelectItem value="nsia">
                            NSIA ASSET MANAGEMENT (Compte FCP)
                          </SelectItem>
                          <SelectItem value="aucun">Aucun</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.partnerAccounts && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.partnerAccounts.message}
                        </p>
                      )}
                    </div>

                    {/* Suivi des dépenses */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Avez-vous déjà suivi vos dépenses et entrées, en les
                        enregistrant manuellement ou via une application, durant
                        un mois ou plus? *
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          form.setValue("expenseTracking", value)
                        }
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Sélectionner votre expérience de suivi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oui-manuel">
                            Oui, manuellement dans un cahier
                          </SelectItem>
                          <SelectItem value="oui-application">
                            Oui, sur une plateforme ou application en ligne
                          </SelectItem>
                          <SelectItem value="moins-un-mois">
                            Je l'ai fait mais durant moins d'un mois
                          </SelectItem>
                          <SelectItem value="jamais">
                            Je ne l'ai jamais fait
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.expenseTracking && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.expenseTracking.message}
                        </p>
                      )}
                    </div>

                    {/* Intérêts futurs */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Si vous réussissez le challenge, qu'est-ce qui vous intéressera dans la suite? *
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          form.setValue("futureInterest", value)
                        }
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Sélectionner vos intérêts futurs" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="continuer-6-mois">Continuer le challenge encore pour 6 mois, et avoir constitué une épargne sur un an</SelectItem>
                          <SelectItem value="plan-epargne">Adhérer au Plan Épargne pour continuer à épargner sur trois ans</SelectItem>
                          <SelectItem value="bourse-fcp">Rentabiliser mon épargne sur la bourse ou les fonds communs de placement</SelectItem>
                          <SelectItem value="pas-sur">Je ne sais pas encore ce que je ferai de mon épargne ou de la suite</SelectItem>
                          <SelectItem value="conserver">Conserver mon épargne sur le compte</SelectItem>
                          <SelectItem value="utiliser-projets">Utiliser mon épargne pour mes besoins ou projets</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.futureInterest && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.futureInterest.message}
                        </p>
                      )}
                    </div>

                    {/* Préoccupations */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Avez-vous des préoccupations en particulier? *
                      </Label>
                      <Textarea
                        {...form.register("concerns")}
                        className="mt-1"
                        placeholder="Décrivez vos préoccupations concernant le challenge..."
                        rows={3}
                      />
                      {form.formState.errors.concerns && (
                        <p className="text-red-500 text-xs mt-1">
                          {form.formState.errors.concerns.message}
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={previousStep}
                        className="flex-1"
                      >
                        Retour
                      </Button>
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="flex-1"
                      >
                        Continuer
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 6: Configuration du compte */}
                {step === 6 && (
                  <motion.div
                    key="step6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >

                    {/* Challenge Start Month */}
                    <div>
                      <Label
                        htmlFor="challengeStartMonth"
                        className="text-sm font-medium text-gray-700"
                      >
                        Mois de départ du challenge (6 mois) *
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          form.setValue("challengeStartMonth", value)
                        }
                      >
                        <SelectTrigger className="w-full mt-1">
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
                        Votre inscription sera soumise pour validation. Vous
                        recevrez un email avec vos accès une fois votre demande
                        approuvée par notre équipe dans un délai de 24-48h.
                      </p>
                      <p className="text-green-700 text-xs mt-2">
                        <strong>Contact :</strong> +225 07 06 49 49 16 |
                        financeendogene@gmail.com
                      </p>
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={previousStep}
                        className="flex-1"
                      >
                        Retour
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Inscription...
                          </>
                        ) : (
                          "Finaliser l'inscription"
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </motion.div>
      )}

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
                        {apiResponse.message || "Inscription réussie ! Vérifiez votre email pour activer votre compte."}
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
    </AnimatePresence>
  );
}
