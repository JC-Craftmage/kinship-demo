# KINSHIP - TEST LATER LIST

This is a master list of features to test when you have time or when we reach a good checkpoint.

## Features Awaiting Testing

### 1. Member Profiles
- **What:** Click any member name in Manage Members to see detailed profile
- **How to test:** Need multiple members in the church first
- **Location:** Manage Members → Click member name
- **Expected:** Full profile page with role, campus, join date, permissions

### 2. Campus Assignment
- **What:** Assign members to specific campuses
- **How to test:** Need campuses created AND members in church
- **Location:** Manage Members → "Campus" button on each member
- **Expected:** Modal to select campus or leave unassigned

### 3. Church Visibility Toggle ✅ UI VERIFIED
- **What:** Make church Public (searchable) or Private (invite-only)
- **How to test:** Toggle setting, then search for church while logged out
- **Location:** Settings → "Church Visibility" section (Owner only)
- **Expected:** Church appears/disappears from search based on setting
- **Status:** UI working, needs logged-out search test

### 4. Analytics Dashboard ✅ UI VERIFIED
- **What:** View church statistics and growth metrics
- **How to test:** View dashboard with existing data
- **Location:** Settings → "Analytics Dashboard" button (Owner only)
- **Expected:** Member counts, join requests, campus stats, growth charts
- **Status:** UI working, needs test with real data

### 5. QR Code Generator
- **What:** Generate invite codes with QR codes
- **Location:** Settings → Manage Invite Codes
- **Expected:** Create codes, see QR codes, download, copy links

### 6. Request History
- **What:** View all join requests (approved/denied/pending)
- **Location:** Settings → Request History
- **Expected:** Full history with filters and search

### 7. Bulk Member Actions
- **What:** Select multiple members to change roles or remove
- **How to test:** Need multiple members
- **Location:** Manage Members → Select checkboxes
- **Expected:** Bulk action toolbar appears

### 8. Campus Management
- **What:** Add/Edit/Delete campuses
- **Location:** Settings → Manage Campuses
- **Expected:** CRUD operations for campuses

### 9. Departure History
- **What:** View members who left and why
- **How to test:** Need someone to leave church first
- **Location:** Settings → Departure History
- **Expected:** List of departed members with reasons

### 10. Safety Team Roster (Feature 1 of 5) ✅ PUSHED
- **What:** Manage church safety team members with roles, specialties, and certifications
- **How to test:** Need church members to add to safety team
- **Location:** Settings → Safety Team (Owner/Overseer only)
- **Database:** Requires migration `005_safety_team_system.sql` to be run in Supabase

### 11. Safety Team Scheduling (Feature 2 of 5) ✅ PUSHED
- **What:** Schedule safety team members for services and events with calendar view
- **How to test:** Need safety team members created first
- **Location:** Safety Team → Schedules tab
- **Database:** Uses safety_schedules table from migration 005

### 12. Safety Team Incident Reporting (Feature 3 of 5 - ADMIN ONLY) ✅ PUSHED
- **What:** Document and track safety incidents (medical, security, accidents, etc.)
- **How to test:** Must be admin (Owner/Overseer/Moderator)
- **Location:** Safety Team → Incidents tab (only visible to admins)
- **Database:** Uses incident_reports table from migration 005
- **Note:** This feature is ADMIN ONLY per user request

### 13. Emergency Protocols (Feature 4 of 5) - IN PROGRESS
- **What:** View 7 default emergency protocols and create custom ones
- **Status:** Database ready with default protocols, UI not built yet
- **Database:** Uses emergency_protocols table from migration 005

### 14. Safety Team Communications (Feature 5 of 5) - NOT STARTED
- **What:** Alert system for safety team members
- **Status:** Database ready, UI not built yet
- **Database:** Uses safety_alerts table from migration 005

### 15. Ministries System ✅ BACKEND COMPLETE + OVERVIEW UI
- **What:** Comprehensive ministries management with scheduling, volunteers, and ministry-specific features
- **Location:** Settings → Ministries (Owner/Overseer)
- **Database:** Requires migration `006_ministries_system.sql` to be run in Supabase

