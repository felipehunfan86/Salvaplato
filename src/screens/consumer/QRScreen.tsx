import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Platform, Modal,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { colors, spacing, borderRadius, typography } from '../../theme';

type Offer = {
  id: string;
  restaurantName: string;
  productName: string;
  offerPrice: number;
  pickupDeadline: string;
  emoji: string;
};

type Props = {
  offer: Offer;
  orderId: string;
  qrToken?: string; // UUID del backend — si no llega, usa el orderId
  onGoHome: () => void;
  onScanSuccess?: (orderId: string) => void;
  onRateOrder?: (orderId: string, rating: number) => void;
};

export default function QRScreen({ offer, orderId, qrToken, onGoHome, onScanSuccess, onRateOrder }: Props) {
  const qrValue = qrToken ?? orderId;
  const [timeLeft, setTimeLeft] = useState('');
  const [scanned, setScanned] = useState(false);
  const [rating, setRating] = useState(0);

  const handleSimulateScan = () => {
    setScanned(true);
    onScanSuccess?.(orderId);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const [time, period] = offer.pickupDeadline.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let deadlineHours = hours;
      if (period === 'PM' && hours !== 12) deadlineHours += 12;
      if (period === 'AM' && hours === 12) deadlineHours = 0;
      const deadline = new Date();
      deadline.setHours(deadlineHours, minutes, 0, 0);
      const diff = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setTimeLeft(`${h > 0 ? `${h}h ` : ''}${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [offer.pickupDeadline]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tu reserva está lista 🎉</Text>
        <Text style={styles.headerSubtitle}>Muestra este código en el local</Text>
      </View>

      {/* QR placeholder */}
      <View style={styles.qrContainer}>
        <View style={styles.qrBox}>
          <QRCode value={qrValue} size={160} color={colors.textPrimary} backgroundColor="white" />
          <Text style={styles.qrOrderId}>#{orderId}</Text>
        </View>

        {/* Timer */}
        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>Tiempo restante para retirar</Text>
          <Text style={styles.timerValue}>{timeLeft}</Text>
          <Text style={styles.timerDeadline}>hasta las {offer.pickupDeadline}</Text>
        </View>
      </View>

      {/* Order summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryEmoji}>{offer.emoji}</Text>
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryProduct}>{offer.productName}</Text>
          <Text style={styles.summaryRestaurant}>{offer.restaurantName}</Text>
        </View>
        <Text style={styles.summaryPrice}>${offer.offerPrice.toFixed(2)}</Text>
      </View>

      {/* Steps */}
      <View style={styles.steps}>
        <StepRow number="1" text={`Dirígete a ${offer.restaurantName}`} done />
        <StepRow number="2" text="Muestra este QR al llegar" />
        <StepRow number="3" text="El local lo escanea y listo 🎉" />
      </View>

      {/* Simulate scan button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.simulateBtn} onPress={handleSimulateScan}>
          <Text style={styles.simulateBtnText}>📷  Simular escaneo exitoso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeBtn} onPress={onGoHome}>
          <Text style={styles.homeBtnText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>

      {/* Success modal */}
      <Modal visible={scanned} animationType="fade" transparent>
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <Text style={styles.successIconText}>✅</Text>
            </View>
            <Text style={styles.successTitle}>¡Retiro confirmado!</Text>
            <Text style={styles.successSubtitle}>
              El local escaneó tu QR. El pago ha sido liberado.
            </Text>
            <View style={styles.successDetail}>
              <Text style={styles.successDetailEmoji}>{offer.emoji}</Text>
              <View>
                <Text style={styles.successDetailProduct}>{offer.productName}</Text>
                <Text style={styles.successDetailRestaurant}>{offer.restaurantName}</Text>
              </View>
            </View>

            {/* Rating */}
            <Text style={styles.ratingTitle}>¿Cómo fue tu experiencia?</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => { setRating(star); onRateOrder?.(orderId, star); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.star, star <= rating && styles.starActive]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <Text style={styles.ratingThanks}>
                {rating >= 4 ? '¡Gracias por tu valoración! 🎉' : 'Gracias por tu opinión'}
              </Text>
            )}

            <TouchableOpacity style={styles.successBtn} onPress={onGoHome}>
              <Text style={styles.successBtnText}>Volver al inicio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StepRow({ number, text, done }: { number: string; text: string; done?: boolean }) {
  return (
    <View style={stepStyles.row}>
      <View style={[stepStyles.circle, done && stepStyles.circleDone]}>
        <Text style={stepStyles.circleText}>{done ? '✓' : number}</Text>
      </View>
      <Text style={stepStyles.text}>{text}</Text>
    </View>
  );
}

const stepStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  circle: {
    width: 28, height: 28, borderRadius: borderRadius.full,
    backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  circleDone: { backgroundColor: colors.primary },
  circleText: { fontSize: 13, fontWeight: '700', color: colors.textLight },
  text: { ...typography.body, color: colors.textPrimary, flex: 1 },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: { alignItems: 'center', paddingVertical: spacing.lg },
  headerTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
  headerSubtitle: { ...typography.body, color: colors.textSecondary },
  qrContainer: { alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  qrBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: spacing.md,
    width: 200,
  },
  qrOrderId: { ...typography.caption, color: colors.textSecondary, fontWeight: '600', letterSpacing: 1 },
  timerBox: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  timerLabel: { ...typography.caption, color: 'rgba(255,255,255,0.8)', marginBottom: spacing.xs },
  timerValue: { fontSize: 28, fontWeight: '700', color: colors.textLight },
  timerDeadline: { ...typography.caption, color: 'rgba(255,255,255,0.8)', marginTop: spacing.xs },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryEmoji: { fontSize: 36 },
  summaryInfo: { flex: 1 },
  summaryProduct: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  summaryRestaurant: { ...typography.caption, color: colors.textSecondary },
  summaryPrice: { fontSize: 18, fontWeight: '700', color: colors.primary },
  steps: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 'auto',
  },
  simulateBtn: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    elevation: 2,
  },
  simulateBtnText: { ...typography.button, color: colors.textLight },
  homeBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  homeBtnText: { ...typography.button, color: colors.primary },
  successOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl,
  },
  successCard: {
    backgroundColor: colors.surface, borderRadius: 24,
    padding: spacing.xl, alignItems: 'center', width: '100%',
  },
  successIconCircle: {
    width: 80, height: 80, borderRadius: borderRadius.full,
    backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  successIconText: { fontSize: 40 },
  successTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm, textAlign: 'center' },
  successSubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 22 },
  successDetail: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.background, borderRadius: borderRadius.lg,
    padding: spacing.md, width: '100%', marginBottom: spacing.lg,
  },
  successDetailEmoji: { fontSize: 36 },
  successDetailProduct: { ...typography.body, fontWeight: '700', color: colors.textPrimary },
  successDetailRestaurant: { ...typography.caption, color: colors.textSecondary },
  successBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.full,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl, width: '100%', alignItems: 'center',
  },
  successBtnText: { ...typography.button, color: colors.textLight },
  ratingTitle: { ...typography.body, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm, textAlign: 'center' },
  starsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  star: { fontSize: 36, color: colors.border },
  starActive: { color: colors.accent },
  ratingThanks: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md },
});
