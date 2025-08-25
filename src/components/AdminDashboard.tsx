import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Image,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CatalogItem } from '../../../src/types';

const AdminDashboard: React.FC = () => {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state for new/editing items
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    price: '',
    image: '',
    rating: '',
    reviews: '',
    category: '',
    roastProfile: '',
    brewStyle: '',
    flavorNotes: '',
  });

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      const catalogString = await AsyncStorage.getItem('bb-ci-catalog');
      if (catalogString) {
        const catalogData = JSON.parse(catalogString);
        setCatalog(catalogData);
      }
    } catch (error) {
      console.error('Failed to load catalog:', error);
      Alert.alert('Error', 'Failed to load catalog');
    }
  };

  const saveCatalog = async (newCatalog: CatalogItem[]) => {
    try {
      await AsyncStorage.setItem('bb-ci-catalog', JSON.stringify(newCatalog));
      setCatalog(newCatalog);
    } catch (error) {
      console.error('Failed to save catalog:', error);
      Alert.alert('Error', 'Failed to save catalog');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      desc: '',
      price: '',
      image: '',
      rating: '',
      reviews: '',
      category: '',
      roastProfile: '',
      brewStyle: '',
      flavorNotes: '',
    });
    setEditingItem(null);
  };

  const openEditModal = (item?: CatalogItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        desc: item.desc,
        price: item.price.toString(),
        image: item.image,
        rating: item.rating.toString(),
        reviews: item.reviews.toString(),
        category: item.category || '',
        roastProfile: item.roastProfile || '',
        brewStyle: item.brewStyle || '',
        flavorNotes: item.flavorNotes?.join(', ') || '',
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.price || !formData.image.trim()) {
      Alert.alert('Validation Error', 'Please fill in required fields: Name, Price, and Image URL');
      return;
    }

    setLoading(true);

    try {
      const newItem: CatalogItem = {
        id: editingItem?.id || Date.now().toString(),
        name: formData.name.trim(),
        desc: formData.desc.trim(),
        price: parseFloat(formData.price),
        image: formData.image.trim(),
        rating: parseFloat(formData.rating) || 0,
        reviews: parseInt(formData.reviews) || 0,
        category: formData.category.trim() || undefined,
        roastProfile: (formData.roastProfile as 'light' | 'medium' | 'dark') || undefined,
        brewStyle: (formData.brewStyle as 'espresso' | 'filter' | 'french-press') || undefined,
        flavorNotes: formData.flavorNotes.trim() 
          ? formData.flavorNotes.split(',').map(note => note.trim()).filter(note => note)
          : undefined,
      };

      let newCatalog;
      if (editingItem) {
        // Update existing item
        newCatalog = catalog.map(item => 
          item.id === editingItem.id ? newItem : item
        );
      } else {
        // Add new item
        newCatalog = [...catalog, newItem];
      }

      await saveCatalog(newCatalog);
      setShowModal(false);
      resetForm();
      Alert.alert('Success', editingItem ? 'Item updated successfully' : 'Item added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const newCatalog = catalog.filter(item => item.id !== id);
            await saveCatalog(newCatalog);
          },
        },
      ]
    );
  };

  const handleClear = async () => {
    Alert.alert(
      'Clear All Items',
      'Are you sure you want to clear all items? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await saveCatalog([]);
            Alert.alert('Success', 'All items cleared');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onyx Coffee - Admin Dashboard</Text>
      <Text style={styles.subtitle}>Central Inventory Management</Text>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable 
          style={styles.addButton}
          onPress={() => openEditModal()}
        >
          <Text style={styles.addButtonText}>Add New Product</Text>
        </Pressable>
        
        <Pressable 
          style={styles.clearButton}
          onPress={handleClear}
        >
          <Text style={styles.clearButtonText}>Clear All</Text>
        </Pressable>
      </View>

      {/* Products Grid */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Product Catalog ({catalog.length} items)</Text>
        
        {catalog.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No products found. Add your first product!</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {catalog.map((item) => (
              <View key={item.id} style={styles.productCard}>
                <Image 
                  source={{ uri: item.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.productPrice}>₹{item.price}</Text>
                  <View style={styles.productMeta}>
                    <Text style={styles.productRating}>
                      ⭐ {item.rating} ({item.reviews})
                    </Text>
                  </View>
                  <View style={styles.productActions}>
                    <Pressable 
                      style={styles.editButton}
                      onPress={() => openEditModal(item)}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </Pressable>
                    <Pressable 
                      style={styles.deleteButton}
                      onPress={() => handleDelete(item.id)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Edit/Add Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Product' : 'Add New Product'}
            </Text>
            <Pressable onPress={() => setShowModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                placeholder="Ethiopian Yirgacheffe"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={formData.desc}
                onChangeText={(text) => setFormData({...formData, desc: text})}
                placeholder="Bright and floral with notes of lemon and jasmine..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.label}>Price (₹) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(text) => setFormData({...formData, price: text})}
                  placeholder="899"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.formColumn}>
                <Text style={styles.label}>Rating (0-5)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.rating}
                  onChangeText={(text) => setFormData({...formData, rating: text})}
                  placeholder="4.5"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.label}>Reviews Count</Text>
                <TextInput
                  style={styles.input}
                  value={formData.reviews}
                  onChangeText={(text) => setFormData({...formData, reviews: text})}
                  placeholder="142"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.formColumn}>
                <Text style={styles.label}>Category</Text>
                <TextInput
                  style={styles.input}
                  value={formData.category}
                  onChangeText={(text) => setFormData({...formData, category: text})}
                  placeholder="Single Origin"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Image URL *</Text>
              <TextInput
                style={styles.input}
                value={formData.image}
                onChangeText={(text) => setFormData({...formData, image: text})}
                placeholder="https://example.com/image.jpg"
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.label}>Roast Profile</Text>
                <TextInput
                  style={styles.input}
                  value={formData.roastProfile}
                  onChangeText={(text) => setFormData({...formData, roastProfile: text})}
                  placeholder="light, medium, or dark"
                />
              </View>
              <View style={styles.formColumn}>
                <Text style={styles.label}>Brew Style</Text>
                <TextInput
                  style={styles.input}
                  value={formData.brewStyle}
                  onChangeText={(text) => setFormData({...formData, brewStyle: text})}
                  placeholder="espresso, filter, french-press"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Flavor Notes (comma-separated)</Text>
              <TextInput
                style={styles.input}
                value={formData.flavorNotes}
                onChangeText={(text) => setFormData({...formData, flavorNotes: text})}
                placeholder="floral, citrus, bright"
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable 
                style={styles.saveButton}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save'}
                </Text>
              </Pressable>
              <Pressable 
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  clearButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 6,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  productMeta: {
    marginBottom: 8,
  },
  productRating: {
    fontSize: 12,
    color: '#666',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    flex: 1,
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    flex: 1,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    fontSize: 18,
    color: '#666',
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  formColumn: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: 'white',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default AdminDashboard;