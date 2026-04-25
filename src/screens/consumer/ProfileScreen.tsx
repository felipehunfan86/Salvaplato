import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, ScrollView, Platform,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

import { Order } from './ActiveOrdersScreen';

type Props = {
  onLogout: () => void;
  onBack: () => void;
  onEditProfile: () => void;
  onNotifications: () => void;
  onLocation: () => void;
  onChangePassword: () => void;
  orders: Order[];
  onOrderPress: (order: Order) => void;
  onRateOrder?: (orderId: string, rating: number) => void;
  favorites: { restaurantName: string; restaurantCategory: string }[];
  onFavoritePress: (restaurantName: string) => void;
  favoriteNotifications: string[];
};

export default function ProfileScreen({ onLogout, onBack, onEditProfile, onNotifications, onLocation, onChangePassword, orders, onOrderPress, onRateOrder, favorites, onFavoritePress, favoriteNotifications }: Props) {
  const totalSaved = orders
    .filter(p => p.status === 'retirado')
    .reduce((acc, p) => acc + p.offer.offerPrice, 0);

  const totalOrders = orders.filter(p => p.status === 'retirado').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi perfil</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Avatar & name */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.userName}>Felipe Hunfan</Text>
          <Text style={styles.userEmail}>fhunfan@gmail.com</Text>
          <Text style={styles.userLocation}>📍 Caracas, Las Mercedes</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatBox value={totalOrders.toString()} label="Rescatados" emoji="🍽️" />
          <StatBox value={`$${totalSaved.toFixed(2)}`} label="Invertido" emoji="💰" />
          <StatBox value={`${totalOrders * 350}g`} label="CO₂ evitado" emoji="🌱" />
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mi cuenta</Text>
          <View style={styles.menuCard}>
            <MenuItem emoji="✏️" label="Editar perfil" onPress={onEditProfile} />
            <Divider />
            <MenuItem emoji="🔔" label="Notificaciones" onPress={onNotifications} />
            <Divider />
            <MenuItem emoji="📍" label="Mi ubicación" onPress={onLocation} />
            <Divider />
            <MenuItem emoji="🔒" label="Cambiar contraseña" onPress={onChangePassword} />
          </View>
        </View>

        {/* Favorites */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurantes favoritos</Text>
          {favorites.length === 0 ? (
            <View style={styles.emptyFav}>
              <Text style={styles.emptyFavText}>⭐ Guarda tus favoritos tocando la estrella al ver una oferta</Text>
            </View>
          ) : (
            favorites.map((fav) => {
              const hasNotif = favoriteNotifications.includes(fav.restaurantName);
              return (
                <TouchableOpacity
                  key={fav.restaurantName}
                  style={styles.favCard}
                  onPress={() => onFavoritePress(fav.restaurantName)}
                  activeOpacity={0.8}
                >
                  <View style={styles.favIcon}>
                    <Text style={{ fontSize: 22 }}>🏪</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.favName}>{fav.restaurantName}</Text>
                    <Text style={styles.favCategory}>{fav.restaurantCategory}</Text>
                    {hasNotif && (
                      <Text style={styles.favNotif}>🔔 Nueva oferta disponible</Text>
                    )}
                  </View>
                  <Text style={styles.favArrow}>Ver ofertas ›</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Purchase history */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de compras</Text>
          {orders.length === 0 ? (
            <View style={styles.purchaseCard}>
              <Text style={styles.purchaseEmoji}>🛍️</Text>
              <View style={styles.purchaseInfo}>
                <Text style={styles.purchaseProduct}>Aún no tienes compras</Text>
                <Text style={styles.purchaseRestaurant}>Explora las ofertas y haz tu primera compra</Text>
              </View>
            </View>
          ) : (
            [...orders].reverse().map((order) => {
              const isPending = order.status === 'pendiente';
              const isRetirado = order.status === 'retirado';
              const CardWrapper = isPending ? TouchableOpacity : View;
              return (
                <CardWrapper
                  key={order.orderId}
                  style={[styles.purchaseCard, isPending && styles.purchaseCardPending]}
                  {...(isPending ? { onPress: () => onOrderPress(order), activeOpacity: 0.8 } : {})}
                >
                  <Text style={styles.purchaseEmoji}>{order.offer.emoji}</Text>
                  <View style={styles.purchaseInfo}>
                    <Text style={styles.purchaseProduct}>{order.offer.productName}</Text>
                    <Text style={styles.purchaseRestaurant}>{order.offer.restaurantName}</Text>
                    <Text style={styles.purchaseDate}>{order.createdAt} · #{order.orderId}</Text>
                    {isPending && <Text style={styles.tapHint}>Toca para ver tu QR ›</Text>}
                    {isRetirado && (
                      <View style={styles.ratingRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <TouchableOpacity
                            key={star}
                            onPress={() => onRateOrder?.(order.orderId, star)}
                            activeOpacity={0.7}
                            disabled={!!order.rating}
                          >
                            <Text style={[styles.ratingStar, star <= (order.rating ?? 0) && styles.ratingStarActive]}>★</Text>
                          </TouchableOpacity>
                        ))}
                        {!order.rating && <Text style={styles.ratingPrompt}>Calificar</Text>}
                      </View>
                    )}
                  </View>
                  <View style={styles.purchaseRight}>
                    <Text style={styles.purchaseAmount}>${order.offer.offerPrice.toFixed(2)}</Text>
                    <View style={[styles.statusBadge, styles[`status_${order.status}`]]}>
                      <Text style={[styles.statusText, styles[`statusText_${order.status}`]]}>
                        {order.status === 'retirado' ? '✓ Retirado' :
                         order.status === 'pendiente' ? '⏳ Pendiente' : '✗ Expirado'}
                      </Text>
                    </View>
                  </View>
                </CardWrapper>
              );
            })
          )}
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ayuda</Text>
          <View style={styles.menuCard}>
            <MenuItem emoji="❓" label="Preguntas frecuentes" onPress={() => {}} />
            <Divider />
            <MenuItem emoji="💬" label="Contactar soporte" onPress={() => {}} />
            <Divider />
            <MenuItem emoji="⭐" label="Calificar la app" onPress={() => {}} />
          </View>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ value, label, emoji }: { value: string; label: string; emoji: string }) {
  return (
    <View style={statStyles.box}>
      <Text style={statStyles.emoji}>{emoji}</Text>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

function MenuItem({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={menuStyles.item} onPress={onPress}>
      <Text style={menuStyles.emoji}>{emoji}</Text>
      <Text style={menuStyles.label}>{label}</Text>
      <Text style={menuStyles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 44 }} />;
}

const statStyles = StyleSheet.create({
  box: {
    flex: 1, alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: borderRadius.lg, padding: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  emoji: { fontSize: 24, marginBottom: spacing.xs },
  value: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  label: { ...typography.caption, color: colors.textSecondary },
});

const menuStyles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  emoji: { fontSize: 20, marginRight: spacing.sm, width: 28 },
  label: { ...typography.body, color: colors.textPrimary, flex: 1 },
  arrow: { fontSize: 20, color: colors.textSecondary },
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
  logoutText: { ...typography.body, color: colors.error, fontWeight: '600' },
  profileSection: { alignItems: 'center', paddingVertical: spacing.xl },
  avatar: {
    width: 88, height: 88, borderRadius: borderRadius.full,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarEmoji: { fontSize: 44 },
  userName: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
  userEmail: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xs },
  userLocation: { ...typography.caption, color: colors.textSecondary },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  purchaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  purchaseEmoji: { fontSize: 32 },
  purchaseInfo: { flex: 1 },
  purchaseProduct: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  purchaseRestaurant: { ...typography.caption, color: colors.textSecondary },
  purchaseDate: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  purchaseRight: { alignItems: 'flex-end', gap: spacing.xs },
  purchaseAmount: { ...typography.body, fontWeight: '700', color: colors.textPrimary },
  statusBadge: { borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  emptyFav: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  emptyFavText: { ...typography.caption, color: colors.textSecondary, lineHeight: 18 },
  favCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm,
    gap: spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  favIcon: {
    width: 44, height: 44, borderRadius: borderRadius.md,
    backgroundColor: '#FFF8E1', alignItems: 'center', justifyContent: 'center',
  },
  favName: { ...typography.body, fontWeight: '700', color: colors.textPrimary },
  favCategory: { ...typography.caption, color: colors.textSecondary },
  favArrow: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  favNotif: { ...typography.caption, color: colors.secondary, fontWeight: '600', marginTop: 2 },
  purchaseCardPending: {
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  tapHint: { ...typography.caption, color: colors.secondary, fontWeight: '600', marginTop: 2 },
  status_retirado: { backgroundColor: '#E8F5E9' },
  status_expirado: { backgroundColor: '#FFEBEE' },
  status_pendiente: { backgroundColor: '#FFF3E0' },
  statusText: { fontSize: 11, fontWeight: '600' },
  statusText_retirado: { color: colors.primary },
  statusText_expirado: { color: colors.error },
  statusText_pendiente: { color: colors.secondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: 2 },
  ratingStar: { fontSize: 18, color: colors.border },
  ratingStarActive: { color: colors.accent },
  ratingPrompt: { ...typography.caption, color: colors.textSecondary, marginLeft: spacing.xs },
});
