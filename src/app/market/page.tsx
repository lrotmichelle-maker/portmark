'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { MarketCardData, Order } from '@/types';
import { recordOfficeEvent } from '@/lib/office-history';
import { useNegotiationContext } from '@/context/NegotiationContext';

const MarketCard = dynamic(() => import('@/components/market-card'), {
  ssr: false,
  loading: () => <div className="h-40 bg-neutral-900/20 rounded animate-pulse" />,
});

const BUYER_ID = 'buyer-001';
const BUYER_NAME = 'You';

function generateOrderId() {
  return `order-${Date.now()}`;
}

export default function MarketPage() {
  const [marketCards, setMarketCards] = useState<MarketCardData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const { startBuyerBuy, startBuyerCounter } = useNegotiationContext();

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/market');
        if (!response.ok) throw new Error('Request failed');
        const cards = (await response.json()) as MarketCardData[];
        setMarketCards(cards);
      } catch (error) {
        console.error('Failed to load market cards from database', error);
        setMarketCards([]);
      }
    };

    loadData();

    const stored = localStorage.getItem('orders');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTimeout(() => setOrders(parsed), 0);
      } catch (e) {
        console.error('Failed to parse orders from localStorage', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const visibleMarketCards = marketCards.filter((card) => (card.offersCount ?? 0) < 12);

  const handleBuy = (card: MarketCardData) => {
    const session = startBuyerBuy({
      id: card.id,
      itemType: 'market',
      productPrice: card.productPriceRaw,
      sellerName: card.sellerName,
      buyerName: BUYER_NAME,
      description: card.description,
    });

    if (!session) return;

    const newOrder: Order = {
      id: generateOrderId(),
      type: 'buy',
      cardId: card.id,
      buyerId: BUYER_ID,
      buyerName: BUYER_NAME,
      productPriceRaw: card.productPriceRaw,
      description: card.description,
      sellerName: card.sellerName,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setOrders((prev) => [...prev, newOrder]);
    recordOfficeEvent({ type: 'offer', title: 'Buy request sent', description: `Buyer initiated a purchase request for ${card.sellerName}.`, status: 'pending' });
  };

  const handleCounter = (card: MarketCardData, offeredPrice: number) => {
    const session = startBuyerCounter({
      id: card.id,
      itemType: 'market',
      productPrice: card.productPriceRaw,
      price: offeredPrice,
      sellerName: card.sellerName,
      buyerName: BUYER_NAME,
      description: card.description,
    });

    if (!session) return;

    const newOrder: Order = {
      id: generateOrderId(),
      type: 'counter',
      cardId: card.id,
      buyerId: BUYER_ID,
      buyerName: BUYER_NAME,
      productPriceRaw: card.productPriceRaw,
      offeredPrice,
      description: card.description,
      sellerName: card.sellerName,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setOrders((prev) => [...prev, newOrder]);
    recordOfficeEvent({ type: 'offer', title: 'Counter submitted', description: `Buyer submitted a counter offer for ${card.sellerName}.`, status: 'pending' });
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="border-b bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">
            Market
          </h1>
          <p className="text-lg text-muted-foreground">
            Browse available listings and make counter offers
          </p>
        </div>
      </section>

      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {visibleMarketCards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/70 p-8 text-center text-muted-foreground">
              No active market listings are available right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleMarketCards.map((card) => (
                  <div key={card.id} className="h-fit">
                    <MarketCard
                      cardData={card}
                      onBuyClick={() => handleBuy(card)}
                      onCounterSubmit={(price) => handleCounter(card, price)}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
