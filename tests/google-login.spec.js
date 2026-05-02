import { test, expect } from '@playwright/test';

// Simple e2e that mocks /api/auth/session and exercises the "Continue with Google" button
// The app exposes a test hook: window.__TEST_MOCKS__.loginWithGoogle which the login page
// will call in tests instead of calling Firebase. The test hook will perform the fetch
// to /api/auth/session (which we also intercept here to ensure a stable response).

test.beforeEach(async ({ page }) => {
  // Intercept the session endpoint and return a fake successful session
  await page.route('**/api/auth/session', async (route) => {
    const json = {
      sessionToken: 'test-session-token',
      user: {
        id: 'user-test-1',
        email: 'test@example.com',
        name: 'Test User',
        plan: 'FREE',
        role: 'USER',
        onboardingComplete: false,
        rulesAcknowledged: false,
      },
      invalidatedAll: false,
    };

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
  });

  // Install a small test hook before any script runs
  await page.addInitScript(() => {
    // inject test helper for login flow
    window.__TEST_MOCKS__ = {
      // Called by the login page in test mode
      loginWithGoogle: async () => {
        // Simulate the client obtaining a firebase id token and exchanging it
        const firebaseToken = 'fake-firebase-token';
        const deviceInfo = { deviceName: 'Playwright', deviceType: 'browser', os: 'linux', ipAddress: '0.0.0.0' };
        const resp = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firebaseToken, deviceInfo }),
        });
        if (!resp.ok) throw new Error('session-failed');
        return await resp.json();
      },
    };
  });
});

test('google login button calls mocked session exchange and redirects', async ({ page }) => {
  await page.goto('/login');

  // Click the Continue with Google button
  await page.click('text=Continue with Google');

  // Wait for navigation or UI change - login page should redirect to onboarding (onboardingComplete false)
  await page.waitForURL('**/onboarding', { timeout: 5000 });
  expect(page.url()).toContain('/onboarding');
});
