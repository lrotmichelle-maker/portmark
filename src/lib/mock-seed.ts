import { mockJobs } from '@/components/job-card/data';
import { generateFiveMockCards } from '@/lib/mocks/market-data';
import { generateMockData } from '@/lib/mocks/buyer-card';
import { marthaProfileData } from '@/lib/mocks/profile';
import { query } from '@/lib/db';

function toString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function seedMockData() {
  await query(`
    CREATE TABLE IF NOT EXISTS seed_state (
      name TEXT PRIMARY KEY,
      seeded_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const existingSeed = await query<{ name: string }>(
    'SELECT name FROM seed_state WHERE name = $1',
    ['mock-data']
  );

  if (existingSeed.length > 0) {
    return { ok: true, seeded: false, message: 'Mock data already seeded' };
  }

  await query('INSERT INTO seed_state (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', ['mock-data']);

  await query(`
    CREATE TABLE IF NOT EXISTS vacancies (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      employer_name TEXT NOT NULL DEFAULT 'Employer',
      handle TEXT NOT NULL DEFAULT 'employer',
      rating NUMERIC DEFAULT 5.0,
      days_remaining INTEGER DEFAULT 14,
      required_people INTEGER DEFAULT 1,
      applicants INTEGER DEFAULT 0,
      accepted INTEGER DEFAULT 0,
      requirements TEXT DEFAULT '',
      min_salary INTEGER DEFAULT 0,
      max_salary INTEGER DEFAULT 0,
      status TEXT DEFAULT 'apply',
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      status_updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT DEFAULT 'Technology',
      niche_hashtag TEXT DEFAULT 'growth',
      total_budget INTEGER DEFAULT 1000,
      budget_used INTEGER DEFAULT 0,
      time_remaining_days INTEGER DEFAULT 14,
      publisher_rating NUMERIC DEFAULT 4.8,
      publisher_profile_icon TEXT DEFAULT '/images/publisher-placeholder.png',
      community_size INTEGER DEFAULT 12000,
      views_generated INTEGER DEFAULT 10000,
      likes_generated INTEGER DEFAULT 1500,
      highest_mcp INTEGER DEFAULT 100,
      created_by TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS market_listings (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price NUMERIC DEFAULT 0,
      profile_url TEXT,
      platform TEXT,
      handle TEXT,
      followers INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      engagement_rate NUMERIC DEFAULT 0,
      niche TEXT DEFAULT 'Growth',
      created_by TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
      owner_name TEXT NOT NULL,
      handle TEXT NOT NULL,
      role TEXT NOT NULL,
      location TEXT NOT NULL,
      bio TEXT NOT NULL,
      created_count INTEGER DEFAULT 0,
      applied_count INTEGER DEFAULT 0,
      hired_count INTEGER DEFAULT 0,
      pending_count INTEGER DEFAULT 0,
      rejected_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS engagement_events (
      id SERIAL PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      actor_id TEXT NOT NULL,
      action TEXT NOT NULL,
      message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const vacancyCount = await query<{ count: string }>(`SELECT COUNT(*)::int AS count FROM vacancies`);
  if (Number(vacancyCount[0]?.count ?? 0) === 0) {
    for (const job of mockJobs.slice(0, 10)) {
      await query(`
        INSERT INTO vacancies (
          title, description, category, employer_name, handle, rating, 
          days_remaining, required_people, applicants, accepted, requirements, status, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        job.title, job.description, job.niche, job.employerName, job.handle, job.rating,
        job.daysRemaining, job.requiredPeople, job.applicants, job.accepted, job.requirements.join(','), job.status, 'system'
      ]);
    }
  }

  const campaignCount = await query<{ count: string }>(`SELECT COUNT(*)::int AS count FROM campaigns`);
  if (Number(campaignCount[0]?.count ?? 0) === 0) {
    const sampleCampaigns = [
      {
        title: 'Spring Launch Growth',
        description: 'A creator-led campaign focused on product awareness and conversion.',
        category: 'Technology',
        niche_hashtag: 'growth,conversion',
        total_budget: 15000,
        time_remaining_days: 10,
        community_size: 45000,
        views_generated: 120000,
        likes_generated: 18000,
      },
      {
        title: 'Creator Community Boost',
        description: 'Boosting community engagement for new product releases.',
        category: 'Lifestyle',
        niche_hashtag: 'community,lifestyle',
        total_budget: 8000,
        time_remaining_days: 21,
        community_size: 24000,
        views_generated: 68000,
        likes_generated: 9400,
      },
      {
        title: 'Brand Story Week',
        description: 'An editorial campaign that highlights social proof and trust.',
        category: 'Entertainment',
        niche_hashtag: 'storytelling,trust',
        total_budget: 25000,
        time_remaining_days: 5,
        community_size: 88000,
        views_generated: 340000,
        likes_generated: 48000,
      },
    ];

    for (const campaign of sampleCampaigns) {
      await query(`
        INSERT INTO campaigns (
          title, description, category, niche_hashtag, total_budget, budget_used, 
          time_remaining_days, publisher_rating, publisher_profile_icon, community_size, 
          views_generated, likes_generated, highest_mcp, status, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        campaign.title, campaign.description, campaign.category, campaign.niche_hashtag, campaign.total_budget, 0,
        campaign.time_remaining_days, 4.8, '/images/publisher-placeholder.png', campaign.community_size,
        campaign.views_generated, campaign.likes_generated, 150, 'Active', 'demo-user'
      ]);
    }
  }

  const marketCount = await query<{ count: string }>(`SELECT COUNT(*)::int AS count FROM market_listings`);
  if (Number(marketCount[0]?.count ?? 0) === 0) {
    const cards = generateFiveMockCards();
    for (const card of cards) {
      await query(
        'INSERT INTO market_listings (title, description, price, profile_url, platform, handle, followers, likes, engagement_rate, niche, created_by, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
        [
          `${card.sellerName} listing`,
          card.description,
          Math.round(card.productPriceRaw / 1000),
          `https://instagram.com/${toString(card.handle).replace('@', '')}`,
          'instagram.com',
          toString(card.handle).replace('@', ''),
          card.followers,
          card.likes,
          Number((card.erCurrentRatio ?? 0).toFixed(2)),
          'growth',
          card.sellerUsername,
          'open',
        ]
      );
    }
  }

  const profileCount = await query<{ count: string }>(`SELECT COUNT(*)::int AS count FROM profiles`);
  if (Number(profileCount[0]?.count ?? 0) === 0) {
    const profile = generateMockData();
    const profileSummary = marthaProfileData;
    await query(
      'INSERT INTO profiles (owner_name, handle, role, location, bio, created_count, applied_count, hired_count, pending_count, rejected_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [
        profileSummary.ownerName,
        profileSummary.handle,
        profileSummary.role,
        profileSummary.location,
        profileSummary.bio,
        profileSummary.discover.created,
        profileSummary.discover.applied,
        profileSummary.discover.hired,
        profileSummary.discover.pending,
        profileSummary.discover.rejected,
      ]
    );
  }

  const engagementCount = await query<{ count: string }>(`SELECT COUNT(*)::int AS count FROM engagement_events`);
  if (Number(engagementCount[0]?.count ?? 0) === 0) {
    const campaignRow = await query<{ id: number }>('SELECT id FROM campaigns ORDER BY id ASC LIMIT 1');
    if (campaignRow[0]?.id) {
      await query(
        'INSERT INTO engagement_events (entity_type, entity_id, actor_id, action, message) VALUES ($1, $2, $3, $4, $5)',
        ['campaign', campaignRow[0].id, 'demo-user', 'join', 'Joined seeded campaign']
      );
    }
  }

  return { ok: true, seeded: true };
}
