import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  FlatList,
  Platform,
} from 'react-native';
import { RouteType, DeviceType, PlatformType } from '../types';
import { useContent } from '../contexts/ContentContext';
import { useUserStories } from '../contexts/UserStoriesContext';
import UserStoryCard from '../components/UserStoryCard';
import CreateUserStory from '../components/CreateUserStory';

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
  const { contentData } = useContent();
  const { stories, getLiveStories, getCommunityStats } = useUserStories();
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'stories' | 'live'>('overview');
  
  const communityStats = getCommunityStats();

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
    if (page === 'stories') {
      setSelectedTab('stories');
      return;
    }
    
    const content = {
      brew: {
        title: '☕ Brew Guides',
        message: 'Coming Soon!\n\n• Pour-over techniques\n• Espresso brewing\n• French press methods\n• Cold brew recipes\n• Grind size guide'
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

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'stories':
        return (
          <View style={styles.storiesContainer}>
            <View style={styles.storiesHeader}>
              <Text style={styles.storiesTitle}>Community Stories</Text>
              <Pressable
                style={styles.createButton}
                onPress={() => setShowCreateStory(true)}
              >
                <Text style={styles.createButtonText}>+ Share Story</Text>
              </Pressable>
            </View>
            <FlatList
              data={stories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <UserStoryCard story={item} />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.storiesList}
            />
          </View>
        );
      
      case 'live':
        const liveStories = getLiveStories();
        return (
          <View style={styles.storiesContainer}>
            <View style={styles.storiesHeader}>
              <Text style={styles.storiesTitle}>🔴 Live Stories</Text>
              <Pressable
                style={styles.createButton}
                onPress={() => setShowCreateStory(true)}
              >
                <Text style={styles.createButtonText}>+ Go Live</Text>
              </Pressable>
            </View>
            {liveStories.length > 0 ? (
              <FlatList
                data={liveStories}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <UserStoryCard story={item} />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.storiesList}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No Live Stories</Text>
                <Text style={styles.emptyDescription}>Be the first to share what's happening right now!</Text>
              </View>
            )}
          </View>
        );
      
      default:
        return renderOverviewContent();
    }
  };

  const renderOverviewContent = () => (
    <ScrollView style={styles.overviewContainer} showsVerticalScrollIndicator={false}>
      {/* Header with Section Title and Share Button */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={[
            styles.sectionTitle,
            isDesktop ? styles.desktopSectionTitle : styles.mobileSectionTitle
          ]}>
            {contentData.community.sectionTitle}
          </Text>
          <Pressable
            style={styles.createButton}
            onPress={() => setShowCreateStory(true)}
          >
            <Text style={styles.createButtonText}>+ Share Story</Text>
          </Pressable>
        </View>
        <Text style={styles.sectionSubtitle}>
          {contentData.community.welcomeText}
        </Text>
      </View>

      {/* Community Stories Preview */}
      <View style={styles.storiesPreview}>
        <View style={styles.storiesPreviewHeader}>
          <Text style={styles.storiesPreviewTitle}>📖 Community Stories</Text>
          <Pressable onPress={() => setSelectedTab('stories')}>
            <Text style={styles.viewAllText}>View All →</Text>
          </Pressable>
        </View>
        {stories.slice(0, 5).map((story) => (
          <UserStoryCard key={story.id} story={story} showProduct={true} />
        ))}
      </View>

      {/* Community Tiles */}
      <View style={[
        styles.tilesContainer,
        isDesktop ? styles.desktopTilesContainer : styles.mobileTilesContainer
      ]}>
        {communityTiles.map(renderTile)}
      </View>

      {/* Featured Content Placeholder */}
      <View style={styles.featuredSection}>
        <Text style={styles.featuredTitle}>{contentData.community.featuredTitle}</Text>
        <View style={styles.featuredCard}>
          <Text style={styles.featuredCardTitle}>
            {contentData.community.featuredContent}
          </Text>
          <Text style={styles.featuredCardDescription}>
            {contentData.community.featuredDescription}
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
            <Text style={styles.statNumber}>{communityStats.totalMembers}</Text>
            <Text style={styles.statLabel}>Coffee Lovers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{communityStats.totalStories}</Text>
            <Text style={styles.statLabel}>Stories</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{communityStats.totalReviews}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, selectedTab === 'stories' && styles.activeTab]}
          onPress={() => setSelectedTab('stories')}
        >
          <Text style={[styles.tabText, selectedTab === 'stories' && styles.activeTabText]}>
            Stories
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, selectedTab === 'live' && styles.activeTab]}
          onPress={() => setSelectedTab('live')}
        >
          <Text style={[styles.tabText, selectedTab === 'live' && styles.activeTabText]}>
            🔴 Live
          </Text>
        </Pressable>
      </View>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Create Story Modal */}
      <CreateUserStory
        visible={showCreateStory}
        onClose={() => setShowCreateStory(false)}
        onStoryCreated={() => setSelectedTab('overview')}
        initialType="story"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f1f3f4',
  },
  activeTab: {
    backgroundColor: '#000',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  overviewContainer: {
    flex: 1,
    padding: 16,
  },
  storiesContainer: {
    flex: 1,
    padding: 16,
  },
  storiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  storiesTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  createButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  storiesList: {
    paddingBottom: 20,
  },
  storiesPreview: {
    marginVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
        elevation: 3,
      },
    }),
  },
  storiesPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storiesPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  headerContainer: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
    flex: 1,
    marginRight: 12,
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
    ...Platform.select({
      web: {
        boxShadow: '0 2px 3px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      },
    }),
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