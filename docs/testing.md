# Verification

Verified locally on 9 September 2026:

| Check                                                            | Result                                           |
| ---------------------------------------------------------------- | ------------------------------------------------ |
| Next.js 16.3.4 production build                                  | Passed                                           |
| TypeScript                                                       | Passed                                           |
| Pilot lint                                                       | Passed without warnings                          |
| Whole-repository lint                                            | No errors; existing demo image warnings remain   |
| Vitest / actual PostgreSQL migration                             | 22 passed                                        |
| Playwright against production build, desktop and mobile viewport | 6 passed                                         |
| Live Supabase workflow, desktop and mobile viewport              | 2 passed against the connected prelaunch project |
| Existing vinext demo build and rendered-HTML regression checks   | 3 passed                                         |
| Production dependency audit                                      | 0 reported vulnerabilities                       |

This is implementation verification, not production acceptance. The hosted Supabase migration and live Auth/database/private Storage workflow have been verified. Real SMTP recovery, Vercel deployment, physical-phone acceptance, and backup restoration remain pending.

## Commands

```sh
npm run test:unit
npm run test:e2e
npx tsc --noEmit
npm run lint
npm run build:pilot
```

The original `npm test` builds the retained vinext demo and runs its rendered-HTML checks. It is separate from the pilot tests.

Vitest executes the actual application migration in PGlite PostgreSQL. The tests create minimal stand-ins for Supabase's `auth.users`, `auth.uid()`, and `storage.buckets`; table grants, RLS and the application's stored procedures run unmodified. This validates database behavior, not the hosted Supabase Auth service or Storage API.

The 22 unit/database cases cover unassigned/restricted content, direct SELECTs, role escalation, forged completion and quiz writes, anonymous/inactive access, answer key isolation, manager permissions, self-demotion prevention, private bucket setup, idempotent assignments, content acknowledgments, failed quiz/retry/pass, malformed answers, other employees' assignments, duplicate completion, archive/history retention, and atomic authoring.

Playwright runs Chromium desktop and iPhone-sized Chromium projects. Install Chromium using `npx playwright install chromium`, or set `PLAYWRIGHT_CHANNEL=msedge` to use installed Microsoft Edge. The six setup-independent browser checks cover the responsive login/recovery pages, lack of demo bypass, unauthenticated direct route redirects, API origin denial, and private file denial. Mobile emulation does not substitute for a physical iPhone/Safari acceptance check.

## Live integration

Use a dedicated disposable Supabase test project, apply migrations, configure the four application environment variables, and start the application against it. Make those values available in the test runner's environment as well; `.env.local` is loaded by Next but not automatically by Playwright. Set `PILOT_LIVE_TESTS=1` and optionally `PILOT_TEST_URL` for an already running test deployment, then run `npm run test:e2e`.

The opt-in workflow creates test accounts with reserved `example.test` emails, creates an employee through the UI, authors and assigns restricted training with a quiz, fails/retries/passes as the employee, tests direct database and admin action denial, verifies history, deactivates the learner, archives the module, and verifies logout. It also uploads a small PNG through the application, verifies byte-for-byte authorized retrieval with no-store headers, denies unauthorized application and direct Storage access/signing, and denies media access after deactivation. Both employee and management contexts use the selected viewport.

The connected prelaunch project was tested before any real employee identities or content were added. Fixture identities remain inactive and content archived so normal history-retention rules stay intact; tiny fixture objects remain private. Do not run the fixture suite against an operational production project. Without the flag these two project runs are explicitly skipped, never reported as passed.

Live testing exposed and fixed an early-click hydration problem in action buttons and ambiguous form labels. Buttons now remain disabled until their browser handler is ready. The integration test also waits for the second user's sign-in redirect before opening restricted content.

### Remaining live acceptance

Verify a real password reset email with the configured SMTP sender or local Inbucket, expired/reused links, refresh across browser restarts, PDF/video rendering, deactivation while a media request is already pending, and physical mobile behavior. PNG access controls are covered by the hosted integration test. Confirm management's final content and backup restoration. Supabase is connected; Vercel and custom SMTP are not yet configured.

## Security audit

The initial dependency audit found a critical Next.js advisory in the existing demo dependencies. Next/React production packages were updated. Re-run `npm audit --omit=dev` before deployment and address any new production advisories. The retained vinext/Cloudflare development toolchain has separate advisories and is not the Vercel pilot runtime; do not deploy confidential pilot use through the old Worker build without a separately validated upgrade and equivalent session proxy support.
