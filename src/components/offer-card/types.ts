export interface OfferCardData {
  id: string;
  // buyer-card like fields (for visual parity)
  sellerName: string;
  sellerUsername?: string;
  description?: string;
  handle?: string;
  hashtags?: string[];
  followers?: number;
  value?: number;
  productPrice?: number;
  buyerOriginalOffer?: number;
  sellerCounterOffer?: number;
  isCountered?: boolean;
  customStatus?: string;
  erCurrentRatio?: number;
  erPreviousRatio?: number;
  vlCurrentRatio?: number;
  vlPreviousRatio?: number;
  likes?: number;
  sentimentRate?: number;
  // offer specific fields
  type?: 'accept' | 'counter';
  responsePrice?: number;
  originalPrice?: number;
  originalOfferType?: string;
  yourOffer?: number;
  receivedAt?: string;
  status?: string;
  isInactive?: boolean;
}
