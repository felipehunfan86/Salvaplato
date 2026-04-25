import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Platform, ScrollView,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

type Props = {
  onBack: () => void;
  onScanQR: () => void;
};

type OrderStatus = 'pending' | 'confirmed' | 'expired' | 'refunded';

type Order = {
  id: string;
  customer: string;
  product: string;
  units: number;
  amount: number;
  deadline: string;
  createdAt: string;
  status: OrderStatus;
};

const MOCK_ORDERS: Order[] = [
  { id: 'ORD-001', customer: 'María García', product: 'Pizza Margarita (2 und)', units: 1, amount: 4.5, deadline: '8:00 PM', createdAt: '3:15 PM', status: 'pending' },
  { id: 'ORD-002', customer: 'Carlos Rodríguez', product: 'Combo Pasta + Refresco', units: 1, amount: 6.0, deadline: '7:30 PM', createdAt: '2:40 PM', status: 'pending' },
  { id: 'ORD-003', customer: 'Ana Pérez', product: 'Brownie de Chocolate', units: 2, amount: 4.0, deadline: '9:00 PM', createdAt: '1:20 PM', status: 'confirmed' },
  { id: 'ORD-004', customer: 'Luis Torres', product: 'Pollo Asado con Yuca', units: 1, amount: 7.0, deadline: '6:00 PM', createdAt: '11:00 AM', status: 'confirmed' },
  { id: 'ORD-005', customer: 'Sofía Mendez', product: 'Sandwich Mixto', units: 1, amount: 2.5, deadline: '5:30 PM', createdAt: '10:30 AM', status: 'expired' },
];

const FILTERS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendientes', value: 'pending' },
  { label: 'Confirmados', value: 'confirmed' },
  { label: 'Expirados', value: 'expired' },
];

export default function RestaurantOrdersScreen({ onBack, onScanQR }: Props) {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const filtered = filter === 'all' ? MOCK_ORDERS : MOCK_ORDERS.filter(o => o.status === filter);

  const pendingCount = MOCK_ORDERS.filter(o => o.status === 'pending').length;
  const totalToday = MOCK_ORDERS.filter(o => o.status !== 'refunded').reduce((s, o) => s + o.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pedidos</Text>
        <TouchableOpacity style={styles.scanBtn} onPress={onScanQR}>
          <Text style={styles.scanBtnText}>📷 Escanear</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{pendingCount}</Text>
          <Text style={styles.summaryLabel}>Pendientes</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{MOCK_ORDERS.filter(o => o.status === 'confirmed').length}</Text>
          <Text style={styles.summaryLabel}>Confirmados</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>${totalToday.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Total hoy</Text>
        </View>
      </View>

      {/* Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {FILTERS.map((f) => {
          const count = f.value === 'all' ? MOCK_ORDERS.length : MOCK_ORDERS.filter(o => o.status === f.value).length;
          return (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterTab, filter === f.value && styles.filterTabActive]}
              onPress={() => setFilter(f.value)}
            >
              <Text style={[styles.filterTabText, filter === f.value && styles.filterTabTextActive]}>
                {f.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>No hay pedidos en esta categoría</Text>
          </View>
        ) : (
          filtered.map((order) => (
            <OrderCard key={order.id} order={order} onScanQR={onScanQR} />
          ))
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function OrderCard({ order, onScanQR }: { order: Order; onScanQR: () => void }) {
  const statusConfig: Record<OrderStatus, { label: string; bg: string; text: string }> = {
    pending: { label: 'Pendiente', bg: '#FFF3E0', text: '#E65100' },
    confirmed: { label: 'Confirmado', bg: '#E8F5E9', text: colors.primary },
    expired: { label: 'Expirado', bg: '#F5F5F5', text: colors.textSecondary },
    refunded: { label: 'Reembolsado', bg: '#FCE4EC', text: '#C62828' },
  };
  const sc = statusConfig[order.status];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderId}>{order.id}</Text>
          <Text style={styles.orderTime}>Realizado: {order.createdAt}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.customerRow}>
          <Text style={styles.customerEmoji}>👤</Text>
          <Text style={styles.customerName}>{order.customer}</Text>
        </View>
        <Text style={styles.productName}>{order.product}</Text>
        {order.units > 1 && <Text style={styles.units}>{order.units} unidades</Text>}
        <View style={styles.metaRow}>
          <Text style={styles.deadline}>⏰ Retiro hasta {order.deadline}</Text>
          <Text style={styles.amount}>${order.amount.toFixed(2)}</Text>
        </View>
      </View>

      {order.status === 'pending' && (
        <TouchableOpacity style={styles.scanAction} onPress={onScanQR}>
          <Text style={styles.scanActionEmoji}>📷</Text>
          <Text style={styles.scanActionText}>Escanear QR cuando llegue el cliente</Text>
        </TouchableOpacity>
      )}
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
  scanBtn: {
    backgroundColor: colors.secondary, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  scanBtnText: { ...typography.caption, fontWeight: '700', color: colors.textLight },
  summary: {
    flexDirection: 'row', backgroundColor: colors.surface,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  summaryLabel: { ...typography.caption, color: colors.textSecondary },
  summaryDivider: { width: 1, backgroundColor: colors.border },
  filterScroll: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  filterContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  filterTab: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border,
  },
  filterTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterTabText: { ...typography.caption, fontWeight: '600', color: '#212121' },
  filterTabTextActive: { color: colors.textLight },
  scroll: { padding: spacing.lg },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { ...typography.body, color: colors.textSecondary },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg, marginBottom: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  orderId: { ...typography.caption, fontWeight: '700', color: colors.textPrimary },
  orderTime: { ...typography.caption, color: colors.textSecondary },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.full },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardBody: { padding: spacing.md },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  customerEmoji: { fontSize: 14 },
  customerName: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  productName: { ...typography.body, color: colors.textPrimary, marginBottom: spacing.xs },
  units: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  deadline: { ...typography.caption, color: colors.textSecondary },
  amount: { fontSize: 18, fontWeight: '700', color: colors.primary },
  scanAction: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: '#FFF3E0', paddingVertical: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  scanActionEmoji: { fontSize: 16 },
  scanActionText: { ...typography.caption, fontWeight: '600', color: '#E65100' },
});
