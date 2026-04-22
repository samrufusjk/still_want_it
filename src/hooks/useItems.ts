import { useEffect, useState } from 'react';
import analytics from '@react-native-firebase/analytics';
import {
  createItem as createItemRecord,
  getStats,
  listenToItems,
  markBought as markItemBought,
  markSkipped as markItemSkipped,
} from '../services/items';
import { CreateItemInput, ItemRecord } from '../types/items';

export function useItems(userId: string | null) {
  const [isMutating, setIsMutating] = useState(false);
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [itemsError, setItemsError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      return;
    }

    setItemsError(null);

    const unsubscribe = listenToItems(
      userId,
      nextItems => setItems(nextItems),
      error => {
        const message =
          error instanceof Error ? error.message : 'Failed to load items';
        setItemsError(message);
      },
    );

    return unsubscribe;
  }, [userId]);

  const runMutation = async (task: () => Promise<void>) => {
    setIsMutating(true);

    try {
      await task();
    } finally {
      setIsMutating(false);
    }
  };

  const createItem = async (input: CreateItemInput) => {
    if (!userId) {
      throw new Error('User session is not ready.');
    }

    await runMutation(async () => {
      await createItemRecord(userId, input);
      await analytics().logEvent('item_created', {
        delayPreset: input.delayPreset,
        hasPrice: Number(Boolean(input.priceInput.trim())),
      });
    });
  };

  const markBought = async (item: ItemRecord) => {
    await runMutation(async () => {
      await markItemBought(item);
      await analytics().logEvent('item_bought');
    });
  };

  const markSkipped = async (item: ItemRecord) => {
    await runMutation(async () => {
      await markItemSkipped(item);
      await analytics().logEvent('item_skipped', {
        priceCents: item.priceCents ?? 0,
      });
    });
  };

  return {
    createItem,
    isMutating,
    items,
    itemsError,
    markBought,
    markSkipped,
    stats: getStats(items),
  };
}
