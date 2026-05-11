import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen 
        name="Monitor" 
        component={HomeScreen} 
        options={{ title: 'Monitor' }}
      />
      <Tab.Screen 
        name="Config" 
        component={HomeScreen} 
        options={{ title: 'Ajustes' }}
      />
    </Tab.Navigator>
  );
}