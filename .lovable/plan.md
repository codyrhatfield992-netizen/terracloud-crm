

## TerraCloud Production-Ready Transformation Plan

### Current State
After exploring the codebase, here's what already exists:
- **Design system**: Dark theme with Inter font, blue accent, hairline borders — mostly aligned with the request
- **Landing page**: Professional hero + features at `/`, redirects logged-in users to `/dashboard`
- **Auth**: Login, Signup, ProtectedRoute, AuthContext with sign out — all functional
- **TopBar**: User dropdown with initials, email, Settings, Sign Out (red) — already matches the spec
- **Sidebar**: Minimal with blue active indicator — already matches
- **Pages**: Dashboard, Leads (Kanban + Table), Properties (Grid + Table), Contacts, Tasks, Documents, Meetings, Settings — all built with mock data
- **Kanban**: Drag-and-drop on Leads page already implemented

### Core Problem
Everything runs on **hardcoded mock data** in `src/data/mockData.ts`. New users see pre-filled fake data. The request explicitly says "no false data pre loaded onto their account."

### What Needs to Change

**Phase 1: Database Schema (migrations)**
Create tables with RLS so each user owns their data:
1. `contacts` — name, email, phone, type, tags, user_id
2. `properties` — address, city, state, zip, type, beds, baths, sqft, arv, asking_price, offer_price, status, user_id
3. `leads` — title, stage, priority, source, estimated_value, next_follow_up, tags, contact_id, property_id, user_id
4. `tasks` — title, description, completed, due_date, priority, related_entity_type, related_entity_id, user_id
5. `documents` — name, type, size, entity_type, entity_id, url, user_id
6. `meetings` — title, date, time, duration, location, notes, user_id
7. `activities` — type, description, entity_type, entity_id, user_id (for activity feed)

All tables get RLS policies: users can only CRUD their own rows.

**Phase 2: Replace Mock Data with Database Queries**
Refactor every page to use `@tanstack/react-query` + Supabase client:
- Dashboard: Query leads, tasks, activities for stats
- Leads: CRUD from `leads` table, Kanban drag updates stage via `UPDATE`
- Properties: CRUD from `properties` table
- Contacts: CRUD from `contacts` table
- Tasks: CRUD from `tasks` table with completion toggle
- Documents: CRUD from `documents` table
- Meetings: CRUD from `meetings` table

**Phase 3: Empty States for New Users**
Each page shows a clean empty state with a CTA button when no data exists (e.g., "Add your first lead"). No preloaded data.

**Phase 4: Design Polish Pass**
- Ensure consistent 8px grid, `p-6` cards, `max-w-7xl` containers
- Remove any remaining emoji
- Verify `rounded-lg` (not `rounded-full`) on cards
- Subtle zebra striping on tables
- Loading skeletons while data fetches
- Toast notifications for all CRUD operations
- Form validation with inline error messages

**Phase 5: Landing Page Footer**
Add footer with copyright and links (Privacy Policy, Terms, Contact).

**Phase 6: Settings Page**
Connect profile settings to the `profiles` table (name, avatar updates).

### Technical Details

- **7 database migrations** for new tables + RLS policies
- **~12 files modified** (all page components + remove/reduce mockData dependency)
- **New hooks**: `useLeads`, `useProperties`, `useContacts`, `useTasks`, `useDocuments`, `useMeetings` for React Query integration
- **TypeScript types** will auto-generate from Supabase schema

### Implementation Order
1. Run all migrations (tables + RLS)
2. Create shared data hooks
3. Refactor pages one by one (Dashboard last since it aggregates)
4. Add empty states
5. Design consistency pass
6. Landing page footer + Settings integration

This is a large change touching most of the app. Shall I proceed?

