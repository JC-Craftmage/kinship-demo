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

### 3. Church Visibility Toggle
- **What:** Make church Public (searchable) or Private (invite-only)
- **How to test:** Toggle setting, then search for church while logged out
- **Location:** Settings → "Church Visibility" section (Owner only)
- **Expected:** Church appears/disappears from search based on setting
- **Status:** Section not appearing - needs debugging

### 4. Analytics Dashboard
- **What:** View church statistics and growth metrics
- **How to test:** View dashboard with existing data
- **Location:** Settings → "Analytics Dashboard" button (Owner only)
- **Expected:** Member counts, join requests, campus stats, growth charts
- **Status:** Not appearing in Settings - needs debugging

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

---

## Notes
- Most features require test data (multiple members, campuses, etc.)
- Some features are Owner-only, some Moderator+
- Remind me to review this list periodically or when we have test data
