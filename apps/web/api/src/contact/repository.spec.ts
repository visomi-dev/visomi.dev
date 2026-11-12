import type { Pool } from 'pg';

import { createContactRepository } from './repository';

it('checks actual contact schema readiness, reports absent details and releases failed writes', async () => {
  const query = vi.fn().mockResolvedValue({ rows: [], rowCount: 0 });
  const release = vi.fn();
  const pool = { query, connect: vi.fn().mockResolvedValue({ query, release }) } as unknown as Pool;
  const repository = createContactRepository(pool);

  await expect(repository.ready()).rejects.toThrow('contact_unavailable');

  query.mockResolvedValueOnce({ rowCount: 1 });

  await expect(repository.ready()).resolves.toBeUndefined();

  await expect(repository.detail('1')).resolves.toBeUndefined();

  query.mockResolvedValueOnce({}).mockResolvedValueOnce({}).mockResolvedValueOnce({ rows: [] });

  await expect(
    repository.submit({
      email: 'sender@example.test',
      locale: 'en',
      name: 'Synthetic',
      message: 'Synthetic message',
      type: 'other',
    }),
  ).rejects.toThrow('contact_unavailable');

  expect(release).toHaveBeenCalledOnce();
});
