import React, { useState, useMemo } from 'react';
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
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Setup Chinese locale for calendar
LocaleConfig.locales['zh'] = {
  monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
  today: '今天'
};
LocaleConfig.defaultLocale = 'zh';

export default function HomeScreen() {
  const { transactions, addTransaction, isLoading } = useTransactions();
  const [modalVisible, setModalVisible] = useState(false);

  // Use local-safe date initialization
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  );

  const getCategory = (id: string) => {
    return DEFAULT_CATEGORIES.find(c => c.id === id);
  };

  // Helper to format local YYYY-MM-DD
  const formatLocalDay = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Monthly totals based on the currently viewed month (from selectedDate)
  const monthlyTotals = useMemo(() => {
    const currentMonth = selectedDate.substring(0, 7);
    return transactions
      .filter(tx => tx.date.startsWith(currentMonth))
      .reduce((acc, tx) => {
        if (tx.type === 'EXPENSE') acc.expense += tx.amount;
        else acc.income += tx.amount;
        return acc;
      }, { expense: 0, income: 0 });
  }, [transactions, selectedDate]);

  // Daily filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => tx.date === selectedDate);
  }, [transactions, selectedDate]);

  // Calendar marking
  const markedDates = useMemo(() => {
    const marks: any = {};
    transactions.forEach(tx => {
      if (!marks[tx.date]) {
        marks[tx.date] = { marked: true, dots: [] };
      }
      const dotColor = tx.type === 'EXPENSE' ? '#FF453A' : '#34C759';
      if (!marks[tx.date].dots.find((d: any) => d.key === tx.type)) {
        marks[tx.date].dots.push({ key: tx.type, color: dotColor });
      }
    });
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: '#FF9500'
    };
    return marks;
  }, [transactions, selectedDate]);

  const changeMonth = (direction: number) => {
    const [year, month] = selectedDate.split('-').map(Number);
    // Create new date at the 1st of the target month in local time
    const newDate = new Date(year, month - 1 + direction, 1);
    setSelectedDate(formatLocalDay(newDate));
  };

  const renderItem = ({ item }: { item: any }) => {
    const category = getCategory(item.categoryId);
    return (
      <View style={styles.transactionItem}>
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

      {/* Header with Monthly summary & Navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonth(-1)} hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{selectedDate.split('-')[0]}年{parseInt(selectedDate.split('-')[1])}月</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.miniLabel}>支出: <Text style={styles.miniValue}>${monthlyTotals.expense.toLocaleString()}</Text></Text>
            <Text style={[styles.miniLabel, { marginLeft: 15 }]}>收入: <Text style={[styles.miniValue, { color: '#66BB6A' }]}>${monthlyTotals.income.toLocaleString()}</Text></Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => changeMonth(1)} hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}>
          <Ionicons name="chevron-forward" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Calendar Section */}
      <View style={styles.calendarContainer}>
        <Calendar
          key={selectedDate.substring(0, 7)}
          current={selectedDate}
          markingType={'multi-dot'}
          markedDates={markedDates}
          onDayPress={day => setSelectedDate(day.dateString)}
          theme={{
            backgroundColor: '#000',
            calendarBackground: '#000',
            textSectionTitleColor: '#666',
            selectedDayBackgroundColor: '#FF9500',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#FF9500',
            dayTextColor: '#fff',
            textDisabledColor: '#333',
            monthTextColor: '#fff',
            indicatorColor: 'orange',
            textDayFontSize: 14,
            textMonthFontSize: 0,
            textDayHeaderFontSize: 12,
          }}
          headerStyle={{ height: 0 }}
          hideArrows={true}
        />
      </View>

      {/* Daily List Header */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>{selectedDate.replace(/-/g, '/')} 的紀錄</Text>
        <Text style={styles.txCount}>共 {filteredTransactions.length} 筆</Text>
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={40} color="#222" />
            <Text style={styles.emptyText}>今天沒有紀錄呢</Text>
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
        initialDate={selectedDate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  summaryRow: { flexDirection: 'row', marginTop: 4 },
  miniLabel: { color: '#666', fontSize: 12 },
  miniValue: { color: '#AAA' },
  headerIcon: { padding: 5 },
  calendarContainer: { backgroundColor: '#000', borderBottomWidth: 0.5, borderBottomColor: '#1A1A1A' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, marginBottom: 10 },
  listTitle: { color: '#888', fontSize: 14 },
  txCount: { color: '#444', fontSize: 12 },
  listContent: { paddingBottom: 100 },
  transactionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0A0A', padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#111' },
  iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemMain: { flex: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemCategory: { color: '#FFF', fontSize: 16, fontWeight: '500' },
  itemAmount: { fontSize: 17, fontWeight: 'bold' },
  expenseText: { color: '#FFF' },
  incomeText: { color: '#34C759' },
  itemNote: { color: '#666', fontSize: 13, marginTop: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#333', marginTop: 10, fontSize: 14 },
  fab: { position: 'absolute', right: 25, bottom: 25, width: 65, height: 65, borderRadius: 32.5, backgroundColor: '#FF9500', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65 },
});
