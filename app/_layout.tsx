import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';

import { initializeDatabase } from '../db/migrations';

export default function RootLayout() {
  useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  return (
    <PaperProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="plan/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </PaperProvider>
  );
}
