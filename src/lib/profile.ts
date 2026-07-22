import { queryOne } from './db';

export interface ProfileSummary {
  ownerName: string;
  handle: string;
  role: string;
  location: string;
  bio: string;
  discover: {
    created: number;
    applied: number;
    hired: number;
    pending: number;
    rejected: number;
  };
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

export async function getProfileSummary(): Promise<ProfileSummary | null> {
  const tables = ['profiles', 'buyer_profiles', 'user_profiles'];

  for (const table of tables) {
    try {
      const row = await queryOne<Record<string, unknown>>(`SELECT * FROM ${table} LIMIT 1`);
      if (!row) continue;

      return {
        ownerName: toString(row.owner_name ?? row.ownerName ?? row.full_name ?? row.fullName ?? 'Martha', 'Martha'),
        handle: toString(row.handle ?? row.username ?? '@martha', '@martha'),
        role: toString(row.role ?? row.title ?? 'Buyer', 'Buyer'),
        location: toString(row.location ?? row.city ?? 'Kampala, Uganda', 'Kampala, Uganda'),
        bio: toString(row.bio ?? row.summary ?? 'Creator-focused buyer profile.', 'Creator-focused buyer profile.'),
        discover: {
          created: toNumber(row.created_count ?? row.created ?? 12),
          applied: toNumber(row.applied_count ?? row.applied ?? 8),
          hired: toNumber(row.hired_count ?? row.hired ?? 5),
          pending: toNumber(row.pending_count ?? row.pending ?? 15),
          rejected: toNumber(row.rejected_count ?? row.rejected ?? 10),
        },
      };
    } catch (error) {
      console.warn(`Unable to query ${table}`, error);
    }
  }

  return null;
}
