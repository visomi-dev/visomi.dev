import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createServer as createHttpServer, request as httpRequest } from 'node:http';
import { createServer } from 'node:https';
import { type Duplex } from 'node:stream';
import { connect } from 'node:net';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execute = promisify(execFile);

export async function browserHttps(directory: string, port: number, upstreamPort: number) {
  const certificate = join(directory, 'synthetic-cert.pem');
  const key = join(directory, 'synthetic-key.pem');

  await execute('openssl', [
    'req',
    '-x509',
    '-newkey',
    'rsa:2048',
    '-nodes',
    '-keyout',
    key,
    '-out',
    certificate,
    '-subj',
    '/CN=127.0.0.1',
    '-days',
    '1',
    '-addext',
    'subjectAltName=IP:127.0.0.1,DNS:visomi.dev',
  ]);

  const privateKey = await readFile(key);
  const publicCertificate = await readFile(certificate);
  const credentials = { key: privateKey, cert: publicCertificate };
  const headers = (incoming: Record<string, string | string[] | undefined>) => ({
    ...incoming,
    host: `visomi.dev:${port}`,
    'x-forwarded-host': `visomi.dev:${port}`,
    'x-forwarded-proto': 'https',
    'x-forwarded-for': '127.0.0.1',
  });
  const sockets = new Set<Duplex>();
  const server = createServer(credentials, (request, response) => {
    const upstream = httpRequest(
      {
        hostname: '127.0.0.1',
        port: upstreamPort,
        path: request.url,
        method: request.method,
        headers: headers(request.headers),
      },
      (received) => {
        response.writeHead(received.statusCode ?? 502, received.headers);
        received.pipe(response);
      },
    );

    upstream.on('error', () => {
      response.writeHead(502);
      response.end();
    });
    request.pipe(upstream);
  });

  server.on('connection', (socket) => {
    sockets.add(socket);
    socket.once('close', () => sockets.delete(socket));
  });
  server.on('upgrade', (request, socket, head) => {
    const upstream = connect(upstreamPort, '127.0.0.1', () => {
      const fields = Object.entries(headers(request.headers)).flatMap(([name, value]) =>
        value === undefined ? [] : [`${name}: ${value}`],
      );

      upstream.write(`${request.method} ${request.url} HTTP/1.1\r\n${fields.join('\r\n')}\r\n\r\n`);

      if (head.length) {
        upstream.write(head);
      }

      socket.pipe(upstream).pipe(socket);
    });

    upstream.on('error', () => socket.destroy());
    socket.on('error', () => upstream.destroy());
    socket.on('close', () => upstream.destroy());
  });

  // Forward proxy supplies DNS isolation for every browser without contacting the real domain.
  const forward = createHttpServer((request, response) => {
    const target = new URL(request.url!);

    if (target.hostname !== '127.0.0.1' || target.protocol !== 'http:') {
      response.writeHead(403);
      response.end();

      return;
    }

    const upstream = httpRequest(target, { method: request.method, headers: request.headers }, (received) => {
      response.writeHead(received.statusCode ?? 502, received.headers);
      received.pipe(response);
    });

    upstream.on('error', () => {
      response.writeHead(502);
      response.end();
    });
    request.pipe(upstream);
  });

  forward.on('connection', (socket) => {
    sockets.add(socket);
    socket.once('close', () => sockets.delete(socket));
  });
  forward.on('connect', (request, socket, head) => {
    if (request.url !== `visomi.dev:${port}`) {
      socket.destroy();

      return;
    }

    const upstream = connect(port, '127.0.0.1', () => {
      socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');

      if (head.length) {
        upstream.write(head);
      }

      socket.pipe(upstream).pipe(socket);
    });

    upstream.on('error', () => socket.destroy());
    socket.on('error', () => upstream.destroy());
    socket.on('close', () => upstream.destroy());
  });

  const stop = async () => {
    for (const socket of sockets) {
      socket.destroy();
    }

    await Promise.all([
      new Promise<void>((done) => server.close(() => done())),
      new Promise<void>((done) => forward.close(() => done())),
    ]);
  };

  try {
    await new Promise<void>((done, reject) => {
      forward.once('error', reject);
      forward.listen(port + 200, '127.0.0.1', done);
    });

    await new Promise<void>((done, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', done);
    });

    return { certificate, stop };
  } catch (error) {
    await stop();

    throw error;
  }
}
