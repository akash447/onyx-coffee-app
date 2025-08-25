import { useEffect } from 'react';
import { Platform } from 'react-native';

const FontLoader = () => {
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Load Google Fonts for web platform
      const loadFonts = () => {
        // Create link elements for Google Fonts
        const fontLinks = [
          // Inter font (variable weight)
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
          // Sora font for headings
          'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap',
          // Manrope font (alternative for headings)
          'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap',
          // Noto Sans Devanagari for Hindi support
          'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@300;400;500;600;700;800;900&display=swap',
          // Mukti font for Hindi (fallback)
          'https://fonts.googleapis.com/css2?family=Mukti:wght@300;400;500;600;700;800&display=swap'
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
          --font-family-regular: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
          --font-family-heading: 'Sora', 'Manrope', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
          --font-family-hindi: 'Noto Sans Devanagari', 'Mukti', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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