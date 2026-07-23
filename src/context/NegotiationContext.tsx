'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { addNotification, createNotification, markAllNotificationsRead, type AppNotification } from '@/lib/notifications';
import { createNegotiationEvent, type NegotiationEvent } from '@/lib/negotiation';
import { useNotificationContext } from './NotificationContext';

export type NegotiationStatus =
  | 'idle'
  | 'buyer-pending'
  | 'seller-pending'
  | 'accepted'
  | 'payment-pending'
  | 'declined'
  | 'timed-out'
  | 'passed'
  | 'finalized';

export interface NegotiationSession {
  id: string;
  cardId: string;
  itemType: 'market' | 'offer' | 'order';
  status: NegotiationStatus;
  currentValue: number;
  productPrice: number;
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
  finalizeNegotiation: (cardId: string) => NegotiationSession | null;
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
    case 'passed':
      return 'Passed';
    case 'finalized':
      return 'Finalized';
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

function buildSession(input: Partial<NegotiationSession> & Pick<NegotiationSession, 'id' | 'cardId' | 'itemType' | 'status' | 'currentValue' | 'productPrice' | 'dayKey' | 'lastActionLabel' | 'pendingFor' | 'lastActor'>): NegotiationSession {
  const now = new Date().toISOString();
  return {
    id: input.id,
    cardId: input.cardId,
    itemType: input.itemType,
    status: input.status,
    currentValue: input.currentValue,
    productPrice: input.productPrice,
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
  const { orders, offers, updateOrders, updateOffers } = useNotificationContext();

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

  const pushNotification = (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const next = addNotification(notifications, createNotification(notification));
    setNotifications(next);
    setEvents((prev) => [...prev, createNegotiationEvent(notification.relatedId ?? 'system', notification.actor, 0, notification.message)]);
  };

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
          
          if (pending && (expired || paymentExpired)) {
            let newStatus: NegotiationStatus = 'timed-out';
            let label = 'Timed out due to inactivity';
            let notifyTitle = 'Negotiation timed out';
            let notifyMsg = `The negotiation for card ${session.cardId} timed out.`;
            
            if (session.status === 'buyer-pending' || session.status === 'seller-pending') {
              newStatus = 'passed';
              label = 'Passed due to no response';
              notifyTitle = 'Negotiation passed';
              notifyMsg = `The negotiation for card ${session.cardId} passed after no response within 1 day.`;
            }

            next[id] = {
              ...session,
              status: newStatus,
              pendingFor: null,
              lastActionLabel: label,
              cooldownUntil: new Date(now + COOLDOWN_MS).toISOString(),
              updatedAt: new Date().toISOString(),
            };

            setNotifications((prevNotifications) => addNotification(prevNotifications, createNotification({
              title: notifyTitle,
              message: notifyMsg,
              category: 'negotiation',
              relatedId: session.cardId,
              actor: 'system',
              status: 'timed-out',
            })));

            setEvents((prevEvents) => [...prevEvents, createNegotiationEvent(session.cardId, 'system', 0, label)]);

            // Sync with orders & offers list
            const latestOrder = [...orders].reverse().find(o => o.cardId === session.cardId);
            if (latestOrder) {
              latestOrder.status = newStatus === 'passed' ? 'passed' : 'timed-out';
              
              const latestOffer = [...offers].reverse().find(o => o.orderId === latestOrder.id);
              if (latestOffer) {
                latestOffer.status = newStatus === 'passed' ? 'passed' : 'timed-out';
              }
            }

            changed = true;
          }
        });

