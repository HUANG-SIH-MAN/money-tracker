import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionContext';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { TransactionType } from '../types';

interface RecurringTransactionsScreenProps {
  onNavigate: (screen: 'HOME' | 'ANALYSIS' | 'SETTINGS' | 'RECURRING' | 'CATEGORIES', params?: any) => void;
}

export default function RecurringTransactionsScreen({ onNavigate }: RecurringTransactionsScreenProps) {
  const { recurringTransactions, addRecurringTransaction, deleteRecurringTransaction, categories } = useTransactions();
  const [modalVisible, setModalVisible] = useState(false);
  const [isCatPickerVisible, setIsCatPickerVisible] = useState(false);

  // Modal State
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('1');

  const totals = useMemo(() => {
    return recurringTransactions.reduce((acc, tx) => {
      if (tx.type === 'EXPENSE') acc.expense += tx.amount;
      else acc.income += tx.amount;
      return acc;
    }, { expense: 0, income: 0 });
  }, [recurringTransactions]);

  const handleSave = () => {
    if (!amount || !categoryId) return;
    addRecurringTransaction({
      amount: parseFloat(amount),
      type,
      categoryId,
      note,
      dayOfMonth: parseInt(dayOfMonth),
      frequency: 'MONTHLY'
    });
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setAmount('');
    setNote('');
    setCategoryId('');
    setDayOfMonth('1');
  };

  const getCategory = (id: string) => categories.find(c => c.id === id);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('SETTINGS')} style={styles.headerBtn}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>固定收支</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.headerBtn}>
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
      {/* ... rest of the component remains same ... */}

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          每月(收入:{totals.income.toLocaleString()} 支出:{totals.expense.toLocaleString()})
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {recurringTransactions.map((item) => {
          const cat = getCategory(item.categoryId);
          return (
            <View key={item.id} style={styles.itemRow}>
              <View style={[styles.iconBox, { backgroundColor: cat?.color + '22' }]}>
                <Ionicons name={cat?.icon as any} size={20} color={cat?.color} />
              </View>
              <View style={styles.itemMain}>
                <View style={styles.itemTop}>
                  <Text style={styles.itemName}>{item.note || cat?.name}</Text>
                  <Text style={[styles.itemAmount, item.type === 'INCOME' && styles.incomeText]}>
                    {item.amount.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.itemBottom}>
                  <Text style={styles.itemSubText}>{cat?.name} | 每月({item.dayOfMonth}日)</Text>
                  <TouchableOpacity onPress={() => deleteRecurringTransaction(item.id)}>
                    <Ionicons name="trash-outline" size={16} color="#444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('HOME')}>
          <Ionicons name="book" size={24} color="#888" />
          <Text style={styles.navLabel}>帳本</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addBtn} onPress={() => onNavigate('HOME')}>
          <View style={styles.addIconBg}>
            <Ionicons name="add" size={32} color="#FFF" />
          </View>
          <Text style={styles.navLabel}>記一筆</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('ANALYSIS')}>
          <Ionicons name="pie-chart" size={24} color="#888" />
          <Text style={styles.navLabel}>分析</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('SETTINGS')}>
          <Ionicons name="settings" size={24} color="#FF9500" />
          <Text style={[styles.navLabel, { color: '#FF9500' }]}>設定</Text>
        </TouchableOpacity>
      </View>

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalHeaderBtn}>
                <Ionicons name="close" size={28} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.modalTabs}>
                <TouchableOpacity
                  style={[styles.modalTab, type === 'EXPENSE' && styles.activeModalTab]}
                  onPress={() => setType('EXPENSE')}
                >
                  <Text style={[styles.modalTabText, type === 'EXPENSE' && styles.activeModalTabText]}>支出</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalTab, type === 'INCOME' && styles.activeModalTab]}
                  onPress={() => setType('INCOME')}
                >
                  <Text style={[styles.modalTabText, type === 'INCOME' && styles.activeModalTabText]}>收入</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={handleSave} style={styles.modalHeaderBtn}>
                <Ionicons name="download-outline" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContent}>
              {/* Title Group */}
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.titleInput}
                  placeholder="標題"
                  placeholderTextColor="#666"
                  value={note}
                  onChangeText={setNote}
                />
              </View>

              <View style={styles.formSection}>
                {/* Amount Row */}
                <View style={styles.formItem}>
                  <Ionicons name="wallet-outline" size={22} color="#AAA" style={styles.formIcon} />
                  <Text style={styles.formLabel}>金額</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#333"
                    textAlign="right"
                  />
                </View>

                {/* Category Row */}
                <TouchableOpacity
                  style={styles.formItem}
                  onPress={() => setIsCatPickerVisible(true)}
                >
                  <Ionicons name="cart-outline" size={22} color="#AAA" style={styles.formIcon} />
                  <Text style={styles.formLabel}>類別</Text>
                  <Text style={[styles.formValue, !categoryId && { color: '#333' }]}>
                    {getCategory(categoryId)?.name || '點擊選擇'}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={styles.formSection}>
                {/* Frequency Row (Locked to Monthly for now) */}
                <View style={[styles.formItem, { opacity: 0.7 }]}>
                  <Ionicons name="repeat-outline" size={22} color="#AAA" style={styles.formIcon} />
                  <Text style={styles.formLabel}>重複</Text>
                  <Text style={styles.formValue}>每月</Text>
                  <Ionicons name="chevron-forward" size={18} color="#333" />
                </View>

                {/* Day Row */}
                <View style={styles.formItem}>
                  <Ionicons name="time-outline" size={22} color="#AAA" style={styles.formIcon} />
                  <Text style={styles.formLabel}>執行日期</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={dayOfMonth}
                    onChangeText={setDayOfMonth}
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor="#333"
                    textAlign="right"
                  />
                  <Text style={{ color: '#FFF', marginLeft: 5 }}>日</Text>
                </View>
              </View>
            </ScrollView>

            {/* Category Sub-Modal Picker */}
            <Modal visible={isCatPickerVisible} animationType="slide" transparent={true}>
              <View style={styles.subModalOverlay}>
                <View style={styles.subModalContent}>
                  <View style={styles.subModalHeader}>
                    <Text style={styles.subModalTitle}>選擇類別</Text>
                    <TouchableOpacity onPress={() => setIsCatPickerVisible(false)}>
                      <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={categories.filter(c => c.type === type)}
                    keyExtractor={(item) => item.id}
                    numColumns={3}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[styles.catPickerItem, categoryId === item.id && { backgroundColor: '#333' }]}
                        onPress={() => {
                          setCategoryId(item.id);
                          setIsCatPickerVisible(false);
                        }}
                      >
                        <Ionicons name={item.icon as any} size={28} color={item.color} />
                        <Text style={styles.catPickerLabel}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </Modal>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, height: 60, borderBottomWidth: 0.5, borderBottomColor: '#222' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  headerBtn: { padding: 5 },
  summaryContainer: { backgroundColor: '#111', paddingVertical: 10, paddingHorizontal: 20 },
  summaryText: { color: '#888', fontSize: 14 },
  content: { flex: 1 },
  itemRow: { flexDirection: 'row', padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#111', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemMain: { flex: 1 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  itemName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  itemAmount: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  incomeText: { color: '#34C759' },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemSubText: { color: '#666', fontSize: 12 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#000', height: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222'
  },
  modalHeaderBtn: { padding: 5 },
  modalTabs: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 2
  },
  modalTab: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 6
  },
  activeModalTab: { backgroundColor: '#333' },
  modalTabText: { color: '#666', fontSize: 14, fontWeight: 'bold' },
  activeModalTabText: { color: '#FFF' },

  formContent: { flex: 1 },
  inputRow: {
    backgroundColor: '#111',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 15
  },
  titleInput: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  formSection: {
    backgroundColor: '#111',
    marginTop: 15,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#222'
  },
  formItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222'
  },
  formIcon: { marginRight: 15 },
  formLabel: { flex: 1, color: '#FFF', fontSize: 16 },
  amountInput: { color: '#FFF', fontSize: 16, flex: 1 },
  formValue: { color: '#FFF', fontSize: 16, marginRight: 10 },

  // Sub Modal
  subModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center' },
  subModalContent: { backgroundColor: '#111', margin: 20, borderRadius: 20, padding: 20, maxHeight: '80%' },
  subModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  subModalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  catPickerItem: { flex: 1, alignItems: 'center', padding: 15, margin: 5, borderRadius: 10 },
  catPickerLabel: { color: '#888', fontSize: 12, marginTop: 5 },

  // Other Existing Styles
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#080808',
    height: 75,
    borderTopWidth: 0.5,
    borderTopColor: '#222',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  addBtn: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', marginTop: -12 },
  addIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FF9500', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  navLabel: { fontSize: 10, color: '#888', marginTop: 2 },
});
