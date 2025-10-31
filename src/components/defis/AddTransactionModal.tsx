import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, TrendingUp, TrendingDown } from "lucide-react";
import { useDefiStore } from "@/stores/defiStore";
import { toast } from "@/hooks/use-toast";
import type { TransactionType } from "@/types/defi";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defiId: string;
  currentBalance?: number;
  currency?: string;
  onSuccess?: () => void;
}

export const AddTransactionModal = ({ isOpen, onClose, defiId, currentBalance = 0, currency = 'XOF', onSuccess }: AddTransactionModalProps) => {
  const { addTransaction, isAddingTransaction } = useDefiStore();
  
  const [type, setType] = useState<TransactionType>('DEPOSIT');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));

  const resetForm = () => {
    setType('DEPOSIT');
    setAmount(0);
    setDescription("");
    setDate(new Date().toISOString().slice(0, 16));
  };

  const calculateNewBalance = () => {
    if (type === 'DEPOSIT') {
      return currentBalance + amount;
    } else {
      return Math.max(0, currentBalance - amount);
    }
  };

  const validateForm = (): boolean => {
    if (!amount || amount <= 0) {
      toast({
        title: "Erreur",
        description: "Le montant doit être supérieur à 0",
        variant: "destructive"
      });
      return false;
    }

    if (type === 'WITHDRAWAL' && amount > currentBalance) {
      toast({
        title: "Erreur",
        description: "Le montant du retrait ne peut pas dépasser le solde actuel",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const success = await addTransaction(defiId, {
        amount,
        type,
        description: description.trim() || undefined,
        date: date || undefined
      });
      
      if (success) {
        toast({
          title: "Succès !",
          description: `Transaction de ${type === 'DEPOSIT' ? 'dépôt' : 'retrait'} ajoutée avec succès`,
        });
        
        resetForm();
        onClose();
        onSuccess?.();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une transaction</DialogTitle>
          <DialogDescription>
            Enregistrez un dépôt ou un retrait pour ce défi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type Selection */}
          <div className="space-y-3">
            <Label>Type de transaction *</Label>
            <RadioGroup value={type} onValueChange={(v) => setType(v as TransactionType)}>
              <div className="grid grid-cols-2 gap-4">
                <label
                  htmlFor="deposit"
                  className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    type === 'DEPOSIT'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <RadioGroupItem value="DEPOSIT" id="deposit" />
                  <div className="flex items-center space-x-2 flex-1">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <ArrowDown className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-700">Dépôt</p>
                      <p className="text-xs text-gray-500">Ajouter au solde</p>
                    </div>
                  </div>
                </label>

                <label
                  htmlFor="withdrawal"
                  className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    type === 'WITHDRAWAL'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <RadioGroupItem value="WITHDRAWAL" id="withdrawal" />
                  <div className="flex items-center space-x-2 flex-1">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <ArrowUp className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-700">Retrait</p>
                      <p className="text-xs text-gray-500">Retirer du solde</p>
                    </div>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Montant *</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                value={amount || ""}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="Ex: 5000"
                className="pr-16 text-lg font-semibold"
                min={0}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500">{currency}</span>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Épargne hebdomadaire..."
              rows={2}
              maxLength={200}
            />
          </div>

          {/* Balance Preview */}
          {amount > 0 && (
            <Card className={type === 'DEPOSIT' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Solde actuel:</span>
                  <span className="font-semibold">{currentBalance.toLocaleString()} {currency}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {type === 'DEPOSIT' ? 'Montant à ajouter:' : 'Montant à retirer:'}
                  </span>
                  <span className={`font-semibold ${type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'}`}>
                    {type === 'DEPOSIT' ? '+' : '-'}{amount.toLocaleString()} {currency}
                  </span>
                </div>

                <div className="h-px bg-gray-300"></div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700">Nouveau solde:</span>
                  <div className="flex items-center space-x-2">
                    {type === 'DEPOSIT' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`font-bold text-lg ${type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'}`}>
                      {calculateNewBalance().toLocaleString()} {currency}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isAddingTransaction}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isAddingTransaction || !amount}
            className={type === 'DEPOSIT' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {isAddingTransaction ? 'Ajout en cours...' : 'Ajouter la transaction'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

