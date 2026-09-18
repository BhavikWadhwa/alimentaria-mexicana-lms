# Pilot architecture

The pilot lives under `app/pilot` and uses standard Next.js App Router. The old public demo uses `app/employee`, `app/manager`, and browser-local stores. Those routes contain fictional data only. They never access Supabase and do not grant a pilot session. The pilot reuses the project's CSS tokens and typography; its focused components live in `app/components/pilot`. Domain types, validation, auth, and HTTP helpers live in `app/lib/pilot`.

## Identity and permissions

`@supabase/ssr` persists Auth sessions in HTTP-only, SameSite=Lax cookies; HTTPS deployments mark cookies Secure. `proxy.ts` refreshes expiring sessions before rendering. Every protected page and API action independently verifies the Auth user and reads their current active employee profile. Database policies independently read active status rather than trusting stale JWT role claims. No custom password storage exists.

Application access is ADMIN, MANAGER, or EMPLOYEE. A separate `job_roles` relation describes kitchen roles such as Prep Cook. Administrators manage all content and employees; managers view employee records and assign published content they themselves are authorized to read. Managers do not bypass kitchen-role restrictions. Employees read only their own assigned, published, authorized training and published, authorized SOPs. Administrators always retain content management access. This is one restaurant per database, not a multi-tenant system.

All anonymous table access and client table writes are revoked. RLS limits SELECTs. Mutations use named PostgreSQL RPCs with explicit role checks, fixed `search_path`, and narrowly scoped SECURITY DEFINER behavior. Private helpers avoid recursive RLS. Correct answer indices live in `private.quiz_answers`, which has no client SELECT grants or policy. Only administrators can call `editor_answers`.

## Model

| Table                  | Purpose                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `job_roles`            | Kitchen role names                                                                   |
| `employees`            | Auth identity, name, email, application access, kitchen role, active status, station |
| `learning_items`       | Shared content metadata; kind TRAINING or SOP; DRAFT/PUBLISHED/ARCHIVED              |
| `item_role_access`     | Allowed kitchen roles for a restricted item                                          |
| `content_blocks`       | Ordered heading, text, callout, private image/document/video, or public video link   |
| `quiz_questions`       | Questions and choices visible to authorized learners                                 |
| `private.quiz_answers` | Private correct indices                                                              |
| `assignments`          | Individual employee/module pair, status, timestamps, historical title                |
| `quiz_attempts`        | Immutable result, pass mark, question count, employee and date                       |
| `storage.buckets`      | Private `pilot-content` media bucket                                                 |

SOPs and training share the authoring model but have distinct semantics and screens. SOPs cannot be assigned or contain quizzes. The role access relation applies to both. General training still requires assignment for employees; “general” never means a public URL.

## Completion and content changes

Opening assigned training starts it through `advance_training`. Acknowledging content completes modules with no quiz; otherwise the employee submits an answer map to `submit_quiz`. The database calculates the integer percentage, writes each attempt, and marks completion only on passing. Transactions and row locks serialize duplicate submissions and module edits. Assignments are unique per employee/module, so repeated assignment is idempotent.

Only drafts can be edited. The editor saves metadata, role access, blocks, and quiz definitions in one transaction. A published module must move back to draft before editing. Drafts are hidden from learners. Saving revised content clears acknowledgements for unfinished assignments; it never changes finished results. Archived and deactivated records are retained. Employees no longer see unavailable modules or their metadata; management retains their history. Historical titles, quiz scores, pass marks, and question counts are stored independently of the current editor. Exact historical questions and content are not versioned in V1.

## Private files

Files never enter `public/`. The private bucket deliberately has no authenticated SELECT policy: this prevents clients from minting signed URLs that survive deactivation. `/api/pilot/files` verifies the employee and item through RLS before using the server-only service key to transport bytes. Files use generated paths scoped to an item UUID, MIME allowlists, `no-store`, `nosniff`, and a sandbox policy. Uploads are admin-only and draft-only. Confidential videos require private uploads. Ordinary public educational video links are allowlisted YouTube/Vimeo embeds.

The service key is otherwise used only for Supabase Auth administration. Cookie-authenticated API mutations enforce the configured `APP_URL` origin. React escapes all authored text; the app never renders raw author HTML. Private responses and routes prohibit caching. Existing bytes already seen by a user cannot be revoked; this is access control, not DRM.

## Extension points

The ordered content relation can support chapters or reusable SOP links later. Kitchen roles remain distinct from application access so future station permissions do not become administrator privileges. Versioning, recertification, individual grants, notifications, AI, import, analytics, and operations are intentionally outside the pilot.
