import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Driver } from '../../types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../utils/colors';

interface DriverCardProps {
  driver: Driver;
  onEdit?: () => void;
  onDelete?: () => void;
  isAdmin?: boolean;
}

const DriverCard: React.FC<DriverCardProps> = ({ driver, onEdit, onDelete, isAdmin }) => {
  const initials = driver.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <View style={[styles.card, Shadows.sm]}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{driver.name}</Text>
        <View style={styles.row}>
          <View style={styles.metaChip}>
            <Ionicons name="call-outline" size={11} color={Colors.primary} />
            <Text style={styles.meta}>{driver.phone}</Text>
          </View>
        </View>
        {driver.licenseNumber ? (
          <View style={styles.row}>
            <View style={styles.metaChip}>
              <Ionicons name="card-outline" size={11} color={Colors.secondary} />
              <Text style={styles.meta}>{driver.licenseNumber}</Text>
            </View>
          </View>
        ) : null}
        {driver.address ? (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
            <Text style={styles.address} numberOfLines={1}>{driver.address}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
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
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    flexDirection: 'row', alignItems: 'flex-start',
    marginBottom: 12, gap: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center', justifyContent: 'center',
  },
  initials: {
    fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
  },
  info: { flex: 1, gap: 4 },
  name: {
    fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.gray50, paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 6,
  },
  meta: { fontSize: Typography.fontSizeXs, color: Colors.textSecondary },
  address: { fontSize: Typography.fontSizeXs, color: Colors.textMuted, flex: 1 },
  actions: { gap: 6 },
  actionBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.gray50,
    alignItems: 'center', justifyContent: 'center',
  },
  deleteBtn: { backgroundColor: Colors.dangerBg },
});

export default DriverCard;
