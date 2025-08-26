// Database Service for Onyx Coffee App
import { 
  DatabaseUser, 
  DatabasePost, 
  DatabaseMedia, 
  DatabaseComment, 
  DatabaseProduct,
  DatabaseNotification,
  DatabaseAddress,
  DatabaseOrder,
  DatabaseOrderItem,
  DatabaseResponse, 
  PaginatedResponse,
  CreatePostRequest,
  UpdateUserRequest,
  MediaUploadRequest
} from '../types/Database';

class DatabaseService {
  private apiUrl: string;
  private isInitialized: boolean = false;

  constructor() {
    // Use environment variable for API URL, fallback to localhost
    this.apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    // Initialize IndexedDB for web or AsyncStorage for mobile as fallback
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      await this.initializeIndexedDB();
    } else {
      // Fallback to localStorage for now
      this.initializeLocalStorage();
    }
    this.isInitialized = true;
  }

  private async initializeIndexedDB() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('OnyxCoffeeDB', 2);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Users table
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id' });
          usersStore.createIndex('email', 'email', { unique: true });
        }
        
        // Posts table
        if (!db.objectStoreNames.contains('posts')) {
          const postsStore = db.createObjectStore('posts', { keyPath: 'id' });
          postsStore.createIndex('userId', 'userId');
          postsStore.createIndex('createdAt', 'createdAt');
          postsStore.createIndex('privacy', 'privacy');
        }
        
        // Media table
        if (!db.objectStoreNames.contains('media')) {
          const mediaStore = db.createObjectStore('media', { keyPath: 'id' });
          mediaStore.createIndex('postId', 'postId');
          mediaStore.createIndex('userId', 'userId');
        }
        
        // Comments table
        if (!db.objectStoreNames.contains('comments')) {
          const commentsStore = db.createObjectStore('comments', { keyPath: 'id' });
          commentsStore.createIndex('postId', 'postId');
          commentsStore.createIndex('userId', 'userId');
        }
        
        // Products table
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
        
        // Notifications table
        if (!db.objectStoreNames.contains('notifications')) {
          const notificationsStore = db.createObjectStore('notifications', { keyPath: 'id' });
          notificationsStore.createIndex('userId', 'userId');
        }

        // Addresses table
        if (!db.objectStoreNames.contains('addresses')) {
          const addressesStore = db.createObjectStore('addresses', { keyPath: 'id' });
          addressesStore.createIndex('userId', 'userId');
        }

        // Orders table
        if (!db.objectStoreNames.contains('orders')) {
          const ordersStore = db.createObjectStore('orders', { keyPath: 'id' });
          ordersStore.createIndex('userId', 'userId');
          ordersStore.createIndex('orderDate', 'orderDate');
          ordersStore.createIndex('status', 'status');
        }
      };
    });
  }

  private initializeLocalStorage() {
    // Initialize localStorage with empty arrays if they don't exist
    const tables = ['users', 'posts', 'media', 'comments', 'products', 'notifications', 'addresses', 'orders'];
    tables.forEach(table => {
      if (!localStorage.getItem(`onyxdb_${table}`)) {
        localStorage.setItem(`onyxdb_${table}`, JSON.stringify([]));
      }
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OnyxCoffeeDB', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // User Management
  async createUser(userData: Partial<DatabaseUser>): Promise<DatabaseResponse<DatabaseUser>> {
    try {
      const user: DatabaseUser = {
        id: userData.id || this.generateId(),
        email: userData.email!,
        name: userData.name!,
        avatar: userData.avatar,
        bio: userData.bio,
        location: userData.location,
        joinedAt: new Date(),
        isActive: true,
        preferences: {
          privacy: 'public' as const,
          notifications: true,
          theme: 'light' as const,
          newsletter: true,
          smsUpdates: true,
          emailUpdates: true,
          pushNotifications: true,
          ...userData.preferences
        },
        stats: {
          postsCount: 0,
          followersCount: 0,
          followingCount: 0,
          loyaltyPoints: 0,
          totalOrders: 0,
          totalSpent: 0
        }
      };

      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const db = await this.getDB();
        const transaction = db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        await new Promise((resolve, reject) => {
          const request = store.add(user);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      } else {
        const users = JSON.parse(localStorage.getItem('onyxdb_users') || '[]');
        users.push(user);
        localStorage.setItem('onyxdb_users', JSON.stringify(users));
      }

      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getUserById(userId: string): Promise<DatabaseResponse<DatabaseUser>> {
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const db = await this.getDB();
        const transaction = db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        const user = await new Promise<DatabaseUser>((resolve, reject) => {
          const request = store.get(userId);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        return { success: true, data: user };
      } else {
        const users: DatabaseUser[] = JSON.parse(localStorage.getItem('onyxdb_users') || '[]');
        const user = users.find(u => u.id === userId);
        return { success: true, data: user };
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async updateUser(userId: string, updates: UpdateUserRequest): Promise<DatabaseResponse<DatabaseUser>> {
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const db = await this.getDB();
        const transaction = db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        
        const user = await new Promise<DatabaseUser>((resolve, reject) => {
          const request = store.get(userId);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });

        if (user) {
          const updatedUser: DatabaseUser = { ...user, ...updates };
          await new Promise((resolve, reject) => {
            const request = store.put(updatedUser);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
          return { success: true, data: updatedUser };
        }
        return { success: false, error: 'User not found' };
      } else {
        const users: DatabaseUser[] = JSON.parse(localStorage.getItem('onyxdb_users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...updates };
          localStorage.setItem('onyxdb_users', JSON.stringify(users));
          return { success: true, data: users[userIndex] };
        }
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Post Management
  async createPost(postData: CreatePostRequest, userId: string): Promise<DatabaseResponse<DatabasePost>> {
    try {
      const post: DatabasePost = {
        id: this.generateId(),
        userId,
        content: postData.content,
        type: postData.type,
        rating: postData.rating,
        productId: postData.productId,
        productName: postData.productId ? await this.getProductName(postData.productId) : undefined,
        media: [], // Will be populated after media upload
        privacy: postData.privacy,
        isLive: postData.isLive || false,
        tags: postData.tags || [],
        location: postData.location,
        feeling: postData.feeling,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          likes: 0,
          comments: 0,
          reshares: 0,
          views: 0
        },
        interactions: {
          likedBy: [],
          resharedBy: [],
          reportedBy: []
        },
        isReported: false,
        isActive: true
      };

      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const db = await this.getDB();
        const transaction = db.transaction(['posts'], 'readwrite');
        const store = transaction.objectStore('posts');
        await new Promise((resolve, reject) => {
          const request = store.add(post);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      } else {
        const posts = JSON.parse(localStorage.getItem('onyxdb_posts') || '[]');
        posts.unshift(post); // Add to beginning for chronological order
        localStorage.setItem('onyxdb_posts', JSON.stringify(posts));
      }

      // Update user post count
      await this.incrementUserPostCount(userId);

      return { success: true, data: post };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getPosts(options: {
    userId?: string;
    limit?: number;
    offset?: number;
    privacy?: 'public' | 'friends' | 'private';
  } = {}): Promise<PaginatedResponse<DatabasePost>> {
    try {
      const { limit = 20, offset = 0, privacy = 'public', userId } = options;

      let posts: DatabasePost[] = [];

      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const db = await this.getDB();
        const transaction = db.transaction(['posts'], 'readonly');
        const store = transaction.objectStore('posts');
        posts = await new Promise((resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      } else {
        posts = JSON.parse(localStorage.getItem('onyxdb_posts') || '[]');
      }

      // Filter posts
      let filteredPosts = posts.filter(post => {
        if (!post.isActive) return false;
        if (userId && post.userId !== userId) return false;
        if (privacy && post.privacy !== privacy && post.privacy !== 'public') return false;
        return true;
      });

      // Sort by creation date (newest first)
      filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Apply pagination
      const paginatedPosts = filteredPosts.slice(offset, offset + limit);

      return {
        success: true,
        data: paginatedPosts,
        pagination: {
          page: Math.floor(offset / limit) + 1,
          limit,
          total: filteredPosts.length,
          hasNext: offset + limit < filteredPosts.length,
          hasPrev: offset > 0
        }
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrev: false },
        error: (error as Error).message
      };
    }
  }

  async likePost(postId: string, userId: string): Promise<DatabaseResponse<boolean>> {
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const db = await this.getDB();
        const transaction = db.transaction(['posts'], 'readwrite');
        const store = transaction.objectStore('posts');
        
        const post = await new Promise<DatabasePost>((resolve, reject) => {
          const request = store.get(postId);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });

        if (post) {
          if (!post.interactions.likedBy.includes(userId)) {
            post.interactions.likedBy.push(userId);
            post.stats.likes++;
          }
          await new Promise((resolve, reject) => {
            const request = store.put(post);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        }
      } else {
        const posts: DatabasePost[] = JSON.parse(localStorage.getItem('onyxdb_posts') || '[]');
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
          if (!posts[postIndex].interactions.likedBy.includes(userId)) {
            posts[postIndex].interactions.likedBy.push(userId);
            posts[postIndex].stats.likes++;
          }
          localStorage.setItem('onyxdb_posts', JSON.stringify(posts));
        }
      }

      return { success: true, data: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async unlikePost(postId: string, userId: string): Promise<DatabaseResponse<boolean>> {
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const db = await this.getDB();
        const transaction = db.transaction(['posts'], 'readwrite');
        const store = transaction.objectStore('posts');
        
        const post = await new Promise<DatabasePost>((resolve, reject) => {
          const request = store.get(postId);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });

        if (post) {
          const likeIndex = post.interactions.likedBy.indexOf(userId);
          if (likeIndex !== -1) {
            post.interactions.likedBy.splice(likeIndex, 1);
            post.stats.likes = Math.max(0, post.stats.likes - 1);
          }
          await new Promise((resolve, reject) => {
            const request = store.put(post);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        }
      } else {
        const posts: DatabasePost[] = JSON.parse(localStorage.getItem('onyxdb_posts') || '[]');
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
          const likeIndex = posts[postIndex].interactions.likedBy.indexOf(userId);
          if (likeIndex !== -1) {
            posts[postIndex].interactions.likedBy.splice(likeIndex, 1);
            posts[postIndex].stats.likes = Math.max(0, posts[postIndex].stats.likes - 1);
          }
          localStorage.setItem('onyxdb_posts', JSON.stringify(posts));
        }
      }

      return { success: true, data: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Media Management
  async uploadMedia(mediaData: MediaUploadRequest, userId: string): Promise<DatabaseResponse<DatabaseMedia>> {
    try {
      // In a real app, this would upload to cloud storage like Cloudinary or AWS S3
      const fileUrl = URL.createObjectURL(mediaData.file);
      
      const media: DatabaseMedia = {
        id: this.generateId(),
        postId: mediaData.postId || '',
        userId,
        type: mediaData.file.type.startsWith('video/') ? 'video' : 'image',
        url: fileUrl,
        filename: mediaData.file.name,
        mimeType: mediaData.file.type,
        size: mediaData.file.size,
        alt: mediaData.alt,
        uploadedAt: new Date()
      };

      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const db = await this.getDB();
        const transaction = db.transaction(['media'], 'readwrite');
        const store = transaction.objectStore('media');
        await new Promise((resolve, reject) => {
          const request = store.add(media);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      } else {
        const mediaList = JSON.parse(localStorage.getItem('onyxdb_media') || '[]');
        mediaList.push(media);
        localStorage.setItem('onyxdb_media', JSON.stringify(mediaList));
      }

      return { success: true, data: media };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Helper methods
  private async getProductName(productId: string): Promise<string | undefined> {
    try {
      const products: DatabaseProduct[] = JSON.parse(localStorage.getItem('onyxdb_products') || '[]');
      const product = products.find(p => p.id === productId);
      return product?.name;
    } catch {
      return undefined;
    }
  }

  private async incrementUserPostCount(userId: string): Promise<void> {
    try {
      const userResponse = await this.getUserById(userId);
      if (userResponse.success && userResponse.data) {
        const user = userResponse.data;
        user.stats.postsCount++;
        await this.updateUser(userId, { stats: user.stats } as any);
      }
    } catch {
      // Ignore errors for post count increment
    }
  }

  // Initialize with sample data
  async seedDatabase(): Promise<void> {
    try {
      // Check if database already has data
      const postsResponse = await this.getPosts({ limit: 1 });
      if (postsResponse.data.length > 0) {
        console.log('Database already seeded');
        return;
      }

      // Create sample users
      const sampleUsers: Partial<DatabaseUser>[] = [
        {
          id: 'user_1',
          email: 'alex@example.com',
          name: 'Alex Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          bio: 'Coffee enthusiast and barista',
          location: 'San Francisco, CA'
        },
        {
          id: 'user_2',
          email: 'sarah@example.com',
          name: 'Sarah Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b586?w=150&h=150&fit=crop&crop=face',
          bio: 'Exploring the world of specialty coffee',
          location: 'Seattle, WA'
        }
      ];

      for (const userData of sampleUsers) {
        await this.createUser(userData);
      }

      console.log('Database seeded successfully');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }

  // Address Management
  async getUserAddresses(userId: string): Promise<DatabaseResponse<DatabaseAddress[]>> {
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const db = await this.getDB();
        const transaction = db.transaction(['addresses'], 'readonly');
        const store = transaction.objectStore('addresses');
        const index = store.index('userId');
        
        const addresses = await new Promise<DatabaseAddress[]>((resolve, reject) => {
          const request = index.getAll(userId);
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error);
        });

        return { success: true, data: addresses };
      } else {
        // Fallback to localStorage
        const addresses = JSON.parse(localStorage.getItem('onyxdb_addresses') || '[]')
          .filter((addr: any) => addr.userId === userId);
        return { success: true, data: addresses };
      }
    } catch (error) {
      console.error('Error getting user addresses:', error);
      return { success: false, error: 'Failed to get addresses' };
    }
  }

  async createAddress(addressData: Omit<DatabaseAddress, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseResponse<DatabaseAddress>> {
    try {
      const address: DatabaseAddress = {
        ...addressData,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const db = await this.getDB();
        const transaction = db.transaction(['addresses'], 'readwrite');
        const store = transaction.objectStore('addresses');
        
        await new Promise((resolve, reject) => {
          const request = store.add(address);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      } else {
        // Fallback to localStorage
        const addresses = JSON.parse(localStorage.getItem('onyxdb_addresses') || '[]');
        addresses.push(address);
        localStorage.setItem('onyxdb_addresses', JSON.stringify(addresses));
      }

      return { success: true, data: address };
    } catch (error) {
      console.error('Error creating address:', error);
      return { success: false, error: 'Failed to create address' };
    }
  }

  async updateAddress(addressId: string, updates: Partial<DatabaseAddress>): Promise<DatabaseResponse<DatabaseAddress>> {
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const db = await this.getDB();
        const transaction = db.transaction(['addresses'], 'readwrite');
        const store = transaction.objectStore('addresses');
        
        // Get existing address
        const existingAddress = await new Promise<DatabaseAddress>((resolve, reject) => {
          const request = store.get(addressId);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });

        if (!existingAddress) {
          return { success: false, error: 'Address not found' };
        }

        // Update address
        const updatedAddress = {
          ...existingAddress,
          ...updates,
          updatedAt: new Date(),
        };

        await new Promise((resolve, reject) => {
          const request = store.put(updatedAddress);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });

        return { success: true, data: updatedAddress };
      } else {
        // Fallback to localStorage
        const addresses = JSON.parse(localStorage.getItem('onyxdb_addresses') || '[]');
        const addressIndex = addresses.findIndex((addr: any) => addr.id === addressId);
        
        if (addressIndex === -1) {
          return { success: false, error: 'Address not found' };
        }

        addresses[addressIndex] = {
          ...addresses[addressIndex],
          ...updates,
          updatedAt: new Date(),
        };

        localStorage.setItem('onyxdb_addresses', JSON.stringify(addresses));
        return { success: true, data: addresses[addressIndex] };
      }
    } catch (error) {
      console.error('Error updating address:', error);
      return { success: false, error: 'Failed to update address' };
    }
  }

  async deleteAddress(addressId: string): Promise<DatabaseResponse<void>> {
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const db = await this.getDB();
        const transaction = db.transaction(['addresses'], 'readwrite');
        const store = transaction.objectStore('addresses');
        
        await new Promise((resolve, reject) => {
          const request = store.delete(addressId);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      } else {
        // Fallback to localStorage
        const addresses = JSON.parse(localStorage.getItem('onyxdb_addresses') || '[]');
        const filteredAddresses = addresses.filter((addr: any) => addr.id !== addressId);
        localStorage.setItem('onyxdb_addresses', JSON.stringify(filteredAddresses));
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting address:', error);
      return { success: false, error: 'Failed to delete address' };
    }
  }

  // Order Management
  async getUserOrders(userId: string): Promise<DatabaseResponse<DatabaseOrder[]>> {
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const db = await this.getDB();
        const transaction = db.transaction(['orders'], 'readonly');
        const store = transaction.objectStore('orders');
        const index = store.index('userId');
        
        const orders = await new Promise<DatabaseOrder[]>((resolve, reject) => {
          const request = index.getAll(userId);
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error);
        });

        // Sort orders by date, newest first
        orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        return { success: true, data: orders };
      } else {
        // Fallback to localStorage
        const orders = JSON.parse(localStorage.getItem('onyxdb_orders') || '[]')
          .filter((order: any) => order.userId === userId)
          .sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        return { success: true, data: orders };
      }
    } catch (error) {
      console.error('Error getting user orders:', error);
      return { success: false, error: 'Failed to get orders' };
    }
  }

  async createOrder(orderData: Omit<DatabaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseResponse<DatabaseOrder>> {
    try {
      const order: DatabaseOrder = {
        ...orderData,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const db = await this.getDB();
        const transaction = db.transaction(['orders'], 'readwrite');
        const store = transaction.objectStore('orders');
        
        await new Promise((resolve, reject) => {
          const request = store.add(order);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      } else {
        // Fallback to localStorage
        const orders = JSON.parse(localStorage.getItem('onyxdb_orders') || '[]');
        orders.push(order);
        localStorage.setItem('onyxdb_orders', JSON.stringify(orders));
      }

      return { success: true, data: order };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: 'Failed to create order' };
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;