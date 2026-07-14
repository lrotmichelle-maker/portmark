'use client';

import React, { useState, useEffect } from 'react';
import type { Offer, Order } from '@/types';
import { Check, RefreshCw, X } from 'lucide-react';
import { recordOfficeEvent } from '@/lib/office-history';
import { generateMockOffers, generateMockOrders } from '@/lib/mocks';

type BuyerOfferAction = 'view' | 'counter' | null;

const BUYER_ID = 'buyer-001';
const BUYER_NAME = 'You';

export default function OffersPage() {
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [offerActions, setOfferActions] = useState<Record<string, BuyerOfferAction>>({});

  useEffect(() => {
    const offersStored = localStorage.getItem('offers');
    if (offersStored) {
      try {
        setAllOffers(JSON.parse(offersStored));
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

    const ordersStored = localStorage.getItem('orders');
    if (ordersStored) {
      try {
        setAllOrders(JSON.parse(ordersStored));
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
  }, []);

  useEffect(() => {
    localStorage.setItem('offers', JSON.stringify(allOffers));
  }, [allOffers]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(allOrders));
  }, [allOrders]);

  const handleOfferAction = (id: string, action: BuyerOfferAction) => {
    setOfferActions((prev) => ({ ...prev, [id]: action }));
  };

  const handleBuyerAcceptOffer = (offerId: string) => {
    const offer = allOffers.find((o) => o.id === offerId);
    const order = allOrders.find((o) => o.id === offer?.orderId);

    if (offer && order) {
      // Mark the offer as accepted
      setAllOffers((prev) =>
        prev.map((o) =>
          o.id === offerId ? { ...o, status: 'accepted' } : o
        )
      );
      // Mark the original order as accepted
      setAllOrders((prev) =>
        prev.map((o) =>
          o.id === offer.orderId ? { ...o, status: 'accepted' } : o
        )
      );
      recordOfficeEvent({ type: 'offer', title: 'Offer accepted', description: 'You accepted a seller offer and closed the order.', status: 'accepted' });
      handleOfferAction(offerId, null);
    }
  };

  const handleBuyerCounterOffer = (offerId: string, counterPrice: number) => {
    const offer = allOffers.find((o) => o.id === offerId);
    if (!offer) return;

    // Create new counter order back to the seller
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      type: 'counter',
      cardId: `card-${offer.orderId}`,
      buyerId: BUYER_ID,
      buyerName: BUYER_NAME,
      productPriceRaw: allOrders.find((o) => o.id === offer.orderId)?.productPriceRaw || 0,
      offeredPrice: counterPrice,
      description: `Counter to seller offer`,
      sellerName: offer.sellerName,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    setAllOrders((prev) => [...prev, newOrder]);
    recordOfficeEvent({ type: 'offer', title: 'Offer countered', description: 'You countered a seller offer and created a new order.', status: 'pending' });

    // Mark this offer as received (buyer countered rather than accepted)
    setAllOffers((prev) =>
      prev.map((o) =>
        o.id === offerId ? { ...o, status: 'received' } : o
      )
    );

    handleOfferAction(offerId, null);
  };

  const handleBuyerDeclineOffer = (offerId: string) => {
    setAllOffers((prev) =>
      prev.map((o) =>
        o.id === offerId ? { ...o, status: 'rejected' } : o
      )
    );
    recordOfficeEvent({ type: 'offer', title: 'Offer declined', description: 'You declined a seller offer.', status: 'rejected' });
    handleOfferAction(offerId, null);
  };

  // Filter offers from sellers (fromSeller: true) and not yet decided
  const buyerOffers = allOffers.filter((o) => o.fromSeller && o.status === 'sent');

  return (
    <div className="py-10 px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Offers</h1>

      {buyerOffers.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <p>No new offers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buyerOffers.map((offer) => {
            const originalOrder = allOrders.find((o) => o.id === offer.orderId);

            return (
              <div
                key={offer.id}
                className="bg-black border border-neutral-800 rounded-2xl p-4 h-full flex flex-col"
              >
                {/* Header */}
                <div className="space-y-2 pb-4 border-b border-neutral-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-zinc-400">From</div>
                      <div className="font-semibold text-white">{offer.sellerName}</div>
                    </div>
                    <div className="text-xs font-mono uppercase text-emerald-500">
                      Response
                    </div>
                  </div>
                </div>

                {/* Offer Details */}
                <div className="space-y-3 py-4 flex-1">
                  <div>
                    <div className="text-xs text-zinc-500 uppercase">Response Type</div>
                    <div className="text-sm text-white capitalize">{offer.type}</div>
                  </div>

                  {offer.type === 'counter' && offer.responsePrice !== undefined ? (
                    <div>
                      <div className="text-xs text-zinc-500 uppercase">Offered Price</div>
                      <div className="text-sm text-emerald-400 font-semibold">
                        ${offer.responsePrice.toFixed(2)}
                      </div>
                    </div>
                  ) : null}

                  {originalOrder && (
                    <>
                      <div>
                        <div className="text-xs text-zinc-500 uppercase">Your Original Offer</div>
                        <div className="text-sm text-white capitalize">{originalOrder.type}</div>
                      </div>

                      <div>
                        <div className="text-xs text-zinc-500 uppercase">Original Price</div>
                        <div className="text-sm text-white">${originalOrder.productPriceRaw.toFixed(2)}</div>
                      </div>

                      {originalOrder.offeredPrice !== undefined && (
                        <div>
                          <div className="text-xs text-zinc-500 uppercase">Your Offer</div>
                          <div className="text-sm text-amber-400">${originalOrder.offeredPrice.toFixed(2)}</div>
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <div className="text-xs text-zinc-500 uppercase">Received</div>
                    <div className="text-xs text-zinc-400">
                      {new Date(offer.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-4">
                  <BuyerOfferActions
                    offerId={offer.id}
                    offerType={offer.type}
                    responsePrice={offer.responsePrice}
                    onAccept={() => handleBuyerAcceptOffer(offer.id)}
                    onCounter={(price) => {
                      handleBuyerCounterOffer(offer.id, price);
                    }}
                    onDecline={() => handleBuyerDeclineOffer(offer.id)}
                    activeAction={offerActions[offer.id]}
                    onCounterToggle={() => handleOfferAction(offer.id, offerActions[offer.id] === 'counter' ? null : 'counter')}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BuyerOfferActions({
  offerId,
  offerType,
  responsePrice: _responsePrice,
  onAccept,
  onCounter,
  onDecline,
  activeAction,
  onCounterToggle,
}: {
  offerId: string;
  offerType: 'accept' | 'counter';
  responsePrice?: number;
  onAccept: () => void;
  onCounter: (price: number) => void;
  onDecline: () => void;
  activeAction: BuyerOfferAction;
  onCounterToggle: () => void;
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

  // For accept offers, just show Accept/Decline buttons
  if (offerType === 'accept') {
    return (
      <div className="w-full select-none">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onDecline}
            className={getBtnClasses('red', false)}
          >
            <X className="w-3 h-3 shrink-0 stroke-[3]" />
            Decline
          </button>

          <button
            type="button"
            onClick={onAccept}
            className={getBtnClasses('emerald', false)}
          >
            <Check className="w-3 h-3 shrink-0 stroke-[3]" />
            Accept
          </button>
        </div>
      </div>
    );
  }

  // For counter offers with counter input shown
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

  // For counter offers - show three buttons
  return (
    <div className="w-full select-none">
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onDecline}
          className={getBtnClasses('red', false)}
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
          onClick={onAccept}
          className={getBtnClasses('emerald', false)}
        >
          <Check className="w-3 h-3 shrink-0 stroke-[3]" />
          Accept
        </button>
      </div>
    </div>
  );
}
