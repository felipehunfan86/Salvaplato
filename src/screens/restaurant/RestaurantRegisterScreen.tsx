import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, ScrollView, Platform, KeyboardAvoidingView,
  ActivityIndicator, Alert,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import ZoneAutocomplete from '../../components/ZoneAutocomplete';
import { apiRequest, saveAuth } from '../../services/api';

type Props = {
  onRegister: (businessName: string) => void;
  onLogin: () => void;
  onBack: () => void;
};

export type RestaurantData = {
  businessName: string;
  rif: string;
  ownerName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  zone: string;
  category: string;
  schedule: string;
};

const CATEGORIES = ['🍕 Pizzería', '🍔 Hamburguesas', '🍣 Japonesa', '🌮 Mexicana', '🍗 Pollos', '🥗 Saludable', '🍝 Italiana', '🥘 Criolla', '🧁 Repostería', '☕ Cafetería', '🥪 Sándwiches', 'Otro'];

export default function RestaurantRegisterScreen({ onRegister, onLogin, onBack }: Props) {
  const [businessName, setBusinessName] = useState('');
  const [rif, setRif] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState('');
  const [category, setCategory] = useState('');
  const [schedule, setSchedule] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!businessName.trim()) e.businessName = 'Nombre del local obligatorio.';
    if (!rif.trim()) e.rif = 'RIF obligatorio.';
    if (!ownerName.trim()) e.ownerName = 'Nombre del responsable obligatorio.';
    if (!email.trim() || !email.includes('@')) e.email = 'Correo válido obligatorio.';
    if (password.length < 6) e.password = 'Mínimo 6 caracteres.';
    if (password !== confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden.';
    if (!phone.trim()) e.phone = 'Teléfono obligatorio.';
    if (!address.trim()) e.address = 'Dirección obligatoria.';
    if (!zone.trim()) e.zone = 'Zona obligatoria.';
    if (!category) e.category = 'Selecciona una categoría.';
    if (!schedule.trim()) e.schedule = 'Horario obligatorio.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // 1. Crear cuenta de usuario
      const auth = await apiRequest<{ session: { access_token: string; refresh_token: string }; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName: ownerName, email, password, phone }),
      });
      await saveAuth(auth.session.access_token, {
        id: auth.user.id,
        email: auth.user.email,
        full_name: ownerName,
        phone,
      });

      // 2. Registrar el restaurante
      await apiRequest('/restaurants', {
        method: 'POST',
        body: JSON.stringify({
          name: businessName,
          rif,
          ownerName,
          phone,
          address,
          cuisineType: category,
          schedule,
        }),
      });

      onRegister(businessName);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo completar el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🏪</Text>
          </View>
          <Text style={styles.title}>Registra tu local</Text>
          <Text style={styles.subtitle}>Comienza a vender tus excedentes hoy</Text>

          <Text style={styles.sectionTitle}>Datos del local</Text>
          <Field label="Nombre del local *" value={businessName} onChangeText={setBusinessName} placeholder="Ej: Pizzería Don Pepe" error={errors.businessName} />
          <Field label="RIF *" value={rif} onChangeText={setRif} placeholder="J-12345678-9" autoCapitalize="characters" error={errors.rif} />

          <Text style={styles.sectionTitle}>Categoría *</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}

          <Text style={styles.sectionTitle}>Ubicación</Text>
          <Field label="Dirección exacta *" value={address} onChangeText={setAddress} placeholder="Av. Principal, local 5-B" error={errors.address} />
          <ZoneAutocomplete label="Zona / Sector *" value={zone} onChange={setZone} error={errors.zone} />

          <Text style={styles.sectionTitle}>Horario de atención *</Text>
          <Field label="Horario" value={schedule} onChangeText={setSchedule} placeholder="Lun-Vie 11am-9pm, Sáb-Dom 12pm-8pm" error={errors.schedule} />

          <Text style={styles.sectionTitle}>Datos del responsable</Text>
          <Field label="Nombre y apellido *" value={ownerName} onChangeText={setOwnerName} placeholder="Ana Rodríguez" error={errors.ownerName} />
          <Field label="Teléfono *" value={phone} onChangeText={setPhone} placeholder="+58 412 000 0000" keyboardType="phone-pad" error={errors.phone} />

          <Text style={styles.sectionTitle}>Acceso</Text>
          <Field label="Correo electrónico *" value={email} onChangeText={setEmail} placeholder="local@email.com" keyboardType="email-address" autoCapitalize="none" error={errors.email} />
          <PasswordField label="Contraseña *" value={password} onChangeText={setPassword} show={showPassword} onToggle={() => setShowPassword(!showPassword)} error={errors.password} />
          <PasswordField label="Confirmar contraseña *" value={confirmPassword} onChangeText={setConfirmPassword} show={showPassword} error={errors.confirmPassword} />

          <View style={styles.verificationNote}>
            <Text style={styles.verificationIcon}>🔍</Text>
            <Text style={styles.verificationText}>
              Tu local será revisado por nuestro equipo en un plazo de 24-48h antes de poder publicar ofertas.
            </Text>
          </View>

          <Text style={styles.termsText}>
            Al registrarte aceptas nuestros{' '}
            <Text style={styles.termsLink}>Términos para locales</Text>
            {' '}y{' '}
            <Text style={styles.termsLink}>Política de privacidad</Text>.
          </Text>

          <TouchableOpacity style={[styles.btnPrimary, loading && { opacity: 0.6 }]} onPress={handleRegister} disabled={loading}>
            {loading
              ? <ActivityIndicator color={colors.textLight} />
              : <Text style={styles.btnPrimaryText}>Enviar solicitud</Text>
            }
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={onLogin}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize, error }: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder: string; keyboardType?: any; autoCapitalize?: any; error?: string;
}) {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={[fieldStyles.input, error ? fieldStyles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'words'}
        autoCorrect={false}
      />
      {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
    </View>
  );
}

function PasswordField({ label, value, onChangeText, show, onToggle, error }: {
  label: string; value: string; onChangeText: (v: string) => void;
  show: boolean; onToggle?: () => void; error?: string;
}) {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={[fieldStyles.inputRow, error ? fieldStyles.inputError : null]}>
        <TextInput
          style={fieldStyles.inputFlex}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          placeholder="Mínimo 6 caracteres"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {onToggle && (
          <TouchableOpacity onPress={onToggle}>
            <Text style={fieldStyles.toggle}>{show ? 'Ocultar' : 'Ver'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
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
  inputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  inputFlex: { flex: 1, paddingVertical: spacing.md - 2, ...typography.body, color: colors.textPrimary },
  inputError: { borderColor: colors.error },
  errorText: { ...typography.caption, color: colors.error, marginTop: spacing.xs },
  toggle: { ...typography.caption, color: colors.primary, fontWeight: '600', paddingLeft: spacing.sm },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  backBtn: {
    width: 40, height: 40, borderRadius: borderRadius.full, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', marginTop: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  backBtnText: { fontSize: 28, color: colors.textPrimary, lineHeight: 32 },
  logoContainer: {
    width: 72, height: 72, borderRadius: borderRadius.full, backgroundColor: colors.secondary,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
    marginTop: spacing.xl, marginBottom: spacing.md,
  },
  logoEmoji: { fontSize: 36 },
  title: { ...typography.h2, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.md, marginBottom: spacing.sm },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  categoryChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  categoryChipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  categoryChipText: { ...typography.caption, fontWeight: '600', color: '#212121' },
  categoryChipTextActive: { color: colors.textLight },
  errorText: { ...typography.caption, color: colors.error, marginBottom: spacing.sm },
  verificationNote: {
    flexDirection: 'row', gap: spacing.sm, backgroundColor: '#FFF8E1',
    borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg, marginTop: spacing.md,
  },
  verificationIcon: { fontSize: 18 },
  verificationText: { ...typography.caption, color: '#795548', flex: 1, lineHeight: 18 },
  termsText: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 18 },
  termsLink: { color: colors.primary, fontWeight: '600' },
  btnPrimary: {
    backgroundColor: colors.secondary, borderRadius: borderRadius.full,
    paddingVertical: spacing.md, alignItems: 'center', elevation: 4,
    shadowColor: colors.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  btnPrimaryText: { ...typography.button, color: colors.textLight },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  loginText: { ...typography.body, color: colors.textSecondary },
  loginLink: { ...typography.body, color: colors.primary, fontWeight: '700' },
});
