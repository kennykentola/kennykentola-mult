import { Stack } from 'expo-router';

export default function AcademyLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#020617' },
        headerTintColor: '#fff',
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: 'Course Details' }} />
      <Stack.Screen name="assignments" options={{ title: 'Assignments' }} />
      <Stack.Screen name="quizzes" options={{ title: 'Quizzes' }} />
      <Stack.Screen name="live" options={{ title: 'Live Classes' }} />
      <Stack.Screen name="qna" options={{ title: 'Q&A' }} />
    </Stack>
  );
}
