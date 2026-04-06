# Product Requirements Document (PRD)
# Plataforma Programa Nascer 2026

**Version:** 1.0  
**Date:** April 6, 2026  
**Author:** Maicon Silveira / 49 Educação  
**Status:** In Development  

---

## 1. Executive Summary

The Programa Nascer Platform is a Progressive Web App (PWA) that manages the full lifecycle of an annual startup pre-incubation program in Santa Catarina, Brazil. It serves entrepreneurs, evaluators, innovation center coordinators, and program administrators through a unified digital experience.

The platform handles enrollment, evaluation, ranking, selection, and the entire 3-month program execution including activities, events, content delivery, team management, and progress tracking.

**Live URL:** https://nascer2026.vercel.app  
**Target Launch:** July 2026 (program start)

---

## 2. Problem Statement

The Programa Nascer program currently relies on fragmented tools — spreadsheets for enrollment tracking, manual email for communication, separate platforms for content delivery, and ad-hoc evaluation processes. This creates:

- **For entrepreneurs:** Confusion about where to find information, inability to track progress, no centralized project workspace
- **For evaluators:** No standardized scoring interface, difficulty accessing enrollment data consistently
- **For coordinators:** No real-time visibility into their center's enrollment funnel or program execution
- **For administrators:** No unified dashboard, manual ranking calculations, difficulty scaling across 15 centers

---

## 3. Vision & Goals

### Vision
A single platform where every stakeholder in the Programa Nascer ecosystem can perform all their tasks — from initial enrollment through program completion — on any device.

### Goals
1. **Digitize enrollment** — 4-step form with auto-save, document upload, and real-time status tracking
2. **Standardize evaluation** — Consistent scoring criteria, automated ranking calculation, transparent results
3. **Enable program execution** — Activities, events, content, team management in one app
4. **Scale across centers** — 15 innovation centers with independent data but unified management
5. **Support editions** — Multi-year support where data persists but each edition is independent

### Success Metrics
| Metric | Target |
|--------|--------|
| Enrollment completion rate | >80% of started enrollments |
| Time to evaluate all submissions | <2 weeks after enrollment close |
| Activity completion rate | >70% of approved projects |
| Event attendance rate | >60% across all events |
| Platform adoption | 100% of participants using the app |

---

## 4. Personas

### 4.1 Maria — The Aspiring Entrepreneur
- **Age:** 28 | **Location:** Joinville, SC
- **Background:** Has a tech idea for logistics but no formal business background
- **Goals:** Get accepted into the program, learn how to build a startup, connect with mentors
- **Frustrations:** Doesn't know where to start, overwhelmed by forms, wants mobile-friendly experience
- **Uses:** iPhone, primarily mobile, limited desktop access
- **Key journeys:** Register → Enroll → Wait for results → Use program app daily

### 4.2 Carlos — The Serial Entrepreneur
- **Age:** 42 | **Location:** Florianópolis, SC
- **Background:** Has CNPJ, previous startup experience, returning from 2025 edition
- **Goals:** Get his new project into the program, leverage existing network
- **Frustrations:** Had to re-enter all personal data from last year, wants the process to be faster
- **Uses:** Desktop and mobile interchangeably
- **Key journeys:** Login (existing account) → Enroll with new project → Manage team

### 4.3 Ana — The Innovation Center Coordinator
- **Age:** 35 | **Location:** Rio do Sul, SC | **Center:** CINF
- **Background:** Manages the local innovation center, tracks 30-50 projects per edition
- **Goals:** Monitor enrollment progress, ensure her center's projects succeed, report to administrators
- **Frustrations:** Can't see real-time enrollment data, has to ask admin for updates, no visibility into evaluation status
- **Uses:** Desktop primarily, occasional mobile check
- **Key journeys:** Login → View center dashboard → Review enrollments → Give CI scores → Track program execution

