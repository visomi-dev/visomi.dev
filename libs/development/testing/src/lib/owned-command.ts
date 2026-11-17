import { spawn, type SpawnOptions } from 'node:child_process';

export function runOwnedCommand(
  command: string,
  args: string[],
  options: SpawnOptions & { timeout: number; maxBuffer: number; signal?: AbortSignal },
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    let size = 0;
    let failure: Error | undefined;
    let drain: ReturnType<typeof setTimeout> | undefined;
    const terminate = () => {
      if (child.pid) {
        try {
          process.kill(-child.pid, 'SIGKILL');
        } catch {
          /* Owned process already exited. */
        }
      }
    };
    const abort = () => {
      failure = new Error('isolated_command_aborted');
      terminate();
    };
    const timer = setTimeout(() => {
      failure = new Error('isolated_command_timeout');
      terminate();
    }, options.timeout);
    const cleanup = () => {
      clearTimeout(timer);
      clearTimeout(drain);
      options.signal?.removeEventListener('abort', abort);
    };

    options.signal?.addEventListener('abort', abort, { once: true });

    if (options.signal?.aborted) {
      abort();
    }

    const append = (target: 'stdout' | 'stderr', chunk: Buffer) => {
      size += chunk.length;

      if (size > options.maxBuffer) {
        failure = new Error('isolated_command_output_limit');
        terminate();

        return;
      }

      if (target === 'stdout') {
        stdout += chunk.toString();
      } else {
        stderr += chunk.toString();
      }
    };

    child.stdout?.on('data', (chunk) => append('stdout', chunk));
    child.stderr?.on('data', (chunk) => append('stderr', chunk));
    child.once('error', (error) => {
      cleanup();
      reject(error);
    });
    const finish = (code: number | null) => {
      cleanup();

      if (failure) {
        reject(failure);
      } else if (code !== 0) {
        reject(new Error('isolated_command_failed'));
      } else {
        resolve({ stdout, stderr });
      }
    };

    child.once('close', finish);
    // A provider may exit while its detached descendants retain pipe handles. Drain buffered
    // output briefly, then complete from the provider's real exit status instead of hanging.
    child.once('exit', (code) => {
      drain = setTimeout(() => {
        child.stdout?.destroy();
        child.stderr?.destroy();
        finish(code);
      }, 100);
    });
  });
}
