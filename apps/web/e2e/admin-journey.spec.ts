import { test, expect } from '@playwright/test';
import { mockAuthenticatedSession } from './helpers/auth';

test.describe('Admin Journey - Management Paths', () => {
  test('Admin dashboard redirects to login if not authenticated', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    
    // Unauthenticated users trying to hit /admin should see Access Denied or be redirected
    await expect(page).toHaveURL(/.*\/login/, { timeout: 30000 });
  });

  test('Admin curriculum builder redirects to login if not authenticated', async ({ page }) => {
    // Attempting to directly navigate to a restricted admin route
    await page.goto('/admin/courses/c1/curriculum', { waitUntil: 'domcontentloaded' });
    
    await expect(page).toHaveURL(/.*\/login/, { timeout: 30000 });
  });

  test('Admin can access the admin dashboard', async ({ page }) => {
    await mockAuthenticatedSession(page, { role: 'Admin', purpose: 'learn' });

    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    // Look for a heading that indicates admin dashboard
    try {
      await expect(page.locator('h1', { hasText: 'CRM & Analytics Terminal' }).first().or(page.locator('text=Admin Panel').first())).toBeVisible({ timeout: 45000 });
    } catch (e) {
      console.log('FAILED admin dashboard. URL:', page.url());
      console.log('Body snippet:', (await page.content()).substring(0, 500));
      throw e;
    }
    
    // We should see user config links
    await expect(page.locator('text=Configure User Roles').first()).toBeVisible();
  });

  test('Admin can access the curriculum builder', async ({ page }) => {
    await mockAuthenticatedSession(page, { role: 'Admin', purpose: 'learn' });

    await page.goto('/admin/courses/c1/curriculum', { waitUntil: 'domcontentloaded' });

    // Assuming we have a placeholder layout or title for the curriculum builder
    // Or at least it shouldn't show "Access Denied"
    await expect(page.locator('text=Access Denied').first()).not.toBeVisible();
    
    // Check for "Curriculum Builder" text
    try {
      await expect(page.locator('text=Curriculum Builder').first()).toBeVisible({ timeout: 45000 });
    } catch (e) {
      console.log('FAILED curriculum builder. URL:', page.url());
      console.log('Body snippet:', (await page.content()).substring(0, 500));
      throw e;
    }
  });
});
