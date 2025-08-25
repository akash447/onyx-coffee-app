import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { RouteType, DeviceType, PlatformType } from '../types';

interface CommunitySectionProps {
  deviceType: DeviceType;
  platformType: PlatformType;
  onNavigate: (route: RouteType) => void;
}

const CommunitySection: React.FC<CommunitySectionProps> = ({
  deviceType,
  onNavigate,
}) => {
  const isDesktop = deviceType === 'desktop';

  const communityTiles = [
    {
      id: 'brew',
      title: 'Brew Guides',
      description: 'Learn different brewing techniques and tips from coffee experts.',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
      page: 'brew' as const,
    },
    {
      id: 'stories',
      title: 'User Stories',
      description: 'Read experiences and reviews from our coffee community.',
      image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400',
      page: 'stories' as const,
    },
    {
      id: 'tips',
      title: 'Tips & Tricks',
      description: 'Discover expert tips for brewing the perfect cup of coffee.',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
      page: 'tips' as const,
    },
  ];

  const handleTilePress = (page: 'brew' | 'stories' | 'tips') => {
    // For now, show an alert with content preview
    const content = {
      brew: {
        title: '☕ Brew Guides',
        message: 'Coming Soon!\n\n• Pour-over techniques\n• Espresso brewing\n• French press methods\n• Cold brew recipes\n• Grind size guide'
      },
      stories: {
        title: '📖 User Stories',
        message: 'Coming Soon!\n\n• Customer reviews\n• Coffee journey stories\n• Brewing experiences\n• Community highlights\n• Photo submissions'
      },
      tips: {
        title: '💡 Tips & Tricks',
        message: 'Coming Soon!\n\n• Storage tips\n• Brewing temperature\n• Water quality guide\n• Equipment maintenance\n• Flavor enhancement'
      }
    };
    
    Alert.alert(
      content[page].title,
      content[page].message,
      [
        { text: 'Back to Community', style: 'default' },
        { text: 'Subscribe for Updates', style: 'default' }
      ]
    );
    
    // TODO: Replace with actual navigation
    // onNavigate({ kind: 'communityPage', page });
  };

  const renderTile = (tile: typeof communityTiles[0]) => (
    <Pressable
      key={tile.id}
      style={[
        styles.tile,
        isDesktop ? styles.desktopTile : styles.mobileTile,
      ]}
      onPress={() => handleTilePress(tile.page)}
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
        Community
      </Text>

      <Text style={styles.sectionSubtitle}>
        Connect with fellow coffee enthusiasts and share your brewing journey.
      </Text>

      {/* Community Tiles */}
      <View style={[
        styles.tilesContainer,
        isDesktop ? styles.desktopTilesContainer : styles.mobileTilesContainer
      ]}>
        {communityTiles.map(renderTile)}
      </View>

      {/* Featured Content Placeholder */}
      <View style={styles.featuredSection}>
        <Text style={styles.featuredTitle}>Featured This Week</Text>
        <View style={styles.featuredCard}>
          <Text style={styles.featuredCardTitle}>
            "The Perfect Pour-Over Technique"
          </Text>
          <Text style={styles.featuredCardDescription}>
            Master barista Sarah Chen shares her secrets for brewing the perfect cup using our Ethiopian Yirgacheffe beans.
          </Text>
          <Pressable style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>Read More →</Text>
          </Pressable>
        </View>
      </View>

      {/* Community Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>Community Highlights</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1,250+</Text>
            <Text style={styles.statLabel}>Coffee Lovers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Brew Guides</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>2,100+</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
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
    backgroundColor: '#E2D8A5',
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
    height: 160,
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
  featuredSection: {
    marginBottom: 32,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  featuredCard: {
    backgroundColor: '#E2D8A5',
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
  },
  featuredCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  featuredCardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  statsSection: {
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#E2D8A5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default CommunitySection;