import React, { useMemo } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Print from 'expo-print';
import { NotificationButton } from '@/components/notification-button';
import { BottomOptionsBar } from '@/components/bottom-options-bar';

export default function ReceiptScreen() {
  const params = useLocalSearchParams<{
    orderNumber?: string;
    itemName?: string;
    price?: string;
    paymentMethod?: string;
    cardLast4?: string;
    customerPhone?: string;
    customerAddress?: string;
  }>();

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

  const orderNumber = useMemo(() => {
    if (typeof params.orderNumber === 'string' && params.orderNumber.trim().length > 0) {
      return params.orderNumber;
    }

    return `ORD-${Date.now().toString().slice(-8)}`;
  }, [params.orderNumber]);

  const paymentMethod = useMemo(() => {
    if (typeof params.paymentMethod === 'string' && params.paymentMethod.trim().length > 0) {
      return params.paymentMethod;
    }

    return 'Bank';
  }, [params.paymentMethod]);

  const cardLast4 = useMemo(() => {
    if (typeof params.cardLast4 === 'string' && params.cardLast4.trim().length > 0) {
      return params.cardLast4;
    }

    return '';
  }, [params.cardLast4]);

  const customerPhone = useMemo(() => {
    return typeof params.customerPhone === 'string' ? params.customerPhone : '';
  }, [params.customerPhone]);

  const customerAddress = useMemo(() => {
    return typeof params.customerAddress === 'string' ? params.customerAddress : '';
  }, [params.customerAddress]);

  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    return { date, time };
  };

  const generateBillHTML = () => {
    const { date, time } = getCurrentDateTime();

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>YUMMI Bill</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              width: 80mm;
              padding: 10mm;
              margin: 0;
              background: white;
              color: black;
            }
            .container {
              width: 100%;
            }
            .header {
              text-align: center;
              margin-bottom: 15mm;
              border-bottom: 2px solid black;
              padding-bottom: 5mm;
            }
            .shop-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5mm;
            }
            .shop-info {
              font-size: 10px;
              margin-bottom: 3mm;
            }
            .bill-details {
              margin-bottom: 10mm;
              font-size: 11px;
            }
            .item-section {
              margin-bottom: 10mm;
              border: 1px solid #ddd;
              padding: 5mm;
            }
            .item-title {
              font-weight: bold;
              font-size: 12px;
              margin-bottom: 3mm;
            }
            .item-detail {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2mm;
              font-size: 11px;
            }
            .separator {
              border-top: 1px dashed black;
              margin: 5mm 0;
            }
            .total-section {
              margin-bottom: 10mm;
              font-size: 12px;
            }
            .total-amount {
              font-weight: bold;
              text-align: right;
              font-size: 16px;
              margin-top: 3mm;
            }
            .footer {
              text-align: center;
              font-size: 10px;
              margin-top: 10mm;
              border-top: 1px solid black;
              padding-top: 5mm;
            }
            .center {
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="shop-name">🍔 YUMMI 🍕</div>
              <div class="shop-info">Food Delivery System</div>
            </div>

            <!-- Bill Details -->
            <div class="bill-details">
              <div class="item-detail">
                <span>Order No:</span>
                <span><strong>${orderNumber}</strong></span>
              </div>
              <div class="item-detail">
                <span>Date:</span>
                <span>${date}</span>
              </div>
              <div class="item-detail">
                <span>Time:</span>
                <span>${time}</span>
              </div>
            </div>

            <div class="separator"></div>

            <!-- Item Details -->
            <div class="item-section">
              <div class="item-title">📦 ORDER DETAILS</div>
              <div class="item-detail">
                <span>Item:</span>
                <span><strong>${itemName}</strong></span>
              </div>
              <div class="item-detail">
                <span>Unit Price:</span>
                <span>Rs. ${price}</span>
              </div>
              <div class="item-detail">
                <span>Quantity:</span>
                <span>1</span>
              </div>
            </div>

            <div class="separator"></div>

            <!-- Delivery Details -->
            <div class="item-section">
              <div class="item-title">🚚 DELIVERY DETAILS</div>
              <div class="item-detail">
                <span>Phone:</span>
                <span><strong>${customerPhone}</strong></span>
              </div>
              <div class="item-detail">
                <span>Address:</span>
                <span><strong>${customerAddress}</strong></span>
              </div>
            </div>

            <div class="separator"></div>

            <!-- Payment Details -->
            <div class="item-section">
              <div class="item-title">💳 PAYMENT METHOD</div>
              <div class="item-detail">
                <span>Method:</span>
                <span><strong>${paymentMethod}</strong></span>
              </div>
              ${cardLast4 ? `<div class="item-detail"><span>Card:</span><span>**** ${cardLast4}</span></div>` : ''}
            </div>

            <div class="separator"></div>

            <!-- Total -->
            <div class="total-section">
              <div class="item-detail">
                <span>Subtotal:</span>
                <span>Rs. ${price}</span>
              </div>
              <div class="item-detail">
                <span>Tax (0%):</span>
                <span>Rs. 0.00</span>
              </div>
              <div class="total-amount">
                <div class="item-detail">
                  <span>TOTAL:</span>
                  <span>Rs. ${price}</span>
                </div>
              </div>
            </div>

            <div class="separator"></div>

            <!-- Footer -->
            <div class="footer">
              <div>Thank you for your order!</div>
              <div>✓ Payment Successful</div>
              <div style="margin-top: 5mm; font-size: 9px;">Please keep this receipt for reference</div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrintBill = async () => {
    try {
      const html = generateBillHTML();
      await Print.printAsync({
        html,
        printerUrl: undefined,
      });
    } catch (error) {
      Alert.alert('Print Error', 'Could not print the bill. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topRow}>
        <NotificationButton />
      </View>

      <View style={styles.successWrap}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={24} color="#07111E" />
        </View>
        <Text style={styles.title}>Payment Successful</Text>
        <Text style={styles.subtitle}>Your receipt is ready.</Text>
      </View>

      <View style={styles.receiptCard}>
        <Text style={styles.receiptHeading}>Order Receipt</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Order No</Text>
          <Text style={styles.value}>{orderNumber}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Food Item</Text>
          <Text style={styles.value}>{itemName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Payment</Text>
          <Text style={styles.value}>{paymentMethod}</Text>
        </View>

        {cardLast4.length > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Card</Text>
            <Text style={styles.value}>**** {cardLast4}</Text>
          </View>
        )}

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{customerPhone}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{customerAddress}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total Paid</Text>
          <Text style={styles.totalValue}>RS. {price}</Text>
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <Pressable style={styles.printButton} onPress={handlePrintBill}>
          <Ionicons name="print" size={16} color="#081220" />
          <Text style={styles.printText}>Print Bill</Text>
        </Pressable>

        <Pressable style={styles.menuButton} onPress={() => router.replace('/food')}>
          <Text style={styles.menuText}>Back To Food Menu</Text>
          <Ionicons name="arrow-forward" size={16} color="#081220" />
        </Pressable>
      </View>

      <BottomOptionsBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#081220',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  successWrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2DE39B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 10,
    color: '#F5FAFF',
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: '#A9BEDC',
    fontSize: 14,
  },
  receiptCard: {
    backgroundColor: '#102036',
    borderWidth: 1,
    borderColor: '#29425F',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  receiptHeading: {
    color: '#F0F6FF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    color: '#AFC3DE',
    fontSize: 13,
    fontWeight: '700',
  },
  value: {
    color: '#ECF4FF',
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: '#2F4968',
    marginVertical: 6,
  },
  totalLabel: {
    color: '#F6FBFF',
    fontSize: 15,
    fontWeight: '800',
  },
  totalValue: {
    color: '#2DE39B',
    fontSize: 16,
    fontWeight: '900',
  },
  buttonGroup: {
    marginTop: 'auto',
    marginBottom: 90,
    gap: 10,
  },
  printButton: {
    backgroundColor: '#22D391',
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  printText: {
    color: '#081220',
    fontSize: 15,
    fontWeight: '900',
  },
  menuButton: {
    backgroundColor: '#FFD166',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  menuText: {
    color: '#081220',
    fontSize: 15,
    fontWeight: '900',
  },
});
