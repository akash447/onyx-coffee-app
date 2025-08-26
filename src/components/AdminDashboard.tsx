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
  Platform,
  FlatList,
} from 'react-native';
import { CatalogItem } from '../../../src/types';
import { useCatalog } from '../contexts/CatalogContext';
import { Typography, FontConfig } from '../utils/fonts';
import ContentController from './ContentController';

const AdminDashboard: React.FC = () => {
  const { items: catalog, addItem, updateItem, deleteItem, clearItems } = useCatalog();
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeAdminSection, setActiveAdminSection] = useState<'catalog' | 'content'>('catalog');

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
    console.log('openEditModal called with item:', item);
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
      console.log('Form data set for editing:', formData);
    } else {
      console.log('Opening new product modal, resetting form');
      resetForm();
      console.log('Form data after reset:', formData);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    console.log('=== SAVE BUTTON PRESSED ===');
    console.log('handleSave called with formData:', formData);
    
    console.log('Validation check:');
    console.log('Name:', formData.name.trim());
    console.log('Price:', formData.price);
    console.log('Image:', formData.image.trim());
    
    if (!formData.name.trim() || !formData.price) {
      console.log('VALIDATION FAILED - Missing required fields');
      Alert.alert('Validation Error', 'Please fill in required fields: Name and Price');
      return;
    }
    
    console.log('Validation passed, proceeding with save...');

    setLoading(true);

    try {
      const itemData = {
        name: formData.name.trim(),
        desc: formData.desc.trim(),
        price: parseFloat(formData.price),
        image: formData.image.trim() || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
        rating: parseFloat(formData.rating) || 0,
        reviews: parseInt(formData.reviews) || 0,
        category: formData.category.trim() || undefined,
        roastProfile: (formData.roastProfile as 'light' | 'medium' | 'dark') || undefined,
        brewStyle: (formData.brewStyle as 'espresso' | 'filter' | 'french-press') || undefined,
        flavorNotes: formData.flavorNotes.trim() 
          ? formData.flavorNotes.split(',').map(note => note.trim()).filter(note => note)
          : undefined,
      };

      console.log('About to save item:', itemData);
      console.log('editingItem:', editingItem);

      if (editingItem) {
        // Update existing item
        const updatedItem: CatalogItem = {
          ...itemData,
          id: editingItem.id,
        };
        console.log('Updating item:', updatedItem);
        await updateItem(updatedItem);
      } else {
        // Add new item
        console.log('Adding new item:', itemData);
        await addItem(itemData);
      }

      console.log('Item saved successfully');
      setShowModal(false);
      resetForm();
      Alert.alert('Success', editingItem ? 'Item updated successfully' : 'Item added successfully');
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', `Failed to save item: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    console.log('handleDelete called with id:', id);
    
    let confirmed = false;
    
    if (Platform.OS === 'web') {
      console.log('Showing delete confirmation dialog...');
      try {
        confirmed = confirm(
          'Are you sure you want to delete this product?\n\n' +
          'This action will permanently remove the item from your catalog and cannot be undone.\n\n' +
          'Click OK to delete, or Cancel to abort.'
        );
        console.log('Delete confirmation result:', confirmed);
      } catch (error) {
        console.error('Error with confirm dialog:', error);
        confirmed = false;
      }
    } else {
      Alert.alert(
        'Delete Product',
        'Are you sure you want to delete this product?\n\nThis action will permanently remove the item from your catalog and cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => { confirmed = true; } }
        ]
      );
    }
    
    if (confirmed) {
      try {
        console.log('Deleting item with id:', id);
        await deleteItem(id);
        console.log('Item deleted successfully');
        
        if (Platform.OS === 'web') {
          alert('Item deleted successfully');
        } else {
          Alert.alert('Success', 'Item deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        
        if (Platform.OS === 'web') {
          alert('Failed to delete item');
        } else {
          Alert.alert('Error', 'Failed to delete item');
        }
      }
    } else {
      console.log('Delete cancelled by user');
    }
  };

  const handleClear = async () => {
    console.log('handleClear called');
    
    let confirmed = false;
    
    if (Platform.OS === 'web') {
      console.log('Showing Clear All confirmation dialog...');
      try {
        confirmed = confirm(
          '⚠️  WARNING: CLEAR ALL PRODUCTS  ⚠️\n\n' +
          'This action will permanently delete ALL products from your catalog.\n\n' +
          'What this means:\n' +
          '• All ' + catalog.length + ' products will be removed\n' +
          '• The catalog will be completely empty\n' +
          '• This action cannot be undone\n' +
          '• You will need to re-add products manually\n\n' +
          'Click OK to proceed with clearing everything, or Cancel to abort.'
        );
        console.log('Clear All confirmation result:', confirmed);
      } catch (error) {
        console.error('Error with confirm dialog:', error);
        confirmed = false;
      }
    } else {
      Alert.alert(
        '⚠️  Clear All Products',
        'This action will permanently delete ALL products from your catalog.\n\n' +
        'What this means:\n' +
        '• All ' + catalog.length + ' products will be removed\n' +
        '• The catalog will be completely empty\n' +
        '• This action cannot be undone\n' +
        '• You will need to re-add products manually',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear All', style: 'destructive', onPress: () => { confirmed = true; } }
        ]
      );
    }
    
    if (confirmed) {
      try {
        console.log('Clearing all items...');
        await clearItems();
        console.log('All items cleared successfully');
        
        if (Platform.OS === 'web') {
          alert('✅ Success: All products have been cleared from the catalog');
        } else {
          Alert.alert('Success', 'All products have been cleared from the catalog');
        }
      } catch (error) {
        console.error('Error clearing items:', error);
        
        if (Platform.OS === 'web') {
          alert('❌ Error: Failed to clear items');
        } else {
          Alert.alert('Error', 'Failed to clear items');
        }
      }
    } else {
      console.log('Clear all cancelled by user');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onyx Coffee - Admin Dashboard</Text>
      <Text style={styles.subtitle}>Manage products, content, and website settings</Text>

      {/* Admin Section Toggle */}
      <View style={styles.sectionToggle}>
        <Pressable
          style={[
            styles.toggleButton,
            activeAdminSection === 'catalog' && styles.activeToggleButton
          ]}
          onPress={() => setActiveAdminSection('catalog')}
        >
          <Text style={[
            styles.toggleButtonText,
            activeAdminSection === 'catalog' && styles.activeToggleButtonText
          ]}>
            📦 Product Catalog
          </Text>
        </Pressable>
        
        <Pressable
          style={[
            styles.toggleButton,
            activeAdminSection === 'content' && styles.activeToggleButton
          ]}
          onPress={() => setActiveAdminSection('content')}
        >
          <Text style={[
            styles.toggleButtonText,
            activeAdminSection === 'content' && styles.activeToggleButtonText
          ]}>
            📝 Content Controller
          </Text>
        </Pressable>
      </View>

      {/* Render Active Section */}
      {activeAdminSection === 'catalog' ? renderProductCatalog() : <ContentController />}
    </View>
  );

  function renderProductCatalog() {
    return (
      <View style={styles.catalogSection}>

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

      {/* Products Grid - Same as Explore Products */}
      <View style={styles.productsSection}>
        <Text style={styles.sectionTitle}>Product Catalog ({catalog.length} items)</Text>
        
        {catalog.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No products found. Add your first product!</Text>
          </View>
        ) : (
          <FlatList
            data={catalog}
            numColumns={4}
            key={4} // Force re-render when columns change
            renderItem={({ item }) => (
              <View style={[styles.adminGridItem, { flex: 1, maxWidth: '25%' }]}>
                <View style={styles.adminProductCard}>
                  {/* Product Image */}
                  <View style={styles.adminImageContainer}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.adminImage}
                      resizeMode="cover"
                    />
                  </View>

                  <View style={styles.adminContent}>
                    <Text style={styles.adminProductName} numberOfLines={1}>
                      {item.name}
                    </Text>

                    {/* Product Description */}
                    <Text style={styles.adminDescription} numberOfLines={2}>
                      {item.desc}
                    </Text>

                    {/* Rating and Reviews */}
                    <View style={styles.adminRatingContainer}>
                      <Text style={styles.adminStars}>⭐ {item.rating}</Text>
                      <Text style={styles.adminRatingText}>({item.reviews})</Text>
                    </View>

                    {/* Price */}
                    <Text style={styles.adminPrice}>₹{item.price}</Text>

                    {/* Admin Action Buttons */}
                    <View style={styles.adminActionButtons}>
                      <Pressable
                        style={styles.adminEditButton}
                        onPress={() => openEditModal(item)}
                      >
                        <Text style={styles.adminEditButtonText}>Edit</Text>
                      </Pressable>

                      <Pressable
                        style={styles.adminDeleteButton}
                        onPress={() => handleDelete(item.id)}
                      >
                        <Text style={styles.adminDeleteButtonText}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.adminGridContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

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
                onChangeText={(text) => {
                  console.log('Name field changed to:', text);
                  setFormData({...formData, name: text});
                  console.log('FormData after name change:', {...formData, name: text});
                }}
                placeholder=""
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={formData.desc}
                onChangeText={(text) => setFormData({...formData, desc: text})}
                placeholder=""
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
                  onChangeText={(text) => {
                    console.log('Price field changed to:', text);
                    setFormData({...formData, price: text});
                  }}
                  placeholder=""
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.formColumn}>
                <Text style={styles.label}>Rating (0-5)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.rating}
                  onChangeText={(text) => setFormData({...formData, rating: text})}
                  placeholder=""
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
                  placeholder=""
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.formColumn}>
                <Text style={styles.label}>Category</Text>
                <TextInput
                  style={styles.input}
                  value={formData.category}
                  onChangeText={(text) => setFormData({...formData, category: text})}
                  placeholder=""
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Image URL</Text>
              <TextInput
                style={styles.input}
                value={formData.image}
                onChangeText={(text) => {
                  console.log('Image field changed to:', text);
                  setFormData({...formData, image: text});
                }}
                placeholder=""
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.label}>Roast Profile</Text>
                <TextInput
                  style={styles.input}
                  value={formData.roastProfile}
                  onChangeText={(text) => setFormData({...formData, roastProfile: text})}
                  placeholder=""
                />
              </View>
              <View style={styles.formColumn}>
                <Text style={styles.label}>Brew Style</Text>
                <TextInput
                  style={styles.input}
                  value={formData.brewStyle}
                  onChangeText={(text) => setFormData({...formData, brewStyle: text})}
                  placeholder=""
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Flavor Notes (comma-separated)</Text>
              <TextInput
                style={styles.input}
                value={formData.flavorNotes}
                onChangeText={(text) => setFormData({...formData, flavorNotes: text})}
                placeholder=""
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable 
                style={styles.saveButton}
                onPress={() => {
                  console.log('Save button physically clicked');
                  handleSave();
                }}
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
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2D8A5',
    padding: 16,
  },
  title: {
    ...Typography.h1,
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.body,
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
  sectionToggle: {
    flexDirection: 'row',
    backgroundColor: '#E2D8A5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 20,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  activeToggleButton: {
    backgroundColor: '#000',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  activeToggleButtonText: {
    color: '#fff',
  },
  catalogSection: {
    flex: 1,
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
    backgroundColor: '#E2D8A5',
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
    backgroundColor: '#E2D8A5',
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
    backgroundColor: '#E2D8A5',
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
  
  // Admin Grid Styles - Same as Explore Products
  productsSection: {
    flex: 1,
  },
  adminGridContainer: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  adminGridItem: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    minWidth: 0,
  },
  adminProductCard: {
    backgroundColor: '#E2D8A5',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  adminImageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#E2D8A5',
    borderRadius: 8,
    borderWidth: 12,
    borderColor: '#e9ecef',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 2,
  },
  adminImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4, // Rounded corners for the image inside the frame
  },
  adminContent: {
    padding: 6,
  },
  adminProductName: {
    ...Typography.productTitle,
    color: '#000',
    marginBottom: 2,
  },
  adminDescription: {
    ...Typography.productDescription,
    color: '#666',
    marginBottom: 3,
  },
  adminRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    gap: 2,
  },
  adminStars: {
    fontSize: 10,
    color: '#ffa500',
  },
  adminRatingText: {
    fontSize: 9,
    color: '#6c757d',
  },
  adminPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  adminActionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  adminEditButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 4,
    paddingVertical: 5,
    alignItems: 'center',
  },
  adminEditButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  adminDeleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    borderRadius: 4,
    paddingVertical: 5,
    alignItems: 'center',
  },
  adminDeleteButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default AdminDashboard;