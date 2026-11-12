import { createHmac, randomBytes } from 'node:crypto';

import type { Store } from 'express-rate-limit';

// No timer, listener or connection is started by API composition. Counters are bounded,
// expired on access, and keyed with a process-local secret instead of retaining addresses.
export function contactLimits(windowMs: number, limit: number): Store {
  const secret = randomBytes(32);
  const entries = new Map<string, { totalHits: number; resetTime: Date }>();
  const keyFor = (value: string) => createHmac('sha256', secret).update(value).digest('hex');

  return {
    localKeys: true,
    increment(value) {
      const key = keyFor(value);
      const now = Date.now();
      const previous = entries.get(key);

      if (previous && previous.resetTime.getTime() > now) {
        previous.totalHits = Math.min(previous.totalHits + 1, limit + 1);

        return previous;
      }

      if (entries.size >= 10_000) {
        for (const [expired, counter] of entries) {
          if (counter.resetTime.getTime() <= now) {
            entries.delete(expired);
          }
        }

        if (entries.size >= 10_000) {
          return { totalHits: limit + 1, resetTime: new Date(now + windowMs) };
        }
      }

      const entry = { totalHits: 1, resetTime: new Date(now + windowMs) };

      entries.set(key, entry);

      return entry;
    },
    decrement(value) {
      const entry = entries.get(keyFor(value));

      if (entry) {
        entry.totalHits = Math.max(0, entry.totalHits - 1);
      }
    },
    resetKey(value) {
      entries.delete(keyFor(value));
    },
    shutdown() {
      entries.clear();
    },
  };
}
