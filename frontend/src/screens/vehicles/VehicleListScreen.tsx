import React, { useEffect, useState, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, TouchableOpacity,
  TextInput, RefreshControl, Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { vehicleAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Vehicle } from '../../types';
import VehicleCard from '../../components/vehicles/VehicleCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../utils/colors';

const VehicleListScreen: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigation = useNavigation<any>();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filtered, setFiltered] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await vehicleAPI.getAll();
      const data: Vehicle[] = Array.isArray(res.data) ? res.data : [];
      setVehicles(data); setFiltered(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load vehicles' });
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(vehicles.filter((v) =>
      v.licenseNumber.toLowerCase().includes(q) ||
      v.ownerName.toLowerCase().includes(q)
    ));
  }, [search, vehicles]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await vehicleAPI.delete(deleteTarget);
      Toast.show({ type: 'success', text1: 'Vehicle deleted' });
      load();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not delete vehicle' });
    } finally { setDeleteTarget(null); }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('VehicleForm', {})} style={styles.addBtn}>
          <Ionicons name="add-circle" size={28} color={Colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  if (loading) return <LoadingSpinner fullScreen message="Loading vehicles..." />;

  return (
    <View style={styles.container}>
      <View style={styles.countRow}>
        <Text style={styles.countText}>{filtered.length} vehicle{filtered.length !== 1 ? 's' : ''}</Text>
      </View>

      <View style={[styles.searchWrap, Shadows.sm]}>
        <Ionicons name="search-outline" size={18} color={Colors.gray400} />
        <TextInput
          value={search} onChangeText={setSearch}
          placeholder="Search vehicles..." placeholderTextColor={Colors.gray400}
          style={styles.searchInput}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.gray400} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState icon="bus-outline" title="No vehicles found"
            message={search ? 'Try a different search term' : 'Add your first vehicle'} />
        }
        renderItem={({ item }) => (
          <VehicleCard vehicle={item} isAdmin={isAdmin}
            onEdit={() => navigation.navigate('VehicleForm', { id: item._id })}
            onDelete={() => setDeleteTarget(item._id)} />
        )}
      />

      <ConfirmModal visible={!!deleteTarget}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
        confirmText="Delete" destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  addBtn: { padding: 4, marginRight: 4 },
  countRow: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  countText: { fontSize: Typography.fontSizeSm, color: Colors.textMuted, fontWeight: Typography.fontWeightMedium },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md, marginHorizontal: Spacing.md,
    marginTop: Spacing.sm, marginBottom: Spacing.sm, gap: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: {
    flex: 1, paddingVertical: 12,
    fontSize: Typography.fontSizeMd, color: Colors.textPrimary,
  },
  list: { padding: Spacing.md, paddingTop: 4 },
});

export default VehicleListScreen;
