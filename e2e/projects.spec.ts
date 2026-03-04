import { test, expect } from '@playwright/test';

/**
 * Project CRUD — Full lifecycle test.
 * Creates a project, verifies it appears, edits it, then deletes it.
 *
 * All locators are scoped to <main> to avoid matching sidebar elements on desktop.
 */

const PROJECT_NAME = 'Veille IA Test';
const PROJECT_DESC = 'Projet de test E2E';
const PROJECT_NAME_EDITED = 'Veille IA Modifié';

test.describe('Project CRUD', () => {

  test.beforeEach(async ({ page }) => {
    // Start with a clean state
    await page.goto('/projects');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should create a new project', async ({ page }) => {
    const main = page.locator('main');

    // 1. Click "Nouveau projet" button in main content
    await main.getByRole('button', { name: /Nouveau projet/ }).click();

    // 2. Should navigate to the creation form
    await expect(page).toHaveURL(/\/projects\/new/);
    await expect(main.locator('h2', { hasText: 'Nouveau projet' })).toBeVisible();

    // 3. Fill the form
    await page.fill('#project-name', PROJECT_NAME);
    await page.fill('#project-desc', PROJECT_DESC);

    // 4. Select an icon
    const iconGroup = page.locator('[aria-labelledby="icon-label"]');
    await iconGroup.locator('button').first().click();

    // 5. Select a color
    const colorGroup = page.locator('[aria-labelledby="color-label"]');
    await colorGroup.locator('button').first().click();

    // 6. Submit
    await main.getByText('Créer', { exact: true }).click();

    // 7. Should redirect to the project list with the new project visible
    await expect(page).toHaveURL(/\/projects/);
    await expect(main.getByText(PROJECT_NAME)).toBeVisible();
  });

  test('should display the project in the list', async ({ page }) => {
    const main = page.locator('main');

    // Create a project first (setup)
    await createProject(page);

    // Navigate back to project list
    await page.goto('/projects');

    // Project should appear in the list
    await expect(main.getByText(PROJECT_NAME)).toBeVisible();
    await expect(main.getByText(PROJECT_DESC)).toBeVisible();
  });

  test('should open the project workspace', async ({ page }) => {
    const main = page.locator('main');

    // Create a project first (setup)
    await createProject(page);
    await page.goto('/projects');

    // Click on the project card
    await main.getByRole('button', { name: `Open project ${PROJECT_NAME}` }).click();

    // Should navigate to the workspace
    await expect(page).toHaveURL(/\/projects\/.+/);
    await expect(main.getByText(`Projet : ${PROJECT_NAME}`)).toBeVisible();

    // Stats should be visible in main content
    await expect(main.locator('.grid-cols-3')).toBeVisible();
  });

  test('should edit a project', async ({ page }) => {
    const main = page.locator('main');

    // Create a project first (setup)
    await createProject(page);

    // Navigate into the project workspace
    await main.getByRole('button', { name: `Open project ${PROJECT_NAME}` }).click();
    await expect(main.getByText(`Projet : ${PROJECT_NAME}`)).toBeVisible();

    // Click edit button
    await main.getByRole('button', { name: `Modifier ${PROJECT_NAME}` }).click();

    // Should navigate to edit form
    await expect(page).toHaveURL(/\/projects\/.+\/edit/);
    await expect(main.getByText('Modifier le projet')).toBeVisible();

    // Name should be pre-filled (wait for async patchValue)
    const nameInput = page.locator('#project-name');
    await expect(nameInput).not.toHaveValue('');
    await expect(nameInput).toHaveValue(PROJECT_NAME);

    // Change the name
    await nameInput.clear();
    await nameInput.fill(PROJECT_NAME_EDITED);

    // Save
    await main.getByText('Enregistrer', { exact: true }).click();

    // Should show the updated name
    await expect(main.getByText(PROJECT_NAME_EDITED)).toBeVisible();
  });

  test('should delete a project', async ({ page }) => {
    const main = page.locator('main');

    // Create a project first (setup)
    await createProject(page);
    await page.goto('/projects');

    // Click delete on the card
    await main.getByRole('button', { name: `Delete project ${PROJECT_NAME}` }).click();

    // Project should disappear from the list
    await expect(main.getByText(PROJECT_NAME)).not.toBeVisible();

    // Empty state should appear
    await expect(main.getByText('Aucun projets')).toBeVisible();
  });
});

/**
 * Helper — creates a project via the UI.
 * Scoped to <main> to avoid sidebar ambiguity on desktop.
 */
async function createProject(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/projects');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const main = page.locator('main');
  await main.getByRole('button', { name: /Nouveau projet/ }).click();
  await page.fill('#project-name', PROJECT_NAME);
  await page.fill('#project-desc', PROJECT_DESC);

  const iconGroup = page.locator('[aria-labelledby="icon-label"]');
  await iconGroup.locator('button').first().click();

  const colorGroup = page.locator('[aria-labelledby="color-label"]');
  await colorGroup.locator('button').first().click();

  await main.getByText('Créer', { exact: true }).click();
  await expect(page).toHaveURL(/\/projects/);
}