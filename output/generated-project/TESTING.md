# Testing Guide - FormFit Coach

This document provides comprehensive instructions for testing the FormFit Coach application.

## Table of Contents

1. [Test Suite Overview](#test-suite-overview)
2. [Setup](#setup)
3. [Running Tests](#running-tests)
4. [Test Organization](#test-organization)
5. [Writing Tests](#writing-tests)
6. [Manual Testing](#manual-testing)
7. [Continuous Integration](#continuous-integration)
8. [Troubleshooting](#troubleshooting)

---

## Test Suite Overview

The FormFit Coach application uses a comprehensive testing strategy:

- **Unit Tests**: Test individual functions and utilities (Vitest)
- **Integration Tests**: Test API routes with mocked database (Vitest)
- **Component Tests**: Test React components in isolation (Vitest + React Testing Library)
- **E2E Tests**: Test complete user flows (Playwright)

### Test Statistics

- **Total Test Files**: 9
- **Total Test Cases**: 145+
- **Frameworks**: Vitest, Playwright, React Testing Library
- **Coverage Tool**: Vitest Coverage (v8)

---

## Setup

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- All environment variables configured (see `.env.example`)

### Install Dependencies

```bash
# Install testing dependencies
npm install -D vitest @vitest/ui @vitest/coverage-v8
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @vitejs/plugin-react
npm install -D @playwright/test

# Install Playwright browsers
npx playwright install
```

### Configure Test Database

It's recommended to use a separate database for testing:

```bash
# Copy .env to .env.test
cp .env .env.test

# Update DATABASE_URL in .env.test
DATABASE_URL="postgresql://user:password@localhost:5432/formfit_test"

# Run migrations on test database
DATABASE_URL="postgresql://user:password@localhost:5432/formfit_test" npx prisma migrate deploy
```

### Add Test Scripts to package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

## Running Tests

### Unit and Integration Tests (Vitest)

```bash
# Run all tests once
npm run test

# Watch mode (re-runs on file changes)
npm run test:watch

# With UI
npm run test:ui

# With coverage report
npm run test:coverage

# Run specific test file
npm run test tests/lib/validations.test.ts

# Run tests matching a pattern
npm run test -t "validation"
```

### Component Tests

Component tests are also run with Vitest:

```bash
# Run all component tests
npm run test tests/components/

# Run specific component test
npm run test tests/components/VideoPlayer.test.tsx

# Watch mode for component tests
npm run test:watch tests/components/
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (recommended for development)
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/user-flow.spec.ts

# Run in debug mode
npm run test:e2e:debug

# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run mobile tests only
npx playwright test --project="Mobile Chrome"

# View test report
npx playwright show-report
```

### Running Tests Before Deployment

```bash
# Run all tests
npm run test:coverage && npm run test:e2e

# Check coverage meets threshold (e.g., 80%)
# Set thresholds in vitest.config.ts
```

---

## Test Organization

### Directory Structure

```
/tests
├── setup.ts                          # Global test setup
├── lib/                              # Unit tests for utilities
│   ├── validations.test.ts           # Input validation tests
│   └── credit-packages.test.ts       # Credit package tests
├── api/                              # API integration tests
│   ├── auth.test.ts                  # Authentication endpoints
│   └── credits.test.ts               # Credit system endpoints
├── components/                       # Component tests
│   ├── VideoPlayer.test.tsx          # Video player component
│   └── ErrorBoundary.test.tsx        # Error boundary component
└── e2e/                              # End-to-end tests
    ├── user-flow.spec.ts             # Complete user journey
    ├── trainer-flow.spec.ts          # Trainer workflow
    └── credit-purchase.spec.ts       # Payment flow
```

### Test Naming Conventions

- **Unit tests**: `{module}.test.ts`
- **Component tests**: `{Component}.test.tsx`
- **E2E tests**: `{feature}.spec.ts`

### Test Categories

Tests are organized by feature and priority:

- **P0 (Critical)**: Must pass before any deployment
- **P1 (High)**: Should pass before production deployment
- **P2 (Medium)**: Nice to have, can be fixed post-launch

---

## Writing Tests

### Unit Test Example

```typescript
// tests/lib/myUtility.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/myUtility';

describe('myFunction', () => {
  it('should return expected value', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });

  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('');
    expect(myFunction(null)).toThrow();
  });
});
```

### Component Test Example

```typescript
// tests/components/MyComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render without errors', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    render(<MyComponent />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
// tests/e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should complete user flow', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Sign In');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### Best Practices

1. **Use Descriptive Test Names**
   ```typescript
   // Good
   it('should reject weak passwords with clear error message', () => {});

   // Bad
   it('test password', () => {});
   ```

2. **Follow AAA Pattern** (Arrange, Act, Assert)
   ```typescript
   it('should update user profile', () => {
     // Arrange
     const user = { name: 'John', email: 'john@example.com' };

     // Act
     const result = updateProfile(user);

     // Assert
     expect(result.success).toBe(true);
   });
   ```

3. **Test One Thing Per Test**
   ```typescript
   // Good
   it('should validate email format', () => {});
   it('should validate password strength', () => {});

   // Bad
   it('should validate all form fields', () => {});
   ```

4. **Mock External Dependencies**
   ```typescript
   import { vi } from 'vitest';

   vi.mock('@/lib/email', () => ({
     sendEmail: vi.fn(),
   }));
   ```

5. **Clean Up After Tests**
   ```typescript
   import { afterEach } from 'vitest';

   afterEach(() => {
     vi.clearAllMocks();
   });
   ```

---

## Manual Testing

While automated tests cover most functionality, some features require manual verification.

### Critical Manual Tests

#### 1. Video Upload and Playback

**Steps:**
1. Login to application
2. Navigate to Upload page
3. Select a video file (test with various formats: mp4, mov, webm)
4. Fill in title, workout type, description
5. Click Upload
6. Wait for upload to complete
7. Navigate to Dashboard
8. Click on uploaded video
9. Verify video plays correctly
10. Test all playback controls (play, pause, seek, volume, speed, fullscreen)
11. Test keyboard shortcuts (Space, arrows, F, M)

**Expected Results:**
- Upload progress shown
- Upload completes successfully
- Video appears in dashboard
- Video plays without errors
- All controls function correctly
- Keyboard shortcuts work

#### 2. Credit Purchase Flow

**Steps:**
1. Login to application
2. Navigate to Credits page
3. Note current credit balance
4. Click "Buy Now" on a package
5. Complete Stripe checkout with test card: 4242 4242 4242 4242
6. Verify redirect to success page
7. Check credit balance increased
8. Navigate to Purchase History
9. Verify purchase appears

**Expected Results:**
- Checkout session created
- Stripe checkout page loads
- Payment processed successfully
- Credits added to account
- Purchase record created
- Notification received

#### 3. Email Verification

**Steps:**
1. Register new account
2. Request email verification
3. Check email logs/inbox for verification link
4. Click verification link
5. Verify email marked as verified
6. Check for notification

**Expected Results:**
- Verification email sent
- Email contains valid verification link
- Clicking link verifies email
- User redirected to success page
- Notification created

#### 4. Password Reset

**Steps:**
1. Click "Forgot Password" on login page
2. Enter email address
3. Check email logs/inbox for reset link
4. Click reset link
5. Enter new password
6. Submit password reset
7. Verify can login with new password

**Expected Results:**
- Reset email sent
- Email contains valid reset link
- Reset form loads
- Password successfully changed
- Can login with new password

#### 5. Timestamped Comments (Trainer)

**Steps:**
1. Login as trainer
2. Navigate to assigned video
3. Play video to 15 seconds
4. Pause video
5. Click "Add Comment"
6. Verify timestamp pre-filled (00:15)
7. Enter comment text
8. Save comment
9. Repeat at different timestamps (00:30, 01:00)
10. Submit feedback
11. Login as user who owns video
12. View feedback
13. Click on timestamp in comment
14. Verify video jumps to that timestamp

**Expected Results:**
- Timestamps pre-filled correctly
- Comments saved successfully
- Comments appear in chronological order
- Markers appear on video timeline
- Clicking timestamp jumps video
- Comments included in feedback

### Mobile Testing

Test on real devices if possible:

**iOS Testing (iPhone 12+, iOS 15+):**
1. Safari: Test all critical flows
2. Verify touch targets are adequate size
3. Test video player in portrait and landscape
4. Test form inputs with iOS keyboard
5. Verify fullscreen video works

**Android Testing (Pixel 5+, Android 12+):**
1. Chrome: Test all critical flows
2. Verify touch targets are adequate size
3. Test video player in portrait and landscape
4. Test form inputs with Android keyboard
5. Verify fullscreen video works

### Accessibility Testing

**Keyboard Navigation:**
1. Unplug mouse
2. Navigate entire app using Tab, Shift+Tab, Enter, Space
3. Verify all functionality accessible
4. Verify focus indicators visible
5. Verify no keyboard traps

**Screen Reader Testing:**
1. Enable screen reader (NVDA on Windows, VoiceOver on Mac)
2. Navigate through each major page
3. Verify all content is announced
4. Verify form labels are read
5. Verify buttons have clear labels
6. Verify status messages are announced

**Color Contrast:**
1. Use browser DevTools or online tool
2. Check all text against backgrounds
3. Ensure minimum 4.5:1 contrast for normal text
4. Ensure minimum 3:1 contrast for large text

### Performance Testing

**Lighthouse Audit:**
```bash
# Build production version
npm run build
npm start

# Open Chrome DevTools
# Navigate to Lighthouse tab
# Run audit on each major page
# Target: Performance score > 90
```

**Pages to Audit:**
- Landing page (/)
- Dashboard (/dashboard)
- Video player page
- Trainer listings (/trainers)
- Credits page (/credits)

**Bundle Size Check:**
```bash
# Install bundle analyzer
npm install -D @next/bundle-analyzer

# Add to next.config.js:
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... existing config
});

# Analyze bundle
ANALYZE=true npm run build

# Target: Total JS < 300KB
```

---

## Continuous Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: formfit_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/formfit_test

      - name: Run unit tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Pre-commit Hooks

Use Husky to run tests before commits:

```bash
# Install husky
npm install -D husky

# Initialize husky
npx husky init

# Add pre-commit hook
echo "npm run test" > .husky/pre-commit
```

---

## Troubleshooting

### Common Issues

#### Tests Fail with "Cannot find module"

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

#### Database Connection Errors

**Solution:**
```bash
# Ensure PostgreSQL is running
# Check DATABASE_URL in .env.test
# Run migrations
npx prisma migrate deploy
```

#### Playwright Tests Timeout

**Solution:**
```bash
# Increase timeout in playwright.config.ts
timeout: 60 * 1000, // 60 seconds

# Or set timeout per test
test('my test', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes
});

# Ensure dev server is running before tests
npm run dev # in separate terminal
npx playwright test
```

#### React Testing Library Warnings

**Solution:**
```typescript
// Wrap async updates in act()
import { act } from '@testing-library/react';

await act(async () => {
  // ... async operations
});

// Or use waitFor
import { waitFor } from '@testing-library/react';

await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

#### Mock Not Working

**Solution:**
```typescript
// Ensure mock is hoisted
vi.mock('@/lib/module', () => ({
  myFunction: vi.fn(),
}));

// Clear mocks between tests
import { afterEach } from 'vitest';

afterEach(() => {
  vi.clearAllMocks();
});
```

### Getting Help

- Check test output for specific error messages
- Use `--debug` flag for E2E tests
- Use `--ui` flag to visually inspect tests
- Check test logs in CI/CD pipeline
- Review test configuration files

---

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Last Updated:** 2026-03-14
**Test Coverage Target:** 80%
**Maintained By:** Development Team
