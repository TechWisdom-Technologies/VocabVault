# Security Audit — VocabVault

Date: 2026-05-27

Summary
- Scope: quick code security review of the repository files that handle auth, secrets, DB access, and third-party clients.
- Goal: identify high-risk items, concrete recommendations, and next steps for mitigation.

High-risk findings

- **Raw SQL usage (`prisma.$executeRawUnsafe`)**: Found in [src/app/api/admin/words/route.ts](src/app/api/admin/words/route.ts#L70-L90) and [src/app/api/admin/words/bulk/route.ts](src/app/api/admin/words/bulk/route.ts#L120-L132). These endpoints accept admin-uploaded JSON and use `$executeRawUnsafe` to update JSONB fields. Even though parameters are passed, prefer Prisma's safe templating APIs or explicit parameterized bindings to avoid injection risk.

- **Firebase Admin credential handling & logging**: [src/lib/firebase/admin.ts](src/lib/firebase/admin.ts#L12-L36) reads `FIREBASE_ADMIN_PRIVATE_KEY` / `FIREBASE_ADMIN_SERVICE_ACCOUNT` and logs a debug object including `keyLength`. Logging any secret-derived value (even length) can leak sensitive information in shared logs. Also ensure newline handling of PEM keys is correct and validated.

- **Secrets in environment**: Many server-side initializers read secrets directly from `process.env` (`STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `DEEPGRAM_API_KEY`, `UPSTASH_REDIS_REST_TOKEN`, `GROQ_API_KEY*`, `SUPABASE_SERVICE_ROLE_KEY`, `DIRECT_URL`/`DATABASE_URL`). Files of interest: `src/lib/stripe.ts`, `src/lib/resend.ts`, `src/lib/deepgram.ts`, `src/lib/redis.ts`, `src/lib/groq.ts`, `src/lib/supabase/client.ts`, `src/lib/prisma.ts`. Ensure secrets are stored in a secrets manager (not in repo or CI logs), rotated regularly, and access is limited.

- **Session token exposure (client-side storage)**: The app uses a custom `x-session-token` header and stores session tokens in client-side state (`src/stores/auth-store.ts`). Tokens accessible to JavaScript are vulnerable to XSS. Consider using secure, HttpOnly cookies for session tokens or ensure robust CSP and XSS protections.

- **Bulk import and admin endpoints (validation & rate limiting)**: Bulk import endpoints accept uploaded data and run DB updates. These endpoints are admin-protected but should still validate input size, field types, and enforce transactional updates and rate limits. See `src/app/api/admin/words/bulk/route.ts` and other admin routes.

Medium-risk findings

- **Redis token scope**: Upstash REST token is used from env (`UPSTASH_REDIS_REST_TOKEN`). REST tokens can be high-privilege; prefer limited-scope tokens or use private network/ACLs. Rotate tokens if exposed.

- **Prisma connection usage**: `src/lib/prisma.ts` uses `DIRECT_URL || DATABASE_URL`. Ensure production uses a connection string with minimal privileges and that connection strings are not leaked in logs or error messages.

- **Third-party public keys**: `NEXT_PUBLIC_*` vars (Firebase, Supabase anon keys) are intentionally public. Confirm they do not provide secret-level access (they should be safe to expose to browser).

Low-risk / informational

- Some libraries (Sentry, Deepgram) are configured to avoid CORS preflights or warn about CORS; ensure telemetry endpoints do not leak PII and are configured with proper privacy settings.

Recommendations (short list)

1. Replace `prisma.$executeRawUnsafe` calls with safe Prisma APIs:
   - Use `prisma.$executeRaw` / template-literal binding or parameterized queries.
   - Or update via Prisma's JSON field support (`update` with `recall_1_questions: ...`) if possible.

2. Remove secret logging and tighten Firebase admin key handling:
   - Delete `console.log` calls that surface key metadata in `src/lib/firebase/admin.ts`.
   - Prefer `FIREBASE_ADMIN_SERVICE_ACCOUNT` JSON or structured secret from secret manager.

3. Move secrets into a secret manager (Vault, AWS Secrets Manager, etc.) and rotate keys regularly.

4. Mitigate session theft risk:
   - Prefer HttpOnly, Secure cookies for session tokens where possible.
   - If keeping JS-accessible tokens, enforce strict CSP, sanitize all DOM sinks, and use short token lifetimes and refresh flows.

5. Harden admin endpoints and bulk import:
   - Add thorough validation (JSON schema), size limits, and transactional DB updates.
   - Add rate limiting and auditing for admin actions.

6. Run pipeline checks before deploy:
   - Run `npm audit` / `pnpm audit` and upgrade vulnerable deps.
   - Run a secret-scan (truffleHog/gitleaks) against repo and history.

7. CI / logging hygiene:
   - Ensure CI does not print secrets. Mask secrets in CI logs.
   - Limit log retention for sensitive environments.

Next steps I can take (pick one):
- Run an automated dependency vulnerability scan (`npm audit`) and add results to `security-audit.md`.
- Run a repo secret-scan (gitleaks) and report any findings.
- Prepare a PR that: replaces `$executeRawUnsafe` usages with safe Prisma calls and removes the Firebase secret logging.

Files inspected (non-exhaustive)
- [src/lib/auth.ts](src/lib/auth.ts#L1)
- [src/lib/prisma.ts](src/lib/prisma.ts#L1)
- [src/lib/groq.ts](src/lib/groq.ts#L1)
- [src/lib/redis.ts](src/lib/redis.ts#L1)
- [src/lib/firebase/admin.ts](src/lib/firebase/admin.ts#L1)
- [src/app/api/admin/words/route.ts](src/app/api/admin/words/route.ts#L1)
- [src/app/api/admin/words/bulk/route.ts](src/app/api/admin/words/bulk/route.ts#L1)
- [src/lib/stripe.ts](src/lib/stripe.ts#L1)
- [src/lib/resend.ts](src/lib/resend.ts#L1)
- [src/lib/deepgram.ts](src/lib/deepgram.ts#L1)
- [src/lib/supabase/client.ts](src/lib/supabase/client.ts#L1)

If you want, I can now:
- run `npm audit` and append results here, and/or
- run a secret scan (gitleaks) in this workspace, and/or
- implement quick fixes (remove logging + replace `$executeRawUnsafe`) and open a PR.

---
Generated by code scan — ask which follow-up you want next.
