'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Order, Offer } from '@/types';

interface NotificationContextType {
  orders: Order[];
  offers: Offer[];
  notificationCount: number;
  cartCount: number;
  isNotificationSeen: boolean;
  isCartSeen: boolean;
  markNotificationsAsSeen: () => void;
  markCartAsSeen: () => void;
  updateOrders: (newOrders: Order[]) => void;
  updateOffers: (newOffers: Offer[]) => void;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isNotificationSeen, setIsNotificationSeen] = useState(false);
  const [isCartSeen, setIsCartSeen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    
    let currentOrders: Order[] = [];
    let currentOffers: Offer[] = [];

    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      try {
        const parsed = JSON.parse(storedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentOrders = parsed;
        }
      } catch (e) {
        console.error('Failed to parse orders from localStorage', e);
      }
    }

    const storedOffers = localStorage.getItem('offers');
    if (storedOffers) {
      try {
        const parsed = JSON.parse(storedOffers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentOffers = parsed;
        }
      } catch (e) {
        console.error('Failed to parse offers from localStorage', e);
      }
    }

    setOrders(currentOrders);
    setOffers(currentOffers);
  }, []);

  const updateOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    if (typeof window !== 'undefined') {
      localStorage.setItem('orders', JSON.stringify(newOrders));
    }
  };

  const updateOffers = (newOffers: Offer[]) => {
    setOffers(newOffers);
    if (typeof window !== 'undefined') {
      localStorage.setItem('offers', JSON.stringify(newOffers));
    }
  };

  const refresh = () => {
    if (typeof window !== 'undefined') {
      const storedOrders = localStorage.getItem('orders');
      const storedOffers = localStorage.getItem('offers');
      if (storedOrders) setOrders(JSON.parse(storedOrders));
      if (storedOffers) setOffers(JSON.parse(storedOffers));
    }
  };

  const markNotificationsAsSeen = () => {
    setIsNotificationSeen(true);
  };

  const markCartAsSeen = () => {
    setIsCartSeen(true);
  };

  // Whenever a new order or offer is added/received, reset the "seen" flag
  // so the user receives a new badge indicator.
  useEffect(() => {
    if (!isMounted) return;
    setIsNotificationSeen(false);
  }, [orders.length, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    setIsCartSeen(false);
  }, [offers.length, isMounted]);

  // Compute notification and cart counts
  // unviewedOrders: seller's pending orders
  const unviewedOrders = orders.filter((order) => order.status === 'pending').length;
  // unviewedOffers: buyer's active offers from sellers
  const unviewedOffers = offers.filter((offer) => offer.fromSeller && offer.status === 'sent').length;

  // Bell badge count = total unviewed actions
  const notificationCount = unviewedOrders + unviewedOffers;
  // Cart badge count = unviewed offers for the buyer
  const cartCount = unviewedOffers;

  return (
    <NotificationContext.Provider
      value={{
        orders,
        offers,
        notificationCount: isMounted ? notificationCount : 0,
        cartCount: isMounted ? cartCount : 0,
        isNotificationSeen,
        isCartSeen,
        markNotificationsAsSeen,
        markCartAsSeen,
        updateOrders,
        updateOffers,
        refresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
