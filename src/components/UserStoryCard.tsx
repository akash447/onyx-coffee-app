import React, { useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { UserStory } from '../types/UserStory';
import { useUserStories } from '../contexts/UserStoriesContext';
import { useAuth } from '../contexts/AuthContext';
import { Typography, FontConfig } from '../utils/fonts';

interface UserStoryCardProps {
  story: UserStory;
  onProductPress?: (productId: string) => void;
  showProduct?: boolean;
}

const UserStoryCard: React.FC<UserStoryCardProps> = ({ 
  story, 
  onProductPress, 
  showProduct = true 
}) => {
  const { likeStory, unlikeStory, deleteStory } = useUserStories();
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);

  const isLikedByUser = user ? story.likedBy.includes(user.id) : false;
  const canDelete = user && story.userId === user.id;

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const handleLike = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to like stories');
      return;
    }

    if (isLikedByUser) {
      unlikeStory(story.id);
    } else {
      likeStory(story.id);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Story',
      'Are you sure you want to delete this story?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteStory(story.id)
        }
      ]
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text
        key={i}
        style={[
          styles.star,
          { color: i < rating ? '#FFD700' : '#ddd' }
        ]}
      >
        ⭐
      </Text>
    ));
  };

  return (
    <View style={[styles.container, story.isLive && styles.liveContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {story.userAvatar && !imageError ? (
            <Image
              source={{ uri: story.userAvatar }}
              style={styles.avatar}
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {story.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{story.userName}</Text>
            <View style={styles.metaInfo}>
              <Text style={styles.timestamp}>{formatTimeAgo(story.timestamp)}</Text>
              {story.isLive && (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <View style={styles.liveIndicator}>
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {canDelete && (
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>×</Text>
          </Pressable>
        )}
      </View>

      {/* Content */}
      <Text style={styles.content}>{story.content}</Text>

      {/* Product Info & Rating */}
      {story.type === 'review' && story.productName && showProduct && (
        <Pressable
          style={styles.productInfo}
          onPress={() => story.productId && onProductPress?.(story.productId)}
        >
          <View style={styles.productHeader}>
            <Text style={styles.productLabel}>Product Review:</Text>
            <Text style={styles.productName}>{story.productName}</Text>
          </View>
          {story.rating > 0 && (
            <View style={styles.rating}>
              {renderStars(story.rating)}
              <Text style={styles.ratingText}>({story.rating}/5)</Text>
            </View>
          )}
        </Pressable>
      )}

      {/* Tags */}
      {story.tags && story.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {story.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.likeButton, isLikedByUser && styles.likedButton]}
          onPress={handleLike}
        >
          <Text style={[styles.likeIcon, isLikedByUser && styles.likedIcon]}>
            {isLikedByUser ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.likeText, isLikedByUser && styles.likedText]}>
            {story.likes} {story.likes === 1 ? 'like' : 'likes'}
          </Text>
        </Pressable>

        <View style={styles.storyType}>
          <Text style={styles.storyTypeText}>
            {story.type === 'review' ? '📝 Review' : '💬 Story'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  liveContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...Typography.h5,
    color: '#000',
    marginBottom: 2,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    ...Typography.caption,
    color: '#666',
  },
  metaDot: {
    color: '#666',
    marginHorizontal: 6,
  },
  liveIndicator: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1f3f4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  content: {
    ...Typography.body,
    color: '#000',
    lineHeight: 20,
    marginBottom: 12,
  },
  productInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  productHeader: {
    marginBottom: 8,
  },
  productLabel: {
    ...Typography.caption,
    color: '#666',
    marginBottom: 2,
  },
  productName: {
    ...Typography.h5,
    color: '#000',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 16,
    marginRight: 2,
  },
  ratingText: {
    ...Typography.caption,
    color: '#666',
    marginLeft: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#1565c0',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#f1f3f4',
  },
  likedButton: {
    backgroundColor: '#ffebee',
  },
  likeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  likedIcon: {
    // Styles for liked state
  },
  likeText: {
    ...Typography.caption,
    color: '#666',
  },
  likedText: {
    color: '#e74c3c',
  },
  storyType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f1f3f4',
  },
  storyTypeText: {
    ...Typography.caption,
    color: '#666',
  },
});

export default memo(UserStoryCard);