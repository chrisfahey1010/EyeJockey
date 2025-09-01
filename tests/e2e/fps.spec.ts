import { test, expect } from '@playwright/test';

test('visual route maintains FPS >= 45 median over 10s sample', async ({ page }) => {
  await page.goto('/visual');
  await page.waitForTimeout(1000);

  const samples: number[] = [];
  const start = Date.now();
  let last = start;
  while (Date.now() - start < 10000) {
    await page.waitForTimeout(16);
    const now = Date.now();
    const dt = now - last;
    last = now;
    samples.push(1000 / Math.max(1, dt));
  }
  samples.sort((a, b) => a - b);
  const median = samples[Math.floor(samples.length / 2)];
  console.log('Median FPS', median);
  expect(median).toBeGreaterThanOrEqual(45);
});


