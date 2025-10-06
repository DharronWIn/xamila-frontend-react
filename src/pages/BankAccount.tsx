import { useState } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  Building, 
  Shield, 
  Percent,
  CheckCircle,
  ArrowRight,
  Star,
  Award,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Bank {
  id: number;
  name: string;
  logo: string;
  rating: number;
  interestRate: number;
  features: string[];
  benefits: string[];
  requirements: string[];
  recommended?: boolean;
}

const partnerBanks: Bank[] = [
  {
    id: 1,
    name: "Banque Épargne Plus",
    logo: "🏦",
    rating: 4.8,
    interestRate: 2.5,
    features: ["Compte épargne rémunéré", "Application mobile", "Carte bancaire gratuite"],
    benefits: ["Ouverture en ligne rapide", "Frais réduits", "Support client dédié"],
    requirements: ["Âge minimum 18 ans", "Justificatif de revenus", "Pièce d'identité"],
    recommended: true
  },
  {
    id: 2,
    name: "Crédit Moderne",
    logo: "💳",
    rating: 4.6,
    interestRate: 2.1,
    features: ["Livret épargne", "Crédit facilité", "Assurance incluse"],
    benefits: ["Taux préférentiels", "Conseiller personnel", "Agences nombreuses"],
    requirements: ["Revenus réguliers", "Domiciliation possible", "Dossier complet"]
  },
  {
    id: 3,
    name: "Banque Digitale Pro",
    logo: "📱",
    rating: 4.4,
    interestRate: 1.8,
    features: ["100% digital", "Virements instantanés", "Notifications temps réel"],
    benefits: ["Frais transparents", "Interface intuitive", "Support 24h/7j"],
    requirements: ["Smartphone requis", "Email valide", "Signature électronique"]
  }
];