### 4.4 Pedro — The External Evaluator
- **Age:** 50 | **Location:** São Paulo, SP
- **Background:** Investor/mentor, evaluates startups as external expert
- **Goals:** Quickly score submissions with clear criteria, provide useful feedback
- **Frustrations:** Too many submissions to review, needs efficient interface, doesn't want to spend more than 5 min per submission
- **Uses:** Desktop, batch evaluation sessions
- **Key journeys:** Login → View pending evaluations → Score 4 criteria → Comment → Next

### 4.5 Maicon — The Program Administrator
- **Age:** 32 | **Location:** Florianópolis, SC | **Org:** 49 Educação
- **Background:** Runs the entire program across all 15 centers
- **Goals:** Full visibility into enrollment funnel, evaluation progress, program execution across all centers
- **Frustrations:** Currently uses multiple spreadsheets, can't generate reports easily, manual approval process
- **Uses:** Desktop primary, mobile for quick checks
- **Key journeys:** Login → View global dashboard → Filter by center → Review rankings → Approve projects → Monitor execution

---

## 5. User Roles & Permissions

| Permission | Entrepreneur | Evaluator | Coordinator | Admin |
|------------|:-----------:|:---------:|:-----------:|:-----:|
| Create account / enroll | ✅ | — | — | — |
| View own enrollment status | ✅ | — | — | ✅ |
| Fill activities | ✅ | — | — | — |
| View schedule & contents | ✅ | — | — | — |
| Manage team (invite members) | ✅ | — | — | — |
| Mark attendance | ✅ | — | — | — |
| Complete soft skills assessment | ✅ | — | — | — |
| Complete diagnostic | ✅ | — | — | — |
| Score enrollments (4 criteria) | — | ✅ | — | ✅ |
| Give CI score (0-10) | — | — | ✅ | ✅ |
| View enrollments (own center) | — | — | ✅ | ✅ |
| View enrollments (all centers) | — | ✅* | — | ✅ |
| View ranking (own center) | — | — | ✅ | ✅ |
| View ranking (all centers) | — | — | — | ✅ |
| Approve enrollments | — | — | — | ✅ |
| Manage editions | — | — | — | ✅ |
| View analytics/reports | — | — | ✅* | ✅ |

*Evaluators see all submitted enrollments for scoring; coordinators see limited analytics for their center.

---

## 6. Feature Specifications

### 6.1 Authentication & Registration

#### FR-01: User Registration
- New users create an account with name, email, and password
- Email confirmation required (Supabase Auth sends confirmation link)
- After confirmation, user is redirected to enrollment form
- If user already exists from previous edition, account is reused

#### FR-02: Login
- Email + password authentication
- "Forgot password" flow with email link
- Session persistence across page reloads
- Auto-redirect based on role (entrepreneur → app, staff → admin panel)

#### FR-03: Password Reset
- User or invited member receives email with recovery link
- Link redirects to `/reset-password` page
- User sets new password and is automatically logged in

### 6.2 Enrollment (4-Step Form)

#### FR-04: Step 1 — Personal Data
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Full name | Text input | Yes | Pre-filled from registration |
| Phone | Masked input (00) 00000-0000 | Yes | |
| Gender | Select | Yes | Masculino, Feminino, Outro, Prefiro não informar |
| Innovation Center | Select (dynamic) | Yes | 15 centers from database |
| Higher education link | Select (Sim/Não) | Yes | |
| Institution name | Text input | Conditional | Only if linked = Sim |

#### FR-05: Step 2 — Entrepreneur Profile (Maturity)
12 multiple-choice questions assessing entrepreneurial maturity. Each has 2-6 options representing levels of preparedness. Responses are used in the algorithm score (0-100 points).

Questions cover: experience, team, availability, project stage, business model, formalization (CNPJ), sales, market research, domain experience, client contacts, validation, project management.

#### FR-06: Step 3 — Project Proposal
| Field | Type | Char Limit | Required |
|-------|------|-----------|----------|
| Project title | Text input | 50 | Yes |
| Description | Textarea | 300 | Yes |
| Problem & solution | Textarea | 1000 | Yes |
| Market & innovation | Textarea | 1000 | Yes |
| Team profile | Textarea | 1000 | Yes |
| Monetization & management | Textarea | 1000 | Yes |
| Links | Text input | 500 | No |

