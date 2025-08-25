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
          <Text style={styles.gridProductName} numberOfLines={1}>
            {product.name}
          </Text>

          {/* Product Description */}
          <Text style={styles.gridDescription} numberOfLines={2}>
            {product.desc}
          </Text>

          {/* Rating and Reviews */}
          <View style={styles.gridRatingContainer}>
            <Text style={styles.gridStars}>{renderStars(product.rating)}</Text>
            <Text style={styles.gridRatingText}>({product.reviews})</Text>
          </View>

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
    backgroundColor: 'white',
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
    backgroundColor: '#f8f9fa',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridContent: {
    padding: 6,
  },
  gridProductName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
    lineHeight: 14,
  },
  gridDescription: {
    fontSize: 9,
    color: '#666',
    lineHeight: 12,
    marginBottom: 3,
  },
  gridRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    gap: 2,
  },
  gridStars: {
    fontSize: 10,
    color: '#ffa500',
  },
  gridRatingText: {
    fontSize: 9,
    color: '#6c757d',
  },
  gridPrice: {
    fontSize: 11,
    fontWeight: '700',
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
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
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
    color: '#000',
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Original Card Styles
  card: {
    backgroundColor: 'white',
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
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 12,
    color: '#666',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
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
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000',
  },
  secondaryButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ProductCard;