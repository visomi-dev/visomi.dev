import { expect, it, vi } from 'vitest';

import createLogger from './logger.mjs';

it('bounds renderer diagnostics without inspecting messages, requests or stacks', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

  try {
    const logger = createLogger();
    const event = Object.defineProperty({ level: 'error' }, 'message', {
      get() {
        throw new Error('SYNTHETIC_PRIVATE_SSR');
      },
    });

    logger.write(event);
    logger.write({ level: 'warn', message: 'SYNTHETIC_PRIVATE_SSR' });
    logger.write({ level: 'info', message: 'SYNTHETIC_PRIVATE_SSR' });
    expect(error).toHaveBeenCalledExactlyOnceWith('{"event":"site.render_failed"}');
    expect(warn).toHaveBeenCalledExactlyOnceWith('{"event":"site.render_warning"}');
  } finally {
    error.mockRestore();
    warn.mockRestore();
  }
});
