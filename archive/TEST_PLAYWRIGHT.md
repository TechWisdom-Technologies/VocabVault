# Playwright E2E Test: Google Login

This test suite uses Playwright to exercise the Google login UI in a mocked environment.

Setup:

1. Install dependencies:

```bash
npm install
npx playwright install --with-deps
```

2. Run the dev server (Playwright config expects `http://localhost:4000`):

```bash
npm run dev
```

3. Run Playwright tests:

```bash
npm run test:e2e
```

What the test does:
- Intercepts `POST /api/auth/session` and returns a mocked successful session.
- Injects `window.__TEST_MOCKS__.loginWithGoogle` so the login page uses the test hook instead of calling Firebase.
- Clicks the "Continue with Google" button and verifies the app navigates to `/onboarding` (mocked user has `onboardingComplete: false`).

Notes:
- These tests do not perform real Firebase OAuth. They validate the client/server exchange integration and routing logic.
- If you want real OAuth tests, you'll need a test Firebase project and real browser interaction credentials; that is outside the scope of this quick e2e harness.
