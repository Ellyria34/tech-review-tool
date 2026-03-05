import {test, expect} from '@playwright/test';

/**
 * Articles — Filter, Select and generate content.
 * Requires a project and sources to exist first (created in beforeEach).
 *
 * All locators scoped to <main> to avoid sidebar ambiguity on desktop.
 */

const PROJECT_NAME = 'Projet Sources Test';
const SOURCE_NAME = 'Hacker News';
const SOURCE_URL = 'https://hnrss.org/frontpage';

test.describe('Article Management', () => {
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
    // Add a source first
    await addSource(page, projectId);
    
    // Navigate to articles page
    await page.goto(`/projects/${projectId}/articles`);
    const loading = main.getByText('Récupération des articles...');
    await loading.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
    await expect(loading).not.toBeVisible({ timeout: 30_000 });
  });

  test('should show display article after loading', async ({ page }) => {
    const main = page.locator('main');

    await expect(main.getByText('💡 Cochez des articles, puis cliquez sur')).toBeVisible();
    await expect(main.getByText(/\d+ \/ \d+ articles/)).toBeVisible();
    await expect(main.getByText('Tout sélectionner')).toBeVisible();
    const articles = main.locator('[role="checkbox"]');
    await expect(articles.first()).toBeVisible();
    expect(await articles.count()).toBeGreaterThan(0);
  });


  test('should select articles and open AI generation panel', async ({page})  => {
    // Select 2 articles (checkbox)
    const main = page.locator('main');

    const checkboxes = main.locator('[role="checkbox"]');
    await checkboxes.nth(0).click();  // first article
    await checkboxes.nth(1).click();  // second article
        
    // Vérifier que la barre de sélection apparaît ("X/15 article(s) sélectionné(s)")
    await expect(main.getByText('💡 Cochez des articles, puis cliquez sur')).not.toBeVisible();
    await expect(main.getByText(/2\/\d+ article\(s\) sélectionné\(s\)/)).toBeVisible();
        
    // Clic on "Générer"
    const buttonGeneration = main.getByLabel('Générer du contenu IA à partir des articles sélectionnés');
    await buttonGeneration.click();

    // Check panel IA open
    const iaPanel = page.locator('[role="dialog"]');
    await expect(iaPanel).toBeVisible();
    await expect(page.getByText(/Action IA — 2 article/)).toBeVisible();
  });

  test('should filter articles by keyword', async ({ page }) => {
    const main = page.locator('main');

    // Articles should be loaded with a count visible
    const articleCounter = main.getByText(/\d+ \/ \d+ articles/);
    await expect(articleCounter).toBeVisible();

    // Type a keyword that matches nothing
    await page.fill('#keyword-input', 'xyznotexist789');

    // Should show empty state for filters
    await expect(main.getByText('Aucun résultat')).toBeVisible();
  });

  test('should reset filters', async ({ page }) => {
    const main = page.locator('main');

    // Apply a keyword filter
    await page.fill('#keyword-input', 'xyznotexist789');
    await expect(main.getByText('Aucun résultat')).toBeVisible();

    // Reset filters
    await main.getByLabel('Réinitialiser les filtres').click();

    // Articles should reappear
    await expect(main.getByText(/\d+ \/ \d+ articles/)).toBeVisible();
    const checkboxes = main.locator('[role="checkbox"]');
    await expect(checkboxes.first()).toBeVisible();
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

async function onContentGenerated() {

}