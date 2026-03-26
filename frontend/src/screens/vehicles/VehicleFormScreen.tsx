import React, { useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { vehicleAPI } from '../../api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../utils/colors';

const VehicleFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editId: string | undefined = route.params?.id;

  const [licenseNumber, setLicenseNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [numberOfWheels, setNumberOfWheels] = useState('');
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState('');
  const [fcExpiryDate, setFcExpiryDate] = useState('');
  const [permitExpiryDate, setPermitExpiryDate] = useState('');
  const [serviceIntervalKm, setServiceIntervalKm] = useState('');
  const [lastServiceKm, setLastServiceKm] = useState('');
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editId) {
      vehicleAPI.getById(editId).then((res: any) => {
        const v = res.data;
        setLicenseNumber(v.licenseNumber);
        setOwnerName(v.ownerName);
        setNumberOfWheels(String(v.numberOfWheels || ''));
        setInsuranceExpiryDate(v.insuranceExpiryDate ? v.insuranceExpiryDate.split('T')[0] : '');
        setFcExpiryDate(v.fcExpiryDate ? v.fcExpiryDate.split('T')[0] : '');
        setPermitExpiryDate(v.permitExpiryDate ? v.permitExpiryDate.split('T')[0] : '');
        setServiceIntervalKm(String(v.serviceIntervalKm || ''));
        setLastServiceKm(String(v.lastServiceKm || ''));
      }).catch(() => Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load vehicle' }))
        .finally(() => setLoading(false));
    }
  }, [editId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!licenseNumber.trim()) e.licenseNumber = 'License number is required';
    if (!ownerName.trim()) e.ownerName = 'Owner name is required';
    if (!numberOfWheels || isNaN(Number(numberOfWheels))) e.numberOfWheels = 'Enter a valid number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: any = {
        licenseNumber: licenseNumber.trim().toUpperCase(),
        ownerName: ownerName.trim(),
        numberOfWheels: Number(numberOfWheels),
      };
      if (insuranceExpiryDate) payload.insuranceExpiryDate = insuranceExpiryDate;
      if (fcExpiryDate) payload.fcExpiryDate = fcExpiryDate;
      if (permitExpiryDate) payload.permitExpiryDate = permitExpiryDate;
      if (serviceIntervalKm) payload.serviceIntervalKm = Number(serviceIntervalKm);
      if (lastServiceKm) payload.lastServiceKm = Number(lastServiceKm);

      if (editId) await vehicleAPI.update(editId, payload);
      else await vehicleAPI.create(payload);
      Toast.show({ type: 'success', text1: editId ? 'Vehicle updated' : 'Vehicle added' });
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
          <Text style={styles.sectionTitle}>Vehicle Info</Text>
          <Input label="License Number" value={licenseNumber}
            onChangeText={(t) => { setLicenseNumber(t); setErrors(e => ({ ...e, licenseNumber: '' })); }}
            placeholder="TN00AB1234" autoCapitalize="characters" error={errors.licenseNumber} required icon="bus-outline" />
          <Input label="Owner Name" value={ownerName}
            onChangeText={(t) => { setOwnerName(t); setErrors(e => ({ ...e, ownerName: '' })); }}
            placeholder="Vehicle owner" error={errors.ownerName} required icon="person-outline" />
          <Input label="Number of Wheels" value={numberOfWheels}
            onChangeText={(t) => { setNumberOfWheels(t); setErrors(e => ({ ...e, numberOfWheels: '' })); }}
            placeholder="e.g. 6, 10, 14" keyboardType="numeric" error={errors.numberOfWheels} required icon="settings-outline" />
        </View>

        <View style={[styles.card, Shadows.sm, { marginTop: Spacing.md }]}>
          <Text style={styles.sectionTitle}>Expiry Dates</Text>
          <Text style={styles.hint}>Format: YYYY-MM-DD</Text>
          <Input label="Insurance Expiry" value={insuranceExpiryDate} onChangeText={setInsuranceExpiryDate}
            placeholder="2025-06-30" icon="shield-outline" />
          <Input label="FC Expiry" value={fcExpiryDate} onChangeText={setFcExpiryDate}
            placeholder="2025-06-30" icon="document-outline" />
          <Input label="Permit Expiry" value={permitExpiryDate} onChangeText={setPermitExpiryDate}
            placeholder="2025-06-30" icon="reader-outline" />
        </View>

        <View style={[styles.card, Shadows.sm, { marginTop: Spacing.md }]}>
          <Text style={styles.sectionTitle}>Service Info</Text>
          <Input label="Service Interval (KM)" value={serviceIntervalKm} onChangeText={setServiceIntervalKm}
            placeholder="e.g. 15000" keyboardType="numeric" icon="construct-outline" />
          <Input label="Last Service KM" value={lastServiceKm} onChangeText={setLastServiceKm}
            placeholder="e.g. 120000" keyboardType="numeric" icon="speedometer-outline" />
        </View>

        <Button title={editId ? 'Update Vehicle' : 'Add Vehicle'} onPress={handleSave} loading={saving} fullWidth style={styles.saveBtn} />
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
  hint: { fontSize: Typography.fontSizeXs, color: Colors.textMuted, marginBottom: Spacing.sm, marginTop: -8 },
  saveBtn: { marginTop: Spacing.md },
});

export default VehicleFormScreen;
