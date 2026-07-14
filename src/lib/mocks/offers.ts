import type { Offer } from '@/types';

export function generateMockOffers(): Offer[] {
  const offers: Offer[] = [];
  
  const sellerNames = [
    'Sarah Johnson', 'Marcus Chen', 'Emma Studios', 'Alex Rodriguez',
    'Jordan Lee', 'Casey Martinez', 'Taylor Kim', 'Morgan Brown',
    'Riley Wilson', 'Cameron Davis', 'Blake Anderson', 'Dakota Taylor',
    'Phoenix White', 'Harper Young', 'Quinn Miller', 'Reese Harris'
  ];

  const buyerNames = [
    'Tech Startup Co', 'Digital Agency Pro', 'Brand Solutions LLC',
    'Marketing Collective', 'Social Media Co', 'Creative Studio',
    'Content Hub', 'Influencer Network', 'Campaign Partners',
    'Growth Marketing', 'Digital Ventures', 'Online Success'
  ];

  let offerId = 1;
  
  // Generate 100 offers with varied statuses and types
  for (let i = 0; i < 100; i++) {
    const statuses: Array<'sent' | 'received' | 'accepted' | 'rejected'> = ['sent', 'received', 'accepted', 'rejected'];
    const types: Array<'accept' | 'counter'> = ['accept', 'counter'];
    
    offers.push({
      id: `offer-${offerId++}`,
      orderId: `order-${Math.floor(Math.random() * 60) + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      responsePrice: types[Math.floor(Math.random() * types.length)] === 'counter' 
        ? Math.floor(Math.random() * 20000000) + 5000000 
        : undefined,
      createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      fromSeller: Math.random() > 0.5,
      sellerName: sellerNames[Math.floor(Math.random() * sellerNames.length)],
      buyerName: buyerNames[Math.floor(Math.random() * buyerNames.length)],
    });
  }

  return offers;
}
