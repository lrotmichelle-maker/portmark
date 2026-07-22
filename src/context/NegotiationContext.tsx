'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { addNotification, createNotification, markAllNotificationsRead, type AppNotification } from '@/lib/notifications';
import { createNegotiationEvent, type NegotiationEvent } from '@/lib/negotiation';

export type NegotiationStatus =
  | 'idle'
  | 'buyer-pending'
  | 'seller-pending'
  | 'accepted'
  | 'payment-pending'
  | 'declined'
  | 'timed-out';

export interface NegotiationSession {
  id: string;
  cardId: string;
  itemType: 'market' | 'offer' | 'order';
  status: NegotiationStatus;
  currentValue: number;
  buyerCounterCount: number;
  sellerCounterCount: number;
  buyerBuyCountToday: number;
  dayKey: string;
  lastActor: 'buyer' | 'seller' | 'system' | null;
  lastActionLabel: string;
  pendingFor: 'buyer' | 'seller' | null;
  paymentDueAt?: string;
  cooldownUntil?: string;
  createdAt: string;
  updatedAt: string;
}

interface BuyerActionInput {
  id: string;
  itemType: 'market' | 'offer';
  productPrice: number;
  sellerName?: string;
  buyerName?: string;
  description?: string;
}

interface BuyerCounterInput extends BuyerActionInput {
  price: number;
}

interface NegotiationContextType {
  sessions: Record<string, NegotiationSession>;
  notifications: AppNotification[];
  events: NegotiationEvent[];
  notificationCount: number;
  notificationUnreadCount: number;
  markAllNotificationsRead: () => void;
  startBuyerBuy: (input: BuyerActionInput) => NegotiationSession | null;
  startBuyerCounter: (input: BuyerCounterInput) => NegotiationSession | null;
  sellerRespondToOrder: (orderId: string, action: 'accept' | 'counter' | 'decline', price?: number) => NegotiationSession | null;
  buyerRespondToOffer: (offerId: string, action: 'accept' | 'counter' | 'decline', price?: number) => NegotiationSession | null;
  getSession: (id: string) => NegotiationSession | undefined;
  getSessionLabel: (id: string) => string;
  getSessionStatus: (id: string) => NegotiationStatus | undefined;
}

const NegotiationContext = createContext<NegotiationContextType | undefined>(undefined);

const STORAGE_KEY = 'negotiation-sessions-v1';
const NOTIFICATION_STORAGE_KEY = 'negotiation-notifications-v1';
const EVENT_STORAGE_KEY = 'negotiation-events-v1';
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const COOLDOWN_MS = 10 * 60 * 1000;

function getTodayKey(date = new Date()) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function formatStatusLabel(status: NegotiationStatus) {
  switch (status) {
    case 'buyer-pending':
      return 'Buyer pending';
    case 'seller-pending':
      return 'Seller pending';
    case 'accepted':
      return 'Accepted';
    case 'payment-pending':
      return 'Payment pending';
    case 'declined':
      return 'Declined';
    case 'timed-out':
      return 'Timed out';
    default:
      return 'Idle';
  }
}

function getBuyerMaxDiscount(counterCount: number) {
  if (counterCount >= 2) return 0.15;
  if (counterCount === 1) return 0.30;
  return 0.40;
}

function getSellerMaxDiscount(counterCount: number) {
  if (counterCount >= 2) return 0.10;
  if (counterCount === 1) return 0.25;
  return 0.35;
}

function buildSession(input: Partial<NegotiationSession> & Pick<NegotiationSession, 'id' | 'cardId' | 'itemType' | 'status' | 'currentValue' | 'dayKey' | 'lastActionLabel' | 'pendingFor' | 'lastActor'>): NegotiationSession {
  const now = new Date().toISOString();
  return {
    id: input.id,
    cardId: input.cardId,
    itemType: input.itemType,
    status: input.status,
    currentValue: input.currentValue,
    buyerCounterCount: input.buyerCounterCount ?? 0,
    sellerCounterCount: input.sellerCounterCount ?? 0,
    buyerBuyCountToday: input.buyerBuyCountToday ?? 0,
    dayKey: input.dayKey,
    lastActor: input.lastActor,
    lastActionLabel: input.lastActionLabel,
    pendingFor: input.pendingFor,
    paymentDueAt: input.paymentDueAt,
    cooldownUntil: input.cooldownUntil,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };
}

