import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { Typography, FontConfig } from '../utils/fonts';

interface ContentSection {
  id: string;
  title: string;
  icon: string;
}

const contentSections: ContentSection[] = [
  { id: 'homepage', title: 'Homepage', icon: '🏠' },
  { id: 'product', title: 'Product', icon: '☕' },
  { id: 'community', title: 'Community', icon: '👥' },
  { id: 'about', title: 'About', icon: 'ℹ️' },
];

const ContentController: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('homepage');
  const [contentData, setContentData] = useState({
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

  const handleContentUpdate = (section: string, field: string, value: string) => {
    setContentData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    if (Platform.OS === 'web') {
      if (confirm('Save content changes? This will update the live content on your website.')) {
        // Save logic here - integrate with your backend/storage
        alert('✅ Content saved successfully!');
      }
    } else {
      Alert.alert(
        'Save Changes',
        'Save content changes? This will update the live content on your website.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save', onPress: () => Alert.alert('✅ Success', 'Content saved successfully!') }
        ]
      );
    }
  };

  const renderHomepageEditor = () => (
    <View style={styles.editorSection}>
      <Text style={styles.editorTitle}>Homepage Content</Text>
      
      {/* Banner Section */}
      <View style={styles.contentGroup}>
        <Text style={styles.groupTitle}>🎯 Hero Banner</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Banner Title</Text>
          <TextInput
            style={styles.textInput}
            value={contentData.homepage.bannerTitle}
            onChangeText={(text) => handleContentUpdate('homepage', 'bannerTitle', text)}
            placeholder="Main banner title"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Banner Subtitle</Text>
          <TextInput
            style={styles.textInput}
            value={contentData.homepage.bannerSubtitle}
            onChangeText={(text) => handleContentUpdate('homepage', 'bannerSubtitle', text)}
            placeholder="Banner subtitle"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Banner Image URL</Text>
          <TextInput
            style={styles.textInput}
            value={contentData.homepage.bannerImage}
            onChangeText={(text) => handleContentUpdate('homepage', 'bannerImage', text)}
            placeholder="https://example.com/image.jpg"
          />
        </View>

        {/* Image Preview */}
        {contentData.homepage.bannerImage && (
          <View style={styles.imagePreview}>
            <Text style={styles.previewLabel}>Image Preview:</Text>
            <Image 
              source={{ uri: contentData.homepage.bannerImage }} 
              style={styles.previewImage}
              resizeMode="cover"
            />
          </View>
        )}
      </View>

      {/* Welcome Section */}
      <View style={styles.contentGroup}>
        <Text style={styles.groupTitle}>👋 Welcome Section</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Hero Text</Text>
          <TextInput
            style={styles.textInput}
            value={contentData.homepage.heroText}
            onChangeText={(text) => handleContentUpdate('homepage', 'heroText', text)}
            placeholder="Main hero text"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Welcome Message</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={contentData.homepage.welcomeMessage}
            onChangeText={(text) => handleContentUpdate('homepage', 'welcomeMessage', text)}
            placeholder="Welcome message for visitors"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>
    </View>
  );

  const renderProductEditor = () => (
    <View style={styles.editorSection}>
      <Text style={styles.editorTitle}>Product Section Content</Text>
      
      <View style={styles.contentGroup}>
        <Text style={styles.groupTitle}>☕ Product Section</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Main Section Title</Text>
          <TextInput
            style={styles.textInput}
            value={contentData.product.sectionTitle}
            onChangeText={(text) => handleContentUpdate('product', 'sectionTitle', text)}
            placeholder="Coffee Products"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Explore Tab Title</Text>
          <TextInput
            style={styles.textInput}
            value={contentData.product.exploreTitle}
            onChangeText={(text) => handleContentUpdate('product', 'exploreTitle', text)}
            placeholder="Explore other products"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Personalized Tab Title</Text>
          <TextInput
            style={styles.textInput}
            value={contentData.product.personalizedTitle}
            onChangeText={(text) => handleContentUpdate('product', 'personalizedTitle', text)}
            placeholder="Product for you"
          />
        </View>
      </View>

      <View style={styles.contentGroup}>
        <Text style={styles.groupTitle}>🤖 Chatbot Content</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Chatbot Welcome Title</Text>
          <TextInput
            style={styles.textInput}
            value={contentData.product.chatbotWelcome}
            onChangeText={(text) => handleContentUpdate('product', 'chatbotWelcome', text)}
            placeholder="Coffee Taste Assistant"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Chatbot Subtitle</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={contentData.product.chatbotSubtitle}
            onChangeText={(text) => handleContentUpdate('product', 'chatbotSubtitle', text)}
            placeholder="Description for the chatbot functionality"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>
    </View>
  );

  const renderCommunityEditor = () => (
    <View style={styles.editorSection}>
      <Text style={styles.editorTitle}>Community Section Content</Text>
      
      <View style={styles.contentGroup}>
        <Text style={styles.groupTitle}>👥 Community Header</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Section Title</Text>
          <TextInput
            style={styles.textInput}
            value={contentData.community.sectionTitle}
            onChangeText={(text) => handleContentUpdate('community', 'sectionTitle', text)}
            placeholder="Coffee Community"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Welcome Text</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={contentData.community.welcomeText}
            onChangeText={(text) => handleContentUpdate('community', 'welcomeText', text)}
            placeholder="Join our community message"
            multiline
            numberOfLines={2}
          />
        </View>
      </View>

      <View style={styles.contentGroup}>
        <Text style={styles.groupTitle}>⭐ Featured Content</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Featured Article Title</Text>
          <TextInput
            style={styles.textInput}
            value={contentData.community.featuredTitle || 'Featured This Week'}
            onChangeText={(text) => handleContentUpdate('community', 'featuredTitle', text)}
            placeholder="Featured This Week"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Featured Content Title</Text>
          <TextInput
            style={styles.textInput}
            value={contentData.community.featuredContent}
            onChangeText={(text) => handleContentUpdate('community', 'featuredContent', text)}
            placeholder="Featured community content"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Featured Content Description</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={contentData.community.featuredDescription || ''}
            onChangeText={(text) => handleContentUpdate('community', 'featuredDescription', text)}
            placeholder="Description of the featured content"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      <View style={styles.contentGroup}>
        <Text style={styles.groupTitle}>📊 Community Stats</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Coffee Lovers Count</Text>
          <TextInput
            style={styles.textInput}
            value={contentData.community.membersCount || '1,250+'}
            onChangeText={(text) => handleContentUpdate('community', 'membersCount', text)}
            placeholder="1,250+"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Brew Guides Count</Text>
          <TextInput
            style={styles.textInput}
            value={contentData.community.guidesCount || '500+'}
            onChangeText={(text) => handleContentUpdate('community', 'guidesCount', text)}
            placeholder="500+"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Reviews Count</Text>
          <TextInput
            style={styles.textInput}
            value={contentData.community.reviewsCount || '2,100+'}
            onChangeText={(text) => handleContentUpdate('community', 'reviewsCount', text)}
            placeholder="2,100+"
          />
        </View>
      </View>
    </View>
  );

  const renderAboutEditor = () => (
    <View style={styles.editorSection}>
      <Text style={styles.editorTitle}>About Section Content</Text>
      
      <View style={styles.contentGroup}>
        <Text style={styles.groupTitle}>ℹ️ Company Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Company Name</Text>
          <TextInput
            style={styles.textInput}
            value={contentData.about.companyName}
            onChangeText={(text) => handleContentUpdate('about', 'companyName', text)}
            placeholder="Company name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tagline</Text>
          <TextInput
            style={styles.textInput}
            value={contentData.about.tagline}
            onChangeText={(text) => handleContentUpdate('about', 'tagline', text)}
            placeholder="Company tagline"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Company Description</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={contentData.about.description}
            onChangeText={(text) => handleContentUpdate('about', 'description', text)}
            placeholder="Company description"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mission Statement</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={contentData.about.missionStatement}
            onChangeText={(text) => handleContentUpdate('about', 'missionStatement', text)}
            placeholder="Mission statement"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      <View style={styles.contentGroup}>
        <Text style={styles.groupTitle}>📍 Contact & Location</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Address</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={contentData.about.address || ''}
            onChangeText={(text) => handleContentUpdate('about', 'address', text)}
            placeholder="Company address"
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Contact Email</Text>
          <TextInput
            style={styles.textInput}
            value={contentData.about.email || ''}
            onChangeText={(text) => handleContentUpdate('about', 'email', text)}
            placeholder="contact@company.com"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.textInput}
            value={contentData.about.phone || ''}
            onChangeText={(text) => handleContentUpdate('about', 'phone', text)}
            placeholder="+91 XXXXX XXXXX"
            keyboardType="phone-pad"
          />
        </View>
      </View>
    </View>
  );

  const renderCurrentEditor = () => {
    switch (activeSection) {
      case 'homepage':
        return renderHomepageEditor();
      case 'product':
        return renderProductEditor();
      case 'community':
        return renderCommunityEditor();
      case 'about':
        return renderAboutEditor();
      default:
        return renderHomepageEditor();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Content Controller</Text>
      <Text style={styles.subtitle}>Manage website content, banners, text, and images</Text>

      {/* Horizontal Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.horizontalNav}
        contentContainerStyle={styles.navContent}
      >
        {contentSections.map((section) => (
          <Pressable
            key={section.id}
            style={[
              styles.navItem,
              activeSection === section.id && styles.activeNavItem
            ]}
            onPress={() => setActiveSection(section.id)}
          >
            <Text style={styles.navIcon}>{section.icon}</Text>
            <Text style={[
              styles.navText,
              activeSection === section.id && styles.activeNavText
            ]}>
              {section.title}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Content Editor */}
      <ScrollView style={styles.editorContainer} showsVerticalScrollIndicator={false}>
        {renderCurrentEditor()}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveSection}>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>💾 Save All Changes</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2D8A5',
    padding: 16,
  },
  title: {
    ...Typography.h1,
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.body,
    color: '#666',
    marginBottom: 24,
  },
  horizontalNav: {
    maxHeight: 80,
    marginBottom: 20,
  },
  navContent: {
    paddingHorizontal: 4,
    gap: 12,
  },
  navItem: {
    backgroundColor: '#E2D8A5',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  activeNavItem: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navText: {
    ...Typography.caption,
    color: '#333',
    textAlign: 'center',
  },
  activeNavText: {
    color: '#fff',
    fontWeight: '600',
  },
  editorContainer: {
    flex: 1,
  },
  editorSection: {
    paddingBottom: 20,
  },
  editorTitle: {
    ...Typography.h2,
    color: '#000',
    marginBottom: 20,
  },
  contentGroup: {
    backgroundColor: '#E2D8A5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  groupTitle: {
    ...Typography.h4,
    color: '#000',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    ...Typography.label,
    color: '#000',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#E2D8A5',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    ...FontConfig.regular,
    color: '#000',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  imagePreview: {
    marginTop: 12,
  },
  previewLabel: {
    ...Typography.caption,
    color: '#666',
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  saveSection: {
    paddingTop: 20,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButtonText: {
    ...Typography.button,
    color: '#fff',
    fontSize: 16,
  },
});

export default ContentController;