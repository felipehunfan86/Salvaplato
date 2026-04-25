import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Platform, ScrollView,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

type Props = {
  onBack: () => void;
  onPublishOffer: () => void;
  onEditOffer: (offerId: string) => void;
};

type OfferStatus = 'active' | 'paused' | 'sold_out' | 'expired';

type Offer = {
  id: string;
  name: string;
  category: string;
  originalPrice: number;
  offerPrice: number;
  unitsTotal: number;
  unitsSold: number;
  deadline: string;
  status: OfferStatus;
};

const MOCK_OFFERS: Offer[] = [
  { id: '1', name: 'Pizza Margarita (2 und)', category: '🍕 Pizzas', originalPrice: 9.0, offerPrice: 4.5, unitsTotal: 5, unitsSold: 2, deadline: '8:00 PM', status: 'active' },
  { id: '2', name: 'Combo Pasta + Refresco', category: '🍝 Pastas', originalPrice: 10.0, offerPrice: 6.0, unitsTotal: 3, unitsSold: 2, deadline: '7:30 PM', status: 'active' },
  { id: '3', name: 'Brownie de Chocolate', category: '🧁 Postres', originalPrice: 4.0, offerPrice: 2.0, unitsTotal: 8, unitsSold: 1, deadline: '9:00 PM', status: 'paused' },
  { id: '4', name: 'Pollo Asado con Yuca', category: '🍗 Pollos', originalPrice: 12.0, offerPrice: 7.0, unitsTotal: 4, unitsSold: 4, deadline: '6:00 PM', status: 'sold_out' },
  { id: '5', name: 'Sandwich Mixto', category: '🥪 Sándwiches', originalPrice: 5.0, offerPrice: 2.5, unitsTotal: 6, unitsSold: 3, deadline: '5:30 PM', status: 'expired' },
];

const FILTERS: { label: string; value: OfferStatus | 'all' }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Activas', value: 'active' },
  { label: 'Pausadas', value: 'paused' },
  { label: 'Agotadas', value: 'sold_out' },
  { label: 'Expiradas', value: 'expired' },
];

