import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
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
  onBuy: (offer: Offer) => void;
  onLoginRequired: () => void;
  isLoggedIn?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

function getMinutesUntilDeadline(deadline: string): number {
  const now = new Date();
  const [time, period] = deadline.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let deadlineHours = hours;
  if (period === 'PM' && hours !== 12) deadlineHours += 12;
  if (period === 'AM' && hours === 12) deadlineHours = 0;
  const deadlineDate = new Date();
  deadlineDate.setHours(deadlineHours, minutes, 0, 0);
  return Math.floor((deadlineDate.getTime() - now.getTime()) / 60000);
}

export default function OfferDetailScreen({ offer, onBack, onBuy, onLoginRequired, isLoggedIn = false, isFavorite = false, onToggleFavorite }: Props) {
  const discount = Math.round(
    ((offer.originalPrice - offer.offerPrice) / offer.originalPrice) * 100
  );
  const savings = (offer.originalPrice - offer.offerPrice).toFixed(2);
  const minutesLeft = getMinutesUntilDeadline(offer.pickupDeadline);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Image / Hero */}
      <View style={styles.hero}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.heroEmoji}>{offer.emoji}</Text>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{discount}%</Text>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* Restaurant info */}
        <View style={styles.restaurantRow}>
          <View style={styles.restaurantIcon}>
            <Text style={{ fontSize: 20 }}>🏪</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.restaurantName}>{offer.restaurantName}</Text>
            <Text style={styles.restaurantCategory}>{offer.restaurantCategory} · {offer.distance}</Text>
          </View>
          <TouchableOpacity style={styles.favBtn} onPress={onToggleFavorite}>
            <Text style={styles.favBtnText}>{isFavorite ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        </View>

        {/* Product info */}
        <Text style={styles.productName}>{offer.productName}</Text>
        <Text style={styles.description}>{offer.description}</Text>

        {/* Details */}
        <View style={styles.detailsCard}>
          <DetailRow emoji="⏰" label="Retiro hasta" value={offer.pickupDeadline} />
          <View style={styles.divider} />
          <DetailRow
            emoji="📦"
            label="Unidades disponibles"
            value={`${offer.unitsLeft} ${offer.unitsLeft === 1 ? 'unidad' : 'unidades'}`}
            valueColor={offer.unitsLeft <= 2 ? colors.secondary : undefined}
          />
          <View style={styles.divider} />
          <DetailRow emoji="📍" label="Distancia" value={offer.distance} />
        </View>

        {/* How it works */}
        <View style={styles.howItWorks}>
          <Text style={styles.howTitle}>¿Cómo funciona?</Text>
          <StepRow number="1" text="Reserva y paga aquí en la app" />
          <StepRow number="2" text="Recibe tu código QR de confirmación" />
          <StepRow number="3" text={`Retira antes de las ${offer.pickupDeadline} en el local`} />
          <StepRow number="4" text="El local escanea tu QR y listo" />
        </View>

        {/* Warning */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ Esta reserva no es reembolsable. Si no retiras el pedido antes de las {offer.pickupDeadline} de hoy, perderás el pago.
          </Text>
        </View>

        {minutesLeft > 0 && minutesLeft <= 60 && (
          <View style={styles.urgentBox}>
            <Text style={styles.urgentText}>
              🔥 ¡Quedan solo {minutesLeft} minutos para el cierre! Asegúrate de poder llegar al local a tiempo antes de reservar.
            </Text>
          </View>
        )}

        {minutesLeft > 60 && minutesLeft <= 120 && (
          <View style={styles.cautionBox}>
            <Text style={styles.cautionText}>
              ⏳ El local cierra en {Math.floor(minutesLeft / 60)}h {minutesLeft % 60}min. Planifica tu retiro con tiempo.
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom purchase bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceBlock}>
          <Text style={styles.offerPrice}>${offer.offerPrice.toFixed(2)}</Text>
          <Text style={styles.originalPrice}>${offer.originalPrice.toFixed(2)}</Text>
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>Ahorras ${savings}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.buyBtn}
          onPress={() => isLoggedIn ? onBuy(offer) : onLoginRequired()}
        >
          <Text style={styles.buyBtnText}>
            {isLoggedIn ? 'Reservar ahora' : 'Inicia sesión para reservar'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ emoji, label, value, valueColor }: {
  emoji: string;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailEmoji}>{emoji}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
  );
}

function StepRow({ number, text }: { number: string; text: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  hero: {
    height: 220,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backBtnText: {
    fontSize: 28,
    color: colors.textPrimary,
    lineHeight: 32,
  },
  heroEmoji: {
    fontSize: 100,
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  discountText: {
    ...typography.button,
    color: colors.textLight,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  restaurantIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favBtn: {
    width: 40, height: 40, borderRadius: borderRadius.full,
    backgroundColor: '#FFF8E1', alignItems: 'center', justifyContent: 'center',
  },
  favBtnText: { fontSize: 22 },
  restaurantName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  restaurantCategory: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  productName: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  detailEmoji: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  detailLabel: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  howItWorks: {
    marginBottom: spacing.lg,
  },
  howTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textLight,
  },
  stepText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  warningBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  warningText: {
    ...typography.caption,
    color: '#E65100',
    lineHeight: 18,
  },
  urgentBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#EF9A9A',
  },
  urgentText: {
    ...typography.caption,
    color: '#C62828',
    lineHeight: 18,
    fontWeight: '600',
  },
  cautionBox: {
    backgroundColor: '#FFFDE7',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#FFF176',
  },
  cautionText: {
    ...typography.caption,
    color: '#F57F17',
    lineHeight: 18,
  },
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
  priceBlock: {
    flex: 1,
  },
  offerPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  originalPrice: {
    ...typography.caption,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  savingsBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  savingsText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  buyBtn: {
    flex: 2,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buyBtnText: {
    ...typography.button,
    color: colors.textLight,
  },
});
