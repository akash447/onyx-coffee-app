import { Platform } from 'react-native';

// Color Palette
export const Colors = {
  // Primary Colors
  primary: '#7B5F35', // Coffee brown
  accent: '#F3C37A', // Butter amber
  
  // Text Colors
  text: {
    primary: '#1E1A16',
    secondary: '#333333',
    tertiary: '#6B6B6B',
    inverse: '#FFFFFF',
  },
  
  // Surface Colors
  surface: {
    primary: '#FFFFFF',
    secondary: '#F7F3E8', // Warm off-white
    overlay: 'rgba(0, 0, 0, 0.4)', // Dark overlay for hero
  },
  
  // Semantic Colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Interactive States
  interactive: {
    hover: '#6B4B2F',
    focus: '#5C3F24',
    active: '#4D331E',
  }
};

// Typography System
export const Typography = {
  // Font Families
  fonts: {
    serif: Platform.select({
      web: '"Playfair Display", "Times New Roman", serif',
      ios: 'Times New Roman',
      android: 'serif',
      default: 'serif',
    }),
    sansSerif: Platform.select({
      web: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      ios: '-apple-system',
      android: 'Roboto',
      default: 'System',
    }),
  },
  
  // Font Weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
  
  // Typography Scale
  scale: {
    // Headings (Serif)
    h1: {
      fontSize: 48,
      lineHeight: 56,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 40,
      lineHeight: 48,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '600' as const,
      letterSpacing: -0.25,
    },
    h4: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    h5: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    h6: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    
    // Body Text (Sans-serif)
    bodyLarge: {
      fontSize: 18,
      lineHeight: 28,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    bodySmall: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    
    // UI Text
    button: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600' as const,
      letterSpacing: 0.5,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as const,
      letterSpacing: 0.5,
    },
    overline: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '600' as const,
      letterSpacing: 1,
      textTransform: 'uppercase' as const,
    },
  },
};

// Spacing System (8pt grid)
export const Spacing = {
  xs: 4,   // 0.5 units
  sm: 8,   // 1 unit
  md: 16,  // 2 units
  lg: 24,  // 3 units
  xl: 32,  // 4 units
  xxl: 48, // 6 units
  xxxl: 64, // 8 units
};

// Border Radius
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Shadows
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
};

// Layout Constants
export const Layout = {
  maxWidth: 1200, // Container max width
  headerHeight: 64, // Sticky header height
  minTouchTarget: 44, // Minimum touch target size
  
  // Breakpoints
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
  },
};

// Helper function to create typography styles
export const createTypographyStyle = (
  variant: keyof typeof Typography.scale,
  fontFamily: 'serif' | 'sansSerif' = 'sansSerif',
  color: string = Colors.text.primary
) => {
  const scale = Typography.scale[variant];
  return {
    fontFamily: Typography.fonts[fontFamily],
    fontSize: scale.fontSize,
    lineHeight: scale.lineHeight,
    fontWeight: scale.fontWeight,
    letterSpacing: scale.letterSpacing,
    color,
  };
};

// Helper function for responsive spacing
export const getResponsiveSpacing = (
  mobile: keyof typeof Spacing,
  tablet?: keyof typeof Spacing,
  desktop?: keyof typeof Spacing
) => {
  return {
    mobile: Spacing[mobile],
    tablet: Spacing[tablet || mobile],
    desktop: Spacing[desktop || tablet || mobile],
  };
};

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Layout,
  createTypographyStyle,
  getResponsiveSpacing,
};