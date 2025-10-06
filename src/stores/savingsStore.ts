import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavingsGoal {
  id: string;
  userId: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  monthlyIncome: number;
  isVariableIncome: boolean;
  incomeHistory: number[];
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface SavingsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  description: string;
  date: string;
  createdAt: string;
}

export interface SavingsLeaderboard {
  userId: string;
  userName: string;
  totalSaved: number;
  goalAmount: number;
  progressPercentage: number;
  rank: number;
}

interface SavingsState {
  goal: SavingsGoal | null;
  transactions: SavingsTransaction[];
  leaderboard: SavingsLeaderboard[];
  isLoading: boolean;
  createGoal: (goalData: Omit<SavingsGoal, 'id' | 'currentAmount' | 'createdAt'>) => void;
  addTransaction: (transaction: Omit<SavingsTransaction, 'id' | 'createdAt'>) => void;
  updateGoal: (goalId: string, updates: Partial<SavingsGoal>) => void;
  fetchLeaderboard: () => Promise<void>;
  calculateMonthlyTarget: (income: number | number[]) => number;
}

export const useSavingsStore = create<SavingsState>()(
  persist(
    (set, get) => ({
      goal: null,
      transactions: [],
      leaderboard: [],
      isLoading: false,

      createGoal: (goalData) => {
        const newGoal: SavingsGoal = {
          ...goalData,
          id: Date.now().toString(),
          currentAmount: 0,
          createdAt: new Date().toISOString(),
        };
        set({ goal: newGoal });
      },

      addTransaction: (transactionData) => {
        const { transactions, goal } = get();
        const newTransaction: SavingsTransaction = {
          ...transactionData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };

        const updatedTransactions = [...transactions, newTransaction];
        
        if (goal) {
          const currentAmount = updatedTransactions
            .filter(t => t.type === 'deposit')
            .reduce((sum, t) => sum + t.amount, 0) -
            updatedTransactions
            .filter(t => t.type === 'withdrawal')
            .reduce((sum, t) => sum + t.amount, 0);

          set({
            transactions: updatedTransactions,
            goal: { ...goal, currentAmount: Math.max(0, currentAmount) }
          });
        } else {
          set({ transactions: updatedTransactions });
        }
      },

      updateGoal: (goalId, updates) => {
        const { goal } = get();
        if (goal && goal.id === goalId) {
          set({ goal: { ...goal, ...updates } });
        }
      },

      fetchLeaderboard: async () => {
        set({ isLoading: true });
        try {
          // Mock leaderboard data
          const mockLeaderboard: SavingsLeaderboard[] = [
            {
              userId: '1',
              userName: 'Marie Martin',
              totalSaved: 4200,
              goalAmount: 6000,
              progressPercentage: 70,
              rank: 1,
            },
            {
              userId: '2',
              userName: 'Pierre Dupont',
              totalSaved: 3800,
              goalAmount: 5500,
              progressPercentage: 69,
              rank: 2,
            },
            {
              userId: '3',
              userName: 'Sophie Bernard',
              totalSaved: 3200,
              goalAmount: 4800,
              progressPercentage: 66.7,
              rank: 3,
            },
          ];

          await new Promise(resolve => setTimeout(resolve, 800));
          set({ leaderboard: mockLeaderboard, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
        }
      },

      calculateMonthlyTarget: (income) => {
        if (Array.isArray(income)) {
          // Variable income - calculate average
          const average = income.reduce((sum, amount) => sum + amount, 0) / income.length;
          return Math.round(average * 0.1); // 10% of average income
        } else {
          // Fixed income
          return Math.round(income * 0.1); // 10% of fixed income
        }
      },
    }),
    {
      name: 'savings-storage',
    }
  )
);
