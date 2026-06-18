import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#020617' },
        headerTintColor: '#fff',
        tabBarStyle: { backgroundColor: '#020617', borderTopColor: 'rgba(255,255,255,0.1)' },
        tabBarActiveTintColor: '#a78bfa',
      }}
    >
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          title: 'Portal',
          tabBarLabel: 'Home' 
        }} 
      />
      <Tabs.Screen 
        name="technician" 
        options={{ 
          title: 'Field Jobs',
          tabBarLabel: 'Technician' 
        }} 
      />
    </Tabs>
  );
}
