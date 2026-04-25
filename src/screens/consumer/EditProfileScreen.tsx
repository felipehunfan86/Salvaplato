import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, ScrollView, Platform, KeyboardAvoidingView,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import ZoneAutocomplete from '../../components/ZoneAutocomplete';

type Props = {
  onBack: () => void;
  onSave: (data: { fullName: string; phone: string; city: string }) => void;
};

export default function EditProfileScreen({ onBack, onSave }: Props) {
  const [fullName, setFullName] = useState('Felipe Hunfan');
  const [phone, setPhone] = useState('+58 412 000 0000');
  const [city, setCity] = useState('Caracas, Las Mercedes');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({ fullName, phone, city });
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
          <Text style={styles.headerTitle}>Editar perfil</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.changePhotoText}>Cambiar foto</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Field label="Nombre completo" value={fullName} onChangeText={setFullName} placeholder="Tu nombre" />
            <Field label="Correo electrónico" value="fhunfan@gmail.com" onChangeText={() => {}} placeholder="" disabled />
            <Field label="Teléfono" value={phone} onChangeText={setPhone} placeholder="+58 412 000 0000" keyboardType="phone-pad" />
            <ZoneAutocomplete label="Ciudad / Zona" value={city} onChange={setCity} />
          </View>

          {saved && (
            <View style={styles.savedBanner}>
              <Text style={styles.savedText}>✓ Cambios guardados</Text>
            </View>
          )}

          <View style={{ height: spacing.xl }} />
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Guardar cambios</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType, disabled }: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder: string; keyboardType?: any; disabled?: boolean;
}) {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={[fieldStyles.input, disabled && fieldStyles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
        editable={!disabled}
      />
      {disabled && <Text style={fieldStyles.hint}>El correo no se puede modificar</Text>}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: { ...typography.caption, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2, ...typography.body, color: colors.textPrimary,
  },
  inputDisabled: { backgroundColor: '#F5F5F5', color: colors.textSecondary },
  hint: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
});

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
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: {
    width: 88, height: 88, borderRadius: borderRadius.full,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  avatarEmoji: { fontSize: 44 },
  changePhotoText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  form: {},
  savedBanner: {
    backgroundColor: '#E8F5E9', borderRadius: borderRadius.md,
    padding: spacing.md, alignItems: 'center', marginBottom: spacing.md,
  },
  savedText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  bottomBar: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
  },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.full,
    paddingVertical: spacing.md, alignItems: 'center', elevation: 4,
  },
  saveBtnText: { ...typography.button, color: colors.textLight },
});
