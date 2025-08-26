import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useProfile } from '../contexts/ProfileContext';
import { Order } from '../types/Profile';

const OrdersSection: React.FC = () => {
  const { orders, loading, getOrderHistory } = useProfile();

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return '#27ae60';
      case 'out_for_delivery':
        return '#3498db';
      case 'preparing':
        return '#f39c12';
      case 'confirmed':
        return '#2ecc71';
      case 'cancelled':
        return '#e74c3c';
      case 'pending':
      default:
        return '#95a5a6';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'preparing':
        return 'Preparing';
      case 'confirmed':
        return 'Confirmed';
      case 'cancelled':
        return 'Cancelled';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubtext}>Start shopping to see your orders here</Text>
        </View>
      </View>
    );
  }

  const renderOrderItem = (order: Order) => (
    <View key={order.id} style={styles.orderCard}>
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
          <Text style={styles.orderDate}>{formatDate(order.orderDate)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.itemsContainer}>
        {order.items.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <View style={styles.itemImageContainer}>
              {item.productImage ? (
                <Image source={{ uri: item.productImage }} style={styles.itemImage} />
              ) : (
                <View style={styles.itemImagePlaceholder}>
                  <Text style={styles.itemImagePlaceholderText}>☕</Text>
                </View>
              )}
            </View>
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.productName}</Text>
              {item.variant && (
                <Text style={styles.itemVariant}>{item.variant}</Text>
              )}
              <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            </View>
            <View style={styles.itemPrice}>
              <Text style={styles.itemPriceText}>₹{item.total.toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Order Summary */}
      <View style={styles.orderSummary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items ({order.items.length})</Text>
          <Text style={styles.summaryValue}>₹{order.subtotal.toFixed(2)}</Text>
        </View>
        {order.tax > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>₹{order.tax.toFixed(2)}</Text>
          </View>
        )}
        {order.deliveryFee > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>₹{order.deliveryFee.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{order.total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Order Timeline */}
      <View style={styles.orderTimeline}>
        <Text style={styles.timelineTitle}>Order Details</Text>
        
        <View style={styles.timelineItem}>
          <View style={styles.timelineIcon}>
            <Text style={styles.timelineIconText}>🛒</Text>
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineText}>Order placed</Text>
            <Text style={styles.timelineDate}>{formatDateTime(order.orderDate)}</Text>
          </View>
        </View>

        {order.status !== 'pending' && order.status !== 'cancelled' && (
          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Text style={styles.timelineIconText}>✅</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineText}>Order confirmed</Text>
              <Text style={styles.timelineDate}>Processing</Text>
            </View>
          </View>
        )}

        {(order.status === 'preparing' || order.status === 'out_for_delivery' || order.status === 'delivered') && (
          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Text style={styles.timelineIconText}>👨‍🍳</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineText}>Preparing your order</Text>
              <Text style={styles.timelineDate}>In progress</Text>
            </View>
          </View>
        )}

        {(order.status === 'out_for_delivery' || order.status === 'delivered') && (
          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Text style={styles.timelineIconText}>🚚</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineText}>Out for delivery</Text>
              {order.trackingId && (
                <Text style={styles.trackingId}>Tracking: {order.trackingId}</Text>
              )}
            </View>
          </View>
        )}

        {order.status === 'delivered' && order.actualDelivery && (
          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Text style={styles.timelineIconText}>📦</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineText}>Delivered</Text>
              <Text style={styles.timelineDate}>{formatDateTime(order.actualDelivery)}</Text>
            </View>
          </View>
        )}

        {order.status === 'cancelled' && (
          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Text style={styles.timelineIconText}>❌</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineText}>Order cancelled</Text>
            </View>
          </View>
        )}
      </View>

      {/* Delivery Address */}
      <View style={styles.deliveryAddress}>
        <Text style={styles.addressTitle}>Delivery Address</Text>
        <Text style={styles.addressText}>
          {order.deliveryAddress.addressLine1}
          {order.deliveryAddress.addressLine2 && `, ${order.deliveryAddress.addressLine2}`}
          {'\n'}{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
        </Text>
      </View>

      {/* Payment Info */}
      <View style={styles.paymentInfo}>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Payment Method</Text>
          <Text style={styles.paymentValue}>
            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
          </Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Payment Status</Text>
          <Text style={[
            styles.paymentValue,
            { color: order.paymentStatus === 'paid' ? '#27ae60' : '#f39c12' }
          ]}>
            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Orders</Text>
        <Text style={styles.subtitle}>Track and manage your orders</Text>
      </View>

      <View style={styles.ordersList}>
        {orders.map(renderOrderItem)}
      </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
  },
  ordersList: {
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  orderInfo: {},
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  itemsContainer: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemImageContainer: {
    marginRight: 12,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  itemImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImagePlaceholderText: {
    fontSize: 20,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  itemVariant: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  itemPrice: {
    alignItems: 'flex-end',
  },
  itemPriceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  orderSummary: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#000',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  orderTimeline: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineIconText: {
    fontSize: 16,
  },
  timelineContent: {
    flex: 1,
  },
  timelineText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 12,
    color: '#666',
  },
  trackingId: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '500',
  },
  deliveryAddress: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  paymentInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
});

export default OrdersSection;