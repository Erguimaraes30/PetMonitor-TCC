import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [tutorData, setTutorData] = useState({ nome: '', whatsapp: '', email: '', senha: '' });
  const [petData, setPetData] = useState({ nome: '', raca: '', peso: '', idade: '', sexo: '' });
  const [vetData, setVetData] = useState({ nome: '', email: '' });
  const [alertSettings, setAlertSettings] = useState({ bpmMin: 60, bpmMax: 140 });

  // 1. Carregar dados ao iniciar o App
  useEffect(() => {
    const loadData = async () => {
      try {
        const [sTutor, sPet, sVet, sAlerts] = await Promise.all([
          AsyncStorage.getItem('@tutor_data'),
          AsyncStorage.getItem('@pet_data'),
          AsyncStorage.getItem('@vet_data'),
          AsyncStorage.getItem('@alert_settings'),
        ]);

        if (sTutor) setTutorData(JSON.parse(sTutor));
        if (sPet) setPetData(JSON.parse(sPet));
        if (sVet) setVetData(JSON.parse(sVet));
        if (sAlerts) setAlertSettings(JSON.parse(sAlerts));
      } catch (e) {
        console.error("Erro ao carregar dados do storage", e);
      }
    };
    loadData();
  }, []);

  // 2. Funções de atualização com persistência automática
  const updateTutorData = async (newData) => {
    const updated = { ...tutorData, ...newData };
    setTutorData(updated);
    await AsyncStorage.setItem('@tutor_data', JSON.stringify(updated));
  };

  const updatePetData = async (newData) => {
    const updated = { ...petData, ...newData };
    setPetData(updated);
    await AsyncStorage.setItem('@pet_data', JSON.stringify(updated));
  };

  const updateVetData = async (newData) => {
    const updated = { ...vetData, ...newData };
    setVetData(updated);
    await AsyncStorage.setItem('@vet_data', JSON.stringify(updated));
  };

  const updateAlertSettings = async (newData) => {
    const updated = { ...alertSettings, ...newData };
    setAlertSettings(updated);
    await AsyncStorage.setItem('@alert_settings', JSON.stringify(updated));
  };

  return (
    <DataContext.Provider value={{
      tutorData, updateTutorData,
      petData, updatePetData,
      vetData, updateVetData,
      alertSettings, updateAlertSettings,
    }}>
      {children}
    </DataContext.Provider>
  );
};