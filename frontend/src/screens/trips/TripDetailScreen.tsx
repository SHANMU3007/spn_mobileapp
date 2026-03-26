import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet, RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { tripAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Trip, TripSegment, DieselEntry, ExpenseEntry, TransactionEntry } from '../../types';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import Button from '../../components/common/Button';
import { formatCurrency, formatDate, formatKm } from '../../utils/formatters';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../utils/colors';

// ─── Info Row
const Row: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string; value: string; valueColor?: string;
}> = ({ icon, label, value, valueColor }) => (
  <View style={rowStyle.wrap}>
    <View style={rowStyle.iconBox}>
      <Ionicons name={icon} size={14} color={Colors.primary} />
    </View>
    <View style={rowStyle.body}>
      <Text style={rowStyle.label}>{label}</Text>
      <Text style={[rowStyle.value, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  </View>
);
const rowStyle = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.gray100, gap: 10 },
  iconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  label: { fontSize: Typography.fontSizeXs, color: Colors.textMuted, marginBottom: 1 },
  value: { fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightMedium, color: Colors.textPrimary },
});

// ─── Section card
const Section: React.FC<{ title: string; count?: number; children: React.ReactNode }> = ({ title, count, children }) => (
  <View style={[sec.card, Shadows.sm]}>
    <View style={sec.header}>
      <Text style={sec.title}>{title}</Text>
      {count !== undefined ? (
        <View style={sec.countBadge}><Text style={sec.countText}>{count}</Text></View>
      ) : null}
    </View>
    {children}
  </View>
);
const sec = StyleSheet.create({
  card: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: 8 },
  title: { fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightBold, color: Colors.textPrimary },
  countBadge: { backgroundColor: Colors.primaryBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  countText: { fontSize: Typography.fontSizeXs, fontWeight: Typography.fontWeightBold, color: Colors.primary },
});

// ─── Finance tile
const FinTile: React.FC<{ label: string; value: string; bg: string; color: string }> = ({ label, value, bg, color }) => (
  <View style={[finS.tile, { backgroundColor: bg }]}>
    <Text style={finS.label}>{label}</Text>
    <Text style={[finS.value, { color }]}>{value}</Text>
  </View>
);
const finS = StyleSheet.create({
  tile: { flex: 1, minWidth: '46%', borderRadius: BorderRadius.lg, padding: Spacing.sm, alignItems: 'center', margin: 3 },
  label: { fontSize: 10, color: Colors.textSecondary, marginBottom: 4 },
  value: { fontSize: Typography.fontSizeLg, fontWeight: Typography.fontWeightBold },
});

