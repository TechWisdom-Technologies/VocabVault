# Netlify AWS Lambda 4KB Env Limit Fix

Netlify server functions inherit runtime environment variables. AWS Lambda has a hard 4KB total limit for function env payload.

## What caused it

The largest variable is usually `FIREBASE_ADMIN_SERVICE_ACCOUNT` (full JSON), plus many other runtime variables.

## Code support added

`src/lib/firebase/admin.ts` now supports **split Firebase Admin credentials**:

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

It still supports `FIREBASE_ADMIN_SERVICE_ACCOUNT` as fallback, but for Netlify you should remove it.

## Required Netlify changes

1. In Netlify Site settings -> Environment variables:
- Add `FIREBASE_ADMIN_PROJECT_ID`
- Add `FIREBASE_ADMIN_CLIENT_EMAIL`
- Add `FIREBASE_ADMIN_PRIVATE_KEY` (use literal `\n` in multiline key)

2. Remove:
- `FIREBASE_ADMIN_SERVICE_ACCOUNT`

3. Scope non-runtime variables to **Builds only** where possible:
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `NEXT_PUBLIC_*` values (if only needed at build-time in your Next client bundle)

4. Redeploy.

## Quick size-reduction priority

If still over 4KB, reduce in this order:

1. Remove `FIREBASE_ADMIN_SERVICE_ACCOUNT`
2. Move Sentry build vars to Builds-only scope
3. Move unused `NEXT_PUBLIC_*` vars out of Functions scope
4. Remove any stale/unused secrets from Netlify

## Notes

- `DATABASE_URL`, `DIRECT_URL`, `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and Redis secrets are runtime server vars; keep them available to Functions.
- Keep private key formatting as escaped newlines (`\n`) in Netlify env input.
