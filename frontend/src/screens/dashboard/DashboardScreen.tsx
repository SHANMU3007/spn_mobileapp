import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet,
  RefreshControl, TouchableOpacity, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { vehicleAPI, driverAPI, tripAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import AnalyticsChart from '../../components/dashboard/AnalyticsChart';
import RecentTripItem from '../../components/dashboard/RecentTripItem';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Trip } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../utils/colors';

const { width } = Dimensions.get('window');

interface Stats {
  vehicles: number;
  drivers: number;
  trips: number;
  activeTrips: number;
  totalRevenue: number;
  completedTrips: number;
}

const getLastMonths = (n: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const labels: string[] = [];
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(months[d.getMonth()]);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return { labels, keys };
};

// ── Mini Stat Tile ──────────────────────────────────────────────────
const MiniStat: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color: string;
  bg: string;
}> = ({ icon, label, value, color, bg }) => (
  <View style={[miniS.card, Shadows.sm]}>
    <View style={[miniS.iconWrap, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={16} color={color} />
    </View>
    <Text style={miniS.value}>{value}</Text>
    <Text style={miniS.label}>{label}</Text>
  </View>
);
const miniS = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconWrap: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
  },
  label: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: Typography.fontWeightMedium,
    marginTop: 2,
  },
});

