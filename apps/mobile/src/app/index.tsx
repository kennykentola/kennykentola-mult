import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' }}>
        <ActivityIndicator size="large" color="#a78bfa" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Basic routing: if user is an electrician/solar tech, send to technician tab. Else dashboard.
  const role = user.prefs?.role || 'Client';
  
  if (role === 'Electrician' || role === 'Solar Technician') {
    return <Redirect href="/(tabs)/technician" />;
  }

  return <Redirect href="/(tabs)/dashboard" />;
}
