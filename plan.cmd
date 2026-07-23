Unified Negotiation and Notification System Implementation Plan
This plan unifies the negotiation and notification provider state machines, links them to the Market, Orders, and Offers pages, enforces alternating negotiation rules, handles 1-day timeouts/declines/passed states, and dynamically updates counts and visual styles.

User Review Required
IMPORTANT

Alteration & Grouping Rules: Each product card is now fully independent and grouped by cardId on the /orders and /offers pages to ensure that multiple counters do not result in duplicate cards.

Theme Integration: All card views (market, order, offer) will dynamically gray out (opacity-60 grayscale bg-neutral-900/40) when their negotiation status transitions to 'passed', 'declined', or 'timed-out'.

Open Questions
None at this stage. We have translated the user requirements directly into concrete rules.

Proposed Changes
Core Data & Providers
[MODIFY] 
NegotiationContext.tsx
Add 'passed' to NegotiationStatus.
Integrate useNotificationContext inside NegotiationProvider to keep localStorage.setItem('orders', ...) and localStorage.setItem('offers', ...) perfectly in sync.
Update getBuyerMaxDiscount and getSellerMaxDiscount to enforce:
Buyer: Counter 1 (40% max off), Counter 2 (30% max off), Counter 3 (15% max off).
Seller: Counter 1 (35% max off), Counter 2 (25% max off), Counter 3 (10% max off).
Modify the tick background scheduler to check for 1-day (24 hours) inactivity timeouts:
If a response is not made within 1 day for a pending counter/buy action: update status to 'passed'.
If a payment is not made within 1 day (status 'payment-pending'): update status to 'timed-out'.
Sync status changes back to the shared orders and offers lists.
Add finalizeNegotiation(cardId) to transition the session to 'finalized' and update corresponding order/offer statuses to 'completed'.
Store the original productPrice directly in the session to ensure discount percentage floor checks always reference the original base price.
Prevent consecutive counters by enforcing alternating actions.
[MODIFY] 
NotificationContext.tsx
Ensure that updating orders/offers via context functions immediately triggers storage updates, so it stays synchronized with the NegotiationContext background updates.
Layout & Navbar
[MODIFY] 
Navbar.tsx
Switch from hardcoded/local state values to using the useNegotiationContext notifications list or useNotification count values dynamically. This ensures that when the user takes an action or when a card times out, badge counts update immediately.
Page Components
[MODIFY] 
MarketPage
Check session status when rendering market cards. Ensure the cards show their active negotiation state on refresh and disable buy/counter actions if in an active/timed-out/declined/passed negotiation.
[MODIFY] 
OrdersPage
Clean up local allOrders state to read from useNotification() dynamically.
Update seller responses (accept, counter, decline) to invoke sellerRespondToOrder from useNegotiationContext, ensuring session state and order/offer records remain in sync.
Deduplicate orders by grouping them by cardId (showing only the latest negotiation event per card).
[MODIFY] 
OffersPage
Clean up local allOffers state to read from useNotification() dynamically.
Update buyer responses (accept, counter, decline) to invoke buyerRespondToOffer from useNegotiationContext.
Deduplicate/group offers by cardId (showing only the latest negotiation event per card). Include the buyer's own pending orders on this page as well (mapped to OfferCardData representation) so they can track seller response and pay/counter.
Card Component UI
[MODIFY] 
MarketCard
Retrieve negotiation session for cardData.id from useNegotiationContext.
Display status (e.g. "Pending seller response", "Cooling down", "Passed", "Declined") dynamically.
Disable buy/counter buttons when the card is in cooldown, has an active offer, or is in an inactive state ('passed', 'declined', 'timed-out').
Gray out the card container if the session is 'passed', 'declined', or 'timed-out'.
Increase maximum counter attempts from 2 to 3.
[MODIFY] 
OfferCard
Sync card actions directly with NegotiationContext and the background payment system.
Integrate the updated discount threshold rules (40%, 30%, 15% off) directly in real-time validation checks.
Add dynamic countdown timer based on the actual expiration/due date of the session rather than hardcoded 1 day from mount.
Support 'passed', 'declined', and 'timed-out' statuses to disable all buttons and gray out the card.
[MODIFY] 
OrderCard
Retrieve and reflect status from the session in the header/footer.
Enforce the seller's discount rules (35%, 25%, 10% off) for counter bids.
Gray out when inactive.
Verification Plan
Automated Tests
Run npm run lint and npm run build to verify compiling.
Manual Verification
Go to /market, click "Counter" on Card 1. Confirm that attempts increase and it is set to "Pending seller response". Check that Card 2 remains unaffected.
Verify in /orders that the seller sees the order. Counter the order from the seller's side.
Verify in /offers that the buyer sees the counter. Confirm that if the buyer counters again, the validation checks enforce the correct discounts.
Check that the badge counts in the header update immediately.
Test decline and verify that cards become grayed out and all buttons are disabled.