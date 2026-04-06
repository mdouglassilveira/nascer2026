# Programa Nascer 2026 — Platform Architecture Document

## 1. Overview

The **Programa Nascer** platform is a PWA (Progressive Web App) that manages the entire lifecycle of an annual startup pre-incubation program in Santa Catarina, Brazil. The program runs in yearly editions (2025, 2026, etc.) and involves multiple user roles, innovation centers, enrollment, evaluation, ranking, and a 3-month guided journey for selected entrepreneurs.

**Live URL:** https://nascer2026.vercel.app  
**Repository:** github.com/mdouglassilveira/nascer2026 (root directory: `pwa/`)

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8 (SPA) |
| Styling | TailwindCSS v4 |
| State Management | TanStack React Query (server state) + React Context (auth) |
| Routing | React Router v7 |
| Backend | Supabase (PostgreSQL + Auth + Storage + RLS) |
| Serverless API | Vercel Serverless Functions (`/api/`) |
| PWA | vite-plugin-pwa (Service Worker + Web Manifest) |
| Deploy | Vercel (auto-deploy from GitHub `main` branch) |
| Input Masks | Custom (`lib/masks.js`) — phone, CPF, CNPJ, CEP |

---

## 3. Program Lifecycle & User Journey

The platform supports three sequential phases:

### Phase 1: Enrollment
```
New user registers → Confirms email → Logs in → Fills 4-step enrollment form → Submits
```

### Phase 2: Evaluation & Selection
```
Evaluators score submissions (4 criteria × 0-10)
Coordinators score their center's submissions (0-10)
Algorithm auto-scores maturity (0-100)
→ Final score = algorithm + (CI_score × 20) + (commission_avg × 2.5)
→ Ranking generated per center and global
→ Selected startups get approved
```

### Phase 3: Program Execution (Entrepreneur App)
```
Approved entrepreneurs access the app:
Dashboard → Activities (9 sprints) → Schedule → Contents → Soft Skills → Diagnostics → Team → Attendance → Tools
```

---

## 4. User Roles

| Role | Scope | Can Do |
|------|-------|--------|
| `empreendedor` | Own project only | Fill activities, attend events, manage team, view contents |
| `avaliador` | All submitted enrollments (or per center) | Score enrollments on 4 criteria (0-10 each) |
| `coordenador` | Own innovation center only | View enrollments, give CI score (0-10), track projects |
| `admin` | Everything | Full access to all centers, enrollments, evaluations, rankings |

Role is **per-edition** (stored in `edition_participants.role`), so a user can be an entrepreneur in one edition and an evaluator in the next.

---

## 5. Database Architecture

### 5.1 Entity Relationship Overview

```
editions (yearly program instances)
  ├── centers (15 innovation centers in SC)
  ├── edition_participants (user ↔ edition ↔ project ↔ center ↔ role)
  │     ├── users (permanent identity, auth-linked)
  │     └── projects (startup, linked to edition + center)
  ├── enrollments (4-step application form)
  │     └── evaluations (scores from evaluators)
  ├── events (schedule: workshops + oficinas)
  │     └── attendances (per user per event)
  ├── activities (program sprints)
  │     └── activity_responses (per project per activity)
  ├── contents (learning materials by module)
  ├── soft_skills (self-assessment per user)
  └── diagnostics (project maturity per user)
```

### 5.2 Table Definitions

#### `editions`
Core table — everything is scoped to an edition.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| year | int UNIQUE | 2025, 2026, etc. |
| name | text | "Programa Nascer 2026" |
| active | boolean | Only one edition active at a time |
| enrollment_open | boolean | Controls whether enrollment form is accessible |
| start_date / end_date | date | Program dates |

#### `centers`
15 innovation centers across Santa Catarina state.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| name | text | "ACATE", "CINF", "Pollen", etc. |
| city | text | "Florianópolis", "Rio do Sul", etc. |
| address | text | Physical address |
| active | boolean | |

