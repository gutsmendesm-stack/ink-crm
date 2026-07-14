import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClientsListScreen from '../screens/Clients/ClientsListScreen';
import ClientDetailsScreen from '../screens/Clients/ClientDetailsScreen';
import NewClientScreen from '../screens/Clients/NewClientScreen';

const Stack = createNativeStackNavigator();

export default function ClientsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClientsList" component={ClientsListScreen} />
      <Stack.Screen name="ClientDetails" component={ClientDetailsScreen} />
      <Stack.Screen name="NewClient" component={NewClientScreen} />
    </Stack.Navigator>
  );
}
