import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { CatalogItem } from '../types';
import { useCatalog } from '../contexts/CatalogContext';
import { useCart } from '../contexts/CartContext';
import { Colors, Typography, Spacing, Layout, BorderRadius, Shadows, createTypographyStyle } from '../utils/designSystem';

interface ProductDiscoveryGridProps {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  onProductPress: (product: CatalogItem) => void;
  maxItems?: number;
  title?: string;
}

interface ProductCardProps {
  product: CatalogItem;
  onPress: (product: CatalogItem) => void;
  onAddToCart: (product: CatalogItem) => void;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

const SkeletonLoader: React.FC<{ deviceType: 'mobile' | 'tablet' | 'desktop' }> = ({ deviceType }) => {
  const isMobile = deviceType === 'mobile';
  const cardHeight = isMobile ? 320 : 360;
  const imageHeight = isMobile ? 180 : 220;

  return (
    <View style={[styles.productCard, { height: cardHeight }]}>
      <View style={[styles.skeletonImage, { height: imageHeight }]} />
      <View style={styles.cardContent}>
        <View style={[styles.skeletonLine, styles.skeletonTitle]} />
        <View style={[styles.skeletonLine, styles.skeletonDescription]} />
        <View style={styles.cardFooter}>
          <View style={[styles.skeletonLine, styles.skeletonPrice]} />
          <View style={[styles.skeletonButton]} />
        </View>
      </View>
    </View>
  );
};

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onPress, 
  onAddToCart, 
  deviceType 
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const isMobile = deviceType === 'mobile';
  const cardHeight = isMobile ? 320 : 360;
  const imageHeight = isMobile ? 180 : 220;

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  const formatRating = (rating: number, reviewCount: number) => {
    return `⭐ ${rating.toFixed(1)} (${reviewCount})`;
  };

  return (
    <Pressable
      style={[styles.productCard, { height: cardHeight }]}
      onPress={() => onPress(product)}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatPrice(product.price)}`}
    >
      {/* Product Image */}
      <View style={[styles.imageContainer, { height: imageHeight }]}>
        {imageLoading && !imageError && (
          <View style={styles.imageLoader}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        )}
        
        {!imageError ? (
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>☕</Text>
          </View>
        )}

        {/* Quality Badge */}
        {product.tags?.includes('premium') && (
          <View style={styles.qualityBadge}>
            <Text style={styles.qualityBadgeText}>Premium</Text>
          </View>
        )}
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        {/* Product Name */}
        <Text 
          style={styles.productName}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {product.name}
        </Text>

        {/* Flavor Notes */}
        <Text 
          style={styles.flavorNotes}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {product.desc || 'Rich, full-bodied coffee with notes of chocolate and caramel'}
        </Text>

        {/* Rating */}
        {product.rating > 0 && (
          <Text style={styles.rating}>
            {formatRating(product.rating, product.reviews)}
          </Text>
        )}

        {/* Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          
          <Pressable
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Add ${product.name} to cart`}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

