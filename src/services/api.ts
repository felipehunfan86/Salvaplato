import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// En producción: URL de Netlify. En desarrollo: emulador local.
const PROD_URL = 'https://salvaplato-api.netlify.app/api'; // ← cambia al dominio real tras deploy
const DEV_ANDROID = 'http://10.0.2.2:3000/api';           // emulador Android → localhost
const DEV_IOS = 'http://localhost:3000/api';               // simulador iOS

const isDev = __DEV__;

export const API_URL = isDev
  ? Platform.select({ android: DEV_ANDROID, ios: DEV_IOS, default: DEV_IOS })!
  : PROD_URL;

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// ── Token storage ─────────────────────────────────────────────────────────────

export async function saveAuth(token: string, user: StoredUser) {
  await Promise.all([
    AsyncStorage.setItem(TOKEN_KEY, token),
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
  ]);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getSavedUser(): Promise<StoredUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearAuth() {
  await Promise.all([
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem(USER_KEY),
  ]);
}

export type StoredUser = {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  zone?: string;
};

// ── HTTP client ───────────────────────────────────────────────────────────────

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = Array.isArray(data.message)
      ? data.message[0]
      : (data.message ?? 'Error del servidor');
    throw new Error(msg);
  }
  return data as T;
}

// ── Offer mapper ──────────────────────────────────────────────────────────────

export type ApiOffer = {
  id: string;
  title: string;
  description: string;
  original_price: number;
  offer_price: number;
  quantity_available: number;
  pickup_deadline: string;
  emoji: string;
  category: string;
  photo_url: string | null;
  restaurant_id: string;
  restaurants: {
    id: string;
    name: string;
    address: string;
    cuisine_type: string;
    logo_url: string | null;
    latitude: number | null;
    longitude: number | null;
  };
};

export type AppOffer = {
  id: string;
  restaurantId: string;
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

export function mapApiOffer(api: ApiOffer): AppOffer {
  const deadline = new Date(api.pickup_deadline);
  const h = deadline.getHours();
  const m = deadline.getMinutes().toString().padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;

  return {
    id: api.id,
    restaurantId: api.restaurant_id,
    restaurantName: api.restaurants?.name ?? '',
    restaurantCategory: api.category ?? api.restaurants?.cuisine_type ?? '',
    productName: api.title,
    description: api.description ?? '',
    originalPrice: api.original_price,
    offerPrice: api.offer_price,
    unitsLeft: api.quantity_available,
    pickupDeadline: `${h12}:${m} ${period}`,
    distance: '— km',
    emoji: api.emoji ?? '🍽️',
  };
}