#### `users`
Permanent identity — persists across editions. Created automatically via auth trigger on signup.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | References auth.users(id) ON DELETE CASCADE |
| email | text | |
| full_name | text | |
| phone | text | |
| bio | text | |
| avatar_url | text | Points to `avatars` storage bucket |
| user_type | text | empreendedor / avaliador / coordenador / admin |
| status | text | ativo / convidado |
| project_id | uuid FK | **DEPRECATED** — use edition_participants instead |
| role | text | **DEPRECATED** — use edition_participants instead |

> **Important:** `users.project_id` and `users.role` are legacy fields from the initial implementation. The source of truth for project/role is `edition_participants`. These fields may still be referenced in some older code paths but should NOT be used for new features.

#### `edition_participants`
**The central junction table** — links users to editions, projects, and centers with a role.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| user_id | uuid FK → users | |
| edition_id | uuid FK → editions | |
| project_id | uuid FK → projects | NULL until approved |
| center_id | uuid FK → centers | |
| role | text | empreendedor / avaliador / coordenador / admin |
| status | text | convidado / ativo / inativo |
| UNIQUE | (user_id, edition_id) | One participation per user per edition |

#### `projects`
Created when an enrollment is approved.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| user_id | uuid FK → users | Original founder |
| name | text | |
| description | text | |
| problem | text | |
| market | text | |
| stage | text | |
| edition_id | uuid FK → editions | |
| center_id | uuid FK → centers | |

#### `enrollments`
4-step application form with auto-save support.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| user_id | uuid FK → users | |
| edition_id | uuid FK → editions | |
| center_id | uuid FK → centers | |
| status | text | rascunho / submetida / aprovada / desistente |
| form_step | int | 0-3 (tracks progress) |
| **Step 1** | | |
| full_name | text | |
| phone | text | |
| gender | text | |
| institution_linked | boolean | Higher education link |
| institution_name | text | Conditional |
| **Step 2** | | 12 maturity diagnostic questions |
| diag_experience | text | Entrepreneurial experience |
| diag_team | text | Has team |
| diag_availability | text | Time available |
| diag_stage | text | Project stage |
| diag_model | text | Business model type |
| diag_formalization | text | Has CNPJ |
| diag_sales | text | Has paying customers |
| diag_market | text | Market research done |
| diag_area_experience | text | Domain experience |
| diag_clients | text | Has client contacts |
| diag_validation | text | Validation status |
| diag_management | text | Management tools |
| **Step 3** | | Project proposal |
| project_title | text (50 chars) | |
| project_description | text (300 chars) | |
| problem_solution | text (1000 chars) | |
| market_innovation | text (1000 chars) | |
| team_profile | text (1000 chars) | |
| business_model | text (1000 chars) | |
| project_link | text | Optional |
| **Step 4** | | Eligibility + documents |
| enrollment_type | text | 'cpf' or 'cnpj' |
| elig_company_age..elig_cnpj_sc | boolean | 5 eligibility questions (CNPJ only) |
| company_time, cnpj | text | CNPJ-specific |
| cpf | text | |
| doc_* | text | URLs to uploaded documents |
| cep, city, state, street, address_number, address_complement | text | Address |
| resident_sc | boolean | |
| accepted_rules | boolean | Edital acceptance |
| **Coordinator evaluation** | | |
| ci_score | int (0-10) | Coordinator's score |
| ci_evaluator_id | uuid FK → users | Who scored |
| ci_comment | text | |
| submitted_at | timestamptz | When submitted |

#### `evaluations`
Multiple evaluators can score each enrollment.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| enrollment_id | uuid FK → enrollments | |
| evaluator_id | uuid FK → users | |
| edition_id | uuid FK → editions | |
| score_problem | int (0-10) | Problem & Solution |
| score_market | int (0-10) | Market & Innovation |
| score_team | int (0-10) | Team & Profile |
| score_resources | int (0-10) | Management & Resources |
| comment | text | |
| UNIQUE | (enrollment_id, evaluator_id) | One eval per evaluator per enrollment |

#### `activities` & `activity_responses`
9 program sprints linked to projects (not users — so the whole team shares responses).
| activities | | |
|-----------|---|---|
| id, title, description | text | Sprint title |
| fields | jsonb | Dynamic form fields: [{name, label, type, required, options}] |
| order_index | int | Display order |
| edition_id | uuid FK | |

