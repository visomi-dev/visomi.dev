import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

import { waitForPortOpen } from '@nx/node/utils';

/* eslint-disable */
var __TEARDOWN_MESSAGE__: string;
const API_SERVER_PID_PATH = resolve(__dirname, '../../.api-e2e-server.pid');
const API_SERVER_ENTRYPOINT = resolve(__dirname, '../../../../dist/apps/api/main.js');

module.exports = async function () {
  console.log('\nSetting up...\n');

  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;

  const serverProcess = spawn(process.execPath, [API_SERVER_ENTRYPOINT], {
    env: {
      ...process.env,
      HOST: host,
      PORT: String(port),
    },
    stdio: 'inherit',
  });

  if (serverProcess.pid == null) {
    throw new Error('Failed to start API server process for e2e tests.');
  }

  await writeFile(API_SERVER_PID_PATH, String(serverProcess.pid));

  try {
    await waitForPortOpen(port, { host });
  } catch (error) {
    serverProcess.kill('SIGTERM');
    throw error;
  }

  // Hint: Use `globalThis` to pass variables to global teardown.
  globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
};
