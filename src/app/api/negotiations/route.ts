import { NextResponse } from 'next/server';
import { getNegotiationData } from '@/lib/negotiations';

export async function GET() {
  try {
    const data = await getNegotiationData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to load negotiation data', error);
    return NextResponse.json({ orders: [], offers: [] }, { status: 500 });
  }
}
