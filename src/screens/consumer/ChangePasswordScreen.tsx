import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, Platform, ScrollView, KeyboardAvoidingView,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

type Props = { onBack: () => void };

export default function ChangePasswordScreen({ onBack }: Props) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!current) e.current = 'Ingresa tu contraseña actual.';
    if (newPass.length < 6) e.newPass = 'Mínimo 6 caracteres.';
    if (newPass !== confirm) e.confirm = 'Las contraseñas no coinciden.';
    if (current === newPass) e.newPass = 'La nueva contraseña debe ser diferente.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = () => {
    if (!validate()) return;
    setSuccess(true);
    setCurrent(''); setNewPass(''); setConfirm('');
    setTimeout(() => setSuccess(false), 3000);
  };

  const strength = newPass.length === 0 ? null
    : newPass.length < 6 ? 'débil'
    : newPass.length < 10 ? 'media'
    : 'fuerte';

  const strengthColor = strength === 'débil' ? colors.error
    : strength === 'media' ? colors.secondary
    : colors.primary;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cambiar contraseña</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <View style={styles.iconSection}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.description}>
              Tu nueva contraseña debe tener al menos 6 caracteres.
            </Text>
          </View>

          <View style={styles.form}>
            <PasswordField
              label="Contraseña actual"
              value={current}
              onChangeText={setCurrent}
              show={showCurrent}
              onToggleShow={() => setShowCurrent(!showCurrent)}
              error={errors.current}
            />
            <PasswordField
              label="Nueva contraseña"
              value={newPass}
              onChangeText={setNewPass}
              show={showNew}
              onToggleShow={() => setShowNew(!showNew)}
              error={errors.newPass}
            />
            {newPass.length > 0 && (
              <View style={styles.strengthRow}>
                <View style={styles.strengthBar}>
                  <View style={[
                    styles.strengthFill,
                    { width: `${Math.min((newPass.length / 12) * 100, 100)}%`, backgroundColor: strengthColor }
                  ]} />
                </View>
                <Text style={[styles.strengthText, { color: strengthColor }]}>
                  Contraseña {strength}
                </Text>
              </View>
            )}
            <PasswordField
              label="Confirmar nueva contraseña"
              value={confirm}
              onChangeText={setConfirm}
              show={showNew}
              onToggleShow={() => setShowNew(!showNew)}
              error={errors.confirm}
            />
          </View>

          {success && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>✓ Contraseña actualizada correctamente</Text>
            </View>
          )}

          <View style={{ height: spacing.xl }} />
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleChange}>
            <Text style={styles.saveBtnText}>Actualizar contraseña</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PasswordField({ label, value, onChangeText, show, onToggleShow, error }: {
  label: string; value: string; onChangeText: (v: string) => void;
  show: boolean; onToggleShow: () => void; error?: string;
}) {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={[fieldStyles.inputRow, error ? fieldStyles.inputError : null]}>
        <TextInput
          style={fieldStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="••••••••"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={!show}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={onToggleShow}>
          <Text style={fieldStyles.toggle}>{show ? 'Ocultar' : 'Ver'}</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: { ...typography.caption, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md,
  },
  inputError: { borderColor: colors.error },
  input: { flex: 1, paddingVertical: spacing.md - 2, ...typography.body, color: colors.textPrimary },
  toggle: { ...typography.caption, color: colors.primary, fontWeight: '600', paddingLeft: spacing.sm },
  errorText: { ...typography.caption, color: colors.error, marginTop: spacing.xs },
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
  scroll: { padding: spacing.lg },
  iconSection: { alignItems: 'center', marginBottom: spacing.xl },
  lockIcon: { fontSize: 52, marginBottom: spacing.md },
  description: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  form: {},
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: -spacing.sm, marginBottom: spacing.md },
  strengthBar: { flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 2 },
  strengthText: { ...typography.caption, fontWeight: '600', width: 90 },
  successBanner: {
    backgroundColor: '#E8F5E9', borderRadius: borderRadius.md,
    padding: spacing.md, alignItems: 'center',
  },
  successText: { ...typography.body, color: colors.primary, fontWeight: '600' },
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
