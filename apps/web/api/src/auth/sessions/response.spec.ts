import type { Request, Response } from 'express';
import { expect, it, vi } from 'vitest';

import { REALTIME_PUBLISHER } from '@visomi-stack/backend-shared/lib/realtime';

import { config, storage } from '../../../tests/support/auth-state';
import { authService } from '../../../tests/support/injection';
import { Recovery } from '../recovery/service';

import { SessionResponses } from './response';

it.each([false, true])('publishes logout after destruction and tolerates notification failure=%s', async (failure) => {
  let destroyed = false;
  const notifySession = vi.fn(async () => {
    expect(destroyed).toBe(true);

    if (failure) {
      throw new Error('synthetic_delivery_failure');
    }
  });
  const responses = authService(SessionResponses, storage([]).db, config, [
    { provide: Recovery, useValue: {} },
    { provide: REALTIME_PUBLISHER, useValue: { notifySession } },
  ]);
  const request = {
    sessionID: 'synthetic-session',
    session: {
      destroy: (done: () => void) => {
        destroyed = true;
        done();
      },
    },
  } as unknown as Request;
  const response = { clearCookie: vi.fn(), status: vi.fn().mockReturnThis(), end: vi.fn() } as unknown as Response;

  await responses.send(request, response, null);

  expect(notifySession).toHaveBeenCalledExactlyOnceWith('synthetic-session');
  expect(response.status).toHaveBeenCalledWith(204);
});
