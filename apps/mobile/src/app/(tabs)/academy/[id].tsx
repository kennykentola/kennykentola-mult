import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { api } from '../../../lib/api';
import { useLocalSearchParams, router } from 'expo-router';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  const fetchCourseDetails = async () => {
    try {
      const response = await api.get(`/academy/courses/${id}`);
      setCourseData(response.data);
      // Set initial video to the first lesson if available
      if (response.data?.lessons?.length > 0) {
        const firstLesson = response.data.lessons[0];
        if (firstLesson.videoUrl && !firstLesson.isLocked) {
          setActiveVideoUrl(firstLesson.videoUrl);
        }
      }
    } catch (error) {
      console.log('Error fetching course detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCourseDetails();
    setRefreshing(false);
  };

  const handleLessonPress = (lesson: any) => {
    if (lesson.isLocked) return;
    if (lesson.videoUrl) {
      setActiveVideoUrl(lesson.videoUrl);
    }
  };

  const handleVideoStatusUpdate = async (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.didJustFinish) {
      // Find current lesson id based on activeVideoUrl
      const currentLesson = courseData?.lessons?.find((l: any) => l.videoUrl === activeVideoUrl);
      if (currentLesson) {
        try {
          await api.post(`/academy/courses/${id}/lessons/${currentLesson.id}/complete`);
          // optionally refresh to update UI state
        } catch(e) {
          console.log('Error marking lesson complete', e);
        }
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#a78bfa" />
      </View>
    );
  }

  if (!courseData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load course.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { course, lessons, modules } = courseData;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}
    >
      <View style={styles.videoContainer}>
        {activeVideoUrl ? (
          <Video
            source={{ uri: activeVideoUrl }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping={false}
            onPlaybackStatusUpdate={handleVideoStatusUpdate}
          />
        ) : (
          <LinearGradient
            colors={['#1e1b4b', '#020617']}
            style={styles.videoPlaceholder}
          >
            <Text style={styles.videoPlaceholderText}>Select a lesson to play video</Text>
          </LinearGradient>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseInstructor}>by {course.instructorName}</Text>
        <Text style={styles.courseDescription}>{course.description}</Text>

        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push(`/(tabs)/academy/assignments?courseId=${id}` as any)}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="document-text" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.actionBtnText}>Assignments</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push(`/(tabs)/academy/quizzes?courseId=${id}` as any)}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="help-circle" size={24} color="#10b981" />
            </View>
            <Text style={styles.actionBtnText}>Quizzes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push(`/(tabs)/academy/live?courseId=${id}` as any)}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Ionicons name="videocam" size={24} color="#ef4444" />
            </View>
            <Text style={styles.actionBtnText}>Live Classes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push(`/(tabs)/academy/qna?courseId=${id}` as any)}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(167, 139, 250, 0.1)' }]}>
              <Ionicons name="chatbubbles" size={24} color="#a78bfa" />
            </View>
            <Text style={styles.actionBtnText}>Q&A</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Curriculum</Text>
        
        {lessons?.map((lesson: any) => (
          <TouchableOpacity 
            key={lesson.id} 
            style={[styles.lessonItem, lesson.isLocked && styles.lessonItemLocked]}
            onPress={() => handleLessonPress(lesson)}
            disabled={lesson.isLocked}
          >
            <View style={styles.lessonMeta}>
              <Text style={[styles.lessonTitle, lesson.isLocked && styles.lessonTitleLocked]}>
                {lesson.title}
              </Text>
              <Text style={styles.lessonDuration}>{lesson.durationMinutes} min</Text>
            </View>
            {lesson.isLocked ? (
              <Text style={styles.lessonStatusIcon}>🔒</Text>
            ) : (
              <Text style={styles.lessonStatusIcon}>▶</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholderText: {
    color: '#a78bfa',
    opacity: 0.8,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
  },
  courseDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 24,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  actionBtn: {
    width: '48%',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionBtnText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 16,
  },
  lessonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  lessonItemLocked: {
    opacity: 0.5,
  },
  lessonMeta: {
    flex: 1,
  },
  lessonTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  lessonTitleLocked: {
    color: '#94a3b8',
  },
  lessonDuration: {
    color: '#64748b',
    fontSize: 12,
  },
  lessonStatusIcon: {
    fontSize: 16,
    marginLeft: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#f8fafc',
  }
});
