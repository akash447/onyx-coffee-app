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
import { DeviceType } from '../types';

interface BannerProps {
  deviceType: DeviceType;
  imageUrl?: string;
  onCartPress?: () => void;
}

const Banner: React.FC<BannerProps> = ({ deviceType, imageUrl, onCartPress }) => {
  const { user, isAuthenticated, login, logout, demoLogin, loading } = useAuth();
  const { itemCount } = useCart();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const { width } = Dimensions.get('window');
  const isDesktop = deviceType === 'desktop';
  
  // Calculate banner height based on device type
  const bannerHeight = isDesktop 
    ? Math.max(140, Math.min(240, width * 0.2)) 
    : Math.max(88, Math.min(180, width * 0.13));

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    
    setOtpLoading(true);
    try {
      // Simulate OTP sending - replace with real SMS API
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOtpSent(true);
      Alert.alert('📱 OTP Sent!', `Verification code sent to +91 ${phoneNumber}\n\n(Demo: Use 123456 as OTP)`);
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit verification code.');
      return;
    }

    if (otp !== '123456') {
      Alert.alert('❌ Invalid OTP', 'Please check the verification code and try again.');
      return;
    }

    try {
      // Create user from phone number
      const user = {
        id: `phone_${phoneNumber}`,
        name: `User ${phoneNumber.slice(-4)}`,
        email: `+91${phoneNumber}@onyx-coffee.com`,
        phone: `+91${phoneNumber}`,
        initials: 'U',
      };
      
      await login(user.email, 'phone_auth');
      setShowLoginModal(false);
      resetPhoneForm();
      Alert.alert('✅ Welcome!', `Successfully logged in with +91 ${phoneNumber}`);
    } catch (error) {
      Alert.alert('Login Failed', 'Please try again.');
    }
  };

  const resetPhoneForm = () => {
    setPhoneNumber('');
    setOtp('');
    setOtpSent(false);
    setOtpLoading(false);
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
          source={{ uri: imageUrl || 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200' }}
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
              <Text style={styles.brandText}>Onyx Coffee</Text>
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
            <Text style={styles.modalTitle}>🇮🇳 Login with Mobile Number</Text>
            <Text style={styles.modalSubtitle}>Enter your mobile number to receive OTP</Text>
            
            {!otpSent ? (
              <>
                <View style={styles.phoneInputContainer}>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Mobile Number (10 digits)"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
                
                <View style={styles.modalButtons}>
                  <Pressable 
                    style={[styles.primaryButton, otpLoading && styles.disabledButton]} 
                    onPress={handleSendOtp}
                    disabled={otpLoading}
                  >
                    <Text style={styles.primaryButtonText}>
                      {otpLoading ? 'Sending OTP...' : 'Send OTP'}
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.otpSentText}>
                  📱 OTP sent to +91 {phoneNumber}
                </Text>
                
                <TextInput
                  style={styles.otpInput}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                
                <View style={styles.modalButtons}>
                  <Pressable style={styles.primaryButton} onPress={handleVerifyOtp}>
                    <Text style={styles.primaryButtonText}>Verify OTP</Text>
                  </Pressable>
                  
                  <Pressable 
                    style={styles.secondaryButton} 
                    onPress={() => setOtpSent(false)}
                  >
                    <Text style={styles.secondaryButtonText}>Change Number</Text>
                  </Pressable>
                </View>
              </>
            )}
            
            <View style={styles.divider} />
            
            <Pressable style={styles.demoButton} onPress={handleDemoLogin}>
              <Text style={styles.demoButtonText}>🚀 Quick Demo Login</Text>
            </Pressable>
            
            <Pressable 
              style={styles.cancelButton} 
              onPress={() => {
                setShowLoginModal(false);
                resetPhoneForm();
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
            <Pressable style={styles.menuItem}>
              <Text style={styles.menuItemText}>Profile</Text>
            </Pressable>
            <Pressable style={styles.menuItem}>
              <Text style={styles.menuItemText}>Orders</Text>
            </Pressable>
            <Pressable style={styles.menuItem}>
              <Text style={styles.menuItemText}>Addresses</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable style={styles.menuItem} onPress={handleLogout}>
              <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
            </Pressable>
          </View>
        </Pressable>
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
  otpInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 4,
  },
  otpSentText: {
    fontSize: 14,
    color: '#27ae60',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
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
});

export default Banner;