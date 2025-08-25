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

// Sample initial catalog data with 9 coffee products
const initialCatalogData: CatalogItem[] = [
  {
    id: '1',
    name: 'Ethiopian Yirgacheffe',
    desc: 'Bright and floral with citrus notes. A delightful light roast that showcases the unique terroir of Ethiopia.',
    price: 899,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
    rating: 4.8,
    reviews: 203,
    category: 'Single Origin',
    roastProfile: 'light',
    brewStyle: 'filter',
    flavorNotes: ['floral', 'citrus', 'bright'],
  },
  {
    id: '2',
    name: 'Colombian Supremo',
    desc: 'Rich and balanced with chocolate and caramel notes. Perfect for espresso lovers who enjoy full-bodied flavor.',
    price: 849,
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400',
    rating: 4.7,
    reviews: 156,
    category: 'Single Origin',
    roastProfile: 'medium',
    brewStyle: 'espresso',
    flavorNotes: ['chocolate', 'caramel', 'nutty'],
  },
  {
    id: '3',
    name: 'Guatemala Antigua',
    desc: 'Smoky and spicy with a full body. Grown in volcanic soil, this coffee has a distinctive character.',
    price: 779,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    rating: 4.5,
    reviews: 89,
    category: 'Single Origin',
    roastProfile: 'dark',
    brewStyle: 'french-press',
    flavorNotes: ['smoky', 'spicy', 'earthy'],
  },
  {
    id: '4',
    name: 'Brazilian Santos',
    desc: 'Smooth and nutty with low acidity. An excellent everyday coffee with a creamy mouthfeel.',
    price: 699,
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400',
    rating: 4.4,
    reviews: 134,
    category: 'Single Origin',
    roastProfile: 'medium',
    brewStyle: 'filter',
    flavorNotes: ['nutty', 'smooth', 'creamy'],
  },
  {
    id: '5',
    name: 'Costa Rican Tarrazú',
    desc: 'Wine-like acidity with bright fruit notes. A complex coffee from the high-altitude regions of Costa Rica.',
    price: 929,
    image: 'https://images.unsplash.com/photo-1545665225-b23b99e4d45e?w=400',
    rating: 4.6,
    reviews: 98,
    category: 'Single Origin',
    roastProfile: 'light',
    brewStyle: 'filter',
    flavorNotes: ['fruity', 'wine', 'bright'],
  },
  {
    id: '6',
    name: 'House Blend Espresso',
    desc: 'Our signature blend with rich crema and balanced flavor. Perfect for milk-based drinks and straight shots.',
    price: 759,
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400',
    rating: 4.5,
    reviews: 267,
    category: 'Blend',
    roastProfile: 'dark',
    brewStyle: 'espresso',
    flavorNotes: ['balanced', 'rich', 'bold'],
  },
  {
    id: '7',
    name: 'Jamaican Blue Mountain',
    desc: 'One of the world\'s most prized coffees with mild flavor and no bitterness. Extremely smooth and refined.',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    rating: 4.9,
    reviews: 45,
    category: 'Single Origin',
    roastProfile: 'medium',
    brewStyle: 'filter',
    flavorNotes: ['mild', 'smooth', 'refined'],
  },
  {
    id: '8',
    name: 'Kenya AA',
    desc: 'Wine-like acidity with black currant notes. A distinctive African coffee with remarkable complexity.',
    price: 879,
    image: 'https://images.unsplash.com/photo-1456958499877-d31c2e73e0a2?w=400',
    rating: 4.7,
    reviews: 112,
    category: 'Single Origin',
    roastProfile: 'light',
    brewStyle: 'filter',
    flavorNotes: ['wine', 'blackcurrant', 'complex'],
  },
  {
    id: '9',
    name: 'Sumatra Mandheling',
    desc: 'Full-bodied with earthy, herbal notes. A unique Indonesian coffee with low acidity and syrupy body.',
    price: 819,
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
    rating: 4.3,
    reviews: 87,
    category: 'Single Origin',
    roastProfile: 'dark',
    brewStyle: 'french-press',
    flavorNotes: ['earthy', 'herbal', 'syrupy'],
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
      console.log('Saving catalog to storage:', items.length, 'items');
      await AsyncStorage.setItem('bb-ci-catalog', JSON.stringify(items));
      console.log('Catalog saved to storage successfully');
    } catch (error) {
      console.error('Failed to save catalog:', error);
      throw error;
    }
  };

  // Add new item
  const addItem = async (itemData: Omit<CatalogItem, 'id'>) => {
    console.log('CatalogContext addItem called with:', itemData);
    try {
      const newItem: CatalogItem = {
        ...itemData,
        id: Date.now().toString(), // Simple ID generation
      };
      
      console.log('Created new item with ID:', newItem);
      const updatedItems = [...state.items, newItem];
      console.log('Updated items array:', updatedItems);
      
      dispatch({ type: 'ADD_ITEM', payload: newItem });
      await saveCatalogToStorage(updatedItems);
      console.log('Item added successfully to context and storage');
    } catch (error) {
      console.error('Error in CatalogContext addItem:', error);
      throw error;
    }
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