import React, { useState } from 'react';
import HomeScreen from './src/screens/HomeScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import RecurringTransactionsScreen from './src/screens/RecurringTransactionsScreen';
import CategoryManagementScreen from './src/screens/CategoryManagementScreen';
import { TransactionProvider } from './src/context/TransactionContext';
import { View, StyleSheet } from 'react-native';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'HOME' | 'ANALYSIS' | 'SETTINGS' | 'RECURRING' | 'CATEGORIES'>('HOME');
  const [initialCategoryType, setInitialCategoryType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');

  const navigateTo = (screen: any, params?: any) => {
    if (screen === 'CATEGORIES' && params) {
      setInitialCategoryType(params);
    }
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'HOME':
        return <HomeScreen onNavigate={navigateTo} />;
      case 'ANALYSIS':
        return <AnalysisScreen onNavigate={navigateTo} />;
      case 'SETTINGS':
        return <SettingsScreen onNavigate={navigateTo} />;
      case 'RECURRING':
        return <RecurringTransactionsScreen onNavigate={navigateTo} />;
      case 'CATEGORIES':
        return <CategoryManagementScreen onNavigate={navigateTo} initialType={initialCategoryType} />;
      default:
        return <HomeScreen onNavigate={navigateTo} />;
    }
  };

  return (
    <TransactionProvider>
      <View style={styles.container}>
        {renderScreen()}
      </View>
    </TransactionProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
