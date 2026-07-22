'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import type { MarketCardData, Order } from '@/types';
import dynamic from 'next/dynamic';
import { recordOfficeEvent } from '@/lib/office-history';

const MarketCard = dynamic(() => import('@/components/market-card'), { ssr: false });

const BUYER_ID = 'buyer-001';
const BUYER_NAME = 'You';

function generateOrderId() {
  return `order-${Date.now()}`;
}

export default function OfficeMarketPage() {
  const [marketCards, setMarketCards] = useState<MarketCardData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

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
        setOrders(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load orders', error);
      }
    }
  }, []);

  const visibleMarketCards = marketCards.filter((card) => (card.offersCount ?? 0) < 12);

  const handleBuy = (card: MarketCardData) => {
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
    recordOfficeEvent({ type: 'market', title: 'Market order placed', description: `You placed an order for ${card.description}.`, status: 'submitted' });
  };

  const handleCounter = (card: MarketCardData, offeredPrice: number) => {
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
    recordOfficeEvent({ type: 'market', title: 'Counter offer sent', description: `You sent a counter offer for ${card.description}.`, status: 'pending' });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,_#09090b,_#111827)] px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 xl:flex-row">
        <aside className="xl:w-72">
          <div className="rounded-[28px] border border-zinc-800/80 bg-zinc-950/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-zinc-500">Office</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Market workspace</h1>
            <div className="mt-4 space-y-2">
              <Link href="/office" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">Overview</Link>
              <Link href="/office/discover" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">Discover</Link>
              <Link href="/office/campaign" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">Campaign</Link>
              <Link href="/office/market" className="flex items-center gap-2 text-sm text-emerald-400">Market</Link>
              <Link href="/office/cv" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">CV</Link>
              <Link href="/profile" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">Profile</Link>
            </div>
          </div>
        </aside>

        <section className="flex-1 space-y-4">
          <div className="rounded-[28px] border border-zinc-800/80 bg-zinc-950/80 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-2 text-emerald-400">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-zinc-500">Market</p>
                <h2 className="text-xl font-semibold text-white">Create a trade history from every action</h2>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
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
          <div className="rounded-[24px] border border-zinc-800/80 bg-zinc-950/80 p-4 text-sm text-zinc-400">
            {orders.length} active market actions tracked in your office history.
          </div>
        </section>
      </div>
    </main>
  );
}
