import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trip } from '../../types';
import Badge from '../common/Badge';
import { formatCurrency, formatDate, formatKm } from '../../utils/formatters';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../utils/colors';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
  isAdmin?: boolean;
  index: number;
}

const TripCard: React.FC<TripCardProps> = ({
  trip, onPress, onEdit, onDelete, onComplete, isAdmin, index,
}) => {
  const routeStr = trip.tripSegments?.length
    ? `${trip.tripSegments[0].from} → ${trip.tripSegments[trip.tripSegments.length - 1]?.to || '...'}`
    : `KM ${trip.startKm} → ${trip.endKm || '...'}`;

  return (
    <TouchableOpacity style={[styles.card, Shadows.sm]} onPress={onPress} activeOpacity={0.8}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.indexWrap}>
          <Text style={styles.index}>#{index}</Text>
        </View>
        <View style={styles.routeWrap}>
          <Text style={styles.route} numberOfLines={1}>{routeStr}</Text>
          <Text style={styles.vehicle}>{trip.vehicle?.licenseNumber}</Text>
        </View>
        <Badge status={trip.status} />
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="person-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.detailText}>{trip.driver1?.name}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="speedometer-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.detailText}>{formatKm(trip.totalKm)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.detailText}>{formatDate(trip.createdAt)}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.financeItem}>
          <Text style={styles.label}>Total Hire</Text>
          <Text style={styles.revenue}>{formatCurrency(trip.calculated?.totalHire || 0)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.financeItem}>
          <Text style={styles.label}>Balance</Text>
          <Text style={[styles.balance, (trip.calculated?.balance || 0) < 0 && styles.balanceNeg]}>
            {formatCurrency(trip.calculated?.balance || 0)}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          {trip.status !== 'completed' && onComplete && (
            <TouchableOpacity style={[styles.actionBtn, styles.completeBtn]} onPress={onComplete}>
              <Ionicons name="checkmark-outline" size={15} color={Colors.success} />
            </TouchableOpacity>
          )}
          {onEdit && (
            <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
              <Ionicons name="pencil-outline" size={15} color={Colors.info} />
            </TouchableOpacity>
          )}
          {isAdmin && onDelete && (
            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
              <Ionicons name="trash-outline" size={15} color={Colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  indexWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center', justifyContent: 'center',
  },
  index: { fontSize: Typography.fontSizeXs, fontWeight: Typography.fontWeightBold, color: Colors.primary },
  routeWrap: { flex: 1 },
  route: { fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightSemiBold, color: Colors.textPrimary },
  vehicle: { fontSize: Typography.fontSizeXs, color: Colors.textMuted, marginTop: 2 },
  details: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: Typography.fontSizeXs, color: Colors.textSecondary },
  footer: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.gray100,
  },
  financeItem: {},
  label: { fontSize: 10, color: Colors.textMuted },
  revenue: { fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightBold, color: Colors.primary, marginTop: 1 },
  divider: { width: 1, height: 30, backgroundColor: Colors.gray200, marginHorizontal: 12 },
  balance: { fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightBold, color: Colors.success, marginTop: 1 },
  balanceNeg: { color: Colors.danger },
  actions: { flexDirection: 'row', gap: 6, marginLeft: 'auto' },
  actionBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.gray50,
    alignItems: 'center', justifyContent: 'center',
  },
  completeBtn: { backgroundColor: Colors.successBg },
  deleteBtn: { backgroundColor: Colors.dangerBg },
});

export default TripCard;
