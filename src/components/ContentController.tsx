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
import { useContent } from '../contexts/ContentContext';

interface ContentSection {
  id: string;
  title: string;
}

const contentSections: ContentSection[] = [
  { id: 'homepage', title: 'Homepage' },
  { id: 'product', title: 'Product' },
  { id: 'community', title: 'Community' },
  { id: 'about', title: 'About' },
];

const ContentController: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('homepage');
  const { contentData, updateContent, saveContent } = useContent();
  const [pendingChanges, setPendingChanges] = useState<{[key: string]: string}>({});

  const handleFieldChange = (section: string, field: string, value: string) => {
    const key = `${section}.${field}`;
    setPendingChanges(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFieldChange = (section: string, field: string) => {
    const key = `${section}.${field}`;
    const value = pendingChanges[key];
    if (value !== undefined) {
      updateContent(section as keyof typeof contentData, field, value);
      setPendingChanges(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
      // Show success feedback
      if (Platform.OS === 'web') {
        const notification = document.createElement('div');
        notification.innerText = '✅ Applied';
        notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#000;color:#fff;padding:8px 12px;border-radius:4px;font-size:12px;z-index:1000;';
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 1500);
      }
    }
  };

  const getFieldValue = (section: string, field: string) => {
    const key = `${section}.${field}`;
    return pendingChanges[key] !== undefined 
      ? pendingChanges[key] 
      : (contentData as any)[section]?.[field] || '';
  };

  const hasUnappliedChanges = (section: string, field: string) => {
    const key = `${section}.${field}`;
    return pendingChanges[key] !== undefined;
  };

  const handleSave = () => {
    if (Platform.OS === 'web') {
      if (confirm('Save all content changes? This will update the live content on your website.')) {
        saveContent();
      }
    } else {
      Alert.alert(
        'Save Changes',
        'Save all content changes? This will update the live content on your website.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save', onPress: saveContent }
        ]
      );
    }
  };

  const renderInputField = (section: string, field: string, label: string, placeholder: string, multiline = false, numberOfLines = 1) => {
    const hasChanges = hasUnappliedChanges(section, field);
    
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.textInput,
              multiline && styles.multilineInput,
              hasChanges && styles.modifiedInput
            ]}
            value={getFieldValue(section, field)}
            onChangeText={(text) => handleFieldChange(section, field, text)}
            placeholder={placeholder}
            multiline={multiline}
            numberOfLines={numberOfLines}
          />
          <Pressable
            style={[
              styles.applyButton,
              hasChanges ? styles.applyButtonActive : styles.applyButtonInactive
            ]}
            onPress={() => applyFieldChange(section, field)}
            disabled={!hasChanges}
          >
            <Text style={[
              styles.applyButtonText,
              hasChanges ? styles.applyButtonTextActive : styles.applyButtonTextInactive
            ]}>
              Apply
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderHomepageEditor = () => (
    <View style={styles.editorSection}>
      <Text style={styles.editorTitle}>Homepage Content</Text>
      
      <View style={styles.contentGroup}>
        <Text style={styles.groupTitle}>🏠 Banner Section</Text>
        <Text style={styles.groupDescription}>Content shown in the top banner of the homepage</Text>
        
        {renderInputField('homepage', 'brandName', 'Brand Name', 'Company brand name displayed in banner')}
        {renderInputField('homepage', 'bannerImage', 'Banner Background Image URL', 'https://example.com/image.jpg')}

        {/* Image Preview */}
        {contentData.homepage.bannerImage && (
          <View style={styles.imagePreview}>
            <Text style={styles.previewLabel}>Current Banner Image:</Text>
            <Image 
              source={{ uri: contentData.homepage.bannerImage }} 
              style={styles.previewImage}
              resizeMode="cover"
            />
          </View>
        )}
      </View>

      <View style={styles.contentGroup}>
        <Text style={styles.groupTitle}>🎬 Product Hero GIF</Text>
        <Text style={styles.groupDescription}>Animated GIF shown in "Product For You" section to attract user attention</Text>
        
        {renderInputField('homepage', 'productHeroGif', 'Product Hero GIF URL', 'https://example.com/coffee-animation.gif')}

        {/* GIF Preview */}
        {contentData.homepage.productHeroGif && (
          <View style={styles.imagePreview}>
            <Text style={styles.previewLabel}>Current Product Hero GIF:</Text>
            <Image 
              source={{ uri: contentData.homepage.productHeroGif }} 
              style={styles.gifPreview}
              resizeMode="cover"
            />
            <Text style={styles.gifNote}>
              💡 This GIF will appear in the "Products For You" section to grab user attention
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderProductEditor = () => (
    <View style={styles.editorSection}>
      <Text style={styles.editorTitle}>Product Section Content</Text>
      
      <View style={styles.contentGroup}>
        <Text style={styles.groupTitle}>☕ Product Section</Text>
        <Text style={styles.groupDescription}>Main titles and tab labels for the products page</Text>
        
        {renderInputField('product', 'sectionTitle', 'Section Title', 'Main section heading')}
        {renderInputField('product', 'exploreTitle', 'Explore Tab Title', 'Title for explore products tab')}
        {renderInputField('product', 'personalizedTitle', 'Personal Tab Title', 'Title for personalized recommendations tab')}
      </View>

      <View style={styles.contentGroup}>
        <Text style={styles.groupTitle}>🤖 Chatbot Welcome</Text>
        <Text style={styles.groupDescription}>Welcome message shown in the taste recommendation chatbot</Text>
        
        {renderInputField('product', 'chatbotWelcome', 'Chatbot Title', 'Welcome title for chatbot')}
        {renderInputField('product', 'chatbotSubtitle', 'Chatbot Description', 'Description text for chatbot', true, 3)}
      </View>

      <View style={styles.contentGroup}>
        <Text style={styles.groupTitle}>🎬 Personalized GIF</Text>
        <Text style={styles.groupDescription}>Animated GIF shown in "Product For You" section when user gets recommendation</Text>
        
        {renderInputField('product', 'personalizedGif', 'Personalized GIF URL', 'https://media.giphy.com/media/3o7TKqnN349PBUtGFO/giphy.gif')}

        {/* GIF Preview */}
        {contentData.product.personalizedGif && (
          <View style={styles.imagePreview}>
            <Text style={styles.previewLabel}>Current Personalized GIF:</Text>
            <Image 
              source={{ uri: contentData.product.personalizedGif }} 
              style={styles.gifPreview}
              resizeMode="cover"
            />
            <Text style={styles.gifNote}>
              💡 This GIF appears in the Product For You section when users get their personalized recommendation
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderCommunityEditor = () => (
    <View style={styles.editorSection}>
      <Text style={styles.editorTitle}>Community Section Content</Text>
      
      <View style={styles.contentGroup}>
        <Text style={styles.groupTitle}>👥 Community Header</Text>
        <Text style={styles.groupDescription}>Main heading and introduction text for community page</Text>
        
        {renderInputField('community', 'sectionTitle', 'Section Title', 'Main community page heading')}
        {renderInputField('community', 'welcomeText', 'Welcome Text', 'Introduction text for community', true, 2)}
      </View>

      <View style={styles.contentGroup}>
        <Text style={styles.groupTitle}>⭐ Featured Content</Text>
        <Text style={styles.groupDescription}>Highlighted content section shown on community page</Text>
        
        {renderInputField('community', 'featuredTitle', 'Featured Section Title', 'Title for featured content section')}
        {renderInputField('community', 'featuredContent', 'Featured Item Title', 'Title of the featured content item')}
        {renderInputField('community', 'featuredDescription', 'Featured Item Description', 'Description of featured content', true, 3)}
      </View>

    </View>
  );

  const renderAboutEditor = () => (
    <View style={styles.editorSection}>
      <Text style={styles.editorTitle}>About Section Content</Text>
      
      <View style={styles.contentGroup}>
        <Text style={styles.groupTitle}>ℹ️ Page Header</Text>
        <Text style={styles.groupDescription}>Main heading and subtitle shown at top of about page</Text>
        
        {renderInputField('about', 'sectionTitle', 'Page Title', 'Main heading for about page')}
        {renderInputField('about', 'sectionSubtitle', 'Page Subtitle', 'Subtitle/description under main heading', true, 3)}
      </View>

      <View style={styles.contentGroup}>
        <Text style={styles.groupTitle}>🎯 Hero Content</Text>
        <Text style={styles.groupDescription}>Featured content section with image and description</Text>
        
        {renderInputField('about', 'heroTitle', 'Hero Section Title', 'Title for main hero content')}
        {renderInputField('about', 'heroDescription', 'Hero Description', 'Main description text in hero section', true, 4)}
      </View>

      <View style={styles.contentGroup}>
        <Text style={styles.groupTitle}>📞 Contact Information</Text>
        <Text style={styles.groupDescription}>Contact details shown in footer of about page</Text>
        
        {renderInputField('about', 'contactEmail', 'Contact Email', 'company@example.com')}
        {renderInputField('about', 'contactPhone', 'Contact Phone', '+91 XXXXX XXXXX')}
        {renderInputField('about', 'contactAddress', 'Contact Address', 'City, State, Country')}
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

  const renderHomepagePreview = () => (
    <View style={styles.sectionPreview}>
      {/* Banner Preview */}
      <View style={styles.bannerPreview}>
        <Image 
          source={{ uri: contentData.homepage.bannerImage }}
          style={styles.bannerPreviewImage}
          resizeMode="cover"
        />
        <View style={styles.bannerOverlay}>
          <View style={styles.brandPillPreview}>
            <Text style={styles.brandTextPreview}>{contentData.homepage.brandName}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.previewDescription}>This is how your homepage banner appears to visitors</Text>
      
      {/* Product Hero GIF Preview */}
      {contentData.homepage.productHeroGif && (
        <View style={styles.heroGifPreviewContainer}>
          <Text style={styles.heroGifTitle}>Products For You</Text>
          <View style={styles.heroGifPreview}>
            <Image 
              source={{ uri: contentData.homepage.productHeroGif }} 
              style={styles.heroGifImage}
              resizeMode="cover"
            />
            <Text style={styles.heroGifCaption}>🎬 Hero GIF Animation</Text>
          </View>
          <Text style={styles.previewDescription}>This GIF will catch user attention in the Products section</Text>
        </View>
      )}
    </View>
  );

  const renderProductPreview = () => (
    <View style={styles.sectionPreview}>
      {/* Product Section Preview */}
      <Text style={styles.previewSectionTitle}>{contentData.product.sectionTitle}</Text>
      
      {/* Tabs Preview */}
      <View style={styles.tabsPreview}>
        <View style={[styles.tabPreview, styles.activeTabPreview]}>
          <Text style={styles.activeTabTextPreview}>{contentData.product.personalizedTitle}</Text>
        </View>
        <View style={styles.tabPreview}>
          <Text style={styles.tabTextPreview}>{contentData.product.exploreTitle}</Text>
        </View>
      </View>
      
      {/* Chatbot Preview */}
      <View style={styles.chatbotPreview}>
        <Text style={styles.chatbotTitlePreview}>{contentData.product.chatbotWelcome}</Text>
        <Text style={styles.chatbotSubtitlePreview}>{contentData.product.chatbotSubtitle}</Text>
      </View>
      
      <Text style={styles.previewDescription}>This is how your product section appears to users</Text>
    </View>
  );

  const renderCommunityPreview = () => (
    <View style={styles.sectionPreview}>
      {/* Community Header */}
      <Text style={styles.previewSectionTitle}>{contentData.community.sectionTitle}</Text>
      <Text style={styles.communityWelcomePreview}>{contentData.community.welcomeText}</Text>
      
      {/* Featured Content Preview */}
      <View style={styles.featuredPreview}>
        <Text style={styles.featuredTitlePreview}>{contentData.community.featuredTitle}</Text>
        <View style={styles.featuredCardPreview}>
          <Text style={styles.featuredContentTitlePreview}>{contentData.community.featuredContent}</Text>
          <Text style={styles.featuredDescriptionPreview}>{contentData.community.featuredDescription}</Text>
        </View>
      </View>
      
      <Text style={styles.previewDescription}>This is how your community section appears to users</Text>
    </View>
  );

  const renderAboutPreview = () => (
    <View style={styles.sectionPreview}>
      {/* About Header */}
      <Text style={styles.previewSectionTitle}>{contentData.about.sectionTitle}</Text>
      <Text style={styles.aboutSubtitlePreview}>{contentData.about.sectionSubtitle}</Text>
      
      {/* Hero Preview */}
      <View style={styles.heroPreview}>
        <Text style={styles.heroTitlePreview}>{contentData.about.heroTitle}</Text>
        <Text style={styles.heroDescriptionPreview}>{contentData.about.heroDescription}</Text>
      </View>
      
      {/* Contact Preview */}
      <View style={styles.contactPreview}>
        <Text style={styles.contactTitlePreview}>Get in Touch</Text>
        <Text style={styles.contactItemPreview}>📧 {contentData.about.contactEmail}</Text>
        <Text style={styles.contactItemPreview}>📱 {contentData.about.contactPhone}</Text>
        <Text style={styles.contactItemPreview}>📍 {contentData.about.contactAddress}</Text>
      </View>
      
      <Text style={styles.previewDescription}>This is how your about section appears to users</Text>
    </View>
  );

  const renderCurrentPreview = () => {
    switch (activeSection) {
      case 'homepage':
        return renderHomepagePreview();
      case 'product':
        return renderProductPreview();
      case 'community':
        return renderCommunityPreview();
      case 'about':
        return renderAboutPreview();
      default:
        return renderHomepagePreview();
    }
  };

  const renderPreview = () => {
    return (
      <View style={styles.previewContainer}>
        <Text style={styles.previewTitle}>
          Live Preview - {contentSections.find(s => s.id === activeSection)?.title}
        </Text>
        <ScrollView style={styles.previewContent} showsVerticalScrollIndicator={false}>
          {renderCurrentPreview()}
        </ScrollView>
        
        <View style={styles.saveSection}>
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>💾 Save All Changes</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Content Controller</Text>
      <Text style={styles.subtitle}>Manage actual website content that appears on your live site</Text>

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
            <Text style={[
              styles.navText,
              activeSection === section.id && styles.activeNavText
            ]}>
              {section.title}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Split Screen: Editor + Preview */}
      <View style={styles.splitContainer}>
        {/* Editor Section */}
        <ScrollView style={styles.editorContainer} showsVerticalScrollIndicator={false}>
          {renderCurrentEditor()}
        </ScrollView>

        {/* Preview Section */}
        {renderPreview()}
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
  navText: {
    ...Typography.caption,
    color: '#333',
    textAlign: 'center',
  },
  activeNavText: {
    color: '#fff',
    fontWeight: '600',
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
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
    marginBottom: 8,
  },
  groupDescription: {
    ...Typography.caption,
    color: '#666',
    marginBottom: 16,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    ...Typography.label,
    color: '#000',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  textInput: {
    flex: 1,
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
  modifiedInput: {
    borderColor: '#f39c12',
    backgroundColor: '#fff9e6',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  applyButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonActive: {
    backgroundColor: '#27ae60',
  },
  applyButtonInactive: {
    backgroundColor: '#95a5a6',
  },
  applyButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  applyButtonTextActive: {
    color: '#fff',
  },
  applyButtonTextInactive: {
    color: '#ccc',
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
  },
  gifPreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  gifNote: {
    ...Typography.caption,
    color: '#f39c12',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
      },
    }),
  },
  previewTitle: {
    ...Typography.h3,
    color: '#000',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  previewContent: {
    flex: 1,
    padding: 16,
  },
  sectionPreview: {
    gap: 16,
  },
  previewDescription: {
    ...Typography.caption,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Homepage Preview Styles
  bannerPreview: {
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerPreviewImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 12,
  },
  brandPillPreview: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  brandTextPreview: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // Hero GIF Preview Styles
  heroGifPreviewContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f39c12',
  },
  heroGifTitle: {
    ...Typography.h4,
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroGifPreview: {
    alignItems: 'center',
    marginBottom: 12,
  },
  heroGifImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 8,
  },
  heroGifCaption: {
    ...Typography.caption,
    color: '#f39c12',
    fontWeight: '600',
  },
  // Product Preview Styles
  previewSectionTitle: {
    ...Typography.h3,
    color: '#000',
    marginBottom: 8,
  },
  tabsPreview: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 16,
  },
  tabPreview: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 24,
  },
  activeTabPreview: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabTextPreview: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabTextPreview: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  chatbotPreview: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  chatbotTitlePreview: {
    ...Typography.h4,
    color: '#000',
    marginBottom: 8,
  },
  chatbotSubtitlePreview: {
    ...Typography.body,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Community Preview Styles
  communityWelcomePreview: {
    ...Typography.body,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  featuredPreview: {
    marginBottom: 16,
  },
  featuredTitlePreview: {
    ...Typography.h4,
    color: '#000',
    marginBottom: 12,
  },
  featuredCardPreview: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  featuredContentTitlePreview: {
    ...Typography.h5,
    color: '#000',
    marginBottom: 8,
  },
  featuredDescriptionPreview: {
    ...Typography.body,
    color: '#666',
    lineHeight: 18,
  },
  statsPreview: {
    flexDirection: 'row',
    gap: 12,
  },
  statCardPreview: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statNumberPreview: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  statLabelPreview: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  // About Preview Styles
  aboutSubtitlePreview: {
    ...Typography.body,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  heroPreview: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  heroTitlePreview: {
    ...Typography.h4,
    color: '#000',
    marginBottom: 8,
  },
  heroDescriptionPreview: {
    ...Typography.body,
    color: '#666',
    lineHeight: 18,
  },
  contactPreview: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  contactTitlePreview: {
    ...Typography.h5,
    color: '#000',
    marginBottom: 12,
  },
  contactItemPreview: {
    ...Typography.body,
    color: '#333',
    marginBottom: 4,
  },
  saveSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
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