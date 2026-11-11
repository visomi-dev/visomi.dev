import { describe, expect, it } from 'vitest';

import { initNavbar } from './navbar';

describe('initNavbar', () => {
  it('toggles the mobile menu visibility', () => {
    document.body.innerHTML = `
      <button id="mobile-menu-btn"></button>
      <div id="mobile-menu" class="hidden"></div>
    `;

    initNavbar();

    document.getElementById('mobile-menu-btn')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(document.getElementById('mobile-menu')?.classList.contains('hidden')).toBe(false);

    document.getElementById('mobile-menu-btn')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(document.getElementById('mobile-menu')?.classList.contains('hidden')).toBe(true);
  });
});
