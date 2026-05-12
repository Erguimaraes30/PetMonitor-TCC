import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { DataProvider } from './src/context/DataContext';
import { ThemeProvider } from './src/context/ThemeContext'; // Importe o novo contexto

export default function App() {
  return (
    <ThemeProvider> 
      <DataProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </DataProvider>
    </ThemeProvider>
  );
}