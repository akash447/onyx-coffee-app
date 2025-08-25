// Product and Catalog Types
export interface CatalogItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  category?: string;
  roastProfile?: 'light' | 'medium' | 'dark';
  brewStyle?: 'espresso' | 'filter' | 'french-press';
  flavorNotes?: string[];
}

// Navigation and Routing Types
export type RouteType = 
  | { kind: 'section'; section: 'product' | 'community' | 'about' | 'admin' | 'cart' }
  | { kind: 'communityPage'; page: 'brew' | 'stories' | 'tips' }
  | { kind: 'sku'; skuId: string };

export type ProductTab = 'personal' | 'explore';

// Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Chatbot Types
export interface ChatbotQuestion {
  id: string;
  question: string;
  options: string[];
  type: 'brew-style' | 'roast-profile' | 'flavor-direction';
}

export interface ChatbotResponse {
  brewStyle?: string;
  roastProfile?: string;
  flavorDirection?: string;
}

// Shopping Cart Types
export interface CartItem {
  product: CatalogItem;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Order and Payment Types
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  shippingAddress: Address;
  paymentMethod: string;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

// Community Types
export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: User;
  category: 'brew' | 'stories' | 'tips';
  createdAt: Date;
  likes: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
}

// Device/Platform Types
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type PlatformType = 'ios' | 'android' | 'web';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Layout and UI Types
export interface LayoutDimensions {
  width: number;
  height: number;
  isDesktop: boolean;
  isMobile: boolean;
}