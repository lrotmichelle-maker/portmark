export interface DiscoverCardData {
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
