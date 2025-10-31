import { motion } from "framer-motion";
import { Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryDisplay } from "./CategorySelector";
import { Transaction } from "@/lib/apiComponent/types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface TransactionCardProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onView?: (transaction: Transaction) => void;
  showActions?: boolean;
  className?: string;
}

export function TransactionCard({ 
  transaction, 
  onEdit, 
  onDelete, 
  onView,
  showActions = true,
  className = ""
}: TransactionCardProps) {
  const isIncome = transaction.type === 'INCOME';
  const amount = transaction.amount;
  const formattedAmount = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: fr 
      });
    } catch {
      return 'Date invalide';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CategoryDisplay
                  category={transaction.category}
                  type={transaction.type}
                  showIcon={true}
                  showColor={true}
                  className="text-sm"
                />
              </div>
              
              {transaction.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {transaction.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{formatDate(transaction.date)}</span>
                {transaction.isEpargne && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    Épargne
                  </span>
                )}
                {transaction.isLiberation && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    Libération
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className={`text-lg font-semibold ${
                isIncome ? 'text-green-600' : 'text-red-600'
              }`}>
                {isIncome ? '+' : '-'}{formattedAmount}
              </div>
              
              {showActions && (
                <div className="flex gap-1">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(transaction)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(transaction)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(transaction)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface TransactionListProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onView?: (transaction: Transaction) => void;
  showActions?: boolean;
  className?: string;
}

export function TransactionList({ 
  transactions, 
  onEdit, 
  onDelete, 
  onView,
  showActions = true,
  className = ""
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aucune transaction trouvée</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {transactions.map((transaction) => (
        <TransactionCard
          key={transaction.id}
          transaction={transaction}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          showActions={showActions}
        />
      ))}
    </div>
  );
}
