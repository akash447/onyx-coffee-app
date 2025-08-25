import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CatalogItem } from '../types';

// Catalog State
interface CatalogState {
  items: CatalogItem[];
  loading: boolean;
  error: string | null;
}

// Catalog Actions
type CatalogAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: CatalogItem[] }
  | { type: 'LOAD_FAILURE'; payload: string }
  | { type: 'ADD_ITEM'; payload: CatalogItem }
  | { type: 'UPDATE_ITEM'; payload: CatalogItem }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'CLEAR_ITEMS' };

// Catalog Context
interface CatalogContextType extends CatalogState {
  addItem: (item: Omit<CatalogItem, 'id'>) => Promise<void>;
  updateItem: (item: CatalogItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  clearItems: () => Promise<void>;
  getItemById: (id: string) => CatalogItem | undefined;
  getRecommendedItem: (brewStyle?: string, roastProfile?: string, flavorDirection?: string) => CatalogItem | undefined;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

// Sample initial catalog data
const initialCatalogData: CatalogItem[] = [
  {
    id: '1',
    name: 'Ethiopian Yirgacheffe',
    desc: 'Bright and floral with notes of lemon and jasmine. Perfect for pour-over brewing.',
    price: 899,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
    rating: 4.8,
    reviews: 142,
    category: 'Single Origin',
    roastProfile: 'light',
    brewStyle: 'filter',
    flavorNotes: ['floral', 'citrus', 'bright'],
  },
  {
    id: '2',
    name: 'Colombian Supremo',
    desc: 'Rich and balanced with chocolate and caramel notes. Excellent for espresso.',
    price: 799,
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400',
    rating: 4.6,
    reviews: 89,
    category: 'Single Origin',
    roastProfile: 'medium',
    brewStyle: 'espresso',
    flavorNotes: ['chocolate', 'caramel', 'balanced'],
  },
  {
    id: '3',
    name: 'House Blend Dark Roast',
    desc: 'Bold and smoky with deep, rich flavors. Perfect for French press or espresso.',
    price: 699,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    rating: 4.4,
    reviews: 203,
    category: 'Blend',
    roastProfile: 'dark',
    brewStyle: 'french-press',
    flavorNotes: ['smoky', 'bold', 'rich'],
  },
  {
    id: '4',
    name: 'Brazilian Santos',
    desc: 'Smooth and nutty with low acidity. Great for cold brew and drip coffee.',
    price: 749,
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400',
    rating: 4.5,
    reviews: 67,
    category: 'Single Origin',
    roastProfile: 'medium',
    brewStyle: 'filter',
    flavorNotes: ['nutty', 'smooth', 'low-acid'],
  }
];

// Catalog Reducer
const catalogReducer = (state: CatalogState, action: CatalogAction): CatalogState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return { ...state, items: action.payload, loading: false, error: null };
    case 'LOAD_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item => 
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case 'CLEAR_ITEMS':
      return { ...state, items: [] };
    default:
      return state;
  }
};

// Initial State
const initialState: CatalogState = {
  items: [],
  loading: true,
  error: null,
};

// Catalog Provider Component
interface CatalogProviderProps {
  children: ReactNode;
}

export const CatalogProvider: React.FC<CatalogProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(catalogReducer, initialState);

  // Load catalog from storage on app start
  useEffect(() => {
    const loadCatalog = async () => {
      dispatch({ type: 'LOAD_START' });
      
      try {
        const catalogString = await AsyncStorage.getItem('bb-ci-catalog');
        if (catalogString) {
          const catalog = JSON.parse(catalogString);
          dispatch({ type: 'LOAD_SUCCESS', payload: catalog });
        } else {
          // If no catalog exists, use initial data
          await AsyncStorage.setItem('bb-ci-catalog', JSON.stringify(initialCatalogData));
          dispatch({ type: 'LOAD_SUCCESS', payload: initialCatalogData });
        }
      } catch (error) {
        console.error('Failed to load catalog:', error);
        dispatch({ type: 'LOAD_FAILURE', payload: 'Failed to load catalog' });
      }
    };

    loadCatalog();
  }, []);

  // Save to storage helper
  const saveCatalogToStorage = async (items: CatalogItem[]) => {
    try {
      await AsyncStorage.setItem('bb-ci-catalog', JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save catalog:', error);
    }
  };

  // Add new item
  const addItem = async (itemData: Omit<CatalogItem, 'id'>) => {
    const newItem: CatalogItem = {
      ...itemData,
      id: Date.now().toString(), // Simple ID generation
    };
    
    const updatedItems = [...state.items, newItem];
    dispatch({ type: 'ADD_ITEM', payload: newItem });
    await saveCatalogToStorage(updatedItems);
  };

  // Update existing item
  const updateItem = async (item: CatalogItem) => {
    const updatedItems = state.items.map(existingItem => 
      existingItem.id === item.id ? item : existingItem
    );
    dispatch({ type: 'UPDATE_ITEM', payload: item });
    await saveCatalogToStorage(updatedItems);
  };

  // Delete item
  const deleteItem = async (id: string) => {
    const updatedItems = state.items.filter(item => item.id !== id);
    dispatch({ type: 'DELETE_ITEM', payload: id });
    await saveCatalogToStorage(updatedItems);
  };

  // Clear all items
  const clearItems = async () => {
    dispatch({ type: 'CLEAR_ITEMS' });
    await AsyncStorage.removeItem('bb-ci-catalog');
  };

  // Get item by ID
  const getItemById = (id: string): CatalogItem | undefined => {
    return state.items.find(item => item.id === id);
  };

  // Get recommended item based on chatbot answers
  const getRecommendedItem = (
    brewStyle?: string, 
    roastProfile?: string, 
    flavorDirection?: string
  ): CatalogItem | undefined => {
    let candidates = state.items;

    // Filter by brew style if provided
    if (brewStyle) {
      candidates = candidates.filter(item => item.brewStyle === brewStyle);
    }

    // Filter by roast profile if provided
    if (roastProfile) {
      candidates = candidates.filter(item => item.roastProfile === roastProfile);
    }

    // Filter by flavor direction if provided (check if any flavor notes match)
    if (flavorDirection && candidates.length > 0) {
      const flavorMatches = candidates.filter(item => 
        item.flavorNotes?.some(note => 
          note.toLowerCase().includes(flavorDirection.toLowerCase())
        )
      );
      if (flavorMatches.length > 0) {
        candidates = flavorMatches;
      }
    }

    // Return the highest rated item from candidates
    if (candidates.length > 0) {
      return candidates.reduce((best, current) => 
        current.rating > best.rating ? current : best
      );
    }

    // Fallback to highest rated item overall
    return state.items.reduce((best, current) => 
      current.rating > best.rating ? current : best
    );
  };

  const contextValue: CatalogContextType = {
    ...state,
    addItem,
    updateItem,
    deleteItem,
    clearItems,
    getItemById,
    getRecommendedItem,
  };

  return (
    <CatalogContext.Provider value={contextValue}>
      {children}
    </CatalogContext.Provider>
  );
};

// Custom hook to use catalog context
export const useCatalog = (): CatalogContextType => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};