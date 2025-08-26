export interface UserStory {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  rating: number; // 1-5 stars
  timestamp: Date;
  type: 'story' | 'review';
  productId?: string; // For product reviews
  productName?: string; // For product reviews
  images?: string[]; // Optional images
  likes: number;
  likedBy: string[]; // User IDs who liked this story
  isLive: boolean; // For live posts
  tags?: string[]; // Optional tags like #coffee, #brewing, etc.
}

export interface CreateUserStoryRequest {
  content: string;
  rating?: number;
  type: 'story' | 'review';
  productId?: string;
  images?: string[];
  tags?: string[];
  isLive?: boolean;
}

export interface UserStoryFilters {
  type?: 'story' | 'review' | 'all';
  rating?: number;
  productId?: string;
  isLive?: boolean;
  sortBy?: 'newest' | 'oldest' | 'rating' | 'likes';
  tags?: string[];
}