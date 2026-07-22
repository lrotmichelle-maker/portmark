import type { BuyerCardData } from '@/types';

export function generateMockData(): BuyerCardData {
  return {
    id: 'buyer-1',
    title: 'Tech Startup',
    description: 'Looking to collaborate with tech influencers for product launch campaign.',
    handle: '@tech_startup_co',
    followers: 24000,
    value: 8500,
    sellerName: 'Tech Startup Co',
    sellerUsername: 'tech_startup_co',
    productPrice: 12500,
    buyerOriginalOffer: 10000,
    sellerCounterOffer: 11200,
    isCountered: true,
    erCurrentRatio: 7.3,
    erPreviousRatio: 6.8,
    vlCurrentRatio: 10.2,
    vlPreviousRatio: 9.7,
    likes: 18400,
    sentimentRate: 82,
  };
}
