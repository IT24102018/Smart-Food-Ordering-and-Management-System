import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/constants/api';
import { NotificationButton } from '@/components/notification-button';

type Order = {
  id: string;
  itemName: string;
  price: number;
  paymentMethod: string;
  status: 'pending' | 'accepted' | 'cooking' | 'cooked' | 'on_the_way' | 'delivered';
  etaTime: string | null;
  updatedAt: string;
};

const statusLabelMap: Record<Order['status'], string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  cooking: 'Cooking',
  cooked: 'Cooked',
  on_the_way: 'On the way',
  delivered: 'Delivered',
};

export default function OrdersScreen() {
  const fade = useRef(new Animated.Value(0)).current;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/orders`);
      const payload = await response.json();

      if (!response.ok) {
        return;
      }

      setOrders(payload.orders ?? []);
    } catch {
      // Keep current data if network call fails.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [fade]);

  useEffect(() => {
    loadOrders();

    const refreshTimer = setInterval(() => {
      loadOrders();
    }, 6000);

    return () => clearInterval(refreshTimer);
  }, [loadOrders]);

  return (
    <SafeAreaView style={styles.root}>
      <Animated.View style={[styles.container, { opacity: fade }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.label}>MY ORDERS</Text>
            <Text style={styles.heading}>Track admin updates live</Text>
          </View>
          <NotificationButton />
        </View>

        <View style={styles.mapPlaceholder}>
          <Ionicons name="time" size={40} color="#0D1221" />
          <Text style={styles.mapText}>Admin status and ETA appear below</Text>
        </View>

        {loading ? <ActivityIndicator color="#FFD166" style={styles.loader} /> : null}

        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.timelineCard}
          ListEmptyComponent={<Text style={styles.emptyText}>No orders yet. Place an order to track updates.</Text>}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <Text style={styles.orderId}>{item.id}</Text>
              <Text style={styles.stepTitle}>{item.itemName}</Text>
              <Text style={styles.stepTime}>Payment: {item.paymentMethod}</Text>
              <Text style={styles.stepTime}>Amount: RS. {item.price}</Text>
              <Text style={[styles.statusText, item.status === 'delivered' && styles.statusDone]}>
                Status: {statusLabelMap[item.status]}
              </Text>
              <Text style={styles.stepTime}>ETA: {item.etaTime !== null ? item.etaTime : 'Waiting for admin update'}</Text>
            </View>
          )}
        />

        <Pressable style={styles.helpButton} onPress={loadOrders}>
          <Ionicons name="refresh" size={17} color="#F8FBFF" />
          <Text style={styles.helpText}>Refresh now</Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B1324',
    padding: 18,
  },
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    color: '#9EC1FF',
    letterSpacing: 1,
    fontWeight: '700',
    fontSize: 12,
  },
  heading: {
    color: '#F8FBFF',
    fontSize: 27,
    marginTop: 6,
    fontWeight: '900',
  },
  mapPlaceholder: {
    marginTop: 20,
    borderRadius: 18,
    backgroundColor: '#FFD166',
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapText: {
    color: '#0D1221',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  loader: {
    marginTop: 16,
  },
  timelineCard: {
    marginTop: 18,
    paddingBottom: 110,
    gap: 14,
  },
  emptyText: {
    color: '#95ABC8',
    textAlign: 'center',
    marginTop: 10,
  },
  orderCard: {
    backgroundColor: '#111E34',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#22395C',
    padding: 14,
    gap: 4,
  },
  orderId: {
    color: '#FFB28C',
    fontSize: 12,
    fontWeight: '700',
  },
  statusText: {
    marginTop: 6,
    color: '#FFD166',
    fontSize: 13,
    fontWeight: '800',
  },
  statusDone: {
    borderColor: '#2DE39B',
    color: '#2DE39B',
  },
  stepTitle: {
    color: '#F8FBFF',
    fontSize: 15,
    fontWeight: '700',
  },
  stepTime: {
    color: '#95ABC8',
    fontSize: 12,
    marginTop: 3,
  },
  helpButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF5C33',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  helpText: {
    color: '#F8FBFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
