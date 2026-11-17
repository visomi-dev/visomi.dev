import { randomBytes, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

import { bcrypt } from 'hash-wasm';
import { runOwnedCommand } from '@visomi-stack/dev-testing/lib/owned-command';

// Disposable, loopback-only collector for browser -> intake -> persisted trace acceptance.
export async function browserCollector(signal?: AbortSignal) {
  const engine = process.env['CONTAINER_ENGINE'] || 'docker';
  const name = `visomi-browser-traces-${randomUUID()}`;
  const image = 'jaegertracing/jaeger:2.22.0@sha256:4d9387a02389204ef9a256cf291a36cfbae91983010e403b4d300202d07eff2a';
  const configuration = await readFile(new URL('../../.railway/jaeger.yaml', import.meta.url), 'utf8');
  const password = randomBytes(24).toString('hex');
  const hash = await bcrypt({ password, salt: randomBytes(16), costFactor: 4, outputType: 'encoded' });
  const command = async (args: string[], commandSignal?: AbortSignal) => {
    const result = await runOwnedCommand(engine, args, {
      timeout: 30000,
      maxBuffer: 1024 * 1024,
      signal: commandSignal,
    });

    return result.stdout.trim();
  };
  const stop = async () => {
    await command(['rm', '--force', '--volumes', name]);
  };

  try {
    await command(
      [
        'run',
        '--detach',
        '--name',
        name,
        '--user',
        '0',
        '--publish',
        '127.0.0.1::4318',
        '--publish',
        '127.0.0.1::16686',
        '--volume',
        '/badger',
        '--env',
        `JAEGER_CONFIG=${configuration}`,
        '--env',
        `JAEGER_HTPASSWD=browser:${hash}`,
        image,
        '--config',
        'env:JAEGER_CONFIG',
      ],
      signal,
    );

    const receiverPort = await command(['port', name, '4318/tcp'], signal);
    const receiver = `http://${receiverPort}`;
    const queryPort = await command(['port', name, '16686/tcp'], signal);
    const query = `http://${queryPort}`;

    for (let attempt = 0; ; attempt++) {
      const timeout = AbortSignal.timeout(1000);
      const ready = await fetch(`${query}/api/v3/services`, {
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      }).then(
        async (response) => {
          await response.body?.cancel();

          return response.ok;
        },
        () => false,
      );

      if (ready) {
        break;
      }

      if (attempt === 99) {
        throw new Error('browser_collector_timeout');
      }

      await delay(100, undefined, { signal });
    }
    const authorization = `Basic ${Buffer.from(`browser:${password}`).toString('base64')}`;

    return { query, receiver, headers: `authorization=${encodeURIComponent(authorization)}`, stop };
  } catch {
    await stop().catch(() => undefined);

    throw new Error('browser_collector_setup_failed');
  }
}
