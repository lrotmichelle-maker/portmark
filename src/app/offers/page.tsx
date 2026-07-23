'use client';

import React, { useState } from 'react';
// Removed unused/incorrect import
import { recordOfficeEvent } from '@/lib/office-history';
import OfferCard from '@/components/offer-card';
import { getUnreadNotificationCount } from '@/lib/notifications';
import { useNegotiationContext } from '@/context/NegotiationContext';
import { useNotification } from '@/hooks/useNotification';

export default function OffersPage() {
  const [offerActions, setOfferActions] = useState<Record<string, 'view' | 'counter' | null>>({});
  
  const {
    sessions,
    notifications,
    events: negotiations,
    buyerRespondToOffer,
    finalizeNegotiation,
    markAllNotificationsRead: markAllRead,
  } = useNegotiationContext();

  const { orders: allOrders, offers: allOffers } = useNotification();

  const handleOfferAction = (id: string, action: 'view' | 'counter' | null) => {
    setOfferActions((prev) => ({ ...prev, [id]: action }));
  };

  const handleBuyerAcceptOffer = (cardId: string) => {
    buyerRespondToOffer(cardId, 'accept');
    recordOfficeEvent({ type: 'offer', title: 'Offer accepted', description: 'You accepted a seller offer.', status: 'accepted' });
    handleOfferAction(cardId, null);
  };

  const handleBuyerCounterOffer = (cardId: string, counterPrice: number) => {
    buyerRespondToOffer(cardId, 'counter', counterPrice);
    recordOfficeEvent({ type: 'offer', title: 'Offer countered', description: `You countered a seller offer with $${counterPrice}.`, status: 'pending' });
    handleOfferAction(cardId, null);
  };

  const handleBuyerDeclineOffer = (cardId: string) => {
    buyerRespondToOffer(cardId, 'decline');
    recordOfficeEvent({ type: 'offer', title: 'Offer declined', description: 'You declined a seller offer.', status: 'rejected' });
    handleOfferAction(cardId, null);
  };

  // Map active sessions to OfferCardData
  const activeOffersList = Object.entries(sessions)
    .filter(([_, session]) => session.status !== 'idle')
    .map(([cardId, session]) => {
      // Find the latest order and offer for this card to get details
      const cardOrders = allOrders.filter((o) => o.cardId === cardId);
      const latestOrder = cardOrders[cardOrders.length - 1];

      const latestOffer = allOffers
        .filter((o) => {
          const ord = allOrders.find((ord) => ord.id === o.orderId);
          return ord?.cardId === cardId;
        })
        .pop();

      const sellerName = latestOrder?.sellerName || latestOffer?.sellerName || 'Seller';

      return {
        cardId,
        session,
        latestOrder,
        latestOffer,
        sellerName,
      };
    });

  return (
    <div className="py-10 px-4 max-w-6xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Offers</h1>
        <div className="flex items-center gap-3 rounded-full border border-neutral-800 bg-neutral-950/70 px-3 py-2 text-sm text-zinc-300">
          <span>{getUnreadNotificationCount(notifications)} new updates</span>
          <button
            type="button"
            onClick={() => markAllRead()}
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

      {activeOffersList.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <p>No new offers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeOffersList.map(({ cardId, session, latestOrder, latestOffer, sellerName }) => {
            const isInactive = ['passed', 'declined', 'timed-out', 'finalized'].includes(session.status);

            return (
              <OfferCard
                key={cardId}
                session={session}
                data={{
                  id: cardId,
                  sellerName: sellerName,
                  sellerUsername: sellerName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, ''),
                  type: latestOffer?.type || (latestOrder?.type === 'buy' ? 'accept' : 'counter'),
                  responsePrice: latestOffer?.responsePrice || latestOrder?.offeredPrice || session.currentValue,
                  originalPrice: latestOrder?.productPriceRaw || session.productPrice,
                  originalOfferType: latestOrder?.type,
                  yourOffer: latestOrder?.offeredPrice,
                  receivedAt: latestOffer?.createdAt || latestOrder?.createdAt || session.createdAt,
                  handle: latestOrder?.handle ?? latestOffer?.handle ?? `@${sellerName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}`,
                  hashtags: latestOrder?.hashtags ?? latestOffer?.hashtags,
                  followers: latestOrder?.followers ?? latestOffer?.followers ?? 3000,
                  likes: latestOrder?.likes ?? latestOffer?.likes ?? 12000,
                  erCurrentRatio: latestOrder?.erCurrentRatio ?? latestOffer?.erCurrentRatio ?? 0,
                  erPreviousRatio: latestOrder?.erPreviousRatio ?? latestOffer?.erPreviousRatio ?? 0,
                  vlCurrentRatio: latestOrder?.vlCurrentRatio ?? latestOffer?.vlCurrentRatio ?? 0,
                  vlPreviousRatio: latestOrder?.vlPreviousRatio ?? latestOffer?.vlPreviousRatio ?? 0,
                  value: latestOrder?.value ?? latestOffer?.value ?? 40,
                  productPrice: latestOrder?.productPriceRaw || session.productPrice,
                  customStatus: session.status,
                  isInactive,
                }}
                onAccept={() => handleBuyerAcceptOffer(cardId)}
                onCounter={(price) => {
                  handleBuyerCounterOffer(cardId, price);
                }}
                onDecline={() => handleBuyerDeclineOffer(cardId)}
                onFinalize={() => finalizeNegotiation(cardId)}
                activeAction={offerActions[cardId]}
                onCounterToggle={() => handleOfferAction(cardId, offerActions[cardId] === 'counter' ? null : 'counter')}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}


