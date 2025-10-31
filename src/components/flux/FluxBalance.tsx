import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, PiggyBank, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FluxBalanceDto } from "@/lib/apiComponent/types";

interface FluxBalanceProps {
  balance: FluxBalanceDto;
  isLoading?: boolean;
  showDetails?: boolean;
  onToggleDetails?: () => void;
  className?: string;
}

export function FluxBalance({ 
  balance, 
  isLoading = false,
  showDetails = false,
  onToggleDetails,
  className = ""
}: FluxBalanceProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateVariation = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const soldeVariation = calculateVariation(balance.soldeFlux, balance.totalEntrees - balance.totalSorties);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Solde Principal */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Solde du Flux Financier</CardTitle>
            {onToggleDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleDetails}
                className="h-8 w-8 p-0"
              >
                {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-3xl font-bold ${
                balance.soldeFlux >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(balance.soldeFlux)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {soldeVariation !== 0 && (
                  <Badge variant={soldeVariation > 0 ? "default" : "destructive"}>
                    {soldeVariation > 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(soldeVariation).toFixed(1)}%
                  </Badge>
                )}
                <span className="text-sm text-gray-500">
                  {balance.soldeFlux >= 0 ? 'Excédent' : 'Déficit'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total des entrées</div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(balance.totalEntrees)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Détails */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Entrées */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Entrées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total des revenus</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(balance.totalEntrees)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Sorties */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Sorties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total des dépenses</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(balance.totalSorties)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Épargne */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-blue-600" />
                Épargne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(balance.totalEpargne)}
                  </div>
                  <div className="text-sm text-gray-500">Total épargne</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">
                    {formatCurrency(balance.epargneChallenge)}
                  </div>
                  <div className="text-sm text-gray-500">Challenge</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-indigo-600">
                    {formatCurrency(balance.epargneDefi)}
                  </div>
                  <div className="text-sm text-gray-500">Défi</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Épargne libre</span>
                  <span className="font-semibold text-gray-700">
                    {formatCurrency(balance.epargneLibre)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

interface FluxSummaryProps {
  balance: FluxBalanceDto;
  isLoading?: boolean;
  className?: string;
}

export function FluxSummary({ 
  balance, 
  isLoading = false,
  className = ""
}: FluxSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {/* Entrées */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entrées</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(balance.totalEntrees)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      {/* Sorties */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sorties</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(balance.totalSorties)}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      {/* Épargne */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Épargne</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(balance.totalEpargne)}
              </p>
            </div>
            <PiggyBank className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
