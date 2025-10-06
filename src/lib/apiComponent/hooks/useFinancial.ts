import { useState, useCallback } from 'react';
import { api } from '../apiClient';
import {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionStatsDto,
  TransactionChartDataDto,
  TransactionQueryParams
} from '../types';
import { financialEndpoints } from '../endpoints';

// ==================== FINANCIAL HOOKS ====================

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTransactions = useCallback(async (params?: TransactionQueryParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.type) queryParams.append('type', params.type);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.year) queryParams.append('year', params.year.toString());
      if (params?.month) queryParams.append('month', params.month.toString());

      const url = `${financialEndpoints.transactions}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<{transactions: Transaction[], total: number, page: number, totalPages: number}>(url);
      
      // Handle API response structure: { transactions: [...], total: 3, page: 1, totalPages: 1 }
      const transactionsData = response.transactions || [];
      setTransactions(transactionsData);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTransaction = useCallback(async (transactionData: CreateTransactionDto): Promise<Transaction> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post<Transaction, CreateTransactionDto>(financialEndpoints.createTransaction, transactionData);
      
      // Add to local state
      setTransactions(prev => [response, ...(prev || [])]);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTransactionById = useCallback(async (id: string): Promise<Transaction> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<Transaction>(financialEndpoints.transactionById(id));
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTransaction = useCallback(async (id: string, transactionData: UpdateTransactionDto): Promise<Transaction> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.put<Transaction, UpdateTransactionDto>(financialEndpoints.updateTransaction(id), transactionData);
      
      // Update in local state
      setTransactions(prev => (prev || []).map(t => t.id === id ? response : t));
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.delete<Transaction>(financialEndpoints.deleteTransaction(id));
      
      // Remove from local state
      setTransactions(prev => (prev || []).filter(t => t.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    transactions,
    isLoading,
    error,
    getTransactions,
    createTransaction,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
  };
};

// ==================== TRANSACTION STATS HOOKS ====================

export const useTransactionStats = () => {
  const [stats, setStats] = useState<TransactionStatsDto | null>(null);
  const [chartData, setChartData] = useState<TransactionChartDataDto | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStats = useCallback(async (year?: number, month?: number): Promise<TransactionStatsDto> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (year) queryParams.append('year', year.toString());
      if (month) queryParams.append('month', month.toString());

      const url = `${financialEndpoints.transactionStats}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<TransactionStatsDto>(url);
      
      setStats(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction stats');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getChartData = useCallback(async (): Promise<TransactionChartDataDto> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<TransactionChartDataDto>(financialEndpoints.chartData);
      
      setChartData(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCategories = useCallback(async (): Promise<string[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<string[]>(financialEndpoints.categories);
      
      setCategories(response);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    stats,
    chartData,
    categories,
    isLoading,
    error,
    getStats,
    getChartData,
    getCategories,
  };
};
