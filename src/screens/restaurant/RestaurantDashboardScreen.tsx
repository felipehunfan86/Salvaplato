import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Platform, ScrollView,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

type Props = {
  businessName: string;
  onPublishOffer: () => void;
  onManageOffers: () => void;
  onOrders: () => void;
  onScanQR: () => void;
  onProfile: () => void;
};

const MOCK_OFFERS = [
  { id: '1', name: 'Pizza Margarita (2 und)', price: 4.5, units: 3, deadline: '8:00 PM', status: 'active' },
  { id: '2', name: 'Combo Pasta + Refresco', price: 6.0, units: 1, deadline: '7:30 PM', status: 'active' },
  { id: '3', name: 'Brownie de Chocolate', price: 2.0, units: 5, deadline: '9:00 PM', status: 'paused' },
];

const MOCK_ORDERS = [
  { id: 'ORD-001', customer: 'María G.', product: 'Pizza Margarita (2 und)', amount: 4.5, status: 'pending' },
  { id: 'ORD-002', customer: 'Carlos R.', product: 'Combo Pasta + Refresco', amount: 6.0, status: 'confirmed' },
  { id: 'ORD-003', customer: 'Ana P.', product: 'Brownie de Chocolate', amount: 2.0, status: 'confirmed' },
];

export default function RestaurantDashboardScreen({ businessName, onPublishOffer, onManageOffers, onOrders, onScanQR, onProfile }: Props) {
  const pendingCount = MOCK_ORDERS.filter(o => o.status === 'pending').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{businessName.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.headerGreeting}>Bienvenido</Text>
            <Text style={styles.headerName}>{businessName}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={onProfile}>
          <Text style={styles.profileBtnText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard emoji="💰" label="Ingresos hoy" value="$12.50" />
          <StatCard emoji="🛍️" label="Ventas hoy" value="3" />
          <StatCard emoji="🌱" label="Kg rescatados" value="2.4" />
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.actionsGrid}>
          <ActionCard emoji="➕" label="Nueva oferta" color={colors.secondary} onPress={onPublishOffer} />
          <ActionCard emoji="📋" label="Mis ofertas" color={colors.primary} onPress={onManageOffers} />
          <ActionCard
            emoji="🔔"
            label="Pedidos"
            color="#5C6BC0"
            onPress={onOrders}
            badge={pendingCount > 0 ? pendingCount : undefined}
          />
          <ActionCard emoji="📷" label="Escanear QR" color="#FF7043" onPress={onScanQR} />
        </View>

        {/* Active offers */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ofertas activas</Text>
          <TouchableOpacity onPress={onManageOffers}>
            <Text style={styles.seeAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {MOCK_OFFERS.map((offer) => (
          <View key={offer.id} style={styles.offerCard}>
            <View style={styles.offerInfo}>
              <Text style={styles.offerName}>{offer.name}</Text>
              <Text style={styles.offerMeta}>{offer.units} und · hasta {offer.deadline}</Text>
            </View>
            <View style={styles.offerRight}>
              <Text style={styles.offerPrice}>${offer.price.toFixed(2)}</Text>
              <View style={[styles.statusBadge, offer.status === 'paused' ? styles.badgePaused : styles.badgeActive]}>
                <Text style={[styles.statusText, offer.status === 'paused' ? styles.statusTextPaused : styles.statusTextActive]}>
                  {offer.status === 'active' ? 'Activa' : 'Pausada'}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Recent orders */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pedidos recientes</Text>
          <TouchableOpacity onPress={onOrders}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {MOCK_ORDERS.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderLeft}>
              <Text style={styles.orderCustomer}>{order.customer}</Text>
              <Text style={styles.orderProduct}>{order.product}</Text>
            </View>
            <View style={styles.orderRight}>
              <Text style={styles.orderAmount}>${order.amount.toFixed(2)}</Text>
              <View style={[styles.statusBadge, order.status === 'pending' ? styles.badgePending : styles.badgeConfirmed]}>
                <Text style={[styles.statusText, order.status === 'pending' ? styles.statusTextPending : styles.statusTextConfirmed]}>
                  {order.status === 'pending' ? 'Pendiente' : 'Confirmado'}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionCard({ emoji, label, color, onPress, badge }: {
  emoji: string; label: string; color: string; onPress: () => void; badge?: number;
}) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color + '18' }]}>
        <Text style={styles.actionEmoji}>{emoji}</Text>
        {badge !== undefined && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.secondary,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 44, height: 44, borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: colors.textLight },
  headerGreeting: { ...typography.caption, color: 'rgba(255,255,255,0.8)' },
  headerName: { ...typography.h3, color: colors.textLight },
  profileBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  profileBtnText: { fontSize: 22 },
  scroll: { padding: spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.md, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statEmoji: { fontSize: 22, marginBottom: spacing.xs },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  statLabel: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  seeAll: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  actionCard: { width: '47%', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center', elevation: 2 },
  actionIcon: { width: 52, height: 52, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  actionEmoji: { fontSize: 24 },
  actionLabel: { ...typography.caption, fontWeight: '600', color: colors.textPrimary, textAlign: 'center' },
  badge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: colors.error, borderRadius: borderRadius.full,
    width: 18, height: 18, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: colors.textLight },
  offerCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  offerInfo: { flex: 1 },
  offerName: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  offerMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  offerRight: { alignItems: 'flex-end', gap: spacing.xs },
  offerPrice: { ...typography.body, fontWeight: '700', color: colors.primary },
  orderCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, elevation: 1,
  },
  orderLeft: { flex: 1 },
  orderCustomer: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  orderProduct: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  orderRight: { alignItems: 'flex-end', gap: spacing.xs },
  orderAmount: { ...typography.body, fontWeight: '700', color: colors.textPrimary },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
  statusText: { fontSize: 11, fontWeight: '600' },
  badgeActive: { backgroundColor: '#E8F5E9' },
  statusTextActive: { color: colors.primary },
  badgePaused: { backgroundColor: '#FFF8E1' },
  statusTextPaused: { color: '#F57F17' },
  badgePending: { backgroundColor: '#FFF3E0' },
  statusTextPending: { color: '#E65100' },
  badgeConfirmed: { backgroundColor: '#E8F5E9' },
  statusTextConfirmed: { color: colors.primary },
});
