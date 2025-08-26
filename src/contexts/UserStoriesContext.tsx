import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserStory, CreateUserStoryRequest, UserStoryFilters } from '../types/UserStory';
import { useAuth } from './AuthContext';
import { useCatalog } from './CatalogContext';

interface UserStoriesContextType {
  stories: UserStory[];
  loading: boolean;
  createStory: (storyData: CreateUserStoryRequest) => Promise<void>;
  updateStory: (storyId: string, updates: Partial<UserStory>) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  likeStory: (storyId: string) => Promise<void>;
  unlikeStory: (storyId: string) => Promise<void>;
  getStoriesByProduct: (productId: string) => UserStory[];
  getStoriesByUser: (userId: string) => UserStory[];
  getLiveStories: () => UserStory[];
  getFilteredStories: (filters: UserStoryFilters) => UserStory[];
  getAverageRatingByProduct: (productId: string) => number;
  refreshStories: () => Promise<void>;
  // Community statistics
  getCommunityStats: () => {
    totalMembers: number;
    totalStories: number;
    totalReviews: number;
  };
}

const UserStoriesContext = createContext<UserStoriesContextType | undefined>(undefined);

export const useUserStories = () => {
  const context = useContext(UserStoriesContext);
  if (!context) {
    throw new Error('useUserStories must be used within a UserStoriesProvider');
  }
  return context;
};

interface UserStoriesProviderProps {
  children: ReactNode;
}

