export type NegotiationDirection = 'seller' | 'buyer' | 'system';

export interface NegotiationSession {
  id: string;
  status: 'pending' | 'buyer-pending' | 'seller-pending' | 'accepted' | 'declined' | 'timed-out' | 'payment-pending';
  currentValue: number;
  counterCount: number;
  buyCountToday: number;
  dayKey?: string;
  lastActionAt: string;
  updatedAt: string;
  createdAt: string;
  pendingFor: 'seller' | 'buyer' | null;
  lastActor: 'seller' | 'buyer' | null;
  paymentDueAt?: string;
  cooldownUntil?: string;
  lastActionLabel?: string;
}

export interface NegotiationEvent {
  id: string;
  orderId: string;
  direction: NegotiationDirection;
  amount: number;
  note: string;
  createdAt: string;
}

export function createNegotiationEvent(orderId: string, direction: NegotiationDirection, amount: number, note: string): NegotiationEvent {
  return {
    id: `negotiation-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    orderId,
    direction,
    amount,
    note,
    createdAt: new Date().toISOString(),
  };
}

export function getNegotiationSummary(events: NegotiationEvent[]): { latestOffer: number | null; count: number } {
  if (events.length === 0) {
    return { latestOffer: null, count: 0 };
  }

  return {
    latestOffer: events[events.length - 1].amount,
    count: events.length,
  };
}
