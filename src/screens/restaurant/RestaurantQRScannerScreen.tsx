import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Platform, ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, spacing, borderRadius, typography } from '../../theme';

type Props = {
  onBack: () => void;
};

type ScanState = 'scanning' | 'loading' | 'success' | 'error';

type ConfirmedOrder = {
  order_code: string;
  quantity: number;
  restaurant_payout: number;
};

export default function RestaurantQRScannerScreen({ onBack }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = useCallback(async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setScanState('loading');

    try {
      // TODO: reemplazar con token real del restaurante autenticado
      const token = 'RESTAURANT_JWT_TOKEN';

      const res = await fetch(`http://localhost:3000/api/orders/scan/${data}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.message ?? 'QR inválido o ya escaneado');
        setScanState('error');
      } else {
        setConfirmedOrder(json);
        setScanState('success');
      }
    } catch {
      setErrorMsg('Error de conexión. Verifica tu internet.');
      setScanState('error');
    }
  }, [scanned]);

  const reset = () => {
    setScanState('scanning');
    setScanned(false);
    setConfirmedOrder(null);
    setErrorMsg('');
  };

  // Sin permiso aún — pedir
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, styles.centeredContent]}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.permissionEmoji}>📷</Text>
        <Text style={styles.permissionTitle}>Permiso de cámara requerido</Text>
        <Text style={styles.permissionBody}>
          SalvaPlato necesita acceso a la cámara para escanear los QR de tus clientes.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Dar permiso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backLink} onPress={onBack}>
          <Text style={styles.backLinkText}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (scanState === 'success' && confirmedOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />
        <View style={styles.resultContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.resultEmoji}>✅</Text>
          </View>
          <Text style={styles.resultTitle}>¡Retiro confirmado!</Text>
          <Text style={styles.resultSubtitle}>El pago ha sido liberado a tu cuenta</Text>

          <View style={styles.resultCard}>
            <ResultRow label="Código" value={confirmedOrder.order_code} />
            <ResultRow label="Unidades" value={String(confirmedOrder.quantity)} />
            <ResultRow
              label="Monto recibido"
              value={`$${confirmedOrder.restaurant_payout.toFixed(2)}`}
              highlight
            />
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={reset}>
            <Text style={styles.primaryBtnText}>Escanear otro QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={onBack}>
            <Text style={styles.secondaryBtnText}>Volver a pedidos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (scanState === 'error') {
    return (
      <SafeAreaView style={[styles.container, styles.errorBg]}>
        <StatusBar barStyle="light-content" backgroundColor="#B71C1C" />
        <View style={styles.resultContainer}>
          <View style={[styles.successIcon, styles.errorIcon]}>
            <Text style={styles.resultEmoji}>❌</Text>
          </View>
          <Text style={[styles.resultTitle, styles.lightText]}>QR no válido</Text>
          <Text style={[styles.resultSubtitle, styles.lightText]}>{errorMsg}</Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={reset}>
            <Text style={styles.primaryBtnText}>Intentar de nuevo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={onBack}>
            <Text style={[styles.secondaryBtnText, styles.lightText]}>Volver</Text>
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

      <View style={styles.cameraContainer}>
        {scanState === 'loading' ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.secondary} />
            <Text style={styles.loadingText}>Verificando pedido...</Text>
          </View>
        ) : (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarCodeScanned}
          />
        )}

        {/* Visor */}
        <View style={styles.viewfinderOuter}>
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        </View>
      </View>

      <View style={styles.hintBar}>
        <Text style={styles.hintText}>Apunta al código QR de la app del cliente</Text>
      </View>
    </SafeAreaView>
  );
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={resultRowStyles.row}>
      <Text style={resultRowStyles.label}>{label}</Text>
      <Text style={[resultRowStyles.value, highlight && resultRowStyles.highlight]}>{value}</Text>
    </View>
  );
}

const resultRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { ...typography.caption, color: colors.textSecondary },
  value: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  highlight: { color: colors.primary, fontSize: 18, fontWeight: '700' },
});

const CORNER_SIZE = 28;
const CORNER_THICKNESS = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  darkBg: { backgroundColor: '#111' },
  errorBg: { backgroundColor: '#B71C1C' },
  centeredContent: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  scanHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 16, color: '#fff' },
  scanTitle: { ...typography.h3, color: '#fff' },
  cameraContainer: { flex: 1, position: 'relative', backgroundColor: '#000' },
  loadingOverlay: {
    flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', gap: spacing.md,
  },
  loadingText: { ...typography.body, color: '#fff' },
  viewfinderOuter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: {
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
  hintBar: {
    paddingVertical: spacing.lg, paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center',
  },
  hintText: { ...typography.body, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  // Result states
  resultContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl,
  },
  successIcon: {
    width: 96, height: 96, borderRadius: borderRadius.full,
    backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  errorIcon: { backgroundColor: '#FFEBEE' },
  resultEmoji: { fontSize: 48 },
  resultTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm, textAlign: 'center' },
  resultSubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  lightText: { color: 'rgba(255,255,255,0.9)' },
  resultCard: {
    width: '100%', backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.xl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  primaryBtn: {
    backgroundColor: colors.secondary, borderRadius: borderRadius.full,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl, marginBottom: spacing.sm,
  },
  primaryBtnText: { ...typography.button, color: colors.textLight },
  secondaryBtn: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.full,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl,
  },
  secondaryBtnText: { ...typography.body, color: colors.textPrimary },
  // Permission screen
  permissionEmoji: { fontSize: 64, marginBottom: spacing.lg },
  permissionTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm, textAlign: 'center' },
  permissionBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22 },
  permissionBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.full,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl, marginBottom: spacing.md,
  },
  permissionBtnText: { ...typography.button, color: colors.textLight },
  backLink: { paddingVertical: spacing.sm },
  backLinkText: { ...typography.body, color: colors.textSecondary },
});
