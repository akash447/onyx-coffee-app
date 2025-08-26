import { useEffect } from 'react';
import { Platform } from 'react-native';

const FontLoader = () => {
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Load Google Fonts for web platform
      const loadFonts = () => {
        // Create link elements for Google Fonts - Updated to match design system
        const fontLinks = [
          // Inter font for UI elements
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
          // Playfair Display for headings
          'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap'
        ];

        fontLinks.forEach(href => {
          if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.href = href;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            document.head.appendChild(link);
          }
        });
      };

      // Load fonts immediately
      loadFonts();

      // Set CSS custom properties for consistent font usage
      const style = document.createElement('style');
      style.textContent = `
        :root {
          --font-family-sans-serif: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --font-family-serif: 'Playfair Display', 'Times New Roman', serif;
          --font-family-regular: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --font-family-heading: 'Playfair Display', 'Times New Roman', serif;
        }
        
        /* Apply font smoothing for better rendering */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Ensure proper font loading */
        body {
          font-family: var(--font-family-regular);
        }
      `;
      
      if (!document.querySelector('style[data-font-loader]')) {
        style.setAttribute('data-font-loader', 'true');
        document.head.appendChild(style);
      }
    }
  }, []);

  return null; // This component doesn't render anything
};

export default FontLoader;