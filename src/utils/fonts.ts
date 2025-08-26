// This file provides backward compatibility for legacy font usage
// All new components should use designSystem.ts directly

import { Platform } from 'react-native';

// Legacy font configuration - now simplified
export const FontConfig = {
  regular: Platform.select({
    web: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    ios: '-apple-system',
    android: 'Roboto',
    default: 'System',
  }),
  heading: Platform.select({
    web: '"Playfair Display", "Times New Roman", serif',
    ios: 'Times New Roman',
    android: 'serif',
    default: 'serif',
  }),
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Legacy typography - simplified
export const Typography = {
  h1: { fontSize: 48, fontWeight: FontWeight.bold, fontFamily: FontConfig.heading },
  h2: { fontSize: 40, fontWeight: FontWeight.bold, fontFamily: FontConfig.heading },
  h3: { fontSize: 32, fontWeight: FontWeight.semibold, fontFamily: FontConfig.heading },
  h4: { fontSize: 24, fontWeight: FontWeight.semibold, fontFamily: FontConfig.heading },
  h5: { fontSize: 20, fontWeight: FontWeight.semibold, fontFamily: FontConfig.heading },
  h6: { fontSize: 18, fontWeight: FontWeight.semibold, fontFamily: FontConfig.heading },
  body: { fontSize: 16, fontWeight: FontWeight.regular, fontFamily: FontConfig.regular },
  bodySmall: { fontSize: 14, fontWeight: FontWeight.regular, fontFamily: FontConfig.regular },
  button: { fontSize: 16, fontWeight: FontWeight.semibold, fontFamily: FontConfig.regular },
  caption: { fontSize: 12, fontWeight: FontWeight.regular, fontFamily: FontConfig.regular },
};

export default FontConfig;