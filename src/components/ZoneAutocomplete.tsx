import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

const LOCATIONS = [
  'Altamira', 'La Castellana', 'Las Mercedes', 'Chacao', 'El Rosal',
  'Chuao', 'La Florida', 'Los Palos Grandes', 'Bello Monte', 'El Cafetal',
  'La Tahona', 'Los Naranjos', 'Caurimare', 'El Marqués', 'Sebucán',
  'Los Chorros', 'La Urbina', 'Petare', 'Prados del Este', 'Santa Fe',
  'Cocolí', 'Los Dos Caminos', 'La Trinidad', 'Los Ruices', 'Boleíta',
  'El Paraíso', 'La Candelaria', 'Sabana Grande', 'El Recreo', 'Chacaíto',
  'Los Caobos', 'La Paz', 'Catia', 'El Silencio', 'Propatria',
  'Antímano', 'El Valle', 'Coche', 'La Vega', 'Macaracuay',
  'Manzanares', 'Los Cortijos', 'La Carlota', 'Guaicay', 'Terrazas del Club Hípico',
];

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export default function ZoneAutocomplete({ label, value, onChange, error }: Props) {
  const [inputText, setInputText] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = inputText.length > 0
    ? LOCATIONS.filter(l => l.toLowerCase().includes(inputText.toLowerCase()))
    : LOCATIONS;

  const handleSelect = (loc: string) => {
    const full = `Caracas, ${loc}`;
    setInputText(full);
    onChange(full);
    setShowDropdown(false);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error ? styles.inputError : null]}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={(t) => { setInputText(t); onChange(t); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Caracas, Las Mercedes"
          placeholderTextColor={colors.textSecondary}
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
        />
        {inputText.length > 0 && (
          <TouchableOpacity onPress={() => { setInputText(''); onChange(''); setShowDropdown(false); }}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {showDropdown && (
        <View style={styles.dropdown}>
          <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 200 }} nestedScrollEnabled>
            {filtered.length > 0 ? filtered.map((loc, index) => (
              <TouchableOpacity
                key={loc}
                style={[styles.item, index > 0 && styles.itemBorder]}
                onPress={() => handleSelect(loc)}
              >
                <Text style={styles.itemEmoji}>📍</Text>
                <View>
                  <Text style={styles.itemName}>{loc}</Text>
                  <Text style={styles.itemCity}>Caracas</Text>
                </View>
              </TouchableOpacity>
            )) : (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>Sin resultados</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md, zIndex: 10 },
  label: { ...typography.caption, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  inputError: { borderColor: colors.error },
  input: { flex: 1, paddingVertical: spacing.md - 2, ...typography.body, color: colors.textPrimary },
  clearBtn: { fontSize: 14, color: colors.textSecondary, paddingLeft: spacing.sm },
  dropdown: {
    backgroundColor: colors.surface, borderWidth: 1, borderTopWidth: 0,
    borderColor: colors.border, borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 10,
  },
  item: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  itemBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  itemEmoji: { fontSize: 16 },
  itemName: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  itemCity: { ...typography.caption, color: colors.textSecondary },
  noResults: { padding: spacing.lg, alignItems: 'center' },
  noResultsText: { ...typography.caption, color: colors.textSecondary },
  errorText: { ...typography.caption, color: colors.error, marginTop: spacing.xs },
});