export const UserStoriesProvider: React.FC<UserStoriesProviderProps> = ({ children }) => {
  const [stories, setStories] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { items: products } = useCatalog();

  // Initialize with sample data
  useEffect(() => {
    initializeSampleData();
  }, []);

  const initializeSampleData = () => {
    const sampleStories: UserStory[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'Sarah Chen',
        userAvatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=e74c3c&color=fff&size=100',
        content: 'Just tried the Ethiopian Yirgacheffe and it\'s absolutely amazing! The floral notes are incredible and the brightness is perfect for my morning routine. ☕✨',
        rating: 5,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        type: 'review',
        productId: '1',
        productName: 'Ethiopian Yirgacheffe',
        likes: 24,
        likedBy: ['user2', 'user3', 'user4'],
        isLive: false,
        tags: ['#coffee', '#morning', '#floral'],
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Mike Rodriguez',
        content: '🔴 LIVE: Setting up my new pour-over station! Any tips for getting the perfect extraction? Currently using a 1:16 ratio with 200°F water.',
        rating: 0,
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        type: 'story',
        likes: 12,
        likedBy: ['user1', 'user3'],
        isLive: true,
        tags: ['#live', '#pourover', '#brewing'],
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Emma Wilson',
        content: 'The Colombia Huila is my new favorite! Perfect balance of sweetness and acidity. Makes the best cold brew too. Highly recommend for anyone looking for versatility.',
        rating: 5,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        type: 'review',
        productId: '2',
        productName: 'Colombia Huila',
        likes: 18,
        likedBy: ['user1', 'user2'],
        isLive: false,
        tags: ['#colombia', '#coldbrew', '#versatile'],
      },
      {
        id: '4',
        userId: 'user4',
        userName: 'David Kumar',
        content: 'Coffee cupping session today! Tried 5 different single origins. The Brazilian Santos had this amazing chocolate undertone that paired perfectly with dark chocolate. 🍫',
        rating: 0,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        type: 'story',
        likes: 31,
        likedBy: ['user1', 'user2', 'user3'],
        isLive: false,
        tags: ['#cupping', '#chocolate', '#brazilian'],
      },
      {
        id: '5',
        userId: 'user5',
        userName: 'Lisa Thompson',
        content: '🔴 LIVE: Morning brew routine with the French Press! Using the Guatemala Antigua - the body is incredible and the smoky notes are coming through beautifully.',
        rating: 4,
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        type: 'review',
        productId: '3',
        productName: 'Guatemala Antigua',
        likes: 15,
        likedBy: ['user2', 'user4'],
        isLive: true,
        tags: ['#live', '#frenchpress', '#guatemala'],
      },
      {
        id: '6',
        userId: 'user6',
        userName: 'Alex Johnson',
        content: 'Discovered cold brew last month and I\'m hooked! The smooth, less acidic taste is perfect for hot summer days. Using the Brazilian Santos beans from here.',
        rating: 0,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        type: 'story',
        likes: 8,
        likedBy: ['user1', 'user5'],
        isLive: false,
        tags: ['#coldbrew', '#summer', '#brazilian'],
      },
      {
        id: '7',
        userId: 'user7',
        userName: 'Maria Santos',
        content: 'As a new coffee drinker, this Guatemala Antigua was perfect for me. Not too strong, very smooth, and has a lovely smoky finish that isn\'t overwhelming.',
        rating: 4,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        type: 'review',
        productId: '3',
        productName: 'Guatemala Antigua',
        likes: 12,
        likedBy: ['user1', 'user3', 'user4'],
        isLive: false,
        tags: ['#beginner', '#smooth', '#guatemala'],
      },
      {
        id: '8',
        userId: 'user8',
        userName: 'James Wright',
        content: '🔴 LIVE: Morning espresso routine! Just pulled a perfect shot with the Colombian beans. The crema is gorgeous and the flavor is incredibly balanced.',
        rating: 5,
        timestamp: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
        type: 'review',
        productId: '2',
        productName: 'Colombia Huila',
        likes: 6,
        likedBy: ['user2', 'user5'],
        isLive: true,
        tags: ['#live', '#espresso', '#colombia'],
      },
    ];

    setStories(sampleStories);
  };

  const createStory = async (storyData: CreateUserStoryRequest): Promise<void> => {
    if (!user) {
      throw new Error('User must be logged in to create stories');
    }

    setLoading(true);
    try {
      // Find product name if productId provided
      let productName = '';
      if (storyData.productId) {
        const product = products.find(p => p.id === storyData.productId);
        productName = product?.name || '';
      }

      const newStory: UserStory = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: storyData.content,
        rating: storyData.rating || 0,
        timestamp: new Date(),
        type: storyData.type,
        productId: storyData.productId,
        productName: productName,
        images: storyData.images || [],
        likes: 0,
        likedBy: [],
        isLive: storyData.isLive || false,
        tags: storyData.tags || [],
      };

      setStories(prev => [newStory, ...prev]);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateStory = async (storyId: string, updates: Partial<UserStory>): Promise<void> => {
    setLoading(true);
    try {
      setStories(prev => prev.map(story => 
        story.id === storyId ? { ...story, ...updates } : story
      ));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteStory = async (storyId: string): Promise<void> => {
    if (!user) return;

    setLoading(true);
    try {
      setStories(prev => prev.filter(story => story.id !== storyId));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const likeStory = async (storyId: string): Promise<void> => {
    if (!user) return;

    try {
      setStories(prev => prev.map(story => {
        if (story.id === storyId && !story.likedBy.includes(user.id)) {
          return {
            ...story,
            likes: story.likes + 1,
            likedBy: [...story.likedBy, user.id],
          };
        }
        return story;
      }));
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const unlikeStory = async (storyId: string): Promise<void> => {
    if (!user) return;

    try {
      setStories(prev => prev.map(story => {
        if (story.id === storyId && story.likedBy.includes(user.id)) {
          return {
            ...story,
            likes: story.likes - 1,
            likedBy: story.likedBy.filter(id => id !== user.id),
          };
        }
        return story;
      }));
    } catch (error) {
      console.error('Error unliking story:', error);
    }
  };

  const getStoriesByProduct = (productId: string): UserStory[] => {
    return stories.filter(story => story.productId === productId);
  };

  const getStoriesByUser = (userId: string): UserStory[] => {
    return stories.filter(story => story.userId === userId);
  };

  const getLiveStories = (): UserStory[] => {
    return stories.filter(story => story.isLive).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const getFilteredStories = (filters: UserStoryFilters): UserStory[] => {
    let filtered = [...stories];

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(story => story.type === filters.type);
    }

    if (filters.rating) {
      filtered = filtered.filter(story => story.rating >= filters.rating!);
    }

    if (filters.productId) {
      filtered = filtered.filter(story => story.productId === filters.productId);
    }

    if (filters.isLive !== undefined) {
      filtered = filtered.filter(story => story.isLive === filters.isLive);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(story => 
        story.tags?.some(tag => filters.tags!.includes(tag))
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'likes':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
    }

    return filtered;
  };

  const getAverageRatingByProduct = (productId: string): number => {
    const productReviews = stories.filter(
      story => story.productId === productId && story.type === 'review' && story.rating > 0
    );
    
    if (productReviews.length === 0) return 0;
    
    const totalRating = productReviews.reduce((sum, story) => sum + story.rating, 0);
    return Math.round((totalRating / productReviews.length) * 10) / 10;
  };

  const refreshStories = async (): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API call to refresh stories
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, this would fetch fresh data from the server
    } catch (error) {
      console.error('Error refreshing stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCommunityStats = () => {
    const uniqueUsers = new Set(stories.map(story => story.userId));
    const totalStories = stories.filter(story => story.type === 'story').length;
    const totalReviews = stories.filter(story => story.type === 'review').length;
    
    return {
      totalMembers: uniqueUsers.size,
      totalStories,
      totalReviews,
    };
  };

  const value: UserStoriesContextType = {
    stories,
    loading,
    createStory,
    updateStory,
    deleteStory,
    likeStory,
    unlikeStory,
    getStoriesByProduct,
    getStoriesByUser,
    getLiveStories,
    getFilteredStories,
    getAverageRatingByProduct,
    refreshStories,
    getCommunityStats,
  };

  return (
    <UserStoriesContext.Provider value={value}>
      {children}
    </UserStoriesContext.Provider>
  );
};