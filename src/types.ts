export type OrderStatus = 'pending' | 'accepted' | 'countered';
export type OfferType = 'accept' | 'counter';
export type OfferStatus = 'sent' | 'received' | 'accepted' | 'rejected';

export interface Order {
  id: string;
  type: 'buy' | 'counter';
  cardId?: string;
  buyerId?: string;
  buyerName: string;
  sellerName?: string;
  productPriceRaw: number;
  offeredPrice?: number;
  description?: string;
  status: OrderStatus;
  createdAt: string;
}

export interface Offer {
  id: string;
  orderId: string;
  type: OfferType;
  responsePrice?: number;
  createdAt: string;
  status: OfferStatus;
  fromSeller: boolean;
  sellerName: string;
  buyerName: string;
}

export interface BuyerCardData {
  id: string;
  title: string;
  description: string;
  handle: string;
  followers: string;
  value: string;
  sellerName: string;
  sellerUsername: string;
  productPrice: string;
  buyerOriginalOffer: string;
  sellerCounterOffer: string;
  isCountered: boolean;
  erCurrentRatio: number;
  erPreviousRatio: number;
  vlCurrentRatio: number;
  vlPreviousRatio: number;
  likes: string;
  sentimentRate?: number;
  customStatus?: string;
}

export interface SalesCardData {
  id: string;
  sellerName: string;
  sellerUsername: string;
  sellerAvatar?: string;
  productPriceRaw: number;
  description: string;
  handle: string;
  followers: string;
  valueRaw: number;
  erCurrentRatio: number;
  erPreviousRatio: number;
  likes: string;
  vlCurrentRatio: number;
  vlPreviousRatio: number;
  sentimentRate: number;
  sellerBuys: number;
  sellerSells: number;
  sellerStars: number;
  isAdminVerified: boolean;
  createdAt: string;
  offersCount: number;
}
