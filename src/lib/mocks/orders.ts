import type { Order } from '@/types';

export function generateMockOrders(): Order[] {
  const orders: Order[] = [];

  const buyerNames = [
    'Tech Startup Co', 'Digital Agency Pro', 'Brand Solutions LLC',
    'Marketing Collective', 'Social Media Co', 'Creative Studio',
    'Content Hub', 'Influencer Network', 'Campaign Partners',
    'Growth Marketing', 'Digital Ventures', 'Online Success',
    'Creative Minds', 'Digital Dreams', 'Brand Builders', 'Market Leaders'
  ];

  const sellerNames = [
    'Sarah Johnson', 'Marcus Chen', 'Emma Studios', 'Alex Rodriguez',
    'Jordan Lee', 'Casey Martinez', 'Taylor Kim', 'Morgan Brown',
    'Riley Wilson', 'Cameron Davis', 'Blake Anderson', 'Dakota Taylor',
    'Phoenix White', 'Harper Young', 'Quinn Miller', 'Reese Harris'
  ];

  const orderTypes = ['buy', 'counter'] as const;
  const statuses: Array<'pending' | 'accepted' | 'countered'> = ['pending', 'accepted', 'countered'];

  let orderId = 1;

  // Generate 100 orders with varied data
  for (let i = 0; i < 100; i++) {
    const isCounter = Math.random() > 0.6;
    const basePrice = Math.floor(Math.random() * 25000000) + 5000000;
    const offeredPrice = isCounter ? Math.floor(Math.random() * 20000000) + 3000000 : undefined;

    orders.push({
      id: `order-${orderId++}`,
      type: orderTypes[Math.floor(Math.random() * orderTypes.length)],
      cardId: `card-${Math.floor(Math.random() * 100) + 1}`,
      buyerId: `buyer-${Math.floor(Math.random() * 50) + 1}`,
      buyerName: buyerNames[Math.floor(Math.random() * buyerNames.length)],
      sellerName: sellerNames[Math.floor(Math.random() * sellerNames.length)],
      productPriceRaw: basePrice,
      offeredPrice: offeredPrice,
      description: [
        'Looking for collaboration on upcoming campaign',
        'Interested in exclusive partnership deal',
        'Would like to negotiate pricing',
        'Seeking long-term engagement',
        'Interested in product placement',
        'Looking for sponsored content',
        'Would like exclusive rights',
        'Interested in brand ambassador role',
        'Looking for multiple posts package',
        'Interested in story series'
      ][Math.floor(Math.random() * 10)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
    });
  }

  return orders;
}