| activity_responses | | |
|-------------------|---|---|
| project_id | uuid FK → projects | **Shared across team** |
| activity_id | uuid FK → activities | |
| answers | jsonb | Key-value answers |
| UNIQUE | (project_id, activity_id) | One response per project per activity |

#### `events` & `attendances`
20 events per edition (10 workshops online + 10 oficinas presenciais).
| events | | |
|--------|---|---|
| title, description, date, time, type | | workshop or oficina |
| location, live_url, replay_url | text | |
| materials | jsonb | [{name, url}] |
| edition_id | uuid FK | |

| attendances | | |
|------------|---|---|
| event_id, user_id | uuid FK | |
| status | text | presente / ausente |

#### `contents`
Learning materials organized by module. 41 items across 12 modules.
| Column | Type | Description |
|--------|------|-------------|
| title, description | text | |
| module | text | "Problema", "Validação", "Cliente", "MVP", etc. |
| type | text | video / text / material |
| video_url | text | Vimeo progressive download URLs |
| order_index | int | |

#### `soft_skills` & `diagnostics`
Self-assessment questionnaires per user per edition.

### 5.3 Database Views

#### `vw_enrollment_ranking`
Pre-calculated ranking for all submitted enrollments.
```sql
final_score = calc_algorithm_score(enrollment)     -- 0-100 from step 2 answers
            + COALESCE(ci_score, 0) * 20            -- 0-200 from coordinator
            + avg(commission_scores) * 2.5           -- 0-100 from evaluators
-- Maximum possible: 400 points
```

#### `vw_enrollment_stats`
Aggregated enrollment metrics by center (total, draft, submitted, approved, evaluated).

### 5.4 Security Definer Functions

These functions bypass RLS and are used in policies to avoid recursion:

| Function | Returns | Purpose |
|----------|---------|---------|
| `get_active_edition_id()` | uuid | ID of the edition with `active = true` |
| `get_my_project_id()` | uuid | Current user's project in active edition (via edition_participants) |
| `get_my_center_id()` | uuid | Current user's center in active edition |
| `get_my_edition_role()` | text | Current user's role in active edition |
| `calc_algorithm_score(enrollment)` | int | Auto-score from maturity answers (0-100) |

### 5.5 Row Level Security (RLS) Summary

| Table | Policy Logic |
|-------|-------------|
| users | See self + teammates (via edition_participants join) |
| projects | See own project (via get_my_project_id()) |
| edition_participants | See own + same project |
| enrollments | Own enrollment + staff can see all (or center-filtered) |
| evaluations | Own evaluations + staff can see all |
| activities, events, contents, centers, editions | All authenticated users |
| activity_responses | Same project (via get_my_project_id()) |
| attendances | Own + teammates |

### 5.6 Auth Trigger

```sql
-- Auto-creates users profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- handle_new_user() inserts into public.users (id, email, full_name)
```

---

## 6. Frontend Architecture

### 6.1 Routing & Navigation

```
AppRouter.jsx (smart routing based on role + project)
  │
  ├── role IN (admin, avaliador, coordenador)
  │     → Redirect to /admin
  │
  ├── role = empreendedor AND has project_id
  │     → Show Layout.jsx (bottom nav + sidebar)
  │         └── Dashboard, Activities, Schedule, Contents, Profile...
  │
  ├── role = empreendedor AND no project_id
  │     → Redirect to /inscricao
  │
  └── No edition_participant at all
        → Redirect to /inscricao (enrollment form or "closed" message)
```

### 6.2 File Structure

