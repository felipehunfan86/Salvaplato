import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Platform, ScrollView,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

export type Order = {
  orderId: string;
  offer: {
    id: string;
    restaurantName: string;
    productName: string;
    offerPrice: number;
    pickupDeadline: string;
    emoji: string;
  };
  status: 'pendiente' | 'retirado' | 'expirado';
  createdAt: string;
  rating?: number;
};

type Props = {
  orders: Order[];
  onBack: () => void;
  onSelectOrder: (order: Order) => void;
};

export default function ActiveOrdersScreen({ orders, onBack, onSelectOrder }: Props) {
  const active = orders.filter(o => o.status === 'pendiente');
  const history = orders.filter(o => o.status !== 'pendiente');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis compras</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Active orders */}
        <Text style={styles.sectionTitle}>
          Pendientes de retiro
          {active.length > 0 && (
            <Text style={styles.sectionCount}> ({active.length})</Text>
          )}
        </Text>

        {active.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyText}>No tienes compras pendientes</Text>
          </View>
        ) : (
          active.map(order => (
            <ActiveOrderCard key={order.orderId} order={order} onPress={() => onSelectOrder(order)} />
          ))
        )}

        {/* History */}
        {history.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Historial</Text>
            {history.map(order => (
              <HistoryCard key={order.orderId} order={order} />
            ))}
          </>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ActiveOrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const [time, period] = order.offer.pickupDeadline.split(' ');
      const [h, m] = time.split(':').map(Number);
      let dh = h;
      if (period === 'PM' && h !== 12) dh += 12;
      if (period === 'AM' && h === 12) dh = 0;
      const deadline = new Date();
      deadline.setHours(dh, m, 0, 0);
      const diff = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 1000));
      const hours = Math.floor(diff / 3600);
      const mins = Math.floor((diff % 3600) / 60);
      const secs = diff % 60;
      setTimeLeft(hours > 0 ? `${hours}h ${mins}m` : `${mins}m ${secs}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [order.offer.pickupDeadline]);

  return (
    <TouchableOpacity style={styles.activeCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.activeCardLeft}>
        <Text style={styles.cardEmoji}>{order.offer.emoji}</Text>
      </View>
      <View style={styles.activeCardInfo}>
        <Text style={styles.cardProduct}>{order.offer.productName}</Text>
        <Text style={styles.cardRestaurant}>{order.offer.restaurantName}</Text>
        <Text style={styles.cardOrderId}>#{order.orderId}</Text>
      </View>
      <View style={styles.activeCardRight}>
        <Text style={styles.cardPrice}>${order.offer.offerPrice.toFixed(2)}</Text>
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>⏰ {timeLeft}</Text>
        </View>
        <Text style={styles.tapHint}>Ver QR ›</Text>
      </View>
    </TouchableOpacity>
  );
}

function HistoryCard({ order }: { order: Order }) {
  const isRetirado = order.status === 'retirado';
  return (
    <View style={styles.historyCard}>
      <Text style={styles.cardEmoji}>{order.offer.emoji}</Text>
      <View style={styles.activeCardInfo}>
        <Text style={styles.cardProduct}>{order.offer.productName}</Text>
        <Text style={styles.cardRestaurant}>{order.offer.restaurantName}</Text>
        <Text style={styles.cardOrderId}>#{order.orderId} · {order.createdAt}</Text>
      </View>
      <View style={styles.historyRight}>
        <Text style={styles.cardPrice}>${order.offer.offerPrice.toFixed(2)}</Text>
        <View style={[styles.statusBadge, isRetirado ? styles.badgeRetirado : styles.badgeExpirado]}>
          <Text style={[styles.statusText, isRetirado ? styles.textRetirado : styles.textExpirado]}>
            {isRetirado ? '✓ Retirado' : '✗ Expirado'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface,
  },
  backBtn: { width: 40, height: 40, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 28, color: colors.textPrimary, lineHeight: 32 },
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  scroll: { padding: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  sectionCount: { color: colors.secondary, fontWeight: '700' },
  emptyCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md,
  },
  emptyEmoji: { fontSize: 36, marginBottom: spacing.sm },
  emptyText: { ...typography.body, color: colors.textSecondary },
  activeCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm,
    borderLeftWidth: 4, borderLeftColor: colors.secondary,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
    gap: spacing.sm,
  },
  activeCardLeft: {},
  activeCardInfo: { flex: 1 },
  activeCardRight: { alignItems: 'flex-end', gap: 4 },
  cardEmoji: { fontSize: 36 },
  cardProduct: { ...typography.body, fontWeight: '700', color: colors.textPrimary },
  cardRestaurant: { ...typography.caption, color: colors.textSecondary },
  cardOrderId: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  cardPrice: { fontSize: 18, fontWeight: '700', color: colors.primary },
  timerBadge: { backgroundColor: '#FFF3E0', borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  timerText: { fontSize: 11, fontWeight: '600', color: '#E65100' },
  tapHint: { ...typography.caption, color: colors.secondary, fontWeight: '700' },
  historyCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm,
    gap: spacing.sm, opacity: 0.85,
  },
  historyRight: { alignItems: 'flex-end', gap: 4 },
  statusBadge: { borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  badgeRetirado: { backgroundColor: '#E8F5E9' },
  badgeExpirado: { backgroundColor: '#FFEBEE' },
  statusText: { fontSize: 11, fontWeight: '600' },
  textRetirado: { color: colors.primary },
  textExpirado: { color: colors.error },
});
