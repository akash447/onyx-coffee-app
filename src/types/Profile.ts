export interface Address {
  id: string;
  type: 'home' | 'office' | 'other';
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  phoneNumber?: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: Address;
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderDate: Date;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  trackingId?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  total: number;
  variant?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  addresses: Address[];
  preferences: {
    newsletter: boolean;
    smsUpdates: boolean;
    emailUpdates: boolean;
    pushNotifications: boolean;
  };
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  joinedDate: Date;
  lastActive: Date;
}

export interface CreateAddressRequest {
  type: 'home' | 'office' | 'other';
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
  phoneNumber?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  preferences?: {
    newsletter?: boolean;
    smsUpdates?: boolean;
    emailUpdates?: boolean;
    pushNotifications?: boolean;
  };
}