// ── Quick Action Button ─────────────────────────────────────────────
const QuickAction: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={qaS.btn} onPress={onPress} activeOpacity={0.7}>
    <View style={qaS.iconCircle}>
      <Ionicons name={icon} size={18} color={Colors.primary} />
    </View>
    <Text style={qaS.label}>{label}</Text>
  </TouchableOpacity>
);
const qaS = StyleSheet.create({
  btn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  label: {
    fontSize: 11,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

// ────────────────────────────────────────────────────────────────────
const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();

  const [stats, setStats] = useState<Stats>({
    vehicles: 0, drivers: 0, trips: 0, activeTrips: 0, totalRevenue: 0, completedTrips: 0,
  });
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [tripsChartData, setTripsChartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ data: [0, 0, 0, 0, 0, 0] }],
  });
  const [revenueChartData, setRevenueChartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ data: [0, 0, 0, 0, 0, 0] }],
  });
  const [statusData, setStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [vehiclesRes, driversRes, tripsRes] = await Promise.all([
        vehicleAPI.getAll(), driverAPI.getAll(), tripAPI.getAll({ limit: 200 }),
      ]);

      const allTrips: Trip[] = tripsRes.data?.data || [];
      const totalTrips = tripsRes.data?.pagination?.total || allTrips.length;
      const vehicles = Array.isArray(vehiclesRes.data) ? vehiclesRes.data.length : 0;
      const drivers = Array.isArray(driversRes.data) ? driversRes.data.length : 0;

      const activeTrips = allTrips.filter((t) => t.status === 'submitted').length;
      const completedTrips = allTrips.filter((t) => t.status === 'completed').length;
      const totalRevenue = allTrips.reduce((sum, t) => sum + (t.calculated?.totalHire || 0), 0);

      setStats({ vehicles, drivers, trips: totalTrips, activeTrips, totalRevenue, completedTrips });
      setRecentTrips([...allTrips].slice(0, 5));

      const { labels, keys } = getLastMonths(6);
      const tripsByMonth: Record<string, number> = {};
      const revenueByMonth: Record<string, number> = {};
      keys.forEach((k) => { tripsByMonth[k] = 0; revenueByMonth[k] = 0; });

      allTrips.forEach((trip) => {
        const d = new Date(trip.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (tripsByMonth[key] !== undefined) {
          tripsByMonth[key]++;
          revenueByMonth[key] += trip.calculated?.totalHire || 0;
        }
      });

      setTripsChartData({
        labels,
        datasets: [{ data: keys.map((k) => tripsByMonth[k]) }] as [{ data: number[] }],
      });
      setRevenueChartData({
        labels,
        datasets: [{ data: keys.map((k) => Math.round(revenueByMonth[k] / 1000)) }] as [{ data: number[] }],
      });

      const draft = allTrips.filter((t) => t.status === 'draft').length;
      const submitted = allTrips.filter((t) => t.status === 'submitted').length;
      const completed = allTrips.filter((t) => t.status === 'completed').length;
      setStatusData([
        { name: 'Completed', count: completed, color: Colors.success, legendFontColor: Colors.textSecondary, legendFontSize: 12 },
        { name: 'Active', count: submitted, color: Colors.primary, legendFontColor: Colors.textSecondary, legendFontSize: 12 },
        { name: 'Draft', count: draft, color: Colors.warning, legendFontColor: Colors.textSecondary, legendFontSize: 12 },
      ].filter((s) => s.count > 0));
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load dashboard data' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) return <LoadingSpinner fullScreen message="Loading dashboard..." />;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.userName}>{user?.name ?? 'User'} 👋</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── Revenue banner ─────────────────────────────────── */}
      <View style={[styles.revenueBanner, Shadows.sm]}>
        <View>
          <Text style={styles.revenueLabel}>Total Revenue</Text>
          <Text style={styles.revenueValue}>{formatCurrency(stats.totalRevenue)}</Text>
        </View>
        <View style={styles.revenueMeta}>
          <View style={styles.revenueMetaItem}>
            <View style={[styles.revenueDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.revenueMetaText}>{stats.completedTrips} completed</Text>
          </View>
          <View style={styles.revenueMetaItem}>
            <View style={[styles.revenueDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.revenueMetaText}>{stats.activeTrips} active</Text>
          </View>
        </View>
      </View>

      {/* ── Stats Row ──────────────────────────────────────── */}
      <View style={styles.statsRow}>
        <MiniStat icon="map-outline" label="Trips" value={stats.trips} color={Colors.primary} bg={Colors.primaryBg} />
        <MiniStat icon="bus-outline" label="Vehicles" value={stats.vehicles} color={Colors.info} bg={Colors.infoBg} />
        <MiniStat icon="people-outline" label="Drivers" value={stats.drivers} color={Colors.secondary} bg={Colors.secondaryBg} />
        <MiniStat icon="navigate-outline" label="Active" value={stats.activeTrips} color={Colors.chart.purple} bg={Colors.gray100} />
      </View>

      {/* ── Quick Actions ──────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={[styles.quickActionCard, Shadows.sm]}>
        <QuickAction icon="add-circle-outline" label="New Trip"
          onPress={() => navigation.navigate('Trips', { screen: 'TripForm' })} />
        <QuickAction icon="person-add-outline" label="Add Driver"
          onPress={() => navigation.navigate('Drivers', { screen: 'DriverForm' })} />
        <QuickAction icon="bus-outline" label="Add Vehicle"
          onPress={() => navigation.navigate('Vehicles', { screen: 'VehicleForm' })} />
        <QuickAction icon="list-outline" label="All Trips"
          onPress={() => navigation.navigate('Trips')} />
      </View>

      {/* ── Analytics ──────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Analytics</Text>
      <AnalyticsChart
        tripsData={tripsChartData}
        revenueData={revenueChartData}
        statusData={statusData}
      />

      {/* ── Recent Trips ────────────────────────────────────── */}
      {recentTrips.length > 0 && (
        <>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Recent Trips</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Trips')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.recentCard, Shadows.sm]}>
            {recentTrips.map((trip, idx) => (
              <RecentTripItem
                key={trip._id}
                trip={trip}
                isLast={idx === recentTrips.length - 1}
                onPress={() => navigation.navigate('Trips', { screen: 'TripDetail', params: { id: trip._id } })}
              />
            ))}
          </View>
        </>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  content: { paddingBottom: Spacing.xxl },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 56, paddingBottom: Spacing.sm,
  },
  greeting: {
    fontSize: Typography.fontSizeSm, color: Colors.textMuted,
  },
  userName: {
    fontSize: Typography.fontSizeXl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary, marginTop: 2,
  },
  logoutBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },

  // Revenue banner
  revenueBanner: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  revenueLabel: {
    fontSize: Typography.fontSizeXs, color: Colors.textMuted,
    fontWeight: Typography.fontWeightMedium,
  },
  revenueValue: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary, marginTop: 2,
  },
  revenueMeta: { gap: 6 },
  revenueMetaItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  revenueDot: { width: 8, height: 8, borderRadius: 4 },
  revenueMetaText: {
    fontSize: Typography.fontSizeXs, color: Colors.textSecondary,
  },

  // Stats
  statsRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: Spacing.md, marginTop: Spacing.md,
  },

  // Section
  sectionTitle: {
    fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg, marginBottom: Spacing.sm,
  },
  sectionRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingRight: Spacing.md,
  },
  seeAll: {
    fontSize: Typography.fontSizeSm, color: Colors.primary,
    fontWeight: Typography.fontWeightSemiBold,
  },

  // Quick actions
  quickActionCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    paddingVertical: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
  },

  // Recent
  recentCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
});

export default DashboardScreen;
