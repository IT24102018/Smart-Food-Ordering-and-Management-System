import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { API_BASE_URL } from '@/constants/api';
import { useAuth } from '@/contexts/auth-context';

type AdminUser = {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminUsersScreen() {
  const { role, adminToken } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!adminToken) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'x-admin-token': adminToken,
        },
      });
      const payload = await response.json();

      if (!response.ok) {
        Alert.alert('Failed to load users', payload?.message ?? 'Unknown server error.');
        return;
      }

      setUsers(payload.users ?? []);
    } catch {
      Alert.alert('Connection error', 'Could not connect to backend.');
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  const removeUser = useCallback(
    async (email: string) => {
      if (!adminToken) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${encodeURIComponent(email)}`, {
          method: 'DELETE',
          headers: {
            'x-admin-token': adminToken,
          },
        });

        const payload = await response.json();

        if (!response.ok) {
          Alert.alert('Remove failed', payload?.message ?? 'Could not remove user.');
          return;
        }

        setUsers((prev) => prev.filter((user) => user.email !== email));
      } catch {
        Alert.alert('Connection error', 'Could not connect to backend.');
      }
    },
    [adminToken]
  );

  useEffect(() => {
    if (role !== 'admin') {
      router.replace('/auth/login');
      return;
    }

    fetchUsers();
  }, [fetchUsers, role]);

  if (role !== 'admin') {
    return null;
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>ADMIN USERS</Text>
          <Text style={styles.title}>All user accounts</Text>
        </View>

        <Pressable style={styles.backButton} onPress={() => router.replace('/admin/orders')}>
          <Ionicons name="chevron-back" size={18} color="#081220" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      <Pressable style={styles.refreshButton} onPress={fetchUsers}>
        <Ionicons name="refresh" size={16} color="#DDE8FA" />
        <Text style={styles.refreshText}>{loading ? 'Refreshing...' : 'Refresh users'}</Text>
      </Pressable>

      <FlatList
        data={users}
        keyExtractor={(item) => item.email}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No users found yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.fullName || 'Unnamed User'}</Text>
            <Text style={styles.meta}>Email: {item.email}</Text>
            <Text style={styles.meta}>Phone: {item.phone || 'Not provided'}</Text>
            <Text style={styles.meta}>Address: {item.address || 'Not provided'}</Text>

            <Pressable
              style={styles.removeButton}
              onPress={() =>
                Alert.alert('Remove user?', `Delete ${item.email} from user list?`, [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => removeUser(item.email),
                  },
                ])
              }>
              <Ionicons name="trash-outline" size={16} color="#F7FAFF" />
              <Text style={styles.removeText}>Remove User</Text>
            </Pressable>
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
    marginTop: 6,
    color: '#F7FAFF',
    fontSize: 27,
    fontWeight: '900',
  },
  backButton: {
    backgroundColor: '#FFD166',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
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
    gap: 5,
  },
  name: {
    color: '#F8FBFF',
    fontSize: 16,
    fontWeight: '800',
  },
  meta: {
    color: '#A8BCD8',
    fontSize: 13,
    lineHeight: 18,
  },
  removeButton: {
    marginTop: 10,
    backgroundColor: '#A73A34',
    borderWidth: 1,
    borderColor: '#C04C45',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  removeText: {
    color: '#F7FAFF',
    fontWeight: '800',
  },
});
