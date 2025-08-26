import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useContent } from '../contexts/ContentContext';
import { DeviceType } from '../types';
import ProfileSection from '../screens/ProfileSection';
import OrdersSection from '../screens/OrdersSection';
import AddressesSection from '../screens/AddressesSection';

interface BannerProps {
  deviceType: DeviceType;
  imageUrl?: string;
  onCartPress?: () => void;
}

const Banner: React.FC<BannerProps> = ({ deviceType, imageUrl, onCartPress }) => {
  const { user, isAuthenticated, login, logout, demoLogin, loading } = useAuth();
  const { itemCount } = useCart();
  const { contentData } = useContent();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showAddressesModal, setShowAddressesModal] = useState(false);
  const [loginForm, setLoginForm] = useState({
    phoneNumber: '',
    password: '',
    name: '',
  });
  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('login');
  const [captchaCode, setCaptchaCode] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const { width } = Dimensions.get('window');
  const isDesktop = deviceType === 'desktop';
  
  // Calculate banner height based on device type
  const bannerHeight = isDesktop 
    ? Math.max(140, Math.min(240, width * 0.2)) 
    : Math.max(88, Math.min(180, width * 0.13));

  // Generate CAPTCHA
  const generateCaptcha = () => {
    const characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'; // Avoid confusing characters
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setGeneratedCaptcha(result);
    setCaptchaCode('');
  };

  // Generate CAPTCHA when login modal opens
  React.useEffect(() => {
    if (showLoginModal) {
      generateCaptcha();
    }
  }, [showLoginModal]);

  // Reset form when modal closes
  const resetLoginForm = () => {
    setLoginForm({ phoneNumber: '', password: '', name: '' });
    setCaptchaCode('');
    setLoginMode('login');
  };

  const handleLogin = async () => {
    // Validate form
    if (!loginForm.phoneNumber || loginForm.phoneNumber.length !== 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    
    if (!loginForm.password || loginForm.password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long.');
      return;
    }

    if (loginMode === 'signup' && (!loginForm.name || loginForm.name.trim().length < 2)) {
      Alert.alert('Invalid Name', 'Please enter your full name.');
      return;
    }

    if (!captchaCode || captchaCode.toUpperCase() !== generatedCaptcha) {
      Alert.alert('Invalid CAPTCHA', 'Please enter the correct CAPTCHA code.');
      return;
    }

    setLoginLoading(true);
    try {
      // Create user object
      const userData = {
        id: `phone_${loginForm.phoneNumber}`,
        name: loginMode === 'signup' ? loginForm.name.trim() : `User ${loginForm.phoneNumber.slice(-4)}`,
        email: `+91${loginForm.phoneNumber}@onyx-coffee.com`,
        phone: `+91${loginForm.phoneNumber}`,
        initials: loginMode === 'signup' ? loginForm.name.charAt(0).toUpperCase() : 'U',
      };
      
      console.log('Logging in with user data:', userData);
      
      // Simulate authentication with phone + password, passing user data
      await login(userData.email, loginForm.password, userData);
      setShowLoginModal(false);
      resetLoginForm();
      Alert.alert('✅ Welcome!', `Successfully ${loginMode === 'signup' ? 'signed up' : 'logged in'} with +91 ${loginForm.phoneNumber}`);
    } catch (error) {
      Alert.alert(`${loginMode === 'signup' ? 'Signup' : 'Login'} Failed`, 'Please check your credentials and try again.');
      generateCaptcha(); // Generate new CAPTCHA on failed attempt
    } finally {
      setLoginLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      await demoLogin();
      setShowLoginModal(false);
    } catch (error) {
      Alert.alert('Demo Login Failed', 'Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileMenu(false);
    } catch (error) {
      Alert.alert('Logout Failed', 'Please try again.');
    }
  };

  const renderAuthButton = () => {
    if (loading) {
      return (
        <View style={styles.authButton}>
          <Text style={styles.authButtonText}>Loading...</Text>
        </View>
      );
    }

    if (isAuthenticated && user) {
      return (
        <Pressable
          style={styles.authButton}
          onPress={() => setShowProfileMenu(true)}
        >
          <View style={styles.profileChip}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.initials}</Text>
            </View>
            <Text style={styles.userName} numberOfLines={1}>
              {user.name}
            </Text>
          </View>
        </Pressable>
      );
    }

    return (
      <Pressable
        style={styles.authButton}
        onPress={() => setShowLoginModal(true)}
      >
        <Text style={styles.authButtonText}>Login</Text>
      </Pressable>
    );
  };

  return (
    <>
      <View style={[styles.banner, { height: bannerHeight }]}>
        <ImageBackground
          source={{ uri: imageUrl || contentData.homepage.bannerImage }}
          style={styles.backgroundImage}
          onError={() => {
            // Fallback handled by LinearGradient overlay
          }}
        >
          {/* Dark gradient overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
            style={styles.overlay}
          >
            {/* Brand pill */}
            <View style={styles.brandPill}>
              <Text style={styles.brandText}>{contentData.homepage.brandName}</Text>
            </View>

            {/* Cart and Auth buttons */}
            <View style={styles.rightContainer}>
              {/* Cart Icon */}
              <Pressable 
                style={styles.cartButton}
                onPress={() => {
                  if (onCartPress) {
                    onCartPress();
                  } else {
                    Alert.alert(
                      '🛒 Shopping Cart', 
                      itemCount > 0 
                        ? `You have ${itemCount} item${itemCount > 1 ? 's' : ''} in your cart.\n\nCart functionality will be enhanced in the next update!`
                        : 'Your cart is empty.\n\nAdd some delicious coffee to get started!',
                      [
                        { text: 'Continue Shopping', style: 'default' },
                        { text: 'OK', style: 'cancel' }
                      ]
                    );
                  }
                }}
              >
                <Text style={styles.cartIcon}>🛒</Text>
                {itemCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{itemCount}</Text>
                  </View>
                )}
              </Pressable>
              
              {/* Auth button */}
              <View style={styles.authContainer}>
                {renderAuthButton()}
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

      {/* Login Modal */}
      <Modal
        visible={showLoginModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLoginModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {loginMode === 'signup' ? '📱 Sign Up' : '🇮🇳 Login'} with Mobile Number
            </Text>
            <Text style={styles.modalSubtitle}>
              {loginMode === 'signup' 
                ? 'Create your account with phone number and password' 
                : 'Enter your phone number and password to login'}
            </Text>
            
            {/* Toggle Login/Signup */}
            <View style={styles.toggleContainer}>
              <Pressable 
                style={[styles.toggleButton, loginMode === 'login' && styles.toggleButtonActive]}
                onPress={() => setLoginMode('login')}
              >
                <Text style={[styles.toggleButtonText, loginMode === 'login' && styles.toggleButtonTextActive]}>
                  Login
                </Text>
              </Pressable>
              <Pressable 
                style={[styles.toggleButton, loginMode === 'signup' && styles.toggleButtonActive]}
                onPress={() => setLoginMode('signup')}
              >
                <Text style={[styles.toggleButtonText, loginMode === 'signup' && styles.toggleButtonTextActive]}>
                  Sign Up
                </Text>
              </Pressable>
            </View>

            {/* Name field for signup */}
            {loginMode === 'signup' && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={loginForm.name}
                onChangeText={(text) => setLoginForm({...loginForm, name: text})}
                autoCapitalize="words"
              />
            )}
            
            {/* Phone Number */}
            <View style={styles.phoneInputContainer}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="Mobile Number (10 digits)"
                value={loginForm.phoneNumber}
                onChangeText={(text) => setLoginForm({...loginForm, phoneNumber: text})}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            {/* Password */}
            <TextInput
              style={styles.input}
              placeholder={loginMode === 'signup' ? 'Create Password (min 6 characters)' : 'Enter Password'}
              value={loginForm.password}
              onChangeText={(text) => setLoginForm({...loginForm, password: text})}
              secureTextEntry
            />

            {/* CAPTCHA */}
            <View style={styles.captchaContainer}>
              <Text style={styles.captchaLabel}>Security Verification:</Text>
              <View style={styles.captchaBox}>
                <Text style={styles.captchaText}>{generatedCaptcha}</Text>
                <Pressable style={styles.refreshCaptcha} onPress={generateCaptcha}>
                  <Text style={styles.refreshCaptchaText}>🔄</Text>
                </Pressable>
              </View>
              <TextInput
                style={styles.captchaInput}
                placeholder="Enter CAPTCHA code"
                value={captchaCode}
                onChangeText={setCaptchaCode}
                autoCapitalize="characters"
                maxLength={6}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.primaryButton, loginLoading && styles.disabledButton]} 
                onPress={handleLogin}
                disabled={loginLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {loginLoading 
                    ? (loginMode === 'signup' ? 'Signing Up...' : 'Logging In...') 
                    : (loginMode === 'signup' ? 'Sign Up' : 'Login')}
                </Text>
              </Pressable>
            </View>
            
            <View style={styles.divider} />
            
            <Pressable style={styles.demoButton} onPress={handleDemoLogin}>
              <Text style={styles.demoButtonText}>🚀 Quick Demo Login</Text>
            </Pressable>
            
            <Pressable 
              style={styles.cancelButton} 
              onPress={() => {
                setShowLoginModal(false);
                resetLoginForm();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Profile Menu Modal */}
      <Modal
        visible={showProfileMenu}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowProfileMenu(false)}
        >
          <View style={[styles.profileMenu, { top: bannerHeight + 10 }]}>
            <Pressable 
              style={styles.menuItem}
              onPress={() => {
                setShowProfileMenu(false);
                setShowProfileModal(true);
                console.log('Opening profile modal for user:', user?.name);
              }}
            >
              <Text style={styles.menuItemText}>Profile</Text>
            </Pressable>
            <Pressable 
              style={styles.menuItem}
              onPress={() => {
                setShowProfileMenu(false);
                setShowOrdersModal(true);
              }}
            >
              <Text style={styles.menuItemText}>Orders</Text>
            </Pressable>
            <Pressable 
              style={styles.menuItem}
              onPress={() => {
                setShowProfileMenu(false);
                setShowAddressesModal(true);
              }}
            >
              <Text style={styles.menuItemText}>Addresses</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable style={styles.menuItem} onPress={handleLogout}>
              <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Profile Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.fullScreenHeader}>
            <Pressable onPress={() => setShowProfileModal(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseButtonText}>×</Text>
            </Pressable>
            <Text style={styles.fullScreenTitle}>Profile</Text>
            <View style={styles.headerSpacer} />
          </View>
          <ProfileSection />
        </View>
      </Modal>

      {/* Orders Modal */}
      <Modal
        visible={showOrdersModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowOrdersModal(false)}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.fullScreenHeader}>
            <Pressable onPress={() => setShowOrdersModal(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseButtonText}>×</Text>
            </Pressable>
            <Text style={styles.fullScreenTitle}>Orders</Text>
            <View style={styles.headerSpacer} />
          </View>
          <OrdersSection />
        </View>
      </Modal>

      {/* Addresses Modal */}
      <Modal
        visible={showAddressesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddressesModal(false)}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.fullScreenHeader}>
            <Pressable onPress={() => setShowAddressesModal(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseButtonText}>×</Text>
            </Pressable>
            <Text style={styles.fullScreenTitle}>Addresses</Text>
            <View style={styles.headerSpacer} />
          </View>
          <AddressesSection />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    overflow: 'hidden',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  brandPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  brandText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartButton: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  cartIcon: {
    fontSize: 16,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  authContainer: {
    alignItems: 'flex-end',
  },
  authButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 60,
  },
  authButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  userName: {
    color: '#000',
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 80,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#E2D8A5',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  countryCode: {
    backgroundColor: '#E2D8A5',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  toggleButtonActive: {
    backgroundColor: '#000',
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  captchaContainer: {
    marginBottom: 16,
  },
  captchaLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  captchaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  captchaText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 3,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  refreshCaptcha: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  refreshCaptchaText: {
    fontSize: 16,
  },
  captchaInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  disabledButton: {
    opacity: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  demoButton: {
    backgroundColor: '#E2D8A5',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  demoButtonText: {
    color: '#495057',
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  modalButtons: {
    gap: 8,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
  },
  profileMenu: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#E2D8A5',
    borderRadius: 8,
    paddingVertical: 8,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 14,
    color: '#000',
  },
  logoutText: {
    color: '#e74c3c',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },
  // Full Screen Modal Styles
  fullScreenModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fullScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 24,
    color: '#65676b',
    fontWeight: '300',
  },
  fullScreenTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  headerSpacer: {
    width: 40,
  },
});

export default Banner;