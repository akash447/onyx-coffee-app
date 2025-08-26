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
} from 'react-native';
import { CreateUserStoryRequest } from '../types/UserStory';
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
  const [loading, setLoading] = useState(false);

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
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      Alert.alert('Login Required', 'Please log in to share your story');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Content Required', 'Please write something to share');
      return;
    }

    if (storyType === 'review' && !selectedProductId) {
      Alert.alert('Product Required', 'Please select a product for your review');
      return;
    }

    if (storyType === 'review' && rating === 0) {
      Alert.alert('Rating Required', 'Please provide a rating for the product');
      return;
    }

    setLoading(true);

    try {
      const storyData: CreateUserStoryRequest = {
        content: content.trim(),
        type: storyType,
        rating: storyType === 'review' ? rating : undefined,
        productId: storyType === 'review' ? selectedProductId : undefined,
        isLive,
        tags: tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
          .map(tag => tag.startsWith('#') ? tag : `#${tag}`),
      };

      await createStory(storyData);
      
      handleClose();
      onStoryCreated?.(); // Navigate back to overview
    } catch (error) {
      console.error('Error creating story:', error);
      Alert.alert('Error', 'Failed to post your story. Please try again.');
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Share Your Story</Text>
          <Pressable onPress={handleClose}>
            <Text style={styles.closeButton}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Story Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Story Type</Text>
            <View style={styles.typeToggle}>
              <Pressable
                style={[
                  styles.typeButton,
                  storyType === 'story' && styles.activeTypeButton
                ]}
                onPress={() => setStoryType('story')}
              >
                <Text style={[
                  styles.typeButtonText,
                  storyType === 'story' && styles.activeTypeButtonText
                ]}>
                  💬 Story
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.typeButton,
                  storyType === 'review' && styles.activeTypeButton
                ]}
                onPress={() => setStoryType('review')}
              >
                <Text style={[
                  styles.typeButtonText,
                  storyType === 'review' && styles.activeTypeButtonText
                ]}>
                  📝 Review
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Content Input */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {storyType === 'review' ? 'Your Review' : 'Your Story'}
            </Text>
            <TextInput
              style={styles.contentInput}
              placeholder={
                storyType === 'review'
                  ? 'Share your experience with this product...'
                  : 'What\'s brewing? Share your coffee journey...'
              }
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Product Selection (for reviews) */}
          {storyType === 'review' && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Select Product</Text>
              {products.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.productsContainer}>
                    {products.map((product) => (
                      <Pressable
                        key={product.id}
                        style={[
                          styles.productCard,
                          selectedProductId === product.id && styles.selectedProductCard
                        ]}
                        onPress={() => setSelectedProductId(product.id)}
                      >
                        <Text style={[
                          styles.productName,
                          selectedProductId === product.id && styles.selectedProductName
                        ]}>
                          {product.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <Text style={styles.noProductsText}>No products available for review</Text>
              )}
            </View>
          )}

          {/* Rating (for reviews) */}
          {storyType === 'review' && renderStars()}

          {/* Live Toggle */}
          <View style={styles.section}>
            <View style={styles.liveToggle}>
              <View>
                <Text style={styles.liveLabel}>🔴 Live Story</Text>
                <Text style={styles.liveDescription}>
                  Mark as live to show it's happening right now
                </Text>
              </View>
              <Switch
                value={isLive}
                onValueChange={setIsLive}
                trackColor={{ false: '#ddd', true: '#e74c3c' }}
                thumbColor={isLive ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Tags Input */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tags (optional)</Text>
            <TextInput
              style={styles.tagsInput}
              placeholder="coffee, brewing, morning (separate with commas)"
              value={tags}
              onChangeText={setTags}
            />
            <Text style={styles.tagsHelper}>
              Add tags to help others discover your story
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable
            style={styles.cancelButton}
            onPress={handleClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          
          <Pressable
            style={[styles.postButton, loading && styles.postButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.postButtonText}>
              {loading ? 'Posting...' : isLive ? '🔴 Post Live' : 'Post Story'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2D8A5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    ...Typography.h2,
    color: '#000',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    paddingHorizontal: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionLabel: {
    ...Typography.h5,
    color: '#000',
    marginBottom: 8,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTypeButton: {
    backgroundColor: '#000',
  },
  typeButtonText: {
    ...Typography.button,
    color: '#666',
  },
  activeTypeButtonText: {
    color: '#fff',
  },
  contentInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    ...FontConfig.regular,
    minHeight: 120,
  },
  productsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  productCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 120,
  },
  selectedProductCard: {
    borderColor: '#000',
    backgroundColor: '#f8f9fa',
  },
  productName: {
    ...Typography.body,
    color: '#000',
    textAlign: 'center',
  },
  selectedProductName: {
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingLabel: {
    ...Typography.body,
    color: '#000',
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 24,
  },
  ratingText: {
    ...Typography.caption,
    color: '#666',
  },
  liveToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  liveLabel: {
    ...Typography.h5,
    color: '#000',
    marginBottom: 4,
  },
  liveDescription: {
    ...Typography.caption,
    color: '#666',
  },
  tagsInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    ...FontConfig.regular,
  },
  tagsHelper: {
    ...Typography.caption,
    color: '#666',
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
  },
  cancelButtonText: {
    ...Typography.button,
    color: '#000',
  },
  postButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#000',
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    ...Typography.button,
    color: '#fff',
  },
  noProductsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default CreateUserStory;