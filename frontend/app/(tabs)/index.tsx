import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/auth-context';
import { useNotifications } from '@/contexts/notifications-context';

const categories = ['Pizza', 'Burger', 'Rice', 'Dessert', 'Drinks'];

export default function HomeScreen() {
  const { isLoggedIn, role, userEmail } = useAuth();
  const { unreadCount } = useNotifications();
  const headerAnim = useRef(new Animated.Value(0)).current;
  const chipsAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const openCategory = (category: string) => {
    const targetCategory = category;

    router.push({
      pathname: '/food',
      params: { category: targetCategory },
    });
  };

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(chipsAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [chipsAnim, headerAnim, pulseAnim]);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={styles.backgroundBlobOne} />
      <View style={styles.backgroundBlobTwo} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [28, 0],
                  }),
                },
              ],
            },
          ]}>
          <View>
            <Text style={styles.greeting}>YUMMI</Text>
            <Text style={styles.heading}>What would you like to eat today?</Text>
            {!isLoggedIn && (
              <View style={styles.authRow}>
                <Link href="/auth/login" asChild>
                  <Pressable style={styles.authSecondary}>
                    <Text style={styles.authSecondaryText}>Login</Text>
                  </Pressable>
                </Link>
                <Link href="/auth/signup" asChild>
                  <Pressable style={styles.authPrimary}>
                    <Text style={styles.authPrimaryText}>Sign Up</Text>
                  </Pressable>
                </Link>
              </View>
            )}
          </View>
          {isLoggedIn && role === 'user' && userEmail ? (
            <Pressable style={styles.avatarButton} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={20} color="#0E1726" />
              {unreadCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              ) : null}
            </Pressable>
          ) : (
            <View style={styles.avatarSpacer} />
          )}
        </Animated.View>

        <Animated.View
          style={[
            styles.searchBox,
            {
              opacity: chipsAnim,
              transform: [
                {
                  translateY: chipsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
              ],
            },
          ]}>
          <Ionicons name="search" size={18} color="#9CA9BE" />
          <Text style={styles.searchText}>Search restaurants, meals, drinks...</Text>
        </Animated.View>

        {isLoggedIn ? (
          <View style={styles.dashboardCard}>
            <Text style={styles.dashboardTitle}>User Dashboard</Text>
            <View style={styles.dashboardButtonsRow}>
              <Link href="/(tabs)/explore" asChild>
                <Pressable style={styles.dashboardButton}>
                  <Ionicons name="bag-handle" size={16} color="#DFF0FF" />
                  <Text style={styles.dashboardButtonText}>My Orders</Text>
                </Pressable>
              </Link>

              <Link href="/(tabs)/cart" asChild>
                <Pressable style={styles.dashboardButton}>
                  <Ionicons name="cart" size={16} color="#DFF0FF" />
                  <Text style={styles.dashboardButtonText}>Cart</Text>
                </Pressable>
              </Link>

              <Link href="/(tabs)/favourite" asChild>
                <Pressable style={styles.dashboardButton}>
                  <Ionicons name="heart" size={16} color="#DFF0FF" />
                  <Text style={styles.dashboardButtonText}>Favourite</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        ) : null}

        <Animated.View
          style={[
            styles.categoryCard,
            {
              opacity: chipsAnim,
              transform: [
                {
                  translateY: chipsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            },
          ]}>
          <View style={styles.categoryHeader}
          >
            <Text style={styles.categoryTitle}>Browse categories</Text>
            <Text style={styles.categorySubtitle}>Pizza, Burger, Rice, Dessert, Drinks</Text>
          </View>
          <View style={styles.categoryGrid}>
            {categories.map((item, index) => (
              <Pressable
                key={item}
                style={[styles.categoryChip, index === 0 && styles.categoryChipActive]}
                onPress={() => openCategory(item)}>
                <Text style={[styles.categoryChipText, index === 0 && styles.categoryChipTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.checkoutWrap, { transform: [{ scale: pulseAnim }] }]}>
          <Pressable style={styles.checkoutButton} onPress={() => router.push('/(tabs)/cart')}>
            <Text style={styles.checkoutText}>View Cart</Text>
            <Ionicons name="arrow-forward" size={18} color="#081220" />
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#081220',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 34,
  },
  backgroundBlobOne: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#FF5C33',
    opacity: 0.23,
  },
  backgroundBlobTwo: {
    position: 'absolute',
    bottom: 110,
    left: -90,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#FFD166',
    opacity: 0.16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  avatarSpacer: {
    width: 40,
    height: 40,
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
  searchBox: {
    backgroundColor: '#101E31',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F324C',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  searchText: {
    color: '#8FA1BC',
    fontSize: 15,
    fontWeight: '500',
  },
  dashboardCard: {
    marginBottom: 16,
    backgroundColor: '#0F1E31',
    borderColor: '#1F324C',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  dashboardTitle: {
    color: '#DCE7F5',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 10,
  },
  dashboardButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dashboardButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2B4464',
    backgroundColor: '#12253D',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dashboardButtonText: {
    color: '#DFF0FF',
    fontWeight: '700',
    fontSize: 12,
  },
  categoryCard: {
    marginBottom: 16,
    backgroundColor: '#0F1E31',
    borderColor: '#1F324C',
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  categoryHeader: {
    marginBottom: 12,
  },
  categoryTitle: {
    color: '#F4F7FC',
    fontSize: 16,
    fontWeight: '800',
  },
  categorySubtitle: {
    marginTop: 4,
    color: '#9CB0CB',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    minWidth: '47%',
    borderWidth: 1,
    borderColor: '#2B405D',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#102037',
  },
  categoryChipActive: {
    backgroundColor: '#FF5C33',
    borderColor: '#FF5C33',
  },
  categoryChipText: {
    color: '#EAF2FF',
    fontWeight: '800',
    fontSize: 14,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#F4F7FC',
    fontWeight: '800',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1D31',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#223854',
    marginBottom: 12,
    gap: 12,
  },
  cardArt: {
    width: 56,
    height: 56,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    color: '#F8FBFF',
    fontSize: 16,
    fontWeight: '800',
  },
  cardMeta: {
    color: '#9DB0CB',
    fontSize: 13,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  ratingText: {
    color: '#FFE3A1',
    fontSize: 12,
    fontWeight: '700',
  },
  reviewText: {
    color: '#8FA5C2',
    fontSize: 12,
  },
  checkoutWrap: {
    marginTop: 8,
  },
  checkoutButton: {
    backgroundColor: '#FFD166',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutText: {
    color: '#081220',
    fontWeight: '900',
    fontSize: 16,
  },
});
