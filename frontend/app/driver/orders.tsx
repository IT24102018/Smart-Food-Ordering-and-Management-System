import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { API_BASE_URL } from '@/constants/api';
import { useAuth } from '@/contexts/auth-context';

type Order = {
  id: string;
  itemName: string;
  price: number;
  paymentMethod: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function DriverOrdersScreen() {
  const { role, driverToken, isLoggedIn, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!driverToken) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/driver/orders`, {
        headers: {
          'x-driver-token': driverToken,
        },
      });
      const payload = await response.json();

      if (!response.ok) {
        Alert.alert('Error', payload?.message ?? 'Failed to load assigned orders.');
        return;
      }

      setOrders(payload.orders ?? []);
    } catch {
      Alert.alert('Connection error', 'Could not connect to backend.');
    } finally {
      setLoading(false);
    }
  }, [driverToken]);

  const updateOrder = useCallback(async (orderId: string, payload: { action?: 'accept' | 'reject'; status?: string }) => {
    if (!driverToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/driver/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-driver-token': driverToken,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        Alert.alert('Update failed', err?.message ?? 'Could not update order.');
        return;
      }

      await fetchOrders();
    } catch {
      Alert.alert('Connection error', 'Could not connect to backend.');
    }
  }, [driverToken, fetchOrders]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/auth/login');
      return;
    }
    if (role !== 'driver') {
      router.replace('/(tabs)');
      return;
    }
    fetchOrders();
  }, [fetchOrders, role, isLoggedIn]);

  if (role !== 'driver') return null;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Driver Portal</Text>
          <Pressable
            style={styles.logoutButton}
            onPress={() => {
              logout();
              router.replace('/auth/login');
            }}>
            <Ionicons name="log-out-outline" size={18} color="#081220" />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>Assigned Deliveries</Text>
      </View>

      <Pressable style={styles.refreshButton} onPress={fetchOrders}>
        <Ionicons name="refresh" size={16} color="#DDE8FA" />
        <Text style={styles.refreshText}>{loading ? 'Refreshing...' : 'Refresh Tasks'}</Text>
      </Pressable>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No assigned orders at the moment.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>{item.id}</Text>
              <View style={[styles.badge, item.status === 'delivered' && styles.badgeSuccess]}>
                <Text style={styles.badgeText}>{item.status.toUpperCase().replace(/_/g, ' ')}</Text>
              </View>
            </View>
            
            <Text style={styles.itemName}>{item.itemName}</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={16} color="#8EA4C1" />
              <Text style={styles.detailText}>{item.customerEmail}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={16} color="#2DE39B" />
              <Text style={[styles.detailText, styles.highlightText]}>{item.customerPhone || 'No phone provided'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#FF9A77" />
              <Text style={styles.detailText}>{item.customerAddress || 'No address provided'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="wallet-outline" size={16} color="#8EA4C1" />
              <Text style={styles.detailText}>Payment: {item.paymentMethod} (RS. {item.price})</Text>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              {item.status !== 'on_the_way' && item.status !== 'delivered' && (
                <>
                  <Pressable style={styles.rejectButton} onPress={() => updateOrder(item.id, { action: 'reject' })}>
                    <Text style={styles.rejectText}>Reject</Text>
                  </Pressable>
                  <Pressable style={styles.acceptButton} onPress={() => updateOrder(item.id, { action: 'accept' })}>
                    <Text style={styles.acceptText}>Accept</Text>
                  </Pressable>
                </>
              )}

              {item.status === 'on_the_way' && (
                <Pressable style={styles.deliverButton} onPress={() => updateOrder(item.id, { status: 'delivered' })}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#081220" />
                  <Text style={styles.deliverText}>Mark Delivered</Text>
                </Pressable>
              )}

              {item.status === 'delivered' && (
                <View style={styles.completedTag}>
                  <Ionicons name="checkmark-done" size={16} color="#2DE39B" />
                  <Text style={styles.completedText}>Delivery Completed</Text>
                </View>
              )}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#081220',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#F4FAFF',
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: '#8EA4C1',
    fontSize: 14,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#FFD166',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoutText: {
    color: '#081220',
    fontWeight: '800',
    fontSize: 13,
  },
  refreshButton: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: '#13243D',
    borderWidth: 1,
    borderColor: '#2B4468',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  refreshText: {
    color: '#DDE8FA',
    fontWeight: '700',
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  emptyText: {
    color: '#9CB0CB',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#101F34',
    borderWidth: 1,
    borderColor: '#253D5B',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    color: '#8EA4C1',
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#1C314D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeSuccess: {
    backgroundColor: '#0D3D2B',
  },
  badgeText: {
    color: '#7ED8FF',
    fontSize: 10,
    fontWeight: '800',
  },
  itemName: {
    color: '#F8FBFF',
    fontSize: 18,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3452',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    color: '#A8BCD8',
    fontSize: 14,
    flex: 1,
  },
  highlightText: {
    color: '#F4FAFF',
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 10,
  },
  acceptButton: {
    flex: 2,
    backgroundColor: '#2DE39B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: {
    color: '#081220',
    fontWeight: '900',
    fontSize: 14,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#1C314D',
    borderWidth: 1,
    borderColor: '#FF6B5B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectText: {
    color: '#FF6B5B',
    fontWeight: '800',
    fontSize: 14,
  },
  deliverButton: {
    flex: 1,
    backgroundColor: '#FFD166',
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deliverText: {
    color: '#081220',
    fontWeight: '900',
    fontSize: 14,
  },
  completedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0D3D2B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  completedText: {
    color: '#2DE39B',
    fontWeight: '700',
    fontSize: 13,
  },
});
