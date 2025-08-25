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
import { DeviceType } from '../types';

interface BannerProps {
  deviceType: DeviceType;
  imageUrl?: string;
}

const Banner: React.FC<BannerProps> = ({ deviceType, imageUrl }) => {
  const { user, isAuthenticated, login, logout, demoLogin, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { width } = Dimensions.get('window');
  const isDesktop = deviceType === 'desktop';
  
  // Calculate banner height based on device type
  const bannerHeight = isDesktop 
    ? Math.max(140, Math.min(240, width * 0.2)) 
    : Math.max(88, Math.min(180, width * 0.13));

  const handleLogin = async () => {
    try {
      await login(email, password);
      setShowLoginModal(false);
      setEmail('');
      setPassword('');
    } catch (error) {
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
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

            {/* Auth button */}
            <View style={styles.authContainer}>
              {renderAuthButton()}
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
            <Text style={styles.modalTitle}>Login to Onyx</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <View style={styles.modalButtons}>
              <Pressable style={styles.primaryButton} onPress={handleLogin}>
                <Text style={styles.primaryButtonText}>Login</Text>
              </Pressable>
              
              <Pressable style={styles.secondaryButton} onPress={handleDemoLogin}>
                <Text style={styles.secondaryButtonText}>Demo Login</Text>
              </Pressable>
              
              <Pressable 
                style={styles.cancelButton} 
                onPress={() => setShowLoginModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
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
    backgroundColor: 'white',
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