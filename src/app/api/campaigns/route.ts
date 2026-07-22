import { NextResponse } from 'next/server';
import { getCampaigns } from '@/lib/campaigns';

export async function GET() {
  try {
    const campaigns = await getCampaigns();
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Failed to load campaigns', error);
    return NextResponse.json([], { status: 500 });
  }
}
