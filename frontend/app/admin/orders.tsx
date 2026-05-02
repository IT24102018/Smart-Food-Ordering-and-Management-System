import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { API_BASE_URL } from '@/constants/api';
import { useAuth } from '@/contexts/auth-context';

type Order = {
  id: string;
  itemName: string;
  price: number;
  paymentMethod: string;
  bankSlip?: string | null;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  driverName?: string;
  status: 'pending' | 'accepted' | 'cooking' | 'cooked' | 'on_the_way' | 'delivered';
  etaTime: string | null;
  createdAt: string;
  updatedAt: string;
};

const statusOptions: Order['status'][] = ['accepted', 'cooking', 'cooked'];

const statusLabelMap: Record<Order['status'], string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  cooking: 'Cooking',
  cooked: 'Cooked',
  on_the_way: 'On the way',
  delivered: 'Delivered',
};

export default function AdminOrdersScreen() {
  const { role, adminToken, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!adminToken) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/orders`, {
        headers: {
          'x-admin-token': adminToken,
        },
      });
      const payload = await response.json();

      if (!response.ok) {
        Alert.alert('Failed to load orders', payload?.message ?? 'Unknown server error.');
        return;
      }

      const incomingOrders = payload.orders ?? [];
      setOrders(incomingOrders);
    } catch {
      Alert.alert('Connection error', 'Could not connect to backend.');
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  const updateOrder = useCallback(
    async (orderId: string, payload: { action?: 'accept' | 'remove'; status?: Order['status']; etaTime?: string }) => {
      if (!adminToken) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': adminToken,
          },
          body: JSON.stringify(payload),
        });

        const responseBody = await response.json();

        if (!response.ok) {
          Alert.alert('Action failed', responseBody?.message ?? 'Could not update order.');
          return;
        }

        await fetchOrders();
      } catch {
        Alert.alert('Connection error', 'Could not connect to backend.');
      }
    },
    [adminToken, fetchOrders]
  );

  const saveDriver = useCallback(
    async (orderId: string) => {
      // @ts-ignore
      const name = typeof window !== 'undefined' ? window.prompt('Enter Driver Name') : '';
      if (!name || !name.trim()) {
        return;
      }
      await updateOrder(orderId, { driverName: name.trim() } as any);
    },
    [updateOrder]
  );

  useEffect(() => {
    if (role !== 'admin') {
      router.replace('/auth/login');
      return;
    }

    fetchOrders();
  }, [fetchOrders, role]);

  if (role !== 'admin') {
    return null;
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Orders</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.headerActions}>
          <Pressable style={styles.backButton} onPress={() => router.replace('/(tabs)')}>
            <Ionicons name="chevron-back" size={17} color="#081220" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Pressable style={styles.usersButton} onPress={() => router.push('/admin/users')}>
            <Ionicons name="people-outline" size={17} color="#081220" />
            <Text style={styles.usersText}>Users</Text>
          </Pressable>
          <Pressable style={styles.productsButton} onPress={() => router.push('/admin/products')}>
            <Ionicons name="add-circle-outline" size={17} color="#081220" />
            <Text style={styles.productsText}>Add Products</Text>
          </Pressable>
          <Pressable
            style={styles.logoutButton}
            onPress={() => {
              logout();
              router.replace('/auth/login');
            }}>
            <Ionicons name="log-out-outline" size={17} color="#081220" />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </ScrollView>
      </View>

      <Pressable style={styles.refreshButton} onPress={fetchOrders}>
        <Ionicons name="refresh" size={16} color="#DDE8FA" />
        <Text style={styles.refreshText}>{loading ? 'Refreshing...' : 'Refresh orders'}</Text>
      </Pressable>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No user orders yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.orderId}>{item.id}</Text>
            <Text style={styles.itemName}>{item.itemName}</Text>
            <Text style={styles.metaText}>Customer: {item.customerEmail}</Text>
            <Text style={styles.metaText}>Phone: {item.customerPhone || 'N/A'}</Text>
            <Text style={styles.metaText}>Address: {item.customerAddress || 'N/A'}</Text>
            <Text style={styles.metaText}>Driver: {item.driverName || 'Not assigned'}</Text>
            <Text style={styles.metaText}>Payment: {item.paymentMethod}</Text>
            <Text style={styles.metaText}>Amount: RS. {item.price}</Text>
            {item.paymentMethod === 'Bank' ? (
              <Text style={styles.bankHintText}>{item.bankSlip ? 'Bank slip uploaded' : 'Bank slip missing'}</Text>
            ) : null}
            <Text style={[styles.statusText, item.status === 'cooked' && styles.statusAccepted]}>
              Status: {statusLabelMap[item.status]}
            </Text>

            {item.paymentMethod === 'Bank' && item.bankSlip ? (
              <View style={styles.slipSection}>
                <Text style={styles.slipLabel}>Uploaded Slip</Text>
                <Image source={{ uri: `data:image/jpeg;base64,${item.bankSlip}` }} style={styles.slipImage} />
              </View>
            ) : null}

            {item.status !== 'pending' ? (
              <>
                <View style={styles.statusRow}>
                  {statusOptions.map((nextStatus) => (
                    <Pressable
                      key={nextStatus}
                      style={[
                        styles.statusChip,
                        item.status === nextStatus && styles.statusChipActive,
                      ]}
                      onPress={() => updateOrder(item.id, { status: nextStatus })}>
                      <Text style={[styles.statusChipText, item.status === nextStatus && styles.statusChipTextActive]}>
                        {statusLabelMap[nextStatus]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.driverRow}>
                  <Pressable style={styles.driverButton} onPress={() => saveDriver(item.id)}>
                    <Text style={styles.driverButtonText}>Assign Driver</Text>
                  </Pressable>
                </View>
              </>
            ) : null}

            <View style={styles.actionsRow}>
              {item.status === 'pending' && item.paymentMethod === 'Bank' ? (
                <Pressable
                  style={[styles.acceptButton, !item.bankSlip && styles.buttonDisabled]}
                  disabled={!item.bankSlip}
                  onPress={() => updateOrder(item.id, { action: 'accept' })}>
                  <Text style={styles.acceptText}>Confirm Slip</Text>
                </Pressable>
              ) : null}
              {item.status === 'pending' && item.paymentMethod !== 'Bank' ? (
                <Pressable
                  style={styles.acceptButton}
                  onPress={() => updateOrder(item.id, { action: 'accept' })}>
                  <Text style={styles.acceptText}>Accept</Text>
                </Pressable>
              ) : null}
              <Pressable style={styles.removeButton} onPress={() => updateOrder(item.id, { action: 'remove' })}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
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
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  header: {
    gap: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  title: {
    color: '#F4FAFF',
    fontSize: 27,
    fontWeight: '900',
  },
  productsButton: {
    backgroundColor: '#22D391',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backButton: {
    backgroundColor: '#FFD166',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    color: '#081220',
    fontWeight: '800',
  },
  usersButton: {
    backgroundColor: '#7ED8FF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  usersText: {
    color: '#081220',
    fontWeight: '800',
  },
  productsText: {
    color: '#081220',
    fontWeight: '800',
  },
  logoutButton: {
    backgroundColor: '#FFD166',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoutText: {
    color: '#081220',
    fontWeight: '800',
  },
  refreshButton: {
    marginTop: 14,
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
    paddingVertical: 14,
    gap: 12,
  },
  emptyText: {
    color: '#9CB0CB',
    textAlign: 'center',
    marginTop: 22,
  },
  card: {
    backgroundColor: '#101F34',
    borderWidth: 1,
    borderColor: '#253D5B',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  orderId: {
    color: '#FFB28C',
    fontSize: 12,
    fontWeight: '700',
  },
  itemName: {
    color: '#F8FBFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 3,
  },
  metaText: {
    color: '#A8BCD8',
    fontSize: 13,
  },
  bankHintText: {
    marginTop: 4,
    color: '#FFD166',
    fontSize: 12,
    fontWeight: '700',
  },
  statusText: {
    marginTop: 6,
    color: '#FFD166',
    fontWeight: '700',
  },
  statusAccepted: {
    color: '#2DE39B',
  },
  statusRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    borderWidth: 1,
    borderColor: '#2E496A',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#152741',
  },
  statusChipActive: {
    backgroundColor: '#FFD166',
    borderColor: '#FFD166',
  },
  statusChipDisabled: {
    opacity: 0.45,
  },
  statusChipText: {
    color: '#C9DBF2',
    fontSize: 12,
    fontWeight: '700',
  },
  statusChipTextActive: {
    color: '#081220',
  },
  driverRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },

  driverButton: {
    backgroundColor: '#2DE39B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  driverButtonText: {
    color: '#07141E',
    fontWeight: '900',
    fontSize: 12,
  },
  slipSection: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#2E496A',
    borderRadius: 10,
    backgroundColor: '#0F2037',
    padding: 8,
    gap: 8,
  },
  slipLabel: {
    color: '#DCE8F8',
    fontSize: 12,
    fontWeight: '700',
  },
  slipImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: '#081220',
  },
  actionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  acceptButton: {
    minWidth: 110,
    backgroundColor: '#2DE39B',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptText: {
    color: '#07141E',
    fontWeight: '900',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  removeButton: {
    minWidth: 110,
    backgroundColor: '#FF6B5B',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  removeText: {
    color: '#fff',
    fontWeight: '900',
  },
});