```
src/
├── App.jsx                    # Route definitions
├── main.jsx                   # React entry point
├── index.css                  # Tailwind imports + custom .input-field class
├── lib/
│   ├── supabase.js            # Supabase client (reads VITE_SUPABASE_URL/KEY)
│   └── masks.js               # Phone/CPF/CNPJ/CEP formatters
├── hooks/
│   ├── useAuth.jsx            # Auth context provider + signIn/signOut/resetPassword
│   ├── useProject.js          # Current user's project in active edition
│   ├── useEnrollment.js       # Enrollment form state, save, submit, uploadDoc
│   └── useAdminContext.js     # Admin role/center detection
├── components/
│   ├── AppRouter.jsx          # Smart role-based redirect
│   ├── ProtectedRoute.jsx     # Auth guard (redirect to /login if not authenticated)
│   ├── Layout.jsx             # Main app shell (header + bottom nav + sidebar)
│   ├── Loading.jsx            # Spinner
│   └── UpdatePrompt.jsx       # PWA update notification
├── pages/
│   ├── Login.jsx              # Email + password login
│   ├── Register.jsx           # Create account + email confirmation flow
│   ├── ResetPassword.jsx      # Set new password from email link
│   ├── Dashboard.jsx          # Hero + progress + quick actions + module grid
│   ├── enrollment/            # 4-step enrollment form
│   │   ├── Index.jsx          # Step wrapper with progress indicator
│   │   ├── Step1Personal.jsx  # Name, phone, gender, center, institution
│   │   ├── Step2Profile.jsx   # 12 maturity diagnostic questions
│   │   ├── Step3Proposal.jsx  # Project title, description, problem, market
│   │   └── Step4Eligibility.jsx # CPF/CNPJ, documents, address, terms
│   ├── admin/                 # Admin/evaluator/coordinator panel
│   │   ├── Layout.jsx         # Tab navigation (Dashboard, Inscrições, Avaliar, Ranking)
│   │   ├── Dashboard.jsx      # Stats cards + center breakdown table
│   │   ├── Enrollments.jsx    # Searchable list with status/center filters
│   │   ├── EnrollmentDetail.jsx # Full enrollment view + evaluations
│   │   ├── Evaluate.jsx       # Score slider (0-10) × 4 criteria
│   │   └── Ranking.jsx        # Sorted table with score breakdown
│   ├── profile/Index.jsx      # Edit name, phone, bio, avatar upload
│   ├── project/Index.jsx      # Read-only project details
│   ├── activities/            # Sprint activities
│   │   ├── Index.jsx          # List with completion progress
│   │   └── Detail.jsx         # Dynamic form (textarea/select/input) per activity
│   ├── team/Index.jsx         # Team members + invite via email
│   ├── attendance/Index.jsx   # Event attendance (team-aggregated)
│   ├── schedule/              # Event calendar
│   │   ├── Index.jsx          # Upcoming/past events
│   │   └── Detail.jsx         # Event details + mark attendance
│   ├── contents/              # Learning materials
│   │   ├── Index.jsx          # Grouped by module
│   │   └── Detail.jsx         # Video player or text
│   ├── softskills/Index.jsx   # 6-question self-assessment + radar chart
│   ├── diagnostic/Index.jsx   # 8-question project maturity + results
│   └── tools/Index.jsx        # AI assistant + materials list
api/
└── invite-member.js           # Vercel serverless function for team invites
```

### 6.3 Design System

