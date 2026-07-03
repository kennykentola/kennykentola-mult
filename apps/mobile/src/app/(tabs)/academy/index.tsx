import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { api } from '../../../lib/api';
import { router } from 'expo-router';

type Course = {
  id: string;
  title: string;
  summary?: string;
  instructorName: string;
  lessonCount: number;
  coverImage?: string;
};

export default function AcademyScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/academy/courses');
      setCourses(response.data.courses || []);
    } catch (error) {
      console.log('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Academy</Text>
        <Text style={styles.subtitle}>Expand your knowledge</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#a78bfa" style={styles.loader} />
      ) : (
        <View style={styles.grid}>
          {courses.map((course) => (
            <TouchableOpacity 
              key={course.id} 
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => router.push(`/(tabs)/academy/${course.id}`)}
            >
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>Course</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                <Text style={styles.courseInstructor}>{course.instructorName}</Text>
                <Text style={styles.courseMeta}>{course.lessonCount} Lessons</Text>
              </View>
            </TouchableOpacity>
          ))}
          {courses.length === 0 && (
            <Text style={styles.emptyText}>No courses available right now.</Text>
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
    padding: 16,
  },
  header: {
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 4,
  },
  loader: {
    marginTop: 64,
  },
  grid: {
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 140,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#a78bfa',
    fontWeight: 'bold',
    opacity: 0.5,
  },
  cardContent: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
  },
  courseMeta: {
    fontSize: 12,
    color: '#a78bfa',
    fontWeight: '600',
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 32,
  }
});
