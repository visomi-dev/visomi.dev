import { randomBytes } from 'node:crypto';

import type { Request, Response } from 'express';

import { REALTIME_PUBLISHER, type RealtimePublisher } from '@visomi-stack/backend-shared/lib/realtime';
import { inject } from '@visomi-stack/backend-shared/lib/injection';
import { HttpError } from '@visomi-stack/web-backend-shared/lib/http/http-error';

import { Recovery } from '../recovery/service';
import { AUTH_CONFIG, type AuthConfig } from '../shared/config';
import { destroySession, saveSession, sessionView } from '../shared/http';
import type { Principal } from '../shared/identity';

export class SessionResponses {
  private readonly config = inject<AuthConfig>(AUTH_CONFIG);
  private readonly recovery = inject(Recovery);
  private readonly realtime = inject<RealtimePublisher>(REALTIME_PUBLISHER, { optional: true });

  async establish(request: Request, user: Principal): Promise<void> {
    const previous = request.sessionID;

    await new Promise<void>((resolve, reject) =>
      request.logIn(user, (error) => (error ? reject(new HttpError(503, 'session_unavailable')) : resolve())),
    );

    request.session.csrf = randomBytes(32).toString('base64url');

    await saveSession(request);

    if (user.grantId) {
      await this.recovery.bindGrant(previous, request.sessionID, user);
    }
  }

  async send(
    request: Request,
    response: Response,
    user: Principal | null,
    extras: Record<string, unknown> = {},
  ): Promise<void> {
    if (user) {
      await this.establish(request, user);

      response.json({ ...sessionView(request), ...extras });
    } else {
      const previous = request.sessionID;

      await destroySession(request);

      void this.realtime?.notifySession(previous).catch(() => undefined);

      response.clearCookie(this.config.cookieName, {
        httpOnly: true,
        secure: this.config.secure,
        sameSite: 'strict',
        path: '/',
      });
      response.status(204).end();
    }
  }
}
