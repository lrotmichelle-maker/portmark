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

  const descriptions = [
    'This is a TikTok account with a 99% organic following, and it is growing quickly with powerful engagement in the niches below.',
    'This creator profile blends strong audience trust with steady growth, making it ideal for brands that need authentic visibility.',
    'This is a fast-moving social account with highly relevant reach, strong organic momentum, and audience behavior that supports premium partnerships.',
    'This platform presence is built around loyal followers, consistent content delivery, and niche relevance that helps products stand out naturally.',
    'This account has a healthy organic audience and strong engagement patterns, making it a smart fit for campaigns that need real attention.',
    'This profile is growing rapidly with community-driven engagement and a clear niche fit that gives sellers a persuasive edge.'
  ];

  const niches = [
    'tech', 'beauty', 'fitness', 'fashion', 'food', 'travel', 'finance', 'health', 'gaming', 'lifestyle'
  ];

  const orderTypes = ['buy', 'counter'] as const;
  const statuses: Array<'pending' | 'accepted' | 'countered'> = ['pending', 'accepted', 'countered'];

  const getFollowerMetrics = (followers: number) => {
    const followerTier = Math.max(3, Math.min(30, Math.round(followers / 100000)));
    const costMultiplier = Math.random() > 0.5 ? 59 : 25;
    return {
      followerValue: followerTier,
      value: costMultiplier * followerTier * 1000,
    };
  };

  let orderId = 1;

  for (let i = 0; i < 100; i++) {
    const isCounter = Math.random() > 0.6;
    const basePrice = Math.floor(Math.random() * 25000000) + 5000000;
    const offeredPrice = isCounter ? Math.floor(Math.random() * 20000000) + 3000000 : undefined;

    const followers = Math.random() > 0.7
      ? Math.floor(Math.random() * 4000000) + 1000000
      : Math.floor(Math.random() * 970000) + 3000;
    const likes = Math.floor(Math.random() * 250000) + 12000;
    const erCurrentRatio = parseFloat((Math.random() * 12 + 4).toFixed(1));
    const erPreviousRatio = parseFloat((erCurrentRatio - (Math.random() * 2 - 1)).toFixed(1));
    const vlCurrentRatio = parseFloat((Math.random() * 18 + 6).toFixed(1));
    const vlPreviousRatio = parseFloat((vlCurrentRatio - (Math.random() * 2 - 1)).toFixed(1));
    const { value } = getFollowerMetrics(followers);

    const sellerName = sellerNames[Math.floor(Math.random() * sellerNames.length)];
    const handle = `@${sellerName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}`;
    const hashtags = niches
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 3);

    orders.push({
      id: `order-${orderId++}`,
      type: orderTypes[Math.floor(Math.random() * orderTypes.length)],
      cardId: `card-${Math.floor(Math.random() * 100) + 1}`,
      buyerId: `buyer-${Math.floor(Math.random() * 50) + 1}`,
      buyerName: buyerNames[Math.floor(Math.random() * buyerNames.length)],
      sellerName,
      productPriceRaw: basePrice,
      offeredPrice,
      followers,
      likes,
      erCurrentRatio,
      erPreviousRatio,
      vlCurrentRatio,
      vlPreviousRatio,
      value,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      handle,
      hashtags,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
    });
  }

  return orders;
}
