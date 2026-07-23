import type { JobOffer } from '@/components/job-card/data';
import { query } from './db';

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function mapJobRow(row: Record<string, unknown>): JobOffer {
  return {
    id: toString(row.id ?? row.job_id ?? row.jobId, 'job-1'),
    employerName: toString(row.employer_name ?? row.employerName ?? row.company_name ?? row.companyName ?? 'Employer', 'Employer'),
    handle: toString(row.handle ?? row.employer_handle ?? row.employerHandle ?? 'employer', 'employer'),
    rating: toNumber(row.rating, 4.5),
    title: toString(row.title ?? row.role ?? 'Open role', 'Open role'),
    niche: toString(row.niche ?? row.industry ?? 'General', 'General'),
    daysRemaining: toNumber(row.days_remaining ?? row.daysRemaining, 7),
    requiredPeople: toNumber(row.required_people ?? row.requiredPeople, 3),
    applicants: toNumber(row.applicants, 1),
    accepted: toNumber(row.accepted, 0),
    requirements: toStringArray(row.requirements ?? row.required_skills ?? row.skills),
    minSalary: toNumber(row.min_salary ?? row.minSalary, 500000),
    maxSalary: toNumber(row.max_salary ?? row.maxSalary, 1200000),
    description: toString(row.description ?? row.summary ?? 'Live discovery listing', 'Live discovery listing'),
    status: (row.status as JobOffer['status']) ?? 'apply',
    statusUpdatedAt: new Date(toString(row.status_updated_at ?? row.statusUpdatedAt ?? new Date().toISOString())),
    increaseCount: toNumber(row.increase_count ?? row.increaseCount, 0),
    hasApplied: Boolean(row.has_applied ?? row.hasApplied ?? false),
  };
}
 
export async function getDiscoverJobs(): Promise<JobOffer[]> {
  const tables = ['vacancies', 'job_offers', 'discover_jobs', 'jobs'];

  for (const table of tables) {
    try {
      const rows = await query<Record<string, unknown>>(`
        SELECT t.*,
          EXISTS(
            SELECT 1 FROM engagement_events e
            WHERE e.entity_type = 'vacancy'
              AND e.entity_id = t.id
              AND e.actor_id = 'demo-user'
              AND e.action = 'apply'
              AND NOT EXISTS (
                SELECT 1 FROM engagement_events e2
                WHERE e2.entity_type = 'vacancy'
                  AND e2.entity_id = t.id
                  AND e2.actor_id = 'demo-user'
                  AND e2.action = 'withdraw'
                  AND e2.created_at > e.created_at
              )
          ) AS has_applied
        FROM ${table} t
        ORDER BY t.created_at DESC
        LIMIT 20
      `);
      return rows.map(mapJobRow);
    } catch (error) {
      console.warn(`Unable to query ${table}`, error);
    }
  }

  return [];
}
