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

### 15. Ministries System - IN PROGRESS
- **What:** Comprehensive ministries management with scheduling, volunteers, and ministry-specific features
- **Database:** Requires migration `006_ministries_system.sql` to be run in Supabase
- **Default Ministries Created for All Churches:**
  1. Children's Ministry (with age groups)
  2. Worship Team (with instruments tracking)
  3. Sound Team
  4. Security Team (integrates with Safety Team)
  5. Cafe Ministry
  6. Celebrate Recovery
  7. Singles Ministry
  8. Single Parents Ministry

**Ministries Features Built So Far:**
- ✅ Database migration with 8 default ministries
- ✅ API: List ministries (GET /api/churches/[id]/ministries)
- ✅ API: Create custom ministry (POST /api/churches/[id]/ministries)
- ✅ API: Update ministry (PUT /api/churches/[id]/ministries/[ministryId])
- ✅ API: Delete ministry (DELETE /api/churches/[id]/ministries/[ministryId])

**Still To Build:**
- ⏳ Ministry Volunteers API and UI
- ⏳ Ministry Scheduling API and UI
- ⏳ Children's Ministry age groups UI
- ⏳ Worship Team instruments UI
- ⏳ Sound Team page
- ⏳ Cafe page
- ⏳ Celebrate Recovery page
- ⏳ Singles Groups page
- ⏳ Single Parents Ministry page
- ⏳ Main Ministries overview page
- ⏳ Navigation links

---

## Notes
- Most features require test data (multiple members, campuses, etc.)
- Some features are Owner-only, some Moderator+
- **Safety Team** requires migration `005_safety_team_system.sql`
- **Ministries** requires migration `006_ministries_system.sql`
- Remind me to review this list periodically or when we have test data