// ─── Screen
const TripDetailScreen: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const tripId: string = route.params?.id;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await tripAPI.getById(tripId);
      setTrip(res.data);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load trip' });
    } finally { setLoading(false); setRefreshing(false); }
  }, [tripId]);

  useEffect(() => { load(); }, [load]);

  const handleComplete = async () => {
    try { await tripAPI.complete(tripId); Toast.show({ type: 'success', text1: 'Trip completed!' }); load(); }
    catch { Toast.show({ type: 'error', text1: 'Could not complete trip' }); }
    finally { setShowComplete(false); }
  };

  const handleDelete = async () => {
    try { await tripAPI.delete(tripId); Toast.show({ type: 'success', text1: 'Trip deleted' }); navigation.goBack(); }
    catch { Toast.show({ type: 'error', text1: 'Could not delete trip' }); }
    finally { setShowDelete(false); }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading trip..." />;
  if (!trip) return <View style={styles.container} />;

  const c = trip.calculated;
  const routeStr = trip.tripSegments?.length
    ? `${trip.tripSegments[0].from} → ${trip.tripSegments[trip.tripSegments.length - 1].to}`
    : `KM ${trip.startKm} → ${trip.endKm || '...'}`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
    >
      {/* Hero */}
      <View style={[styles.hero, Shadows.md]}>
        <View style={styles.heroTop}>
          <Text style={styles.routeTxt} numberOfLines={2}>{routeStr}</Text>
          <Badge status={trip.status} />
        </View>
        <View style={styles.heroMeta}>
          {[
            { icon: 'bus-outline' as const, value: trip.vehicle?.licenseNumber },
            { icon: 'speedometer-outline' as const, value: formatKm(trip.totalKm) },
            { icon: 'calendar-outline' as const, value: formatDate(trip.createdAt) },
          ].map((m, i) => (
            <View key={i} style={styles.metaItem}>
              <Ionicons name={m.icon} size={14} color={Colors.primary} />
              <Text style={styles.metaValue}>{m.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Financial Summary */}
      <Section title="Financial Summary">
        <View style={styles.finGrid}>
          <FinTile label="Total Hire" value={formatCurrency(c.totalHire)} bg={Colors.primaryBg} color={Colors.primary} />
          <FinTile label="Total Cost" value={formatCurrency(c.totalCost)} bg={Colors.dangerBg} color={Colors.danger} />
          <FinTile label="Received" value={formatCurrency(c.totalTransactionsReceived)} bg={Colors.successBg} color={Colors.success} />
          <FinTile label="Balance" value={formatCurrency(c.balance)} bg={c.balance >= 0 ? Colors.successBg : Colors.dangerBg} color={c.balance >= 0 ? Colors.success : Colors.danger} />
        </View>
        <Row icon="speedometer-outline" label="Mileage" value={c.mileage ? `${c.mileage} km/L` : '—'} />
        <Row icon="flame-outline" label="Diesel" value={`${c.totalDieselLitres}L — ${formatCurrency(c.totalDieselAmount)}`} valueColor={Colors.warning} />
        <Row icon="receipt-outline" label="Expenses" value={formatCurrency(c.totalExpenses)} valueColor={Colors.danger} />
        <Row icon="arrow-down-outline" label="Loading" value={formatCurrency(c.totalLoading)} />
        <Row icon="arrow-up-outline" label="Unloading" value={formatCurrency(c.totalUnloading)} />
        <Row icon="wallet-outline" label="Advance" value={formatCurrency(trip.advanceAmount)} />
      </Section>

      {/* Trip Info */}
      <Section title="Trip Info">
        <Row icon="person-outline" label="Primary Driver" value={trip.driver1?.name} />
        {trip.driver2 && <Row icon="people-outline" label="Secondary Driver" value={trip.driver2.name} />}
        <Row icon="speedometer-outline" label="Start KM" value={trip.startKm.toLocaleString('en-IN')} />
        <Row icon="flag-outline" label="End KM" value={trip.endKm ? trip.endKm.toLocaleString('en-IN') : '—'} />
        <Row icon="car-outline" label="Total KM" value={formatKm(trip.totalKm)} />
        <Row icon="calendar-outline" label="Created" value={formatDate(trip.createdAt)} />
        {trip.completedAt && <Row icon="checkmark-circle-outline" label="Completed" value={formatDate(trip.completedAt)} valueColor={Colors.success} />}
        {trip.completedBy && <Row icon="person-circle-outline" label="Completed By" value={trip.completedBy.name} />}
      </Section>

      {/* Segments */}
      {trip.tripSegments?.length > 0 && (
        <Section title="Trip Segments" count={trip.tripSegments.length}>
          {trip.tripSegments.map((seg: TripSegment, i: number) => (
            <View key={i} style={[styles.subCard, i < trip.tripSegments.length - 1 && styles.subCardBorder]}>
              <View style={styles.segHead}>
                <Text style={styles.segRoute}>{seg.from} → {seg.to}</Text>
                <Text style={styles.segHire}>{formatCurrency(seg.hireAmount)}</Text>
              </View>
              <View style={styles.segMeta}>
                {seg.loadType ? <Text style={styles.segTag}>{seg.loadType}</Text> : null}
                {seg.tonnage > 0 ? <Text style={styles.segTag}>{seg.tonnage}T</Text> : null}
                {seg.date ? <Text style={styles.segTag}>{formatDate(seg.date)}</Text> : null}
              </View>
            </View>
          ))}
        </Section>
      )}

      {/* Diesel */}
      {trip.dieselEntries?.length > 0 && (
        <Section title="Diesel Entries" count={trip.dieselEntries.length}>
          {trip.dieselEntries.map((d: DieselEntry, i: number) => (
            <View key={i} style={[styles.subCard, i < trip.dieselEntries.length - 1 && styles.subCardBorder]}>
              <View style={styles.listRow}>
                <Text style={styles.listLeft}>{d.date ? formatDate(d.date) : '—'}</Text>
                <Text style={styles.listRight}>{d.quantity}L — {formatCurrency(d.amount)}</Text>
              </View>
            </View>
          ))}
        </Section>
      )}

      {/* Expenses */}
      {trip.expenseEntries?.length > 0 && (
        <Section title="Expenses" count={trip.expenseEntries.length}>
          {trip.expenseEntries.map((exp: ExpenseEntry, i: number) => (
            <View key={i} style={[styles.subCard, i < trip.expenseEntries.length - 1 && styles.subCardBorder]}>
              <View style={styles.listRow}>
                <View>
                  <Text style={styles.listLeft}>{exp.type.toUpperCase()}{exp.city ? ` — ${exp.city}` : ''}</Text>
                  {exp.description ? <Text style={styles.listSub}>{exp.description}</Text> : null}
                </View>
                <Text style={[styles.listRight, { color: Colors.danger }]}>{formatCurrency(exp.amount)}</Text>
              </View>
            </View>
          ))}
        </Section>
      )}

      {/* Transactions */}
      {trip.transactions?.length > 0 && (
        <Section title="Payments Received" count={trip.transactions.length}>
          {trip.transactions.map((txn: TransactionEntry, i: number) => (
            <View key={i} style={[styles.subCard, i < trip.transactions.length - 1 && styles.subCardBorder]}>
              <View style={styles.listRow}>
                <View>
                  <Text style={styles.listLeft}>{txn.name || '—'}</Text>
                  {txn.date ? <Text style={styles.listSub}>{formatDate(txn.date)}</Text> : null}
                </View>
                <Text style={[styles.listRight, { color: Colors.success }]}>{formatCurrency(txn.amountReceived)}</Text>
              </View>
            </View>
          ))}
        </Section>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {trip.status !== 'completed' && (
          <>
            <Button title="Edit Trip" variant="outline" onPress={() => navigation.navigate('TripForm', { id: trip._id })} fullWidth />
            <Button title="Mark Complete" variant="primary" onPress={() => setShowComplete(true)} fullWidth />
          </>
        )}
        {isAdmin && (
          <Button title="Delete Trip" variant="danger" fullWidth onPress={() => setShowDelete(true)} />
        )}
      </View>

      <ConfirmModal visible={showComplete} title="Complete Trip"
        message="Mark this trip as completed? This confirms all financials." confirmText="Complete"
        onConfirm={handleComplete} onCancel={() => setShowComplete(false)} />
      <ConfirmModal visible={showDelete} title="Delete Trip"
        message="Permanently delete this trip? All data will be lost." confirmText="Delete" destructive
        onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },
  hero: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.md, gap: 8 },
  routeTxt: { flex: 1, fontSize: Typography.fontSizeXl, fontWeight: Typography.fontWeightBold, color: Colors.textPrimary },
  heroMeta: { flexDirection: 'row', backgroundColor: Colors.gray50, borderRadius: BorderRadius.md, padding: Spacing.sm, gap: 4 },
  metaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  metaValue: { fontSize: Typography.fontSizeXs, fontWeight: Typography.fontWeightSemiBold, color: Colors.textPrimary },
  finGrid: { flexDirection: 'row', flexWrap: 'wrap', margin: -3, marginBottom: Spacing.sm },
  subCard: { paddingVertical: 10 },
  subCardBorder: { borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  segHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  segRoute: { fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightSemiBold, color: Colors.textPrimary, flex: 1 },
  segHire: { fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightBold, color: Colors.primary },
  segMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  segTag: { fontSize: Typography.fontSizeXs, color: Colors.textSecondary, backgroundColor: Colors.gray50, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listLeft: { fontSize: Typography.fontSizeSm, fontWeight: Typography.fontWeightMedium, color: Colors.textPrimary },
  listSub: { fontSize: Typography.fontSizeXs, color: Colors.textMuted, marginTop: 1 },
  listRight: { fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightBold, color: Colors.textPrimary },
  actions: { gap: Spacing.sm },
});

export default TripDetailScreen;
