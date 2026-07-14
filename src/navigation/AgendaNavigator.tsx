import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AgendaScreen from '../screens/Agenda/AgendaScreen';
import NewAppointmentScreen from '../screens/Appointments/NewAppointmentScreen';
import AppointmentDetailsScreen from '../screens/Appointments/AppointmentDetailsScreen';
import { AgendaStackParamList } from '../types';

const Stack = createNativeStackNavigator<AgendaStackParamList>();

export default function AgendaNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AgendaHome" component={AgendaScreen} />
      <Stack.Screen name="NewAppointment" component={NewAppointmentScreen} />
      <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} />
    </Stack.Navigator>
  );
}
