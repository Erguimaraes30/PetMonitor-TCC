import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import HistoricoScreen from '../screens/HistoricoScreen';
import HomeScreen from '../screens/HomeScreen';
import AlertasScreen from '../screens/AlertasScreen';
import PerfilScreen from '../screens/PerfilScreen';
import { useTheme } from '../context/ThemeContext'; // Importe o hook de tema
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  const { colors } = useTheme(); // Acessando as cores do tema atual
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card, // Agora segue o fundo do card do tema
          borderTopColor: colors.border, // Segue a cor de borda do tema
          height: 65,
          paddingBottom: 10,
          elevation: 0, // Remove sombra no Android
          shadowOpacity: 0, // Remove sombra no iOS
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Monitor: 'activity',
            Historico: 'clock',
            Alertas: 'bell',
            Perfil: 'user',
          };
          return <Feather name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Monitor" 
        component={HomeScreen} 
        options={{ title: t('Monitor') }} 
      />
      <Tab.Screen 
        name="Historico" 
        component={HistoricoScreen} 
        options={{ title: t('Historico') }} 
      />
      <Tab.Screen 
        name="Alertas" 
        component={AlertasScreen} 
        options={{ title: t('Alertas') }} 
      />
      <Tab.Screen 
        name="Perfil" 
        component={PerfilScreen} 
        options={{ title: t('Perfil') }} 
      />
    </Tab.Navigator>
  );
}