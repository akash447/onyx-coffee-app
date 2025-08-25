import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
} from 'react-native';
import { RouteType, DeviceType, PlatformType, ProductTab, CatalogItem } from '../types';
import { useCatalog } from '../contexts/CatalogContext';
import TasteChatbot from '../components/TasteChatbot';
import ProductCard from '../components/ProductCard';

interface ProductSectionProps {
  deviceType: DeviceType;
  platformType: PlatformType;
  currentRoute: RouteType;
  onNavigate: (route: RouteType) => void;
}

const ProductSection: React.FC<ProductSectionProps> = ({
  deviceType,
  platformType,
  currentRoute,
  onNavigate,
}) => {
  const { items: products, loading } = useCatalog();
  const [activeTab, setActiveTab] = useState<ProductTab>('personal');
  const [selectedProduct, setSelectedProduct] = useState<CatalogItem | null>(null);

  const isDesktop = deviceType === 'desktop';
  const numColumns = isDesktop ? 4 : 2;

  // Handle tab changes
  const handleTabChange = (tab: ProductTab) => {
    setActiveTab(tab);
    if (tab === 'personal') {
      setSelectedProduct(null); // Exit SKU detail when switching to personal tab
    }
  };

  // Handle product selection
  const handleProductPress = (product: CatalogItem) => {
    setSelectedProduct(product);
    setActiveTab('explore'); // Switch to explore tab
    onNavigate({ kind: 'sku', skuId: product.id });
  };

  // Handle product recommendation from chatbot
  const handleProductRecommended = (product: CatalogItem) => {
    setSelectedProduct(product);
  };

  // Render product grid
  const renderProductGrid = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={products}
        numColumns={numColumns}
        key={numColumns} // Force re-render when columns change
        renderItem={({ item }) => (
          <View style={[styles.gridItem, { flex: 1, maxWidth: `${100 / numColumns}%` }]}>
            <ProductCard
              product={item}
              variant="grid"
              onPress={handleProductPress}
            />
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  // Render product detail view
  const renderProductDetail = () => {
    if (!selectedProduct) return null;

    return (
      <ScrollView style={styles.detailContainer} showsVerticalScrollIndicator={false}>
        {/* Breadcrumb for website */}
        {isDesktop && (
          <View style={styles.breadcrumb}>
            <Pressable onPress={() => setSelectedProduct(null)}>
              <Text style={styles.breadcrumbText}>Product</Text>
            </Pressable>
            <Text style={styles.breadcrumbSeparator}> / </Text>
            <Text style={styles.breadcrumbCurrent}>Details</Text>
          </View>
        )}

        {/* Back button for mobile */}
        {!isDesktop && (
          <Pressable 
            style={styles.backButton}
            onPress={() => setSelectedProduct(null)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
        )}

        {/* Product Detail */}
        <View style={styles.productDetail}>
          <ProductCard
            product={selectedProduct}
            variant="recommendation"
            onPress={() => {}} // No action needed for detail view
          />

          {/* Additional product information */}
          <View style={styles.additionalInfo}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <Text style={styles.productDescription}>
              {selectedProduct.desc}
            </Text>

            {selectedProduct.flavorNotes && (
              <View style={styles.flavorNotes}>
                <Text style={styles.subSectionTitle}>Flavor Notes</Text>
                <View style={styles.notesList}>
                  {selectedProduct.flavorNotes.map((note, index) => (
                    <View key={index} style={styles.noteChip}>
                      <Text style={styles.noteText}>{note}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Placeholder for reviews */}
            <View style={styles.reviewsSection}>
              <Text style={styles.subSectionTitle}>Customer Reviews</Text>
              <Text style={styles.placeholderText}>
                Reviews and comments will appear here. Connect to your backend to load real reviews.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  // Render tab content
  const renderTabContent = () => {
    if (activeTab === 'personal') {
      return (
        <TasteChatbot
          onProductRecommended={handleProductRecommended}
          onProductPress={handleProductPress}
        />
      );
    }

    // For explore tab, show product detail if selected, otherwise show grid
    if (selectedProduct && currentRoute.kind === 'sku') {
      return renderProductDetail();
    }

    return renderProductGrid();
  };

  return (
    <View style={styles.container}>
      {/* Section Title */}
      <Text style={[
        styles.sectionTitle,
        isDesktop ? styles.desktopSectionTitle : styles.mobileSectionTitle
      ]}>
        Coffee Products
      </Text>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'personal' && styles.activeTab,
          ]}
          onPress={() => handleTabChange('personal')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'personal' && styles.activeTabText,
          ]}>
            Product for you
          </Text>
          {activeTab === 'personal' && <View style={styles.tabUnderline} />}
        </Pressable>

        <Pressable
          style={[
            styles.tab,
            activeTab === 'explore' && styles.activeTab,
          ]}
          onPress={() => handleTabChange('explore')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'explore' && styles.activeTabText,
          ]}>
            Explore other products
          </Text>
          {activeTab === 'explore' && <View style={styles.tabUnderline} />}
        </Pressable>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  desktopSectionTitle: {
    fontSize: 24,
  },
  mobileSectionTitle: {
    fontSize: 18,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 24,
    position: 'relative',
  },
  activeTab: {
    // Active state handled by underline
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: '#000',
  },
  tabContent: {
    flex: 1,
  },
  exploreContainer: {
    paddingVertical: 8,
  },
  exploreItem: {
    marginBottom: 12,
  },
  listContainer: {
    paddingVertical: 8,
  },
  listItem: {
    marginBottom: 12,
  },
  gridContainer: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  gridItem: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    minWidth: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  detailContainer: {
    flex: 1,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#007AFF',
  },
  breadcrumbSeparator: {
    fontSize: 14,
    color: '#666',
  },
  breadcrumbCurrent: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  productDetail: {
    gap: 24,
  },
  additionalInfo: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  productDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 16,
  },
  flavorNotes: {
    marginBottom: 20,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  notesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noteChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  noteText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  reviewsSection: {
    marginTop: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default ProductSection;