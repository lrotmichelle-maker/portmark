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

  const getFollowerMetrics = (followers: number) => {
    const followerTier = Math.max(3, Math.min(30, Math.round(followers / 100000)));
    const costMultiplier = Math.random() > 0.5 ? 59 : 25;
    return {
      followerValue: followerTier,
      value: costMultiplier * followerTier * 1000,
    };
  };

  let offerId = 1;

  const initialCount = 120;
  for (let i = 0; i < initialCount; i++) {
    const statuses: Array<'sent' | 'received' | 'accepted' | 'rejected'> = ['sent', 'received', 'accepted', 'rejected'];
    const types: Array<'accept' | 'counter'> = ['accept', 'counter'];

    const sellerName = sellerNames[Math.floor(Math.random() * sellerNames.length)];
    const followers = Math.random() > 0.7
      ? Math.floor(Math.random() * 4000000) + 1000000
      : Math.floor(Math.random() * 970000) + 3000;
    const likes = Math.floor(Math.random() * 250000) + 12000;
    const { value } = getFollowerMetrics(followers);
    const handle = `@${sellerName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}`;
    const hashtags = niches
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 3);

    offers.push({
      id: `offer-${offerId++}`,
      orderId: `order-${Math.floor(Math.random() * 200) + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      responsePrice: Math.random() > 0.5 ? Math.floor(Math.random() * 20000000) + 5000000 : undefined,
      createdAt: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      fromSeller: Math.random() > 0.4,
      sellerName,
      buyerName: buyerNames[Math.floor(Math.random() * buyerNames.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      handle,
      hashtags,
      followers,
      likes,
      erCurrentRatio: parseFloat((Math.random() * 12 + 4).toFixed(1)),
      erPreviousRatio: parseFloat((Math.random() * 12 + 4).toFixed(1)),
      vlCurrentRatio: parseFloat((Math.random() * 16 + 5).toFixed(1)),
      vlPreviousRatio: parseFloat((Math.random() * 16 + 5).toFixed(1)),
      value,
    });
  }

  const buyerOffersCount = offers.filter((o) => o.fromSeller && o.status === 'sent').length;
  while (buyerOffersCount + 0 < 100 && offers.length < 1000) {
    const sellerName = sellerNames[Math.floor(Math.random() * sellerNames.length)];
    const followers = Math.random() > 0.7
      ? Math.floor(Math.random() * 4000000) + 1000000
      : Math.floor(Math.random() * 970000) + 3000;
    const likes = Math.floor(Math.random() * 250000) + 12000;
    const { value } = getFollowerMetrics(followers);
    const handle = `@${sellerName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}`;
    const hashtags = niches
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 3);

    offers.push({
      id: `offer-${offerId++}`,
      orderId: `order-${Math.floor(Math.random() * 200) + 1}`,
      type: 'accept',
      responsePrice: undefined,
      createdAt: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
      status: 'sent',
      fromSeller: true,
      sellerName,
      buyerName: buyerNames[Math.floor(Math.random() * buyerNames.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      handle,
      hashtags,
      followers,
      likes,
      erCurrentRatio: parseFloat((Math.random() * 12 + 4).toFixed(1)),
      erPreviousRatio: parseFloat((Math.random() * 12 + 4).toFixed(1)),
      vlCurrentRatio: parseFloat((Math.random() * 16 + 5).toFixed(1)),
      vlPreviousRatio: parseFloat((Math.random() * 16 + 5).toFixed(1)),
      value,
    });
    const countNow = offers.filter((o) => o.fromSeller && o.status === 'sent').length;
    if (countNow >= 100) break;
  }

  return offers;
}
