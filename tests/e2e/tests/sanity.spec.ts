import { test, expect } from '@playwright/test';

test('app boots', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/react/i); // or a heading/test-id in your UI
});

test('keyboard works (example)', async ({ page }) => {
  await page.goto('/?seed=42');           // deterministic spawn if you support it
  await page.keyboard.press('KeyS');      // soft drop
  await page.keyboard.press('KeyA');      // move left
  await page.keyboard.press('KeyW');      // rotate
  // assert via role/test-id or a test hook exposed when REACT_APP_E2E=1
});
