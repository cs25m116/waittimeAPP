import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { waitingAPI } from '../services/api';
import { Alert } from 'react-native';

const WaitingContext = createContext();

export const useWaiting = () => {
  const context = useContext(WaitingContext);
  if (!context) {
    throw new Error('useWaiting must be used within a WaitingProvider');
  }
  return context;
};

export const WaitingProvider = ({ children }) => {
  const [activeSession, setActiveSession] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [history, setHistory] = useState({ data: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const timerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer effect - updates every second
  useEffect(() => {
    if (isTracking && activeSession && activeSession.startTime) {
      // Clear existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Function to update elapsed time
      const updateElapsedTime = () => {
        const startTime = new Date(activeSession.startTime);
        const now = new Date();
        const diffMs = now - startTime;
        const diffMinutes = diffMs / (1000 * 60);
        setElapsedTime(diffMinutes);
      };
      
      // Update immediately
      updateElapsedTime();
      
      // Set interval to update every second
      timerRef.current = setInterval(updateElapsedTime, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [isTracking, activeSession]);

  const checkActiveSession = async () => {
    try {
      const response = await waitingAPI.getActiveSession();
      if (response.data.data) {
        const session = response.data.data.session;
        setActiveSession(session);
        setElapsedTime(response.data.data.elapsedTime);
        setIsTracking(true);
      } else {
        setActiveSession(null);
        setIsTracking(false);
        setElapsedTime(0);
      }
    } catch (error) {
      console.error('Failed to check active session:', error);
      setActiveSession(null);
      setIsTracking(false);
    }
  };

  const startWaiting = async (officeId, location) => {
    setLoading(true);
    try {
      const response = await waitingAPI.startWaiting({ officeId, location });
      const newSession = response.data.data;
      setActiveSession(newSession);
      setIsTracking(true);
      setElapsedTime(0);
      Alert.alert('Success', 'Waiting session started!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to start waiting';
      Alert.alert('Error', message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const endWaiting = async (sessionId, rating, comment) => {
    setLoading(true);
    try {
      const response = await waitingAPI.endWaiting({ sessionId, rating, comment });
      
      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setActiveSession(null);
      setIsTracking(false);
      setElapsedTime(0);
      
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to end waiting';
      Alert.alert('Error', message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await waitingAPI.getHistory({ page, limit });
      setHistory(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to load history:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    activeSession,
    elapsedTime,
    history,
    loading,
    isTracking,
    checkActiveSession,
    startWaiting,
    endWaiting,
    loadHistory,
  };

  return (
    <WaitingContext.Provider value={value}>
      {children}
    </WaitingContext.Provider>
  );
};
