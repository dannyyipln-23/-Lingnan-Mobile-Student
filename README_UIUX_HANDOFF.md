# LU Mobile Student - Logic-Only Page Handoff

This document describes the current app behavior and interaction logic so another AI or designer can redesign the UI/UX without changing core behavior.

Scope:
- Functions and logic only
- No API endpoint details
- No mock data details

## 1) App Flow and Routing

File: src/App.tsx

Current tab routes:
- Home
- Calendar
- Campus
- Setting

Top-level logic:
- Owns active tab state.
- Owns modal visibility state for Library Booking and Notifications.
- Renders a global phone-shell layout with:
  - Top bar: student header
  - Bottom bar: tab navigation
  - Main area: selected page by tab
- Always mounts global overlays/components:
  - Library booking modal
  - Notification modal
  - In-app browser

## 2) Active Pages

### 2.1 Home Page
File: src/components/HomeTab.tsx

Purpose:
- Student dashboard for quick actions and daily status.

State:
- checkedInCourses map
- toastMessage

Key logic:
- Check-in action marks selected course as checked in.
- Check-in action shows temporary success toast and auto-clears.
- Renders next-class card with conditional check-in button/status.
- Shortcut buttons navigate to:
  - Calendar
  - Campus
  - Library booking modal
- Includes static progress and campus status sections for quick glance info.

### 2.2 Calendar Page
File: src/components/TimetableTab.tsx

Purpose:
- Course calendar and personal study task management.

State:
- viewMode: weekly or monthly
- calendarAnchor month
- selectedWeek
- selectedDay
- selectedDate
- activeCourse (for detail modal)
- tasks list
- newTaskInput

Key logic:
- Switches between Weekly and Monthly calendar views.
- Month navigation updates anchor month and resets selected date context.
- Weekly view:
  - Select week
  - Select weekday
  - Shows class count per weekday
- Monthly view:
  - Shows month grid
  - Disables weekend selection
  - Selects date to drive course list
- Course list is filtered by selected day of week.
- Empty-state card appears if no classes for selected day.
- Course card click opens detail modal.
- Course detail modal shows class/instructor/credits/assignment meta and closes on action.
- Task section supports:
  - Toggle done/undone
  - Add new task from input
  - Pending count display

### 2.3 Campus Page
File: src/components/CampusLifeTab.tsx

Purpose:
- Central launchpad for campus systems and academic flows.

State:
- activeAcademicPage key

Top-level behavior:
- If activeAcademicPage is selected:
  - Replaces hub with dedicated academic flow page
  - Back action returns to Campus hub
- If no activeAcademicPage:
  - Shows grouped journey section
  - Shows pinned tools
  - Shows grouped application cards (academic/admin/campus/external)

Grouped journey logic (current structure):
- Course
  - Course outline and curriculum overview
  - Enrolled courses and class schedule
- Assignment
  - Moodle assignments dashboard entry
  - Moodle submission status entry
- Examation
  - Exam timetable entry
  - Early grade release entry
- Academic results
  - Academic results and GPA summary entry
  - Graduation/degree progress entry

Interaction rules:
- Active cards trigger one of:
  - Open academic flow
  - Open in-app browser
  - Open library modal
- Disabled cards are non-interactive and show lock state.

### 2.4 Setting Page
File: src/components/SettingsTab.tsx

Purpose:
- User preference and account/profile settings view.

State:
- No local state.
- Uses global app preference context for font size.

Key logic:
- Font size actions update persisted global preference.
- Other rows are currently display-oriented controls (UI placeholders for future behavior).

## 3) Academic Flow Pages (Launched from Campus)

These flows share a common interaction pattern:
- Initial loading state
- Error state with retry/back action
- Multi-step local navigation (list -> detail)
- Back button goes one step up, then exits to Campus when at root

### 3.1 My Academic Results Flow
File: src/components/academic/MyAcademicResultsFlow.tsx

Logic:
- Term selection -> course list -> course result detail
- Holds selected term and selected course in state
- Conditionally renders term picker, list screen, or detail screen

### 3.2 My Class Schedule Flow
File: src/components/academic/MyClassScheduleFlow.tsx

Logic:
- Term selection -> registered class list -> class detail
- Holds selected term and selected class in state
- Computes total displayed credits from selected list items

### 3.3 My Exam Timetable Flow
File: src/components/academic/MyExamTimetableFlow.tsx

Logic:
- Term selection -> exam list -> exam detail
- Holds selected term and selected exam in state
- Detail actions can trigger calendar/event behavior and open external map/planning links

### 3.4 Early Grade Release Flow
File: src/components/academic/EarlyGradeReleaseFlow.tsx

