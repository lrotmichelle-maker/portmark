'use client';

import React, { useState, useEffect } from 'react';
import type { Offer, Order } from '@/types';
import { recordOfficeEvent } from '@/lib/office-history';
import OfferCard from '@/components/offer-card';
import { addNotification, createNotification, getUnreadNotificationCount, markAllNotificationsRead, type AppNotification } from '@/lib/notifications';
import { createNegotiationEvent, type NegotiationEvent } from '@/lib/negotiation';
import { useNegotiationContext } from '@/context/NegotiationContext';

type BuyerOfferAction = 'view' | 'counter' | null;

const BUYER_ID = 'buyer-001';
const BUYER_NAME = 'You';

export default function OffersPage() {
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [offerActions, setOfferActions] = useState<Record<string, BuyerOfferAction>>({});
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [negotiations, setNegotiations] = useState<NegotiationEvent[]>([]);
  const { startBuyerBuy, startBuyerCounter, notificationCount, markAllNotificationsRead: markAllRead, getSessionLabel } = useNegotiationContext();

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

    const offersStored = localStorage.getItem('offers');
    if (offersStored) {
      try {
        const parsedOffers = JSON.parse(offersStored);
        if (Array.isArray(parsedOffers) && parsedOffers.length > 0) {
          setAllOffers(parsedOffers);
        }
      } catch (e) {
        console.error('Failed to parse offers from localStorage', e);
      }
    }

    const ordersStored = localStorage.getItem('orders');
    if (ordersStored) {
      try {
        const parsedOrders = JSON.parse(ordersStored);
        if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
          setAllOrders(parsedOrders);
        }
      } catch (e) {
        console.error('Failed to parse orders from localStorage', e);
      }
    }

    loadNegotiations();
  }, []);

  useEffect(() => {
    localStorage.setItem('offers', JSON.stringify(allOffers));
  }, [allOffers]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(allOrders));
  }, [allOrders]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('negotiations', JSON.stringify(negotiations));
  }, [negotiations]);

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
      setNotifications((prev) => addNotification(prev, createNotification({
        title: 'Offer accepted',
        message: `You accepted a seller offer for ${order.id}.`,
        category: 'offer',
        relatedId: offerId,
        actor: 'buyer',
        status: 'accepted',
      })));
      setNegotiations((prev) => [
        ...prev,
        createNegotiationEvent(order.id, 'buyer', offer.responsePrice ?? order.productPriceRaw, 'Buyer accepted the seller offer.'),
      ]);
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
    setNotifications((prev) => addNotification(prev, createNotification({
      title: 'Offer countered',
      message: `You countered the seller offer with ${counterPrice.toLocaleString()}.`,
      category: 'negotiation',
      relatedId: newOrder.id,
      actor: 'buyer',
      status: 'countered',
    })));
    setNegotiations((prev) => [
      ...prev,
      createNegotiationEvent(newOrder.id, 'buyer', counterPrice, 'Buyer sent a counter proposal.'),
    ]);
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
    setNotifications((prev) => addNotification(prev, createNotification({
      title: 'Offer declined',
      message: 'You declined the seller offer and closed the conversation.',
      category: 'offer',
      relatedId: offerId,
      actor: 'buyer',
      status: 'rejected',
    })));
    recordOfficeEvent({ type: 'offer', title: 'Offer declined', description: 'You declined a seller offer.', status: 'rejected' });
    handleOfferAction(offerId, null);
  };

  // Filter offers from sellers (fromSeller: true) and not yet decided
  const buyerOffers = allOffers.filter((o) => o.fromSeller && o.status === 'sent');

  return (
    <div className="py-10 px-4 max-w-6xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Offers</h1>
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
            <p className="text-sm font-semibold text-white">Notification manager</p>
            <p className="text-sm text-zinc-400">Buyer and seller actions now update the shared notification stream and negotiation log.</p>
          </div>
          <div className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
            {negotiations.length} negotiation events
          </div>
        </div>
      </div>

      {buyerOffers.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <p>No new offers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buyerOffers.map((offer) => {
            const originalOrder = allOrders.find((o) => o.id === offer.orderId);

            return (
              <OfferCard
                key={offer.id}
                data={{
                  id: offer.id,
                  sellerName: offer.sellerName,
                  sellerUsername: offer.buyerName.toLowerCase().replace(/\s+/g, ''),
                  type: offer.type,
                  responsePrice: offer.responsePrice,
                  originalPrice: originalOrder?.productPriceRaw,
                  originalOfferType: originalOrder?.type,
                  yourOffer: originalOrder?.offeredPrice,
                  receivedAt: offer.createdAt,
                  handle: offer.handle ?? `@${(offer.sellerName || offer.buyerName).toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}`,
                  hashtags: offer.hashtags,
                  followers: Math.max(originalOrder?.followers ?? offer.followers ?? 3000, 3000),
                  likes: Math.max(originalOrder?.likes ?? offer.likes ?? 12000, 12000),
                  erCurrentRatio: originalOrder?.erCurrentRatio ?? offer.erCurrentRatio ?? 0,
                  erPreviousRatio: originalOrder?.erPreviousRatio ?? offer.erPreviousRatio ?? 0,
                  vlCurrentRatio: originalOrder?.vlCurrentRatio ?? offer.vlCurrentRatio ?? 0,
                  vlPreviousRatio: originalOrder?.vlPreviousRatio ?? offer.vlPreviousRatio ?? 0,
                  value: Math.max(originalOrder?.value ?? offer.value ?? 40, 40),
                  productPrice: originalOrder?.productPriceRaw,
                }}
                onAccept={() => handleBuyerAcceptOffer(offer.id)}
                onCounter={(price) => {
                  handleBuyerCounterOffer(offer.id, price);
                }}
                onDecline={() => handleBuyerDeclineOffer(offer.id)}
                activeAction={offerActions[offer.id]}
                onCounterToggle={() => handleOfferAction(offer.id, offerActions[offer.id] === 'counter' ? null : 'counter')}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

