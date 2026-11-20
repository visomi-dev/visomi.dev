import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runOwnedCommand } from '@visomi-stack/dev-testing/lib/owned-command';

import { jaegerImage } from '../../.railway/jaeger-image';

export { jaegerImage };

type JaegerFixtureOptions = {
  prefix: 'visomi-browser-traces' | 'visomi-jaeger-check';
  configuration: string;
  htpasswd: string;
  signal?: AbortSignal;
};

export async function localJaeger({ prefix, configuration, htpasswd, signal }: JaegerFixtureOptions) {
  signal?.throwIfAborted();

  const env = {
    ...process.env,
    CONTAINER_HOST: undefined,
    CONTAINER_CONNECTION: undefined,
    DOCKER_HOST: undefined,
    DOCKER_CONTEXT: undefined,
    JAEGER_CONFIG: configuration,
    JAEGER_HTPASSWD: htpasswd,
  };
  const rootless = await runOwnedCommand(
    'podman',
    ['--remote=false', 'info', '--format', '{{.Host.Security.Rootless}}'],
    {
      env,
      timeout: 10000,
      maxBuffer: 1024 * 1024,
    },
  );

  if (rootless.stdout.trim() !== 'true') {
    throw new Error('local_jaeger_requires_rootless_podman');
  }

  signal?.throwIfAborted();

  const project = `${prefix}-${randomUUID()}`;
  const directory = await mkdtemp(join(tmpdir(), `${project}-`));
  const compose = (args: string[]) =>
    runOwnedCommand(
      'podman',
      ['--remote=false', 'compose', '--env-file', 'compose.env', '-f', 'compose.json', '-p', project, ...args],
      { cwd: directory, env, timeout: 40000, maxBuffer: 1024 * 1024 },
    );
  const manifest = {
    services: {
      jaeger: {
        image: jaegerImage,
        user: '0',
        command: ['--config', 'env:JAEGER_CONFIG'],
        environment: ['JAEGER_CONFIG', 'JAEGER_HTPASSWD'],
        ports: ['127.0.0.1::4318', '127.0.0.1::16686'],
        volumes: ['data:/badger'],
      },
    },
    volumes: { data: {} },
  };
  let startupAttempted = false;
  let cleanup: Promise<void> | undefined;
  const stop = () =>
    (cleanup ??= (async () => {
      if (startupAttempted) {
        await compose(['down', '--timeout', '10', '--volumes']);
      }

      await rm(directory, { recursive: true, force: true });
    })());

  async function discoverPort(port: '4318' | '16686') {
    const result = await compose(['port', 'jaeger', port]);
    const match = /^127\.0\.0\.1:(\d+)$/.exec(result.stdout.trim());
    const published = Number(match?.[1]);

    if (!Number.isInteger(published) || published < 1 || published > 65535) {
      throw new Error('local_jaeger_loopback_port_unavailable');
    }

    return `http://127.0.0.1:${published}`;
  }

  async function discoverPorts() {
    signal?.throwIfAborted();

    const receiver = await discoverPort('4318');
    const query = await discoverPort('16686');

    signal?.throwIfAborted();

    return { receiver, query };
  }

  try {
    await writeFile(join(directory, 'compose.json'), JSON.stringify(manifest));

    await writeFile(join(directory, 'compose.env'), '');

    signal?.throwIfAborted();
    startupAttempted = true;

    // Let Compose finish its owned mutation before cancellation can trigger `down`.
    await compose(['up', '-d', 'jaeger']);

    const ports = await discoverPorts();

    return {
      ...ports,
      async stopReceiver() {
        signal?.throwIfAborted();

        await compose(['stop', '--timeout', '10', 'jaeger']);
      },
      async startReceiver() {
        signal?.throwIfAborted();

        await compose(['start', 'jaeger']);

        return discoverPorts();
      },
      stop,
    };
  } catch (error) {
    await stop();

    throw error;
  }
}
