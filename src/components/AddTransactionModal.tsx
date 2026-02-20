import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TransactionType } from '../types';
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
  initialDate?: string;
}

export default function AddTransactionModal({
  visible,
  onClose,
  onSave,
  initialDate
}: AddTransactionModalProps) {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [displayValue, setDisplayValue] = useState('0');
  const [expression, setExpression] = useState('');
  const [isResultShown, setIsResultShown] = useState(false);

  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (visible) {
      setDisplayValue('0');
      setExpression('');
      setIsResultShown(false);
      setNote('');
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      const firstCat = DEFAULT_CATEGORIES.find(c => c.type === type);
      if (firstCat) setCategoryId(firstCat.id);
    }
  }, [visible, type, initialDate]);

  const evalExpression = (expr: string) => {
    try {
      // Basic math parser
      const cleanExpr = expr.replace(/×/g, '*').replace(/÷/g, '/');
      if (/[+\-*/]$/.test(cleanExpr)) return parseFloat(cleanExpr.slice(0, -1)) || 0;
      return new Function(`return ${cleanExpr}`)() || 0;
    } catch (e) {
      return 0;
    }
  };

  const handleKeyPress = (key: string) => {
    if (/[0-9]/.test(key)) {
      if (isResultShown) {
        setExpression(key);
        setDisplayValue(key);
        setIsResultShown(false);
      } else {
        const newExpr = expression === '0' ? key : expression + key;
        setExpression(newExpr);
        // Show only the current number being typed in the large display
        const parts = newExpr.split(/[+−×÷]/);
        setDisplayValue(parts[parts.length - 1] || '0');
      }
    } else if (key === '.') {
      const parts = expression.split(/[+−×÷]/);
      const lastPart = parts[parts.length - 1];
      if (!lastPart.includes('.')) {
        setExpression(expression + '.');
        setDisplayValue(displayValue + '.');
      }
    } else if (['+', '-', '×', '÷'].map(o => o === '-' ? '−' : o).includes(key) || key === '−') {
      const visualOp = key;
      const lastChar = expression.slice(-1);
      if (['+', '−', '×', '÷'].includes(lastChar)) {
        setExpression(expression.slice(0, -1) + visualOp);
      } else if (expression !== '') {
        // Calculate intermediate result to show in main display
        const res = evalExpression(expression.replace(/−/g, '-'));
        setDisplayValue(String(res));
        setExpression(expression + visualOp);
      }
      setIsResultShown(false);
    } else if (key === '=') {
      const res = evalExpression(expression.replace(/−/g, '-'));
      setDisplayValue(String(res));
      setExpression(String(res));
      setIsResultShown(true);
    } else if (key === 'C') {
      setExpression('');
      setDisplayValue('0');
      setIsResultShown(false);
    } else if (key === '⌫') {
      if (expression.length > 0) {
        const newExpr = expression.slice(0, -1);
        setExpression(newExpr);
        const parts = newExpr.split(/[+−×÷]/);
        setDisplayValue(parts[parts.length - 1] || '0');
      }
    }
  };

  const handleSave = () => {
    const finalAmount = evalExpression(expression.replace(/−/g, '-'));
    if (finalAmount > 0) {
      onSave({
        amount: finalAmount,
        type,
        categoryId,
        date,
        note,
      });
      onClose();
    }
  };

  const selectedCategory = DEFAULT_CATEGORIES.find(c => c.id === categoryId);

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.typeSelector}>
            {(['EXPENSE', 'INCOME'] as TransactionType[]).map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, type === t && styles.activeTypeBtn]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeBtnText, type === t && styles.activeTypeBtnText]}>
                  {t === 'EXPENSE' ? '支出' : '收入'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
            <Text style={styles.saveBtnText}>儲存</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form}>
          {/* Amount Display */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>金額</Text>
            <View style={styles.amountDisplay}>
              <Text style={styles.expressionText}>{expression}</Text>
              <Text style={styles.valueText}>{displayValue}</Text>
            </View>
          </View>

          {/* Category */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>類別</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catList}>
              {DEFAULT_CATEGORIES.filter(c => c.type === type).map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catIcon, categoryId === cat.id && styles.activeCatIcon]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Ionicons name={cat.icon as any} size={24} color={categoryId === cat.id ? '#FFF' : cat.color} />
                  <Text style={[styles.catName, categoryId === cat.id && styles.activeCatName]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Date */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>日期</Text>
            <TouchableOpacity style={styles.datePicker}>
              <Text style={styles.dateValue}>{date}</Text>
            </TouchableOpacity>
          </View>

          {/* Note */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>備註</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="輸入備註..."
              placeholderTextColor="#666"
              value={note}
              onChangeText={setNote}
            />
          </View>
        </ScrollView>

        {/* Calculator Keyboard */}
        <View style={styles.keyboard}>
          <View style={styles.keyRow}>
            {['7', '8', '9', '÷'].map(k => (
              <TouchableOpacity key={k} style={styles.key} onPress={() => handleKeyPress(k === '/' ? '÷' : k)}>
                <Text style={styles.keyText}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.keyRow}>
            {['4', '5', '6', '×'].map(k => (
              <TouchableOpacity key={k} style={styles.key} onPress={() => handleKeyPress(k)}>
                <Text style={styles.keyText}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.keyRow}>
            {['1', '2', '3', '−'].map(k => (
              <TouchableOpacity key={k} style={styles.key} onPress={() => handleKeyPress(k)}>
                <Text style={styles.keyText}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.keyRow}>
            {['C', '0', '.', '+'].map(k => (
              <TouchableOpacity key={k} style={styles.key} onPress={() => handleKeyPress(k)}>
                <Text style={styles.keyText}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.keyRow}>
            <TouchableOpacity style={[styles.key, { flex: 2 }]} onPress={() => handleKeyPress('⌫')}>
              <Ionicons name="backspace-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, { flex: 2, backgroundColor: '#FF9500' }]} onPress={() => handleKeyPress('=')}>
              <Text style={styles.keyText}>=</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 },
  headerBtn: { padding: 5 },
  saveBtnText: { color: '#FF9500', fontSize: 18, fontWeight: 'bold' },
  typeSelector: { flexDirection: 'row', backgroundColor: '#222', borderRadius: 20, padding: 2 },
  typeBtn: { paddingHorizontal: 20, paddingVertical: 6, borderRadius: 18 },
  activeTypeBtn: { backgroundColor: '#444' },
  typeBtnText: { color: '#888', fontSize: 14 },
  activeTypeBtnText: { color: '#FFF' },
  form: { flex: 1, padding: 15 },
  inputRow: { marginBottom: 20 },
  label: { color: '#888', fontSize: 14, marginBottom: 8 },
  amountDisplay: { backgroundColor: '#111', padding: 15, borderRadius: 10, alignItems: 'flex-end' },
  expressionText: { color: '#666', fontSize: 14, marginBottom: 4 },
  valueText: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  catList: { flexDirection: 'row' },
  catIcon: { alignItems: 'center', marginRight: 20, padding: 10, borderRadius: 10 },
  activeCatIcon: { backgroundColor: '#333' },
  catName: { color: '#666', fontSize: 12, marginTop: 4 },
  activeCatName: { color: '#FFF' },
  datePicker: { backgroundColor: '#111', padding: 12, borderRadius: 10 },
  dateValue: { color: '#FFF', fontSize: 16 },
  noteInput: { backgroundColor: '#111', color: '#FFF', padding: 12, borderRadius: 10, fontSize: 16 },
  keyboard: { backgroundColor: '#1c1c1c', paddingBottom: 20 },
  keyRow: { flexDirection: 'row' },
  key: { flex: 1, height: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: '#333', borderStyle: 'solid' },
  keyText: { color: '#FFF', fontSize: 20 },
});
