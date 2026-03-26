import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useWaiting } from '../context/WaitingContext';
import OfficeListScreen from './OfficeListScreen';
import WaitingHistoryScreen from './WaitingHistoryScreen';
import WaitingTrackerScreen from './WaitingTrackerScreen';

const Tab = createMaterialTopTabNavigator();

const WaitingDashboardScreen = ({ navigation }) => {
  const { isTracking, checkActiveSession } = useWaiting();

  useEffect(() => {
    checkActiveSession();
  }, []);

  if (isTracking) {
    // If there's an active session, show tracker directly
    return (
      <View style={styles.container}>
        <WaitingTrackerScreen 
          route={{ params: { office: { name: 'Active Session', _id: 'active' } } }}
          navigation={navigation}
        />
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#666',
        tabBarIndicatorStyle: { backgroundColor: '#3b82f6' },
        tabBarStyle: { backgroundColor: '#fff' },
      }}
    >
      <Tab.Screen 
        name="Offices" 
        component={OfficeListScreen} 
        options={{ tabBarLabel: 'Find Offices' }}
      />
      <Tab.Screen 
        name="History" 
        component={WaitingHistoryScreen} 
        options={{ tabBarLabel: 'My History' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default WaitingDashboardScreen;
