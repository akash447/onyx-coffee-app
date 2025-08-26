import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Platform,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useCatalog } from '../contexts/CatalogContext';
import { RouteType, CatalogItem } from '../types';
import { Colors, Typography, Spacing, Layout, BorderRadius, createTypographyStyle } from '../utils/designSystem';
import { fuzzySearchProducts, getSearchSuggestions } from '../utils/fuzzySearch';

interface TopNavigationProps {
  currentRoute: RouteType;
  onNavigate: (route: RouteType) => void;
  onCartPress: () => void;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  currentRoute,
  onNavigate,
  onCartPress,
  deviceType,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { items: cartItems } = useCart();
  const { items: catalogItems } = useCatalog();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<CatalogItem[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { width: screenWidth } = Dimensions.get('window');
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';

  const navigationItems = [
    { id: 'home', label: 'Home', section: 'home' as const },
    { id: 'product', label: 'Product', section: 'product' as const },
    { id: 'community', label: 'Community', section: 'community' as const },
    { id: 'about', label: 'About', section: 'about' as const },
  ];

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleNavItemPress = (item: typeof navigationItems[0]) => {
    onNavigate({ kind: 'section', section: item.section });
    setShowMobileMenu(false);
  };

  const handleUserMenuPress = () => {
    if (!isAuthenticated) {
      // Show login modal (this would be handled by parent)
      return;
    }
    setShowUserMenu(!showUserMenu);
  };

  // Enhanced search with fuzzy search and suggestions
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchSuggestions([]);
      setShowSearchResults(false);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    setShowSearchResults(true);
    
    searchTimeoutRef.current = setTimeout(() => {
      const results = fuzzySearchProducts(searchQuery, catalogItems, 8);
      const suggestions = getSearchSuggestions(searchQuery, catalogItems, 5);
      
      setSearchResults(results);
      setSearchSuggestions(suggestions);
      setSearchLoading(false);
    }, 300); // Debounce search

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, catalogItems]);

  const handleSearch = (query?: string) => {
    const searchTerm = query || searchQuery.trim();
    if (searchTerm) {
      onNavigate({ 
        kind: 'section', 
        section: 'product', 
        search: searchTerm 
      });
      setSearchQuery('');
      setShowSearch(false);
      setShowSearchResults(false);
    }
  };

  const handleSearchResultPress = (product: CatalogItem) => {
    onNavigate({ kind: 'sku', product: product.id });
    setSearchQuery('');
    setShowSearch(false);
    setShowSearchResults(false);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
    setSearchSuggestions([]);
  };

  const renderDesktopNavigation = () => (
    <View style={styles.desktopNav}>
      {/* Logo */}
      <Pressable 
        style={styles.logo}
        onPress={() => onNavigate({ kind: 'section', section: 'home' })}
        accessibilityRole="button"
        accessibilityLabel="Go to homepage"
      >
        <Text style={styles.logoText}>Onyx</Text>
      </Pressable>

      {/* Navigation Items */}
      <View style={styles.navItems}>
        {navigationItems.map((item) => {
          const isActive = currentRoute.section === item.section;
          return (
            <Pressable
              key={item.id}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => handleNavItemPress(item)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Right Side Actions */}
      <View style={styles.rightActions}>
        {/* Search */}
        <View style={styles.searchContainer}>
          {showSearch ? (
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search products, flavors, origins..."
                value={searchQuery}
                onChangeText={handleSearchInputChange}
                onSubmitEditing={() => handleSearch()}
                autoFocus
                accessibilityLabel="Search products"
              />
              <Pressable
                style={styles.searchButton}
                onPress={handleCloseSearch}
                accessibilityRole="button"
                accessibilityLabel="Close search"
              >
                <Text style={styles.searchButtonText}>✕</Text>
              </Pressable>
              
              {/* Search Results Dropdown */}
              {showSearchResults && (
                <View style={styles.searchDropdown}>
                  {searchLoading ? (
                    <View style={styles.searchLoadingContainer}>
                      <ActivityIndicator size="small" color={Colors.primary} />
                      <Text style={styles.searchLoadingText}>Searching...</Text>
                    </View>
                  ) : (
                    <ScrollView style={styles.searchScrollView} keyboardShouldPersistTaps="handled">
                      {/* Search Results */}
                      {searchResults.length > 0 && (
                        <>
                          <View style={styles.searchSectionHeader}>
                            <Text style={styles.searchSectionTitle}>Products</Text>
                          </View>
                          {searchResults.map((product) => (
                            <Pressable
                              key={product.id}
                              style={styles.searchResultItem}
                              onPress={() => handleSearchResultPress(product)}
                              accessibilityRole="button"
                              accessibilityLabel={`${product.name}, ₹${product.price}`}
                            >
                              <View style={styles.searchResultContent}>
                                <Text style={styles.searchResultName} numberOfLines={1}>
                                  {product.name}
                                </Text>
                                <Text style={styles.searchResultDesc} numberOfLines={1}>
                                  {product.desc || 'Premium coffee'}
                                </Text>
                                <Text style={styles.searchResultPrice}>₹{product.price}</Text>
                              </View>
                            </Pressable>
                          ))}
                        </>
                      )}
                      
                      {/* Search Suggestions */}
                      {searchSuggestions.length > 0 && (
                        <>
                          {searchResults.length > 0 && <View style={styles.searchDivider} />}
                          <View style={styles.searchSectionHeader}>
                            <Text style={styles.searchSectionTitle}>Suggestions</Text>
                          </View>
                          {searchSuggestions.map((suggestion, index) => (
                            <Pressable
                              key={`suggestion-${index}`}
                              style={styles.searchSuggestionItem}
                              onPress={() => handleSuggestionPress(suggestion)}
                              accessibilityRole="button"
                              accessibilityLabel={`Search for ${suggestion}`}
                            >
                              <Text style={styles.searchSuggestionText}>🔍 {suggestion}</Text>
                            </Pressable>
                          ))}
                        </>
                      )}
                      
                      {/* No Results */}
                      {!searchLoading && searchResults.length === 0 && searchSuggestions.length === 0 && searchQuery.trim() && (
                        <View style={styles.noResultsContainer}>
                          <Text style={styles.noResultsText}>No products found for "{searchQuery}"</Text>
                          <Text style={styles.noResultsSubtext}>Try a different search term or browse our categories</Text>
                        </View>
                      )}
                    </ScrollView>
                  )}
                </View>
              )}
            </View>
          ) : (
            <Pressable
              style={styles.iconButton}
              onPress={() => setShowSearch(true)}
              accessibilityRole="button"
              accessibilityLabel="Open search"
            >
              <Text style={styles.iconText}>🔍</Text>
            </Pressable>
          )}
        </View>

        {/* Admin Link (always visible) */}
        <Pressable
          style={styles.navItem}
          onPress={() => onNavigate({ kind: 'section', section: 'admin' })}
          accessibilityRole="button"
          accessibilityLabel="Admin"
        >
          <Text style={styles.navItemText}>Admin</Text>
        </Pressable>

        {/* User Account */}
        <View style={styles.userContainer}>
          <Pressable
            style={styles.iconButton}
            onPress={handleUserMenuPress}
            accessibilityRole="button"
            accessibilityLabel={isAuthenticated ? `User menu for ${user?.name}` : 'Sign in'}
          >
            <Text style={styles.iconText}>
              {isAuthenticated ? user?.initials || '👤' : '👤'}
            </Text>
          </Pressable>

          {/* User Dropdown Menu */}
          {showUserMenu && isAuthenticated && (
            <View style={styles.userDropdown}>
              <Pressable
                style={styles.dropdownItem}
                onPress={() => {
                  onNavigate({ kind: 'section', section: 'profile' });
                  setShowUserMenu(false);
                }}
              >
                <Text style={styles.dropdownItemText}>Profile</Text>
              </Pressable>
              <Pressable
                style={styles.dropdownItem}
                onPress={() => {
                  onNavigate({ kind: 'section', section: 'orders' });
                  setShowUserMenu(false);
                }}
              >
                <Text style={styles.dropdownItemText}>Orders</Text>
              </Pressable>
              <View style={styles.dropdownDivider} />
              <Pressable
                style={styles.dropdownItem}
                onPress={() => {
                  logout();
                  setShowUserMenu(false);
                }}
              >
                <Text style={[styles.dropdownItemText, styles.logoutText]}>Sign Out</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Cart */}
        <Pressable
          style={[styles.iconButton, styles.cartButton]}
          onPress={onCartPress}
          accessibilityRole="button"
          accessibilityLabel={`Shopping cart with ${cartItemCount} items`}
        >
          <Text style={styles.iconText}>🛒</Text>
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );

  const renderMobileNavigation = () => (
    <View style={styles.mobileNav}>
      {/* Mobile Header */}
      <View style={styles.mobileHeader}>
        {/* Menu Button */}
        <Pressable
          style={styles.mobileMenuButton}
          onPress={() => setShowMobileMenu(!showMobileMenu)}
          accessibilityRole="button"
          accessibilityLabel="Open navigation menu"
        >
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>

        {/* Logo */}
        <Pressable 
          style={styles.mobileLogo}
          onPress={() => onNavigate({ kind: 'section', section: 'home' })}
          accessibilityRole="button"
          accessibilityLabel="Go to homepage"
        >
          <Text style={styles.mobileLogoText}>Onyx</Text>
        </Pressable>

        {/* Right Actions */}
        <View style={styles.mobileRightActions}>
          <Pressable
            style={styles.mobileIconButton}
            onPress={() => setShowSearch(true)}
            accessibilityRole="button"
            accessibilityLabel="Open search"
          >
            <Text style={styles.mobileIconText}>🔍</Text>
          </Pressable>

          <Pressable
            style={[styles.mobileIconButton, styles.cartButton]}
            onPress={onCartPress}
            accessibilityRole="button"
            accessibilityLabel={`Shopping cart with ${cartItemCount} items`}
          >
            <Text style={styles.mobileIconText}>🛒</Text>
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <View style={styles.mobileMenuDropdown}>
          {navigationItems.map((item) => {
            const isActive = currentRoute.section === item.section;
            return (
              <Pressable
                key={item.id}
                style={[styles.mobileMenuItem, isActive && styles.mobileMenuItemActive]}
                onPress={() => handleNavItemPress(item)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[styles.mobileMenuItemText, isActive && styles.mobileMenuItemTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
          
          <View style={styles.mobileMenuDivider} />
          
          {/* Admin Link */}
          <Pressable
            style={styles.mobileMenuItem}
            onPress={() => {
              onNavigate({ kind: 'section', section: 'admin' });
              setShowMobileMenu(false);
            }}
          >
            <Text style={styles.mobileMenuItemText}>Admin</Text>
          </Pressable>
          
          {isAuthenticated ? (
            <>
              <Pressable
                style={styles.mobileMenuItem}
                onPress={() => {
                  onNavigate({ kind: 'section', section: 'profile' });
                  setShowMobileMenu(false);
                }}
              >
                <Text style={styles.mobileMenuItemText}>Profile</Text>
              </Pressable>
              <Pressable
                style={styles.mobileMenuItem}
                onPress={() => {
                  logout();
                  setShowMobileMenu(false);
                }}
              >
                <Text style={[styles.mobileMenuItemText, styles.logoutText]}>Sign Out</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={styles.mobileMenuItem}
              onPress={() => {
                // Handle login - this would be managed by parent
                setShowMobileMenu(false);
              }}
            >
              <Text style={styles.mobileMenuItemText}>Sign In</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Mobile Search Modal */}
      <Modal
        visible={showSearch}
        animationType="slide"
        presentationStyle="overFullScreen"
        onRequestClose={() => setShowSearch(false)}
      >
        <View style={styles.searchModal}>
          <View style={styles.searchModalHeader}>
            <TextInput
              style={styles.searchModalInput}
              placeholder="Search products, flavors, origins..."
              value={searchQuery}
              onChangeText={handleSearchInputChange}
              onSubmitEditing={() => handleSearch()}
              autoFocus
              accessibilityLabel="Search products"
            />
            <Pressable
              style={styles.searchModalClose}
              onPress={handleCloseSearch}
              accessibilityRole="button"
              accessibilityLabel="Close search"
            >
              <Text style={styles.searchModalCloseText}>Cancel</Text>
            </Pressable>
          </View>
          
          {/* Mobile Search Results */}
          {showSearchResults && (
            <View style={styles.searchModalResults}>
              {searchLoading ? (
                <View style={styles.searchLoadingContainer}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.searchLoadingText}>Searching...</Text>
                </View>
              ) : (
                <ScrollView keyboardShouldPersistTaps="handled">
                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <>
                      <View style={styles.searchSectionHeader}>
                        <Text style={styles.searchSectionTitle}>Products</Text>
                      </View>
                      {searchResults.map((product) => (
                        <Pressable
                          key={product.id}
                          style={styles.searchResultItem}
                          onPress={() => handleSearchResultPress(product)}
                          accessibilityRole="button"
                          accessibilityLabel={`${product.name}, ₹${product.price}`}
                        >
                          <View style={styles.searchResultContent}>
                            <Text style={styles.searchResultName} numberOfLines={1}>
                              {product.name}
                            </Text>
                            <Text style={styles.searchResultDesc} numberOfLines={1}>
                              {product.desc || 'Premium coffee'}
                            </Text>
                            <Text style={styles.searchResultPrice}>₹{product.price}</Text>
                          </View>
                        </Pressable>
                      ))}
                    </>
                  )}
                  
                  {/* Search Suggestions */}
                  {searchSuggestions.length > 0 && (
                    <>
                      {searchResults.length > 0 && <View style={styles.searchDivider} />}
                      <View style={styles.searchSectionHeader}>
                        <Text style={styles.searchSectionTitle}>Suggestions</Text>
                      </View>
                      {searchSuggestions.map((suggestion, index) => (
                        <Pressable
                          key={`suggestion-${index}`}
                          style={styles.searchSuggestionItem}
                          onPress={() => handleSuggestionPress(suggestion)}
                          accessibilityRole="button"
                          accessibilityLabel={`Search for ${suggestion}`}
                        >
                          <Text style={styles.searchSuggestionText}>🔍 {suggestion}</Text>
                        </Pressable>
                      ))}
                    </>
                  )}
                  
                  {/* No Results */}
                  {!searchLoading && searchResults.length === 0 && searchSuggestions.length === 0 && searchQuery.trim() && (
                    <View style={styles.noResultsContainer}>
                      <Text style={styles.noResultsText}>No products found for "{searchQuery}"</Text>
                      <Text style={styles.noResultsSubtext}>Try a different search term or browse our categories</Text>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );

  return (
    <View style={[styles.container, { position: 'sticky', top: 0, zIndex: 1000 }]}>
      {isDesktop ? renderDesktopNavigation() : renderMobileNavigation()}
      
      {/* Click outside to close user menu */}
      {showUserMenu && (
        <Pressable
          style={styles.overlay}
          onPress={() => setShowUserMenu(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface.secondary,
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      },
    }),
  },

  // Desktop Navigation
  desktopNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    height: Layout.headerHeight,
    maxWidth: Layout.maxWidth,
    width: '100%',
    alignSelf: 'center',
  },

  logo: {
    paddingVertical: Spacing.sm,
  },

  logoText: {
    ...createTypographyStyle('h2', 'serif', Colors.primary),
    fontWeight: Typography.weights.bold,
    fontSize: 36, // Bigger font as requested
  },

  navItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    flex: 1,
    justifyContent: 'center',
  },

  navItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    minHeight: Layout.minTouchTarget,
    justifyContent: 'center',
  },

  navItemActive: {
    backgroundColor: Colors.surface.secondary,
  },

  navItemText: {
    ...createTypographyStyle('body', 'sansSerif', Colors.text.secondary),
    fontWeight: Typography.weights.medium,
  },

  navItemTextActive: {
    color: Colors.primary,
    fontWeight: Typography.weights.semiBold,
  },

  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },

  searchContainer: {
    position: 'relative',
  },

  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    width: 300,
  },

  searchInput: {
    ...createTypographyStyle('body', 'sansSerif', Colors.text.primary),
    flex: 1,
    paddingVertical: Spacing.sm,
    backgroundColor: 'transparent',
    outline: 'none',
  },

  searchButton: {
    padding: Spacing.xs,
  },

  searchButtonText: {
    ...createTypographyStyle('body', 'sansSerif', Colors.text.tertiary),
  },

  iconButton: {
    width: Layout.minTouchTarget,
    height: Layout.minTouchTarget,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface.secondary,
  },

  iconText: {
    fontSize: 18,
  },

  userContainer: {
    position: 'relative',
  },

  userDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.md,
    minWidth: 200,
    paddingVertical: Spacing.sm,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
      },
    }),
  },

  dropdownItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: Layout.minTouchTarget,
    justifyContent: 'center',
  },

  dropdownItemText: {
    ...createTypographyStyle('body', 'sansSerif', Colors.text.primary),
  },

  dropdownDivider: {
    height: 1,
    backgroundColor: Colors.surface.secondary,
    marginVertical: Spacing.sm,
  },

  logoutText: {
    color: Colors.error,
  },

  // Search Dropdown Styles
  searchDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.md,
    maxHeight: 400,
    marginTop: Spacing.xs,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
      },
    }),
  },

  searchScrollView: {
    maxHeight: 380,
  },

  searchLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },

  searchLoadingText: {
    ...createTypographyStyle('body', 'sansSerif', Colors.text.secondary),
  },

  searchSectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface.secondary,
  },

  searchSectionTitle: {
    ...createTypographyStyle('caption', 'sansSerif', Colors.text.tertiary),
    fontWeight: Typography.weights.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  searchResultItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface.secondary,
  },

  searchResultContent: {
    gap: Spacing.xs,
  },

  searchResultName: {
    ...createTypographyStyle('body', 'sansSerif', Colors.text.primary),
    fontWeight: Typography.weights.medium,
  },

  searchResultDesc: {
    ...createTypographyStyle('bodySmall', 'sansSerif', Colors.text.tertiary),
  },

  searchResultPrice: {
    ...createTypographyStyle('body', 'sansSerif', Colors.primary),
    fontWeight: Typography.weights.semiBold,
  },

  searchSuggestionItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface.secondary,
  },

  searchSuggestionText: {
    ...createTypographyStyle('body', 'sansSerif', Colors.text.secondary),
  },

  searchDivider: {
    height: 8,
    backgroundColor: Colors.surface.secondary,
  },

  noResultsContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },

  noResultsText: {
    ...createTypographyStyle('body', 'sansSerif', Colors.text.primary),
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },

  noResultsSubtext: {
    ...createTypographyStyle('bodySmall', 'sansSerif', Colors.text.tertiary),
    textAlign: 'center',
  },

  cartButton: {
    position: 'relative',
  },

  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  cartBadgeText: {
    ...createTypographyStyle('caption', 'sansSerif', Colors.primary),
    fontWeight: Typography.weights.bold,
    fontSize: 10,
  },

  // Mobile Navigation
  mobileNav: {
    backgroundColor: Colors.surface.primary,
  },

  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    height: Layout.headerHeight,
  },

  mobileMenuButton: {
    width: Layout.minTouchTarget,
    height: Layout.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuIcon: {
    fontSize: 20,
    color: Colors.text.primary,
  },

  mobileLogo: {
    flex: 1,
    alignItems: 'center',
  },

  mobileLogoText: {
    ...createTypographyStyle('h4', 'serif', Colors.primary),
    fontWeight: Typography.weights.bold,
    fontSize: 28, // Bigger font for mobile too
  },

  mobileRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  mobileIconButton: {
    width: Layout.minTouchTarget,
    height: Layout.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },

  mobileIconText: {
    fontSize: 18,
  },

  mobileMenuDropdown: {
    backgroundColor: Colors.surface.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.surface.secondary,
  },

  mobileMenuItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: Layout.minTouchTarget,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface.secondary,
  },

  mobileMenuItemActive: {
    backgroundColor: Colors.surface.secondary,
  },

  mobileMenuItemText: {
    ...createTypographyStyle('body', 'sansSerif', Colors.text.primary),
    fontWeight: Typography.weights.medium,
  },

  mobileMenuItemTextActive: {
    color: Colors.primary,
    fontWeight: Typography.weights.semiBold,
  },

  mobileMenuDivider: {
    height: 8,
    backgroundColor: Colors.surface.secondary,
  },

  // Search Modal
  searchModal: {
    flex: 1,
    backgroundColor: Colors.surface.primary,
  },

  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface.secondary,
    gap: Spacing.md,
  },

  searchModalInput: {
    ...createTypographyStyle('body', 'sansSerif', Colors.text.primary),
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.md,
  },

  searchModalClose: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },

  searchModalCloseText: {
    ...createTypographyStyle('body', 'sansSerif', Colors.primary),
    fontWeight: Typography.weights.medium,
  },

  searchModalResults: {
    flex: 1,
    backgroundColor: Colors.surface.primary,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
});

export default TopNavigation;