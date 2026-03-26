import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WaitingDashboardScreen from '../screens/WaitingDashboardScreen';
import WaitingTrackerScreen from '../screens/WaitingTrackerScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ headerTitle: 'Dashboard' }}
            />
            <Stack.Screen
              name="Waiting"
              component={WaitingDashboardScreen}
              options={{ headerTitle: 'Waiting Tracker' }}
            />
            <Stack.Screen
              name="WaitingTracker"
              component={WaitingTrackerScreen}
              options={{ headerTitle: 'Track Waiting' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ headerTitle: 'Profile' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
