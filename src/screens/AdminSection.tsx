import React from 'react';
import { View, StyleSheet } from 'react-native';
import AdminDashboard from '../../cms/src/components/AdminDashboard';
import { DeviceType, PlatformType } from '../types';

interface AdminSectionProps {
  deviceType: DeviceType;
  platformType: PlatformType;
}

const AdminSection: React.FC<AdminSectionProps> = ({ deviceType, platformType }) => {
  return (
    <View style={styles.container}>
      <AdminDashboard />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default AdminSection;