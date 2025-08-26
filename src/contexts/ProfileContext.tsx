import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, Address, Order, CreateAddressRequest, UpdateProfileRequest } from '../types/Profile';
import { DatabaseUser, DatabaseAddress, DatabaseOrder } from '../types/Database';
import { useAuth } from './AuthContext';
import databaseService from '../services/DatabaseService';

interface ProfileContextType {
  profile: UserProfile | null;
  addresses: Address[];
  orders: Order[];
  loading: boolean;
  updateProfile: (updates: UpdateProfileRequest) => Promise<void>;
  addAddress: (address: CreateAddressRequest) => Promise<void>;
  updateAddress: (addressId: string, updates: Partial<Address>) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  getOrderHistory: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

// Helper functions to convert between Profile and Database types
const convertDatabaseUserToProfile = (dbUser: DatabaseUser): UserProfile => {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone,
    avatar: dbUser.avatar,
    dateOfBirth: dbUser.dateOfBirth,
    gender: dbUser.gender,
    addresses: dbUser.addresses.map(convertDatabaseAddressToAddress),
    preferences: {
      newsletter: dbUser.preferences.newsletter,
      smsUpdates: dbUser.preferences.smsUpdates,
      emailUpdates: dbUser.preferences.emailUpdates,
      pushNotifications: dbUser.preferences.pushNotifications,
    },
    loyaltyPoints: dbUser.stats.loyaltyPoints,
    totalOrders: dbUser.stats.totalOrders,
    totalSpent: dbUser.stats.totalSpent,
    joinedDate: dbUser.joinedAt,
    lastActive: dbUser.lastActive,
  };
};

const convertDatabaseAddressToAddress = (dbAddress: DatabaseAddress): Address => {
  return {
    id: dbAddress.id,
    type: dbAddress.type,
    name: dbAddress.name,
    addressLine1: dbAddress.addressLine1,
    addressLine2: dbAddress.addressLine2,
    city: dbAddress.city,
    state: dbAddress.state,
    pincode: dbAddress.pincode,
    isDefault: dbAddress.isDefault,
    phoneNumber: dbAddress.phoneNumber,
  };
};

