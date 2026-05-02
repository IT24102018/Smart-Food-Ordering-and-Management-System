import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { AuthProvider } from '@/contexts/auth-context';
import { FoodProvider } from '@/contexts/food-context';
import { NotificationsProvider } from '@/contexts/notifications-context';
import { ProductsProvider } from '@/contexts/products-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const shouldIgnoreError = (message?: string, filename?: string) => {
      const normalizedMessage = message?.toLowerCase() ?? '';
      const normalizedFilename = filename?.toLowerCase() ?? '';

      return (
        normalizedMessage.includes('metamask') ||
        normalizedFilename.startsWith('chrome-extension://') ||
        normalizedMessage.includes('ethereum provider')
      );
    };

    const handleError = (event: ErrorEvent) => {
      if (shouldIgnoreError(event.message, event.filename)) {
        event.preventDefault();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reasonMessage =
        typeof event.reason === 'string'
          ? event.reason
          : event.reason instanceof Error
            ? event.reason.message
            : '';

      if (shouldIgnoreError(reasonMessage)) {
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <AuthProvider>
      <NotificationsProvider>
        <ProductsProvider>
          <FoodProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="admin" options={{ headerShown: false }} />
                <Stack.Screen name="driver" options={{ headerShown: false }} />
                <Stack.Screen name="payment" options={{ headerShown: false }} />
                <Stack.Screen name="receipt" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </FoodProvider>
        </ProductsProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}
