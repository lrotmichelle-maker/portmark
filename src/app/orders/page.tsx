'use client';

import React, { useState, useEffect } from 'react';
import type { Order, Offer } from '@/types';
import OrderCard from '@/components/order-card';
import { getUnreadNotificationCount, markAllNotificationsRead, type AppNotification } from '@/lib/notifications';
import { type NegotiationEvent } from '@/lib/negotiation';
import { useNegotiationContext } from '@/context/NegotiationContext';
import { useNotification } from '@/hooks/useNotification';

type OrderAction = 'decline' | 'counter' | 'accept' | null;

export default function OrdersPage() {
  const { orders } = useNotification();
  const [orderActions, setOrderActions] = useState<Record<string, OrderAction>>({});
  const { sessions, sellerRespondToOrder } = useNegotiationContext();

  const handleOrderAction = (orderId: string, action: OrderAction) => {
    setOrderActions((prev) => ({ ...prev, [orderId]: action }));
  };

  // Group by cardId to only show the latest order state per card
  const uniqueOrdersMap: Record<string, Order> = {};
  [...orders]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .forEach((order) => {
      if (order.cardId) {
        uniqueOrdersMap[order.cardId] = order;
      }
    });
  const uniqueOrdersList = Object.values(uniqueOrdersMap).reverse();

  return (
    <div className="py-10 px-4 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Orders</h1>
        <div className="flex items-center gap-3 rounded-full border border-neutral-800 bg-neutral-950/70 px-3 py-2 text-sm text-zinc-300">
          <span>Seller Account Portal</span>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Negotiation manager</p>
            <p className="text-sm text-zinc-400">Each order card has its own negotiation session and status label from the buyer action flow.</p>
          </div>
          <div className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
            {Object.keys(sessions).length} active sessions
          </div>
        </div>
      </div>

      {uniqueOrdersList.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <p>No orders yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {uniqueOrdersList.map((order) => {
            const currentAction = orderActions[order.id];
            const session = order.cardId ? sessions[order.cardId] : undefined;
            const currentStatus = session?.status ?? order.status;

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
                  status: currentStatus as any,
                  customStatus: session ? session.status : undefined,
                  createdAt: order.createdAt,
                  followers: Math.max(order.followers ?? 3000, 3000),
                  likes: Math.max(order.likes ?? 12000, 12000),
                  erCurrentRatio: order.erCurrentRatio ?? 0,
                  erPreviousRatio: order.erPreviousRatio ?? 0,
                  vlCurrentRatio: order.vlCurrentRatio ?? 0,
                  vlPreviousRatio: order.vlPreviousRatio ?? 0,
                  value: Math.max(order.value ?? 40, 40),
                  productPrice: order.productPriceRaw,
                  isInactive: session ? ['passed', 'declined', 'timed-out'].includes(session.status) : false,
                }}
                onAccept={(price) => {
                  sellerRespondToOrder(order.id, 'accept');
                  handleOrderAction(order.id, null);
                }}
                onCounter={(price) => {
                  sellerRespondToOrder(order.id, 'counter', price);
                  handleOrderAction(order.id, null);
                }}
                onCounterToggle={() => handleOrderAction(order.id, currentAction === 'counter' ? null : 'counter')}
                onDecline={() => {
                  sellerRespondToOrder(order.id, 'decline');
                  handleOrderAction(order.id, null);
                }}
                activeAction={currentAction}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}