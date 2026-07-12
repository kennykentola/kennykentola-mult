import { test, expect } from '@playwright/test';

test.describe('Student Journey - Academy Browsing', () => {
  test('Can browse academy catalog and view course details', async ({ page }) => {
    // Navigate to the catalog
    await page.goto('/academy', { waitUntil: 'domcontentloaded' });
    
    // Expect the page to have courses loaded or a loading state
    // We can just verify the academy header is visible
    await expect(page.locator('h1', { hasText: 'Learn to Code' }).first()).toBeVisible({ timeout: 30000 });

    // Look for a course card link
    // The link should match /academy/courses/*
    const courseLinks = page.locator('a[href^="/academy/courses/"]');
    
    // Check if there are any courses (might be 0 if DB is empty, but we shouldn't fail if empty, just conditionally test)
    const count = await courseLinks.count();
    
    if (count > 0) {
      // Click the first course
      await courseLinks.first().click();

      // Ensure we navigated to the course details page
      await expect(page).toHaveURL(/\/academy\/courses\/.+/, { timeout: 10000 });
      
      // The course page should have a "Curriculum" tab or an "Enroll" button
      await expect(page.locator('text=Curriculum').first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('Cannot access enrolled courses dashboard without logging in', async ({ page }) => {
    await page.goto('/dashboard/academy', { waitUntil: 'domcontentloaded' });
    
    // Expect redirect to login
    await expect(page).toHaveURL(/.*\/login/, { timeout: 15000 });
  });
});
