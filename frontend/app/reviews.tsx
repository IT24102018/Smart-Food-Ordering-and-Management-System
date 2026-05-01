import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { API_BASE_URL } from '@/constants/api';
import { useProducts } from '@/contexts/products-context';

type Review = {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export default function ReviewsScreen() {
  const params = useLocalSearchParams<{ productId?: string; itemName?: string }>();
  const { refreshProducts } = useProducts();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!params.productId) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/products/${params.productId}/reviews`);
      const payload = await response.json();
      if (response.ok && payload.reviews) {
        setReviews(payload.reviews);
      }
    } catch {
      Alert.alert('Error', 'Could not load reviews.');
    } finally {
      setLoading(false);
    }
  }, [params.productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submitReview = async () => {
    if (!customerName.trim()) {
      Alert.alert('Missing Name', 'Please enter your name.');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Missing Comment', 'Please enter a review comment.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/api/products/${params.productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, rating, comment }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      setCustomerName('');
      setRating(5);
      setComment('');
      
      // Refresh the product list so the average rating updates
      await refreshProducts();
      await fetchReviews();
    } catch {
      Alert.alert('Error', 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <Ionicons
        key={idx}
        name={idx < count ? 'star' : 'star-outline'}
        size={14}
        color="#FFC857"
      />
    ));
  };

  const renderInteractiveStars = () => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <Pressable key={idx} onPress={() => setRating(idx + 1)}>
        <Ionicons
          name={idx < rating ? 'star' : 'star-outline'}
          size={32}
          color="#FFC857"
        />
      </Pressable>
    ));
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={18} color="#E6EEFC" />
          </Pressable>
          <Text style={styles.title}>Reviews for {params.itemName}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {loading ? (
            <ActivityIndicator size="large" color="#FFD166" style={{ marginTop: 20 }} />
          ) : reviews.length === 0 ? (
            <Text style={styles.emptyText}>No reviews yet. Be the first to review!</Text>
          ) : (
            reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{rev.customerName}</Text>
                  <View style={styles.starsRow}>{renderStars(rev.rating)}</View>
                </View>
                <Text style={styles.reviewDate}>{new Date(rev.createdAt).toLocaleDateString()}</Text>
                <Text style={styles.reviewComment}>{rev.comment}</Text>
              </View>
            ))
          )}

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Leave a Review</Text>
            
            <Text style={styles.formLabel}>Rating</Text>
            <View style={styles.interactiveStarsRow}>{renderInteractiveStars()}</View>

            <Text style={styles.formLabel}>Your Name</Text>
            <TextInput
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="John Doe"
              placeholderTextColor="#8AA0BE"
              style={styles.input}
            />

            <Text style={styles.formLabel}>Comment</Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="This food was amazing!"
              placeholderTextColor="#8AA0BE"
              multiline
              numberOfLines={4}
              style={[styles.input, styles.textArea]}
            />

            <Pressable style={styles.submitButton} onPress={submitReview} disabled={submitting}>
              <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit Review'}</Text>
              <Ionicons name="send" size={16} color="#081220" />
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#081220', paddingHorizontal: 16, paddingTop: 10 },
  flex: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  backButton: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#2B4261', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#F4F8FF', fontSize: 20, fontWeight: '900', flex: 1 },
  scrollContent: { paddingBottom: 24 },
  emptyText: { color: '#9CB0CB', textAlign: 'center', marginVertical: 20, fontSize: 15 },
  reviewCard: { backgroundColor: '#102036', borderWidth: 1, borderColor: '#2A4260', borderRadius: 14, padding: 14, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewerName: { color: '#F7FAFF', fontSize: 16, fontWeight: '700' },
  starsRow: { flexDirection: 'row', gap: 2 },
  reviewDate: { color: '#6A84A4', fontSize: 11, marginTop: 4, marginBottom: 8 },
  reviewComment: { color: '#D8E5F8', fontSize: 14, lineHeight: 20 },
  formCard: { marginTop: 24, backgroundColor: '#0B172A', borderWidth: 1, borderColor: '#1F324C', borderRadius: 16, padding: 16 },
  formTitle: { color: '#FFD166', fontSize: 18, fontWeight: '800', marginBottom: 16 },
  formLabel: { color: '#D8E5F8', fontSize: 13, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  interactiveStarsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  input: { backgroundColor: '#111E33', borderWidth: 1, borderColor: '#304B71', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, color: '#EFF5FF', fontSize: 14 },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitButton: { marginTop: 20, backgroundColor: '#22D391', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  submitText: { color: '#081220', fontSize: 15, fontWeight: '900' },
});
