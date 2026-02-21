import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionContext';
import Svg, { G, Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface AnalysisScreenProps {
  onNavigate: (screen: 'HOME' | 'ANALYSIS' | 'SETTINGS' | 'RECURRING' | 'CATEGORIES', params?: any) => void;
}

export default function AnalysisScreen({ onNavigate }: AnalysisScreenProps) {
  const { transactions, categories } = useTransactions();
  const [periodType, setPeriodType] = useState<'MONTH' | 'YEAR'>('MONTH');
  const [analysisType, setAnalysisType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const periodLabel = useMemo(() => {
    if (periodType === 'MONTH') {
      return `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`;
    }
    return `${currentDate.getFullYear()}年`;
  }, [periodType, currentDate]);

  const filteredData = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      const sameYear = txDate.getFullYear() === currentDate.getFullYear();
      const sameMonth = txDate.getMonth() === currentDate.getMonth();
      const sameType = tx.type === analysisType;

      if (periodType === 'MONTH') {
        return sameYear && sameMonth && sameType;
      }
      return sameYear && sameType;
    });
  }, [transactions, periodType, analysisType, currentDate]);

  const stats = useMemo(() => {
    const categoryMap: { [key: string]: { amount: number; name: string; icon: string; color: string } } = {};
    let total = 0;

    filteredData.forEach(tx => {
      const cat = categories.find(c => c.id === tx.categoryId);
      if (cat) {
        if (!categoryMap[cat.id]) {
          categoryMap[cat.id] = { amount: 0, name: cat.name, icon: cat.icon, color: cat.color };
        }
        categoryMap[cat.id].amount += tx.amount;
        total += tx.amount;
      }
    });

    return {
      total,
      items: Object.entries(categoryMap)
        .sort((a, b) => b[1].amount - a[1].amount)
        .map(([id, info]) => ({ id, ...info, percent: total > 0 ? (info.amount / total) * 100 : 0 }))
    };
  }, [filteredData, categories]);

  const categoryDetails = useMemo(() => {
    if (!selectedCategoryId) return null;
    const cat = categories.find(c => c.id === selectedCategoryId);
    const txs = filteredData.filter(tx => tx.categoryId === selectedCategoryId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { cat, txs };
  }, [selectedCategoryId, filteredData, categories]);

  // Calculate average daily based on period
  const averageDaily = useMemo(() => {
    if (stats.total === 0) return 0;
    if (periodType === 'MONTH') {
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      return Math.round(stats.total / daysInMonth);
    } else {
      const isLeap = (year: number) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
      const daysInYear = isLeap(currentDate.getFullYear()) ? 366 : 365;
      return Math.round(stats.total / daysInYear);
    }
  }, [stats.total, periodType, currentDate]);

  const changePeriod = (dir: number) => {
    const next = new Date(currentDate);
    if (periodType === 'MONTH') {
      next.setMonth(next.getMonth() + dir);
    } else {
      next.setFullYear(next.getFullYear() + dir);
    }
    setCurrentDate(next);
  };

  // Pie Chart Rendering Logic
  const renderPieChart = () => {
    if (stats.total === 0) {
      return (
        <View style={styles.emptyChart}>
          <Circle cx="100" cy="100" r="80" fill="#222" />
          <Text style={styles.emptyChartText}>尚無資料</Text>
        </View>
      );
    }

    let currentAngle = 0;
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    return stats.items.map((item, index) => {
      const percentage = item.amount / stats.total;
      const angle = percentage * 360;

      // Calculate path for pie slice
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      const x1 = centerX + radius * Math.cos((Math.PI * startAngle) / 180);
      const y1 = centerY + radius * Math.sin((Math.PI * startAngle) / 180);
      const x2 = centerX + radius * Math.cos((Math.PI * endAngle) / 180);
      const y2 = centerY + radius * Math.sin((Math.PI * endAngle) / 180);

      const largeArcFlag = angle > 180 ? 1 : 0;
      const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      currentAngle += angle;

      return (
        <Path
          key={index}
          d={pathData}
          fill={item.color}
        />
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Tabs */}
      <View style={styles.topTabs}>
        <TouchableOpacity
          style={[styles.topTab, periodType === 'MONTH' && styles.activeTopTab]}
          onPress={() => setPeriodType('MONTH')}
        >
          <Text style={[styles.topTabText, periodType === 'MONTH' && styles.activeTopTabText]}>月</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.topTab, periodType === 'YEAR' && styles.activeTopTab]}
          onPress={() => setPeriodType('YEAR')}
        >
          <Text style={[styles.topTabText, periodType === 'YEAR' && styles.activeTopTabText]}>年</Text>
        </TouchableOpacity>
      </View>

      {/* Period Navigation */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => changePeriod(-1)}>
          <Ionicons name="chevron-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.periodText}>{periodLabel}</Text>
        <TouchableOpacity onPress={() => changePeriod(1)}>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Sub-Tabs */}
      <View style={styles.subTabsContainer}>
        <TouchableOpacity
          style={[styles.subTab, analysisType === 'EXPENSE' && styles.activeSubTab]}
          onPress={() => setAnalysisType('EXPENSE')}
        >
          <Text style={[styles.subTabText, analysisType === 'EXPENSE' && styles.activeSubTabText]}>
            支出類別比
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.subTab, analysisType === 'INCOME' && styles.activeSubTab]}
          onPress={() => setAnalysisType('INCOME')}
        >
          <Text style={[styles.subTabText, analysisType === 'INCOME' && styles.activeSubTabText]}>
            收入類別比
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedCategoryId && categoryDetails ? (
          /* Detail View */
          <View>
            <View style={styles.detailHeader}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedCategoryId(null)}>
                <Ionicons name="chevron-back" size={24} color="#FF9500" />
                <Text style={styles.backText}>返回</Text>
              </TouchableOpacity>
              <View style={styles.detailTitleInfo}>
                <View style={[styles.iconBox, { backgroundColor: categoryDetails.cat?.color }]}>
                  <Ionicons name={categoryDetails.cat?.icon as any} size={16} color="#FFF" />
                </View>
                <Text style={styles.detailTitle}>{categoryDetails.cat?.name}</Text>
              </View>
              <Text style={styles.detailTotal}>
                ${stats.items.find(i => i.name === categoryDetails.cat?.name)?.amount.toLocaleString()}
              </Text>
            </View>

            {categoryDetails.txs.map((tx, idx) => {
              const showMonthHeader = idx === 0 ||
                new Date(tx.date).getMonth() !== new Date(categoryDetails.txs[idx - 1].date).getMonth();
              const txDate = new Date(tx.date);

              return (
                <View key={tx.id}>
                  {showMonthHeader && (
                    <View style={styles.monthHeader}>
                      <Text style={styles.monthHeaderText}>
                        {txDate.getFullYear()}年{txDate.getMonth() + 1}月
                      </Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <View style={styles.detailDateBox}>
                      <Text style={styles.detailDateDay}>{txDate.getDate()}</Text>
                      <Text style={styles.detailDateMonth}>{txDate.getMonth() + 1}月</Text>
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailNote}>{tx.note || '無備註'}</Text>
                      <Text style={styles.detailSubText}>
                        {txDate.getFullYear()}/{txDate.getMonth() + 1}/{txDate.getDate()}
                      </Text>
                    </View>
                    <Text style={[styles.detailAmount, { color: categoryDetails.cat?.color }]}>
                      {tx.amount.toLocaleString()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          /* Summary View */
          <>
            {/* Pie Chart Section */}
            <View style={styles.chartArea}>
              <View style={styles.chartWrapper}>
                <Svg height="180" width="180" viewBox="0 0 200 200">
                  <G rotation="-90" origin="100, 100">
                    {renderPieChart()}
                    {/* Donut hole */}
                    <Circle cx="100" cy="100" r="40" fill="#000" />
                  </G>
                </Svg>
              </View>

              {/* Legend */}
              <View style={styles.legend}>
                {stats.items.slice(0, 6).map((item, i) => {
                  return (
                    <TouchableOpacity
                      key={i}
                      style={styles.legendItem}
                      onPress={() => setSelectedCategoryId(item.id)}
                    >
                      <View style={[styles.dot, { backgroundColor: item.color }]} />
                      <Text style={styles.legendText} numberOfLines={1}>{item.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Summary Info */}
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryTitle}>
                合計: <Text style={styles.summaryValue}>{stats.total.toLocaleString()}</Text>
              </Text>
              <Text style={styles.summaryTitle}>
                平均每天: <Text style={styles.summaryValue}>{averageDaily.toLocaleString()}</Text>
              </Text>
            </View>

            {/* List Header */}
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>#</Text>
              <Text style={[styles.listHeaderText, { flex: 1, marginLeft: 25 }]}>類別</Text>
              <Text style={[styles.listHeaderText, { width: 100, textAlign: 'right' }]}>金額</Text>
              <Text style={[styles.listHeaderText, { width: 80, textAlign: 'right' }]}>比例</Text>
            </View>

            {/* Statistics List */}
            {stats.items.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.statRow}
                  onPress={() => setSelectedCategoryId(item.id)}
                >
                  <Text style={styles.rankText}>{index + 1}</Text>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                      <Ionicons name={item.icon as any} size={16} color="#FFF" />
                    </View>
                    <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
                  </View>
                  <Text style={[styles.amountText, { color: item.color }]}>
                    {item.amount.toLocaleString()}
                  </Text>
                  <Text style={[styles.percentageText, { color: item.color }]}>
                    {stats.total > 0 ? ((item.amount / stats.total) * 100).toFixed(2) : '0.00'}%
                  </Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}

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
          <Ionicons name="pie-chart" size={24} color="#FF9500" />
          <Text style={[styles.navLabel, { color: '#FF9500' }]}>分析</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('SETTINGS')}>
          <Ionicons name="settings-outline" size={24} color="#888" />
          <Text style={styles.navLabel}>設定</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topTabs: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222',
  },
  topTab: {
    paddingHorizontal: 15,
    height: '100%',
    justifyContent: 'center',
  },
  activeTopTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFF',
  },
  topTabText: { color: '#666', fontSize: 16 },
  activeTopTabText: { color: '#FFF' },
  topIcons: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  periodText: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginHorizontal: 30 },
  subTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  subTab: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  activeSubTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF9500',
  },
  subTabText: { color: '#666', fontSize: 13 },
  activeSubTabText: { color: '#FF9500' },
  content: { flex: 1 },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  chartWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  emptyChart: {
    height: 180,
    width: 180,
    borderRadius: 90,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: { color: '#444' },
  legend: { marginLeft: 30, maxWidth: 120 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  legendText: { color: '#AAA', fontSize: 13 },
  summaryInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 0.5,
    borderTopColor: '#222',
  },
  summaryTitle: { color: '#888', fontSize: 20, marginBottom: 8 },
  summaryValue: { color: '#FFF', fontWeight: 'bold' },
  listHeader: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#1A1A1A',
  },
  listHeaderText: { color: '#555', fontSize: 12, fontWeight: 'bold' },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: '#111',
  },
  rankText: { color: '#444', fontSize: 14, width: 20, textAlign: 'center' },
  categoryInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 15 },
  iconBox: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  categoryName: { color: '#FFF', fontSize: 17, fontWeight: '500' },
  amountText: { width: 100, textAlign: 'right', fontSize: 17, fontWeight: 'bold' },
  percentageText: { width: 80, textAlign: 'right', fontSize: 14, opacity: 0.9 },
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
  addIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FF9500', justifyContent: 'center', alignItems: 'center', marginBottom: 4, elevation: 8, shadowColor: '#FF9500', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6 },
  navLabel: { fontSize: 10, color: '#888', marginTop: 2 },

  // Detail View Styles
  detailHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 0.5, borderBottomColor: '#111' },
  backBtn: { flexDirection: 'row', alignItems: 'center', width: 80 },
  backText: { color: '#FF9500', fontSize: 16, marginLeft: -5 },
  detailTitleInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  detailTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  detailTotal: { color: '#FFF', fontSize: 18, fontWeight: 'bold', width: 80, textAlign: 'right' },
  monthHeader: { backgroundColor: '#0A0A0A', paddingHorizontal: 20, paddingVertical: 10, borderTopWidth: 0.5, borderTopColor: '#1A1A1A' },
  monthHeaderText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  detailRow: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 0.5, borderBottomColor: '#050505' },
  detailDateBox: { alignItems: 'center', width: 40 },
  detailDateDay: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  detailDateMonth: { color: '#666', fontSize: 10 },
  detailContent: { flex: 1, marginLeft: 20 },
  detailNote: { color: '#FFF', fontSize: 16 },
  detailSubText: { color: '#444', fontSize: 12, marginTop: 4 },
  detailAmount: { fontSize: 18, fontWeight: 'bold' },
});
