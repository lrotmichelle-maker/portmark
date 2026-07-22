import { NextResponse } from 'next/server';
import { getProfileSummary } from '@/lib/profile';

export async function GET() {
  try {
    const profile = await getProfileSummary();
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to load profile summary', error);
    return NextResponse.json(null, { status: 500 });
  }
}
