# Existing project audit — 9 September 2026

The foundation is React 19, TypeScript, Tailwind 4, and Next App Router-compatible pages served by vinext/Vite on Cloudflare Workers. The repository has no registered Sites hosting manifest, database schema, authentication, or production deployment credentials. `db/` and `.openai/` are empty. Existing `worker/`, `build/`, and Wrangler files support the demo runtime.

`app/components/dashboard/AppShell.tsx` and `app/globals.css` provide the design system. `app/data/mock-data.ts` and browser storage implement fictional employees, modules, lessons, quizzes, and progress. Employee and manager URLs are public demo pages; role selection is not authentication. The content editor, employee pages, recipes, and operational modules are demonstration components, not reusable persistence services. Existing rendered-HTML tests check the demo.

There were uncommitted edits to branding, marketing, dashboards, local storage, and operations when this work began. They are retained. The pilot reuses React, routing conventions, typography, colors, and layout classes, but has separate domain types and services. Connecting production records to demo stores would risk leaking confidential information or showing false completion records.

The secure application is under `/pilot`; original routes remain explicitly fictional demonstrations and never query pilot data. Native Next.js scripts provide the requested Vercel target without removing vinext. Authentication and RLS use Supabase. Production is single-restaurant; multi-tenant operation is deliberately not assumed.
