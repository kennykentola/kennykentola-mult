import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { api } from '../../../lib/api';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Quiz = {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  courseId: string;
};

export default function QuizzesScreen() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { courseId } = useLocalSearchParams();

  const fetchQuizzes = async () => {
    try {
      const endpoint = courseId ? `/academy/courses/${courseId}/quizzes` : '/academy/quizzes/my';
      const response = await api.get(endpoint);
      setQuizzes(response.data.quizzes || []);
    } catch (error) {
      console.log('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQuizzes();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981'; // green
      case 'in_progress': return '#3b82f6'; // blue
      default: return '#64748b'; // slate
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Quizzes</Text>
        <Text style={styles.subtitle}>Test your knowledge</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#a78bfa" style={styles.loader} />
      ) : (
        <View style={styles.list}>
          {quizzes.map((quiz) => (
            <TouchableOpacity 
              key={quiz.id} 
              style={styles.card}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.quizTitle}>{quiz.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quiz.status) }]}>
                  <Text style={styles.statusText}>{quiz.status.replace('_', ' ')}</Text>
                </View>
              </View>
              
              <Text style={styles.quizDesc} numberOfLines={2}>{quiz.description}</Text>
              
              <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                  <Ionicons name="time-outline" size={16} color="#94a3b8" />
                  <Text style={styles.footerText}>{quiz.duration} mins</Text>
                </View>
                
                {quiz.status === 'completed' && quiz.score !== undefined && (
                  <View style={styles.scoreContainer}>
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <Text style={styles.scoreText}>{quiz.score}%</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
          {quizzes.length === 0 && (
            <Text style={styles.emptyText}>No quizzes found.</Text>
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
  quizTitle: {
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
  quizDesc: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreText: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  }
});
