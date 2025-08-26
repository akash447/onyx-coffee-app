// Database Schema Types for Onyx Coffee App

export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinedAt: Date;
  isActive: boolean;
  // Profile specific fields
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  addresses: DatabaseAddress[];
  preferences: {
    privacy: 'public' | 'friends' | 'private';
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    newsletter: boolean;
    smsUpdates: boolean;
    emailUpdates: boolean;
    pushNotifications: boolean;
  };
  stats: {
    postsCount: number;
    followersCount: number;
    followingCount: number;
    loyaltyPoints: number;
    totalOrders: number;
    totalSpent: number;
  };
  lastActive: Date;
}

export interface DatabaseAddress {
  id: string;
  userId: string;
  type: 'home' | 'office' | 'other';
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseOrder {
  id: string;
  userId: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  items: DatabaseOrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: DatabaseAddress;
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderDate: Date;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  trackingId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  total: number;
  variant?: string;
}

export interface DatabasePost {
  id: string;
  userId: string;
  content: string;
  type: 'story' | 'review';
  rating?: number;
  productId?: string;
  productName?: string;
  media: DatabaseMedia[];
  privacy: 'public' | 'friends' | 'private';
  isLive: boolean;
  tags: string[];
  location?: string;
  feeling?: string;
  createdAt: Date;
  updatedAt: Date;
  stats: {
    likes: number;
    comments: number;
    reshares: number;
    views: number;
  };
  interactions: {
    likedBy: string[];
    resharedBy: string[];
    reportedBy: string[];
  };
  isReported: boolean;
  isActive: boolean;
}

export interface DatabaseMedia {
  id: string;
  postId: string;
  userId: string;
  type: 'image' | 'video';
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  thumbnail?: string;
  alt?: string;
  uploadedAt: Date;
  cloudinaryPublicId?: string; // For Cloudinary integration
}

export interface DatabaseComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string; // For nested replies
  createdAt: Date;
  updatedAt: Date;
  stats: {
    likes: number;
  };
  interactions: {
    likedBy: string[];
  };
  isActive: boolean;
}

export interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  category: 'coffee' | 'equipment' | 'accessory';
  price: number;
  currency: string;
  images: string[];
  specifications: Record<string, any>;
  averageRating: number;
  reviewsCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseNotification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'share';
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export interface DatabaseAnalytics {
  id: string;
  userId?: string; // null for anonymous analytics
  postId?: string;
  action: 'view' | 'like' | 'comment' | 'share' | 'click';
  metadata: Record<string, any>;
  timestamp: Date;
  sessionId: string;
  userAgent?: string;
  ipAddress?: string;
}

// API Response Types
export interface DatabaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
}

// Request Types
export interface CreatePostRequest {
  content: string;
  type: 'story' | 'review';
  rating?: number;
  productId?: string;
  privacy: 'public' | 'friends' | 'private';
  isLive?: boolean;
  tags?: string[];
  location?: string;
  feeling?: string;
  media?: File[];
}

export interface UpdateUserRequest {
  name?: string;
  bio?: string;
  location?: string;
  preferences?: Partial<DatabaseUser['preferences']>;
}

export interface MediaUploadRequest {
  file: File;
  postId?: string;
  alt?: string;
}