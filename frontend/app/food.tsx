import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { useFoodState } from '@/contexts/food-context';
import { getProductCategories, Product } from '@/data/food-items';
import { useProducts } from '@/contexts/products-context';
import { NotificationButton } from '@/components/notification-button';
import { BottomOptionsBar } from '@/components/bottom-options-bar';

export default function FoodScreen() {
  const { isLoggedIn } = useAuth();
  const { favoriteIds, cartIds, toggleFavorite, addToCart } = useFoodState();
  const { products } = useProducts();
  const [activeCategory, setActiveCategory] = useState('All');
  const { category } = useLocalSearchParams<{ category?: string }>();

  const categories = useMemo(() => getProductCategories(products), [products]);

  useEffect(() => {
    if (typeof category !== 'string' || !category) {
      return;
    }

    const normalizedCategory = category === 'Desserts' ? 'Dessert' : category;

    if (normalizedCategory === 'All' || categories.includes(normalizedCategory)) {
      setActiveCategory(normalizedCategory);
    }
  }, [category, categories]);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') {
      return products;
    }

    return products.filter((item) => item.category === activeCategory);
  }, [activeCategory, products]);

  const buyNow = (item: Product) => {
    router.push({
      pathname: '/payment',
      params: {
        itemName: item.name,
        price: String(item.price),
      },
    });
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.backgroundBlobOne} />
      <View style={styles.backgroundBlobTwo} />

      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>YUMMI MENU</Text>
          <Text style={styles.heading}>Food Categories & Items</Text>
        </View>
        <Pressable style={styles.iconButton} onPress={() => router.replace('/(tabs)')}>
          <Ionicons name="home" size={18} color="#0B1424" />
        </Pressable>
        <View style={styles.notificationWrap}>
          <NotificationButton />
        </View>
      </View>

      {isLoggedIn && (
        <View style={styles.topActionsCard}>
          <Text style={styles.topActionsTitle}>Quick Access</Text>
          <View style={styles.topActionsRow}>
            <Link href="/(tabs)/explore" asChild>
              <Pressable style={styles.topActionButton}>
                <Ionicons name="bag-handle" size={15} color="#DFF0FF" />
                <Text style={styles.topActionText}>My Orders</Text>
              </Pressable>
            </Link>

            <Link href="/(tabs)/cart" asChild>
              <Pressable style={styles.topActionButton}>
                <Ionicons name="cart" size={15} color="#DFF0FF" />
                <Text style={styles.topActionText}>Cart</Text>
              </Pressable>
            </Link>

            <Link href="/(tabs)/favourite" asChild>
              <Pressable style={styles.topActionButton}>
                <Ionicons name="heart" size={15} color="#DFF0FF" />
                <Text style={styles.topActionText}>Favourite</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        {categories.map((category) => {
          const isActive = activeCategory === category;

          return (
            <Pressable
              key={category}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              onPress={() => setActiveCategory(category)}>
              <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{category}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listWrap}>
        {filteredItems.length === 0 ? <Text style={styles.emptyText}>No products found for this category.</Text> : null}
        {filteredItems.map((item) => {
          const isFavorite = favoriteIds.includes(item.id);
          const isInCart = cartIds.includes(item.id);

          return (
          <View key={item.id} style={styles.card}>
            <Image source={item.imageUrl} style={styles.cardImage} contentFit="cover" transition={220} />

            <View style={styles.cardTopRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.priceText}>RS. {item.price}</Text>
            </View>

            <Text style={styles.itemCategory}>{item.category}</Text>
            <Text style={styles.description}>{item.description}</Text>

            <View style={styles.metaRow}>
              <Pressable style={styles.metaItem} onPress={() => router.push({ pathname: '/reviews', params: { productId: item.id, itemName: item.name } })}>
                <Ionicons name="star" size={14} color="#FFC857" />
                <Text style={styles.metaText}>{item.rating} (Reviews)</Text>
              </Pressable>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="#A9BEDC" />
                <Text style={styles.metaText}>{item.eta}</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <Pressable style={[styles.actionButton, styles.cartButton, isInCart && styles.cartButtonActive]} onPress={() => addToCart(item.id)}>
                <Ionicons name="cart-outline" size={15} color="#F7FAFF" />
                <Text style={styles.actionText}>{isInCart ? 'In Cart' : 'Cart'}</Text>
              </Pressable>

              <Pressable style={[styles.actionButton, styles.buyButton]} onPress={() => buyNow(item)}>
                <Ionicons name="flash-outline" size={15} color="#081220" />
                <Text style={styles.buyText}>Buy Now</Text>
              </Pressable>

              <Pressable style={[styles.actionButton, styles.favoriteButton, isFavorite && styles.favoriteButtonActive]} onPress={() => toggleFavorite(item.id)}>
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={15} color={isFavorite ? '#FFE7E0' : '#F7FAFF'} />
                <Text style={styles.actionText}>Favourite</Text>
              </Pressable>
            </View>
          </View>
          );
        })}
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
    paddingTop: 10,
  },
  backgroundBlobOne: {
    position: 'absolute',
    top: -110,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#FF6B3C',
    opacity: 0.2,
  },
  backgroundBlobTwo: {
    position: 'absolute',
    bottom: -80,
    left: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FFD166',
    opacity: 0.12,
  },
  header: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    color: '#FFB088',
    fontWeight: '700',
    letterSpacing: 1,
    fontSize: 12,
  },
  heading: {
    marginTop: 6,
    color: '#F7FAFF',
    fontSize: 28,
    fontWeight: '900',
    maxWidth: 280,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF1FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationWrap: {
    marginLeft: 8,
  },
  topActionsCard: {
    marginBottom: 12,
    backgroundColor: '#0F1E31',
    borderWidth: 1,
    borderColor: '#1F324C',
    borderRadius: 14,
    padding: 10,
  },
  topActionsTitle: {
    color: '#DCE7F5',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 8,
  },
  topActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  topActionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2B4464',
    borderRadius: 10,
    backgroundColor: '#12253D',
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  topActionText: {
    color: '#DFF0FF',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyText: {
    color: '#9CB0CB',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  categoryRow: {
    gap: 10,
    paddingBottom: 12,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: '#2A4260',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#0F1E31',
  },
  categoryChipActive: {
    backgroundColor: '#FF5C33',
    borderColor: '#FF5C33',
  },
  categoryText: {
    color: '#D3DDEC',
    fontWeight: '700',
    fontSize: 13,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  listWrap: {
    paddingBottom: 96,
    gap: 12,
  },
  card: {
    backgroundColor: '#101F34',
    borderColor: '#253D5B',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  itemName: {
    color: '#F8FBFF',
    fontSize: 17,
    fontWeight: '800',
    flexShrink: 1,
  },
  priceText: {
    color: '#2DE39B',
    fontSize: 15,
    fontWeight: '900',
  },
  itemCategory: {
    marginTop: 6,
    color: '#A1B7D3',
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    marginTop: 8,
    color: '#D8E5F8',
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#B8CAE2',
    fontSize: 13,
    fontWeight: '700',
  },
  actionRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
  },
  cartButton: {
    backgroundColor: '#1B2C44',
    borderWidth: 1,
    borderColor: '#304B71',
  },
  cartButtonActive: {
    backgroundColor: '#234567',
  },
  buyButton: {
    backgroundColor: '#FFD166',
  },
  favoriteButton: {
    backgroundColor: '#1E283A',
    borderWidth: 1,
    borderColor: '#374962',
  },
  favoriteButtonActive: {
    backgroundColor: '#A73A34',
    borderColor: '#C04C45',
  },
  actionText: {
    color: '#F7FAFF',
    fontSize: 12,
    fontWeight: '800',
  },
  buyText: {
    color: '#081220',
    fontSize: 12,
    fontWeight: '900',
  },
});
