# Setup and operational handoff

## Connected development project — 9 September 2026

The Alimentaria Mexicana organization and `alimentaria-lms-pilot` project (`dflgfjgxssujzekgoemm`) are configured on the Free plan in Canada Central. No paid upgrades, add-ons, or team invitations were enabled. Local Next.js uses this project through ignored `.env.local`; credentials must stay out of version control.

The initial SQL migration was applied transactionally through the Supabase SQL editor. Nine application tables have RLS enabled, eight read policies are present, and `pilot-content` is private. This manual application did not register CLI migration history: reconcile the recorded migration before any later `supabase db push`; do not rerun the initial CREATE statements against this database.

Public signup is disabled, the minimum password length is 12, and the local Site URL and exact `http://localhost:3000/pilot/auth/callback` redirect are configured. The first personal administrator was activated on 17 September 2026 and its email confirmation verified. Test identities remain inactive and test content archived after integration tests.

Vercel, a verified SMTP sender, real recovery delivery, and backup restoration remain pending. Supabase's current dashboard requires a custom SMTP sender before editing email templates; the default template remains in place and the application supports its PKCE callback. No paid service should be enabled without the owner's explicit authorization.

## Local development

Use Node 22.13+ and `npm ci`. The production-target runtime is `npm run dev:pilot` (Next.js). `npm run dev` retains the older vinext demo. Do not run both on port 3000.

Create a Supabase project, or install the Supabase CLI and start Docker for a local project. From this repository run `supabase start` then `supabase db reset` (local database only). This applies `supabase/migrations/202609090001_pilot.sql`; it does not seed restaurant procedures. With hosted Supabase run `supabase login`, `supabase link --project-ref YOUR_PROJECT_REF`, inspect `supabase db push --dry-run`, then `supabase db push` against the intended new project.

Copy `.env.example` to ignored `.env.local` and fill in:

| Variable                               | Meaning                                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Project API URL                                                                                         |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public publishable key (local anon key also supported)                                                  |
| `SUPABASE_SERVICE_ROLE_KEY`            | Server-only Supabase secret key (`sb_secret_...`) or legacy service-role key; never expose in a browser |
| `APP_URL`                              | Exact application origin, e.g. `http://localhost:3000`, with no trailing slash                          |

Restart the server after changing environment values. Without configuration the pilot login displays a setup state, disables sign-in, and protected URLs redirect to sign-in. It never falls back to demo identities.

### First administrator

After migration, create the first Auth identity through Supabase Authentication → Users → Add user → Create new user, choosing the password directly in the dashboard. Set `PILOT_ADMIN_EMAIL` and optionally `PILOT_ADMIN_FIRST_NAME`/`PILOT_ADMIN_LAST_NAME` in your shell. Run:

```sh
node --env-file=.env.local scripts/bootstrap-admin.mjs
```

The script activates the matching existing identity without reading or resetting its password. For command-line creation instead, set `PILOT_ADMIN_PASSWORD` (12+ characters) and remove it from your shell afterward. Treat this script as a privileged operational action. Subsequent employees are created in the application with initial passwords shared out of band and changed after first sign-in. There is no bulk invitation or public signup flow in V1.

## Authentication configuration

In Supabase Auth settings disable new user signups, require a minimum 12-character password, configure email/password auth, and set Site URL to `APP_URL`. Allow only the exact `/pilot/auth/callback` URLs for local and deployed environments; avoid wildcard production redirects. Keep Auth rate limits enabled and configure a verified SMTP sender before the pilot.

For recovery emails, set the Reset Password template link to:

```html
<a
  href="{{ .SiteURL }}/pilot/auth/callback?token_hash={{ .TokenHash }}&type=recovery"
  >Reset password</a
>
```

The callback verifies the single-use token and opens the protected password form. PKCE code callbacks are also supported. Password changes sign the user out. Inactive identities cannot enter the password page until management reactivates them. Confirm recovery delivery, expired-link handling, and sign-in on a real inbox before launch.

## Vercel

Import this repository into a new Vercel project. `vercel.json` selects the Next.js framework and `npm run build:pilot`. Configure the four environment variables above; set `APP_URL` to the exact HTTPS deployment domain. Use separate Supabase projects for development/staging and production. Configure preview environments with their own exact origin and Auth redirect allowlist, or disable pilot credentials in previews. Set the Supabase API maximum row limit to at least 10,000 for this small pilot; the local config already sets it. There is no pagination for large workforces in V1.

