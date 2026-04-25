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
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { apiRequest, saveAuth, StoredUser } from '../../services/api';

type AuthResult = { session: { access_token: string }; user: { id: string; email: string; user_metadata?: { full_name?: string; phone?: string } } };

type Props = {
  onLogin: (user: StoredUser) => void;
  onRegister: () => void;
  onBack: () => void;
  onForgotPassword: () => void;
};

export default function LoginScreen({ onLogin, onRegister, onBack, onForgotPassword }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest<AuthResult>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const user: StoredUser = {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name ?? data.user.email,
        phone: data.user.user_metadata?.phone,
      };
      await saveAuth(data.session.access_token, user);
      onLogin(user);
    } catch (e: any) {
      setError(e.message ?? 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🍽️</Text>
          </View>
          <Text style={styles.title}>Bienvenido de nuevo</Text>
          <Text style={styles.subtitle}>Inicia sesión para reservar tus ofertas</Text>

          {/* Form */}
          <View style={styles.form}>
            <Field
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              rightAction={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.showPasswordText}>{showPassword ? 'Ocultar' : 'Ver'}</Text>
                </TouchableOpacity>
              }
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity onPress={onForgotPassword} style={styles.forgotBtn}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btnPrimary, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnPrimaryText}>Iniciar sesión</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Register */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={onRegister}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, rightAction,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  rightAction?: React.ReactNode;
}) {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={fieldStyles.inputRow}>
        <TextInput
          style={fieldStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'sentences'}
        />
        {rightAction}
      </View>
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
  input: {
    flex: 1,
    paddingVertical: spacing.md - 2,
    ...typography.body,
    color: colors.textPrimary,
  },
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
  backBtnText: {
    fontSize: 28,
    color: colors.textPrimary,
    lineHeight: 32,
  },
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
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  form: { marginBottom: spacing.lg },
  showPasswordText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    paddingLeft: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: spacing.lg },
  forgotText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
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
  btnDisabled: { backgroundColor: colors.border },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  registerText: { ...typography.body, color: colors.textSecondary },
  registerLink: { ...typography.body, color: colors.primary, fontWeight: '700' },
});
