import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { DeviceType, PlatformType } from '../types';

interface AboutSectionProps {
  deviceType: DeviceType;
  platformType: PlatformType;
}

const AboutSection: React.FC<AboutSectionProps> = ({ deviceType }) => {
  const isDesktop = deviceType === 'desktop';

  const aboutTiles = [
    {
      id: 'story',
      title: 'Our Story',
      description: 'Learn about the journey that brought Onyx Coffee to life and our passion for exceptional coffee.',
      image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400',
    },
    {
      id: 'sourcing',
      title: 'Sourcing & Ethics',
      description: 'Discover our commitment to ethical sourcing and supporting coffee farmers worldwide.',
      image: 'https://images.unsplash.com/photo-1544366503-4f5ac2b3b5d1?w=400',
    },
    {
      id: 'faq',
      title: 'FAQ',
      description: 'Find answers to commonly asked questions about our products, shipping, and more.',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    },
  ];

  const renderTile = (tile: typeof aboutTiles[0]) => (
    <Pressable
      key={tile.id}
      style={[
        styles.tile,
        isDesktop ? styles.desktopTile : styles.mobileTile,
      ]}
    >
      <View style={styles.tileImageContainer}>
        <Image
          source={{ uri: tile.image }}
          style={styles.tileImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.tileContent}>
        <Text style={styles.tileTitle}>{tile.title}</Text>
        <Text style={styles.tileDescription}>{tile.description}</Text>
      </View>
    </Pressable>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Section Title */}
      <Text style={[
        styles.sectionTitle,
        isDesktop ? styles.desktopSectionTitle : styles.mobileSectionTitle
      ]}>
        About Onyx
      </Text>

      <Text style={styles.sectionSubtitle}>
        Crafting exceptional coffee experiences since day one. Learn more about our mission, values, and the people behind your perfect cup.
      </Text>

      {/* Hero Content */}
      <View style={styles.heroSection}>
        <View style={styles.heroImageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Premium Coffee, Ethical Sourcing</Text>
          <Text style={styles.heroDescription}>
            At Onyx Coffee, we believe that great coffee starts with great relationships. 
            We work directly with farmers to ensure the highest quality beans while 
            supporting sustainable farming practices and fair wages.
          </Text>
        </View>
      </View>

      {/* About Tiles */}
      <View style={[
        styles.tilesContainer,
        isDesktop ? styles.desktopTilesContainer : styles.mobileTilesContainer
      ]}>
        {aboutTiles.map(renderTile)}
      </View>

      {/* Company Values */}
      <View style={styles.valuesSection}>
        <Text style={styles.valuesTitle}>Our Values</Text>
        <View style={styles.valuesGrid}>
          <View style={styles.valueCard}>
            <Text style={styles.valueIcon}>🌱</Text>
            <Text style={styles.valueTitle}>Sustainability</Text>
            <Text style={styles.valueDescription}>
              Committed to environmentally friendly practices throughout our supply chain.
            </Text>
          </View>
          <View style={styles.valueCard}>
            <Text style={styles.valueIcon}>🤝</Text>
            <Text style={styles.valueTitle}>Fair Trade</Text>
            <Text style={styles.valueDescription}>
              Supporting coffee farmers with fair prices and long-term partnerships.
            </Text>
          </View>
          <View style={styles.valueCard}>
            <Text style={styles.valueIcon}>⚡</Text>
            <Text style={styles.valueTitle}>Quality</Text>
            <Text style={styles.valueDescription}>
              Rigorous quality control ensures every cup meets our high standards.
            </Text>
          </View>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Get in Touch</Text>
        <View style={styles.contactInfo}>
          <Text style={styles.contactItem}>📧 hello@onyx-coffee.com</Text>
          <Text style={styles.contactItem}>📱 +91 98765 43210</Text>
          <Text style={styles.contactItem}>📍 Mumbai, Maharashtra, India</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  desktopSectionTitle: {
    fontSize: 24,
  },
  mobileSectionTitle: {
    fontSize: 18,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  heroSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  heroImageContainer: {
    height: 200,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroContent: {
    padding: 20,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tilesContainer: {
    marginBottom: 32,
  },
  desktopTilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  mobileTilesContainer: {
    gap: 16,
  },
  tile: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  desktopTile: {
    flex: 1,
    minWidth: 280,
    maxWidth: 320,
  },
  mobileTile: {
    width: '100%',
  },
  tileImageContainer: {
    height: 120,
    overflow: 'hidden',
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  tileContent: {
    padding: 16,
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  tileDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  valuesSection: {
    marginBottom: 32,
  },
  valuesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  valuesGrid: {
    gap: 16,
  },
  valueCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  valueIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  valueDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  contactSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 24,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  contactInfo: {
    gap: 8,
  },
  contactItem: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default AboutSection;