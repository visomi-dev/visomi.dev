import { expect, type Locator, type Page, type TestInfo } from '@playwright/test';

async function expectNativeInsertionPoints(pin: Locator, slot: number, path: string, unselected?: Buffer) {
  // Chromium captures the colored caret. Headless Firefox and WebKit capture the native selection endpoints.
  let offsets: number[] = [];

  await expect
    .poll(
      async () => {
        const screenshot = await pin.screenshot({ caret: unselected ? 'hide' : 'initial', scale: 'css', path });

        const measuredOffsets = await pin.evaluate(
          async (host, { image, baseline, slot }) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d')!;
            const decode = async (png: string) => {
              const bytes = Uint8Array.from(atob(png), (character) => character.charCodeAt(0));
              const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));

              canvas.width = bitmap.width;
              canvas.height = bitmap.height;
              context.drawImage(bitmap, 0, 0);
              bitmap.close();

              return context.getImageData(0, 0, canvas.width, canvas.height);
            };
            let reference: ImageData | null = null;

            if (baseline) {
              const decodedBaseline = await decode(baseline);

              reference = decodedBaseline;
            }

            const { data, width } = await decode(image);
            let pixelCount = 0;
            let left = width;
            let right = 0;

            for (let pixel = 0; pixel < data.length; pixel += 4) {
              const highlighted = reference
                ? Math.abs(data[pixel] - reference.data[pixel]) +
                    Math.abs(data[pixel + 1] - reference.data[pixel + 1]) >
                  100
                : data[pixel] >= 200 && data[pixel + 1] <= 80 && data[pixel + 2] >= 200;

              if (highlighted) {
                const x = (pixel / 4) % width;

                pixelCount++;
                left = Math.min(left, x);
                right = Math.max(right, x + 1);
              }
            }

            if (pixelCount < 6) {
              return [];
            }

            const field = host.getBoundingClientRect();
            const cells = host.querySelectorAll('.slot');
            const center = (index: number) => {
              const cell = cells[index].getBoundingClientRect();

              return cell.left + cell.width / 2 - field.left;
            };

            return reference ? [left - center(0), right - center(slot)] : [(left + right) / 2 - center(slot)];
          },
          { image: screenshot.toString('base64'), baseline: unselected?.toString('base64'), slot },
        );

        offsets = measuredOffsets;

        return measuredOffsets.length;
      },
      { message: `native insertion points must be visible through slot ${slot + 1}` },
    )
    .toBe(unselected ? 2 : 1);

  const distance = Math.max(...offsets.map(Math.abs));

  expect.soft(distance, `native insertion points align with slot centers through slot ${slot + 1}`).toBeLessThan(2);
}

export async function checkPinInsertionPoints(
  page: Page,
  pin: Locator,
  verification: Locator,
  browserName: string,
  info: TestInfo,
) {
  const initialViewport = page.viewportSize()!;
  const captureCaret = browserName === 'chromium';

  if (captureCaret) {
    await verification.evaluate((control) => control.style.setProperty('caret-color', '#ff00ff'));
  }

  try {
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 844 });

      await page.evaluate(() => document.fonts.ready);

      await expect(verification).toBeFocused();

      await expect(verification).toHaveValue('');

      if (captureCaret) {
        await expectNativeInsertionPoints(pin, 0, info.outputPath(`caret-${width}-empty.png`));
      }

      for (const [typed, value] of [
        ['0', '0'],
        ['0123', '00123'],
      ]) {
        await verification.pressSequentially(typed);

        await expect(verification).toHaveValue(value);

        if (captureCaret) {
          await expectNativeInsertionPoints(pin, value.length, info.outputPath(`caret-${width}-${value.length}.png`));
        } else {
          const unselected = await pin.screenshot({ scale: 'css' });

          await verification.press('Shift+Home');

          await expectNativeInsertionPoints(
            pin,
            value.length,
            info.outputPath(`selection-${width}-${value.length}.png`),
            unselected,
          );

          await verification.press('End');
        }
      }

      await verification.clear();
    }
  } finally {
    if (captureCaret) {
      await verification.evaluate((control) => control.style.removeProperty('caret-color'));
    }

    await page.setViewportSize(initialViewport);
  }
}
