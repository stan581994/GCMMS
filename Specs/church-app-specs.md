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
| **Admin** | Full access — manage members, households, users, and all records |
| **Account Specialist** | Can view and edit member records and statuses |
| **Clerk** | Can view and edit member records and statuses |
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

---

## Pages & Features

### 1. Login Page
- Email + password login via Supabase Auth
- No sign-up link visible — admin-only account creation
- Redirect to Dashboard on success

### 2. Dashboard
- **Visible to:** All roles
- Summary stat cards: Total Members · Active · Moved Out · Transferred · Unknown
- Recent updates feed: who changed what record, and when

### 3. Members List
- **Visible to:** All roles
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
- **Visible to:** All roles
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

---

## Project Folder Structure

```
church-app/
├── src/
│   ├── components/         # Shared UI components (shadcn/ui + custom)
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Members.tsx
│   │   ├── MemberDetail.tsx
│   │   ├── Households.tsx
│   │   ├── HouseholdDetail.tsx
│   │   └── UserManagement.tsx
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client init
│   │   └── auth.ts         # Auth helpers and role checks
│   ├── hooks/              # useMembers, useHouseholds, useAuth
│   └── types/              # TypeScript types matching DB schema
├── supabase/
│   └── migrations/         # SQL migration files
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

---

## Acceptance Criteria

- [ ] Each role sees only what they are permitted to see and edit
- [ ] A volunteer (Ministering role) can update a member's status in the field on mobile
- [ ] `updated_by` and `updated_at` are recorded on every member save
- [ ] Admin can create a new user account and assign a role
- [ ] Households display all family members grouped together
- [ ] App is fully usable on a 375px-wide mobile screen