export function NegotiationProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Record<string, NegotiationSession>>({});
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [events, setEvents] = useState<NegotiationEvent[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedSessions = window.localStorage.getItem(STORAGE_KEY);
      const storedNotifications = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      const storedEvents = window.localStorage.getItem(EVENT_STORAGE_KEY);
      if (storedSessions) setSessions(JSON.parse(storedSessions));
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
      if (storedEvents) setEvents(JSON.parse(storedEvents));
    } catch (error) {
      console.error('Failed to load negotiation state', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const tick = () => {
      const now = Date.now();
      setSessions((prev) => {
        let next = { ...prev };
        let changed = false;
        Object.entries(next).forEach(([id, session]) => {
          const pending = session.status === 'buyer-pending' || session.status === 'seller-pending' || session.status === 'payment-pending';
          const expired = session.updatedAt && now - new Date(session.updatedAt).getTime() > DAY_IN_MS;
          const paymentExpired = session.paymentDueAt ? now > new Date(session.paymentDueAt).getTime() : false;
          const shouldTimeout = pending && (expired || paymentExpired);
          if (shouldTimeout) {
            next[id] = {
              ...session,
              status: 'timed-out',
              pendingFor: null,
              lastActionLabel: 'Timed out due to inactivity',
              updatedAt: new Date().toISOString(),
            };
            setNotifications((prevNotifications) => addNotification(prevNotifications, createNotification({
              title: 'Negotiation timed out',
              message: `The negotiation for card ${session.cardId} timed out after no response.`,
              category: 'negotiation',
              relatedId: session.cardId,
              actor: 'system',
              status: 'timed-out',
            })));
            setEvents((prevEvents) => [...prevEvents, createNegotiationEvent(session.cardId, 'system', 0, 'Negotiation timed out due to inactivity.')]);
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    };

    const interval = window.setInterval(tick, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const notificationCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  const pushNotification = (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const next = addNotification(notifications, createNotification(notification));
    setNotifications(next);
    setEvents((prev) => [...prev, createNegotiationEvent(notification.relatedId ?? 'system', notification.actor, 0, notification.message)]);
  };

  const clearNotificationsRead = () => {
    setNotifications((prev) => markAllNotificationsRead(prev));
  };

  const canStartBuyerAction = (session: NegotiationSession | undefined, now: number) => {
    const todayKey = getTodayKey();
    const todayCount = session && session.dayKey === todayKey ? session.buyerBuyCountToday : 0;
    const cooling = session?.cooldownUntil ? new Date(session.cooldownUntil).getTime() > now : false;
    return !cooling && todayCount < 3;
  };

  const startBuyerBuy = (input: BuyerActionInput) => {
    const now = Date.now();
    const existing = sessions[input.id];
    if (!canStartBuyerAction(existing, now)) return null;

    const todayKey = getTodayKey();
    const nextSession = buildSession({
      id: input.id,
      cardId: input.id,
      itemType: input.itemType,
      status: 'buyer-pending',
      currentValue: input.productPrice,
      buyerCounterCount: existing?.buyerCounterCount ?? 0,
      sellerCounterCount: existing?.sellerCounterCount ?? 0,
      buyerBuyCountToday: (existing && existing.dayKey === todayKey ? existing.buyerBuyCountToday : 0) + 1,
      dayKey: todayKey,
      lastActor: 'buyer',
      lastActionLabel: 'Buyer clicked buy',
      pendingFor: 'seller',
      paymentDueAt: new Date(now + DAY_IN_MS).toISOString(),
      cooldownUntil: new Date(now + COOLDOWN_MS).toISOString(),
    });

    setSessions((prev) => ({ ...prev, [input.id]: nextSession }));
    pushNotification({
      title: 'Buy request sent',
      message: `Buyer initiated a purchase request for ${input.sellerName ?? 'this seller'}.`,
      category: 'order',
      relatedId: input.id,
      actor: 'buyer',
      status: 'pending',
    });
    return nextSession;
  };

  const startBuyerCounter = (input: BuyerCounterInput) => {
    const now = Date.now();
    const existing = sessions[input.id];
    if (!canStartBuyerAction(existing, now)) return null;

    const buyerCounterCount = existing?.buyerCounterCount ?? 0;
    if (buyerCounterCount >= 3) return null;

    const minPrice = input.productPrice * (1 - getBuyerMaxDiscount(buyerCounterCount));
    if (input.price < minPrice) return null;

    const todayKey = getTodayKey();
    const nextSession = buildSession({
      id: input.id,
      cardId: input.id,
      itemType: input.itemType,
      status: 'buyer-pending',
      currentValue: input.price,
      buyerCounterCount: buyerCounterCount + 1,
      sellerCounterCount: existing?.sellerCounterCount ?? 0,
      buyerBuyCountToday: (existing && existing.dayKey === todayKey ? existing.buyerBuyCountToday : 0) + 1,
      dayKey: todayKey,
      lastActor: 'buyer',
      lastActionLabel: `Buyer counter ${buyerCounterCount + 1}`,
      pendingFor: 'seller',
      paymentDueAt: new Date(now + DAY_IN_MS).toISOString(),
      cooldownUntil: new Date(now + COOLDOWN_MS).toISOString(),
    });

    setSessions((prev) => ({ ...prev, [input.id]: nextSession }));
    pushNotification({
      title: 'Counter submitted',
      message: `Buyer sent a counter offer of ${input.price.toLocaleString()} to the seller.`,
      category: 'negotiation',
      relatedId: input.id,
      actor: 'buyer',
      status: 'countered',
    });
    return nextSession;
  };

  const sellerRespondToOrder = (orderId: string, action: 'accept' | 'counter' | 'decline', price?: number) => {
    const existing = sessions[orderId];
    if (!existing) return null;
    const now = Date.now();
    let nextSession: NegotiationSession;

    if (action === 'decline') {
      nextSession = buildSession({
        ...existing,
        id: existing.id,
        cardId: existing.cardId,
        itemType: existing.itemType,
        status: 'declined',
        currentValue: existing.currentValue,
        buyerCounterCount: existing.buyerCounterCount,
        sellerCounterCount: existing.sellerCounterCount,
        buyerBuyCountToday: existing.buyerBuyCountToday,
        dayKey: existing.dayKey,
        lastActor: 'seller',
        lastActionLabel: 'Seller declined',
        pendingFor: null,
        updatedAt: new Date(now).toISOString(),
      });
      pushNotification({
        title: 'Order declined',
        message: 'Seller declined the order and cancelled the negotiation.',
        category: 'order',
        relatedId: orderId,
        actor: 'seller',
        status: 'declined',
      });
    } else if (action === 'accept') {
      nextSession = buildSession({
        ...existing,
        id: existing.id,
        cardId: existing.cardId,
        itemType: existing.itemType,
        status: 'payment-pending',
        currentValue: existing.currentValue,
        buyerCounterCount: existing.buyerCounterCount,
        sellerCounterCount: existing.sellerCounterCount,
        buyerBuyCountToday: existing.buyerBuyCountToday,
        dayKey: existing.dayKey,
        lastActor: 'seller',
        lastActionLabel: 'Seller accepted',
        pendingFor: 'buyer',
        paymentDueAt: new Date(now + DAY_IN_MS).toISOString(),
        updatedAt: new Date(now).toISOString(),
      });
      pushNotification({
        title: 'Order accepted',
        message: 'Seller accepted the order and buyer must pay within 1 day.',
        category: 'order',
        relatedId: orderId,
        actor: 'seller',
        status: 'accepted',
      });
    } else {
      const sellerCount = existing.sellerCounterCount;
      if (sellerCount >= 3 || typeof price !== 'number') return null;
      const minPrice = existing.currentValue * (1 - getSellerMaxDiscount(sellerCount));
      if (price < minPrice) return null;

      nextSession = buildSession({
        ...existing,
        id: existing.id,
        cardId: existing.cardId,
        itemType: existing.itemType,
        status: 'seller-pending',
        currentValue: price,
        buyerCounterCount: existing.buyerCounterCount,
        sellerCounterCount: sellerCount + 1,
        buyerBuyCountToday: existing.buyerBuyCountToday,
        dayKey: existing.dayKey,
        lastActor: 'seller',
        lastActionLabel: `Seller counter ${sellerCount + 1}`,
        pendingFor: 'buyer',
        updatedAt: new Date(now).toISOString(),
      });
      pushNotification({
        title: 'Seller countered',
        message: `Seller sent a counter offer of ${price.toLocaleString()} for review.`,
        category: 'negotiation',
        relatedId: orderId,
        actor: 'seller',
        status: 'countered',
      });
    }

    setSessions((prev) => ({ ...prev, [orderId]: nextSession }));
    return nextSession;
  };

  const buyerRespondToOffer = (offerId: string, action: 'accept' | 'counter' | 'decline', price?: number) => {
    const existing = sessions[offerId];
    if (!existing) return null;
    const now = Date.now();
    let nextSession: NegotiationSession;

    if (action === 'decline') {
      nextSession = buildSession({
        ...existing,
        id: existing.id,
        cardId: existing.cardId,
        itemType: existing.itemType,
        status: 'declined',
        currentValue: existing.currentValue,
        buyerCounterCount: existing.buyerCounterCount,
        sellerCounterCount: existing.sellerCounterCount,
        buyerBuyCountToday: existing.buyerBuyCountToday,
        dayKey: existing.dayKey,
        lastActor: 'buyer',
        lastActionLabel: 'Buyer declined',
        pendingFor: null,
        updatedAt: new Date(now).toISOString(),
      });
      pushNotification({
        title: 'Offer declined',
        message: 'Buyer declined the offer and ended the negotiation.',
        category: 'offer',
        relatedId: offerId,
        actor: 'buyer',
        status: 'declined',
      });
    } else if (action === 'accept') {
      nextSession = buildSession({
        ...existing,
        id: existing.id,
        cardId: existing.cardId,
        itemType: existing.itemType,
        status: 'payment-pending',
        currentValue: existing.currentValue,
        buyerCounterCount: existing.buyerCounterCount,
        sellerCounterCount: existing.sellerCounterCount,
        buyerBuyCountToday: existing.buyerBuyCountToday,
        dayKey: existing.dayKey,
        lastActor: 'buyer',
        lastActionLabel: 'Buyer accepted',
        pendingFor: 'buyer',
        paymentDueAt: new Date(now + DAY_IN_MS).toISOString(),
        updatedAt: new Date(now).toISOString(),
      });
      pushNotification({
        title: 'Offer accepted',
        message: 'Buyer accepted the offer and payment is due within 1 day.',
        category: 'offer',
        relatedId: offerId,
        actor: 'buyer',
        status: 'accepted',
      });
    } else {
      const buyerCount = existing.buyerCounterCount;
      if (buyerCount >= 3 || typeof price !== 'number') return null;
      const minPrice = existing.currentValue * (1 - getBuyerMaxDiscount(buyerCount));
      if (price < minPrice) return null;

      nextSession = buildSession({
        ...existing,
        id: existing.id,
        cardId: existing.cardId,
        itemType: existing.itemType,
        status: 'buyer-pending',
        currentValue: price,
        buyerCounterCount: buyerCount + 1,
        sellerCounterCount: existing.sellerCounterCount,
        buyerBuyCountToday: existing.buyerBuyCountToday,
        dayKey: existing.dayKey,
        lastActor: 'buyer',
        lastActionLabel: `Buyer counter ${buyerCount + 1}`,
        pendingFor: 'seller',
        updatedAt: new Date(now).toISOString(),
      });
      pushNotification({
        title: 'Buyer countered',
        message: `Buyer submitted a counter offer of ${price.toLocaleString()} on the offer.`,
        category: 'negotiation',
        relatedId: offerId,
        actor: 'buyer',
        status: 'countered',
      });
    }

    setSessions((prev) => ({ ...prev, [offerId]: nextSession }));
    return nextSession;
  };

  const getSession = (id: string) => sessions[id];
  const getSessionLabel = (id: string) => formatStatusLabel(sessions[id]?.status ?? 'idle');
  const getSessionStatus = (id: string) => sessions[id]?.status;

  return (
    <NegotiationContext.Provider
      value={{
        sessions,
        notifications,
        events,
        notificationCount,
        notificationUnreadCount: notificationCount,
        markAllNotificationsRead: clearNotificationsRead,
        startBuyerBuy,
        startBuyerCounter,
        sellerRespondToOrder,
        buyerRespondToOffer,
        getSession,
        getSessionLabel,
        getSessionStatus,
      }}
    >
      {children}
    </NegotiationContext.Provider>
  );
}

export function useNegotiationContext() {
  const context = useContext(NegotiationContext);
  if (!context) {
    throw new Error('useNegotiationContext must be used within a NegotiationProvider');
  }
  return context;
}
