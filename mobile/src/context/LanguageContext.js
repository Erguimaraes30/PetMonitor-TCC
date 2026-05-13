import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../constants/i18n';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('pt');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('language').then(value => {
      if (value) {
        setLanguage(value);
        i18n.changeLanguage(value);
      }
      setLoaded(true);
    });
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    AsyncStorage.setItem('language', lang);
  };

  if (!loaded) return null;

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);