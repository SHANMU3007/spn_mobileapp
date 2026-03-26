import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trip } from '../../types';
import Badge from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Colors, Typography, Spacing, BorderRadius } from '../../utils/colors';

interface RecentTripItemProps {
  trip: Trip;
  onPress: () => void;
  isLast?: boolean;
}

const RecentTripItem: React.FC<RecentTripItemProps> = ({ trip, onPress, isLast = false }) => {
  const routeStr = trip.tripSegments?.length
    ? `${trip.tripSegments[0].from} → ${trip.tripSegments[trip.tripSegments.length - 1]?.to}`
    : `KM ${trip.startKm} → ${trip.endKm || '...'}`;

  return (
    <TouchableOpacity style={[styles.item, !isLast && styles.border]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconWrap}>
        <Ionicons name="navigate-outline" size={18} color={Colors.primary} />
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.route} numberOfLines={1}>{routeStr}</Text>
          <Badge status={trip.status} size="sm" />
        </View>
        <View style={styles.row}>
          <Text style={styles.meta}>{trip.vehicle?.licenseNumber}  •  {trip.driver1?.name}</Text>
          <Text style={styles.amount}>{formatCurrency(trip.calculated?.totalHire || 0)}</Text>
        </View>
        <Text style={styles.date}>{formatDate(trip.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 12, gap: 12,
  },
  border: {
    borderBottomWidth: 1, borderBottomColor: Colors.gray100,
  },
  iconWrap: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  content: { flex: 1 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 3,
  },
  route: {
    flex: 1, fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary, marginRight: 8,
  },
  meta: { fontSize: Typography.fontSizeXs, color: Colors.textMuted },
  amount: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
  },
  date: {
    fontSize: Typography.fontSizeXs, color: Colors.textMuted, marginTop: 2,
  },
});

export default RecentTripItem;
