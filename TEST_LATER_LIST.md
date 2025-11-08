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

### 10. Safety Team Roster (Feature 1 of 5)
- **What:** Manage church safety team members with roles, specialties, and certifications
- **How to test:** Need church members to add to safety team
- **Location:** Settings → Safety Team (Owner/Overseer only)
- **Expected:**
  - View safety team roster with member details
  - Add members to team with role (Leader/Member)
  - Assign specialty (Medical/Security/Fire Safety/General)
  - Add certifications (CPR, First Aid, etc.)
  - Add emergency contact phone
  - Edit member details and active status
  - Remove members from team
  - Filter by active/inactive status
- **Database:** Requires migration `005_safety_team_system.sql` to be run in Supabase
- **Note:** This is part 1 of 5-part Safety Team system (Roster, Scheduling, Incidents, Protocols, Communications)

---

## Notes
- Most features require test data (multiple members, campuses, etc.)
- Some features are Owner-only, some Moderator+
- Safety Team feature requires database migration to be run in Supabase first
- Remind me to review this list periodically or when we have test data
