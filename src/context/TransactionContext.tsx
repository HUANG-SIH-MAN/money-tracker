import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, TransactionType, RecurringTransaction, Category } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/categories';

interface TransactionContextType {
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addRecurringTransaction: (recurring: Omit<RecurringTransaction, 'id'>) => void;
  deleteRecurringTransaction: (id: string) => void;
  updateRecurringTransaction: (id: string, recurring: Partial<RecurringTransaction>) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (newCategories: Category[]) => void;
  getDailyTotal: (date: string, type: TransactionType) => number;
  isLoading: boolean;
}

const STORAGE_KEY = '@money_tracker_transactions';
const RECURRING_KEY = '@money_tracker_recurring';
const CATEGORIES_KEY = '@money_tracker_categories';
const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on init
  useEffect(() => {
    loadData();
  }, []);

  // Save transactions whenever they change
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions, isLoading]);

  // Save recurring whenever they change
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(RECURRING_KEY, JSON.stringify(recurringTransactions));
    }
  }, [recurringTransactions, isLoading]);

  // Save categories whenever they change
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    }
  }, [categories, isLoading]);

  const loadData = async () => {
    try {
      const [storedTx, storedRecurring, storedCategories] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(RECURRING_KEY),
        AsyncStorage.getItem(CATEGORIES_KEY)
      ]);

      if (storedTx) setTransactions(JSON.parse(storedTx));
      if (storedRecurring) setRecurringTransactions(JSON.parse(storedRecurring));
      if (storedCategories) setCategories(JSON.parse(storedCategories));

    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Process recurring transactions
  useEffect(() => {
    if (!isLoading && recurringTransactions.length > 0) {
      processRecurringTransactions();
    }
  }, [isLoading, recurringTransactions]);

  const processRecurringTransactions = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const currentDay = now.getDate();

    let newTransactions: Transaction[] = [];
    let updated = false;

    recurringTransactions.forEach(rec => {
      // We only process for the specified day if it has passed in the current month
      if (currentDay >= rec.dayOfMonth) {
        const targetDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(rec.dayOfMonth).padStart(2, '0')}`;

        // Check if this recurring transaction has already been added for this month
        // We look for a match in category, amount, and specific date
        const alreadyExists = transactions.some(tx =>
          tx.date === targetDate &&
          tx.categoryId === rec.categoryId &&
          tx.amount === rec.amount &&
          tx.note === rec.note
        );

        if (!alreadyExists) {
          const newTx: Transaction = {
            id: 'rec-' + Math.random().toString(36).substring(2, 9),
            amount: rec.amount,
            type: rec.type,
            categoryId: rec.categoryId,
            note: rec.note,
            date: targetDate,
            isRecurring: true
          };
          newTransactions.push(newTx);
          updated = true;
        }
      }
    });

    if (updated) {
      setTransactions(prev => [...newTransactions, ...prev]);
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

  const addRecurringTransaction = (newRecurring: Omit<RecurringTransaction, 'id'>) => {
    const recurring: RecurringTransaction = {
      ...newRecurring,
      id: Math.random().toString(36).substring(2, 9),
    };
    setRecurringTransactions((prev) => [recurring, ...prev]);
  };

  const deleteRecurringTransaction = (id: string) => {
    setRecurringTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const addCategory = (newCat: Omit<Category, 'id'>) => {
    const category: Category = {
      ...newCat,
      id: Math.random().toString(36).substring(2, 9),
    };
    setCategories((prev) => [...prev, category]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter(c => c.id !== id));
  };

  const reorderCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
  };

  const updateRecurringTransaction = (id: string, updates: Partial<RecurringTransaction>) => {
    setRecurringTransactions((prev) => prev.map(rec => rec.id === id ? { ...rec, ...updates } : rec));
  };

  const getDailyTotal = (date: string, type: TransactionType) => {
    return transactions
      .filter((tx) => tx.date === date && tx.type === type)
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  const value = useMemo(() => ({
    transactions,
    recurringTransactions,
    categories,
    addTransaction,
    deleteTransaction,
    addRecurringTransaction,
    deleteRecurringTransaction,
    updateRecurringTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    getDailyTotal,
    isLoading
  }), [transactions, recurringTransactions, categories, isLoading]);

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
