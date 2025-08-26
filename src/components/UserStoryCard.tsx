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
  Dimensions,
} from 'react-native';
import { UserStory } from '../types/UserStory';
import { useUserStories } from '../contexts/UserStoriesContext';
import { useAuth } from '../contexts/AuthContext';
import { Typography, FontConfig } from '../utils/fonts';

const { width: screenWidth } = Dimensions.get('window');

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
    reportStory,
    updateStory 
  } = useUserStories();
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState(story.content);
  const [editLocation, setEditLocation] = useState(story.location || '');
  const [editFeeling, setEditFeeling] = useState(story.feeling || '');
  const [editTags, setEditTags] = useState((story.tags || []).join(', '));
  const [editRating, setEditRating] = useState(story.rating || 0);
  const [editLoading, setEditLoading] = useState(false);

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
          onPress: async () => {
            try {
              console.log('Deleting story:', story.id);
              await deleteStory(story.id);
              console.log('Story deleted successfully');
            } catch (error) {
              console.error('Failed to delete story:', error);
              Alert.alert('Error', 'Failed to delete post. Please try again.');
            }
          }
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
      case 'edit':
        setEditContent(story.content);
        setEditLocation(story.location || '');
        setEditFeeling(story.feeling || '');
        setEditTags((story.tags || []).join(', '));
        setEditRating(story.rating || 0);
        setShowEditModal(true);
        break;
    }
  };

  const handleEditPost = async () => {
    if (!editContent.trim() && !editLocation.trim() && !editFeeling.trim()) {
      Alert.alert('Content Required', 'Please add some content to your post');
      return;
    }
    
    setEditLoading(true);
    
    try {
      console.log('Starting edit process...');
      
      const updates: Partial<UserStory> = {
        content: editContent.trim(),
        location: editLocation.trim() || undefined,
        feeling: editFeeling.trim() || undefined,
        tags: editTags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
          .map(tag => tag.startsWith('#') ? tag : `#${tag}`),
      };
      
      // Only update rating for review posts
      if (story.type === 'review') {
        updates.rating = editRating;
      }
      
      console.log('Updating story with:', updates);
      await updateStory(story.id, updates);
      
      setShowEditModal(false);
      console.log('Edit completed successfully');
      
      // Show success alert
      setTimeout(() => {
        Alert.alert('Success', 'Post updated successfully!');
      }, 100);
      
    } catch (error) {
      console.error('Failed to edit post:', error);
      Alert.alert('Error', 'Failed to edit post. Please try again.');
    } finally {
      setEditLoading(false);
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

  const renderMediaAttachments = () => {
    if (!story.media || story.media.length === 0) return null;

    const mediaCount = story.media.length;
    
    if (mediaCount === 1) {
      const media = story.media[0];
      return (
        <View style={styles.singleMediaContainer}>
          <Image
            source={{ uri: media.url }}
            style={styles.singleMedia}
            resizeMode="cover"
          />
          {media.type === 'video' && (
            <View style={styles.videoPlayButton}>
              <Text style={styles.playIcon}>▶️</Text>
            </View>
          )}
        </View>
      );
    }

    if (mediaCount === 2) {
      return (
        <View style={styles.doubleMediaContainer}>
          {story.media.slice(0, 2).map((media, index) => (
            <View key={media.id} style={styles.doubleMediaItem}>
              <Image
                source={{ uri: media.url }}
                style={styles.doubleMedia}
                resizeMode="cover"
              />
              {media.type === 'video' && (
                <View style={styles.videoPlayButton}>
                  <Text style={styles.playIcon}>▶️</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.multiMediaContainer}>
        <View style={styles.mainMediaContainer}>
          <Image
            source={{ uri: story.media[0].url }}
            style={styles.mainMedia}
            resizeMode="cover"
          />
          {story.media[0].type === 'video' && (
            <View style={styles.videoPlayButton}>
              <Text style={styles.playIcon}>▶️</Text>
            </View>
          )}
        </View>
        <View style={styles.sideMediaContainer}>
          {story.media.slice(1, 3).map((media, index) => (
            <View key={media.id} style={styles.sideMediaItem}>
              <Image
                source={{ uri: media.url }}
                style={styles.sideMedia}
                resizeMode="cover"
              />
              {media.type === 'video' && (
                <View style={styles.videoPlayButton}>
                  <Text style={styles.playIcon}>▶️</Text>
                </View>
              )}
              {index === 1 && mediaCount > 3 && (
                <View style={styles.morePhotosOverlay}>
                  <Text style={styles.morePhotosText}>+{mediaCount - 3}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderLocationFeeling = () => {
    if (!story.location && !story.feeling) return null;

    return (
      <View style={styles.locationFeelingContainer}>
        {story.feeling && (
          <Text style={styles.feelingText}>is feeling {story.feeling}</Text>
        )}
        {story.location && (
          <>
            {story.feeling && <Text style={styles.separator}> — </Text>}
            <Text style={styles.locationText}>at {story.location}</Text>
          </>
        )}
      </View>
    );
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
            <View style={styles.userNameContainer}>
              <Text style={styles.userName}>{story.userName}</Text>
              {renderLocationFeeling()}
            </View>
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
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.privacy}>🌍</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.menuButton} onPress={() => setShowMenu(true)}>
          <Text style={styles.menuButtonText}>⋯</Text>
        </Pressable>
      </View>

      {/* Content */}
      {story.content.trim() && (
        <Text style={styles.content}>{story.content}</Text>
      )}

      {/* Media Attachments */}
      {renderMediaAttachments()}

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

      {/* Action Stats */}
      {((story.likes || 0) > 0 || (story.commentCount || 0) > 0 || (story.reshares || 0) > 0) && (
        <View style={styles.actionStats}>
          <View style={styles.statsLeft}>
            {(story.likes || 0) > 0 && (
              <View style={styles.likesStats}>
                <View style={styles.reactionIcons}>
                  <View style={[styles.reactionIcon, styles.likeIcon]}>
                    <Text style={styles.reactionEmoji}>👍</Text>
                  </View>
                  <View style={[styles.reactionIcon, styles.loveIcon]}>
                    <Text style={styles.reactionEmoji}>❤️</Text>
                  </View>
                </View>
                <Text style={styles.statsText}>{story.likes}</Text>
              </View>
            )}
          </View>
          <View style={styles.statsRight}>
            {(story.commentCount || 0) > 0 && (
              <Text style={styles.statsText}>{story.commentCount} comments</Text>
            )}
            {(story.reshares || 0) > 0 && (
              <>
                {(story.commentCount || 0) > 0 && <Text style={styles.statsDot}> • </Text>}
                <Text style={styles.statsText}>{story.reshares} shares</Text>
              </>
            )}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <View style={styles.actionButtonsDivider} />
        <View style={styles.actionButtons}>
          <Pressable
            style={styles.facebookActionButton}
            onPress={handleLike}
          >
            <Text style={[styles.facebookActionIcon, isLikedByUser && styles.likedActionIcon]}>
              {isLikedByUser ? '👍' : '👍'}
            </Text>
            <Text style={[styles.facebookActionText, isLikedByUser && styles.likedActionText]}>
              Like
            </Text>
          </Pressable>

          <Pressable
            style={styles.facebookActionButton}
            onPress={() => setShowComments(!showComments)}
          >
            <Text style={styles.facebookActionIcon}>💬</Text>
            <Text style={styles.facebookActionText}>Comment</Text>
          </Pressable>

          <Pressable
            style={styles.facebookActionButton}
            onPress={handleReshare}
          >
            <Text style={[styles.facebookActionIcon, isResharedByUser && styles.resharedActionIcon]}>
              ↗️
            </Text>
            <Text style={[styles.facebookActionText, isResharedByUser && styles.resharedActionText]}>
              Share
            </Text>
          </Pressable>
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
              <>
                <Pressable style={styles.menuItem} onPress={() => handleMenuAction('edit')}>
                  <Text style={styles.menuItemText}>✏️ Edit Post</Text>
                </Pressable>
                <Pressable style={styles.menuItem} onPress={() => handleMenuAction('delete')}>
                  <Text style={[styles.menuItemText, styles.deleteMenuText]}>🗑️ Delete Post</Text>
                </Pressable>
              </>
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

      {/* Edit Post Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.editContainer}>
          {/* Modern Header */}
          <View style={styles.editModernHeader}>
            <Pressable onPress={() => setShowEditModal(false)} style={styles.editCloseButton}>
              <Text style={styles.editCloseButtonText}>×</Text>
            </Pressable>
            <Text style={styles.editHeaderTitle}>Edit {story.type === 'review' ? 'Review' : 'Post'}</Text>
            <Pressable 
              style={[styles.editUpdateButton, editLoading && styles.editUpdateButtonDisabled]} 
              onPress={handleEditPost}
              disabled={editLoading}
            >
              <Text style={[styles.editUpdateButtonText, editLoading && styles.editUpdateButtonTextDisabled]}>
                {editLoading ? 'Updating...' : 'Update'}
              </Text>
            </Pressable>
          </View>

          {/* User Profile Section */}
          <View style={styles.editUserSection}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.editUserAvatar} />
            ) : (
              <View style={styles.editUserAvatarPlaceholder}>
                <Text style={styles.editUserAvatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <View style={styles.editUserInfo}>
              <Text style={styles.editUserName}>{user?.name || 'Coffee Lover'}</Text>
              <Text style={styles.editPostType}>
                {story.type === 'review' ? '⭐ Editing Review' : '💬 Editing Story'}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.editContent} showsVerticalScrollIndicator={false}>
            {/* Main Content Input */}
            <View style={styles.editContentSection}>
              <TextInput
                style={styles.editMainInput}
                placeholder={story.type === 'review' ? "Share your review..." : `What's brewing, ${user?.name || 'Coffee Lover'}?`}
                value={editContent}
                onChangeText={setEditContent}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Media Preview (Read-only) */}
            {story.media && story.media.length > 0 && (
              <View style={styles.editMediaPreviewSection}>
                <Text style={styles.editMediaSectionTitle}>Photos & Videos</Text>
                <Text style={styles.editMediaNote}>Media cannot be edited after posting</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {story.media.map((media, index) => (
                    <View key={media.id} style={styles.editMediaItem}>
                      <Image
                        source={{ uri: media.url }}
                        style={styles.editMediaImage}
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Product Review Section */}
            {story.type === 'review' && (
              <View style={styles.editReviewSection}>
                <Text style={styles.editReviewSectionTitle}>Review Details</Text>
                
                {/* Product Info (Read-only) */}
                {story.productName && (
                  <View style={styles.editProductInfo}>
                    <Text style={styles.editProductLabel}>Product:</Text>
                    <Text style={styles.editProductName}>{story.productName}</Text>
                  </View>
                )}

                {/* Rating Section */}
                <View style={styles.editRatingSection}>
                  <Text style={styles.editRatingLabel}>Your Rating:</Text>
                  <View style={styles.editStarsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Pressable
                        key={star}
                        onPress={() => setEditRating(star)}
                        style={styles.editStarButton}
                      >
                        <Text
                          style={[
                            styles.editReviewStar,
                            { color: star <= editRating ? '#FFD700' : '#ddd' }
                          ]}
                        >
                          ⭐
                        </Text>
                      </Pressable>
                    ))}
                    <Text style={styles.editRatingText}>
                      {editRating > 0 ? `${editRating}/5` : 'Tap to rate'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Additional Options */}
            <View style={styles.editOptionsContainer}>
              {/* Location */}
              <View style={styles.editOptionRow}>
                <Text style={styles.editOptionLabel}>📍</Text>
                <TextInput
                  style={styles.editOptionInput}
                  placeholder="Add location"
                  value={editLocation}
                  onChangeText={setEditLocation}
                />
              </View>

              {/* Feeling */}
              <View style={styles.editOptionRow}>
                <Text style={styles.editOptionLabel}>😊</Text>
                <TextInput
                  style={styles.editOptionInput}
                  placeholder="How are you feeling?"
                  value={editFeeling}
                  onChangeText={setEditFeeling}
                />
              </View>

              {/* Tags */}
              <View style={styles.editOptionRow}>
                <Text style={styles.editOptionLabel}>#</Text>
                <TextInput
                  style={styles.editOptionInput}
                  placeholder="Add tags (coffee, morning, etc.)"
                  value={editTags}
                  onChangeText={setEditTags}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
    }),
  },
  liveContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 0,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    backgroundColor: '#1877f2',
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
  userNameContainer: {
    marginBottom: 2,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#050505',
    lineHeight: 20,
  },
  locationFeelingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 1,
  },
  feelingText: {
    fontSize: 13,
    color: '#65676b',
  },
  locationText: {
    fontSize: 13,
    color: '#65676b',
  },
  separator: {
    fontSize: 13,
    color: '#65676b',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 13,
    color: '#65676b',
  },
  metaDot: {
    color: '#65676b',
    marginHorizontal: 4,
    fontSize: 13,
  },
  privacy: {
    fontSize: 11,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 20,
    color: '#65676b',
    fontWeight: '400',
  },
  content: {
    fontSize: 14,
    color: '#050505',
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  // Media Styles
  singleMediaContainer: {
    position: 'relative',
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  singleMedia: {
    width: 200,
    height: 133, // 3:2 aspect ratio (200 * 2/3)
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
  },
  doubleMediaContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 2,
    alignSelf: 'flex-start',
  },
  doubleMediaItem: {
    position: 'relative',
  },
  doubleMedia: {
    width: 99, // (200-2)/2 for gap
    height: 66, // 3:2 aspect ratio
    backgroundColor: '#f0f2f5',
    borderRadius: 6,
  },
  multiMediaContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 2,
    alignSelf: 'flex-start',
  },
  mainMediaContainer: {
    position: 'relative',
  },
  mainMedia: {
    width: 133, // 200 * 2/3 for main image
    height: 89, // 3:2 aspect ratio
    backgroundColor: '#f0f2f5',
    borderRadius: 6,
  },
  sideMediaContainer: {
    gap: 2,
  },
  sideMediaItem: {
    position: 'relative',
  },
  sideMedia: {
    width: 65, // (200-133-2)/1 for remaining space
    height: 43, // 3:2 aspect ratio
    backgroundColor: '#f0f2f5',
    borderRadius: 4,
  },
  videoPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 20,
  },
  morePhotosOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotosText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  // Action Stats
  actionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionIcons: {
    flexDirection: 'row',
    marginRight: 6,
  },
  reactionIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -2,
    borderWidth: 1,
    borderColor: '#fff',
  },
  likeIcon: {
    backgroundColor: '#1877f2',
  },
  loveIcon: {
    backgroundColor: '#e91e63',
  },
  reactionEmoji: {
    fontSize: 10,
  },
  statsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 13,
    color: '#65676b',
  },
  statsDot: {
    fontSize: 13,
    color: '#65676b',
  },
  // Action Buttons
  actionButtonsContainer: {
    marginTop: 8,
  },
  actionButtonsDivider: {
    height: 1,
    backgroundColor: '#dadde1',
    marginHorizontal: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  facebookActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  facebookActionIcon: {
    fontSize: 16,
    marginRight: 6,
    color: '#65676b',
  },
  likedActionIcon: {
    color: '#1877f2',
  },
  resharedActionIcon: {
    color: '#42b883',
  },
  facebookActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#65676b',
  },
  likedActionText: {
    color: '#1877f2',
  },
  resharedActionText: {
    color: '#42b883',
  },
  productInfo: {
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    marginTop: 0,
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
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tag: {
    backgroundColor: '#e7f3ff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 13,
    color: '#1877f2',
    fontWeight: '600',
  },
  // Comments Section Styles
  commentsSection: {
    paddingTop: 8,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    maxHeight: 80,
    color: '#050505',
  },
  commentButton: {
    backgroundColor: '#1877f2',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentButtonDisabled: {
    backgroundColor: '#dadde1',
  },
  commentButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  commentButtonTextDisabled: {
    color: '#bcc0c4',
  },
  commentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1877f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  commentAvatarText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  commentContent: {
    flex: 1,
  },
  commentMeta: {
    backgroundColor: '#f0f2f5',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#050505',
    marginBottom: 1,
  },
  commentTime: {
    fontSize: 12,
    color: '#65676b',
    marginLeft: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#050505',
    lineHeight: 18,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
    paddingLeft: 12,
  },
  commentLike: {
    fontSize: 12,
    color: '#65676b',
    fontWeight: '600',
  },
  commentDelete: {
    fontSize: 12,
    color: '#65676b',
    fontWeight: '600',
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
  // Edit Modal Styles (matching CreateUserStory design)
  editContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  editModernHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  editCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editCloseButtonText: {
    fontSize: 24,
    color: '#65676b',
    fontWeight: '300',
  },
  editHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#050505',
  },
  editUpdateButton: {
    backgroundColor: '#1877f2',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editUpdateButtonDisabled: {
    backgroundColor: '#dadde1',
  },
  editUpdateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  editUpdateButtonTextDisabled: {
    color: '#bcc0c4',
  },
  editUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  editUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  editUserAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1877f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  editUserAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editUserInfo: {
    flex: 1,
  },
  editUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#050505',
    marginBottom: 2,
  },
  editPostType: {
    fontSize: 13,
    color: '#65676b',
  },
  editContent: {
    flex: 1,
  },
  editContentSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  editMainInput: {
    fontSize: 16,
    color: '#050505',
    lineHeight: 20,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  editMediaPreviewSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  editMediaSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#050505',
    marginBottom: 4,
  },
  editMediaNote: {
    fontSize: 12,
    color: '#65676b',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  editMediaItem: {
    position: 'relative',
    marginRight: 12,
  },
  editMediaImage: {
    width: 200,
    height: 133,
    borderRadius: 8,
    backgroundColor: '#f0f2f5',
  },
  editReviewSection: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  editReviewSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#050505',
    marginBottom: 16,
    textAlign: 'center',
  },
  editProductInfo: {
    marginBottom: 16,
  },
  editProductLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#050505',
    marginBottom: 4,
  },
  editProductName: {
    fontSize: 16,
    color: '#1877f2',
    fontWeight: '500',
  },
  editRatingSection: {
    alignItems: 'center',
  },
  editRatingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#050505',
    marginBottom: 8,
  },
  editStarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editStarButton: {
    padding: 4,
  },
  editReviewStar: {
    fontSize: 24,
  },
  editRatingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#65676b',
    fontWeight: '500',
  },
  editOptionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  editOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  editOptionLabel: {
    fontSize: 18,
    width: 30,
    textAlign: 'center',
  },
  editOptionInput: {
    flex: 1,
    fontSize: 16,
    color: '#050505',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 12,
  },
});

export default memo(UserStoryCard);