import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, TransactionType } from '../types';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  getDailyTotal: (date: string, type: TransactionType) => number;
  isLoading: boolean;
}

const STORAGE_KEY = '@money_tracker_transactions';
const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on init
  useEffect(() => {
    loadTransactions();
  }, []);

  // Save data whenever transactions change
  useEffect(() => {
    if (!isLoading) {
      saveTransactions(transactions);
    }
  }, [transactions, isLoading]);

  const loadTransactions = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTransactions(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load transactions', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTransactions = async (txs: Transaction[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  };

  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: Math.random().toString(36).substring(2, 9),
    };
    setTransactions((prev) => [transaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const getDailyTotal = (date: string, type: TransactionType) => {
    return transactions
      .filter((tx) => tx.date === date && tx.type === type)
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  const value = useMemo(() => ({
    transactions,
    addTransaction,
    deleteTransaction,
    getDailyTotal,
    isLoading
  }), [transactions, isLoading]);

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