Run migrations before making the deployment available. Create the first administrator, sign in, complete the launch checklist below, and add the approved employee list. The original marketing/demo pages remain available and explicitly marked Demo. They use fictional records. Share the `/pilot/login` URL with real employees. Do not put real employee or confidential content into demo files.

## Backup and recovery

Confirm automatic database backups are enabled for the chosen Supabase plan and document retention with management. Before launch, restore a backup into a separate test project and verify an employee history record. Database backups do not include Storage file bytes: arrange a separate private object backup with retention and test restoration of a PDF/image too. Keep backup credentials outside the repository. Backups, SMTP, domains, and hosting are operational setup steps; this repository cannot enable an absent hosted service.

## Management usage

1. Sign in at `/pilot/login`; ADMIN accounts land at the management overview.
2. Open Employees, create an employee, choose application access and a kitchen role, and share the initial password securely.
3. Open Training & SOPs. Create a training module or SOP draft.
4. Add headings, text, callouts, and private media. Reorder using up/down buttons. Maximum upload size is 4 MB per file to stay under Vercel request limits. For larger files, an operator can upload allowed private media directly into `pilot-content` using the exact `item-uuid/file-uuid` path, then paste that reference into the editor. Large uploads, streaming, and transcoding are deferred.
5. If needed, restrict to selected kitchen roles. Confidential media must be uploaded privately. Administrators retain management access.
6. For training, optionally add multiple-choice questions and a pass mark. Save & publish.
7. Open an employee record and assign an eligible published training module. The database rejects inactive or unauthorized recipients.
8. Employees open My training, read all sections/documents, acknowledge completion, and pass the quiz if present. A failed quiz can be retried.
9. Open the employee record to inspect status, dates, latest result and all quiz attempts. Managers have read/assignment permissions; admins additionally edit content and accounts.
10. Deactivate former employees instead of deleting them. Archive obsolete content instead of deleting it. Both preserve management history. Reopen an employee and check Active to reactivate.

## Routes

| Route                                                   | Purpose                                                  |
| ------------------------------------------------------- | -------------------------------------------------------- |
| `/pilot/login`, `/pilot/reset`, `/pilot/password`       | Login, recovery request, change password                 |
| `/pilot/auth/callback`                                  | Verified recovery callback                               |
| `/pilot`                                                | Role-aware landing redirect                              |
| `/pilot/training`                                       | Own authorized assignments and progress                  |
| `/pilot/library`                                        | Published, authorized SOPs                               |
| `/pilot/items/[id]`                                     | Content reader, quiz, own results                        |
| `/pilot/admin`                                          | Basic management totals and progress                     |
| `/pilot/admin/employees`, `/pilot/admin/employees/[id]` | Employee management, assignment, history                 |
| `/pilot/admin/content`, `/pilot/admin/content/[id]`     | Content library and administrator editor                 |
| `/api/pilot/auth`                                       | Same-origin Auth mutations                               |
| `/api/pilot/actions`                                    | Validated employee/content/assignment/progress mutations |
| `/api/pilot/files`                                      | Authorized private upload/read                           |

## Launch acceptance checklist

- Apply migrations to the intended Supabase project and create initial admin.
- Configure SMTP, redirect URLs, Vercel environment, and HTTPS domain.
- Run `npm run test:unit`, `npm run test:e2e`, `npx tsc --noEmit`, `npm run lint`, `npm run build:pilot`.
- Run live E2E against a dedicated test Supabase project (see `docs/testing.md`).
- Verify direct table/API denial with two kitchen roles, employee/admin denial, immediate deactivation, archive/history retention, private Storage denial and recovery delivery.
- Have Martin approve 5–10 real procedures and quiz answers; no fictional recipe/safety instructions are seeded.
- Confirm backup/restore for both PostgreSQL and Storage.
- Demonstrate admin → employee → management completion flow on desktop and a physical phone. Record remaining launch issues before October 26, 2026.

## Known V1 limits

Single restaurant; flat content; one kitchen role per employee; no self-service signup, automatic invitations, bulk assignment, role editor, pagination, certificates, expiry, recertification, or historical content versions. The learning acknowledgment is self-attested, not surveillance. Completion is not reset when a module changes. Admin dashboard module totals respect the viewer's content authorization, so restricted modules may not count for a manager. Private media downloads are application-proxied and not optimized for long videos. The app does not cache confidential content offline or install a service worker. No PWA manifest was added. No screenshot/download prevention guarantee is made. Abandoned uploads require occasional administrator cleanup; no background jobs were introduced.
