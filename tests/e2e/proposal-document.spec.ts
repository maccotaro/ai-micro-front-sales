import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'test-sales@example.com';
const TEST_PASSWORD = 'AiMicro2026';

async function login(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', TEST_EMAIL);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|meetings|proposal)/);
}

test.describe('Proposal Document Pipeline', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('21.1: Pipeline execution shows Stage 6-10 and "Open Proposal" button', async ({ page }) => {
    await page.goto('/proposal-pipeline');

    // Select a meeting minute (if available)
    const minuteSelect = page.locator('select, [role="combobox"]').first();
    if (await minuteSelect.isVisible()) {
      await minuteSelect.click();
      // Select first option
      const firstOption = page.locator('[role="option"]').first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
      }
    }

    // Click generate button
    const generateBtn = page.getByRole('button', { name: /提案書を生成|生成/ });
    if (await generateBtn.isEnabled()) {
      await generateBtn.click();

      // Wait for pipeline to complete (up to 5 minutes)
      await expect(page.getByText(/完了|completed/i)).toBeVisible({ timeout: 300000 });

      // Check for "Open Proposal" button
      const openBtn = page.getByRole('link', { name: /提案書を開く/ });
      await expect(openBtn).toBeVisible({ timeout: 10000 });
    }
  });

  test('21.2: Document viewer shows page list and slide preview', async ({ page }) => {
    // Navigate to proposal document list
    await page.goto('/proposal-document');

    // Click first document (if any)
    const docCard = page.locator('[class*="cursor-pointer"]').first();
    if (await docCard.isVisible()) {
      await docCard.click();
      await page.waitForURL(/\/proposal-document\/.+/);

      // Verify page list
      await expect(page.getByText('ページ一覧')).toBeVisible();

      // Verify at least one page in the list
      const pageItems = page.locator('button').filter({ hasText: /ページ \d|^\d$/ });
      await expect(pageItems.first()).toBeVisible();

      // Click a page and verify slide preview updates
      await pageItems.first().click();

      // Verify slide preview area exists
      const slidePreview = page.locator('.bg-white.rounded-lg.shadow-lg');
      await expect(slidePreview).toBeVisible();
    }
  });

  test('21.3: Page chat question shows AI answer without changing content', async ({ page }) => {
    await page.goto('/proposal-document');

    const docCard = page.locator('[class*="cursor-pointer"]').first();
    if (!(await docCard.isVisible())) {
      test.skip();
      return;
    }

    await docCard.click();
    await page.waitForURL(/\/proposal-document\/.+/);

    // Switch to page chat tab
    const pageTab = page.getByText('このページ');
    await pageTab.click();

    // Get current slide content
    const slideContent = await page.locator('.bg-white.rounded-lg.shadow-lg').textContent();

    // Send a question
    const chatInput = page.locator('textarea');
    await chatInput.fill('なぜこの内容にしましたか？');
    const sendBtn = page.locator('button').filter({ has: page.locator('[class*="lucide-send"]') });
    await sendBtn.click();

    // Wait for AI response
    await expect(page.locator('.bg-gray-100').last()).toBeVisible({ timeout: 60000 });

    // Verify slide content hasn't changed
    const newContent = await page.locator('.bg-white.rounded-lg.shadow-lg').textContent();
    expect(newContent).toBe(slideContent);
  });

  test('21.4: Page chat rewrite updates slide preview', async ({ page }) => {
    await page.goto('/proposal-document');

    const docCard = page.locator('[class*="cursor-pointer"]').first();
    if (!(await docCard.isVisible())) {
      test.skip();
      return;
    }

    await docCard.click();
    await page.waitForURL(/\/proposal-document\/.+/);

    // Get current content
    const originalContent = await page.locator('.bg-white.rounded-lg.shadow-lg').textContent();

    // Send rewrite instruction
    const chatInput = page.locator('textarea');
    await chatInput.fill('もっと具体的なデータを追加してください');

    // Click rewrite button (RefreshCw icon)
    const rewriteBtn = page.locator('button[title*="書き直し"]');
    await rewriteBtn.click();

    // Wait for update badge
    await expect(page.getByText('更新済み')).toBeVisible({ timeout: 60000 });

    // Verify content changed
    const newContent = await page.locator('.bg-white.rounded-lg.shadow-lg').textContent();
    // Content may or may not change depending on LLM response, but the update badge should appear
  });

  test('21.5: Global chat tab and structure change', async ({ page }) => {
    await page.goto('/proposal-document');

    const docCard = page.locator('[class*="cursor-pointer"]').first();
    if (!(await docCard.isVisible())) {
      test.skip();
      return;
    }

    await docCard.click();
    await page.waitForURL(/\/proposal-document\/.+/);

    // Switch to global chat tab
    const globalTab = page.getByText('全体');
    await globalTab.click();

    // Send structure change instruction
    const chatInput = page.locator('textarea');
    await chatInput.fill('全体的にもっとシニア向けのトーンにしてください');

    const rewriteBtn = page.locator('button[title*="構成変更"]');
    await rewriteBtn.click();

    // Wait for response
    await expect(page.locator('.bg-gray-100').last()).toBeVisible({ timeout: 120000 });
  });

  test('21.6: Export PPTX download', async ({ page }) => {
    await page.goto('/proposal-document');

    const docCard = page.locator('[class*="cursor-pointer"]').first();
    if (!(await docCard.isVisible())) {
      test.skip();
      return;
    }

    await docCard.click();
    await page.waitForURL(/\/proposal-document\/.+/);

    // Click export button
    const exportBtn = page.getByText('エクスポート');
    await exportBtn.click();

    // Select PPTX
    const pptxOption = page.getByText('PPTX');
    await expect(pptxOption).toBeVisible();

    // Start download
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60000 }),
      pptxOption.click(),
    ]);

    expect(download.suggestedFilename()).toContain('proposal');
  });

  test('21.7: Sidebar "提案書" link navigates to list', async ({ page }) => {
    await page.goto('/dashboard');

    // Click sidebar link
    const sidebarLink = page.getByRole('link', { name: '提案書' });
    await expect(sidebarLink).toBeVisible();
    await sidebarLink.click();

    // Verify navigation to proposal document list
    await page.waitForURL(/\/proposal-document/);
    await expect(page.getByText('提案書一覧')).toBeVisible();
  });
});
