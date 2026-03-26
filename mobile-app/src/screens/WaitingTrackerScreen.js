import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useWaiting } from '../context/WaitingContext';

const WaitingTrackerScreen = ({ route, navigation }) => {
  const { office } = route.params;
  const { 
    activeSession, 
    elapsedTime, 
    endWaiting, 
    startWaiting, 
    loading, 
    isTracking,
    checkActiveSession
  } = useWaiting();
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ended, setEnded] = useState(false); // New flag to track if session ended

  useEffect(() => {
    checkActiveSession();
  }, []);

  useEffect(() => {
    if (isTracking && activeSession && !ended) {
      setSessionStarted(true);
    }
  }, [isTracking, activeSession, ended]);

  const handleStartWaiting = async () => {
    const location = { lat: 19.0760, lng: 72.8777 };
    const result = await startWaiting(office._id, location);
    if (result.success) {
      setSessionStarted(true);
      setEnded(false);
    }
  };

  const handleEndWaiting = () => {
    if (!activeSession) {
      Alert.alert('Error', 'No active session found');
      return;
    }
    setShowFeedback(true);
  };

  const submitFeedback = async () => {
    if (!activeSession) {
      Alert.alert('Error', 'No active session found');
      setShowFeedback(false);
      return;
    }

    if (submitting || ended) {
      return;
    }

    setSubmitting(true);
    
    const sessionId = activeSession.sessionId || activeSession._id;
    
    const result = await endWaiting(sessionId, rating, comment);
    
    if (result.success) {
      const duration = result.data.data.waitingDuration;
      const hours = Math.floor(duration / 60);
      const mins = duration % 60;
      const timeString = hours > 0 ? `${hours}h ${mins}m` : `${mins} minutes`;
      
      setShowFeedback(false);
      setEnded(true); // Mark as ended
      setSessionStarted(false); // Stop showing timer
      
      Alert.alert(
        'Success', 
        `Waiting ended!\nTotal time: ${timeString}`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              setSubmitting(false);
              // Navigate back to the waiting dashboard (offices list)
              navigation.goBack();
            }
          }
        ]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to end session');
      setSubmitting(false);
    }
  };

  const formatTime = (minutes) => {
    if (minutes === undefined || minutes === null || ended) return '0s';
    
    const totalSeconds = Math.floor(minutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // If session ended, show office list button
  if (ended) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.successText}>✓ Session Ended Successfully!</Text>
          <Text style={styles.infoText}>Your waiting time has been recorded.</Text>
          
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.startButtonText}>Back to Offices</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Not started yet - show office info
  if (!sessionStarted && !isTracking) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.officeName}>{office?.name || 'Office'}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{office?.type || 'office'}</Text>
          </View>
          
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.info}>
            {office?.address?.street}, {office?.address?.city}
          </Text>
          
          <Text style={styles.label}>Working Hours:</Text>
          <Text style={styles.info}>
            {office?.workingHours?.start} - {office?.workingHours?.end}
          </Text>
          
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartWaiting}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.startButtonText}>Start Waiting</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Waiting in progress - show timer
  return (
    <View style={styles.container}>
      <View style={styles.trackerCard}>
        <View style={styles.timerIcon}>
          <Text style={styles.iconText}>⏱️</Text>
        </View>
        
        <Text style={styles.waitingTitle}>
          Waiting at {office?.name}
        </Text>
        
        <Text style={styles.timer}>
          {formatTime(elapsedTime)}
        </Text>
        <Text style={styles.timerLabel}>Waiting Time</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>📍 Office: {office?.type?.toUpperCase()}</Text>
          <Text style={styles.infoText}>🕐 Started: {activeSession?.startTime ? new Date(activeSession.startTime).toLocaleTimeString() : 'Just now'}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.endButton}
          onPress={handleEndWaiting}
          disabled={loading || submitting}
        >
          <Text style={styles.endButtonText}>End Waiting</Text>
        </TouchableOpacity>
      </View>

      {/* Feedback Modal */}
      <Modal
        visible={showFeedback}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFeedback(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How was your experience?</Text>
            
            <Text style={styles.ratingLabel}>Rating</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  disabled={submitting}
                >
                  <Text style={[
                    styles.star,
                    star <= rating && styles.starSelected
                  ]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.commentLabel}>Comments (Optional)</Text>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
              placeholder="Share your experience..."
              placeholderTextColor="#999"
              editable={!submitting}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowFeedback(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={submitFeedback}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  officeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  badge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 10,
    marginBottom: 4,
  },
  info: {
    fontSize: 16,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
    textAlign: 'center',
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 10,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 40,
  },
  waitingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 25,
  },
  endButton: {
    backgroundColor: '#ef4444',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  endButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  star: {
    fontSize: 32,
    color: '#ddd',
    marginHorizontal: 5,
  },
  starSelected: {
    color: '#fbbf24',
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default WaitingTrackerScreen;
