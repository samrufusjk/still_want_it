import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { CreateItemInput, DelayPreset, ItemRecord, ItemStats } from '../types/items';

const delayPresetToMs: Record<DelayPreset, number> = {
  '12h': 12 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '48h': 48 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
};

function parsePriceInput(priceInput: string) {
  const normalized = priceInput.trim().replace(/[^0-9.]/g, '');
  if (!normalized) {
    return null;
  }

  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error('Price must be a valid positive number.');
  }

  return Math.round(value * 100);
}

function resolveDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const maybeTimestamp = value as { toDate: () => Date };
    return maybeTimestamp.toDate();
  }

  return null;
}

function mapItemDocument(
  document: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
): ItemRecord {
  const data = document.data() ?? {};

  return {
    createdAt: resolveDate(data.createdAt),
    decisionAt: resolveDate(data.decisionAt),
    delayPreset: (data.delayPreset as DelayPreset) ?? '24h',
    id: document.id,
    name: typeof data.name === 'string' ? data.name : '',
    note: typeof data.note === 'string' ? data.note : '',
    priceCents: typeof data.priceCents === 'number' ? data.priceCents : null,
    remindAt: resolveDate(data.remindAt),
    status: data.status === 'bought' || data.status === 'skipped' ? data.status : 'pending',
    userId: typeof data.userId === 'string' ? data.userId : '',
  };
}

function compareItems(left: ItemRecord, right: ItemRecord) {
  if (left.status === 'pending' && right.status !== 'pending') {
    return -1;
  }

  if (left.status !== 'pending' && right.status === 'pending') {
    return 1;
  }

  const leftDate =
    (left.status === 'pending' ? left.remindAt : left.decisionAt)?.getTime() ??
    left.createdAt?.getTime() ??
    0;
  const rightDate =
    (right.status === 'pending' ? right.remindAt : right.decisionAt)?.getTime() ??
    right.createdAt?.getTime() ??
    0;

  return rightDate - leftDate;
}

function assertPendingItem(item: ItemRecord) {
  if (item.status !== 'pending') {
    throw new Error('Only pending items can be updated.');
  }
}

export function canOpenDecision(item: ItemRecord) {
  if (item.status !== 'pending') {
    return false;
  }

  if (!item.remindAt) {
    return true;
  }

  return item.remindAt.getTime() <= Date.now();
}

export function formatCurrency(priceCents: number) {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(priceCents / 100);
}

function formatRelativeDuration(milliseconds: number) {
  const totalMinutes = Math.max(1, Math.ceil(milliseconds / (60 * 1000)));

  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const totalHours = Math.ceil(totalMinutes / 60);
  if (totalHours < 48) {
    return `${totalHours}h`;
  }

  const totalDays = Math.ceil(totalHours / 24);
  return `${totalDays}d`;
}

export function formatItemStateLabel(item: ItemRecord) {
  if (item.status === 'bought') {
    return 'Bought';
  }

  if (item.status === 'skipped') {
    return 'Skipped';
  }

  if (!item.remindAt) {
    return 'Waiting';
  }

  const remainingMs = item.remindAt.getTime() - Date.now();
  if (remainingMs <= 0) {
    return 'Ready for your decision';
  }

  return `Time remaining: ${formatRelativeDuration(remainingMs)}`;
}

export function formatDecisionReadyLabel(item: ItemRecord) {
  if (!item.remindAt) {
    return 'Ready for a decision now.';
  }

  const remainingMs = item.remindAt.getTime() - Date.now();
  if (remainingMs <= 0) {
    return 'Your wait is over.';
  }

  return `Available in ${formatRelativeDuration(remainingMs)}.`;
}

export function getStats(items: ItemRecord[]): ItemStats {
  return items.reduce<ItemStats>(
    (accumulator, item) => {
      if (item.status !== 'skipped') {
        return accumulator;
      }

      return {
        itemsSkipped: accumulator.itemsSkipped + 1,
        moneySavedCents: accumulator.moneySavedCents + (item.priceCents ?? 0),
      };
    },
    { itemsSkipped: 0, moneySavedCents: 0 },
  );
}

export async function createItem(userId: string, input: CreateItemInput) {
  const createdAt = new Date();
  const remindAt = new Date(createdAt.getTime() + delayPresetToMs[input.delayPreset]);
  const priceCents = parsePriceInput(input.priceInput);

  await firestore().collection('items').add({
    createdAt: firestore.FieldValue.serverTimestamp(),
    decisionAt: null,
    delayPreset: input.delayPreset,
    name: input.name.trim(),
    note: input.note.trim(),
    priceCents,
    remindAt: firestore.Timestamp.fromDate(remindAt),
    reminderState: 'scheduled',
    status: 'pending',
    userId,
  });
}

export function listenToItems(
  userId: string,
  onItems: (items: ItemRecord[]) => void,
  onError: (error: unknown) => void,
) {
  return firestore()
    .collection('items')
    .where('userId', '==', userId)
    .onSnapshot(
      snapshot => {
        const nextItems = snapshot.docs.map(mapItemDocument).sort(compareItems);
        onItems(nextItems);
      },
      onError,
    );
}

export async function markBought(item: ItemRecord) {
  assertPendingItem(item);

  await firestore().collection('items').doc(item.id).update({
    decisionAt: firestore.FieldValue.serverTimestamp(),
    status: 'bought',
  });
}

export async function markSkipped(item: ItemRecord) {
  assertPendingItem(item);

  await firestore().collection('items').doc(item.id).update({
    decisionAt: firestore.FieldValue.serverTimestamp(),
    status: 'skipped',
  });
}
