import React, { useState } from 'react';
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ExploreScreen from './src/screens/consumer/ExploreScreen';
import OfferDetailScreen from './src/screens/consumer/OfferDetailScreen';
import PurchaseConfirmScreen from './src/screens/consumer/PurchaseConfirmScreen';
import PaymentScreen from './src/screens/consumer/PaymentScreen';
import QRScreen from './src/screens/consumer/QRScreen';
import ProfileScreen from './src/screens/consumer/ProfileScreen';
import EditProfileScreen from './src/screens/consumer/EditProfileScreen';
import NotificationsScreen from './src/screens/consumer/NotificationsScreen';
import LocationScreen from './src/screens/consumer/LocationScreen';
import ChangePasswordScreen from './src/screens/consumer/ChangePasswordScreen';
import ActiveOrdersScreen, { Order } from './src/screens/consumer/ActiveOrdersScreen';
import RestaurantRegisterScreen from './src/screens/restaurant/RestaurantRegisterScreen';
import RestaurantDashboardScreen from './src/screens/restaurant/RestaurantDashboardScreen';
import RestaurantPublishOfferScreen from './src/screens/restaurant/RestaurantPublishOfferScreen';
import RestaurantManageOffersScreen from './src/screens/restaurant/RestaurantManageOffersScreen';
import RestaurantOrdersScreen from './src/screens/restaurant/RestaurantOrdersScreen';
import RestaurantQRScannerScreen from './src/screens/restaurant/RestaurantQRScannerScreen';
import RestaurantProfileScreen from './src/screens/restaurant/RestaurantProfileScreen';

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

type Screen =
  | 'welcome' | 'login' | 'register'
  | 'explore' | 'offerDetail' | 'purchaseConfirm' | 'payment' | 'qr'
  | 'activeOrders'
  | 'profile' | 'editProfile' | 'notifications' | 'location' | 'changePassword'
  | 'restaurantRegister' | 'restaurantDashboard' | 'restaurantPublishOffer'
  | 'restaurantManageOffers' | 'restaurantOrders' | 'restaurantQRScanner' | 'restaurantProfile';