Real-time character counter displayed for each field.

#### FR-07: Step 4 — Eligibility, Documents & Address
**Enrollment type:** CPF or CNPJ (conditional fields)

**CNPJ eligibility (5 yes/no questions):**
- Company age < 12 months
- Revenue ≤ R$ 81,000
- Idea compatible with social object
- Partner in social contract
- CNPJ registered in SC

If any = "No" → warning to enroll as CPF instead.

**CNPJ-specific fields:** company time, CNPJ number, uploads (social contract, CNPJ card, DRE)

**Personal fields:** CPF (masked), identity document upload, SC residency

**Address:** CEP with auto-fill via ViaCEP API, city, state, street, number, complement, residence proof upload

**Terms:** Checkbox accepting program edital

#### FR-08: Auto-Save & Draft
- Form progress is saved to database on every step transition
- User can close browser and resume from last completed step
- `form_step` field tracks progress (0-3)
- Status remains `rascunho` until final submission

#### FR-09: Enrollment Submission
- On "Finalizar inscrição" → status changes to `submetida`
- `submitted_at` timestamp recorded
- User sees confirmation screen
- Enrollment becomes visible to evaluators and coordinators

### 6.3 Evaluation & Ranking

#### FR-10: Evaluator Scoring
- Evaluators see all submitted enrollments (or filtered by center for coordinators)
- 4 scoring criteria, each 0-10:
  - Problem & Solution
  - Market & Innovation
  - Team & Profile
  - Management & Resources
- Optional comment field
- One evaluation per evaluator per enrollment (UNIQUE constraint)
- Visual score slider with number display

#### FR-11: Coordinator CI Score
- Coordinators give a single 0-10 score to enrollments in their center
- Optional comment
- Stored directly on the enrollment record (`ci_score`)

#### FR-12: Automated Ranking
**Formula:**
```
final_score = algorithm_score + (ci_score × 20) + (commission_avg × 2.5)

Maximum: 100 + 200 + 100 = 400 points
```

**Algorithm score (0-100):** Auto-calculated from Step 2 maturity answers. Positive answers earn 5 or 10 points each.

**CI score (0-10, weighted ×20):** Given by center coordinator. Contributes up to 200 points.

**Commission score (0-40, weighted ×2.5):** Average of all evaluator scores (4 criteria × 10 each). Contributes up to 100 points.

Ranking is generated as a database view (`vw_enrollment_ranking`), sortable by center.

#### FR-13: Enrollment Approval (NOT YET IMPLEMENTED)
- Admin selects enrollments from ranking to approve
- System automatically creates:
  - `project` record (name, description from enrollment)
  - `edition_participant` linking user to project
  - Updates enrollment status to `aprovada`
- Approved users see the entrepreneur app on next login

### 6.4 Entrepreneur App (Program Execution)

#### FR-14: Dashboard
- Welcome message with user's first name
- Project name and overall progress percentage
- Quick action buttons: Activities, Schedule, Contents, Tools
- Stats: activity completion %, attendance count, team size
- Module navigation grid

#### FR-15: Activities (9 Sprints)
Ordered sprint activities that guide the entrepreneurial journey:
1. Problem Identification
2. Market Analysis
3. Client Definition
4. Solution & MVP
5. MVP Link/Prototype
6. Business Model
7. Sales Funnel
8. Super Pitch v1
9. Super Pitch Final

Each activity has dynamic form fields (text, textarea, select). Responses are **per-project** (shared across all team members). Progress tracked as percentage of completed sprints.

#### FR-16: Schedule (20 Events)
- 10 online workshops (Tuesdays, 18:30)
- 10 in-person oficinas (Thursdays, 18:30)
- Each event has: title, date, time, type, description
- Workshops: live URL, replay URL, slide materials
- Oficinas: physical location
- "Mark attendance" button per event

#### FR-17: Attendance
- Shows all events with attendance status (present/absent/pending)
- **Team-aggregated:** if ANY team member marked attendance, project shows as present
- Progress bar showing X/total present

