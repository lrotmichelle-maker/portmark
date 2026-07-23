import { NextRequest, NextResponse } from 'next/server';
import { getCampaigns } from '@/lib/campaigns';
import { query } from '@/lib/db';
import { seedMockData } from '@/lib/mock-seed';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

export async function GET() {
  try {
    await seedMockData();
    const campaigns = await getCampaigns();
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Failed to load campaigns', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT DEFAULT 'Technology',
        created_by TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const body = await request.json().catch(() => ({}));
    const title = toString(body.title, '');
    const description = toString(body.description, '');
    const category = toString(body.category, 'Technology');
    const createdBy = toString(body.createdBy ?? body.userId ?? request.headers.get('x-user-id'), 'anonymous');

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const created = await query<Record<string, unknown>>(
      'INSERT INTO campaigns (title, description, category, created_by, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, description, category, created_by, status, created_at',
      [title, description, category, createdBy, 'active']
    );

    return NextResponse.json({ ok: true, item: created[0] });
  } catch (error) {
    console.error('Unable to create campaign', error);
    return NextResponse.json({ error: 'Unable to create campaign' }, { status: 500 });
  }
}
