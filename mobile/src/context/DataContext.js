import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DataContext = createContext();

// PRODUÇÃO: https://petmonitor-tcc.onrender.com
// LOCAL (teste): http://localhost:8000
const API_URL = 'https://petmonitor-tcc.onrender.com';
const PET_ID = 'pet_001';

export const DataProvider = ({ children }) => {
  const [tutorData, setTutorData] = useState({ nome: '', whatsapp: '', email: '', senha: '' });
  const [petData, setPetData] = useState({ nome: '', raca: '', peso: '', idade: '', sexo: '' });
  const [vetData, setVetData] = useState({ nome: '', email: '' });
  const [alertSettings, setAlertSettings] = useState({ bpmMin: 60, bpmMax: 140 });

  // --- NOVOS ESTADOS PARA A API ---
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  // 1. Carregar dados locais (AsyncStorage)
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

  // --- 2. FUNÇÃO PARA BUSCAR ALERTAS DA API ---
  const fetchAlerts = useCallback(async () => {
    // Só mostra o loading na primeira vez para não irritar o usuário
    if (alerts.length === 0) setLoadingAlerts(true); 
    
    try {
      const response = await fetch(`${API_URL}/monitor/alerts/${PET_ID}?_=${Date.now()}`);
      const data = await response.json();
      
      if (data.alertas) {
        // Ordenar: mais recentes primeiro
        const sorted = data.alertas.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setAlerts(sorted);
      }
    } catch (err) {
      console.error("Erro ao buscar alertas da API:", err);
    } finally {
      setLoadingAlerts(false);
    }
  }, [alerts.length]);

  // --- 3. FUNÇÃO PARA MARCAR COMO LIDO ---
  const markAllAsRead = async () => {
    try {
      // Otimismo: atualiza na tela antes mesmo da API responder
      const updatedAlerts = alerts.map(a => ({ ...a, lido: true }));
      setAlerts(updatedAlerts);

      await fetch(`${API_URL}/monitor/alerts/read-all/${PET_ID}`, { method: 'POST' });
    } catch (err) {
      console.error("Erro ao marcar como lidos:", err);
    }
  };

  // Funções de atualização local
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
      // Exportando os novos dados para as telas:
      alerts, 
      loadingAlerts, 
      fetchAlerts, 
      markAllAsRead
    }}>
      {children}
    </DataContext.Provider>
  );
};