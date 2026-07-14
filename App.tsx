import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { registerForPushNotificationsAsync } from './src/utils/notifications';
import { COLORS } from './src/constants/theme';

export default function App() {
  useEffect(() => {
    // Request notification permissions on app start
    registerForPushNotificationsAsync();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <RootNavigator />
    </NavigationContainer>
  );
}