export default function RestaurantManageOffersScreen({ onBack, onPublishOffer, onEditOffer }: Props) {
  const [filter, setFilter] = useState<OfferStatus | 'all'>('all');
  const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS);

  const filtered = filter === 'all' ? offers : offers.filter(o => o.status === filter);

  const togglePause = (id: string) => {
    setOffers(prev => prev.map(o =>
      o.id === id ? { ...o, status: o.status === 'active' ? 'paused' : 'active' } : o
    ));
  };

  const deleteOffer = (id: string) => {
    setOffers(prev => prev.filter(o => o.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis ofertas</Text>
        <TouchableOpacity style={styles.addBtn} onPress={onPublishOffer}>
          <Text style={styles.addBtnText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {FILTERS.map((f) => {
          const count = f.value === 'all' ? offers.length : offers.filter(o => o.status === f.value).length;
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
            <Text style={styles.emptyText}>No hay ofertas en esta categoría</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={onPublishOffer}>
              <Text style={styles.emptyBtnText}>Publicar primera oferta</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onEdit={() => onEditOffer(offer.id)}
              onTogglePause={() => togglePause(offer.id)}
              onDelete={() => deleteOffer(offer.id)}
            />
          ))
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function OfferCard({ offer, onEdit, onTogglePause, onDelete }: {
  offer: Offer;
  onEdit: () => void;
  onTogglePause: () => void;
  onDelete: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const discount = Math.round((1 - offer.offerPrice / offer.originalPrice) * 100);
  const unitsLeft = offer.unitsTotal - offer.unitsSold;
  const progress = offer.unitsSold / offer.unitsTotal;

  const statusConfig: Record<OfferStatus, { label: string; bg: string; text: string }> = {
    active: { label: 'Activa', bg: '#E8F5E9', text: colors.primary },
    paused: { label: 'Pausada', bg: '#FFF8E1', text: '#F57F17' },
    sold_out: { label: 'Agotada', bg: '#FCE4EC', text: '#C62828' },
    expired: { label: 'Expirada', bg: '#F5F5F5', text: colors.textSecondary },
  };
  const sc = statusConfig[offer.status];

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardMain} onPress={() => setShowActions(!showActions)} activeOpacity={0.8}>
        <View style={styles.cardTop}>
          <View style={styles.cardInfo}>
            <Text style={styles.offerCategory}>{offer.category}</Text>
            <Text style={styles.offerName}>{offer.name}</Text>
            <Text style={styles.offerMeta}>hasta {offer.deadline}</Text>
          </View>
          <View style={styles.cardPrices}>
            <Text style={styles.originalPrice}>${offer.originalPrice.toFixed(2)}</Text>
            <Text style={styles.offerPrice}>${offer.offerPrice.toFixed(2)}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
          </View>
          <Text style={styles.progressText}>{offer.unitsSold}/{offer.unitsTotal} vendidas · {unitsLeft} restantes</Text>
        </View>

        <View style={styles.cardBottom}>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
          </View>
          <Text style={styles.expandHint}>{showActions ? '▲ Cerrar' : '▼ Acciones'}</Text>
        </View>
      </TouchableOpacity>

      {showActions && offer.status !== 'sold_out' && offer.status !== 'expired' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
            <Text style={styles.actionBtnEmoji}>✏️</Text>
            <Text style={styles.actionBtnText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnWarning]} onPress={onTogglePause}>
            <Text style={styles.actionBtnEmoji}>{offer.status === 'active' ? '⏸️' : '▶️'}</Text>
            <Text style={[styles.actionBtnText, styles.actionBtnTextWarning]}>
              {offer.status === 'active' ? 'Pausar' : 'Reactivar'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={onDelete}>
            <Text style={styles.actionBtnEmoji}>🗑️</Text>
            <Text style={[styles.actionBtnText, styles.actionBtnTextDanger]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
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
  addBtn: {
    backgroundColor: colors.secondary, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  addBtnText: { ...typography.caption, fontWeight: '700', color: colors.textLight },
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
  emptyText: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  emptyBtn: { backgroundColor: colors.secondary, borderRadius: borderRadius.full, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  emptyBtnText: { ...typography.button, color: colors.textLight },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg, marginBottom: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    overflow: 'hidden',
  },
  cardMain: { padding: spacing.md },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  cardInfo: { flex: 1, marginRight: spacing.sm },
  offerCategory: { ...typography.caption, color: colors.textSecondary, marginBottom: 2 },
  offerName: { ...typography.body, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  offerMeta: { ...typography.caption, color: colors.textSecondary },
  cardPrices: { alignItems: 'flex-end' },
  originalPrice: { ...typography.caption, color: colors.textSecondary, textDecorationLine: 'line-through' },
  offerPrice: { fontSize: 20, fontWeight: '700', color: colors.primary },
  discountBadge: { backgroundColor: '#FCE4EC', borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  discountText: { fontSize: 11, fontWeight: '700', color: '#C62828' },
  progressSection: { marginBottom: spacing.sm },
  progressBar: { height: 6, backgroundColor: colors.border, borderRadius: borderRadius.full, marginBottom: spacing.xs },
  progressFill: { height: 6, backgroundColor: colors.primary, borderRadius: borderRadius.full },
  progressText: { ...typography.caption, color: colors.textSecondary },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.full },
  statusText: { fontSize: 11, fontWeight: '600' },
  expandHint: { ...typography.caption, color: colors.textSecondary },
  actions: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs, paddingVertical: spacing.md,
    borderRightWidth: 1, borderRightColor: colors.border,
  },
  actionBtnWarning: { backgroundColor: '#FFFDE7' },
  actionBtnDanger: { backgroundColor: '#FFEBEE', borderRightWidth: 0 },
  actionBtnEmoji: { fontSize: 14 },
  actionBtnText: { ...typography.caption, fontWeight: '600', color: colors.textPrimary },
  actionBtnTextWarning: { color: '#F57F17' },
  actionBtnTextDanger: { color: colors.error },
});
