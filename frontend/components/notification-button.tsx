import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';
import { useNotifications } from '@/contexts/notifications-context';

export function NotificationButton() {
  const { isLoggedIn, role, userEmail } = useAuth();
  const { unreadCount } = useNotifications();

  if (!isLoggedIn || role !== 'user' || !userEmail) {
    return null;
  }

  return (
    <Pressable style={styles.button} onPress={() => router.push('/notifications')}>
      <Ionicons name="notifications-outline" size={20} color="#0E1726" />
      {unreadCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#FF5C33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
});