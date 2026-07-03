import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { account } from '../../lib/appwrite';
import { api } from '../../lib/api';
import { router } from 'expo-router';

interface DashboardStats {
  activeProjects: number;
  enrolledCourses: number;
  openTickets: number;
}

export default function DashboardScreen() {
  const { user, checkSession } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.log('Failed to fetch dashboard stats', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await checkSession();
    await fetchStats();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      await checkSession();
      router.replace('/(auth)/login');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.roleBadge}>{user?.prefs?.role || 'Client'}</Text>
      </View>

      <View style={styles.cardsGrid}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>My Projects</Text>
          {loadingStats ? <ActivityIndicator size="small" color="#f8fafc" style={styles.spinner} /> : <Text style={styles.cardValue}>{stats?.activeProjects || 0} Active</Text>}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Academy Courses</Text>
          {loadingStats ? <ActivityIndicator size="small" color="#f8fafc" style={styles.spinner} /> : <Text style={styles.cardValue}>{stats?.enrolledCourses || 0} Enrolled</Text>}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Tickets</Text>
          {loadingStats ? <ActivityIndicator size="small" color="#f8fafc" style={styles.spinner} /> : <Text style={styles.cardValue}>{stats?.openTickets || 0} Open</Text>}
        </View>
      </View>

      <Text style={styles.logoutBtn} onPress={handleLogout}>Sign Out</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 16,
  },
  spinner: {
    marginTop: 8,
    alignSelf: 'flex-start'
  },
  header: {
    marginTop: 16,
    marginBottom: 32,
  },
  greeting: {
    color: '#94a3b8',
    fontSize: 16,
  },
  name: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: 'bold',
  },
  roleBadge: {
    color: '#a78bfa',
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardsGrid: {
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 12,
  },
  cardTitle: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  cardValue: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  logoutBtn: {
    color: '#ef4444',
    textAlign: 'center',
    padding: 24,
    marginTop: 24,
    fontWeight: 'bold',
  }
});
