import { hashPassword } from './password';

it('seeds synthetic password credentials with independent salts in the stack format', async () => {
  const first = await hashPassword('Synthetic password 42!');
  const second = await hashPassword('Synthetic password 42!');

  expect(first).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$[A-Za-z0-9+/]{22}==\$[A-Za-z0-9+/]{43}=$/);
  expect(first).not.toBe(second);
});
