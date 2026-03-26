import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Vehicle } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../utils/colors';

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit?: () => void;
  onDelete?: () => void;
  isAdmin?: boolean;
}

const isExpiringSoon = (date?: string) => {
  if (!date) return false;
  return new Date(date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
};

const isExpired = (date?: string) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onEdit, onDelete, isAdmin }) => {
  return (
    <View style={[styles.card, Shadows.sm]}>
      <View style={styles.iconWrap}>
        <Ionicons name="bus" size={22} color={Colors.primary} />
      </View>

      <View style={styles.info}>
        <Text style={styles.license}>{vehicle.licenseNumber}</Text>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.meta}>{vehicle.ownerName}</Text>
        </View>
        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{vehicle.numberOfWheels} Wheeler</Text>
          </View>
          {vehicle.insuranceExpiryDate && (
            <View style={[
              styles.tag,
              isExpired(vehicle.insuranceExpiryDate) ? styles.tagDanger :
                isExpiringSoon(vehicle.insuranceExpiryDate) ? styles.tagWarn : styles.tagOk,
            ]}>
              <Text style={[
                styles.tagText,
                isExpired(vehicle.insuranceExpiryDate) ? styles.tagDangerText :
                  isExpiringSoon(vehicle.insuranceExpiryDate) ? styles.tagWarnText : styles.tagOkText,
              ]}>
                Ins: {formatDate(vehicle.insuranceExpiryDate)}
              </Text>
            </View>
          )}
          {vehicle.fcExpiryDate && (
            <View style={[
              styles.tag,
              isExpired(vehicle.fcExpiryDate) ? styles.tagDanger :
                isExpiringSoon(vehicle.fcExpiryDate) ? styles.tagWarn : styles.tagOk,
            ]}>
              <Text style={[
                styles.tagText,
                isExpired(vehicle.fcExpiryDate) ? styles.tagDangerText :
                  isExpiringSoon(vehicle.fcExpiryDate) ? styles.tagWarnText : styles.tagOkText,
              ]}>
                FC: {formatDate(vehicle.fcExpiryDate)}
              </Text>
            </View>
          )}
        </View>
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
  iconWrap: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1, gap: 4 },
  license: {
    fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontSize: Typography.fontSizeXs, color: Colors.textSecondary, flex: 1 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  tag: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    backgroundColor: Colors.gray50,
  },
  tagText: { fontSize: 10, fontWeight: Typography.fontWeightMedium, color: Colors.textSecondary },
  tagOk: { backgroundColor: Colors.successBg },
  tagOkText: { color: Colors.success },
  tagWarn: { backgroundColor: Colors.warningBg },
  tagWarnText: { color: Colors.warning },
  tagDanger: { backgroundColor: Colors.dangerBg },
  tagDangerText: { color: Colors.danger },
  actions: { gap: 6 },
  actionBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.gray50,
    alignItems: 'center', justifyContent: 'center',
  },
  deleteBtn: { backgroundColor: Colors.dangerBg },
});

export default VehicleCard;
