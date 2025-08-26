import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  Switch,
} from 'react-native';
import { useProfile } from '../contexts/ProfileContext';
import { useAuth } from '../contexts/AuthContext';
import { UpdateProfileRequest } from '../types/Profile';

const ProfileSection: React.FC = () => {
  const { profile, loading, updateProfile, refreshProfile } = useProfile();
  const { user, isAuthenticated } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<UpdateProfileRequest>({});

  console.log('ProfileSection: Rendering', { 
    profileExists: !!profile, 
    loading, 
    userName: user?.name,
    profileName: profile?.name 
  });

  const handleEditProfile = () => {
    if (!profile) return;
    
    setEditData({
      name: profile.name,
      phone: profile.phone,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      preferences: { ...profile.preferences },
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      console.log('ProfileSection: Starting profile save with data:', editData);
      await updateProfile(editData);
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('ProfileSection: Failed to save profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      Alert.alert('Error', `Failed to update profile: ${errorMessage}`);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString();
  };

  const getGenderDisplay = (gender: string | undefined) => {
    if (!gender) return 'Not specified';
    return gender.charAt(0).toUpperCase() + gender.slice(1).replace('_', ' ');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Profile not found</Text>
          <Text style={styles.errorSubtext}>Please try logging in again</Text>
          <Text style={styles.debugText}>
            Debug: User: {user ? `${user.name} (${user.id})` : 'No user'}
          </Text>
          <Text style={styles.debugText}>
            Auth: {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
          </Text>
          <Text style={styles.debugText}>
            Loading: {loading ? 'Yes' : 'No'}
          </Text>
          {user && isAuthenticated && (
            <Pressable 
              style={styles.refreshButton} 
              onPress={() => refreshProfile()}
            >
              <Text style={styles.refreshButtonText}>🔄 Refresh Profile</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.name.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileEmail}>{profile.email}</Text>
        <Pressable style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile.totalOrders}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₹{profile.totalSpent.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile.loyaltyPoints}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{profile.name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{profile.phone || 'Not provided'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Date of Birth</Text>
            <Text style={styles.infoValue}>{formatDate(profile.dateOfBirth)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>{getGenderDisplay(profile.gender)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>{formatDate(profile.joinedDate)}</Text>
          </View>
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.preferencesList}>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Newsletter</Text>
            <Text style={styles.preferenceValue}>
              {profile.preferences.newsletter ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>SMS Updates</Text>
            <Text style={styles.preferenceValue}>
              {profile.preferences.smsUpdates ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Email Updates</Text>
            <Text style={styles.preferenceValue}>
              {profile.preferences.emailUpdates ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Push Notifications</Text>
            <Text style={styles.preferenceValue}>
              {profile.preferences.pushNotifications ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowEditModal(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseButtonText}>×</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Pressable style={styles.modalSaveButton} onPress={handleSaveProfile}>
              <Text style={styles.modalSaveButtonText}>Save</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Basic Info */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.name}
                  onChangeText={(text) => setEditData({ ...editData, name: text })}
                  placeholder="Your full name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.phone}
                  onChangeText={(text) => setEditData({ ...editData, phone: text })}
                  placeholder="Your phone number"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.dateOfBirth ? editData.dateOfBirth.toISOString().split('T')[0] : ''}
                  onChangeText={(text) => {
                    try {
                      const date = text && text.trim() ? new Date(text) : undefined;
                      // Check if date is valid
                      if (date && !isNaN(date.getTime())) {
                        setEditData({ ...editData, dateOfBirth: date });
                      } else if (!text || text.trim() === '') {
                        // Allow clearing the date
                        setEditData({ ...editData, dateOfBirth: undefined });
                      }
                    } catch (error) {
                      console.log('Invalid date input:', text);
                      // Don't update state with invalid date
                    }
                  }}
                  placeholder="YYYY-MM-DD"
                />
                <Text style={styles.inputHelperText}>Format: YYYY-MM-DD (e.g., 1990-05-15)</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.genderOptions}>
                  {['male', 'female', 'other', 'prefer_not_to_say'].map((option) => (
                    <Pressable
                      key={option}
                      style={[
                        styles.genderOption,
                        editData.gender === option && styles.genderOptionSelected
                      ]}
                      onPress={() => setEditData({ ...editData, gender: option as any })}
                    >
                      <Text style={[
                        styles.genderOptionText,
                        editData.gender === option && styles.genderOptionTextSelected
                      ]}>
                        {option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            {/* Preferences */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Notification Preferences</Text>
              
              <View style={styles.switchGroup}>
                <View style={styles.switchItem}>
                  <Text style={styles.switchLabel}>Newsletter</Text>
                  <Switch
                    value={editData.preferences?.newsletter ?? false}
                    onValueChange={(value) => setEditData({
                      ...editData,
                      preferences: { ...editData.preferences, newsletter: value }
                    })}
                  />
                </View>

                <View style={styles.switchItem}>
                  <Text style={styles.switchLabel}>SMS Updates</Text>
                  <Switch
                    value={editData.preferences?.smsUpdates ?? false}
                    onValueChange={(value) => setEditData({
                      ...editData,
                      preferences: { ...editData.preferences, smsUpdates: value }
                    })}
                  />
                </View>

                <View style={styles.switchItem}>
                  <Text style={styles.switchLabel}>Email Updates</Text>
                  <Switch
                    value={editData.preferences?.emailUpdates ?? false}
                    onValueChange={(value) => setEditData({
                      ...editData,
                      preferences: { ...editData.preferences, emailUpdates: value }
                    })}
                  />
                </View>

                <View style={styles.switchItem}>
                  <Text style={styles.switchLabel}>Push Notifications</Text>
                  <Switch
                    value={editData.preferences?.pushNotifications ?? false}
                    onValueChange={(value) => setEditData({
                      ...editData,
                      preferences: { ...editData.preferences, pushNotifications: value }
                    })}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
  },
  debugText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingVertical: 20,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#eee',
  },
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  preferencesList: {
    gap: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preferenceLabel: {
    fontSize: 14,
    color: '#666',
  },
  preferenceValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  modalSaveButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalSaveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
  },
  inputHelperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  genderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  genderOptionSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  genderOptionText: {
    fontSize: 14,
    color: '#666',
  },
  genderOptionTextSelected: {
    color: '#fff',
  },
  switchGroup: {
    gap: 16,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    color: '#666',
  },
});

export default ProfileSection;