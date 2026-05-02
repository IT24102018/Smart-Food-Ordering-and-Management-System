import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';
import { API_BASE_URL } from '@/constants/api';

export default function SettingsScreen() {
  const { isLoggedIn, role, userEmail, userProfile, updateUserProfile, logout } = useAuth();

  const initialProfile = useMemo(
    () => ({
      fullName: userProfile?.fullName || '',
      email: userProfile?.email || userEmail || '',
      phone: userProfile?.phone || '',
      address: userProfile?.address || '',
    }),
    [userEmail, userProfile]
  );

  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [email, setEmail] = useState(initialProfile.email);
  const [phone, setPhone] = useState(initialProfile.phone);
  const [address, setAddress] = useState(initialProfile.address);

  useEffect(() => {
    setFullName(initialProfile.fullName);
    setEmail(initialProfile.email);
    setPhone(initialProfile.phone);
    setAddress(initialProfile.address);
  }, [initialProfile]);

  const handleSave = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    updateUserProfile({
      fullName,
      email: normalizedEmail,
      phone,
      address,
    });

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
      Alert.alert('Saved locally', 'Profile updated in app, but backend sync failed.');
      return;
    }

    Alert.alert('Saved', 'Your profile has been updated.');
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Do you want to log out now?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  if (!isLoggedIn || role !== 'user') {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.guestWrap}>
          <Ionicons name="person-circle-outline" size={58} color="#9DB4D1" />
          <Text style={styles.guestTitle}>Settings</Text>
          <Text style={styles.guestText}>Login as a user to view and edit profile details.</Text>
          <Link href="/auth/login" asChild>
            <Pressable style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Go to Login</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>ACCOUNT SETTINGS</Text>
        <Text style={styles.title}>Manage your profile</Text>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
            placeholder="Your full name"
            placeholderTextColor="#8EA4C1"
          />

          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#8EA4C1"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.fieldLabel}>Phone Number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            placeholder="+94 77 123 4567"
            placeholderTextColor="#8EA4C1"
            keyboardType="phone-pad"
          />

          <Text style={styles.fieldLabel}>Address</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            style={[styles.input, styles.addressInput]}
            placeholder="Street, city, postal code"
            placeholderTextColor="#8EA4C1"
            multiline
          />

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
            <Ionicons name="checkmark-circle-outline" size={18} color="#061423" />
          </Pressable>

          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
            <Ionicons name="log-out-outline" size={18} color="#FFE8E0" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#081220',
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  content: {
    paddingBottom: 26,
  },
  label: {
    color: '#9EC1FF',
    letterSpacing: 1,
    fontWeight: '700',
    fontSize: 12,
  },
  title: {
    color: '#F8FBFF',
    fontSize: 28,
    marginTop: 6,
    fontWeight: '900',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#101E33',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#253B59',
    padding: 16,
    gap: 10,
  },
  fieldLabel: {
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
    minHeight: 92,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 12,
    backgroundColor: '#2DE39B',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#061423',
    fontWeight: '900',
    fontSize: 15,
  },
  logoutButton: {
    marginTop: 8,
    backgroundColor: '#9F2A14',
    borderWidth: 1,
    borderColor: '#C63A21',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFE8E0',
    fontWeight: '900',
    fontSize: 15,
  },
  guestWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  guestTitle: {
    color: '#F7FAFF',
    marginTop: 14,
    fontSize: 26,
    fontWeight: '900',
  },
  guestText: {
    color: '#9CB0CB',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: '#FF5C33',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
