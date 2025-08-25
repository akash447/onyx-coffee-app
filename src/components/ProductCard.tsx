import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { CatalogItem } from '../types';
import { useCart } from '../contexts/CartContext';
import { Typography, FontConfig } from '../utils/fonts';

interface ProductCardProps {
  product: CatalogItem;
  onPress?: (product: CatalogItem) => void;
  variant?: 'grid' | 'recommendation';
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onPress, 
  variant = 'grid' 
}) => {
  const { addToCart } = useCart();

  const handleAddToCart = async (e: any) => {
    e.stopPropagation(); // Prevent card press when button is pressed
    try {
      await addToCart(product, 1);
      Alert.alert(
        '✅ Added to Cart!', 
        `${product.name} has been added to your cart.\n\nPrice: ₹${product.price}`, 
        [
          { text: 'Continue Shopping', style: 'default' },
          { text: 'View Cart', style: 'default', onPress: () => {
            // TODO: Navigate to cart
            console.log('Navigate to cart');
          }}
        ]
      );
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to add item to cart. Please try again.');
    }
  };

  const handleBuyNow = async (e: any) => {
    e.stopPropagation(); // Prevent card press when button is pressed
    try {
      await addToCart(product, 1);
      Alert.alert(
        '🚀 Quick Purchase!', 
        `${product.name}\nPrice: ₹${product.price}\n\nProceed to checkout?`, 
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'Proceed to Checkout', style: 'default', onPress: () => {
            // TODO: Navigate to checkout
            Alert.alert('🔄 Processing...', 'Redirecting to secure checkout...');
          }}
        ]
      );
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to process purchase. Please try again.');
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }

    if (hasHalfStar) {
      stars.push('⭐');
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push('☆');
    }

    return stars.join('');
  };

  const formatPrice = (price: number) => {
    return `₹${price}`;
  };

  if (variant === 'grid') {
    return (
      <Pressable
        style={styles.gridCard}
        onPress={() => onPress?.(product)}
      >
        {/* Product Image */}
        <View style={styles.gridImageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.gridImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.gridContent}>
          {/* Product Name and Rating Row */}
          <View style={styles.gridNameRatingRow}>
            <Text style={styles.gridProductName} numberOfLines={1}>
              {product.name}
            </Text>
            <View style={styles.gridRatingContainer}>
              <Text style={styles.gridStars}>{renderStars(product.rating)}</Text>
              <Text style={styles.gridRatingText}>({product.reviews})</Text>
            </View>
          </View>

          {/* Product Description */}
          <Text style={styles.gridDescription} numberOfLines={2} ellipsizeMode="tail">
            {product.desc}
          </Text>

          {/* Price */}
          <Text style={styles.gridPrice}>{formatPrice(product.price)}</Text>

          {/* Action Buttons */}
          <View style={styles.gridActionButtons}>
            <Pressable
              style={styles.gridBuyButton}
              onPress={handleBuyNow}
            >
              <Text style={styles.gridBuyButtonText}>Buy</Text>
            </Pressable>

            <Pressable
              style={styles.gridAddButton}
              onPress={handleAddToCart}
            >
              <Text style={styles.gridAddButtonText}>Add</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[
        styles.card,
        variant === 'recommendation' && styles.recommendationCard,
      ]}
      onPress={() => onPress?.(product)}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>

        {/* Rating and Reviews */}
        <View style={styles.ratingContainer}>
          <Text style={styles.stars}>{renderStars(product.rating)}</Text>
          <Text style={styles.ratingText}>({product.reviews})</Text>
        </View>

        {/* Price */}
        <Text style={styles.price}>{formatPrice(product.price)}</Text>

        {/* Description for recommendation variant */}
        {variant === 'recommendation' && (
          <Text style={styles.description} numberOfLines={2}>
            {product.desc}
          </Text>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={handleAddToCart}
          >
            <Text style={styles.secondaryButtonText}>Add</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={handleBuyNow}
          >
            <Text style={styles.primaryButtonText}>Buy</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // New Grid Card Styles (matching reference design)
  gridCard: {
    backgroundColor: '#E2D8A5',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  gridImageContainer: {
    width: '100%',
    aspectRatio: 1, // 1:1 square aspect ratio for better grid layout
    backgroundColor: '#E2D8A5',
    borderRadius: 8,
    borderWidth: 12,
    borderColor: '#e9ecef',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 2,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4, // Rounded corners for the image inside the frame
  },
  gridContent: {
    padding: 8,
  },
  gridNameRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 4,
  },
  gridProductName: {
    ...Typography.productTitle,
    color: '#000',
    flex: 1,
  },
  gridDescription: {
    ...Typography.productDescription,
    color: '#666',
    marginBottom: 4,
  },
  gridRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    flexShrink: 0,
  },
  gridStars: {
    fontSize: 10,
    color: '#ffa500',
  },
  gridRatingText: {
    ...Typography.rating,
    color: '#6c757d',
  },
  gridPrice: {
    ...Typography.productPrice,
    color: '#000',
    marginBottom: 4,
  },
  gridActionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  gridBuyButton: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 4,
    paddingVertical: 5,
    alignItems: 'center',
  },
  gridBuyButtonText: {
    ...Typography.button,
    color: 'white',
    fontSize: 10,
  },
  gridAddButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 4,
    paddingVertical: 5,
    alignItems: 'center',
  },
  gridAddButtonText: {
    ...Typography.button,
    color: '#000',
    fontSize: 10,
  },
  
  // Original Card Styles
  card: {
    backgroundColor: '#E2D8A5',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    marginBottom: 12,
  },
  recommendationCard: {
    padding: 16,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1, // Square aspect ratio
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...Typography.h5,
    color: '#000',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  stars: {
    fontSize: 12,
    color: '#ffa500',
  },
  ratingText: {
    ...Typography.bodySmall,
    color: '#666',
  },
  price: {
    ...Typography.bodyLarge,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    ...Typography.bodySmall,
    color: '#666',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 'auto',
  },
  button: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  primaryButton: {
    backgroundColor: '#000',
  },
  primaryButtonText: {
    ...Typography.button,
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000',
  },
  secondaryButtonText: {
    ...Typography.button,
    color: '#000',
  },
});

export default ProductCard;