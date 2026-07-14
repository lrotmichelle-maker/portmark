'use client';

import React, { useState, useEffect } from 'react';
import type { Order, Offer } from '@/types';
import { Check, RefreshCw, X } from 'lucide-react';
import { recordOfficeEvent } from '@/lib/office-history';
import { generateMockOrders, generateMockOffers } from '@/lib/mocks';

type OrderAction = 'decline' | 'counter' | 'accept' | null;

const SELLER_NAME = 'You';

function generateOfferId() {
  return `offer-${Date.now()}`;
}

export default function OrdersPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [orderActions, setOrderActions] = useState<Record<string, OrderAction>>({});

  useEffect(() => {
    const stored = localStorage.getItem('orders');
    if (stored) {
      try {
        const parsedOrders = JSON.parse(stored);
        setTimeout(() => setAllOrders(parsedOrders), 0);
      } catch (e) {
        console.error('Failed to parse orders from localStorage', e);
        // Initialize with mock data on error
        const mockOrders = generateMockOrders();
        setAllOrders(mockOrders);
        localStorage.setItem('orders', JSON.stringify(mockOrders));
      }
    } else {
      // Initialize with mock data if empty
      const mockOrders = generateMockOrders();
      setAllOrders(mockOrders);
      localStorage.setItem('orders', JSON.stringify(mockOrders));
    }

    const offersStored = localStorage.getItem('offers');
    if (offersStored) {
      try {
        const parsedOffers = JSON.parse(offersStored);
        setTimeout(() => setAllOffers(parsedOffers), 0);
      } catch (e) {
        console.error('Failed to parse offers from localStorage', e);
        // Initialize with mock data on error
        const mockOffers = generateMockOffers();
        setAllOffers(mockOffers);
        localStorage.setItem('offers', JSON.stringify(mockOffers));
      }
    } else {
      // Initialize with mock data if empty
      const mockOffers = generateMockOffers();
      setAllOffers(mockOffers);
      localStorage.setItem('offers', JSON.stringify(mockOffers));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('offers', JSON.stringify(allOffers));
  }, [allOffers]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(allOrders));
  }, [allOrders]);

  const handleOrderAction = (id: string, action: OrderAction) => {
    setOrderActions((prev) => ({ ...prev, [id]: action }));
  };

  const handleSellerAccept = (orderId: string, _price: number) => {
    const newOffer: Offer = {
      id: generateOfferId(),
      orderId,
      type: 'accept',
      createdAt: new Date().toISOString(),
      status: 'sent',
      fromSeller: true,
      sellerName: SELLER_NAME,
      buyerName: 'Buyer',
    };
    setAllOffers((prev) => [...prev, newOffer]);
    setAllOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: 'accepted' } : order
      )
    );
  };

  const handleSellerCounter = (orderId: string, counterPrice: number) => {
    const newOffer: Offer = {
      id: generateOfferId(),
      orderId,
      type: 'counter',
      responsePrice: counterPrice,
      createdAt: new Date().toISOString(),
      status: 'sent',
      fromSeller: true,
      sellerName: SELLER_NAME,
      buyerName: 'Buyer',
    };
    setAllOffers((prev) => [...prev, newOffer]);
    setAllOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: 'countered' } : order
      )
    );
  };

  return (
    <div className="py-10 px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      {allOrders.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <p>No orders yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allOrders.map((order) => {
            const statusColor =
              order.status === 'pending'
                ? 'text-zinc-400'
                : order.status === 'accepted'
                ? 'text-emerald-500'
                : order.status === 'countered'
                ? 'text-amber-500'
                : 'text-zinc-400';
            const currentAction = orderActions[order.id];

            return (
              <div
                key={order.id}
                className="bg-black border border-neutral-800 rounded-2xl p-4 h-full flex flex-col"
              >
                {/* Header */}
                <div className="space-y-2 pb-4 border-b border-neutral-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-zinc-400">From</div>
                      <div className="font-semibold text-white">{order.buyerName}</div>
                    </div>
                    <div className={`text-xs font-mono uppercase ${statusColor}`}>
                      {order.status}
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="space-y-3 py-4 flex-1">
                  <div>
                    <div className="text-xs text-zinc-500 uppercase">Order Type</div>
                    <div className="text-sm text-white capitalize">{order.type}</div>
                  </div>

                  {order.type === 'counter' && order.offeredPrice !== undefined ? (
                    <div>
                      <div className="text-xs text-zinc-500 uppercase">Offered Price</div>
                      <div className="text-sm text-amber-400 font-semibold">
                        ${order.offeredPrice.toFixed(2)}
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <div className="text-xs text-zinc-500 uppercase">Original Price</div>
                    <div className="text-sm text-white">${order.productPriceRaw.toFixed(2)}</div>
                  </div>

                  {order.description ? (
                    <div>
                      <div className="text-xs text-zinc-500 uppercase">Message</div>
                      <div className="text-sm text-zinc-300">{order.description}</div>
                    </div>
                  ) : null}

                  <div>
                    <div className="text-xs text-zinc-500 uppercase">Received</div>
                    <div className="text-xs text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-4">
                  {order.status === 'pending' ? (
                    <SellerOrderActions
                      orderId={order.id}
                      originalPrice={order.productPriceRaw}
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
                  ) : (
                    <div className="text-center py-2 text-xs text-zinc-500 capitalize">
                      Order {order.status}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SellerOrderActions({
  orderId: _orderId,
  originalPrice,
  onAccept,
  onCounter,
  onCounterToggle,
  onDecline,
  activeAction,
}: {
  orderId: string;
  originalPrice: number;
  onAccept: (price: number) => void;
  onCounter: (price: number) => void;
  onCounterToggle: () => void;
  onDecline: () => void;
  activeAction: OrderAction;
}) {
  const [counterPrice, setCounterPrice] = useState<string>('');

  const getBtnClasses = (color: 'red' | 'amber' | 'emerald', isActive: boolean) => {
    const base =
      'group flex items-center justify-center gap-1 py-2 px-2 border rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 active:scale-[0.98] truncate';
    const themes = {
      red: 'bg-transparent text-red-500 border-red-900/40 hover:bg-red-600 hover:text-white hover:border-red-500 active:bg-red-600 active:text-white',
      amber:
        'bg-transparent text-amber-500 border-amber-900/40 hover:bg-amber-500 hover:text-white hover:border-amber-500 active:bg-amber-500 active:text-white',
      emerald:
        'bg-transparent text-emerald-400 border-emerald-900/40 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 active:bg-emerald-600 active:text-white',
    };
    const activeClass = isActive ? 'bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]' : '';
    return `${base} ${themes[color]} ${activeClass}`;
  };

  if (activeAction === 'counter') {
    return (
      <div className="space-y-2">
        <input
          type="number"
          placeholder="Counter price"
          value={counterPrice}
          onChange={(e) => setCounterPrice(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-sm text-white placeholder-zinc-500"
        />
        <div className="flex gap-2">
          <button
            onClick={() => {
              const price = parseFloat(counterPrice);
              if (!isNaN(price) && price > 0) {
                onCounter(price);
                setCounterPrice('');
              }
            }}
            className="flex-1 py-2 px-2 rounded bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white transition-colors text-xs font-bold"
          >
            Send Counter
          </button>
          <button
            onClick={() => {
              setCounterPrice('');
              onCounterToggle();
            }}
            className="py-2 px-2 rounded bg-neutral-900/60 hover:bg-neutral-800 text-zinc-400 transition-colors text-xs font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full select-none">
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onDecline}
          className={getBtnClasses('red', activeAction === 'decline')}
        >
          <X className="w-3 h-3 shrink-0 stroke-[3]" />
          Decline
        </button>

        <button
          type="button"
          onClick={onCounterToggle}
          className={getBtnClasses('amber', false)}
        >
          <RefreshCw className="w-3 h-3 shrink-0 stroke-[3]" />
          Counter
        </button>

        <button
          type="button"
          onClick={() => onAccept(originalPrice)}
          className={getBtnClasses('emerald', activeAction === 'accept')}
        >
          <Check className="w-3 h-3 shrink-0 stroke-[3]" />
          Accept
        </button>
      </div>
    </div>
  );
}