const ProductDiscoveryGrid: React.FC<ProductDiscoveryGridProps> = ({
  deviceType,
  onProductPress,
  maxItems = 4,
  title = "Recommended for You",
}) => {
  const { items: allProducts, loading } = useCatalog();
  const { addItem: addToCart } = useCart();
  const [products, setProducts] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { width: screenWidth } = Dimensions.get('window');
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';

  // Calculate responsive grid
  const containerPadding = isMobile ? Spacing.md : Spacing.lg;
  const cardGap = Spacing.md;
  
  const getColumnsCount = () => {
    if (isMobile) return 2;
    if (isTablet) return 3;
    return 4;
  };

  const getCardWidth = () => {
    const availableWidth = Math.min(screenWidth - (containerPadding * 2), Layout.maxWidth);
    const columns = getColumnsCount();
    const totalGap = cardGap * (columns - 1);
    return (availableWidth - totalGap) / columns;
  };

  const columns = getColumnsCount();
  const cardWidth = getCardWidth();

  useEffect(() => {
    const getRecommendedProducts = () => {
      setIsLoading(true);
      
      // Simulate loading delay for better UX
      setTimeout(() => {
        if (allProducts.length > 0) {
          // Get top-rated and featured products
          const sortedProducts = [...allProducts]
            .filter(product => product.rating >= 4.0) // High-rated products
            .sort((a, b) => {
              // Prioritize premium products and ratings
              const aScore = (a.tags?.includes('premium') ? 1 : 0) + a.rating;
              const bScore = (b.tags?.includes('premium') ? 1 : 0) + b.rating;
              return bScore - aScore;
            })
            .slice(0, maxItems);
          
          setProducts(sortedProducts);
        }
        setIsLoading(false);
      }, 800);
    };

    getRecommendedProducts();
  }, [allProducts, maxItems]);

  const handleAddToCart = (product: CatalogItem) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      variant: '250g', // Default variant
    });
  };

  const renderSkeletons = () => {
    return Array.from({ length: maxItems }, (_, index) => (
      <SkeletonLoader key={`skeleton-${index}`} deviceType={deviceType} />
    ));
  };

  const renderProducts = () => {
    return products.map((product, index) => (
      <ProductCard
        key={product.id}
        product={product}
        onPress={onProductPress}
        onAddToCart={handleAddToCart}
        deviceType={deviceType}
      />
    ));
  };

  return (
    <View style={[styles.container, { paddingHorizontal: containerPadding }]}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          Curated selections based on quality and customer favorites
        </Text>
      </View>

      {/* Product Grid */}
      <View 
        style={[
          styles.grid,
          {
            gap: cardGap,
          },
          isMobile && styles.gridMobile,
          isTablet && styles.gridTablet,
          isDesktop && styles.gridDesktop,
        ]}
      >
        {isLoading || loading ? renderSkeletons() : renderProducts()}
      </View>

      {/* View All Link */}
      {products.length > 0 && (
        <View style={styles.footer}>
          <Pressable
            style={styles.viewAllButton}
            onPress={() => {
              // Navigate to full product catalog
              // This would be handled by parent component
            }}
            accessibilityRole="button"
            accessibilityLabel="View all products"
          >
            <Text style={styles.viewAllText}>View All Products →</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xxl,
    maxWidth: Layout.maxWidth,
    alignSelf: 'center',
    width: '100%',
  },

  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },

  title: {
    ...createTypographyStyle('h3', 'serif', Colors.text.primary),
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  subtitle: {
    ...createTypographyStyle('body', 'sansSerif', Colors.text.secondary),
    textAlign: 'center',
    maxWidth: 500,
  },

  // Grid Layout
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  gridMobile: {
    justifyContent: 'space-between',
  },

  gridTablet: {
    justifyContent: 'flex-start',
  },

  gridDesktop: {
    justifyContent: 'flex-start',
  },

  // Product Card
  productCard: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    width: '48%', // Will be overridden by calculated width
  },

  imageContainer: {
    position: 'relative',
    backgroundColor: Colors.surface.secondary,
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  imageLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface.secondary,
  },

  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface.secondary,
  },

  imagePlaceholderText: {
    fontSize: 32,
    opacity: 0.5,
  },

  qualityBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },

  qualityBadgeText: {
    ...createTypographyStyle('caption', 'sansSerif', Colors.primary),
    fontWeight: Typography.weights.bold,
    fontSize: 10,
  },

  cardContent: {
    padding: Spacing.md,
    flex: 1,
    justifyContent: 'space-between',
  },

  productName: {
    ...createTypographyStyle('h6', 'sansSerif', Colors.text.primary),
    marginBottom: Spacing.xs,
    fontWeight: Typography.weights.semiBold,
  },

  flavorNotes: {
    ...createTypographyStyle('bodySmall', 'sansSerif', Colors.text.tertiary),
    marginBottom: Spacing.sm,
    flex: 1,
  },

  rating: {
    ...createTypographyStyle('caption', 'sansSerif', Colors.text.secondary),
    marginBottom: Spacing.sm,
    fontSize: 12,
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  price: {
    ...createTypographyStyle('body', 'sansSerif', Colors.text.primary),
    fontWeight: Typography.weights.bold,
    fontSize: 18,
  },

  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },

  addButtonText: {
    ...createTypographyStyle('bodySmall', 'sansSerif', Colors.text.inverse),
    fontWeight: Typography.weights.semiBold,
  },

  // Skeleton Styles
  skeletonImage: {
    backgroundColor: '#E0E0E0',
    opacity: 0.7,
  },

  skeletonLine: {
    backgroundColor: '#E0E0E0',
    borderRadius: BorderRadius.sm,
    opacity: 0.7,
  },

  skeletonTitle: {
    height: 20,
    marginBottom: Spacing.xs,
    width: '80%',
  },

  skeletonDescription: {
    height: 14,
    marginBottom: Spacing.sm,
    width: '100%',
  },

  skeletonPrice: {
    height: 18,
    width: '40%',
  },

  skeletonButton: {
    height: 36,
    width: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: '#E0E0E0',
    opacity: 0.7,
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },

  viewAllButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },

  viewAllText: {
    ...createTypographyStyle('body', 'sansSerif', Colors.primary),
    fontWeight: Typography.weights.medium,
  },
});

export default ProductDiscoveryGrid;