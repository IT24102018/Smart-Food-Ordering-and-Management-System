import React, { useEffect, useRef } from 'react';
import {
  Animated,
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

export default function SignupScreen() {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;
  const { loginAsUser } = useAuth();
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !address.trim() || !password.trim()) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      await fetch(`${API_BASE_URL}/api/users/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: normalizedEmail,
          phone: phone.trim(),
          address: address.trim(),
        }),
      });
    } catch {
      // Continue signup in app state even if network sync fails.
    }

    loginAsUser(normalizedEmail, {
      fullName,
      phone,
      address,
    });
    router.replace('/food');
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 620,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, scale]);

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.backGlow} />

        <Animated.View style={[styles.container, { opacity: fade, transform: [{ scale }] }]}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#DDE6F5" />
          </Pressable>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join YUMMI and order your favorite meals fast.</Text>

          <View style={styles.formCard}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput value={fullName} onChangeText={setFullName} placeholder="Your full name" placeholderTextColor="#8EA4C1" style={styles.input} />

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

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+94 77 123 4567"
              placeholderTextColor="#8EA4C1"
              keyboardType="phone-pad"
              style={styles.input}
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Street, city, postal code"
              placeholderTextColor="#8EA4C1"
              style={[styles.input, styles.addressInput]}
              multiline
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Create password"
              placeholderTextColor="#8EA4C1"
              secureTextEntry
              style={styles.input}
            />

            <Pressable style={styles.ctaButton} onPress={handleSignup}>
              <Text style={styles.ctaText}>Sign Up</Text>
              <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/auth/login" asChild>
              <Pressable>
                <Text style={styles.linkText}>Login</Text>
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
    backgroundColor: '#091120',
  },
  flex: {
    flex: 1,
  },
  backGlow: {
    position: 'absolute',
    top: -90,
    left: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#2DE39B',
    opacity: 0.16,
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
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: '#A6B7CF',
    marginTop: 8,
    fontSize: 15,
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: '#102036',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#244062',
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
  addressInput: {
    minHeight: 86,
    textAlignVertical: 'top',
  },
  ctaButton: {
    marginTop: 10,
    backgroundColor: '#22D391',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaText: {
    color: '#07121F',
    fontWeight: '900',
    fontSize: 15,
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
    color: '#8EEFD0',
    fontWeight: '800',
    fontSize: 14,
  },
});
