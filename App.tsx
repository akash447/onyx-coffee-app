import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
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
import Banner from './src/components/Banner';
import SideRail from './src/components/SideRail';
import ProductSection from './src/screens/ProductSection';
import FontLoader from './src/components/FontLoader';
import CommunitySection from './src/screens/CommunitySection';
import AboutSection from './src/screens/AboutSection';
import AdminSection from './src/screens/AdminSection';
import CartSection from './src/screens/CartSection';

// Types
import { RouteType, DeviceType, PlatformType } from './src/types';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<RouteType>({ 
    kind: 'section', 
    section: 'product' 
  });
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

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
  const isDesktop = deviceType === 'desktop';

  // Calculate layout dimensions
  const railWidth = isDesktop ? 180 : 84;
  const contentWidth = dimensions.width - railWidth;
  const gap = isDesktop ? 24 : 12;

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

  const handleScrollToSection = (section: string) => {
    // For desktop: smooth scroll to section
    console.log(`Scrolling to section: ${section}`);
    setCurrentRoute({ kind: 'section', section: section as any });
  };

  // Render current section content
  const renderContent = () => {
    switch (currentRoute.kind) {
      case 'section':
        switch (currentRoute.section) {
          case 'product':
            return (
              <ProductSection
                deviceType={deviceType}
                platformType={platformType}
                currentRoute={currentRoute}
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
          default:
            return <ProductSection deviceType={deviceType} platformType={platformType} currentRoute={currentRoute} onNavigate={handleNavigate} />;
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
        return <ProductSection deviceType={deviceType} platformType={platformType} currentRoute={currentRoute} onNavigate={handleNavigate} />;
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
                
                {/* Banner */}
                <Banner 
                  deviceType={deviceType} 
                  onCartPress={handleCartPress}
                />

                {/* Main Content Area */}
                <View style={[styles.mainContent, { gap }]}>
                  {/* Side Rail */}
                  <SideRail
                    deviceType={deviceType}
                    currentRoute={currentRoute}
                    onNavigate={handleNavigate}
                    onScrollToSection={isDesktop ? handleScrollToSection : undefined}
                  />

                  {/* Content Area */}
                  <View style={[styles.contentArea, { width: contentWidth }]}>
                    {renderContent()}
                  </View>
                </View>
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
    backgroundColor: '#E2D8A5',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  contentArea: {
    flex: 1,
  },
});
