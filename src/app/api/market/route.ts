import { NextResponse } from 'next/server';
import { getMarketCards } from '@/lib/market';

export async function GET() {
  try {
    const cards = await getMarketCards();
    return NextResponse.json(cards);
  } catch (error) {
    console.error('Failed to load market cards', error);
    return NextResponse.json([], { status: 500 });
  }
}
