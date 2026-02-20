import React, { useState } from 'react';
import HomeScreen from './src/screens/HomeScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import { TransactionProvider } from './src/context/TransactionContext';
import { View, StyleSheet } from 'react-native';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'HOME' | 'ANALYSIS'>('HOME');

  return (
    <TransactionProvider>
      <View style={styles.container}>
        {currentScreen === 'HOME' ? (
          <HomeScreen onNavigate={setCurrentScreen} />
        ) : (
          <AnalysisScreen onNavigate={setCurrentScreen} />
        )}
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
