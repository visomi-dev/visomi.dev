import type { Principal } from '../auth/shared/identity';

import { isOwner } from './owner';

const owner: Principal = {
  id: 'synthetic-owner',
  method: 'password',
  version: 1,
  authenticatedAt: Date.now(),
  level: 'full',
  emailVerified: true,
  email: 'Owner@Example.Test',
};

it('requires verified email and optional immutable owner ID together', () => {
  expect(isOwner(owner, { email: 'owner@example.test', userId: owner.id })).toBe(true);
  expect(isOwner(owner, { email: 'owner@example.test', userId: 'another-id' })).toBe(false);
  expect(isOwner({ ...owner, email: null }, { email: 'owner@example.test' })).toBe(false);
});
