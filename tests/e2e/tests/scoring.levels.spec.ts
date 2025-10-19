import { test, expect } from '@playwright/test';

const SCORE = {
  single: 100,
  double: 300,
  triple: 500,
  tetris: 800
}; 
const LINES_PER_LEVEL = 10; 

test.describe('Scoring + Level System (speed & multiplier)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?seed=7&e2e=1');
    await page.waitForLoadState('networkidle');
    await page.reload();
  });

  test('single-line clear awards base points × level', async ({ page }) => {
    await page.evaluate(() => {
      const H = 20, W = 10;
      const m = Array.from({ length: H }, () => Array(W).fill(0));
        // Make bottom row full except one gap at column 5
      m[H - 1] = Array(W).fill(1); m[H - 1][5] = 0;
      // @ts-ignore
      window.__E2E__?.setGrid(m);
      // @ts-ignore
      window.__E2E__?.forcePiece('I');
    });

    const { level: L0, score: S0, gravityMs: G0 } = await page.evaluate(() => (window as any).__E2E__.getState());
    await page.keyboard.press('KeyW');    
    await page.keyboard.press('Space'); 

    const state = await page.evaluate(() => (window as any).__E2E__.getState());
    expect(state.lines).toBe(1);
    expect(state.score).toBe(S0 + SCORE.single * L0);
    expect(state.level).toBe(L0); 
    expect(state.gravityMs).toBe(G0);
  });

  test('multi-line clear (Tetris) and scoring', async ({ page }) => {
    await page.evaluate(() => {
      const H = 20, W = 10;
      const m = Array.from({ length: H }, () => Array(W).fill(0));
      // Make bottom 4 rows full except one column 0:3
      for (let r = H - 4; r < H; r++) { m[r] = Array(W).fill(1); m[r][0] = 0; }
      // @ts-ignore
      window.__E2E__?.setGrid(m);
      // @ts-ignore
      window.__E2E__?.forcePiece('I');
    });

    const { level: L0, score: S0 } = await page.evaluate(() => (window as any).__E2E__.getState());
    // Ensure vertical (no rotate) and drop in column 0
    await page.keyboard.down('ArrowLeft'); for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowLeft'); await page.keyboard.up('ArrowLeft');
    await page.keyboard.press('Space');

    const state = await page.evaluate(() => (window as any).__E2E__.getState());
    expect(state.lines).toBe(4);
    expect(state.score).toBe(S0 + SCORE.tetris * L0);
  });

  test('level-up reduces gravity interval and increases points per clear', async ({ page }) => {
    // Pre-load lines close to next level
    await page.evaluate((LINES_PER_LEVEL) => {
      const H = 20, W = 10;
      const m = Array.from({ length: H }, () => Array(W).fill(0));
      // @ts-ignore
      const st = window.__E2E__?.getState();
      // @ts-ignore
      window.__E2E__?.setGrid(m);
        // Simulate lines cleared to just below next level
    }, LINES_PER_LEVEL);

    const s0 = await page.evaluate(() => (window as any).__E2E__.getState());
    const baseLevel = s0.level;
    const baseG = s0.gravityMs;

    // Clear enough lines to level up (do a double then a double)
    for (let n = 0; n < 2; n++) {
      await page.evaluate(() => {
        const H = 20, W = 10;
        const m = Array.from({ length: H }, () => Array(W).fill(0));
        for (let r = H - 2; r < H; r++) { m[r] = Array(W).fill(1); m[r][5] = 0; }
        // @ts-ignore
        window.__E2E__?.setGrid(m);
        // @ts-ignore
        window.__E2E__?.forcePiece('I');
      });
      await page.keyboard.press('KeyW');  // horizontal I
      await page.keyboard.press('Space'); // finish the two lines
    }

    const s1 = await page.evaluate(() => (window as any).__E2E__.getState());
    expect(s1.level).toBeGreaterThan(baseLevel);
    expect(s1.gravityMs).toBeLessThan(baseG); 

    // Verify scoring multiplier effect by clearing a single line now
    const scoreBefore = s1.score;
    await page.evaluate(() => {
      const H = 20, W = 10; const m = Array.from({ length: H }, () => Array(W).fill(0));
      m[H - 1] = Array(W).fill(1); m[H - 1][4] = 0;
      // @ts-ignore
      window.__E2E__?.setGrid(m);
      // @ts-ignore
      window.__E2E__?.forcePiece('I');
    });
    await page.keyboard.press('KeyW');
    await page.keyboard.press('Space');
    const s2 = await page.evaluate(() => (window as any).__E2E__.getState());
    expect(s2.score - scoreBefore).toBe(SCORE.single * s1.level);
  });
});
