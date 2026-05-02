import React, { createContext, useContext, useMemo, useState } from 'react';

type FoodContextValue = {
  favoriteIds: string[];
  cartIds: string[];
  toggleFavorite: (itemId: string) => void;
  addToCart: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
};

const FoodContext = createContext<FoodContextValue | undefined>(undefined);

export function FoodProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [cartIds, setCartIds] = useState<string[]>([]);

  const value = useMemo(
    () => ({
      favoriteIds,
      cartIds,
      toggleFavorite: (itemId: string) => {
        setFavoriteIds((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]));
      },
      addToCart: (itemId: string) => {
        setCartIds((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]));
      },
      removeFromCart: (itemId: string) => {
        setCartIds((prev) => prev.filter((id) => id !== itemId));
      },
    }),
    [favoriteIds, cartIds]
  );

  return <FoodContext.Provider value={value}>{children}</FoodContext.Provider>;
}

export function useFoodState() {
  const context = useContext(FoodContext);

  if (!context) {
    throw new Error('useFoodState must be used within FoodProvider');
  }

  return context;
}
