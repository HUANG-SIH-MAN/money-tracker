import React, { createContext, useContext, useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  getDailyTotal: (date: string, type: TransactionType) => number;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

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
    getDailyTotal
  }), [transactions]);

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
