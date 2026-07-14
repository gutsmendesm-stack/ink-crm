import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import AgendaNavigator from './AgendaNavigator';
import ClientsNavigator from './ClientsNavigator';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.surfaceLight,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="AgendaTab"
        component={AgendaNavigator}
        options={{
          tabBarLabel: 'Agenda',
          tabBarIcon: () => (
            <Text style={{ fontSize: 22 }}>📅</Text>
          ),
        }}
      />
      <Tab.Screen
        name="ClientsTab"
        component={ClientsNavigator}
        options={{
          tabBarLabel: 'Clientes',
          tabBarIcon: () => (
            <Text style={{ fontSize: 22 }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: () => (
            <Text style={{ fontSize: 22 }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