        if (changed) {
          updateOrders([...orders]);
          updateOffers([...offers]);
        }
        return changed ? next : prev;
      });
    };

    const interval = window.setInterval(tick, 30_000);
    return () => window.clearInterval(interval);
  }, [orders, offers]);

  const notificationCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

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
      productPrice: input.productPrice,
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

    // Create Order in shared state
    const newOrder = {
      id: `order-${Date.now()}`,
      type: 'buy' as const,
      cardId: input.id,
      buyerId: 'buyer-001',
      buyerName: input.buyerName ?? 'You',
      sellerName: input.sellerName,
      productPriceRaw: input.productPrice,
      description: input.description,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };
    updateOrders([...orders, newOrder]);

    return nextSession;
  };

  const startBuyerCounter = (input: BuyerCounterInput) => {
    const now = Date.now();
    const existing = sessions[input.id];
    if (!canStartBuyerAction(existing, now)) return null;

    const buyerCounterCount = existing?.buyerCounterCount ?? 0;
    if (buyerCounterCount >= 3) return null;

    if (existing && existing.lastActor === 'buyer') return null; // Alternating counters

    const minPrice = input.productPrice * (1 - getBuyerMaxDiscount(buyerCounterCount));
    if (input.price < minPrice) return null;

    const todayKey = getTodayKey();
    const nextSession = buildSession({
      id: input.id,
      cardId: input.id,
      itemType: input.itemType,
      status: 'buyer-pending',
      currentValue: input.price,
      productPrice: input.productPrice,
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

    // Create Order in shared state
    const newOrder = {
      id: `order-${Date.now()}`,
      type: 'counter' as const,
      cardId: input.id,
      buyerId: 'buyer-001',
      buyerName: input.buyerName ?? 'You',
      sellerName: input.sellerName,
      productPriceRaw: input.productPrice,
      offeredPrice: input.price,
      description: input.description,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };
    updateOrders([...orders, newOrder]);

    return nextSession;
  };

  const sellerRespondToOrder = (orderId: string, action: 'accept' | 'counter' | 'decline', price?: number) => {
    const order = orders.find(o => o.id === orderId);
    const cardId = order?.cardId ?? orderId;
    const existing = sessions[cardId];
    if (!existing) return null;

    const now = Date.now();
    let nextSession: NegotiationSession;

    if (action === 'decline') {
      nextSession = buildSession({
        ...existing,
        status: 'declined',
        lastActor: 'seller',
        lastActionLabel: 'Seller declined',
        pendingFor: null,
        cooldownUntil: new Date(now + COOLDOWN_MS).toISOString(),
        updatedAt: new Date(now).toISOString(),
      });
      pushNotification({
        title: 'Order declined',
        message: 'Seller declined the order and cancelled the negotiation.',
        category: 'order',
        relatedId: cardId,
        actor: 'seller',
        status: 'declined',
      });
    } else if (action === 'accept') {
      nextSession = buildSession({
        ...existing,
        status: 'payment-pending',
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
        relatedId: cardId,
        actor: 'seller',
        status: 'accepted',
      });
    } else {
      const sellerCount = existing.sellerCounterCount;
      if (sellerCount >= 3 || typeof price !== 'number') return null;
      if (existing.lastActor === 'seller') return null; // Alternating counters

      const minPrice = existing.productPrice * (1 - getSellerMaxDiscount(sellerCount));
      if (price < minPrice) return null;

      nextSession = buildSession({
        ...existing,
        status: 'seller-pending',
        currentValue: price,
        sellerCounterCount: sellerCount + 1,
        lastActor: 'seller',
        lastActionLabel: `Seller counter ${sellerCount + 1}`,
        pendingFor: 'buyer',
        updatedAt: new Date(now).toISOString(),
      });
      pushNotification({
        title: 'Seller countered',
        message: `Seller sent a counter offer of ${price.toLocaleString()} for review.`,
        category: 'negotiation',
        relatedId: cardId,
        actor: 'seller',
        status: 'countered',
      });
    }

    setSessions((prev) => ({ ...prev, [cardId]: nextSession }));

    // Sync state to Notification Context
    let updatedOrders = [...orders];
    let updatedOffers = [...offers];

    if (order) {
      updatedOrders = orders.map(o => o.id === order.id ? { ...o, status: action === 'decline' ? 'declined' : action === 'accept' ? 'accepted' : 'countered' } : o);

      if (action === 'accept') {
        const newOffer = {
          id: `offer-${Date.now()}`,
          orderId: order.id,
          type: 'accept' as const,
          createdAt: new Date().toISOString(),
          status: 'sent' as const,
          fromSeller: true,
          sellerName: order.sellerName || 'You',
          buyerName: order.buyerName,
          description: order.description,
          handle: order.handle,
          followers: order.followers,
          likes: order.likes,
          erCurrentRatio: order.erCurrentRatio,
          erPreviousRatio: order.erPreviousRatio,
          vlCurrentRatio: order.vlCurrentRatio,
          vlPreviousRatio: order.vlPreviousRatio,
          value: order.value,
        };
        updatedOffers.push(newOffer);
      } else if (action === 'counter') {
        const newOffer = {
          id: `offer-${Date.now()}`,
          orderId: order.id,
          type: 'counter' as const,
          responsePrice: price,
          createdAt: new Date().toISOString(),
          status: 'sent' as const,
          fromSeller: true,
          sellerName: order.sellerName || 'You',
          buyerName: order.buyerName,
          description: order.description,
          handle: order.handle,
          followers: order.followers,
          likes: order.likes,
          erCurrentRatio: order.erCurrentRatio,
          erPreviousRatio: order.erPreviousRatio,
          vlCurrentRatio: order.vlCurrentRatio,
          vlPreviousRatio: order.vlPreviousRatio,
          value: order.value,
        };
        updatedOffers.push(newOffer);
      }
    }

    updateOrders(updatedOrders);
    updateOffers(updatedOffers);

    return nextSession;
  };

  const buyerRespondToOffer = (offerId: string, action: 'accept' | 'counter' | 'decline', price?: number) => {
    const offer = offers.find(o => o.id === offerId);
    const order = orders.find(o => o.id === offer?.orderId);
    const cardId = order?.cardId ?? offerId;
    const existing = sessions[cardId];
    if (!existing) return null;

    const now = Date.now();
    let nextSession: NegotiationSession;

    if (action === 'decline') {
      nextSession = buildSession({
        ...existing,
        status: 'declined',
        lastActor: 'buyer',
        lastActionLabel: 'Buyer declined',
        pendingFor: null,
        cooldownUntil: new Date(now + COOLDOWN_MS).toISOString(),
        updatedAt: new Date(now).toISOString(),
      });
      pushNotification({
        title: 'Offer declined',
        message: 'Buyer declined the offer and ended the negotiation.',
        category: 'offer',
        relatedId: cardId,
        actor: 'buyer',
        status: 'declined',
      });
    } else if (action === 'accept') {
      nextSession = buildSession({
        ...existing,
        status: 'payment-pending',
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
        relatedId: cardId,
        actor: 'buyer',
        status: 'accepted',
      });
    } else {
      const buyerCount = existing.buyerCounterCount;
      if (buyerCount >= 3 || typeof price !== 'number') return null;
      if (existing.lastActor === 'buyer') return null; // Alternating counters

      const minPrice = existing.productPrice * (1 - getBuyerMaxDiscount(buyerCount));
      if (price < minPrice) return null;

      nextSession = buildSession({
        ...existing,
        status: 'buyer-pending',
        currentValue: price,
        buyerCounterCount: buyerCount + 1,
        lastActor: 'buyer',
        lastActionLabel: `Buyer counter ${buyerCount + 1}`,
        pendingFor: 'seller',
        updatedAt: new Date(now).toISOString(),
      });
      pushNotification({
        title: 'Buyer countered',
        message: `Buyer submitted a counter offer of ${price.toLocaleString()} on the offer.`,
        category: 'negotiation',
        relatedId: cardId,
        actor: 'buyer',
        status: 'countered',
      });
    }

    setSessions((prev) => ({ ...prev, [cardId]: nextSession }));

    // Sync state back to Notification Context
    let updatedOrders = [...orders];
    let updatedOffers = [...offers];

    if (offer) {
      updatedOffers = offers.map(o => o.id === offer.id ? { ...o, status: action === 'decline' ? 'declined' : action === 'accept' ? 'accepted' : 'received' } : o);
      
      if (order) {
        updatedOrders = orders.map(o => o.id === order.id ? { ...o, status: action === 'decline' ? 'declined' : action === 'accept' ? 'accepted' : 'countered' } : o);

        if (action === 'counter') {
          // Create new Order of type counter for the seller to see
          const newOrder = {
            id: `order-${Date.now()}`,
            type: 'counter' as const,
            cardId: cardId,
            buyerId: 'buyer-001',
            buyerName: order.buyerName,
            sellerName: order.sellerName,
            productPriceRaw: order.productPriceRaw,
            offeredPrice: price,
            description: `Counter to seller offer`,
            status: 'pending' as const,
            createdAt: new Date().toISOString(),
          };
          updatedOrders.push(newOrder);
        }
      }
    }

    updateOrders(updatedOrders);
    updateOffers(updatedOffers);

    return nextSession;
  };

  const finalizeNegotiation = (cardId: string) => {
    const existing = sessions[cardId];
    if (!existing) return null;
    const now = Date.now();

    const nextSession = buildSession({
      ...existing,
      status: 'finalized',
      pendingFor: null,
      lastActor: 'buyer',
      lastActionLabel: 'Payment completed',
      updatedAt: new Date(now).toISOString(),
    });

    setSessions((prev) => ({ ...prev, [cardId]: nextSession }));

    pushNotification({
      title: 'Payment completed',
      message: `Payment of ${existing.currentValue.toLocaleString()} has been completed for card ${cardId}.`,
      category: 'order',
      relatedId: cardId,
      actor: 'buyer',
      status: 'accepted',
    });

    // Update corresponding order/offer in notification context
    const latestOrder = [...orders].reverse().find(o => o.cardId === cardId);
    let updatedOrders = [...orders];
    let updatedOffers = [...offers];

    if (latestOrder) {
      updatedOrders = orders.map(o => o.id === latestOrder.id ? { ...o, status: 'completed' as const } : o);
      
      const latestOffer = [...offers].reverse().find(o => o.orderId === latestOrder.id);
      if (latestOffer) {
        updatedOffers = offers.map(o => o.id === latestOffer.id ? { ...o, status: 'completed' as const } : o);
      }
    }

    updateOrders(updatedOrders);
    updateOffers(updatedOffers);

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
        finalizeNegotiation,
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
