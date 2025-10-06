import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface NetworkErrorProps {
  error: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

const NetworkError = ({ error, onRetry, isRetrying = false }: NetworkErrorProps) => {
  const isNetworkError = error.toLowerCase().includes('network') || 
                        error.toLowerCase().includes('fetch') ||
                        error.toLowerCase().includes('connection');

  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {isNetworkError ? (
              <WifiOff className="h-5 w-5 text-red-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-red-800">
              {isNetworkError ? 'Problème de connexion' : 'Erreur de chargement'}
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {isNetworkError 
                ? 'Vérifiez votre connexion internet et réessayez.'
                : 'Une erreur est survenue lors du chargement des posts.'
              }
            </p>
            <div className="mt-3">
              <Button
                onClick={onRetry}
                disabled={isRetrying}
                variant="outline"
                size="sm"
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Reconnexion...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Réessayer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkError;
