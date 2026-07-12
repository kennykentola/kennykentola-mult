import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Critical Paths', () => {
  test('Homepage loads successfully', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    // Verify some text or element on the homepage
    await expect(page.locator('text=Your Complete').first()).toBeVisible({ timeout: 10000 });
  });

  test('Login page loads successfully', async ({ page }) => {
    const response = await page.goto('/login', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    // Ensure the login form is visible
    await expect(page.locator('form').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Academy Catalog loads successfully', async ({ page }) => {
    const response = await page.goto('/academy', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
  });

  test('Dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    // It should redirect to login
    await expect(page).toHaveURL(/.*\/login/, { timeout: 30000 });
  });
});