#### FR-18: Contents (41 Items, 12 Modules)
Modules: Problema, Validação, Cliente, MVP, Oferta, Marketing, Vendas, Fomento, Pitch, Startups, Lives Bônus, Materiais de Apoio

Each content has: title, description, instructor, duration, video URL (Vimeo) or PDF link.

#### FR-19: Soft Skills Assessment (20 Statements)
- 20 behavioral statements presented one at a time
- Response scale: C++ (Concordo plenamente, 4pts), C+ (Concordo, 3pts), D- (Discordo, 2pts), D-- (Discordo plenamente, 1pts)
- 12 negative statements use reverse scoring (5 - score)
- 6 radar dimensions: Comunicação, Liderança, Resiliência, Criatividade, Trabalho em equipe, Gestão de tempo
- Each statement maps to exactly one dimension
- Scores normalized to 0-100 per dimension
- Result: radar chart + progress bars per dimension + average score

#### FR-20: Diagnostic (10 Questions)
- 10 questions about project maturity, one per screen
- Categories: Problema, Avaliação, Cliente, Mercado, Produto, Marketing, Vendas, Fomento, Empreendedor, Pitch
- 5 progressive options per question (1-5 points)
- Result: total X/50 + percentage + bar chart per category + detailed answer view

#### FR-21: Team Management
- View all team members (from `edition_participants` with same project)
- Invite new members by name + email (max 5 per project)
- Invitation flow:
  1. Creates auth user with temporary password
  2. Creates `edition_participant` with project linkage
  3. Sends password reset email
  4. Member sets password and has immediate access
- Member status badges: Ativo (green) / Convidado (yellow)
- Founder identified with crown icon

#### FR-22: Profile
- View/edit: name, phone, bio
- Upload avatar photo (2MB, jpeg/png/webp)
- Email displayed (read-only)

#### FR-23: Project Details
- Read-only view of project information
- Fields: name, description, problem, market, stage

#### FR-24: Tools — AI Assistant
- Text input for questions about entrepreneurship
- Calls Supabase Edge Function for AI response
- Question logged to `questions_ai` table
- Materials list from contents with type = 'material'

### 6.5 Admin Panel

#### FR-25: Admin Dashboard
- Global stats cards: total enrollments, drafts, submitted, evaluated, approved
- Per-center breakdown table (admin only)
- Coordinator sees only their center's stats

#### FR-26: Enrollment Management
- Searchable list (name, project, phone)
- Filter by status (rascunho, submetida, aprovada, desistente)
- Filter by center (admin only)
- Click to view full enrollment details (all 4 steps + evaluations)

#### FR-27: Ranking View
- Sortable table with columns: rank, name, project, center, algorithm score, CI score, commission score, evaluator count, final score
- Top 3 highlighted with trophy/medal icons
- Filter by center (admin only)

### 6.6 Cross-Cutting Features

#### FR-28: Light/Dark Mode
- Automatic detection of system preference
- Manual toggle (persisted in localStorage)
- Toggle available in mobile header, desktop sidebar, and admin panel
- Smooth color transition (0.3s)

#### FR-29: PWA Support
- Installable on mobile and desktop
- Service worker with offline caching
- Update prompt when new version is available
- Web manifest with icons (192px, 512px)

#### FR-30: Edition Support
- All data scoped to editions (yearly program instances)
- Edition has: year, name, active flag, enrollment_open flag, dates
- Only one edition active at a time
- Users persist across editions; participation is per-edition
- Security functions automatically scope queries to active edition

#### FR-31: Input Masking
- Phone: (00) 00000-0000
- CPF: 000.000.000-00
- CNPJ: 00.000.000/0000-00
- CEP: 00000-000

#### FR-32: Responsive Design
- Mobile-first approach
- Bottom navigation on mobile (5 tabs)
- Sidebar navigation on desktop (lg: breakpoint)
- Forms max-width constrained on desktop (max-w-md / max-w-lg)

---

## 7. User Stories

### Enrollment Phase

