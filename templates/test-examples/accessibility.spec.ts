import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Testing with axe-core
 * Tests WCAG 2.1 AA compliance
 */

test.describe('Accessibility Tests', () => {
  test('homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('login page should not have accessibility violations', async ({ page }) => {
    await page.goto('/login');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('dashboard should not have accessibility violations', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');

    await page.waitForURL('/dashboard');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('all interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);

    // Continue tabbing
    await page.keyboard.press('Tab');
    focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
  });

  test('forms have proper labels', async ({ page }) => {
    await page.goto('/login');

    // Check that inputs have associated labels
    const emailInput = page.locator('[data-testid="email-input"]');
    const emailLabel = await emailInput.evaluate((el: HTMLInputElement) => {
      return el.labels?.[0]?.textContent || el.getAttribute('aria-label');
    });
    expect(emailLabel).toBeTruthy();

    const passwordInput = page.locator('[data-testid="password-input"]');
    const passwordLabel = await passwordInput.evaluate((el: HTMLInputElement) => {
      return el.labels?.[0]?.textContent || el.getAttribute('aria-label');
    });
    expect(passwordLabel).toBeTruthy();
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');

    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('color contrast is sufficient', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('body')
      .analyze();

    const colorContrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );

    expect(colorContrastViolations).toHaveLength(0);
  });

  test('modals trap focus and can be closed with ESC', async ({ page }) => {
    await page.goto('/');

    // Open a modal (adjust selector based on your app)
    const modalTrigger = page.locator('[data-testid*="modal"][data-testid*="button"]').first();
    if (await modalTrigger.count() > 0) {
      await modalTrigger.click();

      // Modal should be visible
      const modal = page.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible();

      // Focus should be trapped in modal
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => {
        const activeEl = document.activeElement;
        const modal = document.querySelector('[role="dialog"]');
        return modal?.contains(activeEl);
      });
      expect(focusedElement).toBe(true);

      // ESC should close modal
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
    }
  });
});
