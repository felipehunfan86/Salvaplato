import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, SafeAreaView, StatusBar, ScrollView,
  Platform, KeyboardAvoidingView,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

type Props = {
  amount: number;
  productName: string;
  onBack: () => void;
  onPaymentSuccess: () => void;
};

export default function PaymentScreen({ amount, productName, onBack, onPaymentSuccess }: Props) {
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardName, setCardName] = useState('Felipe Hunfan');
  const [expiry, setExpiry] = useState('12/26');
  const [cvv, setCvv] = useState('123');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const formatCardNumber = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const getCardType = () => {
    const digits = cardNumber.replace(/\s/g, '');
    if (digits.startsWith('4')) return '💳 Visa';
    if (digits.startsWith('5')) return '💳 Mastercard';
    if (digits.startsWith('3')) return '💳 Amex';
    return '💳';
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length < 16) newErrors.cardNumber = 'Número de tarjeta inválido.';
    if (!cardName.trim()) newErrors.cardName = 'El nombre es obligatorio.';
    if (expiry.length < 5) newErrors.expiry = 'Fecha inválida.';
    if (cvv.length < 3) newErrors.cvv = 'CVV inválido.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePay = () => {
    if (!validate()) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onPaymentSuccess();
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pago seguro</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Amount summary */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Total a pagar por</Text>
            <Text style={styles.productName} numberOfLines={1}>{productName}</Text>
            <Text style={styles.amount}>${amount.toFixed(2)} USD</Text>
          </View>

          {/* Card preview */}
          <View style={styles.cardPreview}>
            <View style={styles.cardPreviewTop}>
              <Text style={styles.cardPreviewBank}>SalvaPlato Pay</Text>
              <Text style={styles.cardPreviewType}>{getCardType()}</Text>
            </View>
            <Text style={styles.cardPreviewNumber}>
              {cardNumber || '•••• •••• •••• ••••'}
            </Text>
            <View style={styles.cardPreviewBottom}>
              <View>
                <Text style={styles.cardPreviewLabel}>Titular</Text>
                <Text style={styles.cardPreviewValue}>{cardName || '—'}</Text>
              </View>
              <View>
                <Text style={styles.cardPreviewLabel}>Vence</Text>
                <Text style={styles.cardPreviewValue}>{expiry || '••/••'}</Text>
              </View>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Field
              label="Número de tarjeta"
              value={cardNumber}
              onChangeText={(t) => setCardNumber(formatCardNumber(t))}
              placeholder="0000 0000 0000 0000"
              keyboardType="numeric"
              error={errors.cardNumber}
            />
            <Field
              label="Nombre en la tarjeta"
              value={cardName}
              onChangeText={setCardName}
              placeholder="Como aparece en la tarjeta"
              autoCapitalize="characters"
              error={errors.cardName}
            />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Field
                  label="Vencimiento"
                  value={expiry}
                  onChangeText={(t) => setExpiry(formatExpiry(t))}
                  placeholder="MM/AA"
                  keyboardType="numeric"
                  error={errors.expiry}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="CVV"
                  value={cvv}
                  onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 4))}
                  placeholder="•••"
                  keyboardType="numeric"
                  secureTextEntry
                  error={errors.cvv}
                />
              </View>
            </View>

            <View style={styles.secureNote}>
              <Text style={styles.secureText}>🔒 Pago procesado de forma segura vía Stripe</Text>
            </View>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Pay button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.payBtn, processing && styles.payBtnDisabled]}
            onPress={handlePay}
            disabled={processing}
          >
            <Text style={styles.payBtnText}>
              {processing ? 'Procesando...' : `Pagar $${amount.toFixed(2)} USD`}
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize, secureTextEntry, error }: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder: string; keyboardType?: any; autoCapitalize?: any;
  secureTextEntry?: boolean; error?: string;
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
        autoCapitalize={autoCapitalize ?? 'none'}
        secureTextEntry={secureTextEntry}
      />
      {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: { ...typography.caption, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    ...typography.body,
    color: colors.textPrimary,
  },
  inputError: { borderColor: colors.error },
  errorText: { ...typography.caption, color: colors.error, marginTop: spacing.xs },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: { width: 40, height: 40, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 28, color: colors.textPrimary, lineHeight: 32 },
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  amountCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  amountLabel: { ...typography.caption, color: 'rgba(255,255,255,0.8)', marginBottom: spacing.xs },
  productName: { ...typography.body, color: colors.textLight, fontWeight: '600', marginBottom: spacing.sm },
  amount: { fontSize: 32, fontWeight: '700', color: colors.textLight },
  cardPreview: {
    backgroundColor: '#1a1a2e',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    height: 180,
    justifyContent: 'space-between',
  },
  cardPreviewTop: { flexDirection: 'row', justifyContent: 'space-between' },
  cardPreviewBank: { ...typography.caption, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  cardPreviewType: { ...typography.caption, color: 'rgba(255,255,255,0.7)' },
  cardPreviewNumber: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', letterSpacing: 2 },
  cardPreviewBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardPreviewLabel: { ...typography.caption, color: 'rgba(255,255,255,0.6)', marginBottom: 2 },
  cardPreviewValue: { ...typography.body, color: '#FFFFFF', fontWeight: '600' },
  form: {},
  row: { flexDirection: 'row', gap: spacing.md },
  secureNote: {
    backgroundColor: '#E8F5E9',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  secureText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  payBtn: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    elevation: 4,
  },
  payBtnDisabled: { backgroundColor: colors.border },
  payBtnText: { ...typography.button, color: colors.textLight },
});
