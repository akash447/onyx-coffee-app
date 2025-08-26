import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ContentData {
  homepage: {
    brandName: string;
    bannerImage: string;
  };
  product: {
    sectionTitle: string;
    exploreTitle: string;
    personalizedTitle: string;
    chatbotWelcome: string;
    chatbotSubtitle: string;
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
  saveContent: () => void;
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

export const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  const [contentData, setContentData] = useState<ContentData>({
    homepage: {
      brandName: 'Onyx Coffee',
      bannerImage: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200',
    },
    product: {
      sectionTitle: 'Coffee Products',
      exploreTitle: 'Explore other products',
      personalizedTitle: 'Product for you',
      chatbotWelcome: '☕ Coffee Taste Assistant',
      chatbotSubtitle: 'Let\'s find your perfect brew! Answer a few questions and discover coffee that matches your taste.',
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
  });

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

  const saveContent = () => {
    // For now, just show a success message
    // In a real app, this would save to a backend
    console.log('Content saved:', contentData);
    if (typeof window !== 'undefined' && window.alert) {
      window.alert('✅ Content saved successfully!');
    }
  };

  const value = {
    contentData,
    updateContent,
    saveContent,
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};