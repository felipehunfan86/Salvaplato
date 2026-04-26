import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, Platform, KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { apiRequest } from '../../services/api';

type Props = {
  onBack: () => void;
};

export default function ForgotPasswordScreen({ onBack }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Ingresa un correo electrónico válido');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setSent(true);
    } catch (e: any) {
      setError(e.message ?? 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>

          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>

          {sent ? (
            <View style={styles.successContainer}>
              <Text style={styles.bigEmoji}>📧</Text>
              <Text style={styles.title}>Revisa tu correo</Text>
              <Text style={styles.subtitle}>
                Enviamos un enlace de recuperación a:
              </Text>
              <View style={styles.emailBox}>
                <Text style={styles.emailText}>{email.trim().toLowerCase()}</Text>
              </View>
              <Text style={styles.hint}>
                Haz clic en el enlace del correo para crear una nueva contraseña. Puede tardar unos minutos en llegar.
              </Text>
              <TouchableOpacity style={styles.btnPrimary} onPress={onBack}>
                <Text style={styles.btnPrimaryText}>Volver al inicio de sesión</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <Text style={styles.bigEmoji}>🔑</Text>
              </View>
              <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
              <Text style={styles.subtitle}>
                Escribe tu correo y te enviaremos un enlace para restablecerla
              </Text>

              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>Correo electrónico</Text>
                <TextInput
                  style={[styles.input, error ? styles.inputError : null]}
                  value={email}
                  onChangeText={t => { setEmail(t); setError(''); }}
                  placeholder="tu@email.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </View>

              <TouchableOpacity
                style={[styles.btnPrimary, loading && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color={colors.textLight} />
                  : <Text style={styles.btnPrimaryText}>Enviar enlace</Text>
                }
              </TouchableOpacity>
            </>
          )}

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  backBtn: {
    width: 40, height: 40, borderRadius: borderRadius.full,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    marginTop: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  backBtnText: { fontSize: 28, color: colors.textPrimary, lineHeight: 32 },
  iconContainer: { alignItems: 'center', marginTop: spacing.xl * 2, marginBottom: spacing.lg },
  bigEmoji: { fontSize: 56, textAlign: 'center', marginTop: spacing.xl * 2, marginBottom: spacing.lg },
  title: { ...typography.h2, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22 },
  fieldWrapper: { marginBottom: spacing.lg },
  label: { ...typography.caption, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md,
    paddingVertical: spacing.md, ...typography.body, color: colors.textPrimary,
  },
  inputError: { borderColor: colors.error },
  errorText: { ...typography.caption, color: colors.error, marginTop: spacing.xs },
  btnPrimary: {
    backgroundColor: colors.primary, borderRadius: borderRadius.full,
    paddingVertical: spacing.md, alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnDisabled: { backgroundColor: colors.border, shadowOpacity: 0 },
  btnPrimaryText: { ...typography.button, color: colors.textLight },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  emailBox: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    marginVertical: spacing.lg,
  },
  emailText: { ...typography.body, fontWeight: '700', color: colors.primary, textAlign: 'center' },
  hint: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.xl },
});
