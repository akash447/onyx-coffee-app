import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Context Providers
import { AuthProvider } from './src/contexts/AuthContext';
import { CatalogProvider } from './src/contexts/CatalogContext';
import { CartProvider } from './src/contexts/CartContext';
import { ContentProvider } from './src/contexts/ContentContext';
import { UserStoriesProvider } from './src/contexts/UserStoriesContext';
import { ProfileProvider } from './src/contexts/ProfileContext';

// Components
import TopNavigation from './src/components/TopNavigation';
import HeroSection from './src/components/HeroSection';
import TasteQuiz from './src/components/TasteQuiz';
import ProductDiscoveryGrid from './src/components/ProductDiscoveryGrid';
import ProductSection from './src/screens/ProductSection';
import FontLoader from './src/components/FontLoader';
import CommunitySection from './src/screens/CommunitySection';
import AboutSection from './src/screens/AboutSection';
import AdminSection from './src/screens/AdminSection';
import CartSection from './src/screens/CartSection';
import ProfileSection from './src/screens/ProfileSection';

// Types
import { RouteType, DeviceType, PlatformType } from './src/types';
import { Colors, Spacing } from './src/utils/designSystem';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<RouteType>({ 
    kind: 'section', 
    section: 'home' 
  });
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [showTasteQuiz, setShowTasteQuiz] = useState(false);

  // Update dimensions on screen size change
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  // Determine device type based on screen width
  const getDeviceType = (): DeviceType => {
    const { width } = dimensions;
    if (width >= 1024) return 'desktop';
    if (width >= 768) return 'tablet';
    return 'mobile';
  };

  // Determine platform type
  const getPlatformType = (): PlatformType => {
    if (Platform.OS === 'ios') return 'ios';
    if (Platform.OS === 'android') return 'android';
    return 'web';
  };

  const deviceType = getDeviceType();
  const platformType = getPlatformType();

  // Navigation handlers
  const handleNavigate = (route: RouteType) => {
    setCurrentRoute(route);
  };

  const handleCartPress = () => {
    setCurrentRoute({ kind: 'section', section: 'cart' });
  };

  const handleBackToShopping = () => {
    setCurrentRoute({ kind: 'section', section: 'product' });
  };


  const handleProductPress = (product: any) => {
    setCurrentRoute({ kind: 'sku', product: product.id });
  };

  // Render homepage content
  const renderHomepage = () => (
    <ScrollView style={styles.homepage}>
      {/* Full-height Hero Section */}
      <HeroSection
        deviceType={deviceType}
      />
      
      {/* Coffee Taste Assistant Section */}
      <View style={styles.tasteAssistantSection}>
        <TasteQuiz
          deviceType={deviceType}
          onProductRecommended={(product) => console.log('Recommended:', product)}
          onProductPress={handleProductPress}
          isModal={false}
          title="Product for You: Coffee Taste Assistant"
        />
      </View>
      
      {/* Product for You Section */}
      <View style={styles.productForYouSection}>
        <ProductDiscoveryGrid
          deviceType={deviceType}
          onProductPress={handleProductPress}
          maxItems={6}
          title="Recommended Products"
        />
      </View>
    </ScrollView>
  );

  // Render current section content
  const renderContent = () => {
    switch (currentRoute.kind) {
      case 'section':
        switch (currentRoute.section) {
          case 'product':
            // When clicking Product from navigation, show explore section
            return (
              <ProductSection
                deviceType={deviceType}
                platformType={platformType}
                currentRoute={{ ...currentRoute, view: 'explore' }}
                onNavigate={handleNavigate}
              />
            );
          case 'community':
            return (
              <CommunitySection
                deviceType={deviceType}
                platformType={platformType}
                onNavigate={handleNavigate}
              />
            );
          case 'about':
            return (
              <AboutSection
                deviceType={deviceType}
                platformType={platformType}
              />
            );
          case 'admin':
            return (
              <AdminSection
                deviceType={deviceType}
                platformType={platformType}
              />
            );
          case 'cart':
            return (
              <CartSection
                deviceType={deviceType}
                platformType={platformType}
                onBackToShopping={handleBackToShopping}
              />
            );
          case 'profile':
            return (
              <ProfileSection />
            );
          case 'home':
          default:
            return renderHomepage();
        }
      case 'sku':
        return (
          <ProductSection
            deviceType={deviceType}
            platformType={platformType}
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
          />
        );
      case 'communityPage':
        return (
          <CommunitySection
            deviceType={deviceType}
            platformType={platformType}
            onNavigate={handleNavigate}
          />
        );
      default:
        return renderHomepage();
    }
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <CatalogProvider>
            <CartProvider>
              <ContentProvider>
                <UserStoriesProvider>
                  <ProfileProvider>
                    <FontLoader />
                    <SafeAreaView style={styles.container}>
                      <StatusBar 
                        barStyle="dark-content" 
                        backgroundColor="transparent" 
                        translucent 
                      />
                      
                      {/* Top Navigation */}
                      <TopNavigation
                        currentRoute={currentRoute}
                        onNavigate={handleNavigate}
                        onCartPress={handleCartPress}
                        deviceType={deviceType}
                      />

                      {/* Main Content */}
                      <View style={styles.mainContent}>
                        {renderContent()}
                      </View>

                      {/* Mobile Taste Quiz Modal */}
                      {deviceType === 'mobile' && (
                        <TasteQuiz
                          deviceType={deviceType}
                          onProductRecommended={(product) => console.log('Recommended:', product)}
                          onProductPress={handleProductPress}
                          isModal={true}
                          visible={showTasteQuiz}
                          onClose={() => setShowTasteQuiz(false)}
                        />
                      )}
                    </SafeAreaView>
                  </ProfileProvider>
                </UserStoriesProvider>
              </ContentProvider>
            </CartProvider>
          </CatalogProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.surface.secondary, // Warm off-white background
  },
  mainContent: {
    flex: 1,
    backgroundColor: Colors.surface.secondary,
  },
  homepage: {
    flex: 1,
    backgroundColor: Colors.surface.secondary,
  },
  
  tasteAssistantSection: {
    backgroundColor: Colors.surface.secondary,
    paddingVertical: Spacing.xl,
  },
  
  productForYouSection: {
    backgroundColor: Colors.surface.secondary,
    minHeight: 600, // Ensure sufficient space for product grid
  },
});
