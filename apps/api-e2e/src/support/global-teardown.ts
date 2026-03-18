import { readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

/* eslint-disable */
const API_SERVER_PID_PATH = resolve(__dirname, '../../.api-e2e-server.pid');

module.exports = async function () {
  try {
    const pid = Number((await readFile(API_SERVER_PID_PATH, 'utf8')).trim());

    if (!Number.isNaN(pid)) {
      process.kill(pid, 'SIGTERM');
    }
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code !== 'ENOENT' && nodeError.code !== 'ESRCH') {
      throw error;
    }
  }

  await rm(API_SERVER_PID_PATH, { force: true });
  console.log(globalThis.__TEARDOWN_MESSAGE__);
};
