# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GCMMS (Guardian Community Member Management System) is a ward (church group) member tracking application for 800+ members. Volunteers visit members to verify residency status. Built with React 18 + TypeScript + Vite + Supabase.

## Commands

```bash
# Development
npm run dev          # Start Vite dev server (usually http://localhost:5173)
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build locally

# Supabase local development
npx supabase start   # Start local Supabase stack (API: 54321, DB: 54322, Studio: 54323)
npx supabase stop    # Stop local stack
npx supabase db push # Push migrations to linked remote project
npx supabase db reset # Reset local DB and re-run all migrations + seed.sql
```

No test suite is configured yet.

## Architecture

**Stack:** React Router v6 (client-side routing), React Context for state, Supabase for auth + database, Tailwind + shadcn/ui for styling.

**Path alias:** `@/` maps to `src/` — use this for all imports.

### State Management

Two context providers wrap the app in `src/App.tsx`:

- **`AuthContext`** (`src/context/AuthContext.tsx`) — Supabase session, current user profile fetched from `app_users` table, `login()`, `logout()`, `switchRole()`. This is **the only fully wired backend integration**; all auth state comes from Supabase.
- **`DataContext`** (`src/context/DataContext.tsx`) — Members, households, and users state. Currently backed by **mock data** (`src/data/mock.ts`). The next major work is replacing these operations with Supabase queries.

### Role-Based Access Control

Four roles defined in `src/types/index.ts`: `admin`, `account_specialist`, `clerk`, `ministering`.

Permission helpers live in `src/lib/auth.ts`:
- `canEdit(role)` — admin, account_specialist, clerk can edit full records
- `canEditStatusOnly(role)` — ministering can only edit status/location for their assigned members
- `isAdmin(role)` — admin only

`ProtectedRoute` in `src/components/ProtectedRoute.tsx` enforces role checks at the route level.

### Database

Supabase Postgres with three migrations in `supabase/migrations/`:
1. `members` table — `preferred_name`, `address_street1/2/city`, `status` (Active/Unknown/Transferred/Moved Out), `new_address`, `assigned_person`
2. Seed data — 10 sample Filipino-name members in Dasmariñas City
3. `app_users` table — links to `auth.users(id)`, stores `full_name`, `role`, `is_active`. RLS enabled; users can read their own profile.

**Important mismatch:** The TypeScript types in `src/types/index.ts` (`Member` interface) reflect the older frontend mock data shape (with `household_id`, `first_name`, `last_name`, etc.), while the actual DB `members` table uses `preferred_name`, address fields, etc. This needs reconciliation when wiring DataContext to Supabase.

Local dev test accounts (password: `Ward@2024!`):
- `admin@ward.org`, `specialist@ward.org`, `clerk@ward.org`, `ministering@ward.org`

### UI Components

Components in `src/components/ui/` are shadcn/ui components — don't edit these directly; regenerate via `npx shadcn-ui add <component>` if updates are needed.

Theme colors are defined as CSS variables in `src/index.css` and referenced in `tailwind.config.ts`. Primary color is `#005EB8`.

## Current Status

- **Frontend:** Complete scaffold — all pages and routing functional with mock data.
- **Auth:** Fully wired to Supabase (login, session persistence, profile fetch).
- **Data operations:** Still using mock data in `DataContext` — `updateMember()`, `updateHousehold()`, `updateUser()`, `addUser()` all need Supabase implementations.
- **RLS:** Only partially implemented (app_users table only); members table needs RLS policies.
- **Households:** The DB schema has no `households` table yet — it's frontend-only via mock data.
