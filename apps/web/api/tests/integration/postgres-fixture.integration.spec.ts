import { Pool } from 'pg';
import { expect, it } from 'vitest';

import { suitePostgres } from './support/postgres';

it('isolates simultaneous suite databases and can drop one while the other is in use', async () => {
  const databases = await Promise.allSettled([suitePostgres(), suitePostgres()]);
  const owned = databases.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
  const pools = owned.map(({ url }) => new Pool({ connectionString: url }));

  try {
    expect(owned).toHaveLength(2);
    const urls = owned.map(({ url }) => new URL(url));

    expect(urls[0].host).toBe(urls[1].host);
    expect(urls[0].pathname).not.toBe(urls[1].pathname);

    await pools[0].query('CREATE TABLE slot_probe (id integer PRIMARY KEY)');

    const separate = await pools[1].query(
      "SELECT to_regclass('slot_probe') AS probe, to_regclass('auth_users') AS migrated",
    );

    expect(separate.rows).toEqual([{ probe: null, migrated: 'auth_users' }]);

    await pools[0].end();

    pools.shift();

    await owned[0].stop();

    owned.shift();

    const stillConnected = await pools[0].query('SELECT current_database() AS name');

    expect(stillConnected.rows).toEqual([{ name: urls[1].pathname.slice(1) }]);
  } finally {
    await Promise.all(pools.map((pool) => pool.end()));

    await Promise.all(owned.map((database) => database.stop()));
  }
}, 100000);
