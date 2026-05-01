import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';
import { useProducts } from '@/contexts/products-context';
import { Product } from '@/data/food-items';

type ProductForm = {
  name: string;
  category: string;
  imageUrl: string;
  description: string;
  price: string;
  rating: string;
  eta: string;
};

const emptyForm: ProductForm = {
  name: '',
  category: 'Pizza',
  imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
  description: '',
  price: '',
  rating: '4.5',
  eta: '20-30 min',
};

const formFromProduct = (product: Product): ProductForm => ({
  name: product.name,
  category: product.category,
  imageUrl: product.imageUrl,
  description: product.description,
  price: String(product.price),
  rating: String(product.rating),
  eta: product.eta,
});

export default function AdminProductsScreen() {
  const { role, adminToken } = useAuth();
  const { products, createProduct, updateProduct, deleteProduct } = useProducts();
  const [newProduct, setNewProduct] = useState<ProductForm>(emptyForm);
  const [drafts, setDrafts] = useState<Record<string, ProductForm>>({});
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  useEffect(() => {
    if (role !== 'admin') {
      router.replace('/auth/login');
    }
  }, [role]);

  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev };

      products.forEach((product) => {
        if (!next[product.id]) {
          next[product.id] = formFromProduct(product);
        }
      });

      Object.keys(next).forEach((productId) => {
        if (!products.some((product) => product.id === productId)) {
          delete next[productId];
        }
      });

      return next;
    });
  }, [products]);

  const isAdmin = role === 'admin';

  const orderedProducts = useMemo(() => products, [products]);

  const validateForm = (form: ProductForm) => {
    if (!form.name.trim() || !form.category.trim() || !form.imageUrl.trim() || !form.description.trim() || !form.eta.trim()) {
      return 'Please fill the name, category, image, description and ETA fields.';
    }

    const price = Number(form.price);
    const rating = Number(form.rating);

    if (!Number.isFinite(price) || price < 0) {
      return 'Price must be a valid non-negative number.';
    }

    if (!Number.isFinite(rating) || rating < 0) {
      return 'Rating must be a valid non-negative number.';
    }

    return null;
  };

  const handleAddProduct = async () => {
    if (!adminToken) {
      return;
    }

    const errorMessage = validateForm(newProduct);

    if (errorMessage) {
      Alert.alert('Invalid product', errorMessage);
      return;
    }

    try {
      await createProduct(adminToken, {
        name: newProduct.name.trim(),
        category: newProduct.category.trim(),
        imageUrl: newProduct.imageUrl.trim(),
        description: newProduct.description.trim(),
        price: Number(newProduct.price),
        rating: Number(newProduct.rating),
        eta: newProduct.eta.trim(),
      });

      setNewProduct(emptyForm);
      Alert.alert('Product added', 'The new item is now visible in the menu.');
    } catch (error) {
      Alert.alert('Could not add product', error instanceof Error ? error.message : 'Something went wrong.');
    }
  };

  const handleSaveProduct = async (productId: string) => {
    if (!adminToken) {
      return;
    }

    const draft = drafts[productId];

    if (!draft) {
      return;
    }

    const errorMessage = validateForm(draft);

    if (errorMessage) {
      Alert.alert('Invalid product', errorMessage);
      return;
    }

    try {
      await updateProduct(adminToken, productId, {
        name: draft.name.trim(),
        category: draft.category.trim(),
        imageUrl: draft.imageUrl.trim(),
        description: draft.description.trim(),
        price: Number(draft.price),
        rating: Number(draft.rating),
        eta: draft.eta.trim(),
      });

      setEditingProductId(null);
      Alert.alert('Saved', 'Product details were updated.');
    } catch (error) {
      Alert.alert('Could not save product', error instanceof Error ? error.message : 'Something went wrong.');
    }
  };

  const handleStartEdit = (product: Product) => {
    setDrafts((prev) => ({
      ...prev,
      [product.id]: formFromProduct(product),
    }));
    setEditingProductId(product.id);
  };

  const handleCancelEdit = (product: Product) => {
    setDrafts((prev) => ({
      ...prev,
      [product.id]: formFromProduct(product),
    }));
    setEditingProductId(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!adminToken) {
      return;
    }

    try {
      await deleteProduct(adminToken, productId);
      if (editingProductId === productId) {
        setEditingProductId(null);
      }
    } catch (error) {
      Alert.alert('Could not delete product', error instanceof Error ? error.message : 'Something went wrong.');
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>ADMIN PRODUCTS</Text>
            <Text style={styles.title}>Add, edit, and remove menu items</Text>
          </View>

          <Pressable style={styles.backButton} onPress={() => router.replace('/admin/orders')}>
            <Ionicons name="chevron-back" size={18} color="#081220" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Product</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput value={newProduct.name} onChangeText={(text) => setNewProduct((prev) => ({ ...prev, name: text }))} style={styles.input} placeholder="Item name" placeholderTextColor="#8EA4C1" />

          <Text style={styles.label}>Category</Text>
          <TextInput value={newProduct.category} onChangeText={(text) => setNewProduct((prev) => ({ ...prev, category: text }))} style={styles.input} placeholder="Pizza, Burger, etc." placeholderTextColor="#8EA4C1" />

          <Text style={styles.label}>Image URL</Text>
          <TextInput value={newProduct.imageUrl} onChangeText={(text) => setNewProduct((prev) => ({ ...prev, imageUrl: text }))} style={styles.input} placeholder="https://..." placeholderTextColor="#8EA4C1" autoCapitalize="none" />

          <Text style={styles.label}>Description</Text>
          <TextInput value={newProduct.description} onChangeText={(text) => setNewProduct((prev) => ({ ...prev, description: text }))} style={[styles.input, styles.multilineInput]} placeholder="Describe the dish" placeholderTextColor="#8EA4C1" multiline />

          <View style={styles.inlineRow}>
            <View style={styles.inlineField}>
              <Text style={styles.label}>Price</Text>
              <TextInput value={newProduct.price} onChangeText={(text) => setNewProduct((prev) => ({ ...prev, price: text }))} style={styles.input} keyboardType="number-pad" placeholder="0" placeholderTextColor="#8EA4C1" />
            </View>
            <View style={styles.inlineField}>
              <Text style={styles.label}>Rating</Text>
              <TextInput value={newProduct.rating} onChangeText={(text) => setNewProduct((prev) => ({ ...prev, rating: text }))} style={styles.input} keyboardType="decimal-pad" placeholder="4.5" placeholderTextColor="#8EA4C1" />
            </View>
          </View>

          <Text style={styles.label}>ETA</Text>
          <TextInput value={newProduct.eta} onChangeText={(text) => setNewProduct((prev) => ({ ...prev, eta: text }))} style={styles.input} placeholder="20-30 min" placeholderTextColor="#8EA4C1" />

          <Pressable style={styles.primaryButton} onPress={handleAddProduct}>
            <Ionicons name="add-circle-outline" size={18} color="#081220" />
            <Text style={styles.primaryButtonText}>Add Product</Text>
          </Pressable>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>All Products</Text>
          <Text style={styles.listCount}>{orderedProducts.length} items</Text>
        </View>

        {orderedProducts.map((product) => {
          const draft = drafts[product.id] ?? formFromProduct(product);
          const isEditing = editingProductId === product.id;

          return (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productHeaderRow}>
                <View style={styles.productPreviewBlock}>
                  <Text style={styles.productImageLabel}>Preview</Text>
                  <Text style={styles.productId}>{product.id}</Text>
                </View>

                <View style={styles.productSummaryBlock}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productMeta}>{product.category} · RS. {product.price}</Text>
                  <Text style={styles.productMeta}>{product.eta}</Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <Pressable style={styles.editButton} onPress={() => handleStartEdit(product)}>
                  <Ionicons name="create-outline" size={16} color="#081220" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() =>
                    Alert.alert('Delete product?', `Remove ${product.name} from the menu?`, [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => handleDeleteProduct(product.id),
                      },
                    ])
                  }>
                  <Ionicons name="trash-outline" size={16} color="#F7FAFF" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </Pressable>
              </View>

              {isEditing ? (
                <View style={styles.editPanel}>
                  <Text style={styles.editLabel}>Name</Text>
                  <TextInput value={draft.name} onChangeText={(text) => setDrafts((prev) => ({ ...prev, [product.id]: { ...draft, name: text } }))} style={styles.input} />

                  <Text style={styles.editLabel}>Category</Text>
                  <TextInput value={draft.category} onChangeText={(text) => setDrafts((prev) => ({ ...prev, [product.id]: { ...draft, category: text } }))} style={styles.input} />

                  <Text style={styles.editLabel}>Image URL</Text>
                  <TextInput value={draft.imageUrl} onChangeText={(text) => setDrafts((prev) => ({ ...prev, [product.id]: { ...draft, imageUrl: text } }))} style={styles.input} autoCapitalize="none" />

                  <Text style={styles.editLabel}>Description</Text>
                  <TextInput value={draft.description} onChangeText={(text) => setDrafts((prev) => ({ ...prev, [product.id]: { ...draft, description: text } }))} style={[styles.input, styles.multilineInput]} multiline />

                  <View style={styles.inlineRow}>
                    <View style={styles.inlineField}>
                      <Text style={styles.editLabel}>Price</Text>
                      <TextInput value={draft.price} onChangeText={(text) => setDrafts((prev) => ({ ...prev, [product.id]: { ...draft, price: text } }))} style={styles.input} keyboardType="number-pad" />
                    </View>
                    <View style={styles.inlineField}>
                      <Text style={styles.editLabel}>Rating</Text>
                      <TextInput value={draft.rating} onChangeText={(text) => setDrafts((prev) => ({ ...prev, [product.id]: { ...draft, rating: text } }))} style={styles.input} keyboardType="decimal-pad" />
                    </View>
                  </View>

                  <Text style={styles.editLabel}>ETA</Text>
                  <TextInput value={draft.eta} onChangeText={(text) => setDrafts((prev) => ({ ...prev, [product.id]: { ...draft, eta: text } }))} style={styles.input} />

                  <View style={styles.editActionsRow}>
                    <Pressable style={styles.saveButton} onPress={() => handleSaveProduct(product.id)}>
                      <Ionicons name="save-outline" size={16} color="#081220" />
                      <Text style={styles.saveButtonText}>Save</Text>
                    </Pressable>

                    <Pressable style={styles.cancelButton} onPress={() => handleCancelEdit(product)}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </View>
          );
        })}
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 30,
    gap: 14,
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
    maxWidth: 250,
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
  card: {
    backgroundColor: '#101F34',
    borderWidth: 1,
    borderColor: '#253D5B',
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  cardTitle: {
    color: '#F7FAFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  label: {
    color: '#C9D8EB',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#0A1527',
    color: '#ECF2FC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A4161',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 82,
    textAlignVertical: 'top',
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inlineField: {
    flex: 1,
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: '#22D391',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#081220',
    fontWeight: '900',
    fontSize: 15,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  listTitle: {
    color: '#F7FAFF',
    fontSize: 18,
    fontWeight: '900',
  },
  listCount: {
    color: '#9CB0CB',
    fontWeight: '700',
  },
  productCard: {
    backgroundColor: '#101F34',
    borderWidth: 1,
    borderColor: '#253D5B',
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  productHeaderRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  productPreviewBlock: {
    backgroundColor: '#0E1A2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#223854',
    padding: 12,
    width: 92,
    flexShrink: 0,
  },
  productImageLabel: {
    color: '#9CB0CB',
    fontSize: 12,
    fontWeight: '700',
  },
  productId: {
    marginTop: 3,
    color: '#F7FAFF',
    fontSize: 14,
    fontWeight: '800',
  },
  productSummaryBlock: {
    flex: 1,
    gap: 3,
  },
  productName: {
    color: '#F7FAFF',
    fontSize: 16,
    fontWeight: '900',
  },
  productMeta: {
    color: '#A8BCD8',
    fontSize: 12,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  editPanel: {
    marginTop: 6,
    gap: 8,
  },
  editLabel: {
    color: '#C9D8EB',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  editActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#A7F3D0',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  editButtonText: {
    color: '#081220',
    fontWeight: '900',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FFD166',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveButtonText: {
    color: '#081220',
    fontWeight: '900',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#223854',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#F7FAFF',
    fontWeight: '900',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF6B5B',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deleteButtonText: {
    color: '#F7FAFF',
    fontWeight: '900',
  },
});