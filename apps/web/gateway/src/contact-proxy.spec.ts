import { contactProxyUrl } from './contact-proxy';

it.each([
  { address: '127.0.0.1', family: 'IPv4', host: '127.0.0.1' },
  { address: '0.0.0.0', family: 'IPv4', host: '127.0.0.1' },
  { address: '::1', family: 'IPv6', host: '[::1]' },
  { address: '::', family: 'IPv6', host: '[::1]' },
])('routes the internal contact bridge through the actual $family listener', ({ address, family, host }) => {
  expect(contactProxyUrl({ address, family, port: 54321 })).toBe(`http://${host}:54321/api/contact/submissions`);
});
