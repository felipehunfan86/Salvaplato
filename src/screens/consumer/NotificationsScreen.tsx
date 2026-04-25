import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, ScrollView, Platform, Switch,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

type Props = { onBack: () => void };

export default function NotificationsScreen({ onBack }: Props) {
  const [settings, setSettings] = useState({
    newOffers: true,
    nearbyOffers: true,
    orderConfirmed: true,
    pickupReminder: true,
    marketing: false,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ofertas</Text>
          <View style={styles.card}>
            <ToggleRow
              emoji="🆕"
              label="Nuevas ofertas disponibles"
              description="Te avisamos cuando aparezcan ofertas cerca de ti"
              value={settings.newOffers}
              onToggle={() => toggle('newOffers')}
            />
            <Divider />
            <ToggleRow
              emoji="📍"
              label="Ofertas muy cercanas"
              description="Alertas para locales a menos de 1 km"
              value={settings.nearbyOffers}
              onToggle={() => toggle('nearbyOffers')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis pedidos</Text>
          <View style={styles.card}>
            <ToggleRow
              emoji="✅"
              label="Reserva confirmada"
              description="Notificación al completar un pago exitoso"
              value={settings.orderConfirmed}
              onToggle={() => toggle('orderConfirmed')}
            />
            <Divider />
            <ToggleRow
              emoji="⏰"
              label="Recordatorio de retiro"
              description="Te avisamos 30 minutos antes del cierre"
              value={settings.pickupReminder}
              onToggle={() => toggle('pickupReminder')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comunicaciones</Text>
          <View style={styles.card}>
            <ToggleRow
              emoji="📣"
              label="Promociones y novedades"
              description="Noticias de SalvaPlato y ofertas especiales"
              value={settings.marketing}
              onToggle={() => toggle('marketing')}
            />
          </View>
        </View>

        <Text style={styles.note}>
          Las notificaciones críticas de tus pedidos siempre estarán activas independientemente de esta configuración.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleRow({ emoji, label, description, value, onToggle }: {
  emoji: string; label: string; description: string; value: boolean; onToggle: () => void;
}) {
  return (
    <View style={toggleStyles.row}>
      <Text style={toggleStyles.emoji}>{emoji}</Text>
      <View style={toggleStyles.text}>
        <Text style={toggleStyles.label}>{label}</Text>
        <Text style={toggleStyles.description}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.surface}
      />
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.border }} />;
}

const toggleStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  emoji: { fontSize: 22, width: 32 },
  text: { flex: 1 },
  label: { ...typography.body, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 },
  description: { ...typography.caption, color: colors.textSecondary, lineHeight: 16 },
});

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
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  note: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', lineHeight: 18 },
});