- **Mobile-first** with responsive desktop (lg: breakpoints)
- **Color palette:** Purple primary (#6C3CE1), green secondary (#06D6A0), warm accents
- **Components:** Rounded cards (rounded-2xl/3xl), gradient headers, shadow-sm
- **Inputs:** Custom `.input-field` class with bg-bg, rounded-2xl, focus ring
- **Selects:** Custom chevron SVG, appearance:none
- **Touch feedback:** `active:scale-[0.98]` on buttons
- **Bottom navigation** on mobile (5 items) + sidebar on desktop
- **PWA:** Installable, service worker with update prompt

---

## 7. Serverless API

### POST `/api/invite-member`

Vercel Serverless Function that creates team members. Uses `SUPABASE_SERVICE_ROLE_KEY` (server-side only, never exposed to client).

**Flow:**
1. Verify caller JWT → get their edition_participant
2. Check team size limit (max 5 per project)
3. If email exists: create/update edition_participant with project_id
4. If new email: create auth user → set profile → create edition_participant → send password reset email
5. Return success message

---

## 8. Storage

| Bucket | Visibility | Max Size | Types | Purpose |
|--------|-----------|----------|-------|---------|
| `avatars` | Public | 2MB | jpeg, png, webp | Profile photos |
| `documents` | Private | 10MB | pdf, jpeg, png | Enrollment documents (ID, contracts, DRE) |

Files are organized by user_id: `{bucket}/{user_id}/{filename}`

RLS policies ensure users can only upload/view/delete their own files.

---

## 9. User Stories & Use Cases

### UC-01: New Entrepreneur Registers and Enrolls
1. User visits `/registro`, creates account (name, email, password)
2. Receives confirmation email, clicks link
3. Redirected to `/inscricao` (enrollment form)
4. Fills 4 steps: personal data → maturity profile → project proposal → documents
5. Progress auto-saved at each step (can close and resume later)
6. Clicks "Finalizar inscrição" → status changes to `submetida`
7. Sees confirmation screen: "Inscrição enviada!"
8. Next login: still sees "Inscrição enviada" (no project yet)

### UC-02: Evaluator Scores Enrollments
1. User with `role = avaliador` logs in → redirected to `/admin`
2. Goes to "Avaliar" tab → sees pending enrollments
3. Clicks an enrollment → sees project title + link to full details
4. Gives scores: Problem (0-10), Market (0-10), Team (0-10), Resources (0-10) + optional comment
5. Submits → enrollment moves to "evaluated" list
6. Cannot re-evaluate the same enrollment (UNIQUE constraint)

### UC-03: Coordinator Reviews Their Center
1. User with `role = coordenador` + `center_id = CINF` logs in → `/admin`
2. Dashboard shows stats **only for Rio do Sul** (their center)
3. "Inscrições" tab shows only enrollments from their center
4. Can view full enrollment details
5. Can give CI score (0-10) on each enrollment
6. "Ranking" shows only their center's ranking

### UC-04: Admin Approves Enrollments (NOT YET IMPLEMENTED)
1. Admin views ranking (sorted by final_score)
2. Selects enrollments to approve
3. System creates `project` + `edition_participant` with project_id
4. Enrollment status changes to `aprovada`
5. Next time the entrepreneur logs in → Dashboard instead of enrollment form

### UC-05: Entrepreneur Uses the Program App
1. Approved entrepreneur logs in → AppRouter detects project_id → Dashboard
2. Dashboard shows: project name, progress %, attendance count, team count
3. **Activities:** 9 sprints (Problem, Market, Client, MVP, Link, Business Model, Sales Funnel, Pitch v1, Pitch Final). Each has dynamic form fields. Responses are per-project (shared with team).
4. **Schedule:** 20 events (10 online workshops + 10 in-person oficinas). Can mark attendance, view live streams, download materials.
5. **Contents:** 41 learning videos across 12 modules + 8 PDF materials.
6. **Team:** View members, invite new ones (max 5). Invitation creates user + sends email.
7. **Soft Skills:** 6-question self-assessment, results shown as radar chart.
8. **Diagnostic:** 8 yes/partial/no questions about project maturity.
9. **Profile:** Edit name, phone, bio, upload avatar photo.

### UC-06: Team Member Receives Invitation
1. Entrepreneur invites a new member (name + email) via Team page
2. `/api/invite-member` creates auth user + edition_participant + sends password reset email
3. Member clicks email link → redirected to `/reset-password` → sets password
4. Logs in → AppRouter detects project_id → Dashboard (same project as inviter)
5. Sees same activities, attendance, contents as the founder

### UC-07: Returning User from Previous Edition
1. User enrolled in 2025 but wasn't selected
2. In 2026, user logs in → no `edition_participant` for 2026 → redirected to `/inscricao`
3. Fills new enrollment (new edition, possibly new center, new proposal)
4. Old user record (`users` table) is reused — email, name persist
5. If approved in 2026 → new `edition_participant` and `project` for edition 2026

### UC-08: User Enrolled but Joins Another Team
1. User enrolled in 2026 but wasn't approved
2. An approved entrepreneur invites them to their project
3. Invite creates `edition_participant` with project_id → user now has access
4. Next login: AppRouter detects project_id → Dashboard

---

## 10. Scoring Formula (Ranking)

```
final_score = algorithm_score + (ci_score × 20) + (commission_score × 2.5)

Where:
  algorithm_score (0-100): Auto-calculated from Step 2 maturity answers
    - Each positive answer = 5 or 10 points
    - e.g., "Has MVP" = 10pts, "Has team" = 5pts, "Has paying customers" = 10pts

  ci_score (0-10): Given by the Innovation Center coordinator
    - Weighted × 20 → contributes 0-200 points

  commission_score (0-40): Average of evaluator scores
    - 4 criteria × 10 each = 40 max per evaluator
    - If multiple evaluators, their totals are averaged
    - Weighted × 2.5 → contributes 0-100 points

  Maximum possible: 100 + 200 + 100 = 400 points
```

---

## 11. Environment Variables

### Vercel (Production)
| Variable | Exposed to Client | Purpose |
|----------|------------------|---------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | **No** (server only) | Used in `/api/invite-member` |

### Supabase Dashboard Configuration
- **Auth > URL Configuration > Site URL:** `https://nascer2026.vercel.app`
- **Auth > URL Configuration > Redirect URLs:** `https://nascer2026.vercel.app/**`
- **Auth > Providers > Email:** Confirm email enabled
- **Auth > Email Templates > Confirm Signup:** Uses `{{ .ConfirmationURL }}`
- **Auth > Email Templates > Reset Password:** Uses `{{ .ConfirmationURL }}`

---

## 12. Known Technical Debt & Issues

1. **`users.project_id` and `users.role` are deprecated** — should be removed after confirming no code uses them. The source of truth is `edition_participants`.

2. **Team page query** uses a join `edition_participants → users` that depends on RLS. If a user's profile is not visible via RLS, they appear as `null` in the join. The component filters these out, but the root cause (RLS mismatch) should be investigated.

3. **PWA cache** can serve stale code after deploys. The `UpdatePrompt` component shows an update notification, but users on installed PWAs sometimes miss it. Consider adding `skipWaiting()` for critical updates.

4. **Build memory** — local Vite builds can fail with OOM on machines with <4GB RAM. Vercel builds are unaffected (8GB).

5. **Enrollment approval** is manual (direct database manipulation). Needs a UI button in the admin panel.

6. **CI coordinator evaluation** (ci_score field) has no UI for the coordinator to fill in yet.

7. **No soft-delete** — deleting auth users cascades to `users` table, which orphans `edition_participants`. The invite flow handles this by filtering nulls, but proper soft-delete would be cleaner.

---

## 13. What's Not Yet Implemented

| Feature | Priority | Description |
|---------|----------|-------------|
| Admin approval button | High | Creates project + edition_participant from enrollment |
| Coordinator CI score form | High | UI for coordinators to give 0-10 score per enrollment |
| Analytics dashboard | Medium | Charts, conversion funnel, engagement metrics |
| Playbook generation | Medium | Auto-generated PDF from activity responses |
| NPS survey | Low | Post-program satisfaction survey |
| Workshop evidence upload | Low | Coordinators upload photos from in-person oficinas |
| Email notifications | Low | Notify on enrollment status change, new evaluation |
| Bulk user import | Low | Admin imports users from CSV for a new edition |
| Edition management UI | Low | Admin creates/configures new editions from the app |

---

## 14. Deployment & Infrastructure

### Vercel
- Auto-deploys on push to `main` branch
- Root directory: `pwa/`
- Build command: `npm run build`
- Output: `dist/`
- Install command uses `--legacy-peer-deps` (via `.npmrc`)
- `vercel.json` has SPA rewrite: all non-`/api/` routes → `index.html`

### Supabase
- **Project ref:** `ghukwnsmuimbejpevahk`
- **Region:** South America East (sa-east-1)
- **Plan:** Free tier
- **Pooler:** `aws-1-sa-east-1.pooler.supabase.com:5432` (session mode)

### Reference Database (Nascer 2025)
- **Project ref:** `pwaqixlskgnincscltmn`
- Contains historical data: enrollments, evaluations, centers, calendar, contents
- Used as reference for data migration and formula validation
