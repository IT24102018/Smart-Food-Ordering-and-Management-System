import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type BottomOptionKey = 'home' | 'orders' | 'cart' | 'favourite' | 'settings';

type BottomOptionsBarProps = {
  active?: BottomOptionKey;
};

const options: {
  key: BottomOptionKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  path: '/(tabs)' | '/(tabs)/explore' | '/(tabs)/cart' | '/(tabs)/favourite' | '/(tabs)/settings';
}[] = [
  { key: 'home', label: 'Home', icon: 'home-outline', path: '/(tabs)' },
  { key: 'orders', label: 'Orders', icon: 'bag-handle-outline', path: '/(tabs)/explore' },
  { key: 'cart', label: 'Cart', icon: 'cart-outline', path: '/(tabs)/cart' },
  { key: 'favourite', label: 'Favourite', icon: 'heart-outline', path: '/(tabs)/favourite' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline', path: '/(tabs)/settings' },
];

export function BottomOptionsBar({ active }: BottomOptionsBarProps) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const isActive = active === option.key;

        return (
          <Pressable key={option.key} style={styles.button} onPress={() => router.replace(option.path)}>
            <Ionicons name={isActive ? option.icon.replace('-outline', '') as keyof typeof Ionicons.glyphMap : option.icon} size={18} color={isActive ? '#FFB088' : '#9FB2CC'} />
            <Text style={[styles.label, isActive && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    height: 64,
    backgroundColor: '#0C172A',
    borderWidth: 1,
    borderColor: '#1B2D46',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flex: 1,
  },
  label: {
    color: '#9FB2CC',
    fontSize: 11,
    fontWeight: '700',
  },
  labelActive: {
    color: '#FFB088',
  },
});