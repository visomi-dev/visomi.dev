import { and, eq, isNull } from 'drizzle-orm';

import * as authSchema from '@visomi-stack/backend-shared/lib/database/schema-auth';
import { DATABASE } from '@visomi-stack/backend-shared/lib/database/tokens';
import { inject } from '@visomi-stack/backend-shared/lib/injection';
import type { Database } from '@visomi-stack/backend-shared/lib/database/database';

import { requireFull } from '../shared/identity';
import { Factors } from '../totp/service';

const { users, federatedIdentities, credentials } = authSchema;

export class Methods {
  private readonly database = inject<Database>(DATABASE);
  readonly factors = inject(Factors);

  async overview(current: Express.User) {
    requireFull(current);
    const [user] = await this.database.select().from(users).where(eq(users.id, current.id));
    const providers = await this.database
      .select({ id: federatedIdentities.id })
      .from(federatedIdentities)
      .where(and(eq(federatedIdentities.userId, current.id), isNull(federatedIdentities.revokedAt)));
    const keys = await this.database
      .select({ id: credentials.id, label: credentials.label })
      .from(credentials)
      .where(
        and(eq(credentials.userId, current.id), isNull(credentials.revokedAt), isNull(credentials.pendingGrantId)),
      );
    const totp = await this.factors.active(this.database, current.id);

    return { password: Boolean(user.passwordHash), google: providers, passkeys: keys, totp: Boolean(totp) };
  }
}
