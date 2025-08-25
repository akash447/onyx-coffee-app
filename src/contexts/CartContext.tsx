import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cart, CartItem, CatalogItem } from '../types';

// Cart Actions
type CartAction =
  | { type: 'RESTORE_CART'; payload: Cart }
  | { type: 'ADD_ITEM'; payload: { product: CatalogItem; quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

// Cart Context
interface CartContextType extends Cart {
  addToCart: (product: CatalogItem, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Reducer
const cartReducer = (state: Cart, action: CartAction): Cart => {
  switch (action.type) {
    case 'RESTORE_CART':
      return action.payload;
      
    case 'ADD_ITEM': {
      const { product, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.product.id === product.id);
      
      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, { product, quantity }];
      }
      
      const newTotal = calculateTotal(newItems);
      const newItemCount = calculateItemCount(newItems);
      
      return {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.product.id !== action.payload);
      const newTotal = calculateTotal(newItems);
      const newItemCount = calculateItemCount(newItems);
      
      return {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        const newItems = state.items.filter(item => item.product.id !== productId);
        const newTotal = calculateTotal(newItems);
        const newItemCount = calculateItemCount(newItems);
        
        return {
          items: newItems,
          total: newTotal,
          itemCount: newItemCount,
        };
      }
      
      const newItems = state.items.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
      
      const newTotal = calculateTotal(newItems);
      const newItemCount = calculateItemCount(newItems);
      
      return {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      };
    }
    
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        itemCount: 0,
      };
      
    default:
      return state;
  }
};

// Helper functions
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

// Initial State
const initialState: Cart = {
  items: [],
  total: 0,
  itemCount: 0,
};

// Cart Provider Component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Restore cart from storage on app start
  useEffect(() => {
    const restoreCart = async () => {
      try {
        const cartString = await AsyncStorage.getItem('bb-cart');
        if (cartString) {
          const cart = JSON.parse(cartString);
          dispatch({ type: 'RESTORE_CART', payload: cart });
        }
      } catch (error) {
        console.error('Failed to restore cart:', error);
      }
    };

    restoreCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem('bb-cart', JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save cart:', error);
      }
    };

    // Don't save on initial load (when cart is empty and might be restoring)
    if (state.items.length > 0 || state.total > 0) {
      saveCart();
    }
  }, [state]);

  // Add item to cart
  const addToCart = async (product: CatalogItem, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  };

  // Remove item from cart
  const removeFromCart = async (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  // Update item quantity
  const updateQuantity = async (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  // Clear entire cart
  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART' });
    try {
      await AsyncStorage.removeItem('bb-cart');
    } catch (error) {
      console.error('Failed to clear cart storage:', error);
    }
  };

  const contextValue: CartContextType = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};