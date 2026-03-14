import { test, expect } from '@playwright/test';

/**
 * Authentication Flow E2E Tests
 * Template for testing user authentication flows
 */

test.describe('User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/');
  });

  test('user can sign up with valid credentials', async ({ page }) => {
    // Navigate to signup page
    await page.click('[data-testid="signup-link"]');
    await expect(page).toHaveURL('/signup');

    // Fill signup form
    await page.fill('[data-testid="email-input"]', 'newuser@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="name-input"]', 'Test User');

    // Submit form
    await page.click('[data-testid="signup-button"]');

    // Verify redirect to dashboard or success state
    await expect(page).toHaveURL(/\/(dashboard|verify-email)/);
  });

  test('shows validation error for invalid email', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.click('[data-testid="signup-button"]');

    // Check for error message
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('shows error for password mismatch', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'DifferentPassword123!');
    await page.click('[data-testid="signup-button"]');

    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('user can login with correct credentials', async ({ page }) => {
    await page.click('[data-testid="login-link"]');
    await expect(page).toHaveURL('/login');

    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'correctpassword');
    await page.click('[data-testid="login-button"]');

    // Verify successful login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });

  test('shows error for incorrect password', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('user can logout', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'correctpassword');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');

    // Then logout
    await page.click('[data-testid="logout-button"]');

    // Verify redirected to home/login
    await expect(page).toHaveURL(/\/(|login)/);
  });

  test('protected routes redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('password reset flow works', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="forgot-password-link"]');

    await expect(page).toHaveURL('/forgot-password');

    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.click('[data-testid="reset-password-button"]');

    await expect(page.getByText(/check your email/i)).toBeVisible();
  });
});
