import React, { useEffect, useState, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, TouchableOpacity,
  TextInput, RefreshControl, Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { driverAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Driver } from '../../types';
import DriverCard from '../../components/drivers/DriverCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../utils/colors';

const DriverListScreen: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigation = useNavigation<any>();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filtered, setFiltered] = useState<Driver[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await driverAPI.getAll();
      const data: Driver[] = Array.isArray(res.data) ? res.data : [];
      setDrivers(data); setFiltered(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load drivers' });
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(drivers.filter((d) =>
      d.name.toLowerCase().includes(q) ||
      d.phone.includes(q) ||
      (d.licenseNumber?.toLowerCase().includes(q) ?? false)
    ));
  }, [search, drivers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await driverAPI.delete(deleteTarget);
      Toast.show({ type: 'success', text1: 'Driver deleted' });
      load();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not delete driver' });
    } finally { setDeleteTarget(null); }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('DriverForm', {})} style={styles.addBtn}>
          <Ionicons name="add-circle" size={28} color={Colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  if (loading) return <LoadingSpinner fullScreen message="Loading drivers..." />;

  return (
    <View style={styles.container}>
      {/* Count badge */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{filtered.length} driver{filtered.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, Shadows.sm]}>
        <Ionicons name="search-outline" size={18} color={Colors.gray400} />
        <TextInput
          value={search} onChangeText={setSearch}
          placeholder="Search drivers..." placeholderTextColor={Colors.gray400}
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
          <EmptyState icon="person-outline" title="No drivers found"
            message={search ? 'Try a different search term' : 'Add your first driver'} />
        }
        renderItem={({ item }) => (
          <DriverCard driver={item} isAdmin={isAdmin}
            onEdit={() => navigation.navigate('DriverForm', { id: item._id })}
            onDelete={() => setDeleteTarget(item._id)} />
        )}
      />

      <ConfirmModal visible={!!deleteTarget}
        title="Delete Driver"
        message="Are you sure you want to delete this driver? This action cannot be undone."
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

export default DriverListScreen;