Logic:
- Term selection -> course release list -> release detail
- Holds selected term and selected course in state
- Conditional status rendering for release readiness and window info

### 3.5 My Graduation Requirements Flow
File: src/components/academic/MyGraduationRequirementsFlow.tsx

Logic:
- Requirements overview -> academic history list -> term detail
- Computes completion percentage and status chips from requirement counters
- Holds selected history item for detail view

## 4) Shared Academic Flow Building Blocks

### 4.1 Academic Flow Shell
File: src/components/academic/AcademicFlowShell.tsx

Logic:
- Reusable themed wrapper for all academic flow pages
- Provides consistent page title, subtitle area, and back action framing

### 4.2 Term Picker
File: src/components/academic/TermPicker.tsx

Logic:
- Stateless selector list for terms
- Notifies parent on term select

### 4.3 Flow List Card
File: src/components/academic/FlowListCard.tsx

Logic:
- Stateless list-row/card presenter
- Optional metadata/status presentation
- Click callback delegated to parent flow

### 4.4 Detail Section
File: src/components/academic/DetailSection.tsx

Logic:
- Renders titled detail groups consistently
- Supports plain text rows and actionable link rows
- Link actions delegate to global in-app browser handler

### 4.5 Calendar Utilities
File: src/components/academic/calendarUtils.ts

Logic:
- Utility helpers for date formatting/normalization used by academic flow screens
- Keeps date display logic consistent across flows

## 5) Global Shell, Header, Navigation, and Overlays

### 5.1 Mobile Frame
File: src/components/MobileFrame.tsx

Logic:
- Wraps the whole app in a mobile viewport shell
- Composes optional top and bottom bars
- Maintains live device-style clock display via interval updates

### 5.2 Student Header
File: src/components/StudentHeader.tsx

Logic:
- Displays student identity snapshot and notification trigger
- Calls parent callback on notification tap
- Conditionally shows unread badge when count > 0

### 5.3 Bottom Navigation
File: src/components/NavigationBottomBar.tsx

Logic:
- Stateless tab bar
- Emits selected tab to parent
- Highlights active tab and optional attention marker on setting

### 5.4 Library Booking Modal
File: src/components/LibraryBookingModal.tsx

Logic:
- Controlled by parent open/close props
- Local form state:
  - floor
  - seat
  - time slot
  - booking status
- Confirm action shows success state then closes after a short delay

### 5.5 Notification Modal
File: src/components/NotificationModal.tsx

Logic:
- Controlled by parent open/close props
- Renders notification list and timestamps
- Close and mark-all-read actions currently dismiss modal

### 5.6 In-App Browser
File: src/components/InAppBrowser.tsx

Logic:
- Global overlay driven by app preference context
- Opens when browser target exists in context
- Tracks iframe loading state
- Supports close and open-in-external-browser actions

## 6) Global Context

### App Preferences Context
Files:
- src/context/AppPreferencesContext.tsx
- src/main.tsx

Logic:
- Provides global shared UI preferences (for example font size)
- Provides global in-app browser open/close controls
- Persists preference updates and exposes helper methods to child components

## 7) Components Present But Not Currently Routed

These components exist in codebase but are not currently mounted by App routing.

### 7.1 Events Page
File: src/components/EventsTab.tsx

Logic:
- Event listing page with loading, refresh, and failure handling
- Includes category/grouping and expandable detail behavior

### 7.2 Shuttle Bus Page
File: src/components/ShuttleBusTab.tsx

Logic:
- Transit status page with arrivals/ETA presentation
- Maintains loading/error/status states
- Supports refresh actions and conditional error/empty/success sections

### 7.3 Student Card Page
File: src/components/StudentCardTab.tsx

Logic:
- Digital student card interactions
- Mode switching for code display
- Live timestamp updates
- Simulated tap/auth flow with progress and success states

### 7.4 Generic Academic System Page
File: src/components/AcademicSystemPage.tsx

Logic:
- Generic fallback academic page for tabular/summary view patterns
- Includes selected-term switching and load/error/empty handling
- Imported by Campus page as defensive fallback, but currently not reachable from mapped launch paths

## 8) Behavior Constraints For UI/UX Redesign

If redesigning visuals, preserve these behaviors:
- Keep tab routing contract and active tab keys intact.
- Keep modal control ownership in App.
- Keep Campus academic-flow replacement behavior (hub -> flow -> back to hub).
- Keep multi-step state model in academic flows.
- Keep In-App Browser as the unified external-content surface.
- Keep success/error/loading/empty states in all page flows.
- Keep check-in, task toggle/add, and date-selection interactions on Home/Calendar.
