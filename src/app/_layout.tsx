import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { VoiceAssistantProvider } from '@/contexts/VoiceAssistContext';

export default function RootLayout() {
  return (
    <VoiceAssistantProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </VoiceAssistantProvider>
  );
}