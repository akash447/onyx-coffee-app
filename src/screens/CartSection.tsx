import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { useCart } from '../contexts/CartContext';
import { DeviceType, PlatformType } from '../types';

interface CartSectionProps {
  deviceType: DeviceType;
  platformType: PlatformType;
  onBackToShopping?: () => void;
}

const CartSection: React.FC<CartSectionProps> = ({
  deviceType,
  platformType,
  onBackToShopping,
}) => {
  const { items, total, itemCount, updateQuantity, removeFromCart, clearCart } = useCart();
  const isDesktop = deviceType === 'desktop';

  const handleCheckout = () => {
    Alert.alert(
      '🚀 Proceed to Checkout',
      `Order Summary:\n${itemCount} items\nTotal: ₹${total}\n\nPayment integration coming soon!`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'Proceed', style: 'default' }
      ]
    );
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      Alert.alert(
        'Remove Item',
        'Remove this item from cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(productId) }
        ]
      );
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearCart }
      ]
    );
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[
            styles.title,
            isDesktop ? styles.desktopTitle : styles.mobileTitle
          ]}>
            Shopping Cart
          </Text>
        </View>

        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartIcon}>🛒</Text>
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartSubtitle}>
            Discover our amazing coffee collection and add your favorites!
          </Text>
          
          <Pressable 
            style={styles.continueShoppingButton}
            onPress={onBackToShopping}
          >
            <Text style={styles.continueShoppingButtonText}>Start Shopping</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[
          styles.title,
          isDesktop ? styles.desktopTitle : styles.mobileTitle
        ]}>
          Shopping Cart ({itemCount} items)
        </Text>
        
        <Pressable style={styles.clearButton} onPress={handleClearCart}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </Pressable>
      </View>

      <View style={styles.cartItems}>
        {items.map((item) => (
          <View key={item.product.id} style={styles.cartItem}>
            <View style={styles.itemImageContainer}>
              <Image
                source={{ uri: item.product.image }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            </View>

            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemPrice}>₹{item.product.price}</Text>
              
              <View style={styles.quantityContainer}>
                <Pressable
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </Pressable>
                
                <Text style={styles.quantityText}>{item.quantity}</Text>
                
                <Pressable
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.itemTotal}>
              <Text style={styles.itemTotalText}>
                ₹{item.product.price * item.quantity}
              </Text>
              <Pressable
                style={styles.removeButton}
                onPress={() => removeFromCart(item.product.id)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.cartSummary}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>₹{total}</Text>
        </View>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Shipping:</Text>
          <Text style={styles.totalValue}>₹{total > 999 ? 0 : 99}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.totalRow}>
          <Text style={styles.grandTotalLabel}>Total:</Text>
          <Text style={styles.grandTotalValue}>₹{total + (total > 999 ? 0 : 99)}</Text>
        </View>

        {total <= 999 && (
          <Text style={styles.shippingNote}>
            Add ₹{1000 - total} more for free shipping!
          </Text>
        )}
      </View>

      <View style={styles.checkoutSection}>
        <Pressable
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </Pressable>

        <Pressable
          style={styles.continueShoppingButton}
          onPress={onBackToShopping}
        >
          <Text style={styles.continueShoppingButtonText}>Continue Shopping</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: '600',
    color: '#000',
  },
  desktopTitle: {
    fontSize: 24,
  },
  mobileTitle: {
    fontSize: 18,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyCartIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyCartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptyCartSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  cartItems: {
    marginBottom: 24,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  removeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removeButtonText: {
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: '500',
  },
  cartSummary: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 8,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  shippingNote: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  checkoutSection: {
    gap: 12,
    marginBottom: 20,
  },
  checkoutButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  continueShoppingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueShoppingButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CartSection;