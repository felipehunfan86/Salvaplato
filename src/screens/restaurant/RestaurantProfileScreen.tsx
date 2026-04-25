import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, Platform, ScrollView, KeyboardAvoidingView,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import ZoneAutocomplete from '../../components/ZoneAutocomplete';

type Props = {
  onBack: () => void;
  onLogout: () => void;
};

export default function RestaurantProfileScreen({ onBack, onLogout }: Props) {
  const [editing, setEditing] = useState(false);
  const [businessName, setBusinessName] = useState('Pizzería Don Pepe');
  const [phone, setPhone] = useState('+58 412 000 0000');
  const [address, setAddress] = useState('Av. Principal, CC Sambil, local 5-B');
  const [zone, setZone] = useState('Caracas, Chacao');
  const [schedule, setSchedule] = useState('Lun-Vie 11am-9pm, Sáb 12pm-8pm');
  const [description, setDescription] = useState('La mejor pizza artesanal de Caracas. Masa fresca cada día.');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil del local</Text>
          <TouchableOpacity onPress={() => editing ? handleSave() : setEditing(true)}>
            <Text style={styles.editBtn}>{editing ? 'Guardar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Avatar + name */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{businessName.charAt(0).toUpperCase()}</Text>
            </View>
            {editing ? (
              <TextInput
                style={styles.nameInput}
                value={businessName}
                onChangeText={setBusinessName}
                autoCorrect={false}
              />
            ) : (
              <Text style={styles.businessName}>{businessName}</Text>
            )}
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>🍕 Pizzería</Text>
            </View>
            <View style={[styles.statusTag, styles.statusVerified]}>
              <Text style={styles.statusTagText}>✓ Local verificado</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatCard value="47" label="Ventas totales" />
            <StatCard value="$214" label="Ingresos" />
            <StatCard value="18.8 kg" label="Rescatados" />
          </View>

          {/* Info section */}
          <Text style={styles.sectionTitle}>Información del local</Text>

          <InfoField
            label="Teléfono"
            value={phone}
            editing={editing}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <InfoField
            label="Dirección"
            value={address}
            editing={editing}
            onChangeText={setAddress}
          />

          {editing ? (
            <ZoneAutocomplete label="Zona / Sector" value={zone} onChange={setZone} />
          ) : (
            <InfoField label="Zona" value={zone} editing={false} onChangeText={() => {}} />
          )}

          <InfoField
            label="Horario de atención"
            value={schedule}
            editing={editing}
            onChangeText={setSchedule}
          />
          <InfoField
            label="Descripción"
            value={description}
            editing={editing}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.sectionTitle}>Cuenta</Text>

          <View style={styles.accountCard}>
            <AccountRow label="Correo" value="donpepe@pizza.com" icon="📧" />
            <AccountRow label="RIF" value="J-12345678-9" icon="📄" />
            <AccountRow label="Estado" value="Verificado" icon="✅" />
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
        <Text style={styles.infoValue}>{value}</Text>
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
  statusTagText: { ...typography.caption, fontWeight: '600', color: colors.primary },
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
  dangerZone: {
    borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg, marginTop: spacing.lg,
  },
  dangerTitle: { ...typography.caption, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.md },
  logoutBtn: {
    borderWidth: 1.5, borderColor: colors.error, borderRadius: borderRadius.full,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  logoutBtnText: { ...typography.button, color: colors.error },
});
