import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Platform,
} from 'react-native';
import { Colors, Typography, Spacing, Layout, createTypographyStyle } from '../utils/designSystem';

interface HeroSectionProps {
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

const HeroSection: React.FC<HeroSectionProps> = ({ deviceType }) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';

  // Use full viewport height
  const heroHeight = screenHeight;
  
  // Responsive measurements
  const containerPadding = isMobile ? Spacing.lg : isTablet ? Spacing.xl : Spacing.xxl;
  const maxWidth = Math.min(screenWidth - (containerPadding * 2), Layout.maxWidth);

  return (
    <View style={[styles.container, { height: heroHeight }]}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600&h=900&fit=crop&crop=center'
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
        accessible={false}
      >
        {/* Light Overlay for readability */}
        <View style={styles.overlay} />
        
        {/* Hero Content - Centered */}
        <View style={[styles.contentContainer, { paddingHorizontal: containerPadding }]}>
          <View style={[styles.content, { maxWidth }]}>
            {/* Main Headline */}
            <Text 
              style={[
                styles.headline,
                isMobile && styles.headlineMobile,
                isTablet && styles.headlineTablet,
                isDesktop && styles.headlineDesktop
              ]}
              accessibilityRole="header"
            >
              Discover Your Perfect{'\n'}Coffee Match
            </Text>

            {/* Updated Subcopy */}
            <Text 
              style={[
                styles.subcopy,
                isMobile && styles.subcopeMobile,
                isTablet && styles.subcopyTablet,
                isDesktop && styles.subcopyDesktop
              ]}
            >
              From single-origin beans to expertly crafted blends, find the flavors that speak to your soul through our personalized taste chatbot.
            </Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },

  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)', // Lighter overlay for better readability
  },

  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
  },

  // Headlines - Responsive Typography
  headline: {
    ...createTypographyStyle('h1', 'serif', Colors.text.inverse),
    textAlign: 'center',
    marginBottom: Spacing.lg,
    ...(Platform.OS === 'web' && { textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }),
  },

  headlineMobile: {
    fontSize: 32,
    lineHeight: 38,
    marginBottom: Spacing.md,
  },

  headlineTablet: {
    fontSize: 40,
    lineHeight: 48,
    marginBottom: Spacing.lg,
  },

  headlineDesktop: {
    fontSize: 48,
    lineHeight: 56,
    marginBottom: Spacing.xl,
  },

  // Subcopy - Responsive Typography
  subcopy: {
    ...createTypographyStyle('bodyLarge', 'sansSerif', Colors.text.inverse),
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    opacity: 0.9,
    maxWidth: 600,
    ...(Platform.OS === 'web' && { textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }),
  },

  subcopeMobile: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },

  subcopyTablet: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },

  subcopyDesktop: {
    fontSize: 20,
    lineHeight: 32,
    marginBottom: Spacing.xxxl,
  },

});

export default HeroSection;