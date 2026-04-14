# StudyNest — Complete Software Architecture & Technical Documentation

> Generated April 2026 · React Native + Expo SDK 52 · SQLite · Context + useReducer

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [File Structure](#4-file-structure)
5. [State Management](#5-state-management)
6. [Database Schema](#6-database-schema)
7. [Navigation Map](#7-navigation-map)
8. [Component Library](#8-component-library)
9. [Themes & Fonts](#9-themes--fonts)
10. [Feature Catalogue](#10-feature-catalogue)
11. [Data Flow](#11-data-flow)
12. [Known Bugs Fixed](#12-known-bugs-fixed)
13. [Cozy Features](#13-cozy-features)
14. [Install & Run](#14-install--run)
15. [Architecture Decisions](#15-architecture-decisions)

---

## 1. Project Overview

StudyNest is a private, offline-first academic organizer for Android students. It organizes courses into smart folders, each containing files, notes, tasks, study sets, links, bookmarks, grades, and a gratitude journal. There is no cloud, no account, no ads — all data lives on the device in SQLite.

**Key numbers:**
- 20 SQLite tables
- 35+ reducer actions
- 16 AppState slices
- 19 screen files
- 10 themes × light + dark = 20 color sets
- 6 font families
- 44 daily quotes

---

## 2. Technology Stack

| Package | Version | Purpose |
|---|---|---|
| `expo` | ~52.0.0 | Platform SDK |
| `expo-router` | ~4.0.0 | File-based navigation |
| `expo-sqlite` | ~15.1.2 | On-device relational database |
| `expo-file-system` | ~18.0.0 | File read/write (new API: `expo-file-system/next`) |
| `expo-document-picker` | ~13.0.0 | Multi-file picker from device storage |
| `expo-sharing` | ~12.0.0 | Share sheet for backup export |
| `expo-intent-launcher` | ~11.0.0 | Open files in native Android apps |
| `expo-keep-awake` | ~14.0.0 | Keep screen on during Pomodoro |
| `nativewind` | ^4.1.0 | Tailwind CSS for React Native |
| `react-native` | 0.76.3 | Core framework |
| `uuid` | ^10.0.0 | UUID generation for all entity IDs |
| `@expo/vector-icons` | ^14.0.0 | Feather icon set |

**Font packages:**
```
@expo-google-fonts/lora
@expo-google-fonts/crimson-pro
@expo-google-fonts/jetbrains-mono
@expo-google-fonts/spectral
@expo-google-fonts/merriweather
@expo-google-fonts/eb-garamond
@expo-google-fonts/cormorant
```

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   SCREENS (Expo Router)             │
│  Home · Courses · Schedule · Settings · Course      │
│  Detail · Note · StudySet · Pomodoro · Search       │
│  Report · IDCard · Trash · Backup                   │
├─────────────────────────────────────────────────────┤
│              STATE LAYER (React Context)            │
│   AppContext (useReducer) · SettingsContext          │
│   useTheme() hook → live ThemeColors                │
├─────────────────────────────────────────────────────┤
│                    UTILITIES                        │
│   db.ts · storage.ts · fileHelper.ts               │
│   constants/types · themes · quotes · icons         │
├─────────────────────────────────────────────────────┤
│                PERSISTENT STORAGE                   │
│   SQLite (expo-sqlite) · File System                │
│   WAL mode · Foreign keys · Migrations              │
└─────────────────────────────────────────────────────┘
```

**Provider nesting order (outermost → innermost):**
```
SafeAreaProvider
  └── SettingsProvider
        └── AppProvider
              └── AppShell (font loading + DB init + Stack gate)
                    └── Stack (only renders after allReady = true)
```

**Boot sequence:**
```
initDB()
  → CREATE TABLE IF NOT EXISTS (20 tables)
initNewTables()
  → ALTER TABLE migrations (safe try/catch per statement)
  → INSERT OR IGNORE INTO study_streak
loadSettings()
  → reads theme/font/language/isDark from settings table
loadAll()
  → getAllSync() on all 20 tables
  → maps raw rows to typed objects
  → dispatch({ type: 'LOAD', payload: {...} })
  → state.ready = true
setTimeout(() => updateStreak(), 500)
  → checks last_date vs today, increments streak
allReady = fontsLoaded && dbReady && state.ready
  → Stack mounts → screens can render
```

---

## 4. File Structure

```
studynest/
├── app/
│   ├── _layout.tsx                 Root: providers, font load, DB init, Stack gate
│   ├── (tabs)/
│   │   ├── _layout.tsx             Tab bar (height 66px + insets)
│   │   ├── index.tsx               Home hub (cozy features, sticky notes, streak)
│   │   ├── courses.tsx             Course grid (batch select, archive, long-press select)
│   │   ├── schedule.tsx            Calendar strip + full modal picker + exams
│   │   └── settings.tsx            10 themes, 6 fonts, autoDark, RTL, about
│   ├── course/[id]/index.tsx       7-tab course detail
│   ├── note/[noteId].tsx           Markdown editor, auto-save, word count
│   ├── set/[setId].tsx             Study set overview + quiz mode
│   ├── pomodoro.tsx                Timer + keep-awake + custom mm:ss
│   ├── search.tsx                  Global search (6 entity types)
│   ├── report.tsx                  Weekly report + per-course breakdown
│   ├── idcard.tsx                  Student ID card + profile editor
│   ├── trash.tsx                   Soft-deleted items, restore or purge
│   └── backup.tsx                  JSON export/import via share sheet
│
├── context/
│   ├── AppContext.tsx              All app data: 35+ actions, 20 state slices
│   └── SettingsContext.tsx         Theme/font/language: autoDark via Appearance API
│
├── components/
│   ├── ui/
│   │   ├── BottomSheet.tsx         Modal + KeyboardAvoidingView + Pressable backdrop
│   │   ├── Button.tsx              primary / secondary / danger variants
│   │   ├── Input.tsx               Labelled text input
│   │   ├── Text.tsx (Txt)          Font-aware text, reads fontFamily from settings
│   │   ├── FAB.tsx                 Floating action button
│   │   ├── Toggle.tsx              iOS-style switch
│   │   ├── ProgressBar.tsx         Animated width, accepts custom color
│   │   └── EmptyState.tsx          Icon + title + subtitle placeholder
│   ├── course/
│   │   ├── CourseCard.tsx          Feather icon, color top border, progress bar, selected state
│   │   ├── EditCourseSheet.tsx     Add/edit/delete course bottom sheet
│   │   ├── FileItem.tsx            Feather icon per file type, rename on long press
│   │   ├── LinkItem.tsx            Domain extraction, external link icon
│   │   ├── MilestoneCard.tsx       Step checklist + edit/delete buttons
│   │   └── TodoItem.tsx            Priority dot, deadline badge, edit on press
│   └── schedule/
│       └── DeadlineCard.tsx        Toggle done, priority color, course badge
│
├── constants/
│   ├── types.ts                    20+ interfaces (Course, Note, Todo, Exam, StickyNote…)
│   ├── themes.ts                   10 themes × light+dark (ThemeColors × 20)
│   ├── quotes.ts                   44 quotes + getDailyQuote() by day-of-year
│   └── icons.ts                    PRIORITY_COLORS, FILE_TYPE_COLORS, FOLDER_ICONS
│
├── utils/
│   ├── db.ts                       initDB(), initNewTables(), db singleton
│   ├── storage.ts                  exportBackupJSON/CSV, formatters (expo-file-system/next)
│   └── fileHelper.ts               pickFiles() multi, openFileExternal(), getFileType()
│
├── hooks/
│   └── useTheme.ts                 Returns useSettings().colors (ThemeColors)
│
└── assets/
    ├── icon.png                    1024×1024 app icon
    ├── adaptive-icon.png           Android adaptive foreground
    ├── splash-icon.png             512×512 splash
    └── favicon.png                 32×32 web
```

---

## 5. State Management

### AppContext

**Why Context + useReducer (not Zustand):**
Zustand's `.filter()` inside selectors returns new array references every render → infinite re-render loop. Context + useReducer avoids this — state is read directly, derived values use `useMemo` in components.

**State shape:**
```typescript
interface AppState {
  profile:            UserProfile | null;
  courses:            Course[];
  files:              CourseFile[];
  notes:              Note[];
  todos:              TodoItem[];
  studySets:          StudySet[];
  links:              Link[];
  bookmarks:          Bookmark[];
  grades:             GradeEntry[];
  exams:              Exam[];
  pomodoroSessions:   PomodoroSession[];
  stickyNotes:        StickyNote[];
  dailyIntentions:    DailyIntention[];
  gratitudeEntries:   GratitudeEntry[];
  streak:             StudyStreak;
  trash:              TrashItem[];
  ready:              boolean;
}
```

**Action categories:**

| Group | Actions |
|---|---|
| Boot | `LOAD` |
| Profile | `UPDATE_PROFILE` |
| Courses | `ADD_COURSE` `UPDATE_COURSE` `DELETE_COURSE` `ARCHIVE_COURSE` |
| Files | `ADD_FILE` `DELETE_FILE` `RENAME_FILE` |
| Notes | `ADD_NOTE` `UPDATE_NOTE` `DELETE_NOTE` |
| Todos | `ADD_TODO` `TOGGLE_TODO` `UPDATE_TODO` `DELETE_TODO` |
| Study sets | `ADD_STUDY_SET` `UPDATE_STUDY_SET` `TOGGLE_STEP` `DELETE_STUDY_SET` |
| Links | `ADD_LINK` `DELETE_LINK` |
| Bookmarks | `ADD_BOOKMARK` `DELETE_BOOKMARK` |
| Grades | `ADD_GRADE` `UPDATE_GRADE` `DELETE_GRADE` |
| Exams | `ADD_EXAM` `UPDATE_EXAM` `DELETE_EXAM` |
| Pomodoro | `ADD_POMODORO` |
| Sticky notes | `ADD_STICKY` `UPDATE_STICKY` `DELETE_STICKY` |
| Intentions | `SET_INTENTION` |
| Gratitude | `ADD_GRATITUDE` `DELETE_GRATITUDE` |
| Streak | `UPDATE_STREAK` |
| Trash | `ADD_TRASH` `RESTORE_TRASH` `DELETE_TRASH` |

**Write pattern (every context function):**
```typescript
// 1. Write to SQLite first (persists immediately)
db.runSync('INSERT INTO todos (...) VALUES (?,...)', [params]);

// 2. Then update React state
dispatch({ type: 'ADD_TODO', payload: newTodo });

// Never query DB in a component. Always read from state.
```

### SettingsContext

```typescript
interface SettingsState {
  theme:      ThemeName;    // 10 options
  isDark:     boolean;
  autoDark:   boolean;      // follows Appearance API
  fontFamily: FontFamily;   // 6 options
  language:   Language;     // 'en' | 'ar'
}
```

Auto dark mode subscribes to `Appearance.addChangeListener` and updates `isDark` when the system color scheme changes.

---

## 6. Database Schema

### Core tables

**`courses`** — central entity, all others cascade-delete with it
```sql
id TEXT PK, name TEXT, icon TEXT, color TEXT,
archived INTEGER DEFAULT 0, created_at INTEGER, updated_at INTEGER
```

**`course_files`** — PDF, DOCX, PPTX, or note references
```sql
id TEXT PK, course_id TEXT FK→courses, name TEXT, uri TEXT,
type TEXT, size INTEGER, added_at INTEGER
```

**`notes`**
```sql
id TEXT PK, course_id TEXT FK→courses, title TEXT,
content TEXT, template TEXT DEFAULT 'blank', updated_at INTEGER
```
Templates: `blank` · `lecture` · `meeting` · `summary`

**`todos`**
```sql
id TEXT PK, course_id TEXT FK→courses, title TEXT,
done INTEGER DEFAULT 0, deadline INTEGER, priority TEXT, created_at INTEGER
```
Priority: `low` · `medium` · `high`

**`study_sets`** + **`study_set_steps`**
```sql
-- study_sets
id TEXT PK, course_id TEXT FK→courses, title TEXT, created_at INTEGER

-- study_set_steps
id TEXT PK, set_id TEXT FK→study_sets, label TEXT,
done INTEGER DEFAULT 0, position INTEGER DEFAULT 0
```

**`grades`**
```sql
id TEXT PK, course_id TEXT FK→courses, label TEXT,
score REAL, max_score REAL, weight REAL DEFAULT 1, created_at INTEGER
```
Weighted average: `Σ(score/max_score × weight) / Σ(weight) × 100`

**`exams`**
```sql
id TEXT PK, course_id TEXT FK→courses, title TEXT,
date INTEGER, location TEXT, notes TEXT, created_at INTEGER
```

### Cozy/utility tables

**`sticky_notes`** — Home screen quick notes
```sql
id TEXT PK, content TEXT, color TEXT DEFAULT '#FFF9C4',
created_at INTEGER, updated_at INTEGER
```

**`daily_intentions`** — one per day (UNIQUE on date)
```sql
id TEXT PK, date TEXT UNIQUE, intention TEXT,
mood TEXT DEFAULT 'good', created_at INTEGER
```
Moods: `great` · `good` · `okay` · `tired` · `stressed`

**`gratitude_entries`** — per course
```sql
id TEXT PK, course_id TEXT FK→courses,
content TEXT, created_at INTEGER
```

**`study_streak`** — single row (id='streak')
```sql
id TEXT PK DEFAULT 'streak', last_date TEXT,
current_streak INTEGER DEFAULT 0, longest_streak INTEGER DEFAULT 0
```

**`trash`** — soft delete store
```sql
id TEXT PK, type TEXT, title TEXT,
data TEXT (JSON), deleted_at INTEGER
```

**`pomodoro_sessions`**
```sql
id TEXT PK, course_id TEXT (nullable), duration INTEGER, completed_at INTEGER
```

**`user_profile`** — single row (id='me')
```sql
id TEXT PK DEFAULT 'me', name TEXT DEFAULT 'Student',
email TEXT, university TEXT, major TEXT, year TEXT,
avatar_emoji TEXT DEFAULT '🎓', avatar_bg TEXT DEFAULT '#8B4513',
id_card_visible INTEGER DEFAULT 1
```

**`settings`** — key-value store for app preferences
```sql
key TEXT PK, value TEXT
```
Keys: `theme` · `isDark` · `autoDark` · `fontFamily` · `language`

### Migration strategy

New columns are added via `ALTER TABLE` statements wrapped in try/catch — SQLite throws if the column already exists, which is silently ignored. This handles both fresh installs (table created with all columns) and existing installs (column added at runtime):

```typescript
const migrations = [
  `ALTER TABLE courses ADD COLUMN archived INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE notes   ADD COLUMN template TEXT NOT NULL DEFAULT 'blank'`,
  `CREATE TABLE IF NOT EXISTS sticky_notes (...)`,
  // ...
];
for (const sql of migrations) {
  try { db.runSync(sql); } catch (_) { /* already exists */ }
}
```

---

## 7. Navigation Map

```
app/_layout.tsx (SafeArea → Settings → App → AppShell)
│
└── Stack (blocked until allReady = true)
    │
    ├── (tabs)/_layout.tsx  ← Bottom tab bar (66px + safe area insets)
    │   ├── index.tsx         Home
    │   ├── courses.tsx        Courses
    │   ├── schedule.tsx       Schedule
    │   └── settings.tsx       Settings
    │
    ├── course/[id]/index.tsx  ← slide_from_right
    │   └── Inner tabs: Files · To-Do · Links · Sets · Grades · Saved · Journal
    │
    ├── note/[noteId].tsx      ← slide_from_bottom
    ├── set/[setId].tsx        ← slide_from_bottom
    ├── pomodoro.tsx           ← slide_from_bottom (modal)
    ├── search.tsx             ← fade
    ├── report.tsx             ← slide_from_bottom (modal)
    ├── idcard.tsx             ← slide_from_bottom (modal)
    ├── trash.tsx              ← slide_from_bottom (modal)
    └── backup.tsx             ← slide_from_bottom (modal)
```

**Android params fix** — applied in every dynamic route:
```typescript
const params = useLocalSearchParams();
const rawId  = params?.id;
// useLocalSearchParams returns string | string[] on Android
const courseId = Array.isArray(rawId) ? rawId[0] : rawId;
```

---

## 8. Component Library

### UI primitives

**`BottomSheet`** — custom modal, never native Android alert
```
Props: visible, onClose, title?, children, scrollable?
Implementation: Modal + KeyboardAvoidingView (platform: 'padding' iOS / 'height' Android)
Backdrop: Pressable with rgba(0,0,0,0.52) overlay
```

**`Txt`** — theme-aware, font-aware text component
```typescript
// Reads fontFamily from useSettings() at runtime
// Maps to correct loaded font for variant:
// display → Lora_600SemiBold (or equivalent per font family)
// body    → CrimsonPro_400Regular (or equivalent)
// mono    → JetBrainsMono_400Regular (always)
```

**`ProgressBar`** — animated with `Animated.timing`, accepts `color` prop
```typescript
Props: progress (0–1), height?, color?
Animation: 600ms ease, useNativeDriver: false (animates width %)
```

### Course components

**`CourseCard`** — color top border, Feather icon mapped from emoji string, `selected` prop for batch operations, `useMemo` for todos/files

**`FileItem`** — Feather icon per type (`file-text`, `monitor`, `edit-3`, `file`), color-coded background, long press → rename/delete BottomSheet

**`TodoItem`** — tap → edit modal, long press → alert with Edit/Delete, priority color dot, overdue/urgent badge

**`MilestoneCard`** — step checklist, edit ✏️ + delete 🗑 buttons, animated progress bar

---

## 9. Themes & Fonts

### Themes (10)

Each theme has `light` and `dark` variants with 15 color values:
`bg` · `bg2` · `bg3` · `card` · `card2` · `text` · `text2` · `text3` · `accent` · `accent2` · `accent3` · `border` · `border2` · `red` · `blue`

| Theme | Style | Accent |
|---|---|---|
| Oxford | Warm parchment + ink | `#8B4513` |
| Night | Deep navy + silver | `#7B8FD4` |
| Garden | Sage greens + cream | `#3A7A4A` |
| Space | Dark charcoal + cyan | `#00BFFF` |
| Cozy | Amber + terracotta | `#C0622A` |
| Slate | Clean blue-grey | `#4F6EF7` |
| Rose | Soft rose + blush | `#E11D48` |
| Forest | Deep greens + gold | `#166534` |
| Dusk | Lavender + violet | `#7C3AED` |
| Nebula | Deep space purple | `#6B2FD4` |

### Fonts (6 families)

| ID | Family | Style | Loaded variants |
|---|---|---|---|
| `lora` | Lora | Classic warm serif | SemiBold, SemiBold Italic |
| `crimson` | Crimson Pro | Research paper | Regular, Italic, SemiBold |
| `spectral` | Spectral | Elegant editorial | Regular, Italic, SemiBold, SemiBold Italic |
| `merriweather` | Merriweather | Strong, readable | Regular, Italic, Bold, Bold Italic |
| `eb_garamond` | EB Garamond | Historic academic | Regular, Italic, SemiBold, SemiBold Italic |
| `cormorant` | Cormorant | Refined display | Regular, Italic, SemiBold, SemiBold Italic |

JetBrains Mono is always loaded as the mono face regardless of font selection.

---

## 10. Feature Catalogue

### Course folders (7 inner tabs)

| Tab | Features |
|---|---|
| Files | Multi-file picker (PDF/DOCX/PPTX), note creation, rename on long press, open in native app |
| To-Do | Add/edit/delete tasks, priority (low/medium/high), deadline picker with shortcuts, completed section |
| Links | Save URLs, auto domain extraction, open in browser |
| Sets | Study set checklists, quiz mode (tap-to-reveal, Got it / Skip), progress bar |
| Grades | Weighted GPA calculator, color-coded average (green ≥70% / amber ≥50% / red) |
| Saved | Reading list bookmarks with optional notes |
| Journal | Gratitude entries per course, long press to delete |

### Home hub

- Time-of-day header with emoji + color (morning 🌅 / afternoon ☀️ / evening 🌆 / night 🌙)
- Greeting by first name from profile, Arabic or English
- Daily intention check-in (mood selector + text, shown on first open)
- Study streak badge (current + longest)
- Sticky notes row (6 colors, tap to edit, add unlimited)
- Next exam countdown banner
- Daily quote (44 quotes, rotates by day-of-year)
- Stats: Courses / Due Soon / Pomodoros / Tasks %
- Quick actions: 8 pill shortcuts
- Course progress cards (horizontal scroll)
- Recent activity (last 4 files)
- Upcoming deadlines (next 3)
- End-of-day summary popup (at 9 PM)
- Paper texture background
- Sparkle ✨ particle effect on celebrations

### Schedule

- 21-day horizontal date strip with task/exam dot indicators
- Full calendar modal — navigate any month/year, tap any date
- Selected date summary (tasks + exams)
- Upcoming exams list with location, notes, countdown
- Add Task or Add Exam in one sheet with mode toggle
- Priority selector for tasks

### Pomodoro

- 4 modes: Focus 25m / Short Break 5m / Long Break 15m / Custom
- Custom mode: editable mm:ss text inputs
- Screen stays on during session (`expo-keep-awake`)
- Vibration on completion
- Course selector (studying for which subject)
- Session stats: today's sessions, total study minutes, all-time sessions
- All sessions persisted to `pomodoro_sessions` table

### Settings

- 10 themes with live preview swatches (split light/dark circle)
- 6 font families with "Aa" preview in each font
- Dark mode toggle + Auto dark (follows system `Appearance` API)
- Language: English (LTR) / Arabic (RTL) — affects greetings and labels
- Link to Backup & Restore screen
- Link to Trash screen
- About app description

### Global search

- Searches: courses, files, notes (title + content), todos, links, exams
- Real-time as you type (≥ 2 characters)
- Kind badge per result
- Max 50 results
- Tapping navigates directly to the item's screen

### Backup & Restore

- Export full JSON via native share sheet
- Export todos as CSV
- Restore: pick JSON file from storage or paste raw JSON
- Merges with existing data (does not wipe first)
- Uses `expo-file-system/next` `File` + `Paths.document` API

### Trash bin

- `moveToTrash(type, title, data)` stores serialized JSON
- Items shown with type icon, name, days since deletion
- Restore removes from trash (data re-insert handled by caller)
- Permanent delete with confirmation BottomSheet
- Empty Trash button (purges all)

### Student ID card

- Avatar: 15 emoji × 10 background colors
- Fields: name, email, university, major, year
- Live preview updates as you type (reads from state vars, not stale profile snapshot)
- `useEffect` syncs form fields when profile loads from DB
- Card renders: header band, avatar, info rows, ID footer, academic year

### Weekly report

- Week range: Monday → Sunday (calculated at render)
- Totals: focus minutes, sessions, tasks completed, overdue count
- Per-course breakdown: task %, pomodoro count this week, GPA
- Upcoming exams (next 3)
- Overall task progress ring

---

## 11. Data Flow

### Startup
```
App opens
  → _layout.tsx renders loading spinner
  → initDB() runs in async IIFE
  → initNewTables() runs safe migrations
  → loadSettings() reads settings table → dispatches LOAD into SettingsContext
  → loadAll() reads all 20 tables → dispatches LOAD into AppContext
  → state.ready = true
  → allReady = fontsLoaded && dbReady && state.ready
  → Stack renders → home screen visible
```

### User writes data
```
User taps "Add Task"
  → BottomSheet opens
  → User fills form and taps Save
  → handleAddTodo() called
  → db.runSync('INSERT INTO todos ...', [params])  ← writes to SQLite immediately
  → dispatch({ type: 'ADD_TODO', payload: newTodo }) ← updates React state
  → Reducer returns new state immutably
  → All subscribed components re-render
  → useMemo in components recomputes only if relevant slice changed
```

### App background / force quit
```
SQLite write happens synchronously in the same call as dispatch
→ Data is on disk before the component even re-renders
→ App force-quit loses nothing — SQLite is already committed
→ Next launch: loadAll() reads everything back from SQLite
```

---

## 12. Known Bugs Fixed

### 1. `useLocalSearchParams` returns array on Android
**Symptom:** `course.id` crash — `Cannot read property 'id' of null`  
**Cause:** `useLocalSearchParams()` returns `string | string[]` at runtime on Android despite TypeScript generic  
**Fix:** Normalize in every dynamic route:
```typescript
const params = useLocalSearchParams();
const courseId = Array.isArray(params.id) ? params.id[0] : params.id as string;
```

### 2. BottomSheet children evaluated when visible=false
**Symptom:** `Cannot read property 'id' of null` on `editTodo!.id`  
**Cause:** React evaluates JSX children eagerly before passing to component — `visible={false}` doesn't prevent evaluation  
**Fix:** Wrap nullable state sheets in conditional:
```tsx
{editTodo !== null && (
  <BottomSheet visible={!!editTodo} ...>
    {/* editTodo.id safe here */}
  </BottomSheet>
)}
```

### 3. Rules of Hooks violation
**Symptom:** React hooks error on navigation  
**Cause:** Early return placed before `useApp()` call  
**Fix:** All hooks must be called before any early return:
```typescript
// ✅ Correct order
const t = useTheme();
const { state } = useApp();   // ALL hooks first
const courseId = normalize(params.id);
// ... all useState calls ...
if (!courseId) return <Error />;   // Guards after all hooks
if (!state.ready) return <Spinner />;
```

### 4. SQLite migration for existing installs
**Symptom:** `no such column: archived` / `table notes has no column named template`  
**Cause:** `CREATE TABLE IF NOT EXISTS` never adds columns to existing tables  
**Fix:** Run `ALTER TABLE` per new column, each in try/catch:
```typescript
for (const sql of migrations) {
  try { db.runSync(sql); } catch (_) {} // already exists = OK
}
```

### 5. expo-file-system v18 API removed `documentDirectory`
**Symptom:** `Property 'documentDirectory' does not exist on type`  
**Cause:** `expo-file-system` v18 moved to class-based API  
**Fix:**
```typescript
// Old (broken)
const path = FileSystem.documentDirectory + 'file.json';
await FileSystem.writeAsStringAsync(path, content);

// New (expo-file-system/next)
const { File, Paths } = require('expo-file-system/next');
const file = new File(Paths.document, 'file.json');
file.write(content);
await Sharing.shareAsync(file.uri);
```

### 6. Zustand infinite re-render loop
**Symptom:** App freezes / infinite render cycle  
**Cause:** `.filter()` inside Zustand selector returns new array reference every render  
**Fix:** Replaced Zustand entirely with React Context + useReducer. State is read directly; derived values use `useMemo` in components.

---

## 13. Cozy Features

### Daily intention
- Modal shown automatically on first app open of the day (1.5s delay)
- 5 mood options: Great 😄 / Good 🙂 / Okay 😐 / Tired 😴 / Stressed 😤
- Intention text saved to `daily_intentions` table (UNIQUE on date)
- Displayed as a card on Home — tap to update anytime
- Feeds into end-of-day summary

### Study streak
- Updated on every app launch via `updateStreak()`
- Checks `last_date` in `study_streak` table vs today
- If last_date = yesterday → increment, else reset to 1
- Longest streak tracked separately
- Shown as a badge on the Home header

### Sticky notes
- Horizontal scrollable row on Home
- 6 pastel colors: yellow, green, blue, pink, lavender, orange
- Tap to open/edit, tap save with empty content → auto-deletes
- Persisted in `sticky_notes` table
- Up to 10 shown in the row (no hard limit in DB)

### Time-of-day header
- Morning (5–12): 🌅 warm amber
- Afternoon (12–17): ☀️ warm orange
- Evening (17–21): 🌆 purple
- Night (21–5): 🌙 blue
- Background tint, accent color, and emoji all change per period

### End-of-day summary
- Auto-shows at 9 PM if an intention was set today
- Shows: weekly tasks done, weekly pomodoro sessions, current streak
- "Great day! 🎉" button triggers sparkle ✨ particle effect

### Sparkle effect
- `Animated.Value` from 0→1 in 700ms
- Scale: 0.4 → 1.4 → 0.6
- translateY: 0 → -40px
- Opacity: 0 → 1 → 0
- Multiple can appear simultaneously, each self-removing from state

### Gratitude journal
- One tab inside every course folder
- Free-text entries, long press to delete
- Italic prompt text to encourage reflection
- Stored in `gratitude_entries` table with `course_id` FK

### Paper texture background
- 20 horizontal lines, 1px height, 18–24px spacing
- opacity: 0.03 — barely visible, just adds tactile feel
- `pointerEvents="none"` so it doesn't intercept touches

---

## 14. Install & Run

```bash
# 1. Unzip project
unzip studynest.zip && cd studynest

# 2. Install all dependencies
npm install

# 3. Install new native dependencies
npx expo install \
  expo-keep-awake \
  @expo-google-fonts/merriweather \
  @expo-google-fonts/eb-garamond \
  @expo-google-fonts/cormorant

# 4. Start (clear cache on first run)
npx expo start --clear

# 5. Build APK for Android testing
eas build --platform android --profile preview
```

**`eas.json` for APK builds:**
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

---

## 15. Architecture Decisions

### Why SQLite over AsyncStorage
AsyncStorage is key-value only — no relational queries, no foreign keys, no transactions. SQLite allows `JOIN`, `CASCADE DELETE`, `ORDER BY`, and proper schema migrations. For an app with 20 entity types and complex relationships, SQLite is the only viable choice.

### Why WAL mode
`PRAGMA journal_mode = WAL` (Write-Ahead Logging) allows concurrent reads during writes. Without it, a write locks the entire database — reads block. WAL makes the DB feel instant even during heavy writes.

### Why synchronous reads (`getAllSync`, `getFirstSync`)
Expo SQLite v15 introduced synchronous API. Using it in `loadAll()` means the entire app state is hydrated in one synchronous tick, before the first render. The alternative (async + multiple `await` calls) would cause multiple re-renders and potential race conditions between screen renders and data arrival.

### Why useMemo for derived data
```typescript
// In AppContext — state.todos contains ALL todos across all courses
// In CourseDetail — we need only this course's todos
const todos = useMemo(
  () => state.todos.filter(td => td.courseId === courseId),
  [state.todos, courseId]
);
// useMemo: only recomputes when state.todos or courseId changes
// Without it: recomputes on every render = O(n) filter on every keystroke
```

### Why no cloud sync
Privacy first. Students' academic data (grades, notes, intentions) is personal. Cloud sync adds: account management, network dependency, server costs, privacy risk, and complexity. Backup/restore via JSON file gives users full control with zero infrastructure.

### Why Expo Router (file-based) over React Navigation (manual)
Every screen is a file. No `Stack.Navigator` config to maintain. Deep linking works automatically. Type-safe routes with `typedRoutes: true`. The tradeoff is that params can arrive as `string | string[]` on Android — solved with the normalization pattern.

### Why all modals use custom BottomSheet
Android's native `Alert.alert` dialogs cannot be themed, don't follow the app's font/color, and feel jarring against a carefully designed UI. The custom `BottomSheet` uses `Modal` + `KeyboardAvoidingView` and matches every theme and font setting automatically.

---

*StudyNest v1.0.0 · Built with React Native + Expo · All data on-device · No cloud · No ads*
