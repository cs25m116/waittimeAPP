import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useWaiting } from '../context/WaitingContext';

const WaitingHistoryScreen = () => {
  const { history, loadHistory, loading } = useWaiting();
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadHistory(page);
  }, [page]);

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  const getStatusColor = (status) => {
    const colors = {
      waiting: '#f59e0b',
      completed: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  if (loading && page === 1) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {history.data?.map((session) => (
        <View key={session._id} style={styles.historyCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.officeName}>{session.office?.name}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(session.status) },
              ]}
            >
              <Text style={styles.statusText}>{session.status}</Text>
            </View>
          </View>
          
          <Text style={styles.date}>{formatDate(session.startTime)}</Text>
          
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Duration:</Text>
            <Text style={styles.detailValue}>{session.waitingDuration} minutes</Text>
          </View>
          
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Office Type:</Text>
            <Text style={styles.detailValue}>{session.office?.type}</Text>
          </View>
          
          {session.feedback?.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Rating:</Text>
              <View style={styles.stars}>
                {[...Array(session.feedback.rating)].map((_, i) => (
                  <Text key={i} style={styles.star}>★</Text>
                ))}
              </View>
            </View>
          )}
          
          {session.feedback?.comment && (
            <Text style={styles.comment}>"{session.feedback.comment}"</Text>
          )}
        </View>
      ))}

      {history.totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[styles.pageButton, page === 1 && styles.disabledButton]}
            onPress={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <Text style={styles.pageButtonText}>Previous</Text>
          </TouchableOpacity>
          
          <Text style={styles.pageInfo}>
            Page {page} of {history.totalPages}
          </Text>
          
          <TouchableOpacity
            style={[styles.pageButton, page === history.totalPages && styles.disabledButton]}
            onPress={() => setPage(p => Math.min(history.totalPages, p + 1))}
            disabled={page === history.totalPages}
          >
            <Text style={styles.pageButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {history.data?.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No waiting history found</Text>
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
  historyCard: {
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  stars: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 16,
    color: '#fbbf24',
    marginRight: 2,
  },
  comment: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  pageButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  pageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pageInfo: {
    fontSize: 14,
    color: '#666',
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

export default WaitingHistoryScreen;
