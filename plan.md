# Implementation Plan — Unified Negotiation & Notifications

This document records the requested plan, what has been implemented, and the remaining work to fully complete the feature set described in `plan.cmd`.

**Summary:**
- Goal: Unify negotiation and notification state, connect the flows to Market/Orders/Offers, enforce alternating counters and timeouts, and ensure UI updates and styles reflect negotiation state.

**What I implemented (completed):**
- **Campaign modal:** Added `src/components/layout/campaign-modal.tsx` and mounted it from the Campaign page so users can create campaigns via a modal form.
- **Create Campaign button:** Ensured a visible `Create Campaign` button is placed directly beneath the `Campaigns` heading in `src/app/campaign/page.tsx` and opens the modal.
- **Seeding mock data:** Added `src/lib/mock-seed.ts` and wired calls to it from the main API routes (`/api/secure`, `/api/campaigns`, `/api/discover`, `/api/market`) to populate the DB with representative mock data.
- **Idempotent seeding:** Seed logic now stores a `seed_state` row to avoid re-inserting mock rows after the first run.
- **Build verification:** Ran `npm run build` after each change to confirm the app compiles successfully.

**Files added/modified:**
- `src/components/layout/campaign-modal.tsx` — new
- `src/app/campaign/page.tsx` — modified (button placement, modal wiring)
- `src/lib/mock-seed.ts` — new (idempotent seeder)
- `src/app/api/secure/route.ts` — modified (seed invocation)
- `src/app/api/campaigns/route.ts` — modified (seed invocation)
- `src/app/api/discover/route.ts` — modified (seed invocation)
- `src/app/api/market/route.ts` — modified (seed invocation)

**Remaining (high priority):**
- **Persist campaign management actions:** Implement backend endpoints and UI wiring for `pause` and `delete` campaign actions so state persists across reloads. (files: `src/app/api/secure/route.ts`, manage pages)
- **Immediate post-seed UI update:** Make the first load render seeded rows without requiring the user to manually refresh. (e.g., return seeded payload from initial API GET responses)
- **Wire campaign creation to persistent backend:** Ensure campaign modal posts full form payload to the backend and the created campaign is stored & returned from DB consistently.
- **Negotiation & Notification unification:** Implement the state machine updates in `NegotiationContext.tsx` and `NotificationContext.tsx` as described in `plan.cmd`. This includes adding `passed` status, 1-day timeouts, alternating-counter enforcement, and saving back to shared lists.
- **Market/Offer/Order pages:** Update `MarketPage`, `OrdersPage`, and `OffersPage` to read from the unified contexts and disable/gray-out cards when inactive.
- **Tests & docs:** Add API tests and an update to README describing seeding and development flow.

**Actionable next steps (recommended order):**
1. Implement `pause` and `delete` campaign handlers in the secure API route and call them from the manage UI. (API then UI)
2. Return the seeded rows in the initial GET response so the UI sees seeded data on first render.
3. Implement negotiations state machine in `NegotiationContext.tsx` and ensure `NotificationContext.tsx` subscribes to those changes.
4. Update card components to read negotiation session state and adjust UI (disable buttons, gray out).
5. Add unit/integration tests for the create endpoints and seeding flow.

**Quick developer commands:**

- Build to verify changes:

```bash
npm run build
```

- Start dev server:

```bash
npm run dev
```

- Inspect database (example with psql):

```bash
psql "$DATABASE_URL"
\dt   # list tables
SELECT * FROM campaigns LIMIT 10;
```

**Verification checklist (manual):**
- [ ] Visit `/campaign` and confirm `Create Campaign` button is visible under the heading and opens the campaign modal.
- [ ] Open `/api/campaigns` or `/api/secure` once to trigger seeding, then visit `/campaign`, `/discover`, and `/market` to confirm seeded rows appear.
- [ ] Create a campaign via the modal and confirm a row is inserted in `campaigns` table.
- [ ] Test `pause/delete` flows once implemented.

If you'd like, I can now:
- Implement the `pause`/`delete` persistence endpoints (next high-priority item), or
- Make the seeded rows appear immediately in the UI after the first seed, or
- Start implementing the NegotiationContext state machine (this is a larger task).

Tell me which of the three you want me to do next and I will begin.  

---

Last update: seeded DB integration + campaign modal wired. Tracked todos added to the workspace task list for visibility.