**8 Default Ministries Auto-Created:**
  1. **Children's Ministry** (pink) - with 5 default age groups (Nursery → Elementary)
  2. **Worship Team** (purple) - with instrument tracking (14 instrument types)
  3. **Sound Team** (blue) - for audio/tech volunteers
  4. **Security Team** (red) - integrates with Safety Team
  5. **Cafe Ministry** (yellow) - hospitality volunteers
  6. **Celebrate Recovery** (green) - recovery program
  7. **Singles Ministry** (indigo) - single adults fellowship
  8. **Single Parents Ministry** (teal) - support for single parents

**✅ COMPLETED APIs (All Tested & Pushed):**

Ministry Management (4 endpoints):
- GET /api/churches/[id]/ministries - List all with volunteer counts
- POST /api/churches/[id]/ministries - Create custom ministry
- PUT /api/churches/[id]/ministries/[ministryId] - Update details
- DELETE /api/churches/[id]/ministries/[ministryId] - Delete custom

Volunteer Management (4 endpoints):
- GET /api/churches/[id]/ministries/[ministryId]/volunteers - List volunteers
- POST /api/churches/[id]/ministries/[ministryId]/volunteers - Add volunteer
- PUT /api/churches/[id]/ministries/[ministryId]/volunteers/[volunteerId] - Update
- DELETE /api/churches/[id]/ministries/[ministryId]/volunteers/[volunteerId] - Remove

Ministry Scheduling (4 endpoints):
- GET /api/churches/[id]/ministries/[ministryId]/schedules - List with filters
- POST /api/churches/[id]/ministries/[ministryId]/schedules - Create (with conflict detection)
- PUT /api/churches/[id]/ministries/[ministryId]/schedules/[scheduleId] - Update
- DELETE /api/churches/[id]/ministries/[ministryId]/schedules/[scheduleId] - Delete

Children's Age Groups (4 endpoints):
- GET /api/churches/[id]/ministries/[ministryId]/age-groups - List groups
- POST /api/churches/[id]/ministries/[ministryId]/age-groups - Create group
- PUT /api/churches/[id]/ministries/[ministryId]/age-groups/[ageGroupId] - Update
- DELETE /api/churches/[id]/ministries/[ministryId]/age-groups/[ageGroupId] - Delete

Worship Team Instruments (4 endpoints):
- GET /api/churches/[id]/ministries/[ministryId]/worship-team - List with instruments
- POST /api/churches/[id]/ministries/[ministryId]/worship-team - Add member
- PUT /api/churches/[id]/ministries/[ministryId]/worship-team/[worshipMemberId] - Update
- DELETE /api/churches/[id]/ministries/[ministryId]/worship-team/[worshipMemberId] - Remove

**✅ COMPLETED UI:**
- Main Ministries overview page (/ministries) with color-coded ministry cards
- Navigation link in Settings (Owner/Overseer only)
- Shows volunteer counts, leader names, contact info per ministry

**⏳ Still To Build (UI Only - APIs Done!):**
- Individual ministry detail pages with tabs (Overview, Volunteers, Schedule, Settings)
- Volunteer management interface (add/remove members, assign roles)
- Interactive scheduling calendar with drag-and-drop
- Children's age groups editor
- Worship team instruments selector
- Ministry-specific settings pages

**Key Features:**
- Conflict detection prevents double-booking volunteers
- Background check and training tracking for volunteers
- Service type tracking (Sunday AM, Wednesday, events, etc.)
- Role assignments per schedule (e.g., "Lead Guitar")
- Status tracking (scheduled, completed, cancelled, no-show)
- Active/inactive volunteer management
- Custom ministry creation (in addition to 8 defaults)
- Default ministries can only be deactivated, not deleted

---

## Notes
- Most features require test data (multiple members, campuses, etc.)
- Some features are Owner-only, some Moderator+
- **Safety Team** requires migration `005_safety_team_system.sql`
- **Ministries** requires migration `006_ministries_system.sql`
- Remind me to review this list periodically or when we have test data
