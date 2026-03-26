import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius, Typography, Spacing } from '../../utils/colors';

interface ConfirmModalProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible, title = 'Confirm', message,
  confirmText = 'Confirm', cancelText = 'Cancel',
  destructive = false, onConfirm, onCancel,
}) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.overlay}>
      <View style={[styles.card, Shadows.lg]}>
        <View style={[styles.iconCircle, destructive && styles.iconCircleDanger]}>
          <Ionicons
            name={destructive ? 'warning-outline' : 'help-circle-outline'}
            size={28}
            color={destructive ? Colors.danger : Colors.primary}
          />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>{cancelText}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmBtn, destructive && styles.destructiveBtn]}
            onPress={onConfirm}
          >
            <Text style={styles.confirmText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center', padding: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.xxl,
    padding: Spacing.lg, width: '100%', maxWidth: 340,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  iconCircleDanger: { backgroundColor: Colors.dangerBg },
  title: {
    fontSize: Typography.fontSizeLg, fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary, marginBottom: 8, textAlign: 'center',
  },
  message: {
    fontSize: Typography.fontSizeSm, color: Colors.textSecondary,
    lineHeight: 22, textAlign: 'center',
  },
  actions: {
    flexDirection: 'row', marginTop: Spacing.lg, gap: Spacing.sm, width: '100%',
  },
  cancelBtn: {
    flex: 1, paddingVertical: 13, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.gray100, alignItems: 'center',
  },
  cancelText: {
    fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
  },
  confirmBtn: {
    flex: 1, paddingVertical: 13, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary, alignItems: 'center',
  },
  destructiveBtn: { backgroundColor: Colors.danger },
  confirmText: {
    fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightSemiBold,
    color: Colors.white,
  },
});

export default ConfirmModal;
