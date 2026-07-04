import { test, expect } from '@playwright/test';

test.describe('Mouzika Studio — smoke', () => {
  test('landing renders the hero and primary CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('finished track');
    await expect(page.getByRole('link', { name: /Start learning free/i }).first()).toBeVisible();
  });

  test('onboarding flow reaches the ready screen and lands in the app', async ({ page }) => {
    await page.goto('/onboarding');
    // step 1 — pick a goal, continue is disabled until a choice is made
    await page.getByText('Make my first track').click();
    await page.getByRole('button', { name: /Continue/i }).click();
    // step 2 — genre
    await page.getByText('House', { exact: true }).first().click();
    await page.getByRole('button', { name: /Continue/i }).click();
    // step 3 — level
    await page.getByText('Total beginner').click();
    await page.getByRole('button', { name: /Continue/i }).click();
    // step 4 — time
    await page.getByText('10 min').click();
    await page.getByRole('button', { name: /Continue/i }).click();
    // ready screen
    await expect(page.getByRole('heading', { name: /Your path is ready/i })).toBeVisible();
    await page.getByRole('button', { name: /Start learning/i }).click();
    await expect(page).toHaveURL(/\/learn$/);
  });

  test('the beat sequencer is interactive and Web Audio boots', async ({ page }) => {
    await page.goto('/lesson');
    // deterministic: a Perc step starts off and toggles on when tapped
    const cell = page.getByRole('button', { name: 'Perc step 1', exact: true });
    await expect(cell).toHaveAttribute('aria-pressed', 'false');
    await cell.click();
    await expect(cell).toHaveAttribute('aria-pressed', 'true');
    // audio boot: clicking play swaps to a Stop control (allow time for Tone to load)
    const play = page.getByRole('button', { name: 'Play loop' });
    await play.click();
    await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible({ timeout: 15000 });
  });

  test('EQ challenge scores a guess', async ({ page }) => {
    await page.goto('/practice/eq');
    await expect(page.getByRole('heading', { name: /EQ Challenge/i })).toBeVisible();
    await page.getByRole('button', { name: 'Boosted' }).click();
    // any frequency option ends the round and reveals a result
    await page.getByRole('button', { name: '1 kHz' }).click();
    await expect(page.getByRole('button', { name: /Next round/i })).toBeVisible();
  });

  test('AI tutor answers a question (fallback works with no API key)', async ({ page }) => {
    await page.goto('/tutor');
    await page.getByRole('button', { name: /sidechain the bass/i }).click();
    // the tutor reply bubble should mention compression/kick
    await expect(page.getByText(/compressor|kick|ducks/i).last()).toBeVisible({ timeout: 5000 });
  });

  test('language switch to Arabic flips the document to RTL', async ({ page }) => {
    // use a mobile viewport so the header language switch is on-screen and the
    // hidden desktop-rail duplicate is excluded from the accessibility tree
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/learn');
    await page.getByRole('banner').getByRole('button', { name: 'Switch language to AR' }).click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('key routes return 200', async ({ page }) => {
    for (const path of ['/studio', '/codex', '/discover', '/profile', '/leaderboard', '/pricing', '/feedback', '/admin']) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(200);
    }
  });
});
