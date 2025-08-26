import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserStory, CreateUserStoryRequest, UserStoryFilters, Comment, ReportReason } from '../types/UserStory';
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
  addComment: (storyId: string, content: string) => Promise<void>;
  likeComment: (storyId: string, commentId: string) => Promise<void>;
  deleteComment: (storyId: string, commentId: string) => Promise<void>;
  reshareStory: (storyId: string) => Promise<void>;
  unreshareStory: (storyId: string) => Promise<void>;
  reportStory: (storyId: string, reason: string) => Promise<void>;
  getStoriesByProduct: (productId: string) => UserStory[];
  getStoriesByUser: (userId: string) => UserStory[];
  getLiveStories: () => UserStory[];
  getFilteredStories: (filters: UserStoryFilters) => UserStory[];
  getAverageRatingByProduct: (productId: string) => number;
  refreshStories: () => Promise<void>;
  saveStories: () => Promise<void>;
  loadStories: () => Promise<void>;
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

const STORIES_STORAGE_KEY = 'onyx_user_stories';

export const UserStoriesProvider: React.FC<UserStoriesProviderProps> = ({ children }) => {
  const [stories, setStories] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { items: products } = useCatalog();

  // Load stories on component mount
  useEffect(() => {
    loadStories();
  }, []);

  // Emergency data reset function (for development)
  const resetData = () => {
    try {
      localStorage.removeItem(STORIES_STORAGE_KEY);
      const sampleStories = getSampleStories();
      setStories(sampleStories);
      localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(sampleStories));
      console.log('🔄 Data reset successfully');
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  // Expose reset function globally in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).resetStoriesData = resetData;
  }

  const getSampleStories = (): UserStory[] => {
    return [
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
        comments: [
          {
            id: 'comment1',
            userId: 'user2',
            userName: 'Mike Rodriguez',
            content: 'Totally agree! The floral notes are what got me hooked on this one too!',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            likes: 3,
            likedBy: ['user1', 'user3']
          }
        ],
        commentCount: 1,
        reshares: 5,
        resharedBy: ['user2', 'user5'],
        reports: [],
        isReported: false,
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
        comments: [],
        commentCount: 0,
        reshares: 2,
        resharedBy: ['user4'],
        reports: [],
        isReported: false,
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
        comments: [],
        commentCount: 0,
        reshares: 3,
        resharedBy: ['user1'],
        reports: [],
        isReported: false,
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
        comments: [],
        commentCount: 0,
        reshares: 8,
        resharedBy: ['user2', 'user5'],
        reports: [],
        isReported: false,
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
        comments: [],
        commentCount: 0,
        reshares: 4,
        resharedBy: ['user1', 'user3'],
        reports: [],
        isReported: false,
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
        comments: [],
        commentCount: 0,
        reshares: 1,
        resharedBy: [],
        reports: [],
        isReported: false,
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
        comments: [],
        commentCount: 0,
        reshares: 2,
        resharedBy: ['user6'],
        reports: [],
        isReported: false,
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
        comments: [],
        commentCount: 0,
        reshares: 1,
        resharedBy: ['user7'],
        reports: [],
        isReported: false,
        isLive: true,
        tags: ['#live', '#espresso', '#colombia'],
      },
    ];
  };

  // Load stories from localStorage or initialize with sample data
  const loadStories = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Try to load from API first
      try {
        const response = await fetch('/api/stories');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setStories(result.data);
            console.log('Stories loaded from API:', result.data.length, 'stories');
            return;
          }
        }
      } catch (apiError) {
        console.log('API not available, falling back to localStorage');
      }
      
      // Fallback to localStorage
      const savedStories = localStorage.getItem(STORIES_STORAGE_KEY);
      if (savedStories) {
        try {
          const parsedStories = JSON.parse(savedStories);
          if (Array.isArray(parsedStories)) {
            // Convert timestamp strings back to Date objects and migrate old data
            const storiesWithDates = parsedStories.map((story: any) => ({
              // Ensure all required fields exist
              id: story.id || Date.now().toString(),
              userId: story.userId || 'unknown',
              userName: story.userName || 'Unknown User',
              userAvatar: story.userAvatar || '',
              content: story.content || '',
              rating: story.rating || 0,
              timestamp: new Date(story.timestamp || Date.now()),
              type: story.type || 'story',
              productId: story.productId || '',
              productName: story.productName || '',
              images: story.images || [],
              likes: story.likes || 0,
              likedBy: story.likedBy || [],
              tags: story.tags || [],
              isLive: story.isLive || false,
              // Add new fields if they don't exist (migration)
              comments: story.comments || [],
              commentCount: story.commentCount || (story.comments ? story.comments.length : 0),
              reshares: story.reshares || 0,
              resharedBy: story.resharedBy || [],
              reports: story.reports || [],
              isReported: story.isReported || false,
            }));
            setStories(storiesWithDates);
            console.log('Stories loaded from localStorage:', storiesWithDates.length, 'stories');
            // Save migrated data back to localStorage
            localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(storiesWithDates));
          } else {
            throw new Error('Saved stories is not an array');
          }
        } catch (parseError) {
          console.error('Error parsing saved stories:', parseError);
          // Clear corrupted data and use sample data
          localStorage.removeItem(STORIES_STORAGE_KEY);
          const sampleStories = getSampleStories();
          setStories(sampleStories);
          localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(sampleStories));
          console.log('Corrupted data cleared, initialized with sample data');
        }
      } else {
        // Initialize with sample data only if no saved data exists
        const sampleStories = getSampleStories();
        setStories(sampleStories);
        console.log('No saved stories found, initialized with sample data');
        // Save sample data to localStorage
        localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(sampleStories));
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      // Fallback to sample data on error
      const sampleStories = getSampleStories();
      setStories(sampleStories);
    } finally {
      setLoading(false);
    }
  };

  // Save stories to localStorage and API
  const saveStories = async (): Promise<void> => {
    try {
      // Try to save to API first
      try {
        const response = await fetch('/api/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stories)
        });
        
        if (response.ok) {
          console.log('Stories saved to API');
        }
      } catch (apiError) {
        console.log('API not available, saving to localStorage only');
      }
      
      // Always save to localStorage as backup
      localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(stories));
      console.log('Stories saved to localStorage:', stories.length, 'stories');
    } catch (error) {
      console.error('Error saving stories:', error);
    }
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
        comments: [],
        commentCount: 0,
        reshares: 0,
        resharedBy: [],
        reports: [],
        isReported: false,
        isLive: storyData.isLive || false,
        tags: storyData.tags || [],
      };

      setStories(prev => {
        const updated = [newStory, ...prev];
        // Auto-save to localStorage
        localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      
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
      setStories(prev => {
        const updated = prev.map(story => 
          story.id === storyId ? { ...story, ...updates } : story
        );
        // Auto-save to localStorage
        localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      
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
      setStories(prev => {
        const updated = prev.filter(story => story.id !== storyId);
        // Auto-save to localStorage
        localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      
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
      setStories(prev => {
        const updated = prev.map(story => {
          if (story.id === storyId && !story.likedBy.includes(user.id)) {
            return {
              ...story,
              likes: story.likes + 1,
              likedBy: [...story.likedBy, user.id],
            };
          }
          return story;
        });
        // Auto-save to localStorage
        localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const unlikeStory = async (storyId: string): Promise<void> => {
    if (!user) return;

    try {
      setStories(prev => {
        const updated = prev.map(story => {
          if (story.id === storyId && story.likedBy.includes(user.id)) {
            return {
              ...story,
              likes: story.likes - 1,
              likedBy: story.likedBy.filter(id => id !== user.id),
            };
          }
          return story;
        });
        // Auto-save to localStorage
        localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error unliking story:', error);
    }
  };

  const addComment = async (storyId: string, content: string): Promise<void> => {
    if (!user || !content.trim()) return;

    try {
      const newComment: Comment = {
        id: `comment_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: content.trim(),
        timestamp: new Date(),
        likes: 0,
        likedBy: [],
      };

      setStories(prev => {
        const updated = prev.map(story => {
          if (story.id === storyId) {
            return {
              ...story,
              comments: [...story.comments, newComment],
              commentCount: story.commentCount + 1,
            };
          }
          return story;
        });
        localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const likeComment = async (storyId: string, commentId: string): Promise<void> => {
    if (!user) return;

    try {
      setStories(prev => {
        const updated = prev.map(story => {
          if (story.id === storyId) {
            const updatedComments = story.comments.map(comment => {
              if (comment.id === commentId && !comment.likedBy.includes(user.id)) {
                return {
                  ...comment,
                  likes: comment.likes + 1,
                  likedBy: [...comment.likedBy, user.id],
                };
              }
              return comment;
            });
            return { ...story, comments: updatedComments };
          }
          return story;
        });
        localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const deleteComment = async (storyId: string, commentId: string): Promise<void> => {
    if (!user) return;

    try {
      setStories(prev => {
        const updated = prev.map(story => {
          if (story.id === storyId) {
            const updatedComments = story.comments.filter(comment => 
              comment.id !== commentId || comment.userId === user.id
            );
            return {
              ...story,
              comments: updatedComments,
              commentCount: updatedComments.length,
            };
          }
          return story;
        });
        localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const reshareStory = async (storyId: string): Promise<void> => {
    if (!user) return;

    try {
      setStories(prev => {
        const updated = prev.map(story => {
          if (story.id === storyId && !story.resharedBy.includes(user.id)) {
            return {
              ...story,
              reshares: story.reshares + 1,
              resharedBy: [...story.resharedBy, user.id],
            };
          }
          return story;
        });
        localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error resharing story:', error);
    }
  };

  const unreshareStory = async (storyId: string): Promise<void> => {
    if (!user) return;

    try {
      setStories(prev => {
        const updated = prev.map(story => {
          if (story.id === storyId && story.resharedBy.includes(user.id)) {
            return {
              ...story,
              reshares: story.reshares - 1,
              resharedBy: story.resharedBy.filter(id => id !== user.id),
            };
          }
          return story;
        });
        localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error unresharing story:', error);
    }
  };

  const reportStory = async (storyId: string, reason: string): Promise<void> => {
    if (!user || !reason.trim()) return;

    try {
      const newReport: ReportReason = {
        id: `report_${Date.now()}`,
        reason: reason.trim(),
        reportedBy: user.id,
        timestamp: new Date(),
      };

      setStories(prev => {
        const updated = prev.map(story => {
          if (story.id === storyId) {
            const existingReport = story.reports.find(r => r.reportedBy === user.id);
            if (!existingReport) {
              return {
                ...story,
                reports: [...story.reports, newReport],
                isReported: true,
              };
            }
          }
          return story;
        });
        localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

      // Show confirmation to user
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('✅ Post reported. Thank you for keeping our community safe.');
      }
    } catch (error) {
      console.error('Error reporting story:', error);
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
    addComment,
    likeComment,
    deleteComment,
    reshareStory,
    unreshareStory,
    reportStory,
    getStoriesByProduct,
    getStoriesByUser,
    getLiveStories,
    getFilteredStories,
    getAverageRatingByProduct,
    refreshStories,
    saveStories,
    loadStories,
    getCommunityStats,
  };

  return (
    <UserStoriesContext.Provider value={value}>
      {children}
    </UserStoriesContext.Provider>
  );
};