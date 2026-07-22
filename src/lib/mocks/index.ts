// Central mock data index - import from here
export { generateMockOffers } from './offers';
export { generateMockOrders } from './orders';
export { generateFiveMockCards } from './market-data';
export type { MarketCardData } from '@/types';
export { generateMockData } from './buyer-card';

// Combined initialization
export function initializeMockData() {
  if (typeof window === 'undefined') return; // Server-side guard

  // Only initialize if localStorage is empty
  if (!localStorage.getItem('offers')) {
    const { generateMockOffers } = require('./offers');
    localStorage.setItem('offers', JSON.stringify(generateMockOffers()));
  }

  if (!localStorage.getItem('orders')) {
    const { generateMockOrders } = require('./orders');
    localStorage.setItem('orders', JSON.stringify(generateMockOrders()));
  }
}