| ID | As a... | I want to... | So that... | Status |
|----|---------|-------------|-----------|--------|
| US-01 | New user | Create an account with email confirmation | My identity is verified | ✅ Done |
| US-02 | Entrepreneur | Fill a 4-step enrollment form | I can apply to the program | ✅ Done |
| US-03 | Entrepreneur | Save my progress and resume later | I don't lose my work | ✅ Done |
| US-04 | Entrepreneur | Upload required documents | My eligibility can be verified | ✅ Done |
| US-05 | Entrepreneur | See my enrollment status | I know where I stand | ✅ Done |
| US-06 | Returning user | Login with my existing account and enroll in a new edition | I don't need to re-register | ✅ Done |
| US-07 | Coordinator | View all enrollments from my center | I can track my center's progress | ✅ Done |
| US-08 | Admin | View all enrollments across all centers with filters | I have full program visibility | ✅ Done |
| US-09 | Admin | See how many enrollments are in each status per center | I can identify bottlenecks | ✅ Done |

### Evaluation Phase

| ID | As a... | I want to... | So that... | Status |
|----|---------|-------------|-----------|--------|
| US-10 | Evaluator | Score enrollments on 4 criteria (0-10) | Submissions are objectively ranked | ✅ Done |
| US-11 | Evaluator | See which enrollments I've already evaluated | I don't waste time on duplicates | ✅ Done |
| US-12 | Coordinator | Give a CI score (0-10) to my center's enrollments | My center's assessment is included in ranking | 🔲 Pending |
| US-13 | Admin | View the ranking sorted by final score | I can select the best projects | ✅ Done |
| US-14 | Admin | Approve enrollments from the ranking | Approved users get access to the program app | 🔲 Pending |

### Program Execution Phase

| ID | As a... | I want to... | So that... | Status |
|----|---------|-------------|-----------|--------|
| US-15 | Entrepreneur | See my project dashboard with progress | I know how far along I am | ✅ Done |
| US-16 | Entrepreneur | Complete sprint activities | I follow the program methodology | ✅ Done |
| US-17 | Entrepreneur | View the event schedule and mark attendance | I stay on track with the program | ✅ Done |
| US-18 | Entrepreneur | Watch learning content videos | I learn the program material | ✅ Done |
| US-19 | Entrepreneur | Invite team members | My team can collaborate on activities | ✅ Done |
| US-20 | Entrepreneur | Complete the soft skills assessment | I understand my behavioral profile | ✅ Done |
| US-21 | Entrepreneur | Complete the diagnostic | I understand my project's maturity | ✅ Done |
| US-22 | Entrepreneur | Edit my profile and upload a photo | My identity is visible to the team | ✅ Done |
| US-23 | Team member | Login after invitation and see the same project | I can collaborate with my team | ✅ Done |
| US-24 | Entrepreneur | See if any team member attended an event | Our project gets attendance credit | ✅ Done |

### Admin & Management

| ID | As a... | I want to... | So that... | Status |
|----|---------|-------------|-----------|--------|
| US-25 | Admin | Toggle between light and dark mode | I can use the app comfortably | ✅ Done |
| US-26 | Admin | See enrollment stats by center | I can compare center performance | ✅ Done |
| US-27 | Admin | Search enrollments by name, project, or phone | I can find specific submissions | ✅ Done |
| US-28 | Coordinator | Only see data from my center | I focus on what's relevant to me | ✅ Done |
| US-29 | Admin | Open/close enrollments for an edition | I control when people can apply | ✅ Done |
| US-30 | Admin | Generate analytics and reports | I can present program results | 🔲 Pending |
| US-31 | Admin | Manage editions (create, activate, configure) | I can set up each year's program | 🔲 Pending |

---

## 8. Non-Functional Requirements

### Performance
- First Contentful Paint < 2s on 3G
- API queries < 500ms (Supabase region: sa-east-1)
- Offline-capable for read operations (PWA cache)

### Security
- Row Level Security (RLS) on all tables
- JWT-based authentication (Supabase Auth)
- Service role key never exposed to client
- Document uploads accessible only by owner (private bucket)
- CORS headers on serverless functions

