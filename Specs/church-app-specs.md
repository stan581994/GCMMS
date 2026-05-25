# Church Member Record Management App — Specifications

## Overview

A full-stack web app for a church ward to track whether 800+ members still reside in the ward area. Multiple volunteers are assigned to visit members and update records when someone has moved or transferred to another congregation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite + TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| Backend / Database | Supabase (Postgres + Auth + Row-Level Security) |
| Hosting | Vercel (frontend) · Supabase (backend) |

---

## User Roles

| Role | Description |
|---|---|
| **Admin** | Full access — manage members, households, users, callings, and all records |
| **Account Specialist** | Can view and edit member records and statuses |
| **Clerk** | Task-focused role — sees only their assigned task list (pending and completed); no access to member records |
| **Ministering** | Can view records; can update status/location for assigned members only |

> **Note:** No public self-signup. Admin manually creates accounts for all users.

---

## Database Schema

### `households`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | text | e.g. "De La Cruz Family" |
| address | text | Current known address |
| created_at | timestamptz | Auto-set |

### `members`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| household_id | uuid | Foreign key → households |
| first_name | text | |
| last_name | text | |
| phone | text | Nullable |
| email | text | Nullable |
| status | enum | `active` · `moved_out` · `transferred` · `unknown` |
| notes | text | Free-text remarks from volunteers |
| updated_by | uuid | FK → auth.users — who last edited |
| updated_at | timestamptz | Auto-updated on save |
| created_at | timestamptz | Auto-set |

### `app_users` (extends Supabase auth.users)
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK = auth.users.id |
| full_name | text | |
| role | enum | `admin` · `account_specialist` · `clerk` · `ministering` |
| created_at | timestamptz | Auto-set |

### `callings`
| Column | Type | Notes |
|---|---|---|
| id | bigint | Primary key (auto-increment) |
| member_id | bigint | FK → members |
| position | text | Calling title (predefined or custom) |
| sustained_date | date | Nullable — date member was sustained; cannot be a future date |
| is_set_apart | boolean | Whether the member has been set apart; defaults to false |
| released_date | date | Nullable — date member was released; cannot be a future date |
| status | text | `active` · `released` |
| created_by | uuid | FK → auth.users |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Auto-updated on change |

### `clerk_tasks`
| Column | Type | Notes |
|---|---|---|
| id | bigint | Primary key (auto-increment) |
| calling_id | bigint | FK → callings (cascades on delete) |
| task_type | text | `calling_assigned` · `calling_released` |
| description | text | Human-readable task string generated at creation |
| is_complete | boolean | Defaults to false |
| completed_at | timestamptz | Nullable — set when clerk marks done |
| created_by | uuid | FK → auth.users |
| created_at | timestamptz | Auto-set |

---

## Pages & Features

### 1. Login Page
- Email + password login via Supabase Auth
- No sign-up link visible — admin-only account creation
- Redirect to Dashboard on success

### 2. Dashboard
- **Admin / Account Specialist / Ministering:** Summary stat cards (Total · Active · Moved Out · Transferred · Unknown) + Recent Updates feed showing who edited what record and when
- **Clerk:** Shows "My Tasks" — a Pending Tasks card and a Completed card; no member stats or recent updates visible

### 3. Members List
- **Visible to:** Admin, Account Specialist, Ministering (hidden from Clerk)
- Search by name, phone, or address
- Filter by status and/or household
- Sortable columns: Name · Household · Status · Last Updated
- Click/tap a row → Member Detail page

### 4. Member Detail / Edit Page
- **Editable by:** Admin, Account Specialist, Clerk (full edit); Ministering (status + notes only)
- View all member fields
- Edit status via dropdown: Active · Moved Out · Transferred · Unknown
- Edit contact info and notes
- Shows other household members (family group context)
- Auto-saves `updated_by` and `updated_at` on every change

### 5. Households List
- **Visible to:** Admin, Account Specialist, Ministering
- List all households with member count and status summary
- Click/tap a row → Household Detail page

### 6. Household Detail Page
- All members in the family grouped together
- Edit household name and address

### 7. User Management
- **Visible to:** Admin only
- List all app users with their assigned roles
- Create a new user (triggers Supabase Auth invite email)
- Edit a user's role
- Deactivate / disable a user account

### 8. Callings Management
- **Visible to:** Admin only
- Lists all callings split into Active and Released sections
- **Assign Calling** — admin fills a form with:
  - Searchable member name field (filter-as-you-type from member list)
  - Organization (cascading first-level dropdown — e.g. Bishopric, Elders Quorum, Relief Society)
  - Calling Position (second-level dropdown filtered to the selected organization; includes a "Custom calling…" option that reveals a free-text input)
  - Sustained Date (date picker; cannot select future dates)
  - Set Apart checkbox
