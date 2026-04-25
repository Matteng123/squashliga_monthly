# 🏸 Squash League – Mobile-First Prototype

A fully functional, clickable prototype of a dark-themed sports league app for managing casual monthly squash play.

**Status:** Complete prototype ✓ (local, no backend)

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and select a role to begin.

---

## 👥 Roles & Features

### Player
- **View monthly play days** — calendar-like list with date, weekday, player count
- **Join/leave games** — toggle participation for each play day
- **Track costs** — live calculation: €20 base + €5 per game
- **Month selection** — browse current and future months
- **Receive emails** — reminders if you haven't selected any play days for next month
- **Mail Center** — view all system emails

### Admin
- **Configure league settings**:
  - Recurring play days (e.g., Monday, Thursday)
  - Players per court (used for court calculation)
  - Monthly deadline (day of month when selections lock)
  - Reminder day (when players receive reminders)
- **View monthly overview**:
  - Participation per play day
  - Automatic court calculation
  - Lock status
- **Time simulation controls**:
  - Navigate current date with day buttons or today button
  - Jump to deadline (triggers email generation)
  - Jump to reminder day (triggers reminders)
- **Mail Center** — receive system summary and booking emails

---

## 📧 Email System

No real emails — all simulated in the **Mail Center** (📬 icon in header, or `/mail` route).

### Trigger Types

#### 1. **Player Reminder**
- **When:** Triggered on reminder day (e.g., 25th)
- **Condition:** Player hasn't selected ANY play days for the next month
- **Content:** Friendly reminder to make selections
- **Recipient:** Individual player

#### 2. **Admin Summary**
- **When:** Triggered on monthly deadline
- **Content:** Full breakdown of all play days, player counts, courts needed
- **Recipient:** Admin only
- **Purpose:** Internal reference

#### 3. **Booking Email**
- **When:** Triggered on monthly deadline
- **Content:** Clean, formatted list ready to forward to Cosmo Sport
- **Recipient:** Admin only
- **Purpose:** Forward-ready booking confirmation

---

## 🎮 Testing Flows

### Player Flow
1. **Select role** → "Alice Johnson" (or any player)
2. **View current month** — see play days for this month
3. **Join a game** — click "+ Join" on any play day
   - Player count increases
   - Cost updates at bottom (€25 = €20 + 1×€5)
4. **Join more games** — cost continues to update
5. **Leave a game** — click "✓ Joined" to toggle off
6. **Try future month** — select from month dropdown
7. **Observe lock behavior**:
   - **Before deadline:** "✓ Open" — can join/leave
   - **After deadline:** "🔒 Locked" — buttons disabled
8. **Trigger reminder**:
   - Go to Admin panel
   - Use time controls to jump to reminder day of NEXT month
   - Switch back to Player → check Mail Center
   - Should see reminder email if no play days selected

### Admin Flow
1. **Select role** → "Admin User"
2. **Configure league settings**:
   - Toggle days (e.g., Monday, Thursday)
   - Change players per court (default 4)
   - Adjust deadline (default 30th)
   - Adjust reminder day (default 25th)
   - Click "Save Settings" → applies to all future months
3. **View monthly overview** — cards show:
   - Month name
   - Unique player count
   - Total session slots filled
   - List of all play days with player counts & courts needed
4. **Trigger deadline emails**:
   - Use "Jump to Deadline" button
   - Go to Mail Center → see Admin Summary & Booking emails generated
5. **Check email formatting**:
   - Admin Summary → detailed breakdown
   - Booking Email → clean format for forwarding

### Email Testing Flow
1. **Go to Mail Center** (icon in header)
2. **No emails yet?** Jump to deadline or reminder day from Admin panel
3. **After jumping**, return to Mail Center
4. **See emails** with:
   - Type badge (📬 Reminder, 📊 Summary, 🎫 Booking)
   - Recipient info
   - Subject and full content
   - Delete button (archive email)

---

## 🕐 Time Simulation

**Purpose:** Test the entire system without waiting for real dates.

### Controls (Admin panel, bottom right)
- **← Previous Day / Next Day →** — step through dates
- **Today** — jump to today's date (April 25, 2026)
- **Jump to Deadline** — fast-forward to current month's deadline
- **Jump to Reminder Day** — fast-forward to next month's reminder day

**What happens:**
- Deadline passed → all play days lock, status changes to "🔒 Locked"
- Reminder day reached → emails trigger if conditions met
- Any date change → system auto-generates months as needed

---

## 📁 Project Structure

