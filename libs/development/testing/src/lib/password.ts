import { randomBytes } from 'node:crypto';

import { argon2id } from 'hash-wasm';

// Synthetic fixture seeding only; the compiled owner login verifies compatibility.
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await argon2id({
    password,
    salt,
    parallelism: 1,
    iterations: 2,
    memorySize: 19456,
    hashLength: 32,
    outputType: 'hex',
  });

  return `$argon2id$v=19$m=19456,t=2,p=1$${salt.toString('base64')}$${Buffer.from(hash, 'hex').toString('base64')}`;
}
