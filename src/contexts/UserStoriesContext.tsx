import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserStory, CreateUserStoryRequest, UserStoryFilters, Comment, ReportReason, MediaAttachment } from '../types/UserStory';
import { DatabasePost, DatabaseMedia, CreatePostRequest } from '../types/Database';
import { useAuth } from './AuthContext';
import { useCatalog } from './CatalogContext';
import databaseService from '../services/DatabaseService';

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
  uploadMedia: (files: File[]) => Promise<MediaAttachment[]>;
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
  const { user, isAuthenticated } = useAuth();
  const { items: products } = useCatalog();

  // Load stories on component mount and when user changes
  useEffect(() => {
    refreshStories();
  }, [user]);

  // Initialize database and seed with sample data
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await databaseService.seedDatabase();
        await refreshStories();
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initializeDatabase();
  }, []);

  // Helper function to convert DatabasePost to UserStory
  const convertDatabasePostToUserStory = async (dbPost: DatabasePost): Promise<UserStory> => {
    // Get user info for the post
    const userResponse = await databaseService.getUserById(dbPost.userId);
    const postUser = userResponse.data;

    return {
      id: dbPost.id,
      userId: dbPost.userId,
      userName: postUser?.name || 'Unknown User',
      userAvatar: postUser?.avatar,
      content: dbPost.content,
      rating: dbPost.rating || 0,
      timestamp: dbPost.createdAt,
      type: dbPost.type,
      productId: dbPost.productId,
      productName: dbPost.productName,
      media: dbPost.media.map(media => ({
        id: media.id,
        type: media.type,
        url: media.url,
        thumbnail: media.thumbnail,
        alt: media.alt,
        size: media.size
      })),
      likes: dbPost.stats.likes,
      likedBy: dbPost.interactions.likedBy,
      comments: [], // Comments will be loaded separately
      commentCount: dbPost.stats.comments,
      reshares: dbPost.stats.reshares,
      resharedBy: dbPost.interactions.resharedBy,
      reports: [], // Reports will be loaded separately
      isReported: dbPost.isReported,
      isLive: dbPost.isLive,
      tags: dbPost.tags,
      location: dbPost.location,
      feeling: dbPost.feeling
    };
  };

  const refreshStories = async () => {
    setLoading(true);
    try {
      const postsResponse = await databaseService.getPosts({ limit: 50 });
      if (postsResponse.success) {
        const userStories = await Promise.all(
          postsResponse.data.map(post => convertDatabasePostToUserStory(post))
        );
        setStories(userStories);
      }
    } catch (error) {
      console.error('Failed to load stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const createStory = async (storyData: CreateUserStoryRequest): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to create stories');
    }

    setLoading(true);
    try {
      // Upload media first if present
      const uploadedMedia: MediaAttachment[] = [];
      if (storyData.media && storyData.media.length > 0) {
        console.log('Processing media files:', storyData.media.length);
        
        for (const media of storyData.media) {
          console.log('Processing media:', media.url.substring(0, 50) + '...');
          
          // Convert Object URLs to data URLs for persistence
          if (media.url.startsWith('blob:')) {
            try {
              console.log('Converting blob URL to data URL...');
              const response = await fetch(media.url);
              const blob = await response.blob();
              console.log('Blob size:', blob.size, 'bytes, type:', blob.type);
              
              const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                  console.log('Data URL created successfully');
                  resolve(reader.result as string);
                };
                reader.onerror = () => {
                  console.error('FileReader error');
                  reject(new Error('Failed to read file'));
                };
                reader.readAsDataURL(blob);
              });
              
              const convertedMedia: MediaAttachment = {
                ...media,
                url: dataUrl,
                size: blob.size,
                type: blob.type.startsWith('video/') ? 'video' : 'image'
              };
              
              uploadedMedia.push(convertedMedia);
              console.log('Media converted successfully:', convertedMedia.type);
              
              // Clean up the blob URL to free memory
              URL.revokeObjectURL(media.url);
            } catch (error) {
              console.error('Failed to convert blob to data URL:', error);
              // Fallback to original URL
              uploadedMedia.push(media);
            }
          } else {
            console.log('Using existing media URL');
            uploadedMedia.push(media);
          }
        }
        
        console.log('Total media processed:', uploadedMedia.length);
      }

      const createPostRequest: CreatePostRequest = {
        content: storyData.content,
        type: storyData.type,
        rating: storyData.rating,
        productId: storyData.productId,
        privacy: storyData.privacy || 'public',
        isLive: storyData.isLive,
        tags: storyData.tags,
        location: storyData.location,
        feeling: storyData.feeling
      };

      const response = await databaseService.createPost(createPostRequest, user.id);
      
      if (response.success && response.data) {
        // Update the post with media in database
        if (uploadedMedia.length > 0) {
          console.log('Saving media to database...');
          
          const databaseMedia = uploadedMedia.map(media => ({
            id: media.id,
            postId: response.data!.id,
            userId: user.id,
            type: media.type,
            url: media.url,
            filename: media.alt || `${media.type}_${Date.now()}`,
            mimeType: media.type === 'image' ? 'image/jpeg' : 'video/mp4',
            size: media.size || 0,
            alt: media.alt,
            uploadedAt: new Date()
          }));
          
          // Update the post in database with media
          response.data.media = databaseMedia;
          
          // Store the updated post back to database
          if (typeof window !== 'undefined' && 'indexedDB' in window) {
            try {
              const db = await (databaseService as any).getDB();
              const transaction = db.transaction(['posts'], 'readwrite');
              const store = transaction.objectStore('posts');
              await new Promise((resolve, reject) => {
                const request = store.put(response.data);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
              });
              console.log('Post updated with media in IndexedDB');
            } catch (error) {
              console.error('Error updating post in IndexedDB:', error);
            }
          } else {
            // Update in localStorage
            try {
              const posts = JSON.parse(localStorage.getItem('onyxdb_posts') || '[]');
              const postIndex = posts.findIndex((p: any) => p.id === response.data!.id);
              if (postIndex !== -1) {
                posts[postIndex] = response.data;
                localStorage.setItem('onyxdb_posts', JSON.stringify(posts));
                console.log('Post updated with media in localStorage');
              }
            } catch (error) {
              console.error('Error updating post in localStorage:', error);
            }
          }
          
          console.log('Media saved successfully:', databaseMedia.length, 'files');
        }

        // Refresh stories to show the new post
        await refreshStories();
      }
    } catch (error) {
      console.error('Failed to create story:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateStory = async (storyId: string, updates: Partial<UserStory>): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to update stories');
    }

    try {
      console.log('Updating story in database:', storyId, updates);
      
      // Update in database
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        try {
          const db = await (databaseService as any).getDB();
          const transaction = db.transaction(['posts'], 'readwrite');
          const store = transaction.objectStore('posts');
          
          // Get existing post
          const existingPost = await new Promise<any>((resolve, reject) => {
            const request = store.get(storyId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
          
          if (existingPost) {
            // Update the post with new data
            const updatedPost = {
              ...existingPost,
              content: updates.content || existingPost.content,
              location: updates.location || existingPost.location,
              feeling: updates.feeling || existingPost.feeling,
              tags: updates.tags || existingPost.tags,
              rating: updates.rating !== undefined ? updates.rating : existingPost.rating,
              updatedAt: new Date()
            };
            
            await new Promise((resolve, reject) => {
              const request = store.put(updatedPost);
              request.onsuccess = () => resolve(request.result);
              request.onerror = () => reject(request.error);
            });
            console.log('Story updated in IndexedDB');
          }
        } catch (error) {
          console.error('Error updating in IndexedDB:', error);
        }
      } else {
        // Update in localStorage
        try {
          const posts = JSON.parse(localStorage.getItem('onyxdb_posts') || '[]');
          const postIndex = posts.findIndex((p: any) => p.id === storyId);
          
          if (postIndex !== -1) {
            posts[postIndex] = {
              ...posts[postIndex],
              content: updates.content || posts[postIndex].content,
              location: updates.location || posts[postIndex].location,
              feeling: updates.feeling || posts[postIndex].feeling,
              tags: updates.tags || posts[postIndex].tags,
              rating: updates.rating !== undefined ? updates.rating : posts[postIndex].rating,
              updatedAt: new Date()
            };
            
            localStorage.setItem('onyxdb_posts', JSON.stringify(posts));
            console.log('Story updated in localStorage');
          }
        } catch (error) {
          console.error('Error updating in localStorage:', error);
        }
      }
      
      // Refresh to show updated data
      await refreshStories();
      
      console.log('Story updated successfully');
    } catch (error) {
      console.error('Failed to update story:', error);
      throw error;
    }
  };

  const deleteStory = async (storyId: string): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to delete stories');
    }

    try {
      console.log('Deleting story from database:', storyId);
      
      // Delete from database
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        try {
          const db = await (databaseService as any).getDB();
          const transaction = db.transaction(['posts'], 'readwrite');
          const store = transaction.objectStore('posts');
          await new Promise((resolve, reject) => {
            const request = store.delete(storyId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
          console.log('Story deleted from IndexedDB');
        } catch (error) {
          console.error('Error deleting from IndexedDB:', error);
        }
      } else {
        // Delete from localStorage
        try {
          const posts = JSON.parse(localStorage.getItem('onyxdb_posts') || '[]');
          const filteredPosts = posts.filter((p: any) => p.id !== storyId);
          localStorage.setItem('onyxdb_posts', JSON.stringify(filteredPosts));
          console.log('Story deleted from localStorage');
        } catch (error) {
          console.error('Error deleting from localStorage:', error);
        }
      }
      
      // Update local state
      setStories(prev => prev.filter(story => story.id !== storyId));
      
      console.log('Story deleted successfully');
    } catch (error) {
      console.error('Failed to delete story:', error);
      throw error;
    }
  };

  const likeStory = async (storyId: string): Promise<void> => {
    if (!isAuthenticated || !user) return;

    try {
      const response = await databaseService.likePost(storyId, user.id);
      if (response.success) {
        await refreshStories();
      }
    } catch (error) {
      console.error('Failed to like story:', error);
    }
  };

  const unlikeStory = async (storyId: string): Promise<void> => {
    if (!isAuthenticated || !user) return;

    try {
      const response = await databaseService.unlikePost(storyId, user.id);
      if (response.success) {
        await refreshStories();
      }
    } catch (error) {
      console.error('Failed to unlike story:', error);
    }
  };

  const addComment = async (storyId: string, content: string): Promise<void> => {
    if (!isAuthenticated || !user) return;

    try {
      // Create comment in database
      const comment: Comment = {
        id: `comment_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: content.trim(),
        timestamp: new Date(),
        likes: 0,
        likedBy: []
      };

      // Update story with new comment
      setStories(prev => prev.map(story => {
        if (story.id === storyId) {
          return {
            ...story,
            comments: [...story.comments, comment],
            commentCount: story.commentCount + 1
          };
        }
        return story;
      }));
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const likeComment = async (storyId: string, commentId: string): Promise<void> => {
    if (!isAuthenticated || !user) return;

    setStories(prev => prev.map(story => {
      if (story.id === storyId) {
        return {
          ...story,
          comments: story.comments.map(comment => {
            if (comment.id === commentId) {
              const isLiked = comment.likedBy.includes(user.id);
              return {
                ...comment,
                likes: isLiked ? comment.likes - 1 : comment.likes + 1,
                likedBy: isLiked 
                  ? comment.likedBy.filter(id => id !== user.id)
                  : [...comment.likedBy, user.id]
              };
            }
            return comment;
          })
        };
      }
      return story;
    }));
  };

  const deleteComment = async (storyId: string, commentId: string): Promise<void> => {
    if (!isAuthenticated || !user) return;

    setStories(prev => prev.map(story => {
      if (story.id === storyId) {
        return {
          ...story,
          comments: story.comments.filter(comment => comment.id !== commentId),
          commentCount: Math.max(0, story.commentCount - 1)
        };
      }
      return story;
    }));
  };

  const reshareStory = async (storyId: string): Promise<void> => {
    if (!isAuthenticated || !user) return;

    setStories(prev => prev.map(story => {
      if (story.id === storyId && !story.resharedBy.includes(user.id)) {
        return {
          ...story,
          reshares: story.reshares + 1,
          resharedBy: [...story.resharedBy, user.id]
        };
      }
      return story;
    }));
  };

  const unreshareStory = async (storyId: string): Promise<void> => {
    if (!isAuthenticated || !user) return;

    setStories(prev => prev.map(story => {
      if (story.id === storyId && story.resharedBy.includes(user.id)) {
        return {
          ...story,
          reshares: Math.max(0, story.reshares - 1),
          resharedBy: story.resharedBy.filter(id => id !== user.id)
        };
      }
      return story;
    }));
  };

  const reportStory = async (storyId: string, reason: string): Promise<void> => {
    if (!isAuthenticated || !user) return;

    const report: ReportReason = {
      id: `report_${Date.now()}`,
      reason,
      reportedBy: user.id,
      timestamp: new Date()
    };

    setStories(prev => prev.map(story => {
      if (story.id === storyId) {
        return {
          ...story,
          reports: [...story.reports, report],
          isReported: true
        };
      }
      return story;
    }));
  };

  const uploadMedia = async (files: File[]): Promise<MediaAttachment[]> => {
    const uploadedMedia: MediaAttachment[] = [];
    
    for (const file of files) {
      try {
        const mediaResponse = await databaseService.uploadMedia(
          { file, alt: file.name },
          user?.id || 'anonymous'
        );
        
        if (mediaResponse.success && mediaResponse.data) {
          uploadedMedia.push({
            id: mediaResponse.data.id,
            type: mediaResponse.data.type,
            url: mediaResponse.data.url,
            alt: mediaResponse.data.alt,
            size: mediaResponse.data.size
          });
        }
      } catch (error) {
        console.error('Failed to upload media:', error);
      }
    }
    
    return uploadedMedia;
  };

  // Filter and query functions
  const getStoriesByProduct = (productId: string): UserStory[] => {
    return stories.filter(story => story.productId === productId);
  };

  const getStoriesByUser = (userId: string): UserStory[] => {
    return stories.filter(story => story.userId === userId);
  };

  const getLiveStories = (): UserStory[] => {
    return stories.filter(story => story.isLive);
  };

  const getFilteredStories = (filters: UserStoryFilters): UserStory[] => {
    return stories.filter(story => {
      if (filters.type && filters.type !== 'all' && story.type !== filters.type) return false;
      if (filters.rating && story.rating !== filters.rating) return false;
      if (filters.productId && story.productId !== filters.productId) return false;
      if (filters.isLive !== undefined && story.isLive !== filters.isLive) return false;
      if (filters.tags && filters.tags.length > 0) {
        const storyTags = story.tags || [];
        if (!filters.tags.some(tag => storyTags.includes(tag))) return false;
      }
      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'likes':
          return b.likes - a.likes;
        default: // 'newest'
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });
  };

  const getAverageRatingByProduct = (productId: string): number => {
    const productReviews = stories.filter(story => 
      story.type === 'review' && story.productId === productId && story.rating > 0
    );
    
    if (productReviews.length === 0) return 0;
    
    const totalRating = productReviews.reduce((sum, story) => sum + (story.rating || 0), 0);
    return Math.round((totalRating / productReviews.length) * 10) / 10;
  };

  const getCommunityStats = () => {
    const uniqueUsers = new Set(stories.map(story => story.userId));
    const totalReviews = stories.filter(story => story.type === 'review').length;
    
    return {
      totalMembers: uniqueUsers.size,
      totalStories: stories.length,
      totalReviews
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
    uploadMedia,
    getCommunityStats
  };

  return (
    <UserStoriesContext.Provider value={value}>
      {children}
    </UserStoriesContext.Provider>
  );
};

export default UserStoriesProvider;