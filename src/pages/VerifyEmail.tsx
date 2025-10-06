import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/apiComponent/hooks/useAuth';
import PremiumUpgradeModal from '@/components/premium/PremiumUpgradeModal';

type VerificationStatus = 'loading' | 'success' | 'error' | 'idle';

// Interface supprimée - on utilise VerifyEmailResponse de useAuth

const VerifyEmail = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [message, setMessage] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');

  const { verifyEmailWithToken } = useAuth();

  const verifyEmail = useCallback(async () => {
    if (!token) return;

    setStatus('loading');
    setMessage('Vérification de votre email en cours...');

    try {
      
      const response = await verifyEmailWithToken(token);
      
      console.log('📧 VerifyEmail Response:', response);

      // La réponse de l'API contient maintenant un objet user complet
      if (response.user.isVerified) {
        setStatus('success');
        
        // Vérifier si le message indique que le compte est déjà vérifié
        const message = Array.isArray(response.message) ? response.message[0] : response.message || '';
        const isAlreadyVerified = message.toLowerCase().includes('already verified') || 
                                 message.toLowerCase().includes('déjà vérifié') ||
                                 message.toLowerCase().includes('compte déjà vérifié');
        
        // Mettre à jour l'email et l'ID de l'utilisateur pour le modal premium
        setUserEmail(response.user.email);
        setUserId(response.user.id);
        
        if (isAlreadyVerified) {
          setMessage('Votre compte est déjà vérifié !');
          // Si le compte est déjà vérifié, rediriger directement vers le dashboard
          // setTimeout(() => {
          //   navigate('/');
          // }, 2000);
        } else {
          setMessage('Votre email a été vérifié avec succès !');
          // Afficher le modal premium après un court délai si l'utilisateur n'est pas premium
          if (response.user.challengeMode === 'PREMIUM') {
            setTimeout(() => {
              setShowPremiumModal(true);
            }, 1000);
          } else {
            // Si l'utilisateur est déjà premium, rediriger directement vers le dashboard
            setTimeout(() => {
              navigate('/');
            }, 2000);
          }
        }
      } else {
        setStatus('error');
        setMessage('Erreur lors de la vérification de l\'email');
      }
    } catch (error: unknown) {
      console.error('❌ VerifyEmail Error:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Une erreur est survenue lors de la vérification');
    }
  }, [token, verifyEmailWithToken, navigate]);

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Token de vérification manquant dans l\'URL');
    }
  }, [token, verifyEmail]);

  const handlePremiumSuccess = () => {
    setShowPremiumModal(false);
    // Rediriger vers le dashboard après succès du paiement
    navigate('/user-dashboard');
  };

  const handleSkipPremium = () => {
    setShowPremiumModal(false);
    // Rediriger vers le dashboard même sans premium
    navigate('/user-dashboard');
  };

  const handleDirectPayment = () => {
    // Rediriger vers une page de paiement ou ouvrir un modal de paiement
    // Pour l'instant, on redirige vers le dashboard
    navigate('/user-dashboard');
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Vérification en cours</h2>
            <p className="text-gray-600 text-center">{message}</p>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Email vérifié !</h2>
            <p className="text-gray-600 text-center">{message}</p>
            {userEmail && (
              <p className="text-sm text-gray-500">
                Email vérifié : <span className="font-medium">{userEmail}</span>
              </p>
            )}
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="h-12 w-12 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Erreur de vérification</h2>
            <p className="text-gray-600 text-center">{message}</p>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="mt-4"
            >
              Retour à l'accueil
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Vérification d'email
            </CardTitle>
            <CardDescription className="text-gray-600">
              Confirmez votre adresse email pour activer votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {renderContent()}
          </CardContent>
        </Card>

        {/* Modal Premium */}
        <PremiumUpgradeModal
          isOpen={showPremiumModal}
          onClose={handleSkipPremium}
          userEmail={userEmail}
          userId={userId}
        />
      </div>
    </div>
  );
};

export default VerifyEmail;