export default function BankAccount() {
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Ouverture de compte bancaire
          </h1>
          <p className="text-muted-foreground mt-1">
            Trouvez la banque partenaire idéale pour votre épargne
          </p>
        </div>
        <Badge variant="secondary" className="bg-gradient-success text-white">
          Partenaires officiels
        </Badge>
      </div>

      {/* Benefits Section */}
      <Card className="bg-gradient-hero border-0 shadow-glow text-white">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Pourquoi ouvrir un compte partenaire ?</h2>
            <p className="text-white/90">
              Bénéficiez d'avantages exclusifs et de conditions préférentielles
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-3 bg-white/20 rounded-full inline-block mb-3">
                <Percent className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Taux préférentiels</h3>
              <p className="text-white/80 text-sm">
                Bénéficiez de taux d'épargne avantageux
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-white/20 rounded-full inline-block mb-3">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Sécurité renforcée</h3>
              <p className="text-white/80 text-sm">
                Vos fonds sont protégés et garantis
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-white/20 rounded-full inline-block mb-3">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Support dédié</h3>
              <p className="text-white/80 text-sm">
                Accompagnement personnalisé pour votre épargne
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partner Banks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partnerBanks.map((bank, index) => (
          <motion.div
            key={bank.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card className={`border-0 shadow-lg hover:shadow-glow transition-all duration-300 h-full ${
              bank.recommended 
                ? "bg-gradient-success text-white" 
                : "bg-gradient-card"
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-3xl">{bank.logo}</div>
                  {bank.recommended && (
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Recommandé
                    </Badge>
                  )}
                </div>
                
                <CardTitle className={bank.recommended ? "text-white" : ""}>
                  {bank.name}
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {Array.from({length: 5}, (_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < Math.floor(bank.rating) 
                            ? bank.recommended ? "text-white fill-white" : "text-accent fill-accent"
                            : bank.recommended ? "text-white/40" : "text-muted-foreground"
                        }`} 
                      />
                    ))}
                  </div>
                  <span className={`text-sm ${bank.recommended ? "text-white/90" : "text-muted-foreground"}`}>
                    {bank.rating}/5
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="flex flex-col justify-between flex-1">
                <div>
                  <div className="mb-4">
                    <div className={`text-2xl font-bold ${bank.recommended ? "text-white" : "text-primary"}`}>
                      {bank.interestRate}%
                    </div>
                    <p className={`text-sm ${bank.recommended ? "text-white/80" : "text-muted-foreground"}`}>
                      Taux d'épargne annuel
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <h4 className={`font-medium mb-2 ${bank.recommended ? "text-white" : ""}`}>
                        Fonctionnalités
                      </h4>
                      <ul className="space-y-1">
                        {bank.features.map((feature, i) => (
                          <li key={i} className={`flex items-center text-sm ${
                            bank.recommended ? "text-white/90" : "text-muted-foreground"
                          }`}>
                            <CheckCircle className={`h-3 w-3 mr-2 ${
                              bank.recommended ? "text-white" : "text-primary"
                            }`} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className={`font-medium mb-2 ${bank.recommended ? "text-white" : ""}`}>
                        Avantages
                      </h4>
                      <ul className="space-y-1">
                        {bank.benefits.slice(0, 2).map((benefit, i) => (
                          <li key={i} className={`flex items-center text-sm ${
                            bank.recommended ? "text-white/90" : "text-muted-foreground"
                          }`}>
                            <CheckCircle className={`h-3 w-3 mr-2 ${
                              bank.recommended ? "text-white" : "text-primary"
                            }`} />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    variant={bank.recommended ? "secondary" : "premium"}
                    className="w-full"
                    onClick={() => {
                      setSelectedBank(bank);
                      setIsApplicationModalOpen(true);
                    }}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Ouvrir un compte
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className={`w-full ${
                      bank.recommended 
                        ? "text-white hover:bg-white/20" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    size="sm"
                  >
                    En savoir plus
                    <ArrowRight className="h-3 w-3 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Application Modal */}
      <Dialog open={isApplicationModalOpen} onOpenChange={setIsApplicationModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Demande d'ouverture de compte - {selectedBank?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedBank && <BankApplicationForm bank={selectedBank} />}
        </DialogContent>
      </Dialog>

      {/* FAQ Section */}
      <Card className="bg-gradient-card border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Questions fréquentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Combien de temps pour l'ouverture ?</h4>
              <p className="text-sm text-muted-foreground">
                Généralement entre 5 et 10 jours ouvrés selon la banque choisie.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Quels documents fournir ?</h4>
              <p className="text-sm text-muted-foreground">
                Pièce d'identité, justificatif de domicile et de revenus récents.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Y a-t-il des frais d'ouverture ?</h4>
              <p className="text-sm text-muted-foreground">
                Nos partenaires proposent l'ouverture gratuite pour les membres du challenge.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Puis-je changer de banque ?</h4>
              <p className="text-sm text-muted-foreground">
                Oui, vous pouvez changer à tout moment avec l'aide au transfert.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ad Placement */}
      <Card className="bg-gradient-accent border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <Building className="h-8 w-8 text-white mx-auto mb-3" />
          <h3 className="font-semibold text-white mb-2">Conseil personnalisé</h3>
          <p className="text-white/80 text-sm mb-4">
            Besoin d'aide pour choisir ? Nos experts vous accompagnent
          </p>
          <Button variant="secondary">
            <Phone className="h-4 w-4 mr-2" />
            Nous contacter
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Bank Application Form
interface BankApplicationFormProps {
  bank: Bank;
}

function BankApplicationForm({ bank }: BankApplicationFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    profession: "",
    monthlyIncome: "",
    accountType: "savings",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the application to the bank's API
    console.log("Bank application submitted:", formData);
    alert("Votre demande a été envoyée ! Vous recevrez un email de confirmation.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nom</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postalCode">Code postal</Label>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="profession">Profession</Label>
          <Input
            id="profession"
            value={formData.profession}
            onChange={(e) => setFormData({...formData, profession: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthlyIncome">Revenus mensuels</Label>
          <Input
            id="monthlyIncome"
            type="number"
            value={formData.monthlyIncome}
            onChange={(e) => setFormData({...formData, monthlyIncome: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountType">Type de compte</Label>
        <Select value={formData.accountType} onValueChange={(value) => setFormData({...formData, accountType: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="savings">Compte épargne</SelectItem>
            <SelectItem value="current">Compte courant</SelectItem>
            <SelectItem value="both">Les deux</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message (optionnel)</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          placeholder="Informations complémentaires..."
        />
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Documents requis pour {bank.name}:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          {bank.requirements.map((req, i) => (
            <li key={i} className="flex items-center">
              <CheckCircle className="h-3 w-3 mr-2 text-primary" />
              {req}
            </li>
          ))}
        </ul>
      </div>

      <Button type="submit" className="w-full" variant="premium">
        <ArrowRight className="h-4 w-4 mr-2" />
        Envoyer la demande
      </Button>
    </form>
  );
}