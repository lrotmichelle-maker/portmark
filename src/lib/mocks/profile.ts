export interface AccountPaymentMethod {
  id: string;
  type: 'bank' | 'mobile_money';
  name: string;
  accountLabel: string;
  isDefault?: boolean;
}

export interface AccountTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'payment';
  title: string;
  amount: number;
  balance: number;
  method: string;
  date: string;
  status: 'completed' | 'pending';
}

export interface AccountProfileData {
  ownerName: string;
  handle: string;
  role: string;
  location: string;
  bio: string;
  market: {
    involvement: number;
    sold: number;
    bought: number;
  };
  orders: {
    involvement: number;
  };
  offers: {
    involvement: number;
  };
  campaigns: {
    posted: number;
    joined: number;
    ended: number;
    exited: number;
    incomeEarned: number;
    incomeSpent: number;
  };
  discover: {
    created: number;
    applied: number;
    hired: number;
    rejected: number;
    pending: number;
  };
  paymentMethods: AccountPaymentMethod[];
  transactions: AccountTransaction[];
}

export const marthaProfileData: AccountProfileData = {
  ownerName: 'Martha Mukisa',
  handle: '@marthamukisa',
  role: 'Creator • Growth Partner • Brand Seller',
  location: 'Kampala, Uganda',
  bio: 'Martha builds trusted creator partnerships, runs campaign-led growth, and manages buyer and seller transactions from one polished account.',
  market: {
    involvement: 32,
    sold: 24,
    bought: 14,
  },
  orders: {
    involvement: 24,
  },
  offers: {
    involvement: 16,
  },
  campaigns: {
    posted: 50,
    joined: 30,
    ended: 10,
    exited: 5,
    incomeEarned: 2485000,
    incomeSpent: 1286000,
  },
  discover: {
    created: 10,
    applied: 30,
    hired: 5,
    rejected: 10,
    pending: 15,
  },
  paymentMethods: [
    {
      id: 'bank-1',
      type: 'bank',
      name: 'Stanbic Bank Uganda',
      accountLabel: 'Savings • 0012345678',
      isDefault: true,
    },
    {
      id: 'mm-1',
      type: 'mobile_money',
      name: 'MTN Mobile Money',
      accountLabel: 'Wallet • 256700123456',
    },
  ],
  transactions: [
    {
      id: 'txn-1',
      type: 'deposit',
      title: 'Wallet top-up',
      amount: 450000,
      balance: 920000,
      method: 'Mobile Money',
      date: '2026-07-10',
      status: 'completed',
    },
    {
      id: 'txn-2',
      type: 'withdrawal',
      title: 'Cash withdrawal',
      amount: 180000,
      balance: 740000,
      method: 'Bank Transfer',
      date: '2026-07-08',
      status: 'completed',
    },
    {
      id: 'txn-3',
      type: 'payment',
      title: 'Campaign payout',
      amount: 320000,
      balance: 1060000,
      method: 'Bank',
      date: '2026-07-05',
      status: 'completed',
    },
    {
      id: 'txn-4',
      type: 'payment',
      title: 'Order settlement',
      amount: 125000,
      balance: 935000,
      method: 'Mobile Money',
      date: '2026-07-03',
      status: 'completed',
    },
    {
      id: 'txn-5',
      type: 'deposit',
      title: 'Client deposit',
      amount: 600000,
      balance: 1535000,
      method: 'Bank',
      date: '2026-07-01',
      status: 'completed',
    },
  ],
};
