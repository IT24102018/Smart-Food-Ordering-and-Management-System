import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { API_BASE_URL } from '@/constants/api';
import { defaultProducts, Product } from '@/data/food-items';

type ProductInput = Omit<Product, 'id'>;

type ProductsContextValue = {
  products: Product[];
  loading: boolean;
  refreshProducts: () => Promise<void>;
  createProduct: (token: string, payload: ProductInput) => Promise<void>;
  updateProduct: (token: string, productId: string, payload: Partial<ProductInput>) => Promise<void>;
  deleteProduct: (token: string, productId: string) => Promise<void>;
};

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

const readJsonResponse = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [loading, setLoading] = useState(false);

  const refreshProducts = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/products`);
      const payload = await readJsonResponse(response);

      if (response.ok && Array.isArray(payload?.products)) {
        setProducts(payload.products);
      }
    } catch {
      setProducts((current) => (current.length > 0 ? current : defaultProducts));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const createProduct = useCallback(
    async (token: string, payload: ProductInput) => {
      const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(payload),
      });

      const body = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(body?.message ?? 'Could not create product.');
      }

      await refreshProducts();
    },
    [refreshProducts]
  );

  const updateProduct = useCallback(
    async (token: string, productId: string, payload: Partial<ProductInput>) => {
      const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(payload),
      });

      const body = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(body?.message ?? 'Could not update product.');
      }

      await refreshProducts();
    },
    [refreshProducts]
  );

  const deleteProduct = useCallback(
    async (token: string, productId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': token,
        },
      });

      const body = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(body?.message ?? 'Could not delete product.');
      }

      await refreshProducts();
    },
    [refreshProducts]
  );

  const value = useMemo(
    () => ({
      products,
      loading,
      refreshProducts,
      createProduct,
      updateProduct,
      deleteProduct,
    }),
    [createProduct, deleteProduct, loading, products, refreshProducts, updateProduct]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductsContext);

  if (!context) {
    throw new Error('useProducts must be used within ProductsProvider');
  }

  return context;
}