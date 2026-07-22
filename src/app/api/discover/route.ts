import { NextResponse } from 'next/server';
import { getDiscoverJobs } from '@/lib/discover';

export async function GET() {
  try {
    const jobs = await getDiscoverJobs();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Failed to load discover jobs', error);
    return NextResponse.json([], { status: 500 });
  }
}
