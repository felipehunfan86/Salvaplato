import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Platform, ScrollView, KeyboardAvoidingView,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import ZoneAutocomplete from '../../components/ZoneAutocomplete';


type Props = { onBack: () => void; onSave: (location: string) => void };

export default function LocationScreen({ onBack, onSave }: Props) {
  const [selected, setSelected] = useState('Caracas, Las Mercedes');
  const [radius, setRadius] = useState(5);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(selected);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi ubicación</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchSection}>
          <ZoneAutocomplete
            label="Cambiar zona"
            value={selected}
            onChange={setSelected}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => {}}
        >
          {/* Current location */}
          <View style={styles.currentCard}>
            <Text style={styles.currentEmoji}>📍</Text>
            <View style={styles.currentInfo}>
              <Text style={styles.currentLabel}>Ubicación actual</Text>
              <Text style={styles.currentValue}>{selected}</Text>
            </View>
            <TouchableOpacity style={styles.gpsBtn}>
              <Text style={styles.gpsBtnText}>Usar GPS</Text>
            </TouchableOpacity>
          </View>

          {/* Radius */}
          <Text style={styles.sectionTitle}>Radio de búsqueda</Text>
          <View style={styles.radiusCard}>
            <Text style={styles.radiusValue}>{radius} km</Text>
            <Text style={styles.radiusDescription}>
              Verás ofertas dentro de {radius} km de tu ubicación
            </Text>
            <View style={styles.radiusOptions}>
              {[1, 3, 5, 10, 15].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.radiusChip, radius === r && styles.radiusChipActive]}
                  onPress={() => setRadius(r)}
                >
                  <Text style={[styles.radiusChipText, radius === r && styles.radiusChipTextActive]}>
                    {r} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {saved && (
            <View style={styles.savedBanner}>
              <Text style={styles.savedText}>✓ Ubicación guardada</Text>
            </View>
          )}

          <View style={{ height: spacing.xl }} />
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Guardar ubicación</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
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
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    zIndex: 10,
  },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: { flex: 1, paddingVertical: spacing.md - 2, ...typography.body, color: colors.textPrimary },
  clearBtn: { fontSize: 14, color: colors.textSecondary, paddingLeft: spacing.sm },
  dropdown: {
    backgroundColor: colors.surface,
    borderWidth: 1, borderTopWidth: 0,
    borderColor: colors.border,
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 10,
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md, paddingHorizontal: spacing.md, gap: spacing.sm,
  },
  dropdownBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  dropdownEmoji: { fontSize: 16 },
  dropdownName: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  dropdownCity: { ...typography.caption, color: colors.textSecondary },
  noResults: { padding: spacing.lg, alignItems: 'center' },
  noResultsText: { ...typography.caption, color: colors.textSecondary },
  scroll: { padding: spacing.lg },
  currentCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg,
    gap: spacing.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  currentEmoji: { fontSize: 28 },
  currentInfo: { flex: 1 },
  currentLabel: { ...typography.caption, color: colors.textSecondary },
  currentValue: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  gpsBtn: {
    borderWidth: 1.5, borderColor: colors.primary, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  gpsBtnText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  radiusCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  radiusValue: { fontSize: 32, fontWeight: '700', color: colors.primary, textAlign: 'center' },
  radiusDescription: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
  radiusOptions: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  radiusChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background,
  },
  radiusChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  radiusChipText: { ...typography.caption, fontWeight: '600', color: colors.textPrimary },
  radiusChipTextActive: { color: colors.textLight },
  savedBanner: {
    backgroundColor: '#E8F5E9', borderRadius: borderRadius.md,
    padding: spacing.md, alignItems: 'center',
  },
  savedText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  bottomBar: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
  },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.full,
    paddingVertical: spacing.md, alignItems: 'center', elevation: 4,
  },
  saveBtnText: { ...typography.button, color: colors.textLight },
});
