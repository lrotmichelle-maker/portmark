import type { Offer, Order } from '@/types';
import { query } from './db';

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function mapOrderRow(row: Record<string, unknown>): Order {
  return {
    id: toString(row.id ?? row.order_id ?? row.orderId, 'order-1'),
    type: (row.type as Order['type']) ?? 'buy',
    cardId: toString(row.card_id ?? row.cardId, undefined),
    buyerId: toString(row.buyer_id ?? row.buyerId, undefined),
    buyerName: toString(row.buyer_name ?? row.buyerName ?? 'Buyer', 'Buyer'),
    sellerName: toString(row.seller_name ?? row.sellerName, undefined),
    productPriceRaw: toNumber(row.product_price_raw ?? row.productPriceRaw ?? row.price ?? row.product_price, 500),
    offeredPrice: row.offered_price || row.offeredPrice ? toNumber(row.offered_price ?? row.offeredPrice, 0) : undefined,
    description: toString(row.description ?? row.summary, undefined),
    status: (row.status as Order['status']) ?? 'pending',
    createdAt: toString(row.created_at ?? row.createdAt ?? new Date().toISOString(), new Date().toISOString()),
    followers: row.followers ? toNumber(row.followers, 3000) : undefined,
    likes: row.likes ? toNumber(row.likes, 12000) : undefined,
    erCurrentRatio: row.er_current_ratio ? toNumber(row.er_current_ratio, 0) : undefined,
    erPreviousRatio: row.er_previous_ratio ? toNumber(row.er_previous_ratio, 0) : undefined,
    vlCurrentRatio: row.vl_current_ratio ? toNumber(row.vl_current_ratio, 0) : undefined,
    vlPreviousRatio: row.vl_previous_ratio ? toNumber(row.vl_previous_ratio, 0) : undefined,
    value: row.value ? toNumber(row.value, 40) : undefined,
  };
}

function mapOfferRow(row: Record<string, unknown>): Offer {
  return {
    id: toString(row.id ?? row.offer_id ?? row.offerId, 'offer-1'),
    orderId: toString(row.order_id ?? row.orderId, 'order-1'),
    type: (row.type as Offer['type']) ?? 'counter',
    responsePrice: row.response_price || row.responsePrice ? toNumber(row.response_price ?? row.responsePrice, 0) : undefined,
    createdAt: toString(row.created_at ?? row.createdAt ?? new Date().toISOString(), new Date().toISOString()),
    status: (row.status as Offer['status']) ?? 'sent',
    fromSeller: Boolean(row.from_seller ?? row.fromSeller ?? false),
    sellerName: toString(row.seller_name ?? row.sellerName ?? 'Seller', 'Seller'),
    buyerName: toString(row.buyer_name ?? row.buyerName ?? 'Buyer', 'Buyer'),
    description: toString(row.description ?? row.summary, undefined),
    followers: row.followers ? toNumber(row.followers, 3000) : undefined,
    likes: row.likes ? toNumber(row.likes, 12000) : undefined,
    erCurrentRatio: row.er_current_ratio ? toNumber(row.er_current_ratio, 0) : undefined,
    erPreviousRatio: row.er_previous_ratio ? toNumber(row.er_previous_ratio, 0) : undefined,
    vlCurrentRatio: row.vl_current_ratio ? toNumber(row.vl_current_ratio, 0) : undefined,
    vlPreviousRatio: row.vl_previous_ratio ? toNumber(row.vl_previous_ratio, 0) : undefined,
    value: row.value ? toNumber(row.value, 40) : undefined,
  };
}

export async function getNegotiationData() {
  const tables = ['orders', 'offers', 'negotiations'];

  for (const table of tables) {
    try {
      const rows = await query<Record<string, unknown>>(`SELECT * FROM ${table} ORDER BY created_at DESC LIMIT 20`);
      const orders = rows.filter((row) => Object.prototype.hasOwnProperty.call(row, 'buyer_name') || Object.prototype.hasOwnProperty.call(row, 'seller_name') || Object.prototype.hasOwnProperty.call(row, 'product_price_raw')).map(mapOrderRow);
      const offers = rows.filter((row) => Object.prototype.hasOwnProperty.call(row, 'order_id') || Object.prototype.hasOwnProperty.call(row, 'from_seller')).map(mapOfferRow);
      return { orders, offers };
    } catch (error) {
      console.warn(`Unable to query ${table}`, error);
    }
  }

  return { orders: [] as Order[], offers: [] as Offer[] };
}
