'use client';

import { useNotification } from './useNotification';
import type { Order, Offer } from '@/types';

export function useNegotiationManager() {
  const { orders, offers, updateOrders, updateOffers } = useNotification();

  const buyerCreateOrder = (
    cardId: string,
    type: 'buy' | 'counter',
    price: number,
    sellerName: string,
    description: string,
    handle: string,
    hashtags: string[] = [],
    followers: number = 3000,
    likes: number = 12000,
    erCurrentRatio: number = 0,
    erPreviousRatio: number = 0,
    vlCurrentRatio: number = 0,
    vlPreviousRatio: number = 0,
    value: number = 40
  ) => {
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      type,
      cardId,
      buyerId: 'buyer-001',
      buyerName: 'You',
      sellerName,
      productPriceRaw: price,
      offeredPrice: type === 'counter' ? price : undefined,
      description,
      handle,
      hashtags,
      status: 'pending',
      createdAt: new Date().toISOString(),
      followers,
      likes,
      erCurrentRatio,
      erPreviousRatio,
      vlCurrentRatio,
      vlPreviousRatio,
      value,
    };
    updateOrders([...orders, newOrder]);
  };

  const sellerAcceptOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // Update order status to accepted
    const updatedOrders = orders.map((o) =>
      o.id === orderId ? { ...o, status: 'accepted' as const } : o
    );
    updateOrders(updatedOrders);

    // Create a new offer from seller to buyer
    const newOffer: Offer = {
      id: `offer-${Date.now()}`,
      orderId,
      type: 'accept',
      createdAt: new Date().toISOString(),
      status: 'sent',
      fromSeller: true,
      sellerName: order.sellerName || 'You',
      buyerName: order.buyerName,
      description: order.description,
      handle: order.handle,
      hashtags: order.hashtags,
      followers: order.followers,
      likes: order.likes,
      erCurrentRatio: order.erCurrentRatio,
      erPreviousRatio: order.erPreviousRatio,
      vlCurrentRatio: order.vlCurrentRatio,
      vlPreviousRatio: order.vlPreviousRatio,
      value: order.value,
    };
    updateOffers([...offers, newOffer]);
  };

  const sellerCounterOrder = (orderId: string, counterPrice: number) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // Update order status to countered
    const updatedOrders = orders.map((o) =>
      o.id === orderId ? { ...o, status: 'countered' as const, offeredPrice: counterPrice } : o
    );
    updateOrders(updatedOrders);

    // Create a counter offer from seller to buyer
    const newOffer: Offer = {
      id: `offer-${Date.now()}`,
      orderId,
      type: 'counter',
      responsePrice: counterPrice,
      createdAt: new Date().toISOString(),
      status: 'sent',
      fromSeller: true,
      sellerName: order.sellerName || 'You',
      buyerName: order.buyerName,
      description: order.description,
      handle: order.handle,
      hashtags: order.hashtags,
      followers: order.followers,
      likes: order.likes,
      erCurrentRatio: order.erCurrentRatio,
      erPreviousRatio: order.erPreviousRatio,
      vlCurrentRatio: order.vlCurrentRatio,
      vlPreviousRatio: order.vlPreviousRatio,
      value: order.value,
    };
    updateOffers([...offers, newOffer]);
  };

  const sellerDeclineOrder = (orderId: string) => {
    const updatedOrders = orders.map((o) =>
      o.id === orderId ? { ...o, status: 'declined' as const } : o
    );
    updateOrders(updatedOrders);
  };

  const buyerAcceptOffer = (offerId: string) => {
    const offer = offers.find((o) => o.id === offerId);
    if (!offer) return;

    // Update offer status to accepted
    const updatedOffers = offers.map((o) =>
      o.id === offerId ? { ...o, status: 'accepted' as const } : o
    );
    updateOffers(updatedOffers);

    // Update the corresponding order status to accepted
    const updatedOrders = orders.map((o) =>
      o.id === offer.orderId ? { ...o, status: 'accepted' as const } : o
    );
    updateOrders(updatedOrders);
  };

  const buyerCounterOffer = (offerId: string, counterPrice: number) => {
    const offer = offers.find((o) => o.id === offerId);
    if (!offer) return;

    // Mark the previous offer as countered/received
    const updatedOffers = offers.map((o) =>
      o.id === offerId ? { ...o, status: 'received' as const } : o
    );
    updateOffers(updatedOffers);

    // Get parent order's original price
    const parentOrder = orders.find((o) => o.id === offer.orderId);
    const productPrice = parentOrder?.productPriceRaw || 0;

    // Create a new counter order back to the seller
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      type: 'counter',
      cardId: parentOrder?.cardId || `card-${offer.orderId}`,
      buyerId: 'buyer-001',
      buyerName: 'You',
      sellerName: offer.sellerName,
      productPriceRaw: productPrice,
      offeredPrice: counterPrice,
      description: `Counter to seller offer`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      followers: offer.followers,
      likes: offer.likes,
      erCurrentRatio: offer.erCurrentRatio,
      erPreviousRatio: offer.erPreviousRatio,
      vlCurrentRatio: offer.vlCurrentRatio,
      vlPreviousRatio: offer.vlPreviousRatio,
      value: offer.value,
    };
    updateOrders([...orders, newOrder]);
  };

  const buyerDeclineOffer = (offerId: string) => {
    // Mark offer status to rejected
    const updatedOffers = offers.map((o) =>
      o.id === offerId ? { ...o, status: 'rejected' as const } : o
    );
    updateOffers(updatedOffers);
  };

  return {
    orders,
    offers,
    buyerCreateOrder,
    sellerAcceptOrder,
    sellerCounterOrder,
    sellerDeclineOrder,
    buyerAcceptOffer,
    buyerCounterOffer,
    buyerDeclineOffer,
  };
}
