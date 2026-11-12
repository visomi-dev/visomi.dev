import type { Server } from 'node:http';

import { afterEach, expect, it, vi } from 'vitest';

import { emitReadySignal } from './readiness';

const boundary = vi.hoisted(() => ({
  connect: vi.fn(),
  callbacks: new Map<string, () => void>(),
  end: vi.fn(),
  unref: vi.fn(),
  destroy: vi.fn(),
}));

vi.mock('node:net', () => ({ connect: boundary.connect }));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  boundary.callbacks.clear();
});
it('does nothing outside Nx or without an active TCP listener', () => {
  const server = { address: () => null } as unknown as Server;

  vi.stubEnv('NX_READY_SIGNAL_SOCKET', '');
  expect(emitReadySignal(server)).toBe(false);
  vi.stubEnv('NX_READY_SIGNAL_SOCKET', '/synthetic.sock');
  vi.stubEnv('NX_READY_SIGNAL_TASK', '');
  expect(emitReadySignal(server)).toBe(false);
  vi.stubEnv('NX_READY_SIGNAL_TASK', 'web-gateway:serve');
  expect(emitReadySignal(server)).toBe(false);
  expect(emitReadySignal({ address: () => 'unix-socket' } as unknown as Server)).toBe(false);
  expect(boundary.connect).not.toHaveBeenCalled();
});
it.each([
  ['0.0.0.0', 'IPv4', 'localhost'],
  ['::1', 'IPv6', '[::1]'],
  ['127.0.0.1', 'IPv4', '127.0.0.1'],
])(
  'sends the Nx 24 framed readiness protocol for %s and tolerates optional socket failure',
  (address, family, host) => {
    vi.stubEnv('NX_READY_SIGNAL_SOCKET', '/synthetic.sock');
    vi.stubEnv('NX_READY_SIGNAL_TASK', 'web-gateway:serve');
    boundary.connect.mockReturnValue({
      on: (name: string, callback: () => void) => boundary.callbacks.set(name, callback),
      once: (name: string, callback: () => void) => boundary.callbacks.set(name, callback),
      end: boundary.end,
      unref: boundary.unref,
      destroy: boundary.destroy,
    });
    expect(emitReadySignal({ address: () => ({ address, family, port: 8080 }) } as unknown as Server)).toBe(true);
    boundary.callbacks.get('connect')!();
    const bytes = boundary.end.mock.calls[0][0] as Buffer;
    const delimiter = bytes.indexOf(':');
    const payload = bytes.subarray(delimiter + 1);

    expect(bytes.subarray(0, delimiter).toString()).toBe(`NX_MSG_${payload.length}`);
    expect(JSON.parse(payload.toString())).toEqual({
      type: 'TO_PARENT_FROM_CHILDREN',
      message: { type: 'nx-ready-signal:ready', taskId: 'web-gateway:serve', url: `http://${host}:8080/` },
    });
    boundary.callbacks.get('error')!();
    expect(boundary.destroy).toHaveBeenCalledOnce();
  },
);
