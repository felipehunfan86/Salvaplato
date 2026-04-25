import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, Platform, ScrollView, KeyboardAvoidingView,
  ActivityIndicator, Alert,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { apiRequest } from '../../services/api';

type Props = {
  onBack: () => void;
  onPublish: () => void;
};

const CATEGORIES = ['🍕 Pizzas', '🍔 Burgers', '🥗 Ensaladas', '🍝 Pastas', '🍗 Pollos', '🥘 Guisos', '🧁 Postres', '☕ Bebidas', '🥪 Sándwiches', 'Otro'];
const DEADLINES = ['6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM'];

function deadlineToISO(time: string): string {
  const [timePart, period] = time.split(' ');
  const [h, m] = timePart.split(':').map(Number);
  let hours = h;
  if (period === 'PM' && h !== 12) hours += 12;
  if (period === 'AM' && h === 12) hours = 0;
  const d = new Date();
  d.setHours(hours, m, 0, 0);
  return d.toISOString();
}

export default function RestaurantPublishOfferScreen({ onBack, onPublish }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [units, setUnits] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const discount = originalPrice && offerPrice
    ? Math.round((1 - parseFloat(offerPrice) / parseFloat(originalPrice)) * 100)
    : null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Nombre obligatorio.';
    if (!originalPrice || isNaN(parseFloat(originalPrice))) e.originalPrice = 'Precio original inválido.';
    if (!offerPrice || isNaN(parseFloat(offerPrice))) e.offerPrice = 'Precio oferta inválido.';
    if (parseFloat(offerPrice) >= parseFloat(originalPrice)) e.offerPrice = 'El precio oferta debe ser menor al original.';
    if (!units || isNaN(parseInt(units)) || parseInt(units) < 1) e.units = 'Cantidad debe ser mayor a 0.';
    if (!deadline) e.deadline = 'Selecciona una hora límite.';
    if (!category) e.category = 'Selecciona una categoría.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePublish = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const emojiMatch = category.match(/^\S+/);
      const emoji = emojiMatch ? emojiMatch[0] : '🍽️';
      const categoryName = category.replace(/^\S+\s*/, '') || category;

      await apiRequest('/offers', {
        method: 'POST',
        body: JSON.stringify({
          title: name.trim(),
          description: description.trim() || undefined,
          originalPrice: parseFloat(originalPrice),
          offerPrice: parseFloat(offerPrice),
          quantityTotal: parseInt(units),
          emoji,
          category: categoryName,
          pickupDeadline: deadlineToISO(deadline),
        }),
      });
      onPublish();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo publicar la oferta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nueva oferta</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Photo placeholder */}
          <TouchableOpacity style={styles.photoPlaceholder}>
            <Text style={styles.photoIcon}>📷</Text>
            <Text style={styles.photoText}>Agregar foto del producto</Text>
            <Text style={styles.photoHint}>Recomendado: foto real del plato</Text>
          </TouchableOpacity>

          {/* Product info */}
          <Text style={styles.sectionTitle}>Producto</Text>
          <Field label="Nombre del producto *" value={name} onChangeText={setName} placeholder="Ej: Pizza Margarita (2 porciones)" error={errors.name} />
          <Field label="Descripción (opcional)" value={description} onChangeText={setDescription} placeholder="Ingredientes, detalles, condiciones..." multiline />

          {/* Category */}
          <Text style={styles.sectionTitle}>Categoría *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, category === cat && styles.chipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}

          {/* Pricing */}
          <Text style={styles.sectionTitle}>Precio</Text>
          <View style={styles.priceRow}>
            <View style={styles.priceField}>
              <Text style={styles.fieldLabel}>Precio original (USD) *</Text>
              <View style={[styles.priceInput, errors.originalPrice ? styles.inputError : null]}>
                <Text style={styles.currency}>$</Text>
                <TextInput
                  style={styles.priceText}
                  value={originalPrice}
                  onChangeText={setOriginalPrice}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
              {errors.originalPrice ? <Text style={styles.errorText}>{errors.originalPrice}</Text> : null}
            </View>
            <View style={styles.priceField}>
              <Text style={styles.fieldLabel}>Precio oferta (USD) *</Text>
              <View style={[styles.priceInput, errors.offerPrice ? styles.inputError : null]}>
                <Text style={styles.currency}>$</Text>
                <TextInput
                  style={[styles.priceText, { color: colors.primary }]}
                  value={offerPrice}
                  onChangeText={setOfferPrice}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
              {errors.offerPrice ? <Text style={styles.errorText}>{errors.offerPrice}</Text> : null}
            </View>
          </View>

          {discount !== null && !isNaN(discount) && discount > 0 && (
            <View style={styles.discountBanner}>
              <Text style={styles.discountText}>🏷️ Descuento del {discount}% — ¡Atractivo para los clientes!</Text>
            </View>
          )}

          {/* Units */}
          <Text style={styles.sectionTitle}>Disponibilidad</Text>
          <View style={styles.unitsRow}>
            <View style={styles.unitsField}>
              <Text style={styles.fieldLabel}>Unidades disponibles *</Text>
              <View style={[styles.priceInput, errors.units ? styles.inputError : null]}>
                <TextInput
                  style={[styles.priceText, { textAlign: 'center' }]}
                  value={units}
                  onChangeText={setUnits}
                  placeholder="5"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                />
              </View>
              {errors.units ? <Text style={styles.errorText}>{errors.units}</Text> : null}
            </View>
            <View style={styles.unitsHint}>
              <Text style={styles.unitsHintText}>
                La oferta se cerrará automáticamente cuando se agoten las unidades.
              </Text>
            </View>
          </View>

          {/* Deadline */}
          <Text style={styles.sectionTitle}>Hora límite de retiro *</Text>
          <View style={styles.deadlineGrid}>
            {DEADLINES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.deadlineChip, deadline === t && styles.deadlineChipActive]}
                onPress={() => setDeadline(t)}
              >
                <Text style={[styles.deadlineChipText, deadline === t && styles.deadlineChipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.deadline ? <Text style={styles.errorText}>{errors.deadline}</Text> : null}

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Los clientes que no retiren antes de esta hora perderán su pago. El pago se liberará automáticamente a tu favor.
            </Text>
          </View>

          <View style={{ height: spacing.xl }} />
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={[styles.publishBtn, loading && styles.publishBtnDisabled]} onPress={handlePublish} disabled={loading}>
            {loading
              ? <ActivityIndicator color={colors.textLight} />
              : <Text style={styles.publishBtnText}>Publicar oferta</Text>
            }
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, placeholder, multiline, error }: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder: string; multiline?: boolean; error?: string;
}) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null, multiline ? styles.inputMultiline : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        autoCorrect={false}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  photoPlaceholder: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg,
  },
  photoIcon: { fontSize: 36, marginBottom: spacing.sm },
  photoText: { ...typography.body, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  photoHint: { ...typography.caption, color: colors.textSecondary },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.sm },
  fieldLabel: { ...typography.caption, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2, ...typography.body, color: colors.textPrimary,
  },
  inputMultiline: { height: 80, textAlignVertical: 'top' },
  inputError: { borderColor: colors.error },
  errorText: { ...typography.caption, color: colors.error, marginTop: spacing.xs },
  chipScroll: { marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginRight: spacing.sm,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  chipText: { ...typography.caption, fontWeight: '600', color: '#212121' },
  chipTextActive: { color: colors.textLight },
  priceRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  priceField: { flex: 1 },
  priceInput: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  currency: { ...typography.body, fontWeight: '600', color: colors.textSecondary, marginRight: spacing.xs },
  priceText: { flex: 1, paddingVertical: spacing.md - 2, ...typography.body, fontWeight: '700', color: colors.textPrimary },
  discountBanner: {
    backgroundColor: '#E8F5E9', borderRadius: borderRadius.md,
    padding: spacing.md, marginBottom: spacing.md,
  },
  discountText: { ...typography.caption, fontWeight: '600', color: colors.primary },
  unitsRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', marginBottom: spacing.sm },
  unitsField: { width: 130 },
  unitsHint: { flex: 1, justifyContent: 'flex-end', paddingBottom: spacing.sm },
  unitsHintText: { ...typography.caption, color: colors.textSecondary, lineHeight: 18 },
  deadlineGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  deadlineChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  deadlineChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  deadlineChipText: { ...typography.caption, fontWeight: '600', color: '#212121' },
  deadlineChipTextActive: { color: colors.textLight },
  warningBox: {
    backgroundColor: '#FFF8E1', borderRadius: borderRadius.md,
    padding: spacing.md, marginTop: spacing.sm,
  },
  warningText: { ...typography.caption, color: '#795548', lineHeight: 18 },
  bottomBar: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
  },
  publishBtn: {
    backgroundColor: colors.secondary, borderRadius: borderRadius.full,
    paddingVertical: spacing.md, alignItems: 'center', elevation: 4,
  },
  publishBtnDisabled: { opacity: 0.6 },
  publishBtnText: { ...typography.button, color: colors.textLight },
});