```
app/
├── page.tsx                  # Role selector (home)
├── player/page.tsx           # Player dashboard
├── admin/page.tsx            # Admin dashboard
└── mail/page.tsx             # Mail Center

components/
├── RoleSelector.tsx          # Role choice UI
├── Header.tsx                # Nav bar with mail icon, user info
├── PlayDayCard.tsx           # Individual play day card
├── MonthSelector.tsx         # Month dropdown
├── CostSummary.tsx           # Player cost breakdown (sticky bottom)
├── LeagueSettingsForm.tsx    # Admin settings form
├── AdminSummaryCard.tsx      # Monthly overview card
├── TimeSimControls.tsx       # Date/time picker (admin)
├── MailCenter.tsx            # Email list
└── MailItem.tsx              # Single email display

lib/
├── types.ts                  # TypeScript interfaces
├── store.ts                  # Zustand state management
├── mockData.ts               # Initial users & settings
├── dateUtils.ts              # Month generation, deadline logic
├── pricingUtils.ts           # Cost calculations
├── courtUtils.ts             # Court calculation
└── emailLogic.ts             # Email trigger logic

styles/
└── globals.css               # Tailwind + custom dark theme
```

---

## 🔌 Future: Backend Integration

This prototype is structured to easily connect to real services:

### **Supabase Integration**
```typescript
// Replace Zustand store with Supabase client
const { data, error } = await supabase
  .from('months')
  .select('*')
  .filter('deadline_date', 'gte', new Date())

// Reuse all existing types (lib/types.ts)
```

### **API Endpoints**
```
POST   /api/auth/login
GET    /api/league/settings
POST   /api/league/settings
GET    /api/months
POST   /api/playdays/:id/join
DELETE /api/playdays/:id/leave
GET    /api/mail
```

### **Deployment**
- Vercel: `vercel deploy` (zero changes needed)
- Database: Supabase (via environment variables)
- Auth: Supabase Auth (replace role selector with real login)

---

## 🎨 Design Notes

- **Dark theme only** — Tailwind CSS with custom dark colors
- **Mobile-first** — responsive grid layouts
- **Accessible** — high contrast, clear labels, semantic HTML
- **Sporty vibe** — orange & emerald accents, bold typography

---

## 🧪 Tech Stack

- **Next.js 15** — App Router, SSR
- **TypeScript** — full type safety
- **Tailwind CSS** — utility-first styling
- **Zustand** — lightweight state management
- **date-fns** — date utilities
- **Lucide React** — icons

---

## 📝 Example Workflows

### Scenario 1: Player checks in for next month
1. Login as Alice
2. Select **May 2026** from dropdown
3. No play days selected yet
4. Admin jumps to **May 25** → Alice receives reminder email
5. Alice logs back in, selects **2 games**
6. Cost updates: €20 + 2×€5 = €30
7. Alice views Mail Center → sees reminder (can delete it)

### Scenario 2: Admin configures league
1. Login as Admin
2. Uncheck "Friday" from play days
3. Change deadline to **28th**
4. Save settings
5. New months auto-generate with Monday & Thursday only
6. Deadline on 28th (not 30th)

### Scenario 3: Monthly deadline workflow
1. Players join games throughout the month
2. Admin uses **"Jump to Deadline"** button
3. All play days instantly lock (status → "🔒 Locked")
4. Two emails trigger:
   - **Admin Summary** — detailed breakdown (100+ players across 8 days, etc.)
   - **Booking Email** — clean format: "Date: Mon 5, Players: 8, Courts: 2"
5. Admin forwards Booking Email to Cosmo Sport

---

## 💡 Prototype Highlights

✅ **Fully functional** — all features work end-to-end  
✅ **No backend needed** — mock data, local state only  
✅ **Email simulation** — triggered by date changes, visible in Mail Center  
✅ **Time travel** — test deadlines and reminders instantly  
✅ **Dark theme** — professional, modern, mobile-optimized  
✅ **Type-safe** — TypeScript throughout  
✅ **Extensible** — clear structure for Supabase + Vercel integration  

---

## 🤔 Known Limitations

- No real authentication (role selector only)
- No data persistence (refreshing clears everything)
- No real email sending
- Monthly deadlines are day-based only (not time-based)
- Single admin only

These are intentional — this is a prototype, not a production app.

---

## 📞 Support

For questions or feature requests, check the [Plan](/.claude/plans/iterative-prancing-sparkle.md) or review the component code. All logic is documented and modular.

Happy league organizing! 🏸
