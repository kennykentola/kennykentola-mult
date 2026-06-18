import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { databases } from '../../lib/appwrite';
import { Query } from 'react-native-appwrite';
import { useAuth } from '../../context/AuthContext';

const OFFLINE_JOBS_KEY = '@solar_jobs_offline';

export default function TechnicianScreen() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Monitor network status
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(!!state.isConnected);
    });

    loadJobs();

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (isOnline) {
      syncOfflineChanges();
      fetchJobsFromAppwrite();
    }
  }, [isOnline]);

  const loadJobs = async () => {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_JOBS_KEY);
      if (stored) {
        setJobs(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobsFromAppwrite = async () => {
    try {
      const dbId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';
      const response = await databases.listDocuments(dbId, 'solar_jobs', [
        Query.equal('assignedTechnicians', [user!.$id]),
        Query.notEqual('status', 'completed')
      ]);
      
      const remoteJobs = response.documents;
      setJobs(remoteJobs);
      await AsyncStorage.setItem(OFFLINE_JOBS_KEY, JSON.stringify(remoteJobs));
    } catch (e) {
      console.log('Failed to fetch remote jobs, using offline cache.', e);
    }
  };

  const syncOfflineChanges = async () => {
    // In a real app, you would track a queue of mutations and apply them here
    console.log('Syncing offline changes to Appwrite...');
  };

  const markJobComplete = async (jobId: string) => {
    const updatedJobs = jobs.map(j => 
      j.$id === jobId ? { ...j, status: 'completed', _isDirty: true } : j
    );
    setJobs(updatedJobs);
    await AsyncStorage.setItem(OFFLINE_JOBS_KEY, JSON.stringify(updatedJobs));

    if (isOnline) {
      try {
        const dbId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'multicompany';
        await databases.updateDocument(dbId, 'solar_jobs', jobId, { status: 'completed' });
        // Remove dirty flag on success
        const cleanJobs = updatedJobs.map(j => 
          j.$id === jobId ? { ...j, _isDirty: false } : j
        );
        setJobs(cleanJobs);
        await AsyncStorage.setItem(OFFLINE_JOBS_KEY, JSON.stringify(cleanJobs));
      } catch (e) {
        console.log('Failed to update remote, will sync later.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.statusBanner, { backgroundColor: isOnline ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }]}>
        <Text style={[styles.statusText, { color: isOnline ? '#4ade80' : '#f87171' }]}>
          {isOnline ? '🟢 Online - Synced' : '🔴 Offline - Using Local Cache'}
        </Text>
      </View>

      <Text style={styles.headerTitle}>Assigned Jobs</Text>

      {jobs.length === 0 && !loading && (
        <Text style={styles.emptyText}>No assigned jobs right now.</Text>
      )}

      <FlatList
        data={jobs}
        keyExtractor={item => item.$id}
        renderItem={({ item }) => (
          <View style={styles.jobCard}>
            <Text style={styles.jobType}>{item.jobType || 'Service Call'}</Text>
            <Text style={styles.jobAddress}>📍 {item.address || 'Address pending'}</Text>
            
            <View style={styles.actionRow}>
              <Text style={styles.statusBadge}>{item.status}</Text>
              {item.status !== 'completed' && (
                <TouchableOpacity 
                  style={styles.completeBtn}
                  onPress={() => markJobComplete(item.$id)}
                >
                  <Text style={styles.completeBtnText}>Complete Job</Text>
                </TouchableOpacity>
              )}
            </View>
            {item._isDirty && <Text style={styles.dirtyFlag}>⚠️ Pending Sync</Text>}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  statusBanner: { padding: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  statusText: { fontWeight: 'bold', fontSize: 12 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', padding: 16 },
  emptyText: { color: '#94a3b8', padding: 16 },
  jobCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  jobType: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc', marginBottom: 4 },
  jobAddress: { color: '#94a3b8', marginBottom: 16 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { color: '#a78bfa', backgroundColor: 'rgba(167, 139, 250, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, overflow: 'hidden' },
  completeBtn: { backgroundColor: '#22c55e', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  completeBtnText: { color: '#fff', fontWeight: 'bold' },
  dirtyFlag: { color: '#facc15', fontSize: 12, marginTop: 8 }
});