const convertDatabaseOrderToOrder = (dbOrder: DatabaseOrder): Order => {
  return {
    id: dbOrder.id,
    userId: dbOrder.userId,
    orderNumber: dbOrder.orderNumber,
    status: dbOrder.status,
    items: dbOrder.items.map(item => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      variant: item.variant,
    })),
    subtotal: dbOrder.subtotal,
    tax: dbOrder.tax,
    deliveryFee: dbOrder.deliveryFee,
    total: dbOrder.total,
    deliveryAddress: convertDatabaseAddressToAddress(dbOrder.deliveryAddress),
    paymentMethod: dbOrder.paymentMethod,
    paymentStatus: dbOrder.paymentStatus,
    orderDate: dbOrder.orderDate,
    estimatedDelivery: dbOrder.estimatedDelivery,
    actualDelivery: dbOrder.actualDelivery,
    trackingId: dbOrder.trackingId,
  };
};

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Load profile data when user changes
  useEffect(() => {
    console.log('ProfileContext: User changed', { isAuthenticated, user: user?.name });
    if (isAuthenticated && user) {
      refreshProfile();
    } else {
      console.log('ProfileContext: Clearing profile data');
      setProfile(null);
      setAddresses([]);
      setOrders([]);
    }
  }, [user, isAuthenticated]);

  const refreshProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Refreshing profile for user:', user.id);
      
      // Try to get existing user from database
      const userResponse = await databaseService.getUserById(user.id);
      let dbUser: DatabaseUser;
      
      if (userResponse.success && userResponse.data) {
        // User exists in database, update last active
        dbUser = userResponse.data;
        dbUser.lastActive = new Date();
        
        // Update user in database
        await databaseService.updateUser(user.id, {
          lastActive: dbUser.lastActive,
        } as any);
        
        console.log('ProfileContext: Updated existing user in database');
      } else {
        // User doesn't exist in database - this should normally be handled by AuthContext
        // But let's add a fallback just in case
        console.log('ProfileContext: User not found in database, waiting for AuthContext to create...');
        
        // Wait a bit for AuthContext to create the user
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try again
        const retryResponse = await databaseService.getUserById(user.id);
        if (retryResponse.success && retryResponse.data) {
          dbUser = retryResponse.data;
          console.log('ProfileContext: Found user after retry');
        } else {
          // Still not found, create minimal profile data from auth user
          console.log('ProfileContext: Creating minimal profile from auth user');
          dbUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            bio: `Coffee enthusiast and member of the Onyx community`,
            location: undefined,
            isActive: true,
            phone: (user as any).phone,
            dateOfBirth: undefined,
            gender: undefined,
            addresses: [],
            preferences: {
              privacy: 'public' as const,
              notifications: true,
              theme: 'light' as const,
              newsletter: true,
              smsUpdates: true,
              emailUpdates: true,
              pushNotifications: true,
            },
            stats: {
              postsCount: 0,
              followersCount: 0,
              followingCount: 0,
              loyaltyPoints: 0,
              totalOrders: 0,
              totalSpent: 0,
            },
            joinedAt: new Date(),
            lastActive: new Date(),
          };
        }
      }

      // Convert to UserProfile and set state
      console.log('Converting database user to profile:', dbUser);
      const profileData = convertDatabaseUserToProfile(dbUser);
      console.log('Converted profile data:', profileData);
      setProfile(profileData);
      
      // Load addresses separately
      const addressesResponse = await databaseService.getUserAddresses(user.id);
      if (addressesResponse.success && addressesResponse.data) {
        console.log('Loaded addresses:', addressesResponse.data);
        const userAddresses = addressesResponse.data.map(convertDatabaseAddressToAddress);
        setAddresses(userAddresses);
        
        // Update profile with current addresses
        profileData.addresses = userAddresses;
        setProfile(profileData);
      }
      
      // Load orders
      await getOrderHistory();
      
      console.log('Profile refresh completed successfully');
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: UpdateProfileRequest) => {
    if (!profile || !user) throw new Error('No profile available');

    try {
      console.log('Updating profile with:', updates);
      
      // Prepare user updates for database
      const userUpdates: any = {
        lastActive: new Date(),
      };
      
      if (updates.name) userUpdates.name = updates.name;
      if (updates.phone) userUpdates.phone = updates.phone;
      if (updates.dateOfBirth !== undefined) userUpdates.dateOfBirth = updates.dateOfBirth;
      if (updates.gender) userUpdates.gender = updates.gender;
      if (updates.preferences) {
        userUpdates.preferences = updates.preferences;
      }
      
      // Update user in database
      const updateResponse = await databaseService.updateUser(user.id, userUpdates);
      if (!updateResponse.success) {
        throw new Error('Failed to update user in database');
      }
      
      // Update local profile state
      const updatedProfile = {
        ...profile,
        ...updates,
        preferences: {
          ...profile.preferences,
          ...(updates.preferences || {}),
        },
        lastActive: new Date(),
      };

      setProfile(updatedProfile);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const addAddress = async (addressData: CreateAddressRequest) => {
    if (!profile || !user) throw new Error('No profile available');

    try {
      console.log('Adding address:', addressData);
      
      // If this is set as default, make all other addresses non-default first
      if (addressData.isDefault || addresses.length === 0) {
        // Update existing addresses to not be default
        for (const address of addresses) {
          if (address.isDefault) {
            await databaseService.updateAddress(address.id, { isDefault: false });
          }
        }
      }

      // Create address in database
      const dbAddressData = {
        userId: user.id,
        type: addressData.type,
        name: addressData.name,
        addressLine1: addressData.addressLine1,
        addressLine2: addressData.addressLine2,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
        isDefault: addressData.isDefault || addresses.length === 0,
        phoneNumber: addressData.phoneNumber,
      };

      const createResponse = await databaseService.createAddress(dbAddressData);
      if (!createResponse.success || !createResponse.data) {
        throw new Error('Failed to create address in database');
      }

      // Convert to Address type and add to state
      const newAddress = convertDatabaseAddressToAddress(createResponse.data);
      const updatedAddresses = [...addresses, newAddress];
      
      // Update addresses to make non-default if new one is default
      if (newAddress.isDefault) {
        updatedAddresses.forEach(addr => {
          if (addr.id !== newAddress.id) {
            addr.isDefault = false;
          }
        });
      }

      setAddresses(updatedAddresses);
      
      // Update profile with new addresses
      const updatedProfile = {
        ...profile,
        addresses: updatedAddresses,
        lastActive: new Date(),
      };
      setProfile(updatedProfile);
      
      console.log('Address added successfully');
    } catch (error) {
      console.error('Failed to add address:', error);
      throw error;
    }
  };

  const updateAddress = async (addressId: string, updates: Partial<Address>) => {
    if (!profile || !user) throw new Error('No profile available');

    try {
      console.log('Updating address:', addressId, updates);
      
      // If setting as default, make all other addresses non-default first
      if (updates.isDefault) {
        for (const address of addresses) {
          if (address.id !== addressId && address.isDefault) {
            await databaseService.updateAddress(address.id, { isDefault: false });
          }
        }
      }

      // Update address in database
      const updateResponse = await databaseService.updateAddress(addressId, updates);
      if (!updateResponse.success || !updateResponse.data) {
        throw new Error('Failed to update address in database');
      }

      // Update local state
      const updatedAddress = convertDatabaseAddressToAddress(updateResponse.data);
      const updatedAddresses = addresses.map(addr => 
        addr.id === addressId ? updatedAddress : addr
      );

      // If this address was set as default, ensure others are not default
      if (updatedAddress.isDefault) {
        updatedAddresses.forEach(addr => {
          if (addr.id !== addressId) {
            addr.isDefault = false;
          }
        });
      }

      setAddresses(updatedAddresses);
      
      // Update profile
      const updatedProfile = {
        ...profile,
        addresses: updatedAddresses,
        lastActive: new Date(),
      };
      setProfile(updatedProfile);
      
      console.log('Address updated successfully');
    } catch (error) {
      console.error('Failed to update address:', error);
      throw error;
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!profile || !user) throw new Error('No profile available');

    try {
      console.log('Deleting address:', addressId);
      
      const addressToDelete = addresses.find(addr => addr.id === addressId);
      
      // Delete from database
      const deleteResponse = await databaseService.deleteAddress(addressId);
      if (!deleteResponse.success) {
        throw new Error('Failed to delete address from database');
      }

      // Update local state
      let updatedAddresses = addresses.filter(addr => addr.id !== addressId);

      // If we deleted the default address, make the first remaining address default
      if (addressToDelete?.isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
        // Update the new default address in database
        await databaseService.updateAddress(updatedAddresses[0].id, { isDefault: true });
      }

      setAddresses(updatedAddresses);
      
      // Update profile
      const updatedProfile = {
        ...profile,
        addresses: updatedAddresses,
        lastActive: new Date(),
      };
      setProfile(updatedProfile);
      
      console.log('Address deleted successfully');
    } catch (error) {
      console.error('Failed to delete address:', error);
      throw error;
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    if (!profile || !user) throw new Error('No profile available');

    try {
      console.log('Setting default address:', addressId);
      
      // Update all addresses: make the selected one default, others non-default
      for (const address of addresses) {
        const shouldBeDefault = address.id === addressId;
        if (address.isDefault !== shouldBeDefault) {
          await databaseService.updateAddress(address.id, { isDefault: shouldBeDefault });
        }
      }

      // Update local state
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId,
      }));

      setAddresses(updatedAddresses);
      
      // Update profile
      const updatedProfile = {
        ...profile,
        addresses: updatedAddresses,
        lastActive: new Date(),
      };
      setProfile(updatedProfile);
      
      console.log('Default address updated successfully');
    } catch (error) {
      console.error('Failed to set default address:', error);
      throw error;
    }
  };

  const getOrderHistory = async () => {
    if (!user) return;

    try {
      console.log('Loading order history for user:', user.id);
      
      // Get orders from database
      const ordersResponse = await databaseService.getUserOrders(user.id);
      
      if (ordersResponse.success && ordersResponse.data) {
        const userOrders = ordersResponse.data.map(convertDatabaseOrderToOrder);
        setOrders(userOrders);
        console.log(`Loaded ${userOrders.length} orders from database`);
      } else {
        // No orders found, create some sample orders for demonstration
        console.log('No orders found, creating sample orders');
        
        const defaultAddress: DatabaseAddress = {
          id: `addr_${Date.now()}`,
          userId: user.id,
          type: 'home',
          name: 'Home',
          addressLine1: '123 Coffee Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const sampleOrders: DatabaseOrder[] = [
          {
            id: `order_${Date.now()}_1`,
            userId: user.id,
            orderNumber: `ONX${Date.now().toString().slice(-6)}`,
            status: 'delivered',
            items: [
              {
                id: 'item_1',
                orderId: `order_${Date.now()}_1`,
                productId: 'colombian-blend',
                productName: 'Colombian Blend',
                productImage: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200',
                quantity: 2,
                price: 850,
                total: 1700,
                variant: '250g',
              },
            ],
            subtotal: 1700,
            tax: 153,
            deliveryFee: 50,
            total: 1903,
            deliveryAddress: defaultAddress,
            paymentMethod: 'online',
            paymentStatus: 'paid',
            orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            estimatedDelivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            actualDelivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            trackingId: 'TRK123456789',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          {
            id: `order_${Date.now()}_2`,
            userId: user.id,
            orderNumber: `ONX${(Date.now() - 1000).toString().slice(-6)}`,
            status: 'preparing',
            items: [
              {
                id: 'item_2',
                orderId: `order_${Date.now()}_2`,
                productId: 'espresso-roast',
                productName: 'Espresso Roast',
                productImage: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=200',
                quantity: 1,
                price: 950,
                total: 950,
                variant: '500g',
              },
            ],
            subtotal: 950,
            tax: 86,
            deliveryFee: 0,
            total: 1036,
            deliveryAddress: defaultAddress,
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        ];
        
        // Create sample orders in database
        for (const orderData of sampleOrders) {
          await databaseService.createOrder(orderData);
        }
        
        // Convert and set orders
        const orders = sampleOrders.map(convertDatabaseOrderToOrder);
        setOrders(orders);
        console.log('Created sample orders in database');
      }
    } catch (error) {
      console.error('Failed to get order history:', error);
    }
  };


  const value: ProfileContextType = {
    profile,
    addresses,
    orders,
    loading,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getOrderHistory,
    refreshProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};