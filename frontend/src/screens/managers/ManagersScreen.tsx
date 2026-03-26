import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList, KeyboardAvoidingView, Modal, Platform,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { userAPI } from '../../api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../utils/colors';

interface Manager { _id: string; name: string; email: string; role: string }

const ManagersScreen: React.FC = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Manager | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await userAPI.getAll();
      setManagers(Array.isArray(res.data) ? res.data : []);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load managers' });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setName(''); setEmail(''); setPassword(''); setErrors({}); setShowModal(true); };
  const openEdit = (m: Manager) => { setEditing(m); setName(m.name); setEmail(m.email); setPassword(''); setErrors({}); setShowModal(true); };

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    if (!editing && !password) e.password = 'Password is required';
    else if (password && password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing) {
        const data: any = { name: name.trim(), email: email.trim() };
        if (password) data.password = password;
        await userAPI.update(editing._id, data);
        Toast.show({ type: 'success', text1: 'Manager updated' });
      } else {
        await userAPI.create({ name: name.trim(), email: email.trim(), password });
        Toast.show({ type: 'success', text1: 'Manager added' });
      }
      setShowModal(false); load();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: err?.response?.data?.message || 'Failed to save' });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await userAPI.delete(deleteTarget);
      Toast.show({ type: 'success', text1: 'Manager removed' });
      load();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not delete manager' });
    } finally { setDeleteTarget(null); }
  };

  const initials = (n: string) => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  if (loading) return <LoadingSpinner fullScreen message="Loading managers..." />;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.count}>{managers.length} manager{managers.length !== 1 ? 's' : ''}</Text>
        <TouchableOpacity style={[styles.addBtn, Shadows.sm]} onPress={openAdd}>
          <Ionicons name="add" size={16} color={Colors.white} />
          <Text style={styles.addText}>Add Manager</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={managers} keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No managers yet" message="Add the first manager account" />}
        renderItem={({ item }) => (
          <View style={[styles.card, Shadows.sm]}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials(item.name)}</Text></View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
              <View style={styles.roleBadge}><Text style={styles.roleText}>{item.role}</Text></View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
                <Ionicons name="pencil-outline" size={15} color={Colors.info} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => setDeleteTarget(item._id)}>
                <Ionicons name="trash-outline" size={15} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowModal(false)} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{editing ? 'Edit Manager' : 'Add Manager'}</Text>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Input label="Full Name" value={name}
                onChangeText={(t) => { setName(t); setErrors(e => ({ ...e, name: undefined })); }}
                placeholder="Manager's name" error={errors.name} required icon="person-outline" />
              <Input label="Email" value={email}
                onChangeText={(t) => { setEmail(t); setErrors(e => ({ ...e, email: undefined })); }}
                placeholder="Email address" keyboardType="email-address" autoCapitalize="none" error={errors.email} required icon="mail-outline" />
              <Input label={editing ? 'New Password (leave blank to keep)' : 'Password'} value={password}
                onChangeText={(t) => { setPassword(t); setErrors(e => ({ ...e, password: undefined })); }}
                placeholder={editing ? 'Leave blank to keep current' : 'Min 6 characters'}
                secureTextEntry required={!editing} error={errors.password} />
              <View style={styles.modalActions}>
                <Button title="Cancel" variant="outline" onPress={() => setShowModal(false)} style={styles.cancelBtn} />
                <Button title={editing ? 'Update' : 'Add'} onPress={handleSave} loading={saving} style={styles.saveBtn} />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ConfirmModal visible={!!deleteTarget} title="Remove Manager"
        message="Remove this manager account? They will no longer have access."
        confirmText="Remove" destructive
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  count: { fontSize: Typography.fontSizeSm, color: Colors.textMuted, fontWeight: Typography.fontWeightMedium },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: 10, borderRadius: BorderRadius.lg },
  addText: { fontSize: Typography.fontSizeSm, color: Colors.white, fontWeight: Typography.fontWeightSemiBold },
  list: { padding: Spacing.md, paddingTop: 4 },
  card: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    padding: Spacing.md, flexDirection: 'row', alignItems: 'center',
    marginBottom: 12, gap: 12, borderWidth: 1, borderColor: Colors.border,
  },
  avatar: { width: 46, height: 46, borderRadius: 14, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightBold, color: Colors.primary },
  info: { flex: 1 },
  name: { fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightSemiBold, color: Colors.textPrimary },
  email: { fontSize: Typography.fontSizeXs, color: Colors.textSecondary, marginTop: 2 },
  roleBadge: { marginTop: 5, alignSelf: 'flex-start', backgroundColor: Colors.primaryBg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full },
  roleText: { fontSize: Typography.fontSizeXs, color: Colors.primary, fontWeight: Typography.fontWeightSemiBold },
  actions: { gap: 6 },
  actionBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.gray50, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { backgroundColor: Colors.dangerBg },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.lg, paddingBottom: 40, maxHeight: '80%' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.gray300, alignSelf: 'center', marginBottom: Spacing.md },
  sheetTitle: { fontSize: Typography.fontSizeLg, fontWeight: Typography.fontWeightBold, color: Colors.textPrimary, marginBottom: Spacing.md },
  modalActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: 8 },
  cancelBtn: { flex: 1 },
  saveBtn: { flex: 2 },
});

export default ManagersScreen;
