import type { AddressInfo } from 'node:net';

// Follow the actual TCP listener, including localhost resolving to IPv6 and ephemeral development ports.
export function contactProxyUrl(address: AddressInfo): string {
  const host = address.family === 'IPv6' ? '[::1]' : '127.0.0.1';

  return `http://${host}:${address.port}/api/contact/submissions`;
}
