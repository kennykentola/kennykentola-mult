import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { api } from '../../../../lib/api';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type LiveClass = {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  duration: number; // in minutes
  status: 'scheduled' | 'live' | 'completed';
  meetingLink?: string;
  courseId: string;
  instructorName: string;
};

export default function LiveClassesScreen() {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { courseId } = useLocalSearchParams();

  const fetchLiveClasses = async () => {
    try {
      const endpoint = courseId ? `/academy/courses/${courseId}/live-classes` : '/academy/live-classes/upcoming';
      const response = await api.get(endpoint);
      setLiveClasses(response.data.liveClasses || []);
    } catch (error) {
      console.log('Error fetching live classes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveClasses();
  }, [courseId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLiveClasses();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return '#ef4444'; // red for live
      case 'completed': return '#64748b'; // slate
      default: return '#3b82f6'; // blue for scheduled
    }
  };

  const handleJoin = (meetingLink?: string) => {
    if (meetingLink) {
      Linking.openURL(meetingLink);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Live Classes</Text>
        <Text style={styles.subtitle}>Join your instructors in real-time</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#a78bfa" style={styles.loader} />
      ) : (
        <View style={styles.list}>
          {liveClasses.map((liveClass) => (
            <View key={liveClass.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.classTitle}>{liveClass.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(liveClass.status) }]}>
                  <Text style={styles.statusText}>{liveClass.status}</Text>
                </View>
              </View>
              
              <Text style={styles.instructorText}>by {liveClass.instructorName}</Text>
              <Text style={styles.classDesc} numberOfLines={2}>{liveClass.description}</Text>
              
              <View style={styles.cardFooter}>
                <View style={styles.footerInfo}>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
                    <Text style={styles.infoText}>{new Date(liveClass.scheduledAt).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={16} color="#94a3b8" />
                    <Text style={styles.infoText}>
                      {new Date(liveClass.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ({liveClass.duration}m)
                    </Text>
                  </View>
                </View>
                
                {liveClass.status !== 'completed' && liveClass.meetingLink && (
                  <TouchableOpacity 
                    style={[styles.joinBtn, liveClass.status === 'live' ? styles.joinBtnLive : styles.joinBtnScheduled]}
                    onPress={() => handleJoin(liveClass.meetingLink)}
                  >
                    <Ionicons name="videocam" size={18} color="#fff" />
                    <Text style={styles.joinBtnText}>Join</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          {liveClasses.length === 0 && (
            <Text style={styles.emptyText}>No upcoming live classes.</Text>
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
    marginBottom: 4,
  },
  classTitle: {
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
  instructorText: {
    fontSize: 14,
    color: '#a78bfa',
    marginBottom: 12,
  },
  classDesc: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  joinBtnScheduled: {
    backgroundColor: '#3b82f6',
  },
  joinBtnLive: {
    backgroundColor: '#ef4444',
  },
  joinBtnText: {
    color: '#fff',
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
