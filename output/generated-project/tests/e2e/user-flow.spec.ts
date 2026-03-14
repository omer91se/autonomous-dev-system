/**
 * E2E Tests for Complete User Journey
 *
 * Tests the full user experience from registration to receiving feedback
 *
 * To run: npx playwright test tests/e2e/user-flow.spec.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('User registration and onboarding', async ({ page }) => {
    // Navigate to signup
    await page.click('text=Sign Up');

    // Fill registration form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', `testuser${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.selectOption('select[name="role"]', 'USER');

    // Submit registration
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // Verify welcome message or empty state
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('User email verification flow', async ({ page }) => {
    // TODO: Login as user without verified email
    // TODO: Navigate to verify email page
    // TODO: Enter email and request verification
    // TODO: Verify success message shown
    // TODO: Check email would be sent (mock)
    // TODO: Navigate to verification link (from mock email)
    // TODO: Verify email verified successfully
    // TODO: Verify notification created
  });

  test('User can purchase credits', async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to credits page
    await page.goto('/credits');

    // Verify packages displayed
    await expect(page.locator('text=Starter')).toBeVisible();
    await expect(page.locator('text=Pro')).toBeVisible();

    // Click "Buy Now" on a package
    const buyButton = page.locator('button:has-text("Buy Now")').first();
    await buyButton.click();

    // Should redirect to Stripe checkout
    // In test mode, this would go to Stripe's test checkout
    // We'll mock it or use Stripe's test mode

    // TODO: Complete Stripe checkout (in test mode)
    // TODO: Return to success page
    // TODO: Verify credits added to account
    // TODO: Verify notification received
  });

  test('User can upload workout video', async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to upload page
    await page.goto('/upload');

    // Fill upload form
    await page.fill('input[name="title"]', 'My Squat Form Check');
    await page.selectOption('select[name="workoutType"]', 'SQUAT');
    await page.fill('textarea[name="description"]', 'Please check my squat depth');

    // Upload video file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/sample-video.mp4');

    // Verify upload progress shown
    await expect(page.locator('text=Uploading')).toBeVisible();

    // Wait for upload completion
    await expect(page.locator('text=Upload complete'), {
      timeout: 30000,
    }).toBeVisible();

    // Submit
    await page.click('button:has-text("Submit")');

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // Verify video appears in list
    await expect(page.locator('text=My Squat Form Check')).toBeVisible();
  });

  test('User can request feedback from trainer', async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to request feedback page
    await page.goto('/request-feedback');

    // Select video
    await page.click('text=My Squat Form Check');

    // Select trainer
    await page.click('text=View Trainers');
    await page.click('.trainer-card:first-child');

    // Confirm selection
    await page.click('button:has-text("Request Feedback")');

    // Verify confirmation message
    await expect(page.locator('text=Feedback requested')).toBeVisible();

    // Verify credit deducted
    // TODO: Check credit balance decreased by 1
  });

  test('User can view received feedback', async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Click on video with completed feedback
    await page.click('text=My Squat Form Check');

    // Verify video player loads
    await expect(page.locator('video, [data-testid="react-player"]')).toBeVisible();

    // Verify feedback text shown
    await expect(page.locator('text=Overall Feedback')).toBeVisible();

    // Verify timestamped comments shown
    await expect(page.locator('.timestamped-comment')).toHaveCount(expect.any(Number));

    // Click on a timestamped comment
    await page.click('.timestamped-comment:first-child');

    // Verify video jumps to that timestamp
    // TODO: Verify video currentTime updated
  });

  test('User can update profile settings', async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to settings
    await page.goto('/settings');

    // Update name
    await page.fill('input[name="name"]', 'Updated Name');

    // Update fitness level
    await page.selectOption('select[name="fitnessLevel"]', 'INTERMEDIATE');

    // Save changes
    await page.click('button:has-text("Save Changes")');

    // Verify success message
    await expect(page.locator('text=Profile updated')).toBeVisible();

    // Refresh page and verify changes persisted
    await page.reload();
    await expect(page.locator('input[name="name"]')).toHaveValue('Updated Name');
  });

  test('User can change password', async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'OldPassword123!');
    await page.click('button[type="submit"]');

    // Navigate to settings > Security tab
    await page.goto('/settings');
    await page.click('text=Security');

    // Fill password change form
    await page.fill('input[name="currentPassword"]', 'OldPassword123!');
    await page.fill('input[name="newPassword"]', 'NewSecurePass456!');
    await page.fill('input[name="confirmPassword"]', 'NewSecurePass456!');

    // Submit
    await page.click('button:has-text("Change Password")');

    // Verify success message
    await expect(page.locator('text=Password changed')).toBeVisible();

    // Logout
    await page.click('text=Sign Out');

    // Try logging in with new password
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'NewSecurePass456!');
    await page.click('button[type="submit"]');

    // Verify successful login
    await expect(page).toHaveURL('/dashboard');
  });

  test('User can view notifications', async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Click notification bell
    await page.click('[aria-label="Notifications"]');

    // Verify notifications dropdown opens
    await expect(page.locator('.notification-dropdown')).toBeVisible();

    // Verify unread count shown
    await expect(page.locator('.notification-badge')).toBeVisible();

    // Click on a notification
    await page.click('.notification-item:first-child');

    // Verify marked as read
    // TODO: Verify notification styling changes

    // Click "Mark all as read"
    await page.click('text=Mark all as read');

    // Verify all notifications marked as read
    await expect(page.locator('.notification-badge')).not.toBeVisible();
  });

  test('User can view purchase history', async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to purchases page
    await page.goto('/purchases');

    // Verify purchases listed
    await expect(page.locator('.purchase-item')).toHaveCount(expect.any(Number));

    // Verify purchase details shown
    await expect(page.locator('text=Credits')).toBeVisible();
    await expect(page.locator('text=Amount')).toBeVisible();
    await expect(page.locator('text=Date')).toBeVisible();

    // Verify total spent calculated
    await expect(page.locator('text=Total Spent')).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('Shows error when video upload fails', async ({ page }) => {
    // TODO: Login
    // TODO: Go to upload page
    // TODO: Mock S3 upload failure
    // TODO: Verify error message shown
    // TODO: Verify retry option available
  });

  test('Shows error when insufficient credits', async ({ page }) => {
    // TODO: Login with 0 credits
    // TODO: Try to request feedback
    // TODO: Verify error message shown
    // TODO: Verify link to buy credits
  });

  test('Shows error boundary on component crash', async ({ page }) => {
    // TODO: Trigger a component error
    // TODO: Verify error fallback UI shown
    // TODO: Verify "Try Again" button works
  });
});

test.describe('Accessibility', () => {
  test('Homepage is keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify focus indicators visible
    // TODO: Check for visible focus outlines
  });

  test('Forms have proper labels', async ({ page }) => {
    await page.goto('/auth/signin');

    // Verify all inputs have labels
    const emailInput = page.locator('input[name="email"]');
    const emailLabel = page.locator('label[for="email"]');

    await expect(emailLabel).toBeVisible();
    await expect(emailInput).toHaveAttribute('id', 'email');
  });

  test('Video player has ARIA labels', async ({ page }) => {
    // TODO: Login and navigate to video
    // TODO: Verify play button has aria-label
    // TODO: Verify volume has aria-label
    // TODO: Verify fullscreen has aria-label
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('Mobile navigation works', async ({ page }) => {
    await page.goto('/');

    // Open mobile menu
    await page.click('[aria-label="Menu"]');

    // Verify menu items visible
    await expect(page.locator('text=Sign In')).toBeVisible();
    await expect(page.locator('text=Sign Up')).toBeVisible();
  });

  test('Video player works on mobile', async ({ page }) => {
    // TODO: Login
    // TODO: Navigate to video
    // TODO: Verify video player renders correctly
    // TODO: Verify touch controls work
    // TODO: Verify fullscreen works
  });

  test('Forms are usable on mobile', async ({ page }) => {
    await page.goto('/auth/signin');

    // Verify form fields are accessible
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');

    // Verify keyboard doesn't obscure submit button
    await page.click('button[type="submit"]');
  });
});
