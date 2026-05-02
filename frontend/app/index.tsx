import React, { useEffect } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/contexts/auth-context';

export default function EntryScreen() {
  const { isLoggedIn, role } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    if (role === 'admin') {
      router.replace('/admin/orders');
      return;
    }

    if (role === 'driver') {
      router.replace('/driver/orders');
      return;
    }

    router.replace('/(tabs)');
  }, [isLoggedIn, role]);

  if (isLoggedIn) {
    return null;
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.blobOne} />
      <View style={styles.blobTwo} />

      <View style={styles.content}>
        <Text style={styles.kicker}>WELCOME TO YUMMI</Text>
        <Text style={styles.title}>Login or Sign Up to continue</Text>
        <Text style={styles.subtitle}>Please sign in first to browse food, place orders, and manage your account.</Text>

        <View style={styles.actions}>
          <Link href="/auth/login" asChild>
            <Pressable style={styles.loginButton}>
              <Ionicons name="log-in-outline" size={18} color="#081220" />
              <Text style={styles.loginText}>Login</Text>
            </Pressable>
          </Link>

          <Link href="/auth/signup" asChild>
            <Pressable style={styles.signupButton}>
              <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
              <Text style={styles.signupText}>Sign Up</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#081220',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  blobOne: {
    position: 'absolute',
    top: -120,
    right: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#FF6B3C',
    opacity: 0.24,
  },
  blobTwo: {
    position: 'absolute',
    bottom: -80,
    left: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FFD166',
    opacity: 0.14,
  },
  content: {
    gap: 12,
  },
  kicker: {
    color: '#FFB088',
    fontWeight: '700',
    letterSpacing: 1,
    fontSize: 12,
  },
  title: {
    color: '#F8FBFF',
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '900',
  },
  subtitle: {
    color: '#A8BCD8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  actions: {
    gap: 10,
  },
  loginButton: {
    backgroundColor: '#FFD166',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  loginText: {
    color: '#081220',
    fontWeight: '900',
    fontSize: 15,
  },
  signupButton: {
    backgroundColor: '#FF5C33',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  signupText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
});
