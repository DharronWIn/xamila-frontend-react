import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useTransactions } from "@/lib/apiComponent/hooks/useFinancial";
import { CategorySelector } from "./CategorySelector";
import { toast } from "sonner";
import { Mic, Square } from "lucide-react";

// Hoisted helpers for stability
const normalize = (s: string) => s
  .toLowerCase()
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  alimentation: ['alimentation', 'nourriture', 'courses', 'supermarche', 'supermarché', 'marche', 'manger', 'repas', 'aliments', 'boucherie', 'boulangerie', 'epicerie', 'épicerie'],
  restaurant: ['restaurant', 'resto', 'snack', 'fast food', 'pizza', 'kebab', 'cafe', 'café', 'bar'],
  transport: ['transport', 'taxi', 'uber', 'bus', 'train', 'metro', 'essence', 'carburant', 'station', 'voiture', 'parking', 'peage', 'péage'],
  logement: ['logement', 'loyer', 'maison', 'appartement', 'immeuble', 'colocation', 'hypotheque', 'hypothèque'],
  factures: ['facture', 'factures', 'electricite', 'électricité', 'eau', 'gaz', 'internet', 'telephone', 'téléphone', 'abonnement', 'forfait'],
  sante: ['sante', 'santé', 'pharmacie', 'medecin', 'médecin', 'docteur', 'hopital', 'hôpital', 'analyses', 'consultation'],
  loisirs: ['loisirs', 'cinema', 'cinéma', 'jeux', 'sport', 'netflix', 'spotify', 'sortie', 'parc'],
  shopping: ['shopping', 'vetements', 'vêtements', 'habits', 'chaussures', 'mode', 'boutique'],
  education: ['education', 'éducation', 'ecole', 'école', 'frais', 'inscription', 'livres', 'formation', 'cours'],
  salaire: ['salaire', 'paie', 'paye', 'revenu', 'prime', 'bonus'],
  cadeau: ['cadeau', 'anniversaire', 'mariage', 'noel', 'noël'],
  autres: ['autre', 'divers', 'inconnu']
};

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (response?: { balance: any; summary: any }) => void;
}

interface TransactionFormData {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description: string;
  date: string;
  isEpargne?: boolean;
}

// Categories are now imported from types

