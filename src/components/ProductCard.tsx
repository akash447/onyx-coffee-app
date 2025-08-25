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
    aspectRatio: 1, // Square aspect ratio as specified
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