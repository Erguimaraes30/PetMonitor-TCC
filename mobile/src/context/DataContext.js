import React, { createContext, useState } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [tutorData, setTutorData] = useState({
    nome: '',
    whatsapp: '',
    email: '',
    senha: '',
  });

  const [petData, setPetData] = useState({
    nome: '',
    raca: '',
    peso: '',
    idade: '',
    sexo: '',
  });

  const [vetData, setVetData] = useState({
    nome: '',
    email: '',
  });

  const updateTutorData = (newData) => {
    setTutorData(prev => ({ ...prev, ...newData }));
  };

  const updatePetData = (newData) => {
    setPetData(prev => ({ ...prev, ...newData }));
  };

  const updateVetData = (newData) => {
    setVetData(prev => ({ ...prev, ...newData }));
  };

  return (
    <DataContext.Provider value={{
      tutorData,
      updateTutorData,
      petData,
      updatePetData,
      vetData,
      updateVetData,
    }}>
      {children}
    </DataContext.Provider>
  );
};
