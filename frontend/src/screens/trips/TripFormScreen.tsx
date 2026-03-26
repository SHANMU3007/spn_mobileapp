import React, { useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, TouchableOpacity, FlatList, Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { tripAPI, driverAPI, vehicleAPI } from '../../api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Driver, Vehicle, TripSegment, DieselEntry, ExpenseEntry, TransactionEntry } from '../../types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../utils/colors';

// ── Picker Modal ──────────────────────────────────────────────────────────
const PickerModal: React.FC<{
  visible: boolean; title: string;
  data: { label: string; value: string }[];
  onSelect: (v: string) => void; onClose: () => void;
}> = ({ visible, title, data, onSelect, onClose }) => (
  <Modal visible={visible} transparent animationType="slide">
    <TouchableOpacity style={pStyles.overlay} activeOpacity={1} onPress={onClose} />
    <View style={pStyles.sheet}>
      <View style={pStyles.handle} />
      <Text style={pStyles.title}>{title}</Text>
      <FlatList
        data={data} keyExtractor={(_, i) => i.toString()}
        style={pStyles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={pStyles.item} onPress={() => { onSelect(item.value); onClose(); }}>
            <Text style={pStyles.itemText}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.gray400} />
          </TouchableOpacity>
        )}
      />
    </View>
  </Modal>
);
const pStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.lg, paddingBottom: 40, maxHeight: '60%' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.gray300, alignSelf: 'center', marginBottom: Spacing.md },
  title: { fontSize: Typography.fontSizeLg, fontWeight: Typography.fontWeightBold, color: Colors.textPrimary, marginBottom: Spacing.md },
  list: { maxHeight: 300 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  itemText: { fontSize: Typography.fontSizeMd, color: Colors.textPrimary },
});

// ── Tab Button ──────────────────────────────────────────────────────────
const TabBtn: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({ label, active, onPress }) => (
  <TouchableOpacity style={[tab.btn, active && tab.btnActive]} onPress={onPress} activeOpacity={0.7}>
    <Text style={[tab.text, active && tab.textActive]}>{label}</Text>
  </TouchableOpacity>
);
const tab = StyleSheet.create({
  btn: { flex: 1, paddingVertical: 10, borderRadius: BorderRadius.md, alignItems: 'center', backgroundColor: Colors.gray50 },
  btnActive: { backgroundColor: Colors.primary },
  text: { fontSize: Typography.fontSizeSm, fontWeight: Typography.fontWeightSemiBold, color: Colors.textSecondary },
  textActive: { color: Colors.white },
});

// ── Types
const blankSegment = (): TripSegment => ({ from: '', to: '', hireAmount: 0, loadType: '', tonnage: 0, loadingCharge: 0, unloadingCharge: 0, date: '', office: '' });
const blankDiesel = (): DieselEntry => ({ date: '', quantity: 0, amount: 0 });
const blankExpense = (): ExpenseEntry => ({ type: 'toll', amount: 0, city: '', description: '', direction: '' });
const blankTxn = (): TransactionEntry => ({ name: '', amountReceived: 0, date: '' });

const TripFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editId: string | undefined = route.params?.id;

  const [activeTab, setActiveTab] = useState(0);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [vehicle, setVehicle] = useState('');
  const [driver1, setDriver1] = useState('');
  const [driver2, setDriver2] = useState('');
  const [startKm, setStartKm] = useState('');
  const [endKm, setEndKm] = useState('');
  const [status, setStatus] = useState('draft');
  const [advanceAmount, setAdvanceAmount] = useState('');

  const [segments, setSegments] = useState<TripSegment[]>([blankSegment()]);
  const [dieselEntries, setDieselEntries] = useState<DieselEntry[]>([blankDiesel()]);
  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntry[]>([blankExpense()]);
  const [transactions, setTransactions] = useState<TransactionEntry[]>([blankTxn()]);

  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [showD1Picker, setShowD1Picker] = useState(false);
  const [showD2Picker, setShowD2Picker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [dRes, vRes] = await Promise.all([driverAPI.getAll(), vehicleAPI.getAll()]);
        setDrivers(Array.isArray(dRes.data) ? dRes.data : []);
        setVehicles(Array.isArray(vRes.data) ? vRes.data : []);

        if (editId) {
          const tRes = await tripAPI.getById(editId);
          const t = tRes.data;
          setVehicle(t.vehicle?._id || '');
          setDriver1(t.driver1?._id || '');
          setDriver2(t.driver2?._id || '');
          setStartKm(String(t.startKm || ''));
          setEndKm(String(t.endKm || ''));
          setStatus(t.status || 'draft');
          setAdvanceAmount(String(t.advanceAmount || ''));
          if (t.tripSegments?.length) setSegments(t.tripSegments);
          if (t.dieselEntries?.length) setDieselEntries(t.dieselEntries);
          if (t.expenseEntries?.length) setExpenseEntries(t.expenseEntries);
          if (t.transactions?.length) setTransactions(t.transactions);
        }
      } catch {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load data' });
      } finally { setLoading(false); }
    };
    init();
  }, [editId]);

  const handleSave = async () => {
    if (!vehicle || !driver1 || !startKm) {
      Toast.show({ type: 'error', text1: 'Missing fields', text2: 'Vehicle, Driver, and Start KM are required.' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        vehicle, driver1, driver2: driver2 || undefined,
        startKm: Number(startKm), endKm: endKm ? Number(endKm) : undefined,
        status, advanceAmount: Number(advanceAmount) || 0,
        tripSegments: segments.filter(s => s.from || s.to),
        dieselEntries: dieselEntries.filter(d => d.quantity || d.amount),
        expenseEntries: expenseEntries.filter(e => e.amount),
        transactions: transactions.filter(t => t.amountReceived),
      };
      if (editId) await tripAPI.update(editId, payload);
      else await tripAPI.create(payload);
      Toast.show({ type: 'success', text1: editId ? 'Trip updated' : 'Trip created!' });
      navigation.goBack();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: err?.response?.data?.message || 'Failed to save trip' });
    } finally { setSaving(false); }
  };

  const updateSegment = (idx: number, field: string, val: any) => setSegments(s => s.map((seg, i) => i === idx ? { ...seg, [field]: val } : seg));
  const updateDiesel = (idx: number, field: string, val: any) => setDieselEntries(d => d.map((de, i) => i === idx ? { ...de, [field]: val } : de));
  const updateExpense = (idx: number, field: string, val: any) => setExpenseEntries(e => e.map((ex, i) => i === idx ? { ...ex, [field]: val } : ex));
  const updateTxn = (idx: number, field: string, val: any) => setTransactions(t => t.map((tx, i) => i === idx ? { ...tx, [field]: val } : tx));

  const vehicleName = vehicles.find(v => v._id === vehicle)?.licenseNumber || '';
  const driver1Name = drivers.find(d => d._id === driver1)?.name || '';
  const driver2Name = drivers.find(d => d._id === driver2)?.name || '';

  const isDraft = status === 'draft';

  if (loading) return <LoadingSpinner fullScreen message="Loading..." />;

  const tabs = ['Trip Info', 'Segments', 'Diesel', 'Expenses', 'Payments'];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBarWrap} contentContainerStyle={styles.tabBar}>
        {tabs.map((t, i) => <TabBtn key={t} label={t} active={activeTab === i} onPress={() => setActiveTab(i)} />)}
      </ScrollView>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* ── Tab 0: Trip Info ── */}
        {activeTab === 0 && (
          <View style={[styles.card, Shadows.sm]}>
            <Text style={styles.sectionTitle}>Trip Details</Text>

            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowVehiclePicker(true)}>
              <Ionicons name="bus-outline" size={18} color={Colors.primary} />
              <View style={styles.pickerContent}>
                <Text style={styles.pickerLabel}>Vehicle *</Text>
                <Text style={vehicleName ? styles.pickerValue : styles.pickerPlaceholder}>{vehicleName || 'Select vehicle'}</Text>
              </View>
              <Ionicons name="chevron-down" size={16} color={Colors.gray400} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowD1Picker(true)}>
              <Ionicons name="person-outline" size={18} color={Colors.primary} />
              <View style={styles.pickerContent}>
                <Text style={styles.pickerLabel}>Primary Driver *</Text>
                <Text style={driver1Name ? styles.pickerValue : styles.pickerPlaceholder}>{driver1Name || 'Select driver'}</Text>
              </View>
              <Ionicons name="chevron-down" size={16} color={Colors.gray400} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowD2Picker(true)}>
              <Ionicons name="people-outline" size={18} color={Colors.textMuted} />
              <View style={styles.pickerContent}>
                <Text style={styles.pickerLabel}>Secondary Driver</Text>
                <Text style={driver2Name ? styles.pickerValue : styles.pickerPlaceholder}>{driver2Name || 'Optional'}</Text>
              </View>
              <Ionicons name="chevron-down" size={16} color={Colors.gray400} />
            </TouchableOpacity>

            <View style={styles.row}>
              <Input label="Start KM" value={startKm} onChangeText={setStartKm}
                keyboardType="numeric" placeholder="0" required style={styles.halfInput} />
              <Input label="End KM" value={endKm} onChangeText={setEndKm}
                keyboardType="numeric" placeholder="0" style={styles.halfInput} />
            </View>

            <Input label="Advance Amount" value={advanceAmount} onChangeText={setAdvanceAmount}
              keyboardType="numeric" placeholder="0" icon="wallet-outline" />

            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowStatusPicker(true)}>
              <Ionicons name="flag-outline" size={18} color={Colors.primary} />
              <View style={styles.pickerContent}>
                <Text style={styles.pickerLabel}>Status</Text>
                <Text style={styles.pickerValue}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
              </View>
              <Ionicons name="chevron-down" size={16} color={Colors.gray400} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Tab 1: Segments ── */}
        {activeTab === 1 && (
          <View>
            {segments.map((seg, idx) => (
              <View key={idx} style={[styles.card, Shadows.sm, { marginBottom: 12 }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.sectionTitle}>Segment {idx + 1}</Text>
                  {segments.length > 1 && (
                    <TouchableOpacity onPress={() => setSegments(s => s.filter((_, i) => i !== idx))}>
                      <Ionicons name="close-circle" size={22} color={Colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.row}>
                  <Input label="From" value={seg.from} onChangeText={v => updateSegment(idx, 'from', v)}
                    placeholder="City" style={styles.halfInput} />
                  <Input label="To" value={seg.to} onChangeText={v => updateSegment(idx, 'to', v)}
                    placeholder="City" style={styles.halfInput} />
                </View>
                <View style={styles.row}>
                  <Input label="Hire Amount" value={String(seg.hireAmount || '')}
                    onChangeText={v => updateSegment(idx, 'hireAmount', Number(v) || 0)}
                    keyboardType="numeric" placeholder="0" style={styles.halfInput} />
                  <Input label="Tonnage" value={String(seg.tonnage || '')}
                    onChangeText={v => updateSegment(idx, 'tonnage', Number(v) || 0)}
                    keyboardType="numeric" placeholder="0" style={styles.halfInput} />
                </View>
                <View style={styles.row}>
                  <Input label="Loading ₹" value={String(seg.loadingCharge || '')}
                    onChangeText={v => updateSegment(idx, 'loadingCharge', Number(v) || 0)}
                    keyboardType="numeric" placeholder="0" style={styles.halfInput} />
                  <Input label="Unloading ₹" value={String(seg.unloadingCharge || '')}
                    onChangeText={v => updateSegment(idx, 'unloadingCharge', Number(v) || 0)}
                    keyboardType="numeric" placeholder="0" style={styles.halfInput} />
                </View>
              </View>
            ))}
            <Button title="+ Add Segment" variant="ghost" onPress={() => setSegments(s => [...s, blankSegment()])} fullWidth />
          </View>
        )}

        {/* ── Tab 2: Diesel ── */}
        {activeTab === 2 && (
          <View>
            {dieselEntries.map((d, idx) => (
              <View key={idx} style={[styles.card, Shadows.sm, { marginBottom: 12 }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.sectionTitle}>Entry {idx + 1}</Text>
                  {dieselEntries.length > 1 && (
                    <TouchableOpacity onPress={() => setDieselEntries(de => de.filter((_, i) => i !== idx))}>
                      <Ionicons name="close-circle" size={22} color={Colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
                <Input label="Date" value={d.date || ''} onChangeText={v => updateDiesel(idx, 'date', v)} placeholder="YYYY-MM-DD" />
                <View style={styles.row}>
                  <Input label="Litres" value={String(d.quantity || '')}
                    onChangeText={v => updateDiesel(idx, 'quantity', Number(v) || 0)}
                    keyboardType="numeric" placeholder="0" style={styles.halfInput} />
                  <Input label="Amount ₹" value={String(d.amount || '')}
                    onChangeText={v => updateDiesel(idx, 'amount', Number(v) || 0)}
                    keyboardType="numeric" placeholder="0" style={styles.halfInput} />
                </View>
              </View>
            ))}
            <Button title="+ Add Diesel Entry" variant="ghost" onPress={() => setDieselEntries(d => [...d, blankDiesel()])} fullWidth />
          </View>
        )}

        {/* ── Tab 3: Expenses ── */}
        {activeTab === 3 && (
          <View>
            {expenseEntries.map((exp, idx) => (
              <View key={idx} style={[styles.card, Shadows.sm, { marginBottom: 12 }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.sectionTitle}>Expense {idx + 1}</Text>
                  {expenseEntries.length > 1 && (
                    <TouchableOpacity onPress={() => setExpenseEntries(e => e.filter((_, i) => i !== idx))}>
                      <Ionicons name="close-circle" size={22} color={Colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.row}>
                  <Input label="Type" value={exp.type}
                    onChangeText={v => updateExpense(idx, 'type', v)}
                    placeholder="toll, rto, etc" style={styles.halfInput} />
                  <Input label="Amount ₹" value={String(exp.amount || '')}
                    onChangeText={v => updateExpense(idx, 'amount', Number(v) || 0)}
                    keyboardType="numeric" placeholder="0" style={styles.halfInput} />
                </View>
                <View style={styles.row}>
                  <Input label="City" value={exp.city || ''}
                    onChangeText={v => updateExpense(idx, 'city', v)}
                    placeholder="City" style={styles.halfInput} />
                  <Input label="Description" value={exp.description || ''}
                    onChangeText={v => updateExpense(idx, 'description', v)}
                    placeholder="Details" style={styles.halfInput} />
                </View>
              </View>
            ))}
            <Button title="+ Add Expense" variant="ghost" onPress={() => setExpenseEntries(e => [...e, blankExpense()])} fullWidth />
          </View>
        )}

        {/* ── Tab 4: Payments ── */}
        {activeTab === 4 && (
          <View>
            {transactions.map((txn, idx) => (
              <View key={idx} style={[styles.card, Shadows.sm, { marginBottom: 12 }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.sectionTitle}>Payment {idx + 1}</Text>
                  {transactions.length > 1 && (
                    <TouchableOpacity onPress={() => setTransactions(t => t.filter((_, i) => i !== idx))}>
                      <Ionicons name="close-circle" size={22} color={Colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
                <Input label="Name / Ref" value={txn.name || ''} onChangeText={v => updateTxn(idx, 'name', v)}
                  placeholder="Party name" />
                <View style={styles.row}>
                  <Input label="Amount ₹" value={String(txn.amountReceived || '')}
                    onChangeText={v => updateTxn(idx, 'amountReceived', Number(v) || 0)}
                    keyboardType="numeric" placeholder="0" style={styles.halfInput} />
                  <Input label="Date" value={txn.date || ''}
                    onChangeText={v => updateTxn(idx, 'date', v)}
                    placeholder="YYYY-MM-DD" style={styles.halfInput} />
                </View>
              </View>
            ))}
            <Button title="+ Add Payment" variant="ghost" onPress={() => setTransactions(t => [...t, blankTxn()])} fullWidth />
          </View>
        )}

        {/* Save Button */}
        <Button
          title={editId ? 'Update Trip' : 'Create Trip'}
          onPress={handleSave} loading={saving} fullWidth
          style={styles.saveBtn}
        />
      </ScrollView>

      {/* Pickers */}
      <PickerModal visible={showVehiclePicker} title="Select Vehicle"
        data={vehicles.map(v => ({ label: `${v.licenseNumber} — ${v.ownerName}`, value: v._id }))}
        onSelect={setVehicle} onClose={() => setShowVehiclePicker(false)} />
      <PickerModal visible={showD1Picker} title="Select Driver"
        data={drivers.map(d => ({ label: `${d.name} (${d.phone})`, value: d._id }))}
        onSelect={setDriver1} onClose={() => setShowD1Picker(false)} />
      <PickerModal visible={showD2Picker} title="Select Secondary Driver"
        data={[{ label: 'None', value: '' }, ...drivers.map(d => ({ label: `${d.name} (${d.phone})`, value: d._id }))]}
        onSelect={setDriver2} onClose={() => setShowD2Picker(false)} />
      <PickerModal visible={showStatusPicker} title="Select Status"
        data={[{ label: '📝 Draft', value: 'draft' }, { label: '📤 Submitted', value: 'submitted' }, { label: '✅ Completed', value: 'completed' }]}
        onSelect={setStatus} onClose={() => setShowStatusPicker(false)} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bgPrimary },
  tabBarWrap: { backgroundColor: Colors.white, flexGrow: 0, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabBar: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, gap: 6 },
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  card: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightBold, color: Colors.textPrimary },
  row: { flexDirection: 'row', gap: Spacing.sm },
  halfInput: { flex: 1 },
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.gray50, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  pickerContent: { flex: 1 },
  pickerLabel: { fontSize: Typography.fontSizeXs, color: Colors.textMuted, marginBottom: 2 },
  pickerValue: { fontSize: Typography.fontSizeMd, fontWeight: Typography.fontWeightMedium, color: Colors.textPrimary },
  pickerPlaceholder: { fontSize: Typography.fontSizeMd, color: Colors.gray400 },
  saveBtn: { marginTop: Spacing.lg },
});

export default TripFormScreen;
