import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/apiComponent/hooks/useAuth';
import { SubscriptionPlan } from '@/types/subscription';

const RegistrationDebug = () => {
  const { registerWithPlan } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);

  const testData = {
    // Informations personnelles
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe",
    gender: "masculin" as const,
    ageRange: "25-34",
    
    // Contact et localisation
    phone: "+33123456789",
    country: "France",
    city: "Paris",
    
    // Situation professionnelle
    professionalStatus: "Salarié",
    
    // Culture d'épargne actuelle
    maxSavingsAmount: "50000",
    savingsHabit: "Mensuel",
    currentSavingsLevel: "Intermédiaire",
    savingsUsage: "Projets personnels",
    savingsChallenge: "Économiser pour un voyage",
    
    // Sur le challenge épargne
    previousChallengeExperience: "Non",
    motivation: "Améliorer mes finances",
    challengeMode: SubscriptionPlan.PREMIUM,
    challengeFormula: "Épargne libre",
    partnerAccounts: "Orange Money, MTN Money",
    expenseTracking: "Application mobile",
    futureInterest: "Investissement",
    concerns: "Discipline personnelle",
    
    // Configuration du compte
    challengeStartMonth: "2025-01",
  };

  const handleTestRegistration = async () => {
    try {
      setIsLoading(true);
      console.log('📤 Envoi des données de test:', testData);
      
      const response = await registerWithPlan(testData);
      
      console.log('📥 Réponse reçue:', response);
      setLastResponse(response);
      
    } catch (error) {
      console.error('❌ Erreur lors du test:', error);
      setLastResponse({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Test d'Inscription - Debug</span>
            <Badge variant="outline">Développement</Badge>
          </CardTitle>
          <CardDescription>
            Testez l'envoi de tous les champs du formulaire d'inscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleTestRegistration}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Test en cours..." : "Tester l'inscription complète"}
          </Button>
          
          {lastResponse && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Dernière réponse :</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
                {JSON.stringify(lastResponse, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Champs du Formulaire</CardTitle>
          <CardDescription>
            Liste de tous les champs qui seront envoyés à l'API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Informations personnelles</h4>
              <ul className="text-sm space-y-1">
                <li>• email: {testData.email}</li>
                <li>• firstName: {testData.firstName}</li>
                <li>• lastName: {testData.lastName}</li>
                <li>• gender: {testData.gender}</li>
                <li>• ageRange: {testData.ageRange}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Contact et localisation</h4>
              <ul className="text-sm space-y-1">
                <li>• phone: {testData.phone}</li>
                <li>• country: {testData.country}</li>
                <li>• city: {testData.city}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Situation professionnelle</h4>
              <ul className="text-sm space-y-1">
                <li>• professionalStatus: {testData.professionalStatus}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Culture d'épargne</h4>
              <ul className="text-sm space-y-1">
                <li>• maxSavingsAmount: {testData.maxSavingsAmount}</li>
                <li>• savingsHabit: {testData.savingsHabit}</li>
                <li>• currentSavingsLevel: {testData.currentSavingsLevel}</li>
                <li>• savingsUsage: {testData.savingsUsage}</li>
                <li>• savingsChallenge: {testData.savingsChallenge}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Challenge épargne</h4>
              <ul className="text-sm space-y-1">
                <li>• previousChallengeExperience: {testData.previousChallengeExperience}</li>
                <li>• motivation: {testData.motivation}</li>
                <li>• challengeMode: {testData.challengeMode}</li>
                <li>• challengeFormula: {testData.challengeFormula}</li>
                <li>• partnerAccounts: {testData.partnerAccounts}</li>
                <li>• expenseTracking: {testData.expenseTracking}</li>
                <li>• futureInterest: {testData.futureInterest}</li>
                <li>• concerns: {testData.concerns}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Configuration</h4>
              <ul className="text-sm space-y-1">
                <li>• challengeStartMonth: {testData.challengeStartMonth}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationDebug;
