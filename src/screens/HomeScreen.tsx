import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionContext';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import AddTransactionModal from '../components/AddTransactionModal';

export default function HomeScreen() {
  const { transactions, addTransaction, getDailyTotal } = useTransactions();
  const [modalVisible, setModalVisible] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayExpense = getDailyTotal(today, 'EXPENSE');
  const todayIncome = getDailyTotal(today, 'INCOME');

  const getCategory = (id: string) => {
    return DEFAULT_CATEGORIES.find(c => c.id === id);
  };

  const renderItem = ({ item }: { item: any }) => {
    const category = getCategory(item.categoryId);
    return (
      <View style={styles.transactionItem}>
        <View style={[styles.iconContainer, { backgroundColor: category?.color + '20' }]}>
          <Ionicons name={category?.icon as any} size={24} color={category?.color} />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.categoryTitle}>{category?.name}</Text>
          {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
        </View>
        <View style={styles.amountContainer}>
          <Text style={[
            styles.amount,
            { color: item.type === 'INCOME' ? '#34C759' : '#FFFFFF' }
          ]}>
            {item.type === 'INCOME' ? '+' : ''}{item.amount}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header Summary */}
      <View style={styles.header}>
        <Text style={styles.dateText}>{new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })}</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>今日支出</Text>
            <Text style={styles.summaryValueExpense}>{todayExpense}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>今日收入</Text>
            <Text style={styles.summaryValueIncome}>{todayIncome}</Text>
          </View>
        </View>
      </View>

      {/* Transaction List */}
      <View style={styles.listContainer}>
        {transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#333" />
            <Text style={styles.emptyText}>今天還沒有記帳喔！</Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={(data) => {
          addTransaction(data);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    backgroundColor: '#1C1C1E',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  dateText: {
    color: '#EBEBF599',
    fontSize: 16,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 5,
  },
  summaryValueExpense: {
    color: '#FF453A',
    fontSize: 28,
    fontWeight: 'bold',
  },
  summaryValueIncome: {
    color: '#32D74B',
    fontSize: 28,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  listContent: {
    paddingVertical: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 15,
  },
  categoryTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  emptyText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9500', // Matches the orange '+' in the screenshot
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
