import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FinancialTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface MonthlyStats {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
}

interface FinancialState {
  transactions: FinancialTransaction[];
  isLoading: boolean;
  addTransaction: (transaction: Omit<FinancialTransaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<FinancialTransaction>) => void;
  deleteTransaction: (id: string) => void;
  getMonthlyStats: () => MonthlyStats[];
  getCategoryStats: () => { category: string; amount: number; percentage: number }[];
}

export const useFinancialStore = create<FinancialState>()(
  persist(
    (set, get) => ({
      transactions: [
        {
          id: '1',
          userId: '1',
          amount: 500000,
          type: 'income',
          category: 'Salaires',
          description: 'Salaire mensuel',
          date: '2025-01-01',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          userId: '1',
          amount: 120000,
          type: 'expense',
          category: 'Loyer',
          description: 'Loyer appartement',
          date: '2025-01-01',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          userId: '1',
          amount: 45000,
          type: 'expense',
          category: 'Alimentation',
          description: 'Courses mensuelles',
          date: '2025-01-05',
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          userId: '1',
          amount: 15000,
          type: 'expense',
          category: 'Transport ou carburant',
          description: 'Essence et transports',
          date: '2025-01-10',
          createdAt: new Date().toISOString(),
        },
        {
          id: '5',
          userId: '1',
          amount: 20000,
          type: 'expense',
          category: 'Loisir',
          description: 'Sorties et divertissements',
          date: '2025-01-15',
          createdAt: new Date().toISOString(),
        },
        {
          id: '6',
          userId: '1',
          amount: 75000,
          type: 'income',
          category: 'Prime',
          description: 'Prime de performance',
          date: '2025-01-20',
          createdAt: new Date().toISOString(),
        },
      ],
      isLoading: false,

      addTransaction: (transactionData) => {
        const { transactions } = get();
        const newTransaction: FinancialTransaction = {
          ...transactionData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set({ transactions: [...transactions, newTransaction] });
      },

      updateTransaction: (id, updates) => {
        const { transactions } = get();
        const updatedTransactions = transactions.map(transaction =>
          transaction.id === id ? { ...transaction, ...updates } : transaction
        );
        set({ transactions: updatedTransactions });
      },

      deleteTransaction: (id) => {
        const { transactions } = get();
        const updatedTransactions = transactions.filter(transaction => transaction.id !== id);
        set({ transactions: updatedTransactions });
      },

      getMonthlyStats: () => {
        const { transactions } = get();
        const monthlyData: { [key: string]: MonthlyStats } = {};

        transactions.forEach(transaction => {
          const month = transaction.date.substring(0, 7); // YYYY-MM format
          
          if (!monthlyData[month]) {
            monthlyData[month] = {
              month,
              totalIncome: 0,
              totalExpenses: 0,
              netAmount: 0,
            };
          }

          if (transaction.type === 'income') {
            monthlyData[month].totalIncome += transaction.amount;
          } else {
            monthlyData[month].totalExpenses += transaction.amount;
          }
          
          monthlyData[month].netAmount = monthlyData[month].totalIncome - monthlyData[month].totalExpenses;
        });

        return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
      },

      getCategoryStats: () => {
        const { transactions } = get();
        const categoryData: { [key: string]: number } = {};
        let total = 0;

        transactions
          .filter(t => t.type === 'expense')
          .forEach(transaction => {
            categoryData[transaction.category] = (categoryData[transaction.category] || 0) + transaction.amount;
            total += transaction.amount;
          });

        return Object.entries(categoryData).map(([category, amount]) => ({
          category,
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
        })).sort((a, b) => b.amount - a.amount);
      },
    }),
    {
      name: 'financial-storage',
    }
  )
);