### Accessibility
- Mobile-first responsive design
- Touch targets ≥ 44px
- Input masking for Brazilian document formats
- Form auto-save to prevent data loss

### Scalability
- Edition-based data isolation
- 15 centers × ~100 enrollments each = ~1,500 enrollments per edition
- ~300 approved projects × 5 members each = ~1,500 app users
- Supabase free tier sufficient for current scale

---

## 9. Technical Architecture

### Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8 (SPA/PWA) |
| Styling | TailwindCSS v4 with CSS variable theming |
| State | TanStack React Query + React Context |
| Routing | React Router v7 |
| Backend | Supabase (PostgreSQL, Auth, Storage, RLS) |
| Serverless API | Vercel Functions |
| Deploy | Vercel (auto-deploy from GitHub) |

### Key Architectural Decisions
1. **Edition-scoped data** via `edition_participants` junction table + SQL helper functions
2. **Role-based routing** in AppRouter — single codebase serves all personas
3. **Project-level collaboration** — activity responses shared across team, not per-user
4. **Team attendance aggregation** — any member's presence counts for the project
5. **CSS variable theming** — light/dark mode without component duplication

### Database Helper Functions (SECURITY DEFINER)
- `get_active_edition_id()` — returns current active edition
- `get_my_project_id()` — user's project in active edition
- `get_my_center_id()` — user's center in active edition
- `get_my_edition_role()` — user's role in active edition
- `calc_algorithm_score(enrollment)` — maturity score from step 2

---

## 10. Current Status & Roadmap

### Implemented (v1.0) ✅
- User registration with email confirmation
- 4-step enrollment form with auto-save and document upload
- Evaluator scoring interface (4 criteria × 0-10)
- Automated ranking with formula
- Admin dashboard with per-center stats
- Entrepreneur app: dashboard, activities, schedule, contents, team, attendance, profile
- Soft skills assessment (20 statements, 6-axis radar)
- Diagnostic (10 questions, category-based results)
- Team invitation via email with auto user creation
- PWA with service worker and update prompt
- Light/dark mode
- Input masking (phone, CPF, CNPJ, CEP)
- Edition-based data architecture (multi-year support)

### Next Up (v1.1) 🔲
| Feature | Priority | Effort |
|---------|----------|--------|
| Admin approval button (enrollment → project) | High | Medium |
| Coordinator CI score form | High | Small |
| Enrollment email notifications (status changes) | Medium | Medium |
| Analytics dashboard (charts, funnels) | Medium | Large |

### Future (v2.0) 💡
| Feature | Priority | Effort |
|---------|----------|--------|
| Playbook generation (PDF from activity data) | Medium | Large |
| Edition management UI (create/configure editions) | Medium | Medium |
| Bulk user import (CSV) | Low | Small |
| NPS survey | Low | Small |
| Workshop evidence upload (coordinator photos) | Low | Small |
| Push notifications (PWA) | Low | Medium |
| Offline support for form filling | Low | Large |

---

## 11. Appendix

### A. Innovation Centers (15)
Blumenau (CIB), Brusque, Caçador (Inova Contestado), Chapecó (Pollen), Criciúma (CRIO), Florianópolis (ACATE), Itajaí (Elume), Jaraguá do Sul (Novale), Joaçaba (Inovale), Joinville (Ágora Tech Park), Lages (Orion), Rio do Sul (CINF), São Bento do Sul (Planalto Norte), Tubarão (Sigma), Videira

### B. Program Timeline (Edition 2026)
- **Enrollment open:** TBD (controlled via `editions.enrollment_open`)
- **Evaluation period:** After enrollment closes
- **Program start:** July 21, 2026 (Abertura)
- **Program end:** October 6, 2026 (Workshop #10 — Banca Final)
- **Duration:** ~11 weeks, 20 events (10 workshops + 10 oficinas)

### C. Content Library
- 33 video lessons across 11 modules
- 8 PDF materials (guides, glossary, tools list, bootcamp)
- 6 live bonus sessions (law, finance, fundraising, governance)

### D. Reference System
- Previous edition database (Nascer 2025) available for data migration and formula validation
- Figma designs available in `/references/` directory
