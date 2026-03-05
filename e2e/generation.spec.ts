import { test, expect } from '@playwright/test';

/**
 * AI Generation — Full end-to-end content generation flow.
 * Tests the core value proposition: select articles → choose format → generate.
 *
 * Uses the mock AI provider (AI_PROVIDER=mock in playwright.config.ts)
 * for deterministic, fast results without external API calls.
 *
 * All locators scoped to <main> or <dialog> to avoid sidebar ambiguity.
 */

const PROJECT_NAME = 'Projet Génération Test';
const SOURCE_NAME = 'Hacker News';
const SOURCE_URL = 'https://hnrss.org/frontpage';

test.describe('AI Content Generation', () => {
  // Run tests sequentially — each test loads RSS, parallel would saturate the feed
  test.describe.configure({ mode: 'serial' });

  let projectId: string;

  test.beforeEach(async ({ page }) => {
    // Start clean
    await page.goto('/projects');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const main = page.locator('main');

    // Create a project
    await main.getByRole('button', { name: /Nouveau projet/ }).click();
    await page.fill('#project-name', PROJECT_NAME);
    await main.getByText('Créer', { exact: true }).click();
    await expect(page).toHaveURL(/\/projects/);

    // Get project ID
    await main.getByRole('button', { name: `Open project ${PROJECT_NAME}` }).click();
    const url = page.url();
    projectId = url.split('/projects/')[1];

    // Add a source
    await addSource(page, projectId);

    // Navigate to articles and wait for loading
    await page.goto(`/projects/${projectId}/articles`);
    const loading = main.getByText('Récupération des articles...');
    await loading.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
    await expect(loading).not.toBeVisible({ timeout: 30_000 });
  });

  test('should generate a synthesis from selected articles', async ({ page }) => {
    const main = page.locator('main');

    // Select 2 articles
    const checkboxes = main.locator('[role="checkbox"]');
    await checkboxes.nth(0).click();
    await checkboxes.nth(1).click();
    await expect(main.getByText(/2\/\d+ article\(s\) sélectionné/)).toBeVisible();

    // Open AI panel
    await main.getByLabel('Générer du contenu IA à partir des articles sélectionnés').click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Select "Synthèse" (should be default, but click to be explicit)
    await dialog.getByRole('radio', { name: /Synthèse/ }).click();

    // Click "Générer" button inside the panel
    await dialog.locator('.generate-btn').click();

    // Wait for generation to complete
    await expect(dialog.getByText('Contenu généré — sauvegardé dans le projet')).toBeVisible({ timeout: 15_000 });

    // Verify action buttons are available (only shown when content is generated)
    await expect(dialog.getByText('Copier')).toBeVisible();
  });

  test('should generate a press review', async ({ page }) => {
    const main = page.locator('main');

    // Select 2 articles
    const checkboxes = main.locator('[role="checkbox"]');
    await checkboxes.nth(0).click();
    await checkboxes.nth(1).click();

    // Open AI panel
    await main.getByLabel('Générer du contenu IA à partir des articles sélectionnés').click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Select "Revue de presse"
    await dialog.getByRole('radio', { name: /Revue de presse/ }).click();

    // Generate
    await dialog.locator('.generate-btn').click();

    // Verify result
    await expect(dialog.getByText('Contenu généré — sauvegardé dans le projet')).toBeVisible({ timeout: 15_000 });
    await expect(dialog.getByText('Copier')).toBeVisible();
  });

  test('should generate a LinkedIn post', async ({ page }) => {
    const main = page.locator('main');

    // Select 2 articles
    const checkboxes = main.locator('[role="checkbox"]');
    await checkboxes.nth(0).click();
    await checkboxes.nth(1).click();

    // Open AI panel
    await main.getByLabel('Générer du contenu IA à partir des articles sélectionnés').click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Select "Post LinkedIn"
    await dialog.getByRole('radio', { name: /LinkedIn/ }).click();

    // Generate
    await dialog.locator('.generate-btn').click();

    // Verify result
    await expect(dialog.getByText('Contenu généré — sauvegardé dans le projet')).toBeVisible({ timeout: 15_000 });
    await expect(dialog.getByText('Copier')).toBeVisible();
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