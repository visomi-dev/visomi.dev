import { connect } from 'node:net';
import type { Server } from 'node:http';

// Nx 24's framed JSON readiness protocol, without shipping build tooling in the image.
// Kept import-safe: a socket is opened only after listen and only under an Nx task.
export function emitReadySignal(server: Server): boolean {
  const path = process.env['NX_READY_SIGNAL_SOCKET'];
  const taskId = process.env['NX_READY_SIGNAL_TASK'];
  const address = server.address();

  if (!path || !taskId || !address || typeof address === 'string') {
    return false;
  }

  const host = ['::', '0.0.0.0'].includes(address.address)
    ? 'localhost'
    : address.family === 'IPv6'
      ? `[${address.address}]`
      : address.address;
  const payload = Buffer.from(
    JSON.stringify({
      type: 'TO_PARENT_FROM_CHILDREN',
      message: {
        type: 'nx-ready-signal:ready',
        taskId,
        url: `http://${host}:${address.port}/`,
      },
    }),
  );
  const socket = connect(path);

  socket.on('error', () => socket.destroy());
  socket.unref();
  socket.once('connect', () => socket.end(Buffer.concat([Buffer.from(`NX_MSG_${payload.length}:`), payload])));

  return true;
}
