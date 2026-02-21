import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingItem {
  label: string;
  icon: string;
  action?: () => void;
  value?: string;
}

interface SettingsScreenProps {
  onNavigate: (screen: 'HOME' | 'ANALYSIS' | 'SETTINGS' | 'RECURRING' | 'CATEGORIES', params?: any) => void;
}

export default function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const sections: { title: string; items: SettingItem[] }[] = [
    {
      title: '基本設定',
      items: [
        { label: '固定收支', icon: 'repeat-outline', action: () => onNavigate('RECURRING') },
        { label: '支出類別管理', icon: 'list-outline', action: () => onNavigate('CATEGORIES', 'EXPENSE') },
        { label: '收入類別管理', icon: 'add-circle-outline', action: () => onNavigate('CATEGORIES', 'INCOME') },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>設定</Text>
      </View>

      <ScrollView style={styles.content}>
        {sections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionItems}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.itemRow}
                  onPress={item.action}
                  activeOpacity={item.action ? 0.7 : 1}
                >
                  <Ionicons name={item.icon as any} size={22} color="#AAA" />
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  {item.value && <Text style={styles.itemValue}>{item.value}</Text>}
                  <Ionicons name="chevron-forward" size={20} color="#333" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { height: 60, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: '#222' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1 },
  section: { marginTop: 20 },
  sectionTitle: { color: '#666', fontSize: 14, marginLeft: 20, marginBottom: 10 },
  sectionItems: { backgroundColor: '#111', borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#222' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222'
  },
  itemLabel: { flex: 1, color: '#FFF', fontSize: 16, marginLeft: 15 },
  itemValue: { color: '#888', marginRight: 10, fontSize: 14 },
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
