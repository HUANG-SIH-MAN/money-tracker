import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionContext';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import AddTransactionModal from '../components/AddTransactionModal';

export default function HomeScreen() {
  const { transactions, addTransaction, isLoading } = useTransactions();
  const [modalVisible, setModalVisible] = useState(false);

  const getCategory = (id: string) => {
    return DEFAULT_CATEGORIES.find(c => c.id === id);
  };

  const totals = transactions.reduce((acc, tx) => {
    if (tx.type === 'EXPENSE') acc.expense += tx.amount;
    else acc.income += tx.amount;
    return acc;
  }, { expense: 0, income: 0 });

  const renderItem = ({ item }: { item: any }) => {
    const category = getCategory(item.categoryId);
    return (
      <View style={styles.transactionItem}>
        <View style={styles.itemDateContainer}>
          <Text style={styles.itemDate}>{item.date.split('-').slice(1).join('/')}</Text>
        </View>
        <View style={[styles.iconBox, { backgroundColor: category?.color + '22' || '#333' }]}>
          <Ionicons name={category?.icon as any || 'help'} size={20} color={category?.color || '#FFF'} />
        </View>
        <View style={styles.itemMain}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemCategory}>{category?.name || '未知'}</Text>
            <Text style={[styles.itemAmount, item.type === 'INCOME' ? styles.incomeText : styles.expenseText]}>
              {item.type === 'INCOME' ? '+' : '-'}{item.amount.toLocaleString()}
            </Text>
          </View>
          <Text style={styles.itemNote} numberOfLines={1}>
            {item.note || '無備註'}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#FF9500" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Simple Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的記帳本</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="search" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>本月支出</Text>
          <Text style={styles.summaryValue}>${totals.expense.toLocaleString()}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>本月收入</Text>
          <Text style={[styles.summaryValue, { color: '#66BB6A' }]}>${totals.income.toLocaleString()}</Text>
        </View>
      </View>

      {/* Transaction List */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>最近紀錄</Text>
        <Text style={styles.txCount}>共 {transactions.length} 筆</Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={60} color="#222" />
            <Text style={styles.emptyText}>點擊下方按鈕開始記帳吧！</Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={36} color="#000" />
      </TouchableOpacity>

      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={(data) => addTransaction(data)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  headerIcon: { padding: 5 },
  summaryCard: { flexDirection: 'row', backgroundColor: '#111', margin: 15, borderRadius: 15, padding: 20, alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: '#888', fontSize: 12, marginBottom: 5 },
  summaryValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  divider: { width: 1, height: 30, backgroundColor: '#222' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  listTitle: { color: '#888', fontSize: 14 },
  txCount: { color: '#444', fontSize: 12 },
  listContent: { paddingBottom: 100 },
  transactionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0A0A', padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#111' },
  itemDateContainer: { width: 45 },
  itemDate: { color: '#444', fontSize: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 },
  itemMain: { flex: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemCategory: { color: '#FFF', fontSize: 16, fontWeight: '500' },
  itemAmount: { fontSize: 17, fontWeight: 'bold' },
  expenseText: { color: '#FFF' },
  incomeText: { color: '#66BB6A' },
  itemNote: { color: '#666', fontSize: 13, marginTop: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#333', marginTop: 15 },
  fab: { position: 'absolute', right: 25, bottom: 25, width: 65, height: 65, borderRadius: 32.5, backgroundColor: '#FF9500', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65 },
});
