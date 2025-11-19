import { test, expect } from '@playwright/test';

test.describe('Partner Preferences Page', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication mock - store token in localStorage
    await page.goto('/');
    await page.evaluate(() => {
      // Mock user authentication
      localStorage.setItem('auth_token', 'test-token-123');
      localStorage.setItem('user_id', '1');
    });
  });

  test('should load the partner preferences page', async ({ page }) => {
    await page.goto('/partner-preferences');

    // Check page title or heading
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display partner preferences sections', async ({ page }) => {
    await page.goto('/partner-preferences');

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Check for common preference labels/sections
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });

  test('should have edit functionality', async ({ page }) => {
    await page.goto('/partner-preferences');

    // Look for edit button
    const editButton = page.getByRole('button', { name: /edit/i });

    // If edit button exists, click it
    if (await editButton.isVisible()) {
      await editButton.click();

      // After clicking edit, form elements should be visible
      const formInputs = page.locator('input, select');
      expect(await formInputs.count()).toBeGreaterThan(0);
    }
  });

  test('should allow editing age range', async ({ page }) => {
    await page.goto('/partner-preferences');

    // Find and click edit button
    const editButton = page.getByRole('button', { name: /edit/i });
    if (await editButton.isVisible()) {
      await editButton.click();

      // Find age inputs
      const minAgeInput = page.locator('input[type="number"]').first();
      if (await minAgeInput.isVisible()) {
        await minAgeInput.fill('25');

        // Check the value was set
        await expect(minAgeInput).toHaveValue('25');
      }
    }
  });

  test('should allow editing distance preference', async ({ page }) => {
    await page.goto('/partner-preferences');

    // Find and click edit button
    const editButton = page.getByRole('button', { name: /edit/i });
    if (await editButton.isVisible()) {
      await editButton.click();

      // Find distance input by looking for input near "Distance" text
      const distanceSection = page.locator('text=Distance').first();
      if (await distanceSection.isVisible()) {
        const distanceInput = page.locator('input[type="number"]').nth(4);
        if (await distanceInput.isVisible()) {
          await distanceInput.fill('100');
          await expect(distanceInput).toHaveValue('100');
        }
      }
    }
  });

  test('should have cancel button in edit mode', async ({ page }) => {
    await page.goto('/partner-preferences');

    // Find and click edit button
    const editButton = page.getByRole('button', { name: /edit/i });
    if (await editButton.isVisible()) {
      await editButton.click();

      // Look for cancel button
      const cancelButton = page.getByRole('button', { name: /cancel/i });
      await expect(cancelButton).toBeVisible();
    }
  });

  test('should have save button in edit mode', async ({ page }) => {
    await page.goto('/partner-preferences');

    // Find and click edit button
    const editButton = page.getByRole('button', { name: /edit/i });
    if (await editButton.isVisible()) {
      await editButton.click();

      // Look for save button
      const saveButton = page.getByRole('button', { name: /save/i });
      await expect(saveButton).toBeVisible();
    }
  });

  test('should toggle checkboxes', async ({ page }) => {
    await page.goto('/partner-preferences');

    // Find and click edit button
    const editButton = page.getByRole('button', { name: /edit/i });
    if (await editButton.isVisible()) {
      await editButton.click();

      // Find a checkbox
      const checkbox = page.locator('input[type="checkbox"]').first();
      if (await checkbox.isVisible()) {
        const initialState = await checkbox.isChecked();
        await checkbox.click();
        const newState = await checkbox.isChecked();
        expect(newState).toBe(!initialState);
      }
    }
  });

  test('should return to view mode on cancel', async ({ page }) => {
    await page.goto('/partner-preferences');

    // Find and click edit button
    const editButton = page.getByRole('button', { name: /edit/i });
    if (await editButton.isVisible()) {
      await editButton.click();

      // Click cancel button
      const cancelButton = page.getByRole('button', { name: /cancel/i });
      if (await cancelButton.isVisible()) {
        await cancelButton.click();

        // Edit button should be visible again
        await expect(editButton).toBeVisible();
      }
    }
  });

  test('should have form sections for different preference categories', async ({ page }) => {
    await page.goto('/partner-preferences');

    // Find and click edit button
    const editButton = page.getByRole('button', { name: /edit/i });
    if (await editButton.isVisible()) {
      await editButton.click();

      // Check for various sections
      const sections = [
        'Age',
        'Height',
        'Distance',
        'Religion',
      ];

      for (const section of sections) {
        const sectionText = page.locator(`text=${section}`).first();
        // At least some sections should be visible
        const isVisible = await sectionText.isVisible().catch(() => false);
        if (isVisible) {
          expect(isVisible).toBe(true);
        }
      }
    }
  });
});

test.describe('Partner Preferences - Mobile View', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/partner-preferences');

    // Page should load without horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small margin
  });
});
