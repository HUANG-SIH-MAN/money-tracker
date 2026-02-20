import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransactionType, Category } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/categories';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    amount: number;
    type: TransactionType;
    categoryId: string;
    date: string;
    note: string;
  }) => void;
}

export default function AddTransactionModal({ visible, onClose, onSave }: AddTransactionModalProps) {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('0');
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORIES.find(c => c.type === 'EXPENSE')?.id || '');
  const [note, setNote] = useState('');

  const categories = DEFAULT_CATEGORIES.filter(c => c.type === type);

  const handleKeyPress = (key: string) => {
    if (key === 'C') {
      setAmount('0');
    } else if (key === '⌫') {
      setAmount(amount.length > 1 ? amount.slice(0, -1) : '0');
    } else if (key === '.') {
      if (!amount.includes('.')) setAmount(amount + '.');
    } else {
      setAmount(amount === '0' ? key : amount + key);
    }
  };

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onSave({
        amount: numAmount,
        type,
        categoryId,
        date: new Date().toISOString().split('T')[0],
        note,
      });
      // Reset and close
      setAmount('0');
      setNote('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, type === 'EXPENSE' && styles.activeTab]}
              onPress={() => {
                setType('EXPENSE');
                setCategoryId(DEFAULT_CATEGORIES.find(c => c.type === 'EXPENSE')?.id || '');
              }}
            >
              <Text style={[styles.tabText, type === 'EXPENSE' && styles.activeTabText]}>支出</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, type === 'INCOME' && styles.activeTab]}
              onPress={() => {
                setType('INCOME');
                setCategoryId(DEFAULT_CATEGORIES.find(c => c.type === 'INCOME')?.id || '');
              }}
            >
              <Text style={[styles.tabText, type === 'INCOME' && styles.activeTabText]}>收入</Text>
            </TouchableOpacity>
          </View>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.inputRow}>
            <Ionicons name="cash-outline" size={24} color="#666" />
            <Text style={styles.label}>金額</Text>
            <Text style={styles.amountDisplay}>$ {amount}</Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>選擇分類</Text>
          </View>

          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryItem,
                  categoryId === cat.id && { backgroundColor: cat.color + '20', borderColor: cat.color }
                ]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={24}
                  color={categoryId === cat.id ? cat.color : '#666'}
                />
                <Text style={[
                  styles.categoryName,
                  categoryId === cat.id && { color: cat.color, fontWeight: 'bold' }
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="create-outline" size={24} color="#666" />
            <TextInput
              style={styles.noteInput}
              placeholder="備註 (選填)"
              value={note}
              onChangeText={setNote}
            />
          </View>
        </ScrollView>

        {/* Number Pad */}
        <View style={styles.numPad}>
          <View style={styles.numRow}>
            {['1', '2', '3'].map(k => (
              <TouchableOpacity key={k} style={styles.numBtn} onPress={() => handleKeyPress(k)}>
                <Text style={styles.numText}>{k}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.numBtn, styles.actionBtn]} onPress={() => handleKeyPress('⌫')}>
              <Ionicons name="backspace-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <View style={styles.numRow}>
            {['4', '5', '6'].map(k => (
              <TouchableOpacity key={k} style={styles.numBtn} onPress={() => handleKeyPress(k)}>
                <Text style={styles.numText}>{k}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.numBtn, styles.actionBtn]} onPress={() => handleKeyPress('C')}>
              <Text style={styles.numText}>C</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.numRow}>
            {['7', '8', '9'].map(k => (
              <TouchableOpacity key={k} style={styles.numBtn} onPress={() => handleKeyPress(k)}>
                <Text style={styles.numText}>{k}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.numBtn, styles.saveBtn]}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.numRow}>
            <TouchableOpacity style={[styles.numBtn, { flex: 2 }]} onPress={() => handleKeyPress('0')}>
              <Text style={styles.numText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.numBtn} onPress={() => handleKeyPress('.')}>
              <Text style={styles.numText}>.</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    padding: 2,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 18,
  },
  activeTab: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#333',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 18,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  amountDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  sectionHeader: {
    padding: 15,
    backgroundColor: '#F8F9FA',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  categoryItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 10,
  },
  categoryName: {
    fontSize: 12,
    marginTop: 5,
    color: '#666',
  },
  noteInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  numPad: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  numRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  numBtn: {
    flex: 1,
    height: 60,
    backgroundColor: '#FFF',
    marginHorizontal: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  numText: {
    fontSize: 22,
    color: '#333',
  },
  actionBtn: {
    backgroundColor: '#E9ECEF',
  },
  saveBtn: {
    backgroundColor: '#007AFF',
    height: 60, // Simplified, as rowSpan isn't directly supported in this layout
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
