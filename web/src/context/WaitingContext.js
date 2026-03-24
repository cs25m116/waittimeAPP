import React, { createContext, useState, useContext, useEffect } from 'react';
import { waitingAPI } from '../services/api';
import { toast } from 'react-toastify';

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
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    let interval;
    if (isTracking && activeSession) {
      interval = setInterval(() => {
        const startTime = new Date(activeSession.startTime);
        const now = new Date();
        const minutes = Math.floor((now - startTime) / (1000 * 60));
        setElapsedTime(minutes);
      }, 60000); // Update every minute
    }
    return () => clearInterval(interval);
  }, [isTracking, activeSession]);

  const checkActiveSession = async () => {
    try {
      const response = await waitingAPI.getActiveSession();
      if (response.data.data) {
        setActiveSession(response.data.data.session);
        setElapsedTime(response.data.data.elapsedTime);
        setIsTracking(true);
      }
    } catch (error) {
      console.error('Failed to check active session:', error);
    }
  };

  const startWaiting = async (officeId, location) => {
    setLoading(true);
    try {
      const response = await waitingAPI.startWaiting({ officeId, location });
      setActiveSession(response.data.data);
      setIsTracking(true);
      setElapsedTime(0);
      toast.success('Waiting session started!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to start waiting';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const endWaiting = async (sessionId, rating, comment) => {
    setLoading(true);
    try {
      const response = await waitingAPI.endWaiting({ sessionId, rating, comment });
      setActiveSession(null);
      setIsTracking(false);
      setElapsedTime(0);
      toast.success(`Waiting ended! Total time: ${response.data.data.waitingDuration} minutes`);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to end waiting';
      toast.error(message);
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
