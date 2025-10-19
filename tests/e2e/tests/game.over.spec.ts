import { test, expect } from '@playwright/test';

test.describe('Game Over + auto-restart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?seed=42&e2e=1'); 
    await page.waitForLoadState('networkidle');
  });

  test('top-out triggers Game Over, then auto-restart resets state', async ({ page }) => {
    // Fill all but the topmost spawn space so the next spawn will collide.
    await page.evaluate(() => {
      const H = 20, W = 10;
      const full = Array.from({ length: H }, () => Array(W).fill(0));
      for (let r = 2; r < H; r++) full[r] = full[r].map(() => 1);
      full[2][4] = 0;
      // @ts-ignore
      window.__E2E__?.setGrid(full);
    });

    // Force a piece and drop it to trigger top-out quickly.
    await page.evaluate(() => {
      // @ts-ignore
      window.__E2E__?.forcePiece('O');
    });
    await page.keyboard.press('Space'); // hard drop

    // Assert that the game state reflects Game Over.
    await expect.poll(async () => {
      // @ts-ignore
      return (window as any).__E2E__?.getState();
    }).toMatchObject({ status: 'gameover' });

    await expect.poll(async () => {
      // @ts-ignore
      return (window as any).__E2E__?.getState();
    }, { timeout: 2000 }).toMatchObject({ status: 'running', score: 0, level: 1, lines: 0 });
  });
});
