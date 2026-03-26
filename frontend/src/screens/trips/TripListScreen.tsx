import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, Text, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { tripAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Trip } from '../../types';
import TripCard from '../../components/trips/TripCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../utils/colors';

const statusFilters = ['all', 'draft', 'submitted', 'completed'];

const TripListScreen: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigation = useNavigation<any>();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [completeTarget, setCompleteTarget] = useState<string | null>(null);

  const totalRef = useRef(0);

  const load = useCallback(async (pageNum = 1, status = filter) => {
    try {
      const params: any = { page: pageNum, limit: 15 };
      if (status !== 'all') params.status = status;
      const res = await tripAPI.getAll(params);
      const data = res.data?.data || [];
      totalRef.current = res.data?.pagination?.total || 0;
      if (pageNum === 1) setTrips(data);
      else setTrips((prev) => [...prev, ...data]);
      setHasMore(data.length >= 15);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load trips' });
    } finally { setLoading(false); setRefreshing(false); }
  }, [filter]);

  useEffect(() => { setLoading(true); setPage(1); load(1); }, [filter]);

  const onEndReached = () => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    load(next);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await tripAPI.delete(deleteTarget);
      Toast.show({ type: 'success', text1: 'Trip deleted' });
      setPage(1); load(1);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not delete trip' });
    } finally { setDeleteTarget(null); }
  };

  const handleComplete = async () => {
    if (!completeTarget) return;
    try {
      await tripAPI.complete(completeTarget);
      Toast.show({ type: 'success', text1: 'Trip completed!' });
      setPage(1); load(1);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not complete trip' });
    } finally { setCompleteTarget(null); }
  };

  if (loading && trips.length === 0) return <LoadingSpinner fullScreen message="Loading trips..." />;

  return (
    <View style={styles.container}>
      {/* Status filter chips */}
      <View style={styles.filterArea}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {statusFilters.map((s) => {
            const active = filter === s;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setFilter(s)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {s === 'all' ? 'All Trips' : s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <Text style={styles.countText}>{totalRef.current} total</Text>
      </View>

      <FlatList
        data={trips}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); setPage(1); load(1); }}
            tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState icon="map-outline" title="No trips found"
            message="Start by creating your first trip" />
        }
        renderItem={({ item, index }) => (
          <TripCard
            trip={item} index={index + 1}
            isAdmin={isAdmin}
            onPress={() => navigation.navigate('TripDetail', { id: item._id })}
            onEdit={() => navigation.navigate('TripForm', { id: item._id })}
            onDelete={() => setDeleteTarget(item._id)}
            onComplete={() => setCompleteTarget(item._id)}
          />
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, Shadows.lg]}
        onPress={() => navigation.navigate('TripForm', {})}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={26} color={Colors.white} />
      </TouchableOpacity>

      <ConfirmModal visible={!!deleteTarget}
        title="Delete Trip"
        message="Permanently delete this trip? All data will be lost."
        confirmText="Delete" destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)} />

      <ConfirmModal visible={!!completeTarget}
        title="Complete Trip"
        message="Mark this trip as completed? This confirms all financials."
        confirmText="Complete"
        onConfirm={handleComplete}
        onCancel={() => setCompleteTarget(null)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  filterArea: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row', alignItems: 'center',
  },
  filterScroll: { gap: 8, flexGrow: 1 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary, borderColor: Colors.primary,
  },
  chipText: {
    fontSize: Typography.fontSizeSm, fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
  },
  chipTextActive: { color: Colors.white },
  countText: {
    fontSize: Typography.fontSizeXs, color: Colors.textMuted,
    fontWeight: Typography.fontWeightMedium, marginLeft: 8,
  },
  list: { padding: Spacing.md, paddingTop: 4, paddingBottom: 80 },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
});

export default TripListScreen;
