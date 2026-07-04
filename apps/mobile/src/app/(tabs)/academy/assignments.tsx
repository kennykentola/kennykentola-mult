import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { api } from '../../../lib/api';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  courseId: string;
};

export default function AssignmentsScreen() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { courseId } = useLocalSearchParams();

  const fetchAssignments = async () => {
    try {
      const endpoint = courseId ? `/academy/courses/${courseId}/assignments` : '/academy/assignments/my';
      const response = await api.get(endpoint);
      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.log('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAssignments();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded': return '#10b981'; // green
      case 'submitted': return '#3b82f6'; // blue
      default: return '#f59e0b'; // yellow
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Assignments</Text>
        <Text style={styles.subtitle}>Track your coursework</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#a78bfa" style={styles.loader} />
      ) : (
        <View style={styles.list}>
          {assignments.map((assignment) => (
            <TouchableOpacity 
              key={assignment.id} 
              style={styles.card}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assignment.status) }]}>
                  <Text style={styles.statusText}>{assignment.status}</Text>
                </View>
              </View>
              <Text style={styles.assignmentDesc} numberOfLines={2}>{assignment.description}</Text>
              <View style={styles.cardFooter}>
                <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
                <Text style={styles.dueDate}>
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {assignments.length === 0 && (
            <Text style={styles.emptyText}>No assignments found.</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  loader: {
    marginTop: 40,
  },
  list: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  assignmentDesc: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueDate: {
    fontSize: 14,
    color: '#94a3b8',
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  }
});
