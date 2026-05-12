import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const [loaded, setLoaded] = useState(false);

  // Carrega a preferência salva ao iniciar
  useEffect(() => {
    AsyncStorage.getItem('theme').then(value => {
      if (value !== null) setIsDark(value === 'dark');
      setLoaded(true);
    });
  }, []);

  // Salva sempre que mudar
  useEffect(() => {
    if (loaded) AsyncStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark, loaded]);

  const theme = {
    dark: isDark,
    colors: isDark ? COLORS : {
      ...COLORS,
      background: '#F5F7FA',
      card: '#FFFFFF',
      textPrimary: '#1A1C1E',
      textSecondary: '#6C727A',
      border: '#E1E4E8',
    },
    toggleTheme: () => setIsDark(prev => !prev),
  };

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);