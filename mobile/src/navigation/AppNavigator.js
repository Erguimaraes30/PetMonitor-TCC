import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import ResumoDetalhadoScreen from '../screens/ResumoDetalhadoScreen';
import RegisterTutor from '../screens/RegisterTutor';
import RegisterPet from '../screens/RegisterPet';
import RegisterVet from '../screens/RegisterVet';
import SettingsScreen from '../screens/SettingsScreen';
import Tabs from './Tabs';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RegisterTutor" component={RegisterTutor} />
      <Stack.Screen name="RegisterPet" component={RegisterPet} />
      <Stack.Screen name="RegisterVet" component={RegisterVet} />
      <Stack.Screen name="MainApp" component={Tabs} />
      <Stack.Screen name="ResumoDetalhado" component={ResumoDetalhadoScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}