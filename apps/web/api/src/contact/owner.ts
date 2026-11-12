import type { RequestHandler } from 'express';

import { requireFull } from '../auth/shared/identity';

export type OwnerConfig = { email?: string; userId?: string };

export function isOwner(user: Express.User | undefined, config: OwnerConfig): boolean {
  try {
    const principal = requireFull(user);

    return Boolean(
      config.email &&
      principal.emailVerified &&
      principal.email?.toLowerCase() === config.email.toLowerCase() &&
      (!config.userId || config.userId === principal.id),
    );
  } catch {
    return false;
  }
}

export const requireOwner =
  (config: OwnerConfig): RequestHandler =>
  (request, response, next) => {
    response.set('Cache-Control', 'private, no-store').set('Vary', 'Cookie');

    if (!isOwner(request.user, config)) {
      response.status(request.user ? 403 : 401).json({ error: 'access_denied' });

      return;
    }

    next();
  };
