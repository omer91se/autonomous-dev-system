/**
 * E2E Tests for Trainer Journey
 *
 * Tests the complete trainer experience from registration to providing feedback
 *
 * To run: npx playwright test tests/e2e/trainer-flow.spec.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Trainer Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Trainer registration with profile setup', async ({ page }) => {
    // Navigate to signup
    await page.click('text=Sign Up');

    // Fill registration form as trainer
    await page.fill('input[name="name"]', 'Expert Trainer');
    await page.fill('input[name="email"]', `trainer${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'TrainerPass123!');
    await page.selectOption('select[name="role"]', 'TRAINER');

    // Fill trainer-specific fields
    await page.fill('textarea[name="bio"]', 'Certified personal trainer with 10 years experience');
    await page.fill('input[name="specialties"]', 'Powerlifting, Olympic Weightlifting');
    await page.fill('input[name="hourlyRate"]', '50');

    // Submit registration
    await page.click('button[type="submit"]');

    // Verify redirect to trainer dashboard
    await expect(page).toHaveURL(/\/trainer\/dashboard/);
  });

  test('Trainer can view assigned videos', async ({ page }) => {
    // Login as trainer
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'trainer@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to trainer dashboard
    await page.goto('/trainer/dashboard');

    // Verify assigned videos shown
    await expect(page.locator('text=Assigned Videos')).toBeVisible();

    // Verify video list
    const videoCards = page.locator('.video-card');
    await expect(videoCards).toHaveCount(expect.any(Number));

    // Verify video details shown
    await expect(page.locator('text=Uploaded by')).toBeVisible();
    await expect(page.locator('text=Workout Type')).toBeVisible();
  });

  test('Trainer can review video and provide feedback', async ({ page }) => {
    // Login as trainer
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'trainer@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to trainer dashboard
    await page.goto('/trainer/dashboard');

    // Click on first assigned video
    await page.click('.video-card:first-child');

    // Verify on review page
    await expect(page).toHaveURL(/\/trainer\/review\//);

    // Verify video player loaded
    await expect(page.locator('video, [data-testid="react-player"]')).toBeVisible();

    // Play video
    await page.click('[aria-label="Play"]');

    // Wait for video to play for a few seconds
    await page.waitForTimeout(3000);

    // Pause at timestamp
    await page.click('[aria-label="Pause"]');

    // Add timestamped comment
    await page.click('button:has-text("Add Comment")');

    // Verify current timestamp pre-filled
    // TODO: Verify timestamp input has value

    // Fill comment
    await page.fill('textarea[name="comment"]', 'Good bar position here');

    // Save comment
    await page.click('button:has-text("Save Comment")');

    // Verify comment appears in list
    await expect(page.locator('text=Good bar position here')).toBeVisible();

    // Add overall feedback
    await page.fill('textarea[name="overallFeedback"]', 'Great form overall! Watch your depth on the last 2 reps.');

    // Set rating
    await page.click('text=Rating');
    await page.click('[data-rating="8"]');

    // Submit feedback
    await page.click('button:has-text("Submit Feedback")');

    // Verify confirmation dialog
    await expect(page.locator('text=Are you sure?')).toBeVisible();
    await page.click('button:has-text("Confirm")');

    // Verify success message
    await expect(page.locator('text=Feedback submitted')).toBeVisible();

    // Verify redirected back to dashboard
    await expect(page).toHaveURL(/\/trainer\/dashboard/);
  });

  test('Trainer can add multiple timestamped comments', async ({ page }) => {
    // Login as trainer
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'trainer@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Go to review page
    await page.goto('/trainer/review/video-id-123');

    // Add first comment at 15 seconds
    await page.click('button:has-text("Add Comment")');
    await page.fill('input[name="timestamp"]', '00:15');
    await page.fill('textarea[name="comment"]', 'Setup looks good');
    await page.click('button:has-text("Save Comment")');

    // Add second comment at 30 seconds
    await page.click('button:has-text("Add Comment")');
    await page.fill('input[name="timestamp"]', '00:30');
    await page.fill('textarea[name="comment"]', 'Depth could be better here');
    await page.click('button:has-text("Save Comment")');

    // Add third comment at 45 seconds
    await page.click('button:has-text("Add Comment")');
    await page.fill('input[name="timestamp"]', '00:45');
    await page.fill('textarea[name="comment"]', 'Good lockout');
    await page.click('button:has-text("Save Comment")');

    // Verify all comments shown
    await expect(page.locator('.timestamped-comment')).toHaveCount(3);

    // Verify comments ordered by timestamp
    const firstComment = page.locator('.timestamped-comment:first-child');
    await expect(firstComment).toContainText('00:15');
  });

  test('Trainer can edit timestamped comment before submission', async ({ page }) => {
    // Login and navigate to review page
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'trainer@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.goto('/trainer/review/video-id-123');

    // Add comment
    await page.click('button:has-text("Add Comment")');
    await page.fill('textarea[name="comment"]', 'Original comment');
    await page.click('button:has-text("Save Comment")');

    // Edit comment
    await page.click('button:has-text("Edit"):near(:text("Original comment"))');

    // Update comment text
    await page.fill('textarea[name="comment"]', 'Updated comment with more detail');
    await page.click('button:has-text("Save Comment")');

    // Verify updated text shown
    await expect(page.locator('text=Updated comment with more detail')).toBeVisible();
    await expect(page.locator('text=Original comment')).not.toBeVisible();
  });

  test('Trainer can delete timestamped comment before submission', async ({ page }) => {
    // Login and navigate to review page
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'trainer@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.goto('/trainer/review/video-id-123');

    // Add comment
    await page.click('button:has-text("Add Comment")');
    await page.fill('textarea[name="comment"]', 'Comment to delete');
    await page.click('button:has-text("Save Comment")');

    // Verify comment shown
    await expect(page.locator('text=Comment to delete')).toBeVisible();

    // Delete comment
    await page.click('button:has-text("Delete"):near(:text("Comment to delete"))');

    // Confirm deletion
    await page.click('button:has-text("Confirm")');

    // Verify comment removed
    await expect(page.locator('text=Comment to delete')).not.toBeVisible();
  });

  test('Trainer cannot submit feedback without comments', async ({ page }) => {
    // Login and navigate to review page
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'trainer@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.goto('/trainer/review/video-id-123');

    // Fill only overall feedback
    await page.fill('textarea[name="overallFeedback"]', 'Overall feedback');
    await page.click('[data-rating="7"]');

    // Try to submit without comments
    await page.click('button:has-text("Submit Feedback")');

    // Verify error message
    await expect(page.locator('text=at least one timestamped comment')).toBeVisible();

    // Verify not submitted
    await expect(page).toHaveURL(/\/trainer\/review\//);
  });

  test('Trainer can update profile settings', async ({ page }) => {
    // Login as trainer
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'trainer@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to settings
    await page.goto('/settings');

    // Click trainer info tab
    await page.click('text=Trainer Info');

    // Update bio
    await page.fill('textarea[name="bio"]', 'Updated bio with new certifications');

    // Update hourly rate
    await page.fill('input[name="hourlyRate"]', '75');

    // Update max daily reviews
    await page.fill('input[name="maxDailyReviews"]', '15');

    // Save changes
    await page.click('button:has-text("Save Changes")');

    // Verify success message
    await expect(page.locator('text=Profile updated')).toBeVisible();

    // Refresh and verify changes persisted
    await page.reload();
    await expect(page.locator('textarea[name="bio"]')).toHaveValue(/Updated bio/);
  });

  test('Trainer can view feedback history', async ({ page }) => {
    // Login as trainer
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'trainer@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to trainer dashboard
    await page.goto('/trainer/dashboard');

    // Click "Completed" tab or filter
    await page.click('text=Completed');

    // Verify completed feedback shown
    await expect(page.locator('.feedback-card')).toHaveCount(expect.any(Number));

    // Verify feedback details
    await expect(page.locator('text=Rating given')).toBeVisible();
    await expect(page.locator('text=Completed on')).toBeVisible();
  });

  test('Trainer receives notification when video assigned', async ({ page }) => {
    // Login as trainer
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'trainer@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // TODO: Simulate video being assigned to trainer

    // Check notifications
    await page.click('[aria-label="Notifications"]');

    // Verify new assignment notification
    await expect(page.locator('text=New video assigned')).toBeVisible();

    // Click notification
    await page.click('text=New video assigned');

    // Verify navigates to review page
    await expect(page).toHaveURL(/\/trainer\/review\//);
  });

  test('Trainer can click comment timestamp to jump video', async ({ page }) => {
    // Login and navigate to review page
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'trainer@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.goto('/trainer/review/video-id-123');

    // Add comment at specific timestamp
    await page.click('button:has-text("Add Comment")');
    await page.fill('input[name="timestamp"]', '00:30');
    await page.fill('textarea[name="comment"]', 'Check form here');
    await page.click('button:has-text("Save Comment")');

    // Click on comment timestamp
    await page.click('.timestamp-badge:has-text("00:30")');

    // Verify video jumped to that timestamp
    // TODO: Check video currentTime is approximately 30 seconds
  });
});

test.describe('Trainer Access Control', () => {
  test('Non-trainer cannot access trainer dashboard', async ({ page }) => {
    // Login as regular user
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Try to access trainer dashboard
    await page.goto('/trainer/dashboard');

    // Verify redirected or shown error
    await expect(page).not.toHaveURL(/\/trainer\/dashboard/);
  });

  test('Trainer cannot review videos not assigned to them', async ({ page }) => {
    // Login as trainer
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'trainer@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Try to access review page for unassigned video
    await page.goto('/trainer/review/unassigned-video-id');

    // Verify access denied
    await expect(page.locator('text=access denied|not found')).toBeVisible();
  });
});

test.describe('Trainer Validation', () => {
  test('Feedback form validation', async ({ page }) => {
    // Login and navigate to review page
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'trainer@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.goto('/trainer/review/video-id-123');

    // Try to submit with invalid data
    await page.click('button:has-text("Submit Feedback")');

    // Verify validation errors
    await expect(page.locator('text=required|must provide')).toBeVisible();
  });

  test('Comment timestamp validation', async ({ page }) => {
    // Login and navigate to review page
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'trainer@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.goto('/trainer/review/video-id-123');

    // Try to add comment with invalid timestamp
    await page.click('button:has-text("Add Comment")');
    await page.fill('input[name="timestamp"]', '-10'); // Negative time
    await page.fill('textarea[name="comment"]', 'Comment');
    await page.click('button:has-text("Save Comment")');

    // Verify validation error
    await expect(page.locator('text=valid timestamp')).toBeVisible();
  });
});
