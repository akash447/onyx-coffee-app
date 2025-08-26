import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ContentData {
  homepage: {
    brandName: string;
    bannerImage: string;
    productHeroGif: string;
  };
  product: {
    sectionTitle: string;
    exploreTitle: string;
    personalizedTitle: string;
    chatbotWelcome: string;
    chatbotSubtitle: string;
    personalizedGif: string;
  };
  community: {
    sectionTitle: string;
    welcomeText: string;
    featuredTitle: string;
    featuredContent: string;
    featuredDescription: string;
  };
  about: {
    sectionTitle: string;
    sectionSubtitle: string;
    heroTitle: string;
    heroDescription: string;
    contactEmail: string;
    contactPhone: string;
    contactAddress: string;
  };
}

interface ContentContextType {
  contentData: ContentData;
  updateContent: (section: keyof ContentData, field: string, value: string) => void;
  saveContent: () => Promise<void>;
  loadContent: () => void;
  isLoading: boolean;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

interface ContentProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'onyx_content_data';

// Default content data
const defaultContentData: ContentData = {
  homepage: {
    brandName: 'Onyx Coffee',
    bannerImage: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200',
    productHeroGif: 'https://media.giphy.com/media/3o6ZtpRoYe9wbyfcBi/giphy.gif',
  },
  product: {
    sectionTitle: 'Coffee Products',
    exploreTitle: 'Explore other products',
    personalizedTitle: 'Product for you',
    chatbotWelcome: '☕ Coffee Taste Assistant',
    chatbotSubtitle: 'Let\'s find your perfect brew! Answer a few questions and discover coffee that matches your taste.',
    personalizedGif: 'https://media.giphy.com/media/3o6ZtpRoYe9wbyfcBi/giphy.gif',
  },
  community: {
    sectionTitle: 'Community',
    welcomeText: 'Connect with fellow coffee enthusiasts and share your brewing journey.',
    featuredTitle: 'Featured This Week',
    featuredContent: '"The Perfect Pour-Over Technique"',
    featuredDescription: 'Master barista Sarah Chen shares her secrets for brewing the perfect cup using our Ethiopian Yirgacheffe beans.',
  },
  about: {
    sectionTitle: 'About Onyx',
    sectionSubtitle: 'Crafting exceptional coffee experiences since day one. Learn more about our mission, values, and the people behind your perfect cup.',
    heroTitle: 'Premium Coffee, Ethical Sourcing',
    heroDescription: 'At Onyx Coffee, we believe that great coffee starts with great relationships. We work directly with farmers to ensure the highest quality beans while supporting sustainable farming practices and fair wages.',
    contactEmail: 'hello@onyx-coffee.com',
    contactPhone: '+91 98765 43210',
    contactAddress: 'Mumbai, Maharashtra, India',
  },
};

export const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  const [contentData, setContentData] = useState<ContentData>(defaultContentData);
  const [isLoading, setIsLoading] = useState(true);

  const updateContent = (section: keyof ContentData, field: string, value: string) => {
    console.log('Updating content:', section, field, value);
    setContentData(prev => {
      const updated = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
      console.log('Updated content data:', updated);
      return updated;
    });
  };

  // Load content from API or localStorage
  const loadContent = async () => {
    try {
      setIsLoading(true);
      
      // Try to load from API first
      try {
        const response = await fetch('/api/content');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const mergedData = {
              homepage: { ...defaultContentData.homepage, ...result.data.homepage },
              product: { ...defaultContentData.product, ...result.data.product },
              community: { ...defaultContentData.community, ...result.data.community },
              about: { ...defaultContentData.about, ...result.data.about },
            };
            setContentData(mergedData);
            console.log('Content loaded from API:', mergedData);
            return;
          }
        }
      } catch (apiError) {
        console.log('API not available, falling back to localStorage:', apiError instanceof Error ? apiError.message : 'Unknown error');
      }
      
      // Fallback to localStorage
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const mergedData = {
          homepage: { ...defaultContentData.homepage, ...parsedData.homepage },
          product: { ...defaultContentData.product, ...parsedData.product },
          community: { ...defaultContentData.community, ...parsedData.community },
          about: { ...defaultContentData.about, ...parsedData.about },
        };
        setContentData(mergedData);
        console.log('Content loaded from localStorage:', mergedData);
      } else {
        console.log('No saved content found, using defaults');
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save content to API and localStorage
  const saveContent = async () => {
    try {
      let apiSuccess = false;
      
      // Try to save to API first
      try {
        const response = await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contentData)
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            apiSuccess = true;
            console.log('Content saved to API:', result);
          }
        } else {
          console.error('API save failed:', response.statusText);
        }
      } catch (apiError) {
        console.log('API not available, saving to localStorage only:', apiError instanceof Error ? apiError.message : 'Unknown error');
      }
      
      // Always save to localStorage as backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contentData));
      console.log('Content saved to localStorage:', contentData);
      
      if (typeof window !== 'undefined' && window.alert) {
        const message = apiSuccess 
          ? '✅ Content saved successfully to database!' 
          : '✅ Content saved locally! (Database not available)';
        window.alert(message);
      }
    } catch (error) {
      console.error('Error saving content:', error);
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('❌ Error saving content. Please try again.');
      }
    }
  };

  // Load content on component mount
  useEffect(() => {
    loadContent();
  }, []);

  const value = {
    contentData,
    updateContent,
    saveContent,
    loadContent,
    isLoading,
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};