import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, Platform, ScrollView, KeyboardAvoidingView,
  ActivityIndicator, Alert,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import ZoneAutocomplete from '../../components/ZoneAutocomplete';
import { apiRequest, getSavedUser } from '../../services/api';

type Props = {
  onBack: () => void;
  onLogout: () => void;
};

type RestaurantData = {
  id: string;
  name: string;
  phone: string;
  address: string;
  cuisine_type: string;
  schedule: string;
  description: string;
  rif: string;
  status: string;
};

export default function RestaurantProfileScreen({ onBack, onLogout }: Props) {
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState('');
  const [schedule, setSchedule] = useState('');
  const [description, setDescription] = useState('');

  const [totalSales, setTotalSales] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const load = useCallback(async () => {
    try {
      const [r, orders, user] = await Promise.all([
        apiRequest<RestaurantData>('/restaurants/mine'),
        apiRequest<any[]>('/orders/restaurant'),
        getSavedUser(),
      ]);
      setRestaurant(r);
      setName(r.name);
      setPhone(r.phone ?? '');
      setAddress(r.address ?? '');
      setSchedule(r.schedule ?? '');
      setDescription(r.description ?? '');
      setEmail(user?.email ?? '');
      const completed = orders.filter(o => o.status === 'completed');
      setTotalSales(completed.length);
      setTotalRevenue(completed.reduce((s, o) => s + (o.total_amount ?? 0), 0));
    } catch {
      Alert.alert('Error', 'No se pudo cargar el perfil del local');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiRequest('/restaurants/mine', {
        method: 'PATCH',
        body: JSON.stringify({
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          schedule: schedule.trim() || undefined,
          description: description.trim() || undefined,
        }),
      });
      setRestaurant(prev => prev ? { ...prev, name, phone, address, schedule, description } : prev);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudieron guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil del local</Text>
          <View style={{ width: 48 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const displayName = name || restaurant?.name || '?';
  const statusLabel = restaurant?.status === 'approved' ? '✓ Local verificado' : '⏳ Pendiente de verificación';
  const statusStyle = restaurant?.status === 'approved' ? styles.statusVerified : styles.statusPending;
  const statusTextStyle = restaurant?.status === 'approved' ? styles.statusTextVerified : styles.statusTextPending;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil del local</Text>
          <TouchableOpacity onPress={editing ? handleSave : () => setEditing(true)} disabled={saving}>
            {saving
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Text style={styles.editBtn}>{editing ? 'Guardar' : 'Editar'}</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
            {editing ? (
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                autoCorrect={false}
              />
            ) : (
              <Text style={styles.businessName}>{displayName}</Text>
            )}
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{restaurant?.cuisine_type ?? ''}</Text>
            </View>
            <View style={[styles.statusTag, statusStyle]}>
              <Text style={[styles.statusTagText, statusTextStyle]}>{statusLabel}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatCard value={String(totalSales)} label="Ventas totales" />
            <StatCard value={`$${totalRevenue.toFixed(0)}`} label="Ingresos" />
          </View>

          <Text style={styles.sectionTitle}>Información del local</Text>

          <InfoField label="Teléfono" value={phone} editing={editing} onChangeText={setPhone} keyboardType="phone-pad" />
          <InfoField label="Dirección" value={address} editing={editing} onChangeText={setAddress} />
          <InfoField label="Horario de atención" value={schedule} editing={editing} onChangeText={setSchedule} />
          <InfoField label="Descripción" value={description} editing={editing} onChangeText={setDescription} multiline />

          <Text style={styles.sectionTitle}>Cuenta</Text>

          <View style={styles.accountCard}>
            <AccountRow label="Correo" value={email} icon="📧" />
            <AccountRow label="RIF" value={restaurant?.rif ?? '—'} icon="📄" />
            <AccountRow label="Estado" value={restaurant?.status === 'approved' ? 'Verificado' : 'Pendiente'} icon={restaurant?.status === 'approved' ? '✅' : '⏳'} />
          </View>

          {saved && (
            <View style={styles.savedBanner}>
              <Text style={styles.savedText}>✓ Cambios guardados</Text>
            </View>
          )}

          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Zona de riesgo</Text>
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutBtnText}>Cerrar sesión del local</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: spacing.xl }} />
        </ScrollView>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoField({ label, value, editing, onChangeText, keyboardType, multiline }: {
  label: string; value: string; editing: boolean; onChangeText: (v: string) => void;
  keyboardType?: any; multiline?: boolean;
}) {
  return (
    <View style={styles.infoField}>
      <Text style={styles.infoLabel}>{label}</Text>
      {editing ? (
        <TextInput
          style={[styles.infoInput, multiline ? styles.infoInputMultiline : null]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          autoCorrect={false}
        />
      ) : (
        <Text style={styles.infoValue}>{value || '—'}</Text>
      )}
    </View>
  );
}

function AccountRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.accountRow}>
      <Text style={styles.accountIcon}>{icon}</Text>
      <View style={styles.accountInfo}>
        <Text style={styles.accountLabel}>{label}</Text>
        <Text style={styles.accountValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface,
  },
  backBtn: { width: 40, height: 40, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 28, color: colors.textPrimary, lineHeight: 32 },
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  editBtn: { ...typography.body, color: colors.primary, fontWeight: '700' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  avatarSection: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 88, height: 88, borderRadius: borderRadius.full,
    backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  avatarText: { fontSize: 44, fontWeight: '700', color: colors.textLight },
  businessName: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
  nameInput: {
    ...typography.h2, color: colors.textPrimary, borderBottomWidth: 2, borderBottomColor: colors.primary,
    paddingVertical: spacing.xs, marginBottom: spacing.xs, minWidth: 200, textAlign: 'center',
  },
  categoryTag: { backgroundColor: '#FFF3E0', borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginBottom: spacing.xs },
  categoryTagText: { ...typography.caption, fontWeight: '600', color: '#E65100' },
  statusTag: { borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  statusVerified: { backgroundColor: '#E8F5E9' },
  statusPending: { backgroundColor: '#FFF8E1' },
  statusTagText: { ...typography.caption, fontWeight: '600' },
  statusTextVerified: { color: colors.primary },
  statusTextPending: { color: '#F57F17' },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.md, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  statLabel: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.sm },
  infoField: { marginBottom: spacing.md },
  infoLabel: { ...typography.caption, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs },
  infoValue: { ...typography.body, color: colors.textPrimary },
  infoInput: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm, ...typography.body, color: colors.textPrimary,
  },
  infoInputMultiline: { height: 80, textAlignVertical: 'top' },
  accountCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    marginBottom: spacing.lg,
  },
  accountRow: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  accountIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  accountInfo: { flex: 1 },
  accountLabel: { ...typography.caption, color: colors.textSecondary },
  accountValue: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  savedBanner: {
    backgroundColor: '#E8F5E9', borderRadius: borderRadius.md,
    padding: spacing.md, alignItems: 'center', marginBottom: spacing.md,
  },
  savedText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  dangerZone: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg, marginTop: spacing.lg },
  dangerTitle: { ...typography.caption, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.md },
  logoutBtn: {
    borderWidth: 1.5, borderColor: colors.error, borderRadius: borderRadius.full,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  logoutBtnText: { ...typography.button, color: colors.error },
});
