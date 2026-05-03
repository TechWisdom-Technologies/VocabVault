# Test Google Login (local)

Follow these steps to manually verify Google login (popup only):

1. Ensure environment variables are set (use your .env.local):

```bash
# example (already present in repo)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

2. In the Firebase Console -> Authentication -> Sign-in method:
- Ensure the Google provider is enabled.
- Add your local dev origin to Authorized domains (e.g. `localhost`, `localhost:3000`).
- Add your production domain when deploying.

3. Start the dev server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

4. Open the app at `http://localhost:3000` and go to `/login`.

5. Click **Continue with Google**:
- Desktop: a popup should appear. Authorize and complete sign-in.
- Mobile: popup behavior depends on device/browser; mobile browsers often open a new tab for OAuth.

6. Expected behavior:
- After successful Google sign-in, your Firebase ID token is exchanged with `/api/auth/session` and you land on onboarding (if new) or `/dashboard`.
- If the account email is not verified and your policy requires verification, the client will sign out and show the verify-email flow.

- Troubleshooting:
- If popup fails due to cross-origin or blocked popup, instruct users to allow popups or try a different browser. Redirect flow has been disabled per project preference.
- If you see `Invalid Firebase token`, confirm the `NEXT_PUBLIC_FIREBASE_*` values target the same Firebase project as the Google provider.
- Check browser console for Firebase errors (`auth/popup-closed-by-user`, `auth/popup-blocked`, etc.) and server logs for `/api/auth/session` errors.

8. Optional: Clear persisted auth store in localStorage under key `vocabvault-auth` to reset state.

If you want, I can add a small automated Cypress/Playwright script to exercise the flows next.