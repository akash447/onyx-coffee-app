import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  Switch,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { CreateUserStoryRequest, MediaAttachment } from '../types/UserStory';
import { useUserStories } from '../contexts/UserStoriesContext';
import { useCatalog } from '../contexts/CatalogContext';
import { useAuth } from '../contexts/AuthContext';
import { Typography, FontConfig } from '../utils/fonts';

interface CreateUserStoryProps {
  visible: boolean;
  onClose: () => void;
  onStoryCreated?: () => void;
  initialProductId?: string;
  initialType?: 'story' | 'review';
}

const CreateUserStory: React.FC<CreateUserStoryProps> = ({
  visible,
  onClose,
  onStoryCreated,
  initialProductId,
  initialType = 'story',
}) => {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState(initialProductId || '');
  const [storyType, setStoryType] = useState<'story' | 'review'>(initialType);
  const [isLive, setIsLive] = useState(false);
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState('');
  const [feeling, setFeeling] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');

  const { createStory } = useUserStories();
  const { items: products } = useCatalog();
  const { user, isAuthenticated } = useAuth();

  const resetForm = () => {
    setContent('');
    setRating(0);
    setSelectedProductId(initialProductId || '');
    setStoryType(initialType);
    setIsLive(false);
    setTags('');
    setLocation('');
    setFeeling('');
    setSelectedMedia([]);
    setShowPostOptions(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Media handling functions
  const handleAddPhoto = () => {
    // Create a file input element for web
    if (typeof window !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.onchange = async (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        if (files.length > 0) {
          await handleFileUpload(files);
        }
      };
      input.click();
    } else {
      // Fallback for development - use sample photos
      const photoUrls = [
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=533&fit=crop',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=533&fit=crop',
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&h=533&fit=crop',
        'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=533&fit=crop',
      ];
      
      const randomPhoto = photoUrls[Math.floor(Math.random() * photoUrls.length)];
      const newPhoto: MediaAttachment = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'image',
        url: randomPhoto,
        alt: 'Coffee photo',
        size: 150000,
      };
      
      setSelectedMedia(prev => [...prev, newPhoto]);
    }
  };

  const handleAddVideo = () => {
    // Create a file input element for web
    if (typeof window !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*';
      input.multiple = true;
      input.onchange = async (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        if (files.length > 0) {
          await handleFileUpload(files);
        }
      };
      input.click();
    } else {
      Alert.alert('Video Upload', 'Video upload would be implemented with expo-image-picker in a real app');
    }
  };

  const handleFileUpload = async (files: File[]) => {
    try {
      const newMedia: MediaAttachment[] = [];
      
      for (const file of files) {
        // Create object URL for immediate preview
        const objectUrl = URL.createObjectURL(file);
        
        const media: MediaAttachment = {
          id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url: objectUrl,
          alt: file.name,
          size: file.size
        };
        
        newMedia.push(media);
        console.log('Added media file:', file.name, file.size, 'bytes');
      }
      
      setSelectedMedia(prev => [...prev, ...newMedia]);
    } catch (error) {
      console.error('Error uploading files:', error);
      Alert.alert('Upload Error', 'Failed to upload files. Please try again.');
    }
  };

  const removeMedia = (mediaId: string) => {
    setSelectedMedia(prev => prev.filter(media => media.id !== mediaId));
  };

  const handleSubmit = async () => {
    console.log('CreateUserStory: Starting story submission');
    console.log('Auth status:', { isAuthenticated, user: user?.name });
    
    if (!isAuthenticated || !user) {
      console.log('CreateUserStory: User not authenticated');
      Alert.alert('Login Required', 'Please log in to share your story');
      return;
    }

    if (!content.trim() && selectedMedia.length === 0) {
      console.log('CreateUserStory: No content or media provided');
      Alert.alert('Content Required', 'Please write something or add a photo to share');
      return;
    }

    if (storyType === 'review' && !selectedProductId) {
      console.log('CreateUserStory: No product selected for review');
      Alert.alert('Product Required', 'Please select a product for your review');
      return;
    }

    if (storyType === 'review' && rating === 0) {
      console.log('CreateUserStory: No rating provided for review');
      Alert.alert('Rating Required', 'Please provide a rating for the product');
      return;
    }

    console.log('CreateUserStory: Validation passed, creating story...');
    setLoading(true);

    try {
      const storyData: CreateUserStoryRequest = {
        content: content.trim(),
        type: storyType,
        rating: storyType === 'review' ? rating : undefined,
        productId: storyType === 'review' ? selectedProductId : undefined,
        media: selectedMedia,
        isLive,
        location: location.trim() || undefined,
        feeling: feeling.trim() || undefined,
        privacy,
        tags: tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
          .map(tag => tag.startsWith('#') ? tag : `#${tag}`),
      };

      console.log('CreateUserStory: Story data prepared:', storyData);
      await createStory(storyData);
      console.log('CreateUserStory: Story created successfully');
      
      handleClose();
      onStoryCreated?.(); // Navigate back to overview
    } catch (error) {
      console.error('CreateUserStory: Error creating story:', error);
      Alert.alert('Error', `Failed to post your story: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        <Text style={styles.ratingLabel}>Rating:</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Text
                style={[
                  styles.star,
                  { color: star <= rating ? '#FFD700' : '#ddd' }
                ]}
              >
                ⭐
              </Text>
            </Pressable>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingText}>({rating}/5)</Text>
        )}
      </View>
    );
  };

  if (!visible) return null;

  const windowWidth = Dimensions.get('window').width;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Modern Header */}
        <View style={styles.modernHeader}>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Create post</Text>
          <Pressable 
            style={[styles.postButton, (!content.trim() && !selectedMedia.length) && styles.postButtonDisabled]} 
            onPress={handleSubmit}
            disabled={loading || (!content.trim() && !selectedMedia.length)}
          >
            <Text style={[styles.postButtonText, (!content.trim() && !selectedMedia.length) && styles.postButtonTextDisabled]}>
              {loading ? 'Posting...' : 'Post'}
            </Text>
          </Pressable>
        </View>

        {/* User Profile Section */}
        <View style={styles.userSection}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
          ) : (
            <View style={styles.userAvatarPlaceholder}>
              <Text style={styles.userAvatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Coffee Lover'}</Text>
            <Pressable 
              style={styles.privacySelector}
              onPress={() => {
                const privacyOptions: Array<'public' | 'friends' | 'private'> = ['public', 'friends', 'private'];
                const currentIndex = privacyOptions.indexOf(privacy);
                const nextIndex = (currentIndex + 1) % privacyOptions.length;
                setPrivacy(privacyOptions[nextIndex]);
              }}
            >
              <Text style={styles.privacyText}>
                {privacy === 'public' && '🌍 Public'}
                {privacy === 'friends' && '👥 Friends'}
                {privacy === 'private' && '🔒 Private'}
              </Text>
              <Text style={styles.privacyArrow}>▼</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Main Content Input */}
          <View style={styles.contentSection}>
            <TextInput
              style={styles.mainInput}
              placeholder={`What's brewing, ${user?.name || 'Coffee Lover'}?`}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Media Preview */}
          {selectedMedia.length > 0 && (
            <View style={styles.mediaPreview}>
              <Text style={styles.mediaSectionTitle}>Photos & Videos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedMedia.map((media, index) => (
                  <View key={media.id} style={styles.mediaItem}>
                    <Image 
                      source={{ uri: media.url }} 
                      style={styles.mediaImage}
                      resizeMode="cover"
                      onError={(error) => {
                        console.log('Image load error:', error);
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', media.url);
                      }}
                    />
                    <Pressable 
                      style={styles.removeMediaButton}
                      onPress={() => removeMedia(media.id)}
                    >
                      <Text style={styles.removeMediaText}>×</Text>
                    </Pressable>
                    {media.type === 'video' && (
                      <View style={styles.videoIndicator}>
                        <Text style={styles.videoIcon}>▶️</Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Post Type Selection - Always Visible */}
          <View style={styles.postTypeSelector}>
            <View style={styles.typeToggle}>
              <Pressable
                style={[styles.typeChip, storyType === 'story' && styles.activeTypeChip]}
                onPress={() => setStoryType('story')}
              >
                <Text style={[styles.typeChipText, storyType === 'story' && styles.activeTypeChipText]}>💬 Story</Text>
              </Pressable>
              <Pressable
                style={[styles.typeChip, storyType === 'review' && styles.activeTypeChip]}
                onPress={() => setStoryType('review')}
              >
                <Text style={[styles.typeChipText, storyType === 'review' && styles.activeTypeChipText]}>⭐ Review</Text>
              </Pressable>
            </View>
          </View>

          {/* Product Review Section */}
          {storyType === 'review' && (
            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>Review a Product</Text>
              
              {/* Product Selection */}
              <View style={styles.productSelectionContainer}>
                <Text style={styles.productSelectionLabel}>Select Product:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
                  {products.map((product) => (
                    <Pressable
                      key={product.id}
                      style={[styles.productChip, selectedProductId === product.id && styles.selectedProductChip]}
                      onPress={() => setSelectedProductId(product.id)}
                    >
                      <Text style={[styles.productChipText, selectedProductId === product.id && styles.selectedProductChipText]}>
                        {product.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Rating Section */}
              <View style={styles.ratingSection}>
                <Text style={styles.ratingLabel}>Your Rating:</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable
                      key={star}
                      onPress={() => setRating(star)}
                      style={styles.starButton}
                    >
                      <Text
                        style={[
                          styles.reviewStar,
                          { color: star <= rating ? '#FFD700' : '#ddd' }
                        ]}
                      >
                        ⭐
                      </Text>
                    </Pressable>
                  ))}
                  <Text style={styles.ratingText}>
                    {rating > 0 ? `${rating}/5` : 'Tap to rate'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Post Options */}
          {showPostOptions && (
            <View style={styles.postOptionsContainer}>

              {/* Location */}
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>📍</Text>
                <TextInput
                  style={styles.optionInput}
                  placeholder="Add location"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>

              {/* Feeling/Activity */}
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>😊</Text>
                <TextInput
                  style={styles.optionInput}
                  placeholder="How are you feeling?"
                  value={feeling}
                  onChangeText={setFeeling}
                />
              </View>


              {/* Tags */}
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>#</Text>
                <TextInput
                  style={styles.optionInput}
                  placeholder="Add tags (coffee, morning, etc.)"
                  value={tags}
                  onChangeText={setTags}
                />
              </View>
            </View>
          )}

        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.actionBar}>
          <View style={styles.actionRow}>
            <Pressable style={styles.actionItem} onPress={handleAddPhoto}>
              <Text style={styles.actionIcon}>📷</Text>
              <Text style={styles.actionText}>Photo</Text>
            </Pressable>
            
            <Pressable style={styles.actionItem} onPress={handleAddVideo}>
              <Text style={styles.actionIcon}>🎥</Text>
              <Text style={styles.actionText}>Video</Text>
            </Pressable>
            
            <Pressable 
              style={styles.actionItem} 
              onPress={() => setShowPostOptions(!showPostOptions)}
            >
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionText}>Options</Text>
            </Pressable>
            
            <Pressable 
              style={[styles.actionItem, isLive && styles.liveActive]} 
              onPress={() => setIsLive(!isLive)}
            >
              <Text style={styles.actionIcon}>🔴</Text>
              <Text style={[styles.actionText, isLive && styles.liveText]}>Live</Text>
            </Pressable>
          </View>
        </View>

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modernHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#606770',
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1e21',
  },
  postButton: {
    backgroundColor: '#1877f2',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#e4e6ea',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  postButtonTextDisabled: {
    color: '#bcc0c4',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1877f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1e21',
  },
  privacySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  privacyText: {
    fontSize: 12,
    color: '#606770',
    fontWeight: '500',
  },
  privacyArrow: {
    fontSize: 10,
    color: '#606770',
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  contentSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mainInput: {
    fontSize: 16,
    color: '#1c1e21',
    lineHeight: 20,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  mediaPreview: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  mediaSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#050505',
    marginBottom: 8,
  },
  mediaItem: {
    position: 'relative',
    marginRight: 12,
  },
  mediaImage: {
    width: 200,
    height: 133, // 3:2 aspect ratio (200 * 2/3)
    borderRadius: 8,
    backgroundColor: '#f0f2f5',
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  videoIcon: {
    fontSize: 10,
  },
  // Review Section Styles
  postTypeSelector: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  reviewSection: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#050505',
    marginBottom: 16,
    textAlign: 'center',
  },
  productSelectionContainer: {
    marginBottom: 16,
  },
  productSelectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#050505',
    marginBottom: 8,
  },
  ratingSection: {
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#050505',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    padding: 4,
  },
  reviewStar: {
    fontSize: 24,
  },
  ratingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#65676b',
    fontWeight: '500',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  postOptionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e4e6ea',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 16,
    width: 30,
    textAlign: 'center',
  },
  optionInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1c1e21',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6ea',
    paddingVertical: 8,
  },
  typeToggle: {
    flexDirection: 'row',
    marginLeft: 12,
    gap: 8,
  },
  typeChip: {
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeTypeChip: {
    backgroundColor: '#1877f2',
  },
  typeChipText: {
    fontSize: 12,
    color: '#606770',
    fontWeight: '500',
  },
  activeTypeChipText: {
    color: '#fff',
  },
  productsScroll: {
    flex: 1,
    marginLeft: 12,
  },
  productChip: {
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedProductChip: {
    backgroundColor: '#1877f2',
  },
  productChipText: {
    fontSize: 12,
    color: '#606770',
    fontWeight: '500',
  },
  selectedProductChipText: {
    color: '#fff',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginLeft: 12,
    gap: 4,
  },
  ratingStar: {
    fontSize: 20,
  },
  actionBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e4e6ea',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#606770',
    fontWeight: '500',
  },
  liveActive: {
    backgroundColor: '#ffebee',
  },
  liveText: {
    color: '#e74c3c',
  },
});

export default CreateUserStory;