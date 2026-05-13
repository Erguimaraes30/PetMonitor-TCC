import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { DataProvider } from './src/context/DataContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import './src/constants/i18n';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <DataProvider>
          <SafeAreaProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </DataProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}