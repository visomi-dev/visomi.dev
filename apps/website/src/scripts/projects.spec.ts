import { describe, expect, it } from 'vitest';

import { initProjects } from './projects';

describe('initProjects', () => {
  it('filters cards and swaps the selected preview image', () => {
    document.body.innerHTML = `
      <button class="filter-btn" data-filter="ALL"></button>
      <button class="filter-btn" data-filter="FINTECH"></button>
      <article class="project-card" data-category="FINTECH"></article>
      <article class="project-card" data-category="PLATFORM"></article>
      <p data-project-caption-step="demo">Flow step 01</p>
      <h3 data-project-caption-title="demo">first</h3>
      <p data-project-caption-body="demo">first description</p>
      <img data-project-preview="demo" src="/first.png" alt="first" />
      <button
        data-project-thumb="demo"
        data-image-src="/first.png"
        data-image-alt="first"
        data-caption-step="Flow step 01"
        data-caption-title="first"
        data-caption-body="first description"
      ></button>
      <button
        data-project-thumb="demo"
        data-image-src="/second.png"
        data-image-alt="second"
        data-caption-step="Flow step 02"
        data-caption-title="second"
        data-caption-body="second description"
      ></button>
    `;

    initProjects();

    const fintechFilter = document.querySelectorAll<HTMLButtonElement>('.filter-btn')[1];
    const cards = document.querySelectorAll<HTMLElement>('.project-card');
    const thumbs = document.querySelectorAll<HTMLButtonElement>('[data-project-thumb]');
    const preview = document.querySelector<HTMLImageElement>('[data-project-preview="demo"]');
    const captionStep = document.querySelector<HTMLElement>('[data-project-caption-step="demo"]');
    const captionTitle = document.querySelector<HTMLElement>('[data-project-caption-title="demo"]');
    const captionBody = document.querySelector<HTMLElement>('[data-project-caption-body="demo"]');

    fintechFilter?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(cards[0]?.style.display).toBe('');
    expect(cards[1]?.style.display).toBe('none');

    thumbs[1]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(preview?.getAttribute('src')).toBe('/second.png');
    expect(preview?.getAttribute('alt')).toBe('second');
    expect(captionStep?.textContent).toBe('Flow step 02');
    expect(captionTitle?.textContent).toBe('second');
    expect(captionBody?.textContent).toBe('second description');
    expect(thumbs[1]?.classList.contains('ring-1')).toBe(true);
    expect(thumbs[1]?.getAttribute('aria-pressed')).toBe('true');
  });
});
