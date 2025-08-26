export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  likes: number;
  likedBy: string[];
}

export interface ReportReason {
  id: string;
  reason: string;
  reportedBy: string;
  timestamp: Date;
}

export interface MediaAttachment {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string; // For videos
  alt?: string;
  size?: number; // File size in bytes
}

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
  media: MediaAttachment[]; // Photos and videos
  likes: number;
  likedBy: string[]; // User IDs who liked this story
  comments: Comment[];
  commentCount: number;
  reshares: number;
  resharedBy: string[]; // User IDs who reshared this story
  reports: ReportReason[];
  isReported: boolean;
  isLive: boolean; // For live posts
  tags?: string[]; // Optional tags like #coffee, #brewing, etc.
  location?: string; // Optional location
  feeling?: string; // Optional feeling/activity
}

export interface CreateUserStoryRequest {
  content: string;
  rating?: number;
  type: 'story' | 'review';
  productId?: string;
  media?: MediaAttachment[];
  tags?: string[];
  isLive?: boolean;
  location?: string;
  feeling?: string;
  privacy?: 'public' | 'friends' | 'private';
}

export interface UserStoryFilters {
  type?: 'story' | 'review' | 'all';
  rating?: number;
  productId?: string;
  isLive?: boolean;
  sortBy?: 'newest' | 'oldest' | 'rating' | 'likes';
  tags?: string[];
}