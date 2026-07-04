import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { api } from '../../../../lib/api';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type QnA = {
  id: string;
  courseId: string;
  studentName: string;
  question: string;
  answer?: string;
  instructorName?: string;
  createdAt: string;
  answeredAt?: string;
};

export default function QnAScreen() {
  const [qnas, setQnas] = useState<QnA[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { courseId } = useLocalSearchParams();

  const fetchQnas = async () => {
    try {
      const endpoint = courseId ? `/academy/courses/${courseId}/qna` : '/academy/qna/my';
      const response = await api.get(endpoint);
      setQnas(response.data.qnas || []);
    } catch (error) {
      console.log('Error fetching Q&A:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQnas();
  }, [courseId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQnas();
    setRefreshing(false);
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim() || !courseId) return;
    
    setSubmitting(true);
    try {
      await api.post(`/academy/courses/${courseId}/qna`, { question: newQuestion });
      setNewQuestion('');
      await fetchQnas();
    } catch (error) {
      console.log('Error posting question:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Q&A</Text>
          <Text style={styles.subtitle}>Ask questions and get help</Text>
        </View>

        {courseId && (
          <View style={styles.askSection}>
            <TextInput
              style={styles.input}
              placeholder="Ask a new question..."
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={3}
              value={newQuestion}
              onChangeText={setNewQuestion}
            />
            <TouchableOpacity 
              style={[styles.submitBtn, (!newQuestion.trim() || submitting) && styles.submitBtnDisabled]}
              onPress={handleSubmitQuestion}
              disabled={!newQuestion.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Post Question</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#a78bfa" style={styles.loader} />
        ) : (
          <View style={styles.list}>
            {qnas.map((qna) => (
              <View key={qna.id} style={styles.card}>
                <View style={styles.questionSection}>
                  <View style={styles.userRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{qna.studentName.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text style={styles.studentName}>{qna.studentName}</Text>
                      <Text style={styles.dateText}>{new Date(qna.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </View>
                  <Text style={styles.questionText}>{qna.question}</Text>
                </View>

                {qna.answer && (
                  <View style={styles.answerSection}>
                    <View style={styles.answerHeader}>
                      <Ionicons name="return-down-forward" size={16} color="#a78bfa" />
                      <Text style={styles.instructorName}>{qna.instructorName} (Instructor)</Text>
                    </View>
                    <Text style={styles.answerText}>{qna.answer}</Text>
                    {qna.answeredAt && (
                      <Text style={styles.dateText}>{new Date(qna.answeredAt).toLocaleDateString()}</Text>
                    )}
                  </View>
                )}
                
                {!qna.answer && (
                  <View style={styles.unansweredSection}>
                    <Text style={styles.unansweredText}>Waiting for instructor reply...</Text>
                  </View>
                )}
              </View>
            ))}
            {qnas.length === 0 && (
              <Text style={styles.emptyText}>No questions asked yet. Be the first!</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollView: {
    flex: 1,
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
  askSection: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#6366f1',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#334155',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginTop: 40,
  },
  list: {
    padding: 20,
    gap: 20,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },
  questionSection: {
    padding: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  studentName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  dateText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  questionText: {
    color: '#e2e8f0',
    fontSize: 16,
    lineHeight: 24,
  },
  answerSection: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#0f172a',
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  instructorName: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '600',
  },
  answerText: {
    color: '#e2e8f0',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  unansweredSection: {
    padding: 16,
    paddingTop: 0,
  },
  unansweredText: {
    color: '#64748b',
    fontSize: 14,
    fontStyle: 'italic',
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  }
});
