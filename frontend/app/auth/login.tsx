import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/auth-context';
import { API_BASE_URL } from '@/constants/api';

export default function LoginScreen() {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;
  const { loginAsUser, loginAsAdmin, loginAsDriver } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const replaceAfterStateUpdate = (path: '/food' | '/admin/orders' | '/driver/orders') => {
    setTimeout(() => {
      router.replace(path);
    }, 100);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Please enter your email and password.');
      return;
    }

    const isAdminLogin = email.trim().toLowerCase() === 'admin@gmail.com';

    const isDriverLogin = email.trim().toLowerCase() === 'driver@gmail.com';

    if (isDriverLogin) {
      try {
        setIsSubmitting(true);
        const response = await fetch(`${API_BASE_URL}/api/driver/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email.trim(), password: password.trim() }),
        });

        const payload = await response.json();

        if (!response.ok || !payload?.token) {
          Alert.alert('Login failed', payload?.message ?? 'Invalid driver credentials.');
          return;
        }

        loginAsDriver(payload.token, payload.email);
        replaceAfterStateUpdate('/driver/orders');
      } catch {
        Alert.alert('Connection error', 'Could not connect to server.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!isAdminLogin) {
      loginAsUser(email.trim().toLowerCase());
      replaceAfterStateUpdate('/food');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email.trim(), password: password.trim() }),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.token) {
        Alert.alert('Login failed', payload?.message ?? 'Invalid admin credentials.');
        return;
      }

      loginAsAdmin(payload.token);
      replaceAfterStateUpdate('/admin/orders');
    } catch {
      Alert.alert('Connection error', 'Could not connect to server. Please start backend and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide]);

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.blobTop} />
        <View style={styles.blobBottom} />

        <Animated.View style={[styles.container, { opacity: fade, transform: [{ translateY: slide }] }]}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#DDE6F5" />
          </Pressable>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your YUMMI journey.</Text>

          <View style={styles.formCard}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#8EA4C1"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor="#8EA4C1"
              secureTextEntry
              style={styles.input}
            />

            <Pressable style={[styles.ctaButton, isSubmitting && styles.ctaButtonDisabled]} onPress={handleLogin}>
              <Text style={styles.ctaText}>{isSubmitting ? 'Checking...' : 'Login'}</Text>
              <Ionicons name="arrow-forward" size={18} color="#091220" />
            </Pressable>

            <Text style={styles.hintText}>Admin: admin@gmail.com / admin123</Text>
            <Text style={styles.hintText}>Driver: driver@gmail.com / driver123</Text>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>No account?</Text>
            <Link href="/auth/signup" asChild>
              <Pressable>
                <Text style={styles.linkText}>Create one</Text>
              </Pressable>
            </Link>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#081220',
  },
  flex: {
    flex: 1,
  },
  blobTop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#FF5C33',
    top: -120,
    right: -80,
    opacity: 0.28,
  },
  blobBottom: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#FFD166',
    bottom: -70,
    left: -80,
    opacity: 0.15,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#223754',
    marginBottom: 14,
  },
  title: {
    color: '#F7FAFF',
    fontSize: 32,
    fontWeight: '900',
  },
  subtitle: {
    color: '#A6B7CF',
    marginTop: 8,
    fontSize: 15,
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: '#101E33',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#253B59',
    padding: 16,
    gap: 10,
  },
  label: {
    color: '#C9D8EB',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#0A1527',
    color: '#ECF2FC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A4161',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  ctaButton: {
    marginTop: 10,
    backgroundColor: '#FFD166',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    opacity: 0.75,
  },
  ctaText: {
    color: '#091220',
    fontWeight: '900',
    fontSize: 15,
  },
  hintText: {
    marginTop: 8,
    color: '#8EA4C1',
    fontSize: 12,
    textAlign: 'center',
  },
  footerRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#9CB0CB',
    fontSize: 14,
  },
  linkText: {
    color: '#FF9A77',
    fontWeight: '800',
    fontSize: 14,
  },
});
