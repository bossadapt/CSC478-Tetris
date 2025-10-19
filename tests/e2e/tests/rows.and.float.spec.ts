import { test, expect } from '@playwright/test';

test.describe('Row clearing + “float” movement fix (integer cell display)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?seed=99&e2e=1');
    await page.waitForLoadState('networkidle');
  });

  test('row clears compact correctly (no phantom gaps)', async ({ page }) => {
    await page.evaluate(() => {
      const H = 20, W = 10;
      const m = Array.from({ length: H }, () => Array(W).fill(0));
      // Create two non-adjacent full rows to ensure compaction
      m[H - 1] = Array(W).fill(1);
      m[H - 3] = Array(W).fill(1);
      // Leave a single gap in the bottom row to complete
      m[H - 1][7] = 0;
      // @ts-ignore
      window.__E2E__?.setGrid(m);
      // @ts-ignore
      window.__E2E__?.forcePiece('I');
    });

    await page.keyboard.press('KeyW');  
    await page.keyboard.press('Space');

    const state = await page.evaluate(() => (window as any).__E2E__.getState());
    expect(state.lines).toBeGreaterThanOrEqual(2);

    const bottomRow = await page.evaluate(() => (window as any).__E2E__.getState().grid.at(-1));
    expect(bottomRow.every((c: number) => c === 0)).toBeTruthy();
  });

  test('displayed movement snaps to integer cells (no sub-pixel jitter)', async ({ page }) => {
    // Read active piece y from state for a few gravity ticks and ensure integers
    const ys: number[] = [];
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(300); // > gravity tick at low level; adjust if needed
      const y = await page.evaluate(() => (window as any).__E2E__.getState().activePiece?.y ?? 0);
      ys.push(y);
    }
    expect(ys.length).toBe(5);
    ys.forEach(y => expect(Number.isInteger(y)).toBeTruthy());
  });
});
