import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

type Props = {
  onExplore: () => void;
  onLogin: () => void;
  onRegister: () => void;
  onRestaurantRegister: () => void;
};

export default function WelcomeScreen({ onExplore, onLogin, onRegister, onRestaurantRegister }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.hero}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🍽️</Text>
        </View>
        <Text style={styles.appName}>SalvaPlato</Text>
        <Text style={styles.tagline}>
          Comida rica, precio justo,{'\n'}menos desperdicio.
        </Text>
      </View>

      <View style={styles.benefits}>
        <BenefitRow emoji="🏪" text="Restaurantes recuperan lo que perderían" />
        <BenefitRow emoji="💰" text="Tú comes bien gastando menos" />
        <BenefitRow emoji="🌱" text="Juntos cuidamos el planeta" />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnExplore} onPress={onExplore}>
          <Text style={styles.btnExploreText}>Ver ofertas cerca de mí</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <TouchableOpacity style={styles.btnSecondary} onPress={onLogin}>
            <Text style={styles.btnSecondaryText}>Iniciar sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary} onPress={onRegister}>
            <Text style={styles.btnPrimaryText}>Registrarse</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onRestaurantRegister}>
          <Text style={styles.restaurantLink}>
            ¿Tienes un local?{' '}
            <Text style={styles.restaurantLinkBold}>Únete aquí</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function BenefitRow({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.benefitRow}>
      <Text style={styles.benefitEmoji}>{emoji}</Text>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    paddingVertical: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoEmoji: {
    fontSize: 48,
  },
  appName: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.h3,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  benefits: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  benefitEmoji: {
    fontSize: 22,
  },
  benefitText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  actions: {
    gap: spacing.md,
  },
  btnExplore: {
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
  btnExploreText: {
    ...typography.button,
    color: colors.textLight,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btnSecondary: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  btnSecondaryText: {
    ...typography.button,
    color: colors.primary,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  btnPrimaryText: {
    ...typography.button,
    color: colors.textLight,
  },
  restaurantLink: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  restaurantLinkBold: {
    color: colors.primary,
    fontWeight: '700',
  },
});
