# Alimentaria Mexicana LMS pilot + baysics demo

For the technical meeting, see [the detailed IT briefing](docs/it-head-briefing.md). See [the independent repository checkpoint](docs/repository-checkpoint.md) for the GitHub split, included source, and the distinction between pilot and demo commands.

The persistent LMS application is at `/pilot/login`. It uses Next.js, TypeScript, Tailwind, Supabase Auth/PostgreSQL/Storage and database Row Level Security. The original fictional baysics demo remains intact at its original routes. Existing local demo state is not migrated into real employee records.

Start with [pilot setup and deployment](docs/pilot-setup.md), [architecture and schema](docs/architecture.md), [testing](docs/testing.md), and the [repository audit](docs/audit.md). These documents cover environment variables, migrations, bootstrap, roles, RLS, routes, administration, Vercel, backups, and launch limitations. Use `npm run dev:pilot` for the secure Next.js application and `npm run build:pilot` for its production build. Supabase/Vercel projects and approved real content must be configured before employee use.

The following documentation describes the retained **fictional demo**, not the pilot's security or data model.

**Training, prep, handoffs, and equipment—together.**

baysics is a polished frontend concept for independent restaurant teams. It preserves the original employee learning-management experience and extends it with daily prep planning, shift handoffs, equipment records, QR access, and a manager-facing **Today’s Kitchen** overview. Menu engineering and waste tracking remain available as a clearly labelled experimental demo area.

This is a demonstration, not a production restaurant-management system. All restaurant, employee, operational, financial, recipe, temperature, and safety data is fictional or placeholder content.

## Main experiences

- **Employee LMS:** seven-module pathway, lesson progress, five-question quiz, recipe/SOP guides, checklists, and certificates
- **Today’s Kitchen:** live summary of prep progress, unresolved handoffs, equipment issues, and training attention
- **Prep Planning:** date views, station filtering, assignments, priorities, editable tasks, completion controls, and linked SOPs
- **Shift Handoff:** morning brief, categorized notes, acknowledgement/resolution, and conversion into prep tasks or equipment issues
- **Equipment:** asset directory, live issue status, issue reporting, maintenance history, manager-added service records, LMS links, and printable QR labels
- **Menu & Waste Demo:** existing menu engineering and waste tools grouped as a secondary experimental area
- **Shared demo state:** operational updates persist locally and immediately appear across related manager views

## Tech stack

- Next.js App Router compatible through the bundled vinext runtime
- React 19 and TypeScript
- Tailwind CSS 4 plus project design tokens
- Lucide React icons
- Recharts for focused visualizations
- `qrcode.react` for real equipment QR codes
- Typed mock data and browser local storage

## Local setup

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Validation commands:

```bash
npm run lint
npx tsc --noEmit
npm test
```

## Deployment

The project is configured for Cloudflare Workers. After authenticating with `npx wrangler login`, publish with:

```bash
npm run deploy
```

A custom domain can be attached in Cloudflare after deployment.

## Project structure

```text
app/
  components/
    dashboard/       Shared employee and manager shell
    manager/         Today’s Kitchen, people, content, menu, and waste
    marketing/       Public homepage and login
    operations/      Equipment, prep, and handoff workflows
    quiz/            Working quiz experience
    shared/          Prototype role and reset controls
    training/        Modules, lessons, recipes, checklists, certificates
  config/brand.ts    Product identity, restaurant, colours, dates, and imagery
  data/
    mock-data.ts     Existing LMS, employee, recipe, quiz, and certificate data
    operations-data.ts Operational equipment, prep, handoff, and maintenance data
  lib/
    storage.ts       Local-storage keys and helpers
    operations-store.ts Shared reactive operations state
  types/index.ts     Shared product types
  employee/          Employee routes
  equipment/         Mobile-friendly QR destination routes
  manager/           Manager and operations routes
```

## Available routes

- `/` — public marketing website
- `/login` and `/demo` — no-account role selection
- `/employee` — employee dashboard
- `/employee/training` — training pathway
- `/employee/training/[moduleId]` — interactive lesson page
- `/employee/training/fryer-station/quiz` — working quiz
- `/employee/menu-knowledge` — menu knowledge training
- `/employee/recipes` — searchable recipe and SOP guides
- `/employee/checklists` — persistent checklists
- `/employee/certificates` — earned and locked certificates
- `/manager` — Today’s Kitchen overview
- `/manager/prep` — daily prep planning
- `/manager/handoff` — shift handoff and morning brief
- `/manager/equipment` — equipment directory
- `/manager/equipment/[equipmentId]` — full equipment record
- `/equipment/[equipmentId]` — mobile-friendly QR destination
- `/manager/employees` — employee progress and details
- `/manager/content` — training content library and editor
- `/manager/menu-waste` — experimental menu and waste area
- `/manager/menu-engineering` and `/manager/waste` — retained direct demo routes

## Demo roles

- **Employee:** Bhavik, Line Cook
- **Manager:** Martin, Training Manager
- **Restaurant:** Casa Mercado, a fictional demonstration restaurant

No authentication is performed and no form data is transmitted.

## Shared data model

Operational records reference the same fictional restaurant, location, employees, training modules, and recipe/SOP identifiers used by the LMS. Equipment links open existing training modules rather than duplicating lesson content. Prep links open existing recipe guides. Handoff notes can create prep tasks or equipment issues in the same local state.

Primary demo entities include `Equipment`, `EquipmentIssue`, `MaintenanceRecord`, `PrepTask`, `HandoffNote`, and `EquipmentTrainingLink`. Definitions live in `app/types/index.ts`; seeded records live in `app/data/operations-data.ts`.

## QR routing

Each equipment record produces a real QR code pointing to `/equipment/[equipmentId]` on the current origin. Scanning a deployed code opens a touch-friendly equipment page with operating context, issues, maintenance history, training/SOP links, and issue reporting. The manager view includes a printable label action.

## Local storage

The prototype stores completed lessons, quiz scores, checklist checks, waste logs, operational state, and demo preferences in the current browser. Keys are centralized in `app/lib/storage.ts`. The persistent demo control’s **Reset** action removes baysics demo keys without touching unrelated browser data.

Because there is no backend, records are not shared between devices, browsers, or users. The local state layer is intentionally structured so its typed entities can later map to API endpoints and database tables without changing the UI concepts.

## Replacing branding and imagery

Edit `app/config/brand.ts` to replace the product name, tagline, restaurant identity, demo people, palette values, dates, contact placeholder, and all image URLs. Matching CSS colour tokens live at the top of `app/globals.css`. Preserve meaningful image alt text when replacing photography.

## Future production requirements

- Authentication, account recovery, and restaurant tenancy
- Database-backed content, operations, and progress records
- Role-based permissions and auditable manager actions
- Employee invitations and onboarding lifecycle
- Video hosting, transcoding, and content authoring
- Notifications, analytics, exports, and reporting
- Multi-location support, scheduling, and supplier integrations
- Translation and localization workflows
- Privacy, retention, consent, audit logging, and data security
- Approved restaurant-specific food-safety procedures and legal review

## Demo limitations

- Data is device-local and resets when browser storage is cleared.
- Login fields are visual only.
- File uploads, notifications, integrations, and multi-user collaboration are placeholders.
- Recipe, temperature, timing, maintenance, and safety details must not be used as live operating instructions.
- Remote Unsplash imagery requires an internet connection and should be replaced with approved production assets.
