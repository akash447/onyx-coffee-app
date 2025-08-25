import { Platform } from 'react-native';

// Platform-specific font configuration
export const FontConfig = {
  // Body/UI fonts
  regular: Platform.select({
    ios: 'System', // SF Pro Text
    android: 'Roboto',
    web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    default: 'System',
  }),
  
  // Medium weight fonts
  medium: Platform.select({
    ios: 'System', // SF Pro Text Medium
    android: 'Roboto-Medium',
    web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    default: 'System',
  }),
  
  // Bold fonts
  bold: Platform.select({
    ios: 'System', // SF Pro Text Bold
    android: 'Roboto-Bold', 
    web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    default: 'System',
  }),
  
  // Heading fonts (optional enhanced fonts for web)
  heading: Platform.select({
    ios: 'System', // SF Pro Display
    android: 'Roboto',
    web: 'Sora, Manrope, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    default: 'System',
  }),
  
  // Hindi/Devanagari support
  hindi: Platform.select({
    ios: 'System', // iOS has built-in Devanagari support
    android: 'NotoSansDevanagari, Roboto',
    web: '"Noto Sans Devanagari", Hind, Mukta, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    default: 'System',
  }),
};

// Font weight configuration
export const FontWeight = {
  light: Platform.select({
    ios: '300',
    android: '300',
    web: '300',
    default: '300',
  }),
  regular: Platform.select({
    ios: '400',
    android: 'normal',
    web: '400',
    default: '400',
  }),
  medium: Platform.select({
    ios: '500',
    android: '500',
    web: '500',
    default: '500',
  }),
  semibold: Platform.select({
    ios: '600',
    android: '600',
    web: '600',
    default: '600',
  }),
  bold: Platform.select({
    ios: '700',
    android: 'bold',
    web: '700',
    default: '700',
  }),
  extrabold: Platform.select({
    ios: '800',
    android: '800',
    web: '800',
    default: '800',
  }),
  black: Platform.select({
    ios: '900',
    android: '900',
    web: '900',
    default: '900',
  }),
};

// Typography styles generator
export const createTypographyStyle = (
  fontSize: number,
  fontWeight: keyof typeof FontWeight = 'regular',
  fontFamily: keyof typeof FontConfig = 'regular',
  lineHeight?: number
) => ({
  fontSize,
  fontFamily: FontConfig[fontFamily],
  fontWeight: FontWeight[fontWeight],
  lineHeight: lineHeight || fontSize * 1.2,
});

// Pre-defined typography styles
export const Typography = {
  // Headings
  h1: createTypographyStyle(24, 'bold', 'heading', 28),
  h2: createTypographyStyle(20, 'bold', 'heading', 24),
  h3: createTypographyStyle(18, 'semibold', 'heading', 22),
  h4: createTypographyStyle(16, 'semibold', 'heading', 20),
  h5: createTypographyStyle(14, 'semibold', 'heading', 18),
  h6: createTypographyStyle(12, 'semibold', 'heading', 16),
  
  // Body text
  body: createTypographyStyle(14, 'regular', 'regular', 20),
  bodyMedium: createTypographyStyle(14, 'medium', 'medium', 20),
  bodySmall: createTypographyStyle(12, 'regular', 'regular', 16),
  bodyLarge: createTypographyStyle(16, 'regular', 'regular', 22),
  
  // UI Elements
  button: createTypographyStyle(14, 'semibold', 'medium', 16),
  caption: createTypographyStyle(10, 'regular', 'regular', 12),
  label: createTypographyStyle(11, 'medium', 'medium', 14),
  
  // Product specific
  productTitle: createTypographyStyle(14, 'medium', 'heading', 16),
  productDescription: createTypographyStyle(11, 'regular', 'regular', 14),
  productPrice: createTypographyStyle(11, 'bold', 'regular', 13),
  
  // Ratings
  rating: createTypographyStyle(8, 'medium', 'regular', 10),
};

export default FontConfig;