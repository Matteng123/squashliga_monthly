# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Quick Start

```bash
npm install              # Install dependencies
npm run dev             # Start dev server (port 3000)
npm run build           # Build for production
npm run lint            # Run ESLint
```

The app launches with a **role selector**. Choose "Player" or "Admin" to test features. No real authentication — this is a prototype.

---

## Project Overview

**Squash League Management App** — A dark-themed, mobile-first prototype for managing casual monthly squash play. Players join games, track costs; admins configure league settings and view participation.

- **Status**: Fully functional prototype, no backend
- **No real data persistence** — everything resets on refresh
- **Simulated emails** — triggered by date changes, visible in Mail Center
- **Time travel** — admin can fast-forward to test deadlines/reminders

---

## Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **UI**: React 18, Tailwind CSS (dark theme only)
- **State**: Zustand (lightweight, no Redux boilerplate)
- **Date utilities**: date-fns
- **Icons**: Lucide React

### Core Structure

```
app/
  layout.tsx        # Root layout (global styles, font imports)
  page.tsx          # Single page with conditional rendering for all views

components/
  RoleSelector.tsx       # Role choice UI
  Header.tsx             # Nav + mail icon + user info
  PlayDayCard.tsx        # Individual game card (join/leave)
  MonthSelector.tsx      # Month dropdown
  CostSummary.tsx        # Player cost breakdown (sticky)
  LeagueSettingsForm.tsx # Admin settings
  AdminSummaryCard.tsx   # Monthly overview
  PaymentStatusTable.tsx # Payment tracking
  TimeSimControls.tsx    # Date navigation (admin)
  MailCenter.tsx         # Email list UI
  MailItem.tsx           # Email display

lib/
  store.ts          # Zustand store with all state & actions
  types.ts          # TypeScript interfaces (Role, Month, PlayDay, etc.)
  dateUtils.ts      # Month generation, deadline logic
  emailLogic.ts     # Email trigger conditions
  pricingUtils.ts   # Cost calculations (€20 base + €5/game)
  courtUtils.ts     # Court calculation (players ÷ players-per-court)
  mockData.ts       # Initial users & settings

styles/
  globals.css       # Tailwind imports + custom dark theme variables
```

### Single-Page Conditional Rendering

Rather than file-based routes, `app/page.tsx` manages all views via Zustand state:
- **currentUserId**: determines which user is logged in
- **currentView** or similar state flag: controls what renders (player dashboard, admin panel, mail center, role selector)

This approach keeps the codebase simple and state synchronized.

---

## State Management (Zustand)

The store in `lib/store.ts` is the single source of truth:

```typescript
useAppStore.setState(...)  // Update state
useAppStore.getState()     // Read state synchronously
useAppStore.subscribe(...)  // Listen to changes
```

### Key State Slices
- **currentDate**: Simulated time (for testing deadlines/reminders)
- **currentUserId**: Active user
- **months**: Array of Month objects with play days, player participation, payment status
- **mail**: All email records (reminders, summaries, booking confirmations)
- **leagueSettings**: Recurring days, deadline day-of-month, reminder day-of-month, players per court

### Important Actions
- `setCurrentDate(date)` — Move time forward/backward
- `togglePlayDay(monthId, playDayId)` — Player joins/leaves a game
- `jumpToDeadline()` — Fast-forward to deadline, triggers emails
- `jumpToReminderDay()` — Fast-forward to reminder day
- `updateLeagueSettings(settings)` — Admin saves new config
- `commitMonth(monthId, userId)` — Player commits payment for a month
- `setPaymentMethod(monthId, userId, method)` — Record payment method choice

---

## Key Patterns & Decisions

### 1. Computed State is Stored
The store doesn't use getters; it stores computed values (e.g., `currentMonth`, `monthDeadlinePassed`, `recentMail`) to avoid stale closures and ensure components re-render properly.

Methods like `_computeCurrentMonth()` are called after state changes:
```typescript
setCurrentDate: (date) => {
  set({ currentDate: date })
  get()._computeCurrentMonth()
  get()._computeNextMonth()
}
```

### 2. Date-Based Business Logic
- **Month generation** happens lazily in `dateUtils.ts`: `generateMonthsFrom(startDate, count, settings, users)`
- **Deadline** is day-of-month (e.g., 30th) → automatic locking when `currentDate >= month.deadlineDate`
- **Reminders** trigger when `currentDate === month.reminderDate` AND player hasn't joined any games

### 3. Email Simulation
`emailLogic.ts` defines when emails fire. Emails are stored in `mail[]` array with:
- **type**: "reminder" | "admin_summary" | "booking" | "payment_reminder" | "payment_confirmation"
- **timestamp**: Date object (for sorting recent emails)
- **recipient**: User ID or "admin"
- **subject** & **content**: Full text

No real email sending — the Mail Center reads this array.

### 4. Responsive Design
Tailwind utilities only. No CSS modules or styled-components. The dark theme is applied globally in `globals.css` with custom color variables.

---

## Development Workflow

### Running the App
```bash
npm run dev
# Opens http://localhost:3000
# HMR enabled — changes reflect instantly
```

### Testing Features
1. **Player flow**: Select "Alice Johnson", browse months, join/leave games, check cost updates
2. **Admin flow**: Select "Admin User", change settings, use time controls to trigger emails
3. **Email testing**: Jump to deadline → check Mail Center for emails
4. **Payment flow**: Player selects payment method, admin confirms

### Common Tasks

**Add a new component**
- Create in `components/`, use `'use client'` if it needs interactivity
- Import types from `lib/types.ts`
- Access store via `const store = useAppStore()`

**Modify state logic**
- Edit actions in `lib/store.ts`
- Keep related logic (email conditions, date calculations) in `lib/emailLogic.ts`, `lib/dateUtils.ts`

**Change email triggers**
- Edit `lib/emailLogic.ts` → `checkAndGenerateEmails()`
- Conditions evaluate against current state and dates

**Add a new role or view**
- Create corresponding component
- Add logic to `app/page.tsx` to render conditionally based on current state

---

## Git & Commits

Martin prefers **clean git history** — commits should look intentional and polished, not iterative. If debugging leaves visible traces in the log:
- Use `git reset` to clean up intermediate commits before pushing
- Squash exploratory work into one cohesive commit
- Commit messages should be clear and focused

---

## Notes for Future Work

### Supabase Integration (Next Phase)
The type definitions and component structure are ready. To connect a backend:
1. Replace Zustand with Supabase client calls
2. Reuse all types from `lib/types.ts`
3. Add API route handlers in `app/api/` for auth, months, playdays, etc.

### Known Limitations (Intentional)
- No real authentication (role selector only)
- No data persistence (local state only)
- No real email sending
- Single admin only
- Prototype stage — not production-ready

---

## Language & Communication

This is Martin's personal project. He prefers direct, concise communication. When in doubt about approach, propose options briefly and let him decide.

---

## Resources

- **README.md** — User-facing overview of features and testing flows
- **package.json** — Dependencies and scripts
- **tsconfig.json** — Compiler options (strict mode enabled)
- **.claude/launch.json** — Dev server config for preview
