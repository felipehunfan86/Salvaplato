import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, ScrollView, Platform,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

type Offer = {
  id: string;
  restaurantName: string;
  restaurantCategory: string;
  productName: string;
  description: string;
  originalPrice: number;
  offerPrice: number;
  unitsLeft: number;
  pickupDeadline: string;
  distance: string;
  emoji: string;
};

type Props = {
  offer: Offer;
  onBack: () => void;
  onConfirm: () => void;
};

export default function PurchaseConfirmScreen({ offer, onBack, onConfirm }: Props) {
  const savings = (offer.originalPrice - offer.offerPrice).toFixed(2);
  const commission = (offer.offerPrice * 0.05).toFixed(2);
  const total = offer.offerPrice.toFixed(2);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar reserva</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* Product summary */}
        <View style={styles.productCard}>
          <Text style={styles.productEmoji}>{offer.emoji}</Text>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{offer.productName}</Text>
            <Text style={styles.restaurantName}>{offer.restaurantName}</Text>
            <Text style={styles.pickupInfo}>⏰ Retiro hasta las {offer.pickupDeadline}</Text>
          </View>
        </View>

        {/* Pickup details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles del retiro</Text>
          <View style={styles.detailCard}>
            <Row label="Local" value={offer.restaurantName} />
            <Divider />
            <Row label="Categoría" value={offer.restaurantCategory} />
            <Divider />
            <Row label="Distancia" value={offer.distance} />
            <Divider />
            <Row label="Hora límite" value={offer.pickupDeadline} highlight />
          </View>
        </View>

        {/* Price breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de pago</Text>
          <View style={styles.detailCard}>
            <Row label="Precio original" value={`$${offer.originalPrice.toFixed(2)}`} strike />
            <Divider />
            <Row label="Precio oferta" value={`$${offer.offerPrice.toFixed(2)}`} />
            <Divider />
            <Row label="Tu ahorro" value={`-$${savings}`} green />
            <Divider />
            <Row label="Total a pagar" value={`$${total}`} bold />
          </View>
        </View>

        {/* No refund notice */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ Esta reserva no es reembolsable. Si no retiras antes de las {offer.pickupDeadline} de hoy, perderás el pago.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalBlock}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${total} USD</Text>
        </View>
        <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
          <Text style={styles.confirmBtnText}>Ir a pagar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value, strike, green, bold, highlight }: {
  label: string; value: string; strike?: boolean; green?: boolean; bold?: boolean; highlight?: boolean;
}) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={[
        rowStyles.value,
        strike && rowStyles.strike,
        green && rowStyles.green,
        bold && rowStyles.bold,
        highlight && rowStyles.highlight,
      ]}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.border }} />;
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  label: { ...typography.body, color: colors.textSecondary },
  value: { ...typography.body, color: colors.textPrimary },
  strike: { textDecorationLine: 'line-through', color: colors.textSecondary },
  green: { color: colors.primary, fontWeight: '600' },
  bold: { fontWeight: '700', fontSize: 16 },
  highlight: { color: colors.secondary, fontWeight: '600' },
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
  backBtn: {
    width: 40, height: 40, borderRadius: borderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { fontSize: 28, color: colors.textPrimary, lineHeight: 32 },
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  body: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  productCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  productEmoji: { fontSize: 52 },
  productInfo: { flex: 1 },
  productName: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xs },
  restaurantName: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  pickupInfo: { ...typography.caption, color: colors.secondary, fontWeight: '600' },
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  warningBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  warningText: { ...typography.caption, color: '#E65100', lineHeight: 18 },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  totalBlock: { flex: 1 },
  totalLabel: { ...typography.caption, color: colors.textSecondary },
  totalAmount: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  confirmBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    elevation: 4,
  },
  confirmBtnText: { ...typography.button, color: colors.textLight },
});
