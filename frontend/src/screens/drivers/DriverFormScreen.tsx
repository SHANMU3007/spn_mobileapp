import React, { useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { driverAPI } from '../../api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../utils/colors';

const DriverFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editId: string | undefined = route.params?.id;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editId) {
      driverAPI.getById(editId).then((res: any) => {
        const d = res.data;
        setName(d.name); setPhone(d.phone);
        setLicenseNumber(d.licenseNumber || '');
        setAddress(d.address || '');
      }).catch(() => Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load driver' }))
        .finally(() => setLoading(false));
    }
  }, [editId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!phone.trim()) e.phone = 'Phone is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { name: name.trim(), phone: phone.trim(), licenseNumber: licenseNumber.trim(), address: address.trim() };
      if (editId) await driverAPI.update(editId, payload);
      else await driverAPI.create(payload);
      Toast.show({ type: 'success', text1: editId ? 'Driver updated' : 'Driver added' });
      navigation.goBack();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: err?.response?.data?.message || 'Failed to save' });
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading..." />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={[styles.card, Shadows.sm]}>
          <Text style={styles.sectionTitle}>Driver Details</Text>
          <Input label="Full Name" value={name}
            onChangeText={(t) => { setName(t); setErrors(e => ({ ...e, name: '' })); }}
            placeholder="Enter driver's name" error={errors.name} required icon="person-outline" />
          <Input label="Phone Number" value={phone}
            onChangeText={(t) => { setPhone(t); setErrors(e => ({ ...e, phone: '' })); }}
            placeholder="Phone number" keyboardType="phone-pad" error={errors.phone} required icon="call-outline" />
          <Input label="License Number" value={licenseNumber}
            onChangeText={setLicenseNumber}
            placeholder="DL number" autoCapitalize="characters" icon="card-outline" />
          <Input label="Address" value={address}
            onChangeText={setAddress}
            placeholder="Full address" multiline numberOfLines={3} icon="location-outline" />
        </View>
        <Button title={editId ? 'Update Driver' : 'Add Driver'} onPress={handleSave} loading={saving} fullWidth style={styles.saveBtn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  card: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  sectionTitle: { fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightBold, color: Colors.textPrimary, marginBottom: Spacing.md },
  saveBtn: { marginTop: Spacing.md },
});

export default DriverFormScreen;
