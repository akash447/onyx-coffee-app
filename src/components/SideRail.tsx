import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { DeviceType, RouteType } from '../types';

interface SideRailProps {
  deviceType: DeviceType;
  currentRoute: RouteType;
  onNavigate: (route: RouteType) => void;
  onScrollToSection?: (section: string) => void; // For desktop scroll behavior
}

const SideRail: React.FC<SideRailProps> = ({
  deviceType,
  currentRoute,
  onNavigate,
  onScrollToSection,
}) => {
  const isDesktop = deviceType === 'desktop';
  const railWidth = isDesktop ? 180 : 84;

  const menuItems = [
    {
      id: 'product',
      label: 'Product',
      icon: '☕',
      section: 'product' as const,
    },
    {
      id: 'community',
      label: 'Community',
      icon: '👥',
      section: 'community' as const,
    },
    {
      id: 'about',
      label: 'About',
      icon: 'ℹ️',
      section: 'about' as const,
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: '⚙️',
      section: 'admin' as const,
    },
  ];

  const handleItemPress = (section: 'product' | 'community' | 'about' | 'admin') => {
    if (isDesktop && onScrollToSection) {
      // Desktop: scroll to section
      onScrollToSection(section);
    } else {
      // Mobile/Tablet: navigate to section (replace content)
      onNavigate({ kind: 'section', section });
    }
  };

  const isActiveSection = (section: string): boolean => {
    return currentRoute.kind === 'section' && currentRoute.section === section;
  };

  const RailContent = () => (
    <View style={[styles.railContainer, { width: railWidth }]}>
      {isDesktop && (
        <Text style={styles.sectionLabel}>Sections</Text>
      )}
      
      <ScrollView 
        style={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item) => (
          <Pressable
            key={item.id}
            style={[
              styles.menuItem,
              isDesktop ? styles.desktopMenuItem : styles.mobileMenuItem,
              isActiveSection(item.section) && styles.activeMenuItem,
            ]}
            onPress={() => handleItemPress(item.section)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            {isDesktop ? (
              <Text 
                style={[
                  styles.menuLabel,
                  styles.desktopMenuLabel,
                  isActiveSection(item.section) && styles.activeMenuLabel,
                ]}
              >
                {item.label}
              </Text>
            ) : (
              <Text 
                style={[
                  styles.menuLabel,
                  styles.mobileMenuLabel,
                  isActiveSection(item.section) && styles.activeMenuLabel,
                ]}
              >
                {item.label}
              </Text>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.rail, { width: railWidth }]}>
      {/* Use BlurView for the backdrop blur effect */}
      <BlurView
        intensity={80}
        style={styles.blurContainer}
        tint={isDesktop ? 'light' : 'light'}
      >
        <View 
          style={[
            styles.railBackground,
            {
              backgroundColor: isDesktop 
                ? 'rgba(255, 255, 255, 0.9)' 
                : 'rgba(255, 255, 255, 0.8)'
            }
          ]}
        >
          <RailContent />
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  rail: {
    position: 'relative',
    height: '100%',
  },
  blurContainer: {
    flex: 1,
  },
  railBackground: {
    flex: 1,
  },
  railContainer: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 12,
    paddingHorizontal: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  desktopMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
  },
  mobileMenuItem: {
    flexDirection: 'column',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
  },
  activeMenuItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  menuIcon: {
    fontSize: 20,
  },
  menuLabel: {
    fontWeight: '500',
    textAlign: 'center',
  },
  desktopMenuLabel: {
    fontSize: 14,
    flex: 1,
    textAlign: 'left',
  },
  mobileMenuLabel: {
    fontSize: 10,
  },
  activeMenuLabel: {
    color: '#000',
    fontWeight: '600',
  },
});

export default SideRail;