- **Release Calling** — admin fills a form with:
  - Searchable member name field
  - Active Calling to Release (dropdown of that member's active callings)
  - Released Date (date picker; cannot select future dates)
- Submitting either form automatically creates a task in `clerk_tasks` and notifies the clerk

### 9. Clerk Task List (Clerk Dashboard)
- **Visible to:** Clerk only, rendered as their entire dashboard
- **Pending Tasks card:** shows all incomplete tasks with a "Done" button on each row
  - Marking a task done moves it to the Completed card
- **Completed card:** shows finished tasks with strikethrough text and a green "Done" badge
- Task description format:
  - Assign: `Record calling: Last, First — Position, sustained YYYY-MM-DD`
  - Release: `Record release: Last, First — Position, released YYYY-MM-DD`

---

## Sidebar Navigation per Role

| Link | Admin | Account Specialist | Clerk | Ministering |
|---|---|---|---|---|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Members | ✓ | ✓ | — | ✓ |
| Callings | ✓ | — | — | — |
| User Management | ✓ | — | — | — |

---

## Calling Positions

Positions are predefined per organization (Golden City Ward — Dasmariñas Philippines Stake). Organized into 13 groups:

- Bishopric, Elders Quorum, Relief Society, Aaronic Priesthood, Young Women, Sunday School, Primary, Ward Missionaries, Temple and Family History, Young Single Adult, Music, Welfare and Self-Reliance, Other

Each group also supports a **Custom calling** option where the admin types a free-form position name.

---

## Member Status Values

| Status | Meaning |
|---|---|
| `active` | Member confirmed to still live in the ward area |
| `moved_out` | Member has moved to a different area |
| `transferred` | Member has joined another congregation/ward |
| `unknown` | Status has not been verified / cannot be reached |

---

## Key Design Decisions

- **Fully responsive** — works on mobile phones (field use by volunteers) and desktop equally
- **Row-Level Security (RLS)** — permissions enforced at the Supabase/database level, not just in the UI
- **Audit trail** — every member record stores `updated_by` + `updated_at` to track who made changes and when
- **Household-centric** — members are always displayed in the context of their family/household group
- **Clerk isolation** — the clerk role has a completely separate dashboard experience; they interact only with tasks created by admin calling actions, not with member records directly
- **Date constraints** — sustained and released date fields block future date selection via the `max` attribute

---

## Project Folder Structure

```
church-app/
├── src/
│   ├── components/
│   │   ├── ClerkTaskList.tsx       # Pending + completed task cards for clerk dashboard
│   │   ├── MemberSearchInput.tsx   # Filter-as-you-type member picker
│   │   └── [other shared UI]
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx           # Role-conditional: stats view or clerk task view
│   │   ├── Members.tsx
│   │   ├── MemberDetail.tsx
│   │   ├── Households.tsx
│   │   ├── HouseholdDetail.tsx
│   │   ├── CallingManagement.tsx   # Admin-only callings page
│   │   └── UserManagement.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── auth.ts
│   │   └── callings.ts             # Predefined calling positions by organization
│   ├── hooks/
│   └── types/
├── supabase/
│   └── migrations/
└── [config files]
```

---

## Implementation Phases

| Phase | Work |
|---|---|
| 1 | Scaffold project — Vite + React + TypeScript + Tailwind + shadcn/ui + Supabase client |
| 2 | Supabase setup — create project, run DB migrations, configure RLS policies per role |
| 3 | Auth flow — login page, session management, role-based route guards |
| 4 | Members CRUD — list, detail, edit status/notes, household linking |
| 5 | Households CRUD — list, detail, family grouping |
| 6 | Dashboard — aggregate stats + recent activity feed |
| 7 | User Management — admin panel for creating/editing/deactivating users |
| 8 | Responsive polish — test and adjust all pages at 375px mobile width |
| 9 | Callings Management — assign/release callings with clerk task notification system |

---

## Acceptance Criteria

- [ ] Each role sees only what they are permitted to see and edit
- [ ] A volunteer (Ministering role) can update a member's status in the field on mobile
- [ ] `updated_by` and `updated_at` are recorded on every member save
- [ ] Admin can create a new user account and assign a role
- [ ] Households display all family members grouped together
- [ ] App is fully usable on a 375px-wide mobile screen
- [ ] Admin can assign a calling by selecting organization → position (or typing a custom calling) with a member name search
- [ ] Admin can release a calling by searching a member and selecting from their active callings
- [ ] Sustained and released date fields reject future dates
- [ ] Assigning or releasing a calling automatically creates a task visible on the clerk's dashboard
- [ ] Clerk sees only their task list (pending and completed); no access to member records or stats
- [ ] Clerk can mark a task as done; it moves to the Completed section
