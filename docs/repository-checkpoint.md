# Independent Alimentaria repository checkpoint

17 September 2026.

The Alimentaria pilot is being preserved as an independent private GitHub repository named `alimentaria-mexicana-lms` under `BhavikWadhwa`, with a new initial commit rather than the Baysics Git history. The original Baysics remote, branches and staging area are not repointed or pushed as part of this checkpoint.

The checkpoint includes the current source, public design assets, dependency lockfile, Supabase migration, configuration templates, automated tests and technical documentation. It retains inherited demo routes and tooling because the user requested the complete current working state. Repository separation is complete only after the new remote is verified; removing demo code and simplifying default build commands is a separate future change.

No real environment file, credential, database export, Auth account data, private uploaded file, node_modules directory, build output, browser trace or local setup helper belongs in this source checkpoint. Actual employee/training records remain in Supabase. GitHub is not a backup of the live database or private Storage.

Use the sibling local checkout `../alimentaria-mexicana-lms` for future Alimentaria work. The original `baysics` directory remains available as the earlier working copy. Each has its own `.git`; do not accidentally continue committing the pilot to Baysics.

## Run this checkpoint

1. Install Node.js 22.13+ and run `npm ci`.
2. Configure ignored `.env.local` using `.env.example` and authorized project credentials.
3. Use `npm run dev:pilot`, or `npm run build:pilot` followed by `npm run start:pilot`.
4. Open `/pilot/login`.

The unsuffixed `dev`, `build`, `start`, `deploy` commands still belong to the retained demo runtime. `vercel.json` selects the pilot build explicitly. Do not blindly reapply the initial migration to the already configured Supabase project; reconcile its manually applied migration history first.

Read [the IT meeting briefing](it-head-briefing.md), [setup](pilot-setup.md), and [verification](testing.md) before deployment. Source checkpointing does not imply launch acceptance or resolution of the user's reported UI issues.
