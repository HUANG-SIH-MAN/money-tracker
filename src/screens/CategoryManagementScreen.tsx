import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionContext';
import { Category, TransactionType } from '../types';

interface CategoryManagementScreenProps {
  onNavigate: (screen: 'HOME' | 'ANALYSIS' | 'SETTINGS' | 'RECURRING' | 'CATEGORIES', params?: any) => void;
  initialType?: TransactionType;
}

const AVAILABLE_ICONS = [
  'fast-food', 'bus', 'cart', 'home', 'game-controller', 'ellipsis-horizontal',
  'cash', 'gift', 'add-circle', 'shirt', 'medical', 'school', 'car',
  'airplane', 'restaurant', 'cafe', 'wallet', 'card', 'briefcase', 'fitness'
];

export default function CategoryManagementScreen({ onNavigate, initialType = 'EXPENSE' }: CategoryManagementScreenProps) {
  const { categories, addCategory, deleteCategory, reorderCategories } = useTransactions();
  const [type, setType] = useState<TransactionType>(initialType);
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('fast-food');

  const filteredCategories = categories.filter(c => c.type === type);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleCategoryPress = (id: string, index: number) => {
    if (!selectedId) {
      setSelectedId(id);
    } else if (selectedId === id) {
      setSelectedId(null);
    } else {
      // Swap logic
      const targetId = id;
      const sourceIndex = categories.findIndex(c => c.id === selectedId);
      const targetIndex = categories.findIndex(c => c.id === targetId);

      const newCategories = [...categories];
      [newCategories[sourceIndex], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[sourceIndex]];

      reorderCategories(newCategories);
      setSelectedId(null);
    }
  };

  const handleAdd = () => {
    if (!newCatName) return;
    addCategory({
      name: newCatName,
      icon: selectedIcon,
      type: type,
      color: type === 'EXPENSE' ? '#FF9500' : '#34C759'
    });
    setNewCatName('');
    setIsAdding(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('SETTINGS')}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>類別管理</Text>
        <TouchableOpacity onPress={() => setIsAdding(true)}>
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeBtn, type === 'EXPENSE' && styles.activeTypeBtn]}
          onPress={() => { setType('EXPENSE'); setSelectedId(null); }}
        >
          <Text style={[styles.typeBtnText, type === 'EXPENSE' && styles.activeTypeBtnText]}>支出</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, type === 'INCOME' && styles.activeTypeBtn]}
          onPress={() => { setType('INCOME'); setSelectedId(null); }}
        >
          <Text style={[styles.typeBtnText, type === 'INCOME' && styles.activeTypeBtnText]}>收入</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.instruction}>
        {selectedId ? '請選擇目的地類別進行交換' : '點擊一個類別來移動它的位置'}
      </Text>

      <ScrollView contentContainerStyle={styles.grid}>
        {filteredCategories.map((cat, index) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.catCard,
              selectedId === cat.id && styles.selectedCard
            ]}
            onPress={() => handleCategoryPress(cat.id, index)}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name={selectedId === cat.id ? "swap-horizontal" : "menu-outline"}
                size={16}
                color={selectedId === cat.id ? "#FF9500" : "#333"}
              />
              <TouchableOpacity onPress={() => deleteCategory(cat.id)}>
                <Ionicons name="trash-outline" size={16} color="#444" />
              </TouchableOpacity>
            </View>

            <View style={[styles.iconBox, { backgroundColor: cat.color + (selectedId === cat.id ? '44' : '22') }]}>
              <Ionicons name={cat.icon as any} size={28} color={cat.color} />
            </View>
            <Text style={[styles.catName, selectedId === cat.id && { color: '#FF9500' }]}>{cat.name}</Text>

            {selectedId && selectedId !== cat.id && (
              <View style={styles.dropOverlay}>
                <Ionicons name="arrow-undo" size={20} color="#FF9500" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={isAdding} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>新增自定義類別</Text>
            <TextInput
              style={styles.input}
              placeholder="類別名稱"
              placeholderTextColor="#666"
              value={newCatName}
              onChangeText={setNewCatName}
            />

            <Text style={styles.subTitle}>選擇圖示</Text>
            <FlatList
              data={AVAILABLE_ICONS}
              keyExtractor={(item) => item}
              numColumns={5}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.iconOption, selectedIcon === item && styles.selectedIconOption]}
                  onPress={() => setSelectedIcon(item)}
                >
                  <Ionicons name={item as any} size={24} color={selectedIcon === item ? '#FF9500' : '#888'} />
                </TouchableOpacity>
              )}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setIsAdding(false)}>
                <Text style={styles.modalBtnText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleAdd}>
                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>確認新增</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60, borderBottomWidth: 0.5, borderBottomColor: '#222' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  typeSelector: { flexDirection: 'row', margin: 15, backgroundColor: '#111', borderRadius: 10, padding: 4 },
  typeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTypeBtn: { backgroundColor: '#333' },
  typeBtnText: { color: '#666', fontWeight: 'bold' },
  activeTypeBtnText: { color: '#FFF' },
  instruction: { color: '#666', fontSize: 13, textAlign: 'center', marginBottom: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, paddingBottom: 100 },
  catCard: { width: '31.3%', backgroundColor: '#111', margin: '1%', borderRadius: 15, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  selectedCard: { borderColor: '#FF9500', borderWidth: 1, backgroundColor: '#1a1a1a' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  iconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  catName: { color: '#FFF', fontSize: 13, marginTop: 8, fontWeight: '500', height: 18 },
  dropOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,149,0,0.1)', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  actionBtn: { padding: 4 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#111', width: '85%', borderRadius: 20, padding: 25, maxHeight: '70%' },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#000', color: '#FFF', borderRadius: 10, padding: 15, marginBottom: 20 },
  subTitle: { color: '#888', marginBottom: 15 },
  iconOption: { flex: 1, alignItems: 'center', paddingVertical: 15 },
  selectedIconOption: { backgroundColor: '#333', borderRadius: 10 },
  modalButtons: { flexDirection: 'row', marginTop: 20 },
  modalBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  saveBtn: { backgroundColor: '#FF9500', borderRadius: 10 },
  modalBtnText: { color: '#888', fontWeight: 'bold' },

  bottomNav: { flexDirection: 'row', backgroundColor: '#080808', height: 75, borderTopWidth: 0.5, borderTopColor: '#222', position: 'absolute', bottom: 0, left: 0, right: 0 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  addBtn: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', marginTop: -12 },
  addIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FF9500', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  navLabel: { fontSize: 10, color: '#888', marginTop: 2 },
});
