import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import ZoneAutocomplete from '../../components/ZoneAutocomplete';

type Props = {
  onRegister: (data: RegisterData) => void;
  onLogin: () => void;
  onBack: () => void;
};

export type RegisterData = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
};

export default function RegisterScreen({ onRegister, onLogin, onBack }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterData & { confirmPassword: string }>>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!fullName.trim()) newErrors.fullName = 'El nombre es obligatorio.';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'Ingresa un correo válido.';
    if (password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    if (!phone.trim()) newErrors.phone = 'El teléfono es obligatorio.';
    if (!city.trim()) newErrors.city = 'La ciudad es obligatoria.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (!validate()) return;
    onRegister({ fullName, email, password, phone, city });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🍽️</Text>
          </View>
          <Text style={styles.title}>Crea tu cuenta</Text>
          <Text style={styles.subtitle}>Es gratis y solo toma un minuto</Text>

          <View style={styles.form}>
            <Field
              label="Nombre completo *"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Felipe Hunfan"
              error={errors.fullName}
            />
            <Field
              label="Correo electrónico *"
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            <Field
              label="Contraseña *"
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry={!showPassword}
              error={errors.password}
              rightAction={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.showPasswordText}>{showPassword ? 'Ocultar' : 'Ver'}</Text>
                </TouchableOpacity>
              }
            />
            <Field
              label="Confirmar contraseña *"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repite tu contraseña"
              secureTextEntry={!showPassword}
              error={errors.confirmPassword}
            />
            <Field
              label="Teléfono *"
              value={phone}
              onChangeText={setPhone}
              placeholder="+58 412 000 0000"
              keyboardType="phone-pad"
              error={errors.phone}
            />
            <ZoneAutocomplete
              label="Ciudad / Zona *"
              value={city}
              onChange={setCity}
              error={errors.city}
            />

            <Text style={styles.termsText}>
              Al registrarte aceptas nuestros{' '}
              <Text style={styles.termsLink}>Términos y condiciones</Text>
              {' '}y{' '}
              <Text style={styles.termsLink}>Política de privacidad</Text>.
            </Text>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister}>
              <Text style={styles.btnPrimaryText}>Crear cuenta</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={onLogin}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label, value, onChangeText, placeholder, secureTextEntry,
  keyboardType, autoCapitalize, rightAction, error,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  rightAction?: React.ReactNode;
  error?: string;
}) {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={[fieldStyles.inputRow, error ? fieldStyles.inputError : null]}>
        <TextInput
          style={fieldStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'words'}
        />
        {rightAction}
      </View>
      {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: { ...typography.caption, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  inputError: { borderColor: colors.error },
  input: {
    flex: 1,
    paddingVertical: spacing.md - 2,
    ...typography.body,
    color: colors.textPrimary,
  },
  errorText: { ...typography.caption, color: colors.error, marginTop: spacing.xs },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backBtnText: { fontSize: 28, color: colors.textPrimary, lineHeight: 32 },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  logoEmoji: { fontSize: 36 },
  title: { ...typography.h2, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  form: { marginBottom: spacing.lg },
  showPasswordText: { ...typography.caption, color: colors.primary, fontWeight: '600', paddingLeft: spacing.sm },
  termsText: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 18 },
  termsLink: { color: colors.primary, fontWeight: '600' },
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimaryText: { ...typography.button, color: colors.textLight },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  loginText: { ...typography.body, color: colors.textSecondary },
  loginLink: { ...typography.body, color: colors.primary, fontWeight: '700' },
});
