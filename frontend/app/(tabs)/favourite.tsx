import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useFoodState } from '@/contexts/food-context';
import { useProducts } from '@/contexts/products-context';
import { NotificationButton } from '@/components/notification-button';

export default function FavouriteScreen() {
  const { favoriteIds, toggleFavorite } = useFoodState();
  const { products } = useProducts();
  const favoriteItems = products.filter((item) => favoriteIds.includes(item.id));

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Your Favourites</Text>
        <NotificationButton />
      </View>

      {favoriteItems.length === 0 ? (
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="heart" size={34} color="#081220" />
          </View>

          <Text style={styles.title}>No favourite items yet</Text>
          <Text style={styles.subtitle}>Tap Favourite on food cards and items will appear here automatically.</Text>

          <Pressable style={styles.cta} onPress={() => router.push('/food')}>
            <Text style={styles.ctaText}>Browse Food Items</Text>
            <Ionicons name="arrow-forward" size={16} color="#081220" />
          </Pressable>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listWrap}>
          {favoriteItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Image source={item.imageUrl} style={styles.itemImage} contentFit="cover" transition={220} />
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>{item.category} · RS. {item.price}</Text>
              <Pressable style={styles.removeButton} onPress={() => toggleFavorite(item.id)}>
                <Ionicons name="heart-dislike-outline" size={15} color="#F7FAFF" />
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
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
    backgroundColor: '#FF8E6A',
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
    backgroundColor: '#FFD166',
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
    paddingBottom: 18,
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
  removeButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#3A4F6D',
    borderRadius: 10,
    backgroundColor: '#1E2E46',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  removeText: {
    color: '#F7FAFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
