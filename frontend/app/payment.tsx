import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
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
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '@/constants/api';
import { useAuth } from '@/contexts/auth-context';
import { NotificationButton } from '@/components/notification-button';
import { BottomOptionsBar } from '@/components/bottom-options-bar';
import {
  validateCardHolder,
  validateCardNumber,
  validateExpiryDate,
  validateCVV,
  validateAllCardDetails,
} from '@/utils/card-validation';

type PaymentOption = 'Credit Card' | 'Debit Card' | 'Bank';

const paymentOptions: { label: PaymentOption; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Credit Card', icon: 'card-outline' },
  { label: 'Debit Card', icon: 'card' },
  { label: 'Bank', icon: 'business-outline' },
];

const BANK_DETAILS = {
  name: 'BOC',
  accountNumber: '11122233',
  branch: 'Malabe',
  accountHolder: 'G.A.M Gunarathna',
};

export default function PaymentScreen() {
  const params = useLocalSearchParams<{ itemName?: string; price?: string }>();
  const { userEmail, setUserEmail, userProfile } = useAuth();
  const [selectedOption, setSelectedOption] = useState<PaymentOption>('Credit Card');
  const [customerEmail, setCustomerEmail] = useState(userEmail ?? '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phone ?? '');
  const [address, setAddress] = useState(userProfile?.address ?? '');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [bankSlipUri, setBankSlipUri] = useState<string | null>(null);
  const [bankSlipBase64, setBankSlipBase64] = useState<string | null>(null);
  const [isUploadingSlip, setIsUploadingSlip] = useState(false);
  const [cardErrors, setCardErrors] = useState({
    holder: '',
    number: '',
    expiry: '',
    cvv: '',
  });

  const itemName = useMemo(() => {
    if (typeof params.itemName === 'string' && params.itemName.trim().length > 0) {
      return params.itemName;
    }

    return 'Selected Item';
  }, [params.itemName]);

  const price = useMemo(() => {
    const raw = typeof params.price === 'string' ? Number(params.price) : Number.NaN;
    return Number.isFinite(raw) ? raw : 0;
  }, [params.price]);

  const isCardPayment = selectedOption === 'Credit Card' || selectedOption === 'Debit Card';

  const cleanCardNumber = useMemo(() => cardNumber.replace(/\D/g, ''), [cardNumber]);

  const maskedCard = useMemo(() => {
    if (cleanCardNumber.length < 4) {
      return '****';
    }

    return cleanCardNumber.slice(-4);
  }, [cleanCardNumber]);

  // Real-time validation handlers
  const handleCardHolderChange = (value: string) => {
    setCardHolder(value);
    if (value.trim()) {
      const validation = validateCardHolder(value);
      setCardErrors((prev) => ({ ...prev, holder: validation.error || '' }));
    } else {
      setCardErrors((prev) => ({ ...prev, holder: '' }));
    }
  };

  const handleCardNumberChange = (value: string) => {
    setCardNumber(value);
    if (value.replace(/\D/g, '').length > 0) {
      const validation = validateCardNumber(value);
      setCardErrors((prev) => ({ ...prev, number: validation.error || '' }));
    } else {
      setCardErrors((prev) => ({ ...prev, number: '' }));
    }
  };

  const handleExpiryChange = (value: string) => {
    setExpiry(value);
    if (value.trim()) {
      const validation = validateExpiryDate(value);
      setCardErrors((prev) => ({ ...prev, expiry: validation.error || '' }));
    } else {
      setCardErrors((prev) => ({ ...prev, expiry: '' }));
    }
  };

  const handleCVVChange = (value: string) => {
    setCvv(value);
    if (value.trim()) {
      const validation = validateCVV(value);
      setCardErrors((prev) => ({ ...prev, cvv: validation.error || '' }));
    } else {
      setCardErrors((prev) => ({ ...prev, cvv: '' }));
    }
  };

  const pickBankSlip = async () => {
    try {
      setIsUploadingSlip(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setBankSlipUri(asset.uri);
        if (asset.base64) {
          setBankSlipBase64(asset.base64);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
    } finally {
      setIsUploadingSlip(false);
    }
  };

  const removeBankSlip = () => {
    setBankSlipUri(null);
    setBankSlipBase64(null);
  };

  const confirmPayment = async () => {
    const normalizedEmail = customerEmail.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address for notifications.');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Phone Number Required', 'Please enter your phone number.');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Address Required', 'Please enter your delivery address.');
      return;
    }

    if (isCardPayment) {
      // Validate all card details
      const cardValidation = validateAllCardDetails(cardHolder, cardNumber, expiry, cvv);
      if (!cardValidation.isValid) {
        Alert.alert('Invalid Card Details', cardValidation.error);
        return;
      }
    }

    if (selectedOption === 'Bank' && !bankSlipUri) {
      Alert.alert('Missing Bank Slip', 'Please upload a payment slip to proceed.');
      return;
    }

    try {
      const orderData: Record<string, any> = {
        itemName,
        price,
        paymentMethod: selectedOption,
        customerEmail: normalizedEmail,
        customerPhone: phoneNumber,
        customerAddress: address,
      };

      // Add bank slip if bank transfer is selected
      if (selectedOption === 'Bank' && bankSlipBase64) {
        orderData.bankSlip = bankSlipBase64;
      }

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.id) {
        Alert.alert('Order failed', payload?.message ?? 'Could not place order.');
        return;
      }

      const orderNumber = payload.id;
      setUserEmail(normalizedEmail);

      router.replace({
        pathname: '/receipt',
        params: {
          orderNumber,
          itemName,
          price: String(price),
          paymentMethod: selectedOption,
          cardLast4: isCardPayment ? maskedCard : '',
          customerPhone: phoneNumber,
          customerAddress: address,
        },
      });
    } catch {
      Alert.alert('Connection error', 'Could not connect to backend. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.backgroundBlobOne} />
      <View style={styles.backgroundBlobTwo} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={18} color="#E6EEFC" />
            </Pressable>
            <Text style={styles.title}>Payment Options</Text>
            <NotificationButton />
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>ORDER ITEM</Text>
            <Text style={styles.itemName}>{itemName}</Text>
            <Text style={styles.amount}>RS. {price}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>NOTIFICATION EMAIL</Text>
            <TextInput
              value={customerEmail}
              onChangeText={setCustomerEmail}
              placeholder="you@example.com"
              placeholderTextColor="#8AA0BE"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>PHONE NUMBER</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              placeholderTextColor="#8AA0BE"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>DELIVERY ADDRESS</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Enter full address"
              placeholderTextColor="#8AA0BE"
              multiline
              numberOfLines={2}
              style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
            />
          </View>

          <Text style={styles.sectionTitle}>Choose Payment Method</Text>

          <View style={styles.optionList}>
            {paymentOptions.map((option) => {
              const isSelected = selectedOption === option.label;

              return (
                <Pressable
                  key={option.label}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  onPress={() => setSelectedOption(option.label)}>
                  <View style={styles.optionLeft}>
                    <Ionicons name={option.icon} size={20} color={isSelected ? '#081220' : '#D6E3F7'} />
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option.label}</Text>
                  </View>

                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={isSelected ? '#081220' : '#91A8C8'}
                  />
                </Pressable>
              );
            })}
          </View>

          {isCardPayment && (
            <View style={styles.formCard}>
              <Text style={styles.formLabel}>Card Holder Name</Text>
              <TextInput
                value={cardHolder}
                onChangeText={handleCardHolderChange}
                placeholder="Name on card"
                placeholderTextColor="#8AA0BE"
                style={[styles.input, cardErrors.holder && styles.inputError]}
              />
              {cardErrors.holder && <Text style={styles.errorText}>{cardErrors.holder}</Text>}

              <Text style={styles.formLabel}>Card Number</Text>
              <TextInput
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#8AA0BE"
                keyboardType="number-pad"
                style={[styles.input, cardErrors.number && styles.inputError]}
              />
              {cardErrors.number && <Text style={styles.errorText}>{cardErrors.number}</Text>}

              <View style={styles.inlineRow}>
                <View style={styles.inlineField}>
                  <Text style={styles.formLabel}>Expiry</Text>
                  <TextInput
                    value={expiry}
                    onChangeText={handleExpiryChange}
                    placeholder="MM/YY"
                    placeholderTextColor="#8AA0BE"
                    style={[styles.input, cardErrors.expiry && styles.inputError]}
                  />
                  {cardErrors.expiry && <Text style={styles.errorText}>{cardErrors.expiry}</Text>}
                </View>

                <View style={styles.inlineField}>
                  <Text style={styles.formLabel}>CVV</Text>
                  <TextInput
                    value={cvv}
                    onChangeText={handleCVVChange}
                    placeholder="123"
                    placeholderTextColor="#8AA0BE"
                    keyboardType="number-pad"
                    secureTextEntry
                    style={[styles.input, cardErrors.cvv && styles.inputError]}
                  />
                  {cardErrors.cvv && <Text style={styles.errorText}>{cardErrors.cvv}</Text>}
                </View>
              </View>
            </View>
          )}

          {selectedOption === 'Bank' && (
            <View style={styles.bankDetailsCard}>
              <Text style={styles.bankDetailsTitle}>Bank Transfer Details</Text>

              <View style={styles.bankDetailRow}>
                <Text style={styles.bankLabel}>Bank Name</Text>
                <Text style={styles.bankValue}>{BANK_DETAILS.name}</Text>
              </View>

              <View style={styles.bankDetailRow}>
                <Text style={styles.bankLabel}>Account Number</Text>
                <Text style={styles.bankValue}>{BANK_DETAILS.accountNumber}</Text>
              </View>

              <View style={styles.bankDetailRow}>
                <Text style={styles.bankLabel}>Branch</Text>
                <Text style={styles.bankValue}>{BANK_DETAILS.branch}</Text>
              </View>

              <View style={styles.bankDetailRow}>
                <Text style={styles.bankLabel}>Account Holder</Text>
                <Text style={styles.bankValue}>{BANK_DETAILS.accountHolder}</Text>
              </View>

              <Text style={styles.slipLabel}>Upload Payment Slip</Text>

              {bankSlipUri ? (
                <View style={styles.slipPreviewContainer}>
                  <Image source={{ uri: bankSlipUri }} style={styles.slipImage} />
                  <Pressable style={styles.removeSlipButton} onPress={removeBankSlip}>
                    <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={styles.uploadSlipButton}
                  onPress={pickBankSlip}
                  disabled={isUploadingSlip}>
                  <Ionicons name="cloud-upload-outline" size={32} color="#FFD166" />
                  <Text style={styles.uploadSlipText}>
                    {isUploadingSlip ? 'Uploading...' : 'Tap to upload slip from gallery'}
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </ScrollView>

        <Pressable style={styles.payNowButton} onPress={confirmPayment}>
          <Text style={styles.payNowText}>Pay Now</Text>
          <Ionicons name="arrow-forward" size={16} color="#081220" />
        </Pressable>

        <BottomOptionsBar />
      </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  backgroundBlobOne: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#FF6B3C',
    opacity: 0.18,
  },
  backgroundBlobTwo: {
    position: 'absolute',
    bottom: -80,
    left: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FFD166',
    opacity: 0.1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2B4261',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#F4F8FF',
    fontSize: 26,
    fontWeight: '900',
  },
  summaryCard: {
    backgroundColor: '#101F34',
    borderWidth: 1,
    borderColor: '#253D5B',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },
  summaryLabel: {
    color: '#A2B8D5',
    fontSize: 12,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  itemName: {
    marginTop: 6,
    color: '#F8FBFF',
    fontSize: 20,
    fontWeight: '800',
  },
  amount: {
    marginTop: 8,
    color: '#2DE39B',
    fontSize: 18,
    fontWeight: '900',
  },
  sectionTitle: {
    color: '#E8F0FC',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  optionList: {
    gap: 10,
  },
  optionCard: {
    backgroundColor: '#111E33',
    borderWidth: 1,
    borderColor: '#2A4260',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionCardSelected: {
    backgroundColor: '#FFD166',
    borderColor: '#FFD166',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  optionText: {
    color: '#D6E3F7',
    fontSize: 15,
    fontWeight: '700',
  },
  optionTextSelected: {
    color: '#081220',
  },
  formCard: {
    marginTop: 16,
    backgroundColor: '#102137',
    borderWidth: 1,
    borderColor: '#2A4260',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  formLabel: {
    color: '#D8E5F8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#0B172A',
    borderWidth: 1,
    borderColor: '#304B71',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: '#EFF5FF',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    fontWeight: '500',
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inlineField: {
    flex: 1,
  },
  bankDetailsCard: {
    marginTop: 16,
    backgroundColor: '#102137',
    borderWidth: 1,
    borderColor: '#2A4260',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  bankDetailsTitle: {
    color: '#FFD166',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  bankDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1F3552',
  },
  bankLabel: {
    color: '#A2B8D5',
    fontSize: 13,
    fontWeight: '600',
  },
  bankValue: {
    color: '#FFD166',
    fontSize: 13,
    fontWeight: '700',
  },
  slipLabel: {
    color: '#D8E5F8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },
  uploadSlipButton: {
    backgroundColor: '#0B172A',
    borderWidth: 2,
    borderColor: '#FFD166',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadSlipText: {
    color: '#FFD166',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  slipPreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0B172A',
    borderWidth: 1,
    borderColor: '#2A4260',
  },
  slipImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  removeSlipButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  payNowButton: {
    marginTop: 10,
    marginBottom: 90,
    backgroundColor: '#22D391',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  payNowText: {
    color: '#081220',
    fontSize: 16,
    fontWeight: '900',
  },
});
