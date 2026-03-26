import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { WaitingProvider } from './src/context/WaitingContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <WaitingProvider>
        <AppNavigator />
      </WaitingProvider>
    </AuthProvider>
  );
}
