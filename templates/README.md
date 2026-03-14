# Test Templates

This directory contains templates used by the QA Agent to generate comprehensive E2E tests using Playwright.

## Files

### `playwright.config.ts`
Playwright configuration template that will be copied to generated projects.

**Features:**
- Chromium browser testing (easily extend to Firefox, WebKit)
- Automatic dev server startup
- Screenshots on failure
- Video recording on failure
- HTML test reports
- JSON test results export

### `test-examples/`
Example test files that demonstrate best practices for different test categories.

#### `auth.spec.ts`
Authentication flow testing examples:
- User signup validation
- User login/logout
- Password reset flows
- Protected route guards
- Session management

#### `accessibility.spec.ts`
Accessibility testing with axe-core:
- WCAG 2.1 AA compliance checking
- Keyboard navigation testing
- Focus management
- Color contrast validation
- ARIA attributes verification
- Form label checking

#### `api.spec.ts`
API integration testing:
- REST endpoint testing
- Authentication/authorization
- Request validation
- Error handling
- Rate limiting
- Performance benchmarks
- CORS headers

## How QA Agent Uses These

1. **Setup Phase:**
   - Copies `playwright.config.ts` to `output/generated-project/`
   - Installs Playwright and dependencies

2. **Test Generation Phase:**
   - References these examples to understand test patterns
   - Adapts patterns to the specific app's product spec
   - Generates custom tests based on user flows

3. **Test Execution Phase:**
   - Runs generated tests with `npx playwright test`
   - Captures screenshots and videos of failures
   - Generates HTML report and JSON results

4. **Reporting Phase:**
   - Parses `test-results.json`
   - Creates comprehensive QA report with metrics
   - Includes screenshots and recommendations

## Test ID Convention

All templates use `data-testid` attributes following this convention:
```
{element-type}-{purpose}-{optional-descriptor}
```

Examples:
- `data-testid="login-button"`
- `data-testid="email-input"`
- `data-testid="error-message"`
- `data-testid="user-profile-card"`

This ensures stable, maintainable tests that don't break on UI changes.

## Extending Templates

To add new test patterns:

1. Create new example file in `test-examples/`
2. Follow the existing naming convention
3. Add comprehensive comments
4. Use data-testid selectors
5. Include both happy path and error scenarios
6. Update this README

## Dependencies

Tests require:
- `@playwright/test` - E2E testing framework
- `@axe-core/playwright` - Accessibility testing
- `lighthouse` - Performance auditing (optional, via CLI)
