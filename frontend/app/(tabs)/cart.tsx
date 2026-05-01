import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useFoodState } from '@/contexts/food-context';
import { useProducts } from '@/contexts/products-context';
import { NotificationButton } from '@/components/notification-button';

export default function CartScreen() {
  const { cartIds, removeFromCart } = useFoodState();
  const { products } = useProducts();
  const cartItems = products.filter((item) => cartIds.includes(item.id));
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Your Cart</Text>
        <NotificationButton />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="cart" size={36} color="#081220" />
          </View>

          <Text style={styles.title}>No items in cart</Text>
          <Text style={styles.subtitle}>Tap Cart on food items and products will appear here automatically.</Text>

          <Pressable style={styles.cta} onPress={() => router.push('/food')}>
            <Text style={styles.ctaText}>Go To Food Menu</Text>
            <Ionicons name="arrow-forward" size={16} color="#081220" />
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listWrap}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Image source={item.imageUrl} style={styles.itemImage} contentFit="cover" transition={220} />
                <View style={styles.itemInfoRow}>
                  <View style={styles.itemTextWrap}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>{item.category} · RS. {item.price}</Text>
                  </View>
                  <Pressable style={styles.removeBtn} onPress={() => removeFromCart(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.totalBar}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>RS. {total}</Text>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#081220',
    padding: 18,
  },
  heading: {
    color: '#F7FAFF',
    fontSize: 26,
    fontWeight: '900',
  },
  headerRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  card: {
    backgroundColor: '#102036',
    borderWidth: 1,
    borderColor: '#2A4260',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
  },
  iconWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD166',
    marginBottom: 12,
  },
  title: {
    color: '#F7FAFF',
    fontSize: 25,
    fontWeight: '900',
  },
  subtitle: {
    color: '#AFC3DE',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 14,
  },
  cta: {
    marginTop: 16,
    backgroundColor: '#22D391',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  ctaText: {
    color: '#081220',
    fontWeight: '900',
    fontSize: 14,
  },
  listWrap: {
    paddingBottom: 14,
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#102036',
    borderWidth: 1,
    borderColor: '#2A4260',
    borderRadius: 14,
    padding: 12,
  },
  itemImage: {
    width: '100%',
    height: 130,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemName: {
    color: '#F7FAFF',
    fontSize: 16,
    fontWeight: '800',
  },
  itemMeta: {
    marginTop: 4,
    color: '#AFC3DE',
    fontSize: 13,
    fontWeight: '600',
  },
  itemInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTextWrap: {
    flex: 1,
  },
  removeBtn: {
    backgroundColor: '#0B172A',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#304B71',
    marginLeft: 10,
  },
  totalBar: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#2A4260',
    backgroundColor: '#0E1B2E',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#E2EDFC',
    fontSize: 15,
    fontWeight: '700',
  },
  totalValue: {
    color: '#2DE39B',
    fontSize: 16,
    fontWeight: '900',
  },
});
