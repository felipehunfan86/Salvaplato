import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
} from 'react-native';

const ZONES = [
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
import { colors, spacing, borderRadius, typography } from '../../theme';

type Offer = {
  id: string;
  restaurantName: string;
  restaurantCategory: string;
  productName: string;
  description: string;
  originalPrice: number;
  offerPrice: number;
  unitsLeft: number;
  pickupDeadline: string;
  distance: string;
  emoji: string;
};

const MOCK_OFFERS: Offer[] = [
  // ── Panadería El Trigal (popular) ──────────────────────────────────────────
  { id: '1',  restaurantName: 'Panadería El Trigal',    restaurantCategory: 'Panadería',     productName: 'Pack de 6 croissants',       description: 'Croissants de mantequilla horneados esta mañana',            originalPrice: 4.0,  offerPrice: 1.5, unitsLeft: 3, pickupDeadline: '8:00 PM', distance: '0.4 km', emoji: '🥐' },
  { id: '2',  restaurantName: 'Panadería El Trigal',    restaurantCategory: 'Panadería',     productName: 'Pan de jamón familiar',      description: 'Pan de jamón artesanal con aceitunas y pasas',               originalPrice: 7.0,  offerPrice: 3.0, unitsLeft: 2, pickupDeadline: '7:30 PM', distance: '0.4 km', emoji: '🍞' },
  { id: '3',  restaurantName: 'Panadería El Trigal',    restaurantCategory: 'Panadería',     productName: 'Caja de 12 ponquesitos',     description: 'Ponquesitos de vainilla y chocolate del día',                originalPrice: 5.0,  offerPrice: 2.0, unitsLeft: 4, pickupDeadline: '6:00 PM', distance: '0.4 km', emoji: '🧁' },
  { id: '4',  restaurantName: 'Pan de Casa',            restaurantCategory: 'Panadería',     productName: 'Baguette artesanal x3',      description: 'Baguettes recién horneadas, corteza crujiente',              originalPrice: 3.5,  offerPrice: 1.2, unitsLeft: 5, pickupDeadline: '7:00 PM', distance: '0.9 km', emoji: '🥖' },
  { id: '5',  restaurantName: 'Dulces y Más',           restaurantCategory: 'Panadería',     productName: 'Torta de zanahoria entera',  description: 'Torta de zanahoria con frosting de queso crema',             originalPrice: 9.0,  offerPrice: 4.0, unitsLeft: 1, pickupDeadline: '8:30 PM', distance: '1.3 km', emoji: '🎂' },

  // ── Restaurante La Cazuela (popular) ───────────────────────────────────────
  { id: '6',  restaurantName: 'Restaurante La Cazuela', restaurantCategory: 'Venezolana',    productName: 'Bandeja del día',            description: 'Pabellón criollo completo con jugo natural',                 originalPrice: 8.0,  offerPrice: 3.5, unitsLeft: 2, pickupDeadline: '3:00 PM', distance: '0.8 km', emoji: '🍛' },
  { id: '7',  restaurantName: 'Restaurante La Cazuela', restaurantCategory: 'Venezolana',    productName: 'Asado negro + arroz',        description: 'Asado negro venezolano con arroz blanco y tajadas',          originalPrice: 10.0, offerPrice: 4.5, unitsLeft: 3, pickupDeadline: '4:00 PM', distance: '0.8 km', emoji: '🥩' },
  { id: '8',  restaurantName: 'Restaurante La Cazuela', restaurantCategory: 'Venezolana',    productName: 'Sancocho de gallina',        description: 'Sancocho casero con verduras y yuca fresca',                 originalPrice: 7.0,  offerPrice: 3.0, unitsLeft: 4, pickupDeadline: '2:30 PM', distance: '0.8 km', emoji: '🍲' },
  { id: '9',  restaurantName: 'La Cocina de Abuela',    restaurantCategory: 'Venezolana',    productName: 'Hallacas x6',                description: 'Hallacas tradicionales, envueltas en hojas de plátano',      originalPrice: 12.0, offerPrice: 5.0, unitsLeft: 2, pickupDeadline: '5:00 PM', distance: '1.4 km', emoji: '🫔' },
  { id: '10', restaurantName: 'Arepa Bar Chacao',       restaurantCategory: 'Venezolana',    productName: 'Pack 4 arepas rellenas',     description: 'Pelúa, dominó, reina pepiada y sifrina',                     originalPrice: 6.0,  offerPrice: 2.5, unitsLeft: 6, pickupDeadline: '9:00 PM', distance: '0.6 km', emoji: '🫓' },

  // ── Pizza Roma (popular) ───────────────────────────────────────────────────
  { id: '11', restaurantName: 'Pizza Roma',             restaurantCategory: 'Italiana',      productName: '2 pizzas medianas',          description: 'Margarita y pepperoni, recién horneadas',                    originalPrice: 12.0, offerPrice: 5.0, unitsLeft: 1, pickupDeadline: '9:00 PM', distance: '1.2 km', emoji: '🍕' },
  { id: '12', restaurantName: 'Pizza Roma',             restaurantCategory: 'Italiana',      productName: 'Pasta boloñesa x2',          description: 'Pasta al dente con salsa boloñesa casera',                   originalPrice: 9.0,  offerPrice: 3.5, unitsLeft: 3, pickupDeadline: '9:30 PM', distance: '1.2 km', emoji: '🍝' },
  { id: '13', restaurantName: 'Pizza Roma',             restaurantCategory: 'Italiana',      productName: 'Lasaña familiar',            description: 'Lasaña de carne y queso, porción para 3 personas',           originalPrice: 14.0, offerPrice: 6.0, unitsLeft: 2, pickupDeadline: '8:45 PM', distance: '1.2 km', emoji: '🫕' },
  { id: '14', restaurantName: 'Trattoria Venezia',      restaurantCategory: 'Italiana',      productName: 'Risotto de champiñones',     description: 'Risotto cremoso con champiñones silvestres y parmesano',     originalPrice: 11.0, offerPrice: 4.5, unitsLeft: 2, pickupDeadline: '8:00 PM', distance: '1.8 km', emoji: '🍚' },
  { id: '15', restaurantName: 'Il Forno',               restaurantCategory: 'Italiana',      productName: 'Focaccia x4 porciones',      description: 'Focaccia con aceitunas, romero y tomates cherry',            originalPrice: 5.0,  offerPrice: 2.0, unitsLeft: 4, pickupDeadline: '7:30 PM', distance: '2.2 km', emoji: '🫓' },

  // ── Café Central (popular) ─────────────────────────────────────────────────
  { id: '16', restaurantName: 'Café Central',           restaurantCategory: 'Cafetería',     productName: 'Box de postres',             description: 'Variedad de tortas y galletas del día',                      originalPrice: 6.0,  offerPrice: 2.5, unitsLeft: 5, pickupDeadline: '7:00 PM', distance: '1.5 km', emoji: '🍰' },
  { id: '17', restaurantName: 'Café Central',           restaurantCategory: 'Cafetería',     productName: 'Desayuno completo x2',       description: 'Café, jugo, tostadas con mantequilla y mermelada',           originalPrice: 8.0,  offerPrice: 3.0, unitsLeft: 3, pickupDeadline: '11:00 AM', distance: '1.5 km', emoji: '☕' },
  { id: '18', restaurantName: 'Café Central',           restaurantCategory: 'Cafetería',     productName: 'Muffins variados x6',        description: 'Muffins de arándanos, chocolate y limón',                    originalPrice: 5.0,  offerPrice: 2.0, unitsLeft: 4, pickupDeadline: '6:30 PM', distance: '1.5 km', emoji: '🧇' },
  { id: '19', restaurantName: 'Café del Parque',        restaurantCategory: 'Cafetería',     productName: 'Sandwich club + café',       description: 'Sandwich de pollo con papas y bebida caliente',              originalPrice: 7.0,  offerPrice: 3.0, unitsLeft: 2, pickupDeadline: '5:00 PM', distance: '0.7 km', emoji: '🥪' },

  // ── Sushi Caracas (popular) ────────────────────────────────────────────────
  { id: '20', restaurantName: 'Sushi Caracas',          restaurantCategory: 'Japonesa',      productName: 'Bandeja de 20 piezas',       description: 'Mix de rolls y nigiri del día',                              originalPrice: 15.0, offerPrice: 6.0, unitsLeft: 2, pickupDeadline: '9:30 PM', distance: '2.1 km', emoji: '🍣' },
  { id: '21', restaurantName: 'Sushi Caracas',          restaurantCategory: 'Japonesa',      productName: 'Ramen tonkotsu',             description: 'Ramen con caldo de cerdo, chashu y huevo marinado',          originalPrice: 10.0, offerPrice: 4.0, unitsLeft: 3, pickupDeadline: '9:00 PM', distance: '2.1 km', emoji: '🍜' },
  { id: '22', restaurantName: 'Sushi Caracas',          restaurantCategory: 'Japonesa',      productName: 'Gyozas x10',                 description: 'Gyozas de cerdo y vegetales al vapor o fritas',              originalPrice: 8.0,  offerPrice: 3.0, unitsLeft: 4, pickupDeadline: '8:30 PM', distance: '2.1 km', emoji: '🥟' },
  { id: '23', restaurantName: 'Tokyo Express',          restaurantCategory: 'Japonesa',      productName: 'Bento box completo',         description: 'Arroz, teriyaki, ensalada y miso',                           originalPrice: 9.0,  offerPrice: 3.5, unitsLeft: 3, pickupDeadline: '8:00 PM', distance: '2.5 km', emoji: '🍱' },

  // ── Burger House ───────────────────────────────────────────────────────────
  { id: '24', restaurantName: 'Burger House',           restaurantCategory: 'Hamburguesas', productName: 'Combo doble + papas',        description: 'Doble carne, queso cheddar, bacon y papas medianas',        originalPrice: 10.0, offerPrice: 4.5, unitsLeft: 4, pickupDeadline: '10:00 PM', distance: '1.0 km', emoji: '🍔' },
  { id: '25', restaurantName: 'Burger House',           restaurantCategory: 'Hamburguesas', productName: 'Hot dogs x4',               description: 'Hot dogs con chili, queso y cebolla caramelizada',           originalPrice: 7.0,  offerPrice: 3.0, unitsLeft: 5, pickupDeadline: '9:45 PM', distance: '1.0 km', emoji: '🌭' },
  { id: '26', restaurantName: 'Smash & Co.',            restaurantCategory: 'Hamburguesas', productName: 'Smash burger individual',   description: 'Smash burger con doble carne aplastada y queso americano',  originalPrice: 8.0,  offerPrice: 3.5, unitsLeft: 3, pickupDeadline: '10:30 PM', distance: '1.6 km', emoji: '🥩' },

  // ── Mexicana ───────────────────────────────────────────────────────────────
  { id: '27', restaurantName: 'El Sombrero',            restaurantCategory: 'Mexicana',      productName: 'Pack de 6 tacos',            description: 'Tacos de carne, pollo y vegetariano con salsas',             originalPrice: 9.0,  offerPrice: 3.5, unitsLeft: 4, pickupDeadline: '9:00 PM', distance: '1.7 km', emoji: '🌮' },
  { id: '28', restaurantName: 'El Sombrero',            restaurantCategory: 'Mexicana',      productName: 'Burrito familiar',           description: 'Burrito XXL con frijoles, guacamole, pico de gallo',         originalPrice: 11.0, offerPrice: 4.5, unitsLeft: 2, pickupDeadline: '8:30 PM', distance: '1.7 km', emoji: '🌯' },
  { id: '29', restaurantName: 'Azteca Caracas',         restaurantCategory: 'Mexicana',      productName: 'Nachos con guacamole',       description: 'Nachos crocantes con guacamole fresco y jalapeños',          originalPrice: 6.0,  offerPrice: 2.5, unitsLeft: 5, pickupDeadline: '9:30 PM', distance: '2.0 km', emoji: '🫔' },

  // ── Saludable ──────────────────────────────────────────────────────────────
  { id: '30', restaurantName: 'Green Bowl',             restaurantCategory: 'Saludable',     productName: 'Bowl de quinoa x2',          description: 'Quinoa, aguacate, tomate cherry y aderezo de limón',         originalPrice: 9.0,  offerPrice: 3.5, unitsLeft: 3, pickupDeadline: '6:00 PM', distance: '1.1 km', emoji: '🥗' },
  { id: '31', restaurantName: 'Green Bowl',             restaurantCategory: 'Saludable',     productName: 'Smoothie bowl x2',           description: 'Smoothie de frutos rojos con granola y semillas',            originalPrice: 7.0,  offerPrice: 2.5, unitsLeft: 4, pickupDeadline: '5:30 PM', distance: '1.1 km', emoji: '🫐' },
  { id: '32', restaurantName: 'FreshFit Caracas',       restaurantCategory: 'Saludable',     productName: 'Wrap integral x3',           description: 'Wrap de pollo grillado, espinacas y hummus',                 originalPrice: 8.0,  offerPrice: 3.0, unitsLeft: 2, pickupDeadline: '6:30 PM', distance: '1.9 km', emoji: '🥙' },
  { id: '33', restaurantName: 'FreshFit Caracas',       restaurantCategory: 'Saludable',     productName: 'Ensalada mediterránea',      description: 'Mix de hojas, aceitunas, feta y vinagreta de hierbas',       originalPrice: 6.5,  offerPrice: 2.5, unitsLeft: 5, pickupDeadline: '7:00 PM', distance: '1.9 km', emoji: '🥦' },
  { id: '34', restaurantName: 'La Arepa de Oro',        restaurantCategory: 'Venezolana',    productName: 'Arepa de cochino x4',        description: 'Arepas rellenas de pernil con guasacaca',                    originalPrice: 8.0,  offerPrice: 3.0, unitsLeft: 3, pickupDeadline: '8:00 PM', distance: '0.5 km', emoji: '🫓' },
];

const POPULAR_RESTAURANTS = [
  { name: 'Panadería El Trigal',     emoji: '🥐', color: '#FFF8E1' },
  { name: 'Restaurante La Cazuela',  emoji: '🍛', color: '#FBE9E7' },
  { name: 'Pizza Roma',              emoji: '🍕', color: '#FCE4EC' },
  { name: 'Café Central',            emoji: '☕', color: '#EFEBE9' },
  { name: 'Sushi Caracas',           emoji: '🍣', color: '#E8F5E9' },
  { name: 'Burger House',            emoji: '🍔', color: '#FFF3E0' },
  { name: 'La Arepa de Oro',         emoji: '🫓', color: '#FFFDE7' },
  { name: 'Chifa Dragón',            emoji: '🥡', color: '#EDE7F6' },
  { name: 'El Bodegón',              emoji: '🥘', color: '#F3E5F5' },
  { name: 'Heladería Polar',         emoji: '🍦', color: '#E3F2FD' },
];

const CATEGORIES = [
  { label: 'Todos',          emoji: '⭐' },
  { label: 'Panadería',      emoji: '🥐' },
  { label: 'Venezolana',     emoji: '🫕' },
  { label: 'Italiana',       emoji: '🍕' },
  { label: 'Cafetería',      emoji: '☕' },
  { label: 'Japonesa',       emoji: '🍣' },
  { label: 'Hamburguesas',   emoji: '🍔' },
  { label: 'Mexicana',       emoji: '🌮' },
  { label: 'Saludable',      emoji: '🥗' },
];

type Props = {
  onOfferPress: (offer: Offer) => void;
  onLoginPress: () => void;
  onProfilePress: () => void;
  onActiveOrderPress?: () => void;
  hasActiveOrder?: boolean;
  activeOrderCount?: number;
  filterRestaurant?: string;
  onClearFilter?: () => void;
  onRestaurantPress?: (restaurantName: string) => void;
  favoriteNotifications?: string[];
  isLoggedIn: boolean;
  userName?: string;
};

export default function ExploreScreen({ onOfferPress, onLoginPress, onProfilePress, onActiveOrderPress, hasActiveOrder, activeOrderCount, isLoggedIn, userName, filterRestaurant, onClearFilter, onRestaurantPress, favoriteNotifications }: Props) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [location, setLocation] = useState('Las Mercedes');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [zoneSearch, setZoneSearch] = useState('');

  const filtered = MOCK_OFFERS.filter((o) => {
    const matchesSearch =
      o.restaurantName.toLowerCase().includes(search.toLowerCase()) ||
      o.productName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Todos' || o.restaurantCategory === selectedCategory;
    const matchesRestaurant = !filterRestaurant || o.restaurantName === filterRestaurant;
    if (!matchesRestaurant) return false;
    return matchesSearch && matchesCategory;
  });

  const discount = (offer: Offer) =>
    Math.round(((offer.originalPrice - offer.offerPrice) / offer.originalPrice) * 100);

  const filteredZones = ZONES.filter(z => z.toLowerCase().includes(zoneSearch.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Location picker modal */}
      <Modal visible={showLocationModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Elegir zona</Text>
              <TouchableOpacity onPress={() => { setShowLocationModal(false); setZoneSearch(''); }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalSearch}>
              <Text style={styles.modalSearchIcon}>🔍</Text>
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Buscar zona..."
                placeholderTextColor={colors.textSecondary}
                value={zoneSearch}
                onChangeText={setZoneSearch}
                autoCorrect={false}
                autoFocus
              />
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {filteredZones.map((zone) => (
                <TouchableOpacity
                  key={zone}
                  style={[styles.zoneRow, location === zone && styles.zoneRowActive]}
                  onPress={() => { setLocation(zone); setShowLocationModal(false); setZoneSearch(''); }}
                >
                  <Text style={styles.zoneEmoji}>📍</Text>
                  <View style={styles.zoneInfo}>
                    <Text style={[styles.zoneName, location === zone && styles.zoneNameActive]}>{zone}</Text>
                    <Text style={styles.zoneCity}>Caracas</Text>
                  </View>
                  {location === zone && <Text style={styles.zoneCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Header */}
      {filterRestaurant ? (
        <View style={styles.restaurantHeader}>
          <TouchableOpacity style={styles.backBtnSmall} onPress={onClearFilter}>
            <Text style={styles.backBtnSmallText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.restaurantHeaderInfo}>
            <Text style={styles.restaurantHeaderName}>{filterRestaurant}</Text>
            <Text style={styles.restaurantHeaderSub}>
              ⭐ Favorito · {filtered.length} {filtered.length === 1 ? 'oferta' : 'ofertas'} disponibles
            </Text>
          </View>
          {isLoggedIn && (
            <TouchableOpacity style={styles.avatarBtn} onPress={onProfilePress}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.header}>
          <View>
            <Text style={styles.locationLabel}>Ofertas cerca de</Text>
            <TouchableOpacity style={styles.locationRow} onPress={() => setShowLocationModal(true)}>
              <Text style={styles.locationText}>📍 Caracas, {location}</Text>
              <Text style={styles.locationChevron}>›</Text>
            </TouchableOpacity>
          </View>
          {isLoggedIn ? (
            <TouchableOpacity style={styles.avatarBtn} onPress={onProfilePress}>
              <View>
                <Text style={styles.avatarEmoji}>👤</Text>
                {(favoriteNotifications?.length ?? 0) > 0 && (
                  <View style={styles.notifDot} />
                )}
              </View>
              <Text style={styles.avatarName} numberOfLines={1}>
                {userName?.split(' ')[0] ?? 'Mi perfil'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.loginBtn} onPress={onLoginPress}>
              <Text style={styles.loginBtnText}>Entrar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar restaurante o producto..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Categories */}
      {!filterRestaurant && <View style={styles.categoriesWrapper}><ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {CATEGORIES.map((item) => {
          const active = selectedCategory === item.label;
          return (
            <TouchableOpacity
              key={item.label}
              style={styles.categoryItem}
              onPress={() => setSelectedCategory(item.label)}
              activeOpacity={0.7}
            >
              <View style={[styles.categoryCircle, active && styles.categoryCircleActive]}>
                <Text style={styles.categoryEmoji}>{item.emoji}</Text>
              </View>
              <Text style={[styles.categoryText, active && styles.categoryTextActive]} numberOfLines={1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView></View>}

      {/* Popular restaurants */}
      {!filterRestaurant && (
        <View style={styles.popularSection}>
          <Text style={styles.popularTitle}>Restaurantes populares</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularScroll}>
            {POPULAR_RESTAURANTS.map((r) => {
              const hasOffer = MOCK_OFFERS.some(o => o.restaurantName === r.name);
              return (
                <TouchableOpacity
                  key={r.name}
                  style={styles.popularItem}
                  onPress={() => onRestaurantPress?.(r.name)}
                  activeOpacity={0.75}
                >
                  <View style={[
                    styles.popularLogo,
                    { backgroundColor: r.color },
                    hasOffer && styles.popularLogoActive,
                  ]}>
                    <Text style={styles.popularEmoji}>{r.emoji}</Text>
                    {hasOffer && <View style={styles.popularOfferDot} />}
                  </View>
                  <Text style={styles.popularName} numberOfLines={2}>{r.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Results count */}
      <Text style={styles.resultsCount}>
        {filtered.length} {filtered.length === 1 ? 'oferta' : 'ofertas'} disponibles
      </Text>

      {/* Offers list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onOfferPress(item)}>
            <View style={styles.cardImagePlaceholder}>
              <Text style={styles.cardEmoji}>{item.emoji}</Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discount(item)}%</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={styles.restaurantName}>{item.restaurantName}</Text>
                <Text style={styles.distance}>{item.distance}</Text>
              </View>

              <Text style={styles.productName}>{item.productName}</Text>
              <Text style={styles.description} numberOfLines={1}>
                {item.description}
              </Text>

              <View style={styles.cardFooter}>
                <View style={styles.priceContainer}>
                  <Text style={styles.offerPrice}>${item.offerPrice.toFixed(2)}</Text>
                  <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.metaContainer}>
                  <Text style={styles.metaText}>⏰ hasta {item.pickupDeadline}</Text>
                  <Text style={[styles.metaText, item.unitsLeft <= 2 && styles.urgentText]}>
                    {item.unitsLeft <= 2 ? '🔥' : '📦'} {item.unitsLeft}{' '}
                    {item.unitsLeft === 1 ? 'unidad' : 'unidades'}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Active order FAB — último en renderizar para tener prioridad de toque en Android */}
      {hasActiveOrder && (
        <TouchableOpacity style={styles.fab} onPress={onActiveOrderPress} activeOpacity={0.85}>
          <Text style={styles.fabEmoji}>🎟️</Text>
          <View style={styles.fabBadge}>
            <Text style={styles.fabBadgeText}>{activeOrderCount ?? 1}</Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  locationLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationText: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  locationChevron: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  loginBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
  },
  loginBtnText: {
    ...typography.button,
    color: colors.primary,
  },
  avatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    gap: spacing.xs,
    maxWidth: 120,
  },
  avatarEmoji: { fontSize: 16 },
  avatarName: {
    ...typography.caption,
    color: colors.textLight,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md - 2,
    ...typography.body,
    color: colors.textPrimary,
  },
  categoriesWrapper: {
    height: 88,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  categoryItem: {
    alignItems: 'center',
    width: 72,
  },
  categoryCircle: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  categoryCircleActive: {
    borderColor: colors.primary,
    backgroundColor: '#F1F8E9',
  },
  categoryEmoji: {
    fontSize: 26,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#757575',
    textAlign: 'center',
    lineHeight: 12,
  },
  categoryTextActive: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 12,
  },
  popularSection: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  popularTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  popularScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  popularItem: {
    alignItems: 'center',
    width: 68,
  },
  popularLogo: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  popularLogoActive: {
    borderWidth: 2.5,
    borderColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  popularEmoji: { fontSize: 28 },
  popularOfferDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  popularName: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 13,
  },
  resultsCount: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImagePlaceholder: {
    height: 140,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 64,
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  discountText: {
    ...typography.caption,
    color: colors.textLight,
    fontWeight: '700',
  },
  cardBody: {
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  restaurantName: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  distance: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  productName: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  offerPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  originalPrice: {
    ...typography.caption,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  metaContainer: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  urgentText: {
    color: colors.secondary,
    fontWeight: '600',
  },
  restaurantHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtnSmall: {
    width: 36, height: 36, borderRadius: borderRadius.full,
    backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  backBtnSmallText: { fontSize: 24, color: colors.textPrimary, lineHeight: 28 },
  restaurantHeaderInfo: { flex: 1 },
  restaurantHeaderName: { ...typography.h3, color: colors.textPrimary },
  restaurantHeaderSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  notifDot: {
    position: 'absolute', top: -2, right: -2,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.error, borderWidth: 1.5, borderColor: colors.surface,
  },
  filterBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF8E1', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: '#FFE082',
  },
  filterBannerText: { ...typography.caption, fontWeight: '700', color: '#F57F17' },
  filterBannerClear: { ...typography.caption, fontWeight: '600', color: colors.textSecondary },
  fab: {
    position: 'absolute', bottom: spacing.xl, right: spacing.lg,
    width: 64, height: 64, borderRadius: borderRadius.full,
    backgroundColor: colors.secondary,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8,
    shadowColor: colors.secondary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8,
  },
  fabEmoji: { fontSize: 28 },
  fabBadge: {
    position: 'absolute', top: 4, right: 4,
    width: 20, height: 20, borderRadius: borderRadius.full,
    backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.surface,
  },
  fabBadgeText: { fontSize: 10, fontWeight: '700', color: colors.textLight },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '80%', paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  modalTitle: { ...typography.h3, color: colors.textPrimary },
  modalClose: { fontSize: 18, color: colors.textSecondary, padding: spacing.xs },
  modalSearch: {
    flexDirection: 'row', alignItems: 'center', margin: spacing.lg,
    backgroundColor: colors.background, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  modalSearchIcon: { fontSize: 14, marginRight: spacing.sm },
  modalSearchInput: { flex: 1, paddingVertical: spacing.md - 2, ...typography.body, color: colors.textPrimary },
  zoneRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md, gap: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  zoneRowActive: { backgroundColor: '#F1F8E9' },
  zoneEmoji: { fontSize: 16 },
  zoneInfo: { flex: 1 },
  zoneName: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  zoneNameActive: { color: colors.primary },
  zoneCity: { ...typography.caption, color: colors.textSecondary },
  zoneCheck: { fontSize: 16, color: colors.primary, fontWeight: '700' },
});
