import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { simpleNotificationService } from '@/lib/apiComponent/services/simpleNotificationService';
import { Clock, Wifi, WifiOff, Play, Pause, Settings } from 'lucide-react';

export function PollingSettings() {
  const [isPolling, setIsPolling] = useState(false);
  const [currentInterval, setCurrentInterval] = useState(120000); // 2 minutes
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPolling(simpleNotificationService.getConnectionStatus());
      setCurrentInterval(simpleNotificationService.getPollingInterval());
      setLastCheck(simpleNotificationService.getLastCheckTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleIntervalChange = (value: number[]) => {
    const newInterval = value[0] * 1000; // Convert to milliseconds
    setCurrentInterval(newInterval);
    simpleNotificationService.setPollingInterval(newInterval);
  };

  const handleStartPolling = () => {
    simpleNotificationService.startPolling();
  };

  const handleStopPolling = () => {
    simpleNotificationService.stopPolling();
  };

  const handleCheckNow = async () => {
    await simpleNotificationService.checkNow();
  };

  const formatInterval = (ms: number) => {
    const seconds = ms / 1000;
    const minutes = seconds / 60;
    
    if (minutes < 1) {
      return `${seconds}s`;
    } else if (minutes < 60) {
      return `${Math.round(minutes)}min`;
    } else {
      const hours = minutes / 60;
      return `${Math.round(hours)}h`;
    }
  };

  const getIntervalRecommendation = (ms: number) => {
    const minutes = ms / 1000 / 60;
    
    if (minutes < 1) {
      return { color: 'destructive', text: 'Très fréquent - Peut surcharger le serveur' };
    } else if (minutes < 2) {
      return { color: 'destructive', text: 'Fréquent - Consomme beaucoup de ressources' };
    } else if (minutes < 5) {
      return { color: 'default', text: 'Optimal - Bon équilibre performance/ressources' };
    } else if (minutes < 10) {
      return { color: 'secondary', text: 'Lent - Économise les ressources' };
    } else {
      return { color: 'outline', text: 'Très lent - Peut manquer des notifications' };
    }
  };

  const recommendation = getIntervalRecommendation(currentInterval);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuration du Polling
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPolling ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {isPolling ? 'Polling actif' : 'Polling arrêté'}
            </span>
          </div>
          
          <Badge variant={isPolling ? 'default' : 'destructive'}>
            {isPolling ? 'Connecté' : 'Déconnecté'}
          </Badge>
        </div>

        {/* Interval Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="interval-slider" className="text-sm font-medium">
              Intervalle de polling
            </Label>
            <Badge variant={recommendation.color as any}>
              {formatInterval(currentInterval)}
            </Badge>
          </div>
          
          <Slider
            id="interval-slider"
            min={30}
            max={600}
            step={30}
            value={[currentInterval / 1000]}
            onValueChange={handleIntervalChange}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>30s</span>
            <span>5min</span>
            <span>10min</span>
          </div>
          
          <p className={`text-xs ${recommendation.color === 'destructive' ? 'text-red-600' : 
            recommendation.color === 'default' ? 'text-green-600' : 'text-muted-foreground'}`}>
            {recommendation.text}
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!isPolling ? (
            <Button onClick={handleStartPolling} size="sm">
              <Play className="h-4 w-4 mr-1" />
              Démarrer
            </Button>
          ) : (
            <Button onClick={handleStopPolling} variant="outline" size="sm">
              <Pause className="h-4 w-4 mr-1" />
              Arrêter
            </Button>
          )}
          
          <Button onClick={handleCheckNow} variant="outline" size="sm" disabled={!isPolling}>
            <Clock className="h-4 w-4 mr-1" />
            Vérifier maintenant
          </Button>
        </div>

        {/* Info */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Informations</h4>
          <div className="bg-muted p-3 rounded-lg text-xs space-y-1">
            <div>Intervalle actuel: {formatInterval(currentInterval)}</div>
            <div>Dernière vérification: {lastCheck ? lastCheck.toLocaleTimeString() : 'Jamais'}</div>
            <div>Statut: {isPolling ? 'Actif' : 'Inactif'}</div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Recommandations</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• <strong>2-3 minutes</strong> : Optimal pour la plupart des applications</li>
            <li>• <strong>1 minute</strong> : Seulement si notifications critiques</li>
            <li>• <strong>5-10 minutes</strong> : Pour économiser les ressources</li>
            <li>• <strong>30 secondes</strong> : Éviter, trop de requêtes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
