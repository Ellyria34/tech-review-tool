import { test, expect } from '@playwright/test';

/**
 * Sources RSS — Add, toggle, delete sources for a project.
 * Requires a project to exist first (created in beforeEach).
 *
 * All locators scoped to <main> to avoid sidebar ambiguity on desktop.
 */

const PROJECT_NAME = 'Projet Sources Test';
const SOURCE_NAME = 'Hacker News';
const SOURCE_URL = 'https://hnrss.org/frontpage';

test.describe('Sources Management', () => {
  let projectId: string;

  test.beforeEach(async ({ page }) => {
    // Start clean and create a project
    await page.goto('/projects');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const main = page.locator('main');

    // Create a project
    await main.getByRole('button', { name: /Nouveau projet/ }).click();
    await page.fill('#project-name', PROJECT_NAME);
    await main.getByText('Créer', { exact: true }).click();
    await expect(page).toHaveURL(/\/projects/);

    // Open the project to get its ID from the URL
    await main.getByRole('button', { name: `Open project ${PROJECT_NAME}` }).click();
    const url = page.url();
    projectId = url.split('/projects/')[1];

    // Navigate to sources page
    await page.goto(`/projects/${projectId}/sources`);
  });

  test('should show empty state when no sources exist', async ({ page }) => {
    const main = page.locator('main');

    await expect(main.getByText('Aucune source RSS')).toBeVisible();
    await expect(main.getByText('Ajouter une source')).toBeVisible();
  });

  test('should add a new source', async ({ page }) => {
    const main = page.locator('main');

    // Click add button
    await main.getByRole('link', { name: /Ajouter/ }).first().click();

    // Should navigate to source form
    await expect(page).toHaveURL(/\/sources\/new/);
    await expect(main.locator('h2', { hasText: 'Ajouter une source' })).toBeVisible();

    // Fill the form
    await page.fill('#source-name', SOURCE_NAME);
    await page.fill('#source-url', SOURCE_URL);

    // Submit
    await main.getByText('Ajouter', { exact: true }).click();

    // Should redirect back to source list with the new source
    await expect(page).toHaveURL(/\/sources/);
    await expect(main.getByText(SOURCE_NAME)).toBeVisible();
    await expect(main.getByText(SOURCE_URL)).toBeVisible();
  });

  test('should toggle a source active/inactive', async ({ page }) => {
    const main = page.locator('main');

    // Add a source first
    await addSource(page, projectId);

    // Source should be active by default (toggle shows "Disable")
    const toggle = main.getByRole('switch', { name: `Disable ${SOURCE_NAME}` });
    await expect(toggle).toBeVisible();

    // Toggle off
    await toggle.click();

    // Should now show "Enable" (source is inactive)
    await expect(main.getByRole('switch', { name: `Enable ${SOURCE_NAME}` })).toBeVisible();

    // Toggle back on
    await main.getByRole('switch', { name: `Enable ${SOURCE_NAME}` }).click();

    // Should be active again
    await expect(main.getByRole('switch', { name: `Disable ${SOURCE_NAME}` })).toBeVisible();
  });

  test('should delete a source', async ({ page }) => {
    const main = page.locator('main');

    // Add a source first
    await addSource(page, projectId);

    // Source should be visible
    await expect(main.getByText(SOURCE_NAME)).toBeVisible();

    // Listen for the confirm dialog and accept it BEFORE clicking
    page.on('dialog', dialog => dialog.accept());

    // Click delete
    await main.getByRole('button', { name: `Delete ${SOURCE_NAME}` }).click();

    // Source should disappear, empty state should return
    await expect(main.getByText(SOURCE_NAME)).not.toBeVisible();
    await expect(main.getByText('Aucune source RSS')).toBeVisible();
  });
});

/**
 * Helper — adds a source via the UI.
 */
async function addSource(
  page: import('@playwright/test').Page,
  projectId: string
): Promise<void> {
  await page.goto(`/projects/${projectId}/sources/new`);
  await page.fill('#source-name', SOURCE_NAME);
  await page.fill('#source-url', SOURCE_URL);

  const main = page.locator('main');
  await main.getByText('Ajouter', { exact: true }).click();
  await expect(main.getByText(SOURCE_NAME)).toBeVisible();
}