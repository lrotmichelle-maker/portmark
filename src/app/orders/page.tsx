'use client';

import React, { useState, useEffect } from 'react';
import type { Order, Offer } from '@/types';
import OrderCard from '@/components/order-card';
import { addNotification, createNotification, getUnreadNotificationCount, markAllNotificationsRead, type AppNotification } from '@/lib/notifications';
import { createNegotiationEvent, type NegotiationEvent } from '@/lib/negotiation';
import { useNegotiationContext } from '@/context/NegotiationContext';

type OrderAction = 'decline' | 'counter' | 'accept' | null;

const SELLER_NAME = 'You';

function generateOfferId() {
  return `offer-${Date.now()}`;
}

export default function OrdersPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [orderActions, setOrderActions] = useState<Record<string, OrderAction>>({});
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [negotiations, setNegotiations] = useState<NegotiationEvent[]>([]);
  const { sessions, notificationCount, markAllNotificationsRead: markAllRead, getSessionLabel } = useNegotiationContext();

  const handleOrderAction = (orderId: string, action: OrderAction) => {
    setOrderActions((prev) => ({ ...prev, [orderId]: action }));
  };

  const handleSellerAccept = (orderId: string, price: number) => {
    setAllOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, offeredPrice: price, status: 'accepted' }
          : order
      )
    );

    setNotifications((prev) => addNotification(prev, createNotification({
      title: 'Order accepted',
      message: `You accepted the order and locked in a value of ${price.toLocaleString()} for ${orderId}.`,
      category: 'order',
      relatedId: orderId,
      actor: 'seller',
      status: 'accepted',
    })));
  };

  const handleSellerCounter = (orderId: string, price: number) => {
    setAllOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, offeredPrice: price, status: 'countered' }
          : order
      )
    );

    setNegotiations((prev) => [
      ...prev,
      createNegotiationEvent(orderId, 'seller', price, 'Seller sent a counter offer.'),
    ]);

    setNotifications((prev) => addNotification(prev, createNotification({
      title: 'Counter offer sent',
      message: `You sent a counter offer of ${price.toLocaleString()} for ${orderId}.`,
      category: 'negotiation',
      relatedId: orderId,
      actor: 'seller',
      status: 'countered',
    })));
  };

  useEffect(() => {
    const loadNegotiations = async () => {
      try {
        const response = await fetch('/api/negotiations');
        if (!response.ok) throw new Error('Request failed');
        const data = await response.json() as { orders: Order[]; offers: Offer[] };
        if (data.orders?.length) setAllOrders(data.orders);
        if (data.offers?.length) setAllOffers(data.offers);
      } catch (error) {
        console.error('Failed to load negotiation data from database', error);
      }
    };

    const stored = localStorage.getItem('orders');
    if (stored) {
      try {
        const parsedOrders = JSON.parse(stored);
        if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
          setTimeout(() => setAllOrders(parsedOrders), 0);
        }
      } catch (e) {
        console.error('Failed to parse orders from localStorage', e);
      }
    }
    const storedOffers = localStorage.getItem('offers');
    if (storedOffers) {
      try {
        const parsedOffers = JSON.parse(storedOffers);
        if (Array.isArray(parsedOffers) && parsedOffers.length > 0) {
          setAllOffers(parsedOffers);
        }
      } catch (e) {
        console.error('Failed to parse offers from localStorage', e);
      }
    }

    loadNegotiations();

    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      try {
        setNotifications(JSON.parse(storedNotifications));
      } catch (e) {
        console.error('Failed to parse notifications', e);
      }
    }

    const storedNegotiations = localStorage.getItem('negotiations');
    if (storedNegotiations) {
      try {
        setNegotiations(JSON.parse(storedNegotiations));
      } catch (e) {
        console.error('Failed to parse negotiations', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('negotiations', JSON.stringify(negotiations));
  }, [negotiations]);

  return (
    <div className="py-10 px-4 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Orders</h1>
        <div className="flex items-center gap-3 rounded-full border border-neutral-800 bg-neutral-950/70 px-3 py-2 text-sm text-zinc-300">
          <span>{getUnreadNotificationCount(notifications)} new updates</span>
          <button
            type="button"
            onClick={() => setNotifications((prev) => markAllNotificationsRead(prev))}
            className="rounded-full border border-neutral-700 px-2 py-1 text-xs uppercase tracking-[0.2em] text-zinc-400"
          >
            Mark all read
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Negotiation manager</p>
            <p className="text-sm text-zinc-400">Each order card has its own negotiation session and status label from the buyer action flow.</p>
          </div>
          <div className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
            {Object.keys(sessions).length} sessions
          </div>
        </div>
      </div>

      {allOrders.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <p>No orders yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allOrders.map((order) => {
            const currentAction = orderActions[order.id];

            return (
              <OrderCard
                key={order.id}
                data={{
                  id: order.id,
                  buyerName: order.buyerName,
                  buyerUsername: order.sellerName?.toLowerCase().replace(/\s+/g, ''),
                  type: order.type,
                  offeredPrice: order.offeredPrice,
                  originalPrice: order.productPriceRaw,
                  description: order.description,
                  handle: order.handle ?? `@${(order.sellerName || order.buyerName).toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}`,
                  hashtags: order.hashtags,
                  status: order.status,
                  createdAt: order.createdAt,
                  followers: Math.max(order.followers ?? 3000, 3000),
                  likes: Math.max(order.likes ?? 12000, 12000),
                  erCurrentRatio: order.erCurrentRatio ?? 0,
                  erPreviousRatio: order.erPreviousRatio ?? 0,
                  vlCurrentRatio: order.vlCurrentRatio ?? 0,
                  vlPreviousRatio: order.vlPreviousRatio ?? 0,
                  value: Math.max(order.value ?? 40, 40),
                  productPrice: order.productPriceRaw,
                }}
                onAccept={(price) => {
                  handleSellerAccept(order.id, price);
                  handleOrderAction(order.id, null);
                }}
                onCounter={(price) => {
                  handleSellerCounter(order.id, price);
                  handleOrderAction(order.id, null);
                }}
                onCounterToggle={() => handleOrderAction(order.id, currentAction === 'counter' ? null : 'counter')}
                onDecline={() => handleOrderAction(order.id, null)}
                activeAction={currentAction}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}