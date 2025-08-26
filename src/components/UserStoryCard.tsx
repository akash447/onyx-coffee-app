import React, { useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  Platform,
  TextInput,
  Modal,
  ScrollView,
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
  // Safety check - if story is invalid, don't render
  if (!story || !story.id) {
    console.error('Invalid story object:', story);
    return null;
  }
  const { 
    likeStory, 
    unlikeStory, 
    deleteStory, 
    addComment, 
    likeComment, 
    deleteComment,
    reshareStory, 
    unreshareStory, 
    reportStory 
  } = useUserStories();
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const isLikedByUser = user ? (story.likedBy || []).includes(user.id) : false;
  const isResharedByUser = user ? (story.resharedBy || []).includes(user.id) : false;
  const canDelete = user && story.userId === user.id;
  const isOwnPost = user && story.userId === user.id;

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

  const handleComment = async () => {
    if (!newComment.trim()) return;
    await addComment(story.id, newComment);
    setNewComment('');
  };

  const handleReshare = () => {
    if (isResharedByUser) {
      unreshareStory(story.id);
    } else {
      reshareStory(story.id);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    await reportStory(story.id, reportReason);
    setShowReportModal(false);
    setReportReason('');
    setShowMenu(false);
  };

  const handleMenuAction = (action: string) => {
    setShowMenu(false);
    switch (action) {
      case 'report':
        setShowReportModal(true);
        break;
      case 'delete':
        handleDelete();
        break;
    }
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

        <Pressable style={styles.menuButton} onPress={() => setShowMenu(true)}>
          <Text style={styles.menuButtonText}>⋯</Text>
        </Pressable>
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

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable
          style={[styles.actionButton, isLikedByUser && styles.likedButton]}
          onPress={handleLike}
        >
          <Text style={[styles.actionIcon, isLikedByUser && styles.likedIcon]}>
            {isLikedByUser ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.actionText, isLikedByUser && styles.likedText]}>
            {story.likes || 0}
          </Text>
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onPress={() => setShowComments(!showComments)}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{story.commentCount || 0}</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, isResharedByUser && styles.resharedButton]}
          onPress={handleReshare}
        >
          <Text style={[styles.actionIcon, isResharedByUser && styles.resharedIcon]}>
            🔄
          </Text>
          <Text style={[styles.actionText, isResharedByUser && styles.resharedText]}>
            {story.reshares || 0}
          </Text>
        </Pressable>

        <View style={styles.storyType}>
          <Text style={styles.storyTypeText}>
            {story.type === 'review' ? '📝 Review' : '💬 Story'}
          </Text>
        </View>
      </View>

      {/* Comments Section */}
      {showComments && (
        <View style={styles.commentsSection}>
          {/* Add Comment */}
          {user && (
            <View style={styles.addCommentContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <Pressable
                style={[styles.commentButton, !newComment.trim() && styles.commentButtonDisabled]}
                onPress={handleComment}
                disabled={!newComment.trim()}
              >
                <Text style={[styles.commentButtonText, !newComment.trim() && styles.commentButtonTextDisabled]}>
                  Post
                </Text>
              </Pressable>
            </View>
          )}

          {/* Comments List */}
          {(story.comments || []).map((comment) => (
            <View key={comment.id} style={styles.commentContainer}>
              <View style={styles.commentHeader}>
                {comment.userAvatar ? (
                  <Image source={{ uri: comment.userAvatar }} style={styles.commentAvatar} />
                ) : (
                  <View style={styles.commentAvatarPlaceholder}>
                    <Text style={styles.commentAvatarText}>
                      {comment.userName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.commentContent}>
                  <View style={styles.commentMeta}>
                    <Text style={styles.commentAuthor}>{comment.userName}</Text>
                    <Text style={styles.commentTime}>
                      {formatTimeAgo(comment.timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.content}</Text>
                  <View style={styles.commentActions}>
                    <Pressable onPress={() => likeComment(story.id, comment.id)}>
                      <Text style={styles.commentLike}>
                        {(comment.likedBy || []).includes(user?.id || '') ? '❤️' : '🤍'} {comment.likes || 0}
                      </Text>
                    </Pressable>
                    {user && comment.userId === user.id && (
                      <Pressable onPress={() => deleteComment(story.id, comment.id)}>
                        <Text style={styles.commentDelete}>Delete</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Three Dots Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowMenu(false)}>
          <View style={styles.menuModal}>
            {isOwnPost ? (
              <Pressable style={styles.menuItem} onPress={() => handleMenuAction('delete')}>
                <Text style={[styles.menuItemText, styles.deleteMenuText]}>🗑️ Delete Post</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.menuItem} onPress={() => handleMenuAction('report')}>
                <Text style={styles.menuItemText}>🚩 Report Post</Text>
              </Pressable>
            )}
            <Pressable style={styles.menuItem} onPress={() => setShowMenu(false)}>
              <Text style={styles.cancelMenuText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reportModal}>
            <Text style={styles.reportTitle}>Report this post</Text>
            <Text style={styles.reportSubtitle}>Help us understand what's wrong</Text>
            
            <ScrollView style={styles.reportReasons}>
              {['Spam', 'Harassment', 'Inappropriate content', 'False information', 'Other'].map((reason) => (
                <Pressable
                  key={reason}
                  style={[
                    styles.reportReasonItem,
                    reportReason === reason && styles.reportReasonSelected
                  ]}
                  onPress={() => setReportReason(reason)}
                >
                  <Text style={[
                    styles.reportReasonText,
                    reportReason === reason && styles.reportReasonTextSelected
                  ]}>
                    {reason}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.reportActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowReportModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.reportButton, !reportReason && styles.reportButtonDisabled]}
                onPress={handleReport}
                disabled={!reportReason}
              >
                <Text style={[styles.reportButtonText, !reportReason && styles.reportButtonTextDisabled]}>
                  Report
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f3f4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 18,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  actionButton: {
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
  resharedButton: {
    backgroundColor: '#e8f5e8',
  },
  actionIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  likedIcon: {
    // Styles for liked state
  },
  resharedIcon: {
    // Styles for reshared state
  },
  actionText: {
    ...Typography.caption,
    color: '#666',
  },
  likedText: {
    color: '#e74c3c',
  },
  resharedText: {
    color: '#27ae60',
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
  // Comments Section Styles
  commentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 80,
    fontSize: 14,
    ...FontConfig.regular,
  },
  commentButton: {
    backgroundColor: '#000',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentButtonDisabled: {
    backgroundColor: '#ccc',
  },
  commentButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  commentButtonTextDisabled: {
    color: '#999',
  },
  commentContainer: {
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  commentAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  commentAvatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  commentContent: {
    flex: 1,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  commentTime: {
    fontSize: 10,
    color: '#999',
  },
  commentText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
    marginBottom: 4,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  commentLike: {
    fontSize: 10,
    color: '#666',
  },
  commentDelete: {
    fontSize: 10,
    color: '#e74c3c',
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 160,
    paddingVertical: 8,
    marginHorizontal: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: '#000',
  },
  deleteMenuText: {
    color: '#e74c3c',
  },
  cancelMenuText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 12,
  },
  reportModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    paddingVertical: 24,
    paddingHorizontal: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
      },
    }),
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  reportSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  reportReasons: {
    maxHeight: 200,
    marginBottom: 20,
  },
  reportReasonItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  reportReasonSelected: {
    borderColor: '#e74c3c',
    backgroundColor: '#ffebee',
  },
  reportReasonText: {
    fontSize: 14,
    color: '#333',
  },
  reportReasonTextSelected: {
    color: '#e74c3c',
    fontWeight: '500',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  reportButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#e74c3c',
  },
  reportButtonDisabled: {
    backgroundColor: '#ccc',
  },
  reportButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  reportButtonTextDisabled: {
    color: '#999',
  },
});

export default memo(UserStoryCard);