export function AddTransactionModal({ isOpen, onClose, onSuccess }: AddTransactionModalProps) {
  const { createTransaction } = useTransactions();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'EXPENSE',
    amount: 0,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isEpargne: false,
  });

  // Voice recognition state
  const [isRecording, setIsRecording] = useState(false);
  const [vizHeights, setVizHeights] = useState<number[]>([4, 8, 12, 16, 12, 8, 6, 10]);

  // Minimal types for SpeechRecognition to avoid using 'any'
  type ResultAlternative = { transcript?: string };
  type ResultLike = { 0?: ResultAlternative; isFinal?: boolean };
  interface SpeechRecognitionEventLike { results: ArrayLike<ResultLike>; }
  interface SpeechRecognitionLike {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    continuous: boolean;
    onresult: ((event: SpeechRecognitionEventLike) => void) | null;
    onend: (() => void) | null;
    onerror: ((ev: unknown) => void) | null;
    start: () => void;
    stop: () => void;
  }
  type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  // Fuzzy category inference
  const inferCategory = useCallback((text: string): string | undefined => {
    const n = normalize(text);
    const tokens = new Set(n.split(' '));

    let bestCat = undefined as string | undefined;
    let bestScore = 0;
    Object.entries(CATEGORY_KEYWORDS).forEach(([cat, keywords]) => {
      let score = 0;
      for (const kw of keywords) {
        const nkw = normalize(kw);
        // direct token match
        if (tokens.has(nkw)) score += 2;
        // substring fuzzy match
        else if (n.includes(nkw)) score += 1;
      }
      if (score > bestScore) {
        bestScore = score;
        bestCat = cat;
      }
    });

    // Require at least a minimal score to avoid random assignment
    return bestScore >= 2 ? bestCat : undefined;
  }, []);


  // Basic FR intent parsing: type, amount, category (best-effort), description
  const parseFrenchTransaction = useCallback((text: string) => {
    const lower = text.toLowerCase();
    const updates: Partial<TransactionFormData> = {};

    // Type detection
    if (/(dépense|depense|payer|achat|sortie)/.test(lower)) {
      updates.type = 'EXPENSE';
    }
    if (/(revenu|entrée|entree|gagner|reçu|recette)/.test(lower)) {
      updates.type = 'INCOME';
    }

    // Amount detection (first number in the phrase, allow ',' or '.')
    const amountMatch = lower.match(/(\d+[.,]?\d*)/);
    if (amountMatch) {
      const raw = amountMatch[1].replace(',', '.');
      const parsed = parseFloat(raw);
      if (!Number.isNaN(parsed)) {
        updates.amount = parsed;
      }
    }

    // Fuzzy category inference
    const inferred = inferCategory(text);
    if (inferred) updates.category = inferred;

    // Description fallback to full phrase
    updates.description = text.trim();
    return updates;
  }, [inferCategory]);

  const ensureSpeechRecognition = useCallback((): SpeechRecognitionConstructor | null => {
    if (typeof window === 'undefined') return null;
    const SR = (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor; }).SpeechRecognition
      || (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor; }).webkitSpeechRecognition
      || null;
    return SR ? SR : null;
  }, []);

  const startRecording = useCallback(() => {
    const SR = ensureSpeechRecognition();
    if (!SR) {
      toast.error("La reconnaissance vocale n'est pas disponible sur ce navigateur.");
      return;
    }

    try {
      const recognition = new SR();
      recognition.lang = 'fr-FR';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = true;

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        const resultsArr = Array.from(event.results);
        const transcript = resultsArr
          .map((res: ResultLike) => res[0]?.transcript || '')
          .join(' ')
          .trim();

        if (transcript) {
          const updates = parseFrenchTransaction(transcript);
          setFormData((prev) => ({
            ...prev,
            ...updates,
            category: updates.category ?? prev.category,
          }));
        }
      };

      recognition.onend = () => {
        // If user didn't explicitly stop, keep listening
        if (isRecording) {
          try {
            recognition.start();
          } catch {
            // Some implementations throw if start is called too soon; ignore
          }
        }
      };

      recognition.onerror = () => {
        if (isRecording) {
          // Try to resume after an error if still recording
          try { recognition.start(); } catch (err) {
            // Swallow restart errors
          }
        }
        toast.error('Erreur de reconnaissance vocale');
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch (e) {
      setIsRecording(false);
      toast.error('Impossible de démarrer la capture vocale');
    }
  }, [ensureSpeechRecognition, parseFrenchTransaction, isRecording]);

  const stopRecording = useCallback(() => {
    // Mark as not recording BEFORE stopping so onend won't auto-restart
    setIsRecording(false);
    const recognition = recognitionRef.current;
    if (recognition && typeof recognition.stop === 'function') {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen && isRecording) {
      // Ensure we stop when modal closes
      stopRecording();
    }
  }, [isOpen, isRecording, stopRecording]);

  // Simple visualizer animation while recording
  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => {
      setVizHeights((prev) => prev.map(() => 4 + Math.floor(Math.random() * 16)));
    }, 120);
    return () => clearInterval(id);
  }, [isRecording]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category) {
      toast.error('Veuillez sélectionner une catégorie');
      return;
    }

    if (formData.amount <= 0) {
      toast.error('Le montant doit être supérieur à 0');
      return;
    }

    setIsLoading(true);
    try {
      // Préparer les données à envoyer (n'envoyer isEpargne que s'il est true)
      const transactionData = {
        ...formData,
        ...(formData.isEpargne ? { isEpargne: true } : {})
      };
      const response = await createTransaction(transactionData);
      toast.success('Transaction ajoutée avec succès');
      // Passer la réponse avec balance et summary au callback
      onSuccess?.({ balance: response.balance, summary: response.summary });
      onClose();
      // Reset form
      setFormData({
        type: 'EXPENSE',
        amount: 0,
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        isEpargne: false,
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Erreur lors de l\'ajout de la transaction');
    } finally {
      setIsLoading(false);
    }
  };

  // Categories are now handled by CategorySelector component

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Nouvelle transaction</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto pr-2 -mr-2">
          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Voice capture header */}
          <div className="flex items-center justify-between p-2 rounded-md bg-gray-50">
            <div className="text-xs text-muted-foreground">
              Vous pouvez décrire votre transaction à voix haute, par ex.
              « Dépense 5000 FCFA restaurant ce soir »
            </div>
            <div className="flex items-center gap-3">
              {isRecording && (
                <div className="flex items-end gap-1 h-5">
                  {vizHeights.map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-red-500 rounded"
                      style={{ height: `${h}px`, transition: 'height 100ms linear' }}
                    />
                  ))}
                </div>
              )}
              {isRecording ? (
                <Button type="button" variant="destructive" size="sm" onClick={stopRecording}>
                  <Square className="w-4 h-4 mr-1" /> Stop
                </Button>
              ) : (
                <Button type="button" variant="outline" size="sm" onClick={startRecording}>
                  <Mic className="w-4 h-4 mr-1" /> Saisie vocale
                </Button>
              )}
            </div>
          </div>
          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'INCOME' | 'EXPENSE') => {
                // Si on passe à INCOME, décocher isEpargne car l'épargne est toujours de type EXPENSE
                const updates: Partial<TransactionFormData> = { 
                  type: value, 
                  category: '',
                  ...(value === 'INCOME' ? { isEpargne: false } : {})
                };
                setFormData({ ...formData, ...updates });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Revenu (Entrée)</SelectItem>
                <SelectItem value="EXPENSE">Dépense (Sortie)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Épargne - visible uniquement pour les dépenses */}
          {formData.type === 'EXPENSE' && (
            <div className="space-y-2 p-3 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isEpargne"
                  checked={formData.isEpargne || false}
                  onCheckedChange={(checked) => {
                    setFormData({ 
                      ...formData, 
                      isEpargne: checked === true,
                      // Si isEpargne est coché, s'assurer que le type est EXPENSE
                      type: 'EXPENSE'
                    });
                  }}
                />
                <Label 
                  htmlFor="isEpargne" 
                  className="text-sm font-medium cursor-pointer flex-1"
                >
                  💰 Marquer comme épargne
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Cette transaction sera comptabilisée dans votre épargne plutôt que dans les sorties
              </p>
            </div>
          )}

          {/* Montant et Date - sur la même ligne */}
          <div className="grid grid-cols-2 gap-4">
            {/* Montant */}
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (FCFA) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                required
                min="0"
                placeholder="0"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Catégorie */}
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <CategorySelector
              type={formData.type}
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              placeholder="Sélectionner une catégorie"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description de la transaction (optionnel)"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 sticky bottom-0 bg-background pb-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ajout...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

