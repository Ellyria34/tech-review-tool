import { test, expect } from '@playwright/test';

/**
 * Smoke tests — verify the app loads and core layout is present.
 * These are the most basic E2E tests: if they fail, nothing else works.
 */

test.describe('App Shell', () => {
  test('should load the home page and redirect to /projects', async ({ page }) => {
    await page.goto('/');

    // App should redirect to /projects
    await expect(page).toHaveURL(/\/projects/);
  });

  test('should display the correct navigation for the viewport', async ({ page }) => {
    await page.goto('/projects');
    const viewport = page.viewportSize();

    if (viewport && viewport.width >= 1024) {
      // Desktop: sidebar navigation
      const sidebar = page.locator('app-sidebar');
      await expect(sidebar).toBeVisible();
    } else {
      // Mobile: header + bottom nav
      const header = page.locator('app-header');
      await expect(header).toBeVisible();
    }
  });

  test('should show empty state when no projects exist', async ({ page }) => {
    // Clear localStorage to ensure no projects
    await page.goto('/projects');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Should show a message or button to create a project
    const createButton = page.getByRole('button', { name: /nouveau|créer|create/i });
    await expect(createButton).toBeVisible();
  });
});