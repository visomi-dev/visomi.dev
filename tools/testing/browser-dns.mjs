import dns from 'node:dns';
import { syncBuiltinESMExports } from 'node:module';

// Test child only: canonical production-host requests stay on the owned local TLS fixture.
const original = dns.lookup;

dns.lookup = function (hostname, ...options) {
  return original.call(dns, hostname === 'visomi.dev' ? '127.0.0.1' : hostname, ...options);
};
syncBuiltinESMExports();
