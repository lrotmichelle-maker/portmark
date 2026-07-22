import type { MarketCardData } from '@/types';
import { query } from './db';

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toString(value: unknown, fallback = 'Seller') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function mapMarketRow(row: Record<string, unknown>): MarketCardData {
  return {
    id: toString(row.id ?? row.market_id ?? row.listing_id, 'market-1'),
    sellerName: toString(row.seller_name ?? row.sellerName ?? row.seller ?? 'Seller', 'Seller'),
    sellerUsername: toString(row.seller_username ?? row.sellerUsername ?? row.handle ?? 'seller', 'seller'),
    description: toString(row.description ?? row.summary ?? row.title ?? 'Live market listing', 'Live market listing'),
    handle: toString(row.handle ?? row.seller_username ?? row.sellerUsername ?? '@seller', '@seller'),
    followers: toNumber(row.followers ?? row.follower_count, 3000),
    likes: toNumber(row.likes ?? row.like_count, 12000),
    erCurrentRatio: toNumber(row.er_current_ratio ?? row.erCurrentRatio, 0),
    erPreviousRatio: toNumber(row.er_previous_ratio ?? row.erPreviousRatio, 0),
    vlCurrentRatio: toNumber(row.vl_current_ratio ?? row.vlCurrentRatio, 0),
    vlPreviousRatio: toNumber(row.vl_previous_ratio ?? row.vlPreviousRatio, 0),
    sellerAvatar: typeof row.seller_avatar === 'string' ? row.seller_avatar : undefined,
    productPriceRaw: toNumber(row.product_price_raw ?? row.productPriceRaw ?? row.price ?? row.product_price, 500),
    valueRaw: toNumber(row.value_raw ?? row.valueRaw ?? row.value ?? row.amount, 500),
    sellerBuys: toNumber(row.seller_buys ?? row.sellerBuys, 18),
    sellerSells: toNumber(row.seller_sells ?? row.sellerSells, 12),
    sellerStars: toNumber(row.seller_stars ?? row.sellerStars, 4.8),
    isAdminVerified: Boolean(row.is_admin_verified ?? row.isAdminVerified ?? true),
    createdAt: toString(row.created_at ?? row.createdAt ?? new Date().toISOString(), new Date().toISOString()),
    offersCount: toNumber(row.offers_count ?? row.offersCount, 4),
  };
}

export async function getMarketCards(): Promise<MarketCardData[]> {
  const tables = ['market_listings', 'market_cards', 'market_items', 'listings'];

  for (const table of tables) {
    try {
      const rows = await query<Record<string, unknown>>(`SELECT * FROM ${table} ORDER BY created_at DESC LIMIT 12`);
      return rows.map(mapMarketRow);
    } catch (error) {
      console.warn(`Unable to query ${table}`, error);
    }
  }

  return [];
}
