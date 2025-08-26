import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { useProfile } from '../contexts/ProfileContext';
import { Address, CreateAddressRequest } from '../types/Profile';

const AddressesSection: React.FC = () => {
  const { addresses, loading, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useProfile();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressData, setAddressData] = useState<CreateAddressRequest>({
    type: 'home',
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    phoneNumber: '',
    isDefault: false,
  });

  const resetForm = () => {
    setAddressData({
      type: 'home',
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      phoneNumber: '',
      isDefault: false,
    });
  };

  const handleAddAddress = async () => {
    if (!addressData.name.trim() || !addressData.addressLine1.trim() || !addressData.city.trim() || 
        !addressData.state.trim() || !addressData.pincode.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    try {
      await addAddress(addressData);
      setShowAddModal(false);
      resetForm();
      Alert.alert('Success', 'Address added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add address. Please try again.');
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressData({
      type: address.type,
      name: address.name,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      phoneNumber: address.phoneNumber || '',
      isDefault: address.isDefault,
    });
    setShowEditModal(true);
  };

  const handleUpdateAddress = async () => {
    if (!editingAddress) return;

    if (!addressData.name.trim() || !addressData.addressLine1.trim() || !addressData.city.trim() || 
        !addressData.state.trim() || !addressData.pincode.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    try {
      await updateAddress(editingAddress.id, {
        type: addressData.type,
        name: addressData.name.trim(),
        addressLine1: addressData.addressLine1.trim(),
        addressLine2: addressData.addressLine2?.trim() || undefined,
        city: addressData.city.trim(),
        state: addressData.state.trim(),
        pincode: addressData.pincode.trim(),
        phoneNumber: addressData.phoneNumber?.trim() || undefined,
        isDefault: addressData.isDefault,
      });
      setShowEditModal(false);
      setEditingAddress(null);
      resetForm();
      Alert.alert('Success', 'Address updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update address. Please try again.');
    }
  };

  const handleDeleteAddress = (address: Address) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${address.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(address.id);
              Alert.alert('Success', 'Address deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (address: Address) => {
    if (address.isDefault) return;

    try {
      await setDefaultAddress(address.id);
    } catch (error) {
      Alert.alert('Error', 'Failed to set default address. Please try again.');
    }
  };

  const getAddressTypeIcon = (type: Address['type']) => {
    switch (type) {
      case 'home':
        return '🏠';
      case 'office':
        return '🏢';
      case 'other':
      default:
        return '📍';
    }
  };

  const getAddressTypeLabel = (type: Address['type']) => {
    switch (type) {
      case 'home':
        return 'Home';
      case 'office':
        return 'Office';
      case 'other':
      default:
        return 'Other';
    }
  };

  const renderAddressForm = () => (
    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
      {/* Address Type */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Address Type</Text>
        <View style={styles.typeOptions}>
          {(['home', 'office', 'other'] as const).map((type) => (
            <Pressable
              key={type}
              style={[
                styles.typeOption,
                addressData.type === type && styles.typeOptionSelected
              ]}
              onPress={() => setAddressData({ ...addressData, type })}
            >
              <Text style={styles.typeOptionIcon}>{getAddressTypeIcon(type)}</Text>
              <Text style={[
                styles.typeOptionText,
                addressData.type === type && styles.typeOptionTextSelected
              ]}>
                {getAddressTypeLabel(type)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Address Name *</Text>
        <TextInput
          style={styles.textInput}
          value={addressData.name}
          onChangeText={(text) => setAddressData({ ...addressData, name: text })}
          placeholder="e.g., Home, Office, Mom's Place"
        />
      </View>

      {/* Address Line 1 */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Address Line 1 *</Text>
        <TextInput
          style={styles.textInput}
          value={addressData.addressLine1}
          onChangeText={(text) => setAddressData({ ...addressData, addressLine1: text })}
          placeholder="Street address, Building name, etc."
          multiline
        />
      </View>

      {/* Address Line 2 */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Address Line 2</Text>
        <TextInput
          style={styles.textInput}
          value={addressData.addressLine2}
          onChangeText={(text) => setAddressData({ ...addressData, addressLine2: text })}
          placeholder="Landmark, Area, etc. (Optional)"
        />
      </View>

      {/* City and State */}
      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>City *</Text>
          <TextInput
            style={styles.textInput}
            value={addressData.city}
            onChangeText={(text) => setAddressData({ ...addressData, city: text })}
            placeholder="City"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>State *</Text>
          <TextInput
            style={styles.textInput}
            value={addressData.state}
            onChangeText={(text) => setAddressData({ ...addressData, state: text })}
            placeholder="State"
          />
        </View>
      </View>

      {/* Pincode */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Pincode *</Text>
        <TextInput
          style={styles.textInput}
          value={addressData.pincode}
          onChangeText={(text) => setAddressData({ ...addressData, pincode: text })}
          placeholder="6-digit pincode"
          keyboardType="number-pad"
          maxLength={6}
        />
      </View>

      {/* Phone Number */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          style={styles.textInput}
          value={addressData.phoneNumber}
          onChangeText={(text) => setAddressData({ ...addressData, phoneNumber: text })}
          placeholder="Contact number for delivery"
          keyboardType="phone-pad"
        />
      </View>

      {/* Set as Default */}
      <View style={styles.switchGroup}>
        <View style={styles.switchItem}>
          <Text style={styles.switchLabel}>Set as default address</Text>
          <Switch
            value={addressData.isDefault}
            onValueChange={(value) => setAddressData({ ...addressData, isDefault: value })}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderAddressCard = (address: Address) => (
    <View key={address.id} style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressTypeInfo}>
          <Text style={styles.addressIcon}>{getAddressTypeIcon(address.type)}</Text>
          <View style={styles.addressTitleContainer}>
            <Text style={styles.addressName}>{address.name}</Text>
            {address.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>
        </View>
        <Pressable style={styles.editButton} onPress={() => handleEditAddress(address)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
      </View>

      <Text style={styles.addressText}>
        {address.addressLine1}
        {address.addressLine2 && `, ${address.addressLine2}`}
        {'\n'}{address.city}, {address.state} - {address.pincode}
      </Text>

      {address.phoneNumber && (
        <Text style={styles.addressPhone}>📞 {address.phoneNumber}</Text>
      )}

      <View style={styles.addressActions}>
        {!address.isDefault && (
          <Pressable
            style={styles.actionButton}
            onPress={() => handleSetDefault(address)}
          >
            <Text style={styles.actionButtonText}>Set as Default</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteAddress(address)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Addresses</Text>
        <Text style={styles.subtitle}>Manage your delivery addresses</Text>
        <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>+ Add New Address</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.addressesList} showsVerticalScrollIndicator={false}>
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyText}>No addresses saved</Text>
            <Text style={styles.emptySubtext}>Add your first address to get started</Text>
          </View>
        ) : (
          <View style={styles.addressesContainer}>
            {addresses.map(renderAddressCard)}
          </View>
        )}
      </ScrollView>

      {/* Add Address Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => { setShowAddModal(false); resetForm(); }} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseButtonText}>×</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Add New Address</Text>
            <Pressable style={styles.modalSaveButton} onPress={handleAddAddress}>
              <Text style={styles.modalSaveButtonText}>Save</Text>
            </Pressable>
          </View>
          {renderAddressForm()}
        </View>
      </Modal>

      {/* Edit Address Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => { setShowEditModal(false); setEditingAddress(null); resetForm(); }} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseButtonText}>×</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Edit Address</Text>
            <Pressable style={styles.modalSaveButton} onPress={handleUpdateAddress}>
              <Text style={styles.modalSaveButtonText}>Update</Text>
            </Pressable>
          </View>
          {renderAddressForm()}
        </View>
      </Modal>
    </View>
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
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  addressesList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  addressesContainer: {
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  addressTitleContainer: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  defaultBadge: {
    backgroundColor: '#e7f3ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  defaultBadgeText: {
    fontSize: 10,
    color: '#1877f2',
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editButtonText: {
    fontSize: 12,
    color: '#65676b',
    fontWeight: '500',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#65676b',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  deleteButtonText: {
    color: '#e74c3c',
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
  inputGroup: {
    marginTop: 16,
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
  typeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  typeOptionSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  typeOptionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  typeOptionText: {
    fontSize: 12,
    color: '#666',
  },
  typeOptionTextSelected: {
    color: '#fff',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  switchGroup: {
    marginTop: 16,
    marginBottom: 20,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 14,
    color: '#666',
  },
});

export default AddressesSection;