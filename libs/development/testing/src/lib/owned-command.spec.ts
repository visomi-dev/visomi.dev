import { spawn, type ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';

import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { runOwnedCommand } from './owned-command';

vi.mock('node:child_process', () => ({ spawn: vi.fn() }));
let child: ChildProcess;
const options = { timeout: 10, maxBuffer: 16 };

beforeEach(() => {
  vi.useFakeTimers();
  child = Object.assign(new EventEmitter(), {
    pid: 424242,
    stdout: new PassThrough(),
    stderr: new PassThrough(),
  }) as unknown as ChildProcess;
  vi.mocked(spawn).mockReturnValue(child);
  vi.spyOn(process, 'kill').mockReturnValue(true);
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it('collects bounded streams and closes without retaining timers or abort listeners', async () => {
  const controller = new AbortController();
  const done = runOwnedCommand('synthetic-compose', ['down'], { ...options, signal: controller.signal });

  child.stdout!.emit('data', Buffer.from('out'));
  child.stderr!.emit('data', Buffer.from('err'));
  child.emit('close', 0);

  await expect(done).resolves.toEqual({ stdout: 'out', stderr: 'err' });

  controller.abort();
  expect(process.kill).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});
it.each([true, false])('aborts the whole owned process group, pre-aborted=%s', async (initial) => {
  const controller = new AbortController();

  if (initial) {
    controller.abort();
  }

  const done = runOwnedCommand('synthetic-compose', [], { ...options, signal: controller.signal });

  if (!initial) {
    controller.abort();
  }

  child.emit('close', null);

  await expect(done).rejects.toThrow('isolated_command_aborted');

  expect(process.kill).toHaveBeenCalledWith(-424242, 'SIGKILL');
});
it('terminates a timed out provider and its descendants', async () => {
  const done = runOwnedCommand('synthetic-compose', [], options);

  vi.advanceTimersByTime(10);
  child.emit('close', null);

  await expect(done).rejects.toThrow('isolated_command_timeout');

  expect(process.kill).toHaveBeenCalledWith(-424242, 'SIGKILL');
});
it('stops excessive output without retaining the oversized chunk', async () => {
  const done = runOwnedCommand('synthetic-compose', [], options);

  child.stdout!.emit('data', Buffer.alloc(17));
  child.emit('close', null);

  await expect(done).rejects.toThrow('isolated_command_output_limit');
});
it('keeps errors controlled when the group has already exited', async () => {
  vi.mocked(process.kill).mockImplementation(() => {
    throw new Error('already_exited');
  });
  const done = runOwnedCommand('synthetic-compose', [], options);

  vi.advanceTimersByTime(10);
  child.emit('close', null);

  await expect(done).rejects.toThrow('isolated_command_timeout');
});
it('rejects nonzero exits and spawn failures without exposing command output', async () => {
  const failed = runOwnedCommand('synthetic-compose', [], options);

  child.emit('close', 1);

  await expect(failed).rejects.toThrow('isolated_command_failed');

  Object.assign(child, { pid: undefined, stdout: null, stderr: null });
  const error = new Error('synthetic_spawn_failure');
  const missing = runOwnedCommand('synthetic-compose', [], options);

  vi.advanceTimersByTime(10);
  child.emit('error', error);

  await expect(missing).rejects.toBe(error);

  expect(vi.getTimerCount()).toBe(0);
});

it('finishes after the provider exits even if a descendant retains a pipe', async () => {
  const done = runOwnedCommand('synthetic-compose', [], { ...options, timeout: 1000 });

  child.emit('exit', 0);
  child.stdout!.emit('data', Buffer.from('drained'));
  vi.advanceTimersByTime(100);

  await expect(done).resolves.toEqual({ stdout: 'drained', stderr: '' });

  expect(child.stdout!.destroyed).toBe(true);
  expect(vi.getTimerCount()).toBe(0);
});
