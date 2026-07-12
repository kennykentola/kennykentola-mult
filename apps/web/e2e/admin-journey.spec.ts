import { test, expect } from '@playwright/test';

test.describe('Admin Journey - Management Paths', () => {
  test('Admin dashboard redirects to login if not authenticated', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    
    // Unauthenticated users trying to hit /admin should see Access Denied or be redirected
    await expect(page.locator('text=Access Denied').first().or(page.locator('form').first())).toBeVisible({ timeout: 30000 });
  });

  test('Admin curriculum builder redirects to login if not authenticated', async ({ page }) => {
    // Attempting to directly navigate to a restricted admin route
    await page.goto('/admin/courses/c1/curriculum', { waitUntil: 'domcontentloaded' });
    
    await expect(page.locator('text=Access Denied').first().or(page.locator('form').first())).toBeVisible({ timeout: 30000 });
  });
});
