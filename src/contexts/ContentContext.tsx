import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ContentData {
  homepage: {
    bannerTitle: string;
    bannerSubtitle: string;
    bannerImage: string;
    heroText: string;
    welcomeMessage: string;
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
    featuredContent: string;
    featuredTitle: string;
    featuredDescription: string;
    membersCount: string;
    guidesCount: string;
    reviewsCount: string;
  };
  about: {
    companyName: string;
    tagline: string;
    description: string;
    missionStatement: string;
    address: string;
    email: string;
    phone: string;
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
      bannerTitle: 'Welcome to Onyx Coffee',
      bannerSubtitle: 'Discover the perfect blend for your taste',
      bannerImage: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800',
      heroText: 'Premium Coffee Experience',
      welcomeMessage: 'Every cup tells a story of quality and passion',
    },
    product: {
      sectionTitle: 'Coffee Products',
      exploreTitle: 'Explore other products',
      personalizedTitle: 'Product for you',
      chatbotWelcome: '☕ Coffee Taste Assistant',
      chatbotSubtitle: 'Let\'s find your perfect brew! Answer a few questions and discover coffee that matches your taste.',
    },
    community: {
      sectionTitle: 'Coffee Community',
      welcomeText: 'Connect with fellow coffee enthusiasts and share your brewing journey.',
      featuredContent: '"The Perfect Pour-Over Technique"',
      featuredTitle: 'Featured This Week',
      featuredDescription: 'Master barista Sarah Chen shares her secrets for brewing the perfect cup using our Ethiopian Yirgacheffe beans.',
      membersCount: '1,250+',
      guidesCount: '500+',
      reviewsCount: '2,100+',
    },
    about: {
      companyName: 'Onyx Coffee',
      tagline: 'Crafting Excellence in Every Cup',
      description: 'We are passionate about bringing you the finest coffee experience from around the world.',
      missionStatement: 'To deliver exceptional coffee while supporting sustainable farming practices.',
      address: '123 Coffee Street, Brew City, BC 12345',
      email: 'hello@onyxcoffee.com',
      phone: '+91 98765 43210',
    },
  });

  const updateContent = (section: keyof ContentData, field: string, value: string) => {
    setContentData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
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