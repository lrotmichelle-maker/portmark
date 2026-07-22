'use client';

import React, { useState } from 'react';
import BuyerCard from '@/components/buyer-card';
import type { BuyerCardData } from '@/types';
import { ShoppingCart } from 'lucide-react';

const fallbackCartItems: BuyerCardData[] = [
  {
    id: 'cart-1',
    title: 'Market purchase',
    sellerName: 'Live seller',
    sellerUsername: 'liveseller',
    description: 'Your latest market selection from the database.',
    handle: '@liveseller',
    followers: 1200,
    likes: 4200,
    erCurrentRatio: 0,
    erPreviousRatio: 0,
    vlCurrentRatio: 0,
    vlPreviousRatio: 0,
    value: 120,
    productPrice: 120,
    buyerOriginalOffer: 100,
    sellerCounterOffer: 120,
    isCountered: false,
    customStatus: 'Live',
  },
];

export default function CartPage() {
  const [cartItems] = useState<BuyerCardData[]>(fallbackCartItems);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="border-b bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-8 h-8 text-neutral-900 dark:text-white" />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Your Cart
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Items you've purchased or made counter offers on. Track seller responses here.
          </p>
        </div>
      </section>

      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2">
                Your cart is empty
              </h2>
              <p className="text-muted-foreground mb-8">
                Start shopping by visiting the market
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cartItems.map((item) => (
                <div key={item.id} className="h-fit">
                  <BuyerCard data={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
