import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { officeAPI } from '../services/api';
import { useWaiting } from '../context/WaitingContext';

const OfficeListScreen = ({ navigation }) => {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', city: '' });
  const { startWaiting } = useWaiting();

  useEffect(() => {
    loadOffices();
  }, [filters]);

  const loadOffices = async () => {
    try {
      setLoading(true);
      const response = await officeAPI.getOffices(filters);
      setOffices(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load offices');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWaiting = async (office) => {
    // For demo, using a fixed location (Mumbai coordinates)
    const location = { lat: 19.0760, lng: 72.8777 };
    
    const result = await startWaiting(office._id, location);
    
    if (result.success) {
      navigation.navigate('WaitingTracker', { office });
    }
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      government: '#3b82f6',
      private: '#10b981',
      bank: '#f59e0b',
      hospital: '#ef4444',
      school: '#8b5cf6',
      other: '#6b7280',
    };
    return colors[type] || colors.other;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search by city"
          value={filters.city}
          onChangeText={(text) => setFilters({ ...filters, city: text })}
        />
      </View>

      {offices.map((office) => (
        <View key={office._id} style={styles.officeCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.officeName}>{office.name}</Text>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: getTypeBadgeColor(office.type) },
              ]}
            >
              <Text style={styles.typeText}>{office.type}</Text>
            </View>
          </View>
          
          <Text style={styles.address}>
            {office.address?.street}, {office.address?.city}
          </Text>
          <Text style={styles.hours}>
            Hours: {office.workingHours?.start} - {office.workingHours?.end}
          </Text>
          
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => handleStartWaiting(office)}
          >
            <Text style={styles.startButtonText}>Start Waiting</Text>
          </TouchableOpacity>
        </View>
      ))}

      {offices.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No offices found</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  officeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  officeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  hours: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  startButton: {
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
});

export default OfficeListScreen;
