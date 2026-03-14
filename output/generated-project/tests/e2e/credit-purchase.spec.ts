/**
 * E2E Tests for Credit Purchase Flow (IMP-006 - P0)
 *
 * Tests the complete credit purchase journey with Stripe integration
 *
 * NOTE: These tests require Stripe test mode configuration
 * Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY to test mode keys
 *
 * To run: npx playwright test tests/e2e/credit-purchase.spec.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Credit Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('Display credit packages with pricing', async ({ page }) => {
    // Navigate to credits page
    await page.goto('/credits');

    // Verify page title
    await expect(page.locator('h1')).toContainText(/credits|pricing/i);

    // Verify at least 3 packages shown
    const packages = page.locator('.credit-package, .package-card');
    await expect(packages).toHaveCount.greaterThanOrEqual(3);

    // Verify each package shows required information
    for (const pkg of await packages.all()) {
      // Package name
      await expect(pkg.locator('text=/Starter|Pro|Expert/i')).toBeVisible();

      // Credit amount
      await expect(pkg.locator('text=/\\d+ credits/i')).toBeVisible();

      // Price
      await expect(pkg.locator('text=/\\$\\d+/i')).toBeVisible();

      // Buy button
      await expect(pkg.locator('button:has-text("Buy")')).toBeVisible();
    }
  });

  test('Show price per credit calculation', async ({ page }) => {
    await page.goto('/credits');

    // Verify price per credit shown
    await expect(page.locator('text=/\\$\\d+\\.\\d+ per credit/i')).toBeVisible();
  });

  test('Show savings badge on larger packages', async ({ page }) => {
    await page.goto('/credits');

    // Verify savings or discount badge shown
    await expect(page.locator('text=/save|savings|\\d+% off/i')).toBeVisible();
  });

  test('Mark popular package', async ({ page }) => {
    await page.goto('/credits');

    // Verify "Most Popular" or similar badge
    await expect(page.locator('text=/most popular|popular|best value/i')).toBeVisible();
  });

  test('Complete credit purchase with Stripe checkout', async ({ page }) => {
    await page.goto('/credits');

    // Note current credit balance
    const initialCredits = await page.locator('[data-testid="credit-balance"]').textContent();

    // Click "Buy Now" on first package
    await page.click('button:has-text("Buy"):first');

    // Should redirect to Stripe checkout
    // In test mode, URL should contain checkout.stripe.com
    await page.waitForURL(/checkout\.stripe\.com|localhost.*success/, { timeout: 10000 });

    // If redirected to Stripe (not mocked)
    if (page.url().includes('checkout.stripe.com')) {
      // Fill Stripe test card details
      const emailInput = page.frameLocator('iframe').first().locator('input[name="email"]');
      await emailInput.fill('test@example.com');

      const cardInput = page.frameLocator('iframe').first().locator('input[name="cardNumber"]');
      await cardInput.fill('4242424242424242'); // Stripe test card

      const expiryInput = page.frameLocator('iframe').first().locator('input[name="cardExpiry"]');
      await expiryInput.fill('12/34');

      const cvcInput = page.frameLocator('iframe').first().locator('input[name="cardCvc"]');
      await cvcInput.fill('123');

      // Submit payment
      await page.frameLocator('iframe').first().locator('button[type="submit"]').click();

      // Wait for redirect back to app
      await page.waitForURL(/localhost.*credits.*success=true/, { timeout: 30000 });
    }

    // Verify success page or message
    await expect(page.locator('text=/purchase successful|credits added/i')).toBeVisible();

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Verify credits increased
    const newCredits = await page.locator('[data-testid="credit-balance"]').textContent();
    // TODO: Parse and compare credit amounts
  });

  test('Handle canceled checkout', async ({ page }) => {
    await page.goto('/credits');

    // Click "Buy Now"
    await page.click('button:has-text("Buy"):first');

    // Wait for Stripe checkout
    await page.waitForURL(/checkout\.stripe\.com|localhost/, { timeout: 10000 });

    // If on Stripe checkout, close tab or go back
    if (page.url().includes('checkout.stripe.com')) {
      await page.goBack();
    }

    // Or navigate directly to cancel URL
    await page.goto('/credits?canceled=true');

    // Verify canceled message shown
    await expect(page.locator('text=/canceled|cancelled/i')).toBeVisible();

    // Verify credits not added
    // TODO: Check credit balance unchanged
  });

  test('Create purchase record after successful payment', async ({ page }) => {
    await page.goto('/credits');

    // Complete purchase (mocked or real)
    // TODO: Complete checkout flow

    // Navigate to purchase history
    await page.goto('/purchases');

    // Verify new purchase appears
    const purchases = page.locator('.purchase-item');
    await expect(purchases.first()).toBeVisible();

    // Verify purchase details
    await expect(page.locator('text=/\\d+ credits/i')).toBeVisible();
    await expect(page.locator('text=/\\$\\d+\\.\\d+/i')).toBeVisible();
    await expect(page.locator('text=Completed')).toBeVisible();
  });

  test('Send notification after successful purchase', async ({ page }) => {
    await page.goto('/credits');

    // Complete purchase
    // TODO: Complete checkout flow

    // Check notifications
    await page.click('[aria-label="Notifications"]');

    // Verify purchase notification
    await expect(page.locator('text=/credits.*added|purchase successful/i')).toBeVisible();
  });

  test('Display total spent in purchase history', async ({ page }) => {
    await page.goto('/purchases');

    // Verify total spent shown
    await expect(page.locator('text=/total spent/i')).toBeVisible();

    // Verify amount shown
    await expect(page.locator('text=/\\$\\d+\\.\\d+/i')).toBeVisible();
  });

  test('Handle duplicate webhook events (idempotency)', async ({ page }) => {
    // This test verifies backend idempotency
    // Would need to trigger duplicate Stripe webhook events
    // For now, this is a placeholder for integration testing

    // TODO: Send duplicate webhook event
    // TODO: Verify credits only added once
    // TODO: Verify only one purchase record created
  });

  test('Handle failed payment', async ({ page }) => {
    await page.goto('/credits');

    // Click "Buy Now"
    await page.click('button:has-text("Buy"):first');

    // If on Stripe checkout
    if (await page.url().includes('checkout.stripe.com')) {
      // Use a card that will be declined
      const cardInput = page.frameLocator('iframe').first().locator('input[name="cardNumber"]');
      await cardInput.fill('4000000000000002'); // Stripe test card - will decline

      const expiryInput = page.frameLocator('iframe').first().locator('input[name="cardExpiry"]');
      await expiryInput.fill('12/34');

      const cvcInput = page.frameLocator('iframe').first().locator('input[name="cardCvc"]');
      await cvcInput.fill('123');

      // Submit payment
      await page.frameLocator('iframe').first().locator('button[type="submit"]').click();

      // Verify error message
      await expect(page.frameLocator('iframe').first().locator('text=/declined|error/i')).toBeVisible();
    }
  });

  test('Require authentication for checkout', async ({ page }) => {
    // Logout
    await page.click('text=Sign Out');

    // Try to access credits page
    await page.goto('/credits');

    // Try to click "Buy Now"
    await page.click('button:has-text("Buy"):first');

    // Should redirect to login or show auth required
    await expect(page).toHaveURL(/signin|login/);
  });

  test('Validate package selection', async ({ page }) => {
    // Try to create checkout with invalid package ID
    const response = await page.request.post('/api/v1/credits/checkout', {
      data: {
        packageId: 'invalid-package-id',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status()).toBe(400);
  });
});

test.describe('Purchase History', () => {
  test('Display purchase history with pagination', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.goto('/purchases');

    // Verify purchases listed
    await expect(page.locator('text=/purchase history|purchases/i')).toBeVisible();

    // Verify purchase cards
    const purchases = page.locator('.purchase-item, .purchase-card');
    if (await purchases.count() > 0) {
      await expect(purchases.first()).toBeVisible();
    } else {
      // Empty state
      await expect(page.locator('text=/no purchases|purchase history empty/i')).toBeVisible();
    }
  });

  test('Show purchase details', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.goto('/purchases');

    // If purchases exist
    const purchaseCount = await page.locator('.purchase-item, .purchase-card').count();
    if (purchaseCount > 0) {
      const firstPurchase = page.locator('.purchase-item, .purchase-card').first();

      // Verify details shown
      await expect(firstPurchase.locator('text=/\\d+ credits/i')).toBeVisible();
      await expect(firstPurchase.locator('text=/\\$\\d+/i')).toBeVisible();
      await expect(firstPurchase.locator('text=/completed|pending|failed/i')).toBeVisible();

      // Verify date shown
      await expect(firstPurchase.locator('text=/\\d{1,2}\\/\\d{1,2}\\/\\d{2,4}|\\w+ \\d{1,2}/i')).toBeVisible();
    }
  });

  test('Calculate and display total spent', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.goto('/purchases');

    // Verify total spent calculation shown
    await expect(page.locator('text=/total spent/i')).toBeVisible();

    // Should show dollar amount
    await expect(page.locator('text=/\\$\\d+\\.\\d+/i')).toBeVisible();
  });

  test('Filter by purchase status', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.goto('/purchases');

    // If status filter exists
    if (await page.locator('select[name="status"], button:has-text("Filter")').count() > 0) {
      // Select completed only
      await page.selectOption('select[name="status"]', 'completed');

      // Verify only completed shown
      const statusBadges = page.locator('text=Completed');
      await expect(statusBadges.first()).toBeVisible();
    }
  });
});

test.describe('Credit Usage', () => {
  test('Deduct credits when requesting feedback', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Check initial credit balance
    await page.goto('/dashboard');
    const initialCredits = await page.locator('[data-testid="credit-balance"]').textContent();

    // Request feedback on a video
    await page.goto('/request-feedback');
    // TODO: Select video and trainer
    // TODO: Submit feedback request

    // Verify credits deducted
    await page.goto('/dashboard');
    const newCredits = await page.locator('[data-testid="credit-balance"]').textContent();

    // TODO: Compare and verify 1 credit deducted
  });

  test('Prevent feedback request with insufficient credits', async ({ page }) => {
    // Login as user with 0 credits
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'user-no-credits@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Try to request feedback
    await page.goto('/request-feedback');

    // Should show error or redirect to buy credits
    await expect(page.locator('text=/insufficient credits|buy credits/i')).toBeVisible();
  });

  test('Show credit balance prominently', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.goto('/dashboard');

    // Verify credit balance shown
    await expect(page.locator('[data-testid="credit-balance"]')).toBeVisible();

    // Should show number
    await expect(page.locator('text=/\\d+ credits?/i')).toBeVisible();
  });
});
