export type ItemStatus = 'pending' | 'bought' | 'skipped';

export type DelayPreset = '12h' | '24h' | '48h' | '7d';

export type ItemRecord = {
  createdAt: Date | null;
  decisionAt: Date | null;
  delayPreset: DelayPreset;
  id: string;
  name: string;
  note: string;
  priceCents: number | null;
  remindAt: Date | null;
  status: ItemStatus;
  userId: string;
};

export type CreateItemInput = {
  delayPreset: DelayPreset;
  name: string;
  note: string;
  priceInput: string;
};

export type ItemStats = {
  itemsSkipped: number;
  moneySavedCents: number;
};