function formatDate(d: Date) {
  return d.toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function makeOrderId() {
  return `ORD-${Date.now().toString().slice(-6)}`;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<{ restaurantName: string; restaurantCategory: string }[]>([]);
  const [filterRestaurant, setFilterRestaurant] = useState<string | undefined>(undefined);
  const [favoriteNotifications, setFavoriteNotifications] = useState<string[]>([]);

  const goToExplore = () => setScreen('explore');
  const goToDashboard = () => setScreen('restaurantDashboard');

  const activeOrders = orders.filter(o => o.status === 'pendiente');
  const currentQROrder = orders.find(o => o.orderId === activeOrderId) ?? null;

  const handlePaymentSuccess = () => {
    if (!selectedOffer) return;
    const orderId = makeOrderId();
    const newOrder: Order = {
      orderId,
      offer: {
        id: selectedOffer.id,
        restaurantName: selectedOffer.restaurantName,
        productName: selectedOffer.productName,
        offerPrice: selectedOffer.offerPrice,
        pickupDeadline: selectedOffer.pickupDeadline,
        emoji: selectedOffer.emoji,
      },
      status: 'pendiente',
      createdAt: formatDate(new Date()),
    };
    setOrders(prev => [...prev, newOrder]);
    setActiveOrderId(orderId);
    setScreen('qr');
  };

  const handleScanSuccess = (orderId: string) => {
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: 'retirado' } : o));
  };

  const handleRateOrder = (orderId: string, rating: number) => {
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, rating } : o));
  };

  const toggleFavorite = () => {
    if (!selectedOffer) return;
    const { restaurantName, restaurantCategory } = selectedOffer;
    const isAlready = favorites.some(f => f.restaurantName === restaurantName);
    setFavorites(prev =>
      isAlready
        ? prev.filter(f => f.restaurantName !== restaurantName)
        : [...prev, { restaurantName, restaurantCategory }]
    );
    if (!isAlready) {
      // Simular notificación de nueva oferta tras 8 segundos
      setTimeout(() => {
        setFavoriteNotifications(prev =>
          prev.includes(restaurantName) ? prev : [...prev, restaurantName]
        );
      }, 8000);
    } else {
      setFavoriteNotifications(prev => prev.filter(n => n !== restaurantName));
    }
  };

  const handleSelectActiveOrder = (order: Order) => {
    const match = selectedOffer?.id === order.offer.id ? selectedOffer : null;
    if (match) setSelectedOffer(match);
    setActiveOrderId(order.orderId);
    setScreen('qr');
  };

  // ── Auth ──────────────────────────────────────────────────────────────────
  if (screen === 'login') {
    return (
      <LoginScreen
        onLogin={(email) => { setIsLoggedIn(true); setUserName(email); setScreen(selectedOffer ? 'offerDetail' : 'explore'); }}
        onRegister={() => setScreen('register')}
        onBack={() => setScreen(selectedOffer ? 'offerDetail' : 'welcome')}
        onForgotPassword={() => {}}
      />
    );
  }

  if (screen === 'register') {
    return (
      <RegisterScreen
        onRegister={(data) => { setIsLoggedIn(true); setUserName(data.fullName); setScreen(selectedOffer ? 'offerDetail' : 'explore'); }}
        onLogin={() => setScreen('login')}
        onBack={() => setScreen('welcome')}
      />
    );
  }

  // ── Consumer ──────────────────────────────────────────────────────────────
  if (screen === 'offerDetail' && selectedOffer) {
    return (
      <OfferDetailScreen
        offer={selectedOffer}
        onBack={() => setScreen('explore')}
        onBuy={() => setScreen('purchaseConfirm')}
        onLoginRequired={() => setScreen('login')}
        isLoggedIn={isLoggedIn}
        isFavorite={favorites.some(f => f.restaurantName === selectedOffer.restaurantName)}
        onToggleFavorite={toggleFavorite}
      />
    );
  }

  if (screen === 'purchaseConfirm' && selectedOffer) {
    return (
      <PurchaseConfirmScreen
        offer={selectedOffer}
        onBack={() => setScreen('offerDetail')}
        onConfirm={() => setScreen('payment')}
      />
    );
  }

  if (screen === 'payment' && selectedOffer) {
    return (
      <PaymentScreen
        amount={selectedOffer.offerPrice}
        productName={selectedOffer.productName}
        onBack={() => setScreen('purchaseConfirm')}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }

  if (screen === 'qr' && selectedOffer && activeOrderId) {
    return (
      <QRScreen
        offer={selectedOffer}
        orderId={activeOrderId}
        onGoHome={goToExplore}
        onScanSuccess={handleScanSuccess}
        onRateOrder={handleRateOrder}
      />
    );
  }

  if (screen === 'activeOrders') {
    return (
      <ActiveOrdersScreen
        orders={orders}
        onBack={goToExplore}
        onSelectOrder={handleSelectActiveOrder}
      />
    );
  }

  if (screen === 'editProfile') return <EditProfileScreen onBack={() => setScreen('profile')} onSave={() => setScreen('profile')} />;
  if (screen === 'notifications') return <NotificationsScreen onBack={() => setScreen('profile')} />;
  if (screen === 'location') return <LocationScreen onBack={() => setScreen('profile')} onSave={() => setScreen('profile')} />;
  if (screen === 'changePassword') return <ChangePasswordScreen onBack={() => setScreen('profile')} />;

  if (screen === 'profile') {
    return (
      <ProfileScreen
        orders={orders}
        onRateOrder={handleRateOrder}
        favorites={favorites}
        favoriteNotifications={favoriteNotifications}
        onBack={goToExplore}
        onLogout={() => { setIsLoggedIn(false); setUserName(''); setScreen('welcome'); }}
        onEditProfile={() => setScreen('editProfile')}
        onNotifications={() => setScreen('notifications')}
        onLocation={() => setScreen('location')}
        onChangePassword={() => setScreen('changePassword')}
        onOrderPress={handleSelectActiveOrder}
        onFavoritePress={(name) => {
          setFilterRestaurant(name);
          setFavoriteNotifications(prev => prev.filter(n => n !== name));
          setScreen('explore');
        }}
      />
    );
  }

  if (screen === 'explore') {
    return (
      <ExploreScreen
        onOfferPress={(offer) => { setSelectedOffer(offer); setScreen('offerDetail'); }}
        onLoginPress={() => setScreen('login')}
        onProfilePress={() => setScreen('profile')}
        onActiveOrderPress={() => setScreen('activeOrders')}
        hasActiveOrder={activeOrders.length > 0}
        activeOrderCount={activeOrders.length}
        filterRestaurant={filterRestaurant}
        onClearFilter={() => setFilterRestaurant(undefined)}
        onRestaurantPress={(name) => setFilterRestaurant(name)}
        favoriteNotifications={favoriteNotifications}
        isLoggedIn={isLoggedIn}
        userName={userName}
      />
    );
  }

  // ── Restaurant ────────────────────────────────────────────────────────────
  if (screen === 'restaurantRegister') {
    return (
      <RestaurantRegisterScreen
        onRegister={(data) => { setRestaurantName(data.businessName); setScreen('restaurantDashboard'); }}
        onLogin={() => setScreen('restaurantDashboard')}
        onBack={() => setScreen('welcome')}
      />
    );
  }

  if (screen === 'restaurantDashboard') {
    return (
      <RestaurantDashboardScreen
        businessName={restaurantName || 'Pizzería Don Pepe'}
        onPublishOffer={() => setScreen('restaurantPublishOffer')}
        onManageOffers={() => setScreen('restaurantManageOffers')}
        onOrders={() => setScreen('restaurantOrders')}
        onScanQR={() => setScreen('restaurantQRScanner')}
        onProfile={() => setScreen('restaurantProfile')}
      />
    );
  }

  if (screen === 'restaurantPublishOffer') {
    return (
      <RestaurantPublishOfferScreen
        onBack={goToDashboard}
        onPublish={() => setScreen('restaurantManageOffers')}
      />
    );
  }

  if (screen === 'restaurantManageOffers') {
    return (
      <RestaurantManageOffersScreen
        onBack={goToDashboard}
        onPublishOffer={() => setScreen('restaurantPublishOffer')}
        onEditOffer={() => setScreen('restaurantPublishOffer')}
      />
    );
  }

  if (screen === 'restaurantOrders') {
    return (
      <RestaurantOrdersScreen
        onBack={goToDashboard}
        onScanQR={() => setScreen('restaurantQRScanner')}
      />
    );
  }

  if (screen === 'restaurantQRScanner') {
    return <RestaurantQRScannerScreen onBack={() => setScreen('restaurantOrders')} />;
  }

  if (screen === 'restaurantProfile') {
    return (
      <RestaurantProfileScreen
        onBack={goToDashboard}
        onLogout={() => { setRestaurantName(''); setScreen('welcome'); }}
      />
    );
  }

  // ── Welcome ───────────────────────────────────────────────────────────────
  return (
    <WelcomeScreen
      onExplore={goToExplore}
      onLogin={() => setScreen('login')}
      onRegister={() => setScreen('register')}
      onRestaurantRegister={() => setScreen('restaurantRegister')}
    />
  );
}
