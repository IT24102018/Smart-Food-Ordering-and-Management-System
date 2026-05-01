import React, { useEffect } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';
import { useNotifications } from '@/contexts/notifications-context';
import { BottomOptionsBar } from '@/components/bottom-options-bar';

export default function NotificationsScreen() {
  const { isLoggedIn, role, userEmail } = useAuth();
  const { notifications, refreshNotifications, markAllAsRead, clearAllNotifications } = useNotifications();

  useEffect(() => {
    if (!isLoggedIn || role !== 'user' || !userEmail) {
      router.replace('/auth/login');
      return;
    }

    refreshNotifications();
    markAllAsRead();
  }, [isLoggedIn, markAllAsRead, refreshNotifications, role, userEmail]);

  if (!isLoggedIn || role !== 'user' || !userEmail) {
    return null;
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>NOTIFICATIONS</Text>
          <Text style={styles.title}>Order updates</Text>
        </View>

        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color="#081220" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      <Pressable style={styles.clearButton} onPress={clearAllNotifications}>
        <Ionicons name="trash-outline" size={16} color="#081220" />
        <Text style={styles.clearText}>Clear all</Text>
      </Pressable>

      <View style={styles.emailCard}>
        <Text style={styles.emailLabel}>Current email</Text>
        <Text style={styles.emailValue}>{userEmail ?? 'No email saved yet'}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {notifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="notifications-off-outline" size={34} color="#081220" />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyText}>When admin accepts an order, sets time, or updates status, the message appears here.</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <View key={notification.id} style={[styles.card, notification.isRead && styles.cardRead]}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTitle}>{notification.title}</Text>
                <Text style={styles.cardTime}>{new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <Text style={styles.cardMessage}>{notification.message}</Text>
              <Text style={styles.cardMeta}>Order: {notification.orderId}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <BottomOptionsBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#081220',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  kicker: {
    color: '#FFB088',
    fontWeight: '700',
    letterSpacing: 1,
    fontSize: 12,
  },
  title: {
    color: '#F7FAFF',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  backButton: {
    backgroundColor: '#FFD166',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    color: '#081220',
    fontWeight: '800',
  },
  clearButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    backgroundColor: '#FFD166',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clearText: {
    color: '#081220',
    fontWeight: '800',
  },
  emailCard: {
    marginTop: 14,
    backgroundColor: '#101F34',
    borderWidth: 1,
    borderColor: '#253D5B',
    borderRadius: 16,
    padding: 14,
  },
  emailLabel: {
    color: '#A8BCD8',
    fontSize: 12,
    fontWeight: '700',
  },
  emailValue: {
    color: '#F7FAFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  list: {
    paddingTop: 14,
    paddingBottom: 96,
    gap: 12,
  },
  emptyCard: {
    backgroundColor: '#101F34',
    borderWidth: 1,
    borderColor: '#253D5B',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  emptyTitle: {
    color: '#F7FAFF',
    fontSize: 20,
    fontWeight: '900',
  },
  emptyText: {
    color: '#A8BCD8',
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#101F34',
    borderWidth: 1,
    borderColor: '#253D5B',
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  cardRead: {
    opacity: 0.8,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: {
    color: '#F7FAFF',
    fontSize: 15,
    fontWeight: '900',
    flex: 1,
  },
  cardTime: {
    color: '#9CB0CB',
    fontSize: 12,
    fontWeight: '700',
  },
  cardMessage: {
    color: '#D8E5F8',
    fontSize: 14,
    lineHeight: 20,
  },
  cardMeta: {
    color: '#9CB0CB',
    fontSize: 12,
    fontWeight: '700',
  },
});