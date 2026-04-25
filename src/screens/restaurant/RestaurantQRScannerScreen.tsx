import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Platform,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

type Props = {
  onBack: () => void;
};

type ScanState = 'scanning' | 'success' | 'error';

const MOCK_CONFIRMED_ORDER = {
  id: 'ORD-001',
  customer: 'María García',
  product: 'Pizza Margarita (2 und)',
  amount: 4.5,
};

export default function RestaurantQRScannerScreen({ onBack }: Props) {
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [countdown, setCountdown] = useState(3);

  const simulateScan = () => {
    setScanState('scanning');
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setScanState('success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleError = () => {
    setScanState('error');
  };

  const reset = () => {
    setScanState('scanning');
    setCountdown(3);
  };

  if (scanState === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.successEmoji}>✅</Text>
          </View>
          <Text style={styles.successTitle}>¡Retiro confirmado!</Text>
          <Text style={styles.successSubtitle}>El pago ha sido liberado a tu cuenta</Text>

          <View style={styles.successCard}>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Pedido</Text>
              <Text style={styles.successValue}>{MOCK_CONFIRMED_ORDER.id}</Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Cliente</Text>
              <Text style={styles.successValue}>{MOCK_CONFIRMED_ORDER.customer}</Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Producto</Text>
              <Text style={styles.successValue}>{MOCK_CONFIRMED_ORDER.product}</Text>
            </View>
            <View style={[styles.successRow, styles.successRowLast]}>
              <Text style={styles.successLabel}>Monto recibido</Text>
              <Text style={[styles.successValue, styles.successAmount]}>${MOCK_CONFIRMED_ORDER.amount.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.scanAgainBtn} onPress={reset}>
            <Text style={styles.scanAgainBtnText}>Escanear otro QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn2} onPress={onBack}>
            <Text style={styles.backBtn2Text}>Volver a pedidos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (scanState === 'error') {
    return (
      <SafeAreaView style={[styles.container, styles.errorBg]}>
        <StatusBar barStyle="light-content" backgroundColor="#B71C1C" />
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, styles.errorIcon]}>
            <Text style={styles.successEmoji}>❌</Text>
          </View>
          <Text style={[styles.successTitle, styles.errorTitle]}>QR no válido</Text>
          <Text style={[styles.successSubtitle, styles.errorSubtitle]}>
            Este código no corresponde a ningún pedido activo o ya fue escaneado.
          </Text>

          <TouchableOpacity style={styles.scanAgainBtn} onPress={reset}>
            <Text style={styles.scanAgainBtnText}>Intentar de nuevo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn2} onPress={onBack}>
            <Text style={styles.backBtn2Text}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, styles.darkBg]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.scanHeader}>
        <TouchableOpacity style={styles.closeBtn} onPress={onBack}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.scanTitle}>Escanear QR del cliente</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Camera simulation */}
      <View style={styles.cameraArea}>
        <View style={styles.cameraFrame}>
          {/* Corner markers */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Center */}
          <View style={styles.cameraCenter}>
            <Text style={styles.cameraIcon}>📷</Text>
            <Text style={styles.cameraHint}>Apunta la cámara al código QR del cliente</Text>
          </View>
        </View>

        <Text style={styles.scanHint}>El QR se encuentra en la app del cliente</Text>
      </View>

      {/* Actions */}
      <View style={styles.scanActions}>
        <Text style={styles.simLabel}>— Simulación —</Text>
        <TouchableOpacity style={styles.simulateBtn} onPress={simulateScan}>
          <Text style={styles.simulateBtnText}>
            {countdown < 3 ? `Escaneando... ${countdown}` : '📷  Simular escaneo exitoso'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.errorBtn} onPress={handleError}>
          <Text style={styles.errorBtnText}>Simular QR inválido</Text>
        </TouchableOpacity>
        <Text style={styles.note}>
          La cámara real se integrará cuando conectemos la app al backend con expo-camera.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const CORNER_SIZE = 28;
const CORNER_THICKNESS = 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  darkBg: { backgroundColor: '#111' },
  errorBg: { backgroundColor: '#B71C1C' },
  scanHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  closeBtn: { width: 40, height: 40, borderRadius: borderRadius.full, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 16, color: '#fff' },
  scanTitle: { ...typography.h3, color: '#fff' },
  cameraArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  cameraFrame: {
    width: 260, height: 260, position: 'relative',
    alignItems: 'center', justifyContent: 'center',
  },
  corner: {
    position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE,
    borderColor: colors.secondary,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderBottomRightRadius: 4 },
  cameraCenter: { alignItems: 'center', gap: spacing.md },
  cameraIcon: { fontSize: 56 },
  cameraHint: { ...typography.caption, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
  scanHint: { ...typography.caption, color: 'rgba(255,255,255,0.5)', marginTop: spacing.xl, textAlign: 'center' },
  scanActions: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm, alignItems: 'center' },
  simLabel: { ...typography.caption, color: 'rgba(255,255,255,0.4)' },
  simulateBtn: {
    backgroundColor: colors.secondary, borderRadius: borderRadius.full,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl,
  },
  simulateBtnText: { ...typography.button, color: colors.textLight },
  errorBtn: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: borderRadius.full, paddingVertical: spacing.md, paddingHorizontal: spacing.xl,
  },
  errorBtnText: { ...typography.body, color: 'rgba(255,255,255,0.6)' },
  note: { ...typography.caption, color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 18 },
  // Success / Error states
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  successIcon: {
    width: 96, height: 96, borderRadius: borderRadius.full,
    backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  errorIcon: { backgroundColor: '#FFEBEE' },
  successEmoji: { fontSize: 48 },
  successTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm, textAlign: 'center' },
  errorTitle: { color: colors.textLight },
  successSubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  errorSubtitle: { color: 'rgba(255,255,255,0.8)' },
  successCard: {
    width: '100%', backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.xl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  successRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  successRowLast: { borderBottomWidth: 0 },
  successLabel: { ...typography.caption, color: colors.textSecondary },
  successValue: { ...typography.body, fontWeight: '600', color: colors.textPrimary, flex: 1, textAlign: 'right' },
  successAmount: { color: colors.primary, fontSize: 18, fontWeight: '700' },
  scanAgainBtn: {
    backgroundColor: colors.secondary, borderRadius: borderRadius.full,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl, marginBottom: spacing.sm,
  },
  scanAgainBtnText: { ...typography.button, color: colors.textLight },
  backBtn2: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.full,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl,
  },
  backBtn2Text: { ...typography.body, color: colors.textPrimary },
});
