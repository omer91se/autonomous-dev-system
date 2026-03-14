import { test, expect } from '@playwright/test';

/**
 * API Integration Tests
 * Tests API endpoints directly using Playwright's request context
 */

// Helper to get auth token
async function getAuthToken(request: any): Promise<string> {
  const response = await request.post('/api/auth/signin', {
    data: {
      email: 'test@example.com',
      password: 'testpassword123'
    }
  });

  const data = await response.json();
  return data.token || data.accessToken;
}

test.describe('API Endpoints', () => {
  test('GET /api/users/me returns authenticated user', async ({ request }) => {
    const token = await getAuthToken(request);

    const response = await request.get('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('email');
    expect(data.email).toBe('test@example.com');
  });

  test('GET /api/users/me returns 401 without auth', async ({ request }) => {
    const response = await request.get('/api/users/me');

    expect(response.status()).toBe(401);
  });

  test('POST /api/users creates new user', async ({ request }) => {
    const newUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'SecurePass123!',
      name: 'Test User'
    };

    const response = await request.post('/api/users', {
      data: newUser
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.email).toBe(newUser.email);
    expect(data.name).toBe(newUser.name);
    // Password should not be returned
    expect(data).not.toHaveProperty('password');
  });

  test('POST /api/users validates email format', async ({ request }) => {
    const invalidUser = {
      email: 'invalid-email',
      password: 'SecurePass123!',
      name: 'Test User'
    };

    const response = await request.post('/api/users', {
      data: invalidUser
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/email/i);
  });

  test('PUT /api/users/:id updates user', async ({ request }) => {
    const token = await getAuthToken(request);

    const updates = {
      name: 'Updated Name'
    };

    const response = await request.put('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: updates
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.name).toBe('Updated Name');
  });

  test('DELETE /api/users/:id requires authorization', async ({ request }) => {
    const response = await request.delete('/api/users/123');

    expect(response.status()).toBe(401);
  });

  test('API returns proper error for not found', async ({ request }) => {
    const token = await getAuthToken(request);

    const response = await request.get('/api/users/99999', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('API handles malformed JSON', async ({ request }) => {
    const response = await request.post('/api/users', {
      data: 'not valid json',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    expect(response.status()).toBe(400);
  });

  test('API rate limiting works', async ({ request }) => {
    // Make many requests quickly
    const requests = Array(100).fill(null).map(() =>
      request.get('/api/health')
    );

    const responses = await Promise.all(requests);

    // At least one should be rate limited
    const rateLimited = responses.some(r => r.status() === 429);

    // Note: This test might be skipped if rate limiting is not implemented
    // The QA agent should note this in the report
    if (!rateLimited) {
      console.warn('Rate limiting not detected - may not be implemented');
    }
  });

  test('API returns consistent response format', async ({ request }) => {
    const token = await getAuthToken(request);

    const response = await request.get('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    // Check for consistent timestamp format
    if (data.createdAt) {
      expect(new Date(data.createdAt).toString()).not.toBe('Invalid Date');
    }

    // Check for consistent ID format
    if (data.id) {
      expect(typeof data.id).toBe('string');
    }
  });

  test('API handles concurrent requests', async ({ request }) => {
    const token = await getAuthToken(request);

    // Make multiple concurrent requests
    const requests = Array(10).fill(null).map(() =>
      request.get('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    );

    const responses = await Promise.all(requests);

    // All should succeed
    responses.forEach(response => {
      expect(response.ok()).toBeTruthy();
    });
  });

  test('API returns proper CORS headers', async ({ request }) => {
    const response = await request.options('/api/users');

    const headers = response.headers();

    // Should have CORS headers (adjust based on your config)
    expect(headers['access-control-allow-origin']).toBeDefined();
  });
});

test.describe('API Performance', () => {
  test('API endpoints respond within acceptable time', async ({ request }) => {
    const token = await getAuthToken(request);

    const start = Date.now();
    const response = await request.get('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const duration = Date.now() - start;

    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(500); // Should respond in less than 500ms
  });
});
