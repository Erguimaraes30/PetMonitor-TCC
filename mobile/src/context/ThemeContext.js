import React, { createContext, useState, useContext } from 'react';
import { COLORS } from '../constants/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // Padrão Dark para o PetMonitor

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
    toggleTheme: () => setIsDark(!isDark),
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);