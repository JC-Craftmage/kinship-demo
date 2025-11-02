# Kinship Role-Based Access Control System

## Overview

Kinship now includes a complete multi-tenant church management system with role-based access control (RBAC). Each church operates independently with its own campuses, members, and content.

## Role Hierarchy

### 1. Church Owner
- **Full access** to all church settings and data
- Can create and delete campuses
- Can promote/demote any member to any role
- Recommended to have 1-3 owners for redundancy

### 2. Campus Overseer
- Manages specific campus(es)
- Can promote members to Moderator within their campus
- Can generate invite codes for their campus
- Cannot modify other campuses or church-wide settings

### 3. Campus Moderator
- Helps manage content (meal trains, needs, assets) in their campus
- Cannot promote users or generate invites
- Can create and edit content

### 4. Member (Default)
- Can view and participate in church activities
- Can add personal assets
- Can volunteer for needs and sign up for meal trains

## Setup Instructions

### Step 1: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Go to **Project Settings** → **API**
4. Copy your **Project URL** and **anon/public key**
5. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### Step 2: Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `/supabase/migrations/001_initial_schema.sql`
3. Copy the entire SQL content
4. Paste it into the Supabase SQL Editor
5. Click **Run** to create all tables

This will create:
- `churches` - Church organizations
- `campuses` - Physical locations
- `church_members` - User memberships and roles
- `campus_overseers` - Overseer assignments
- `invite_codes` - Join invitations
- `members` - User profiles
- `assets`, `meal_trains`, `meal_signups`, `needs`, `need_volunteers` - Feature tables

### Step 3: Update Vercel Environment Variables

Add the Supabase variables to your Vercel project:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add these variables for **Production**, **Preview**, and **Development**:
   ```
   NEXT_PUBLIC_SUPABASE_URL = your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key
   ```

3. Also update the Clerk redirect URLs:
   ```
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = /welcome
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = /welcome
   ```

4. Redeploy your application

## User Flows

### Flow 1: Creating a New Church

1. User signs up / signs in
2. Redirected to `/welcome`
3. Clicks "Create a Church"
4. Fills in church name and first campus details
5. Becomes Church Owner
6. Prompted to add 1-3 co-leaders (recommended)
7. Can generate invite code with QR code
8. Redirected to dashboard

### Flow 2: Joining an Existing Church

1. User signs up / signs in
2. Redirected to `/welcome`
3. Clicks "Join a Church"
4. Enters invite code (or scans QR code - coming soon)
5. Joins as Member of the specified campus
6. Redirected to dashboard

### Flow 3: Promoting Members

(Coming in next update - Admin Dashboard)

Church Owners and Overseers will be able to:
- View all members in their church/campus
- Promote members to higher roles
- Demote members if needed
- Generate and manage invite codes

## File Structure

### Core Files Created

**Database & Types:**
- `DATABASE_SCHEMA.md` - Full database documentation
- `supabase/migrations/001_initial_schema.sql` - Migration file
- `lib/supabase/client.ts` - Supabase client configuration
- `lib/supabase/types.ts` - TypeScript database types

**Authentication & Permissions:**
- `lib/auth/permissions.ts` - Role permission utilities
- `hooks/use-church-membership.ts` - Church membership hook

**API Routes:**
- `app/api/churches/create/route.ts` - Create church endpoint
- `app/api/invites/generate/route.ts` - Generate invite code
- `app/api/invites/join/route.ts` - Join with invite code

**UI Pages:**
- `app/welcome/page.tsx` - Choose create/join church
- `app/welcome/create-church/page.tsx` - Church creation form
- `app/welcome/join-church/page.tsx` - Join with code
- `app/welcome/add-leadership/page.tsx` - Add co-leaders

**Updated Files:**
- `app/(dashboard)/home/page.tsx` - Now checks church membership
- `.env.local` - Added Supabase config, updated redirects
- `.env.example` - Updated with new variables

## Permission Utilities

Use the permission utilities in your components:

```typescript
import { useChurchMembership } from '@/hooks/use-church-membership';
import { canManageMembers, canCreateInvites } from '@/lib/auth/permissions';

function MyComponent() {
  const { membership, role } = useChurchMembership();

  if (canManageMembers(role)) {
    // Show member management UI
  }

  if (canCreateInvites(role)) {
    // Show invite generation UI
  }
}
```

## Data Scoping

### Church-Level Data
Set `campus_id` to `NULL` for church-wide content visible across all campuses.

### Campus-Level Data
Set `campus_id` to a specific campus UUID for campus-specific content.

### User Queries
- **Members**: See only their campus by default
- **Overseers**: See their assigned campus(es)
- **Owners**: See all church data

## Security Notes

⚠️ **Important**: Row Level Security (RLS) is currently **DISABLED** for development. Before going to production:

1. Enable RLS on all tables
2. Create policies for each role
3. Test thoroughly with different roles
4. See Supabase docs: https://supabase.com/docs/guides/auth/row-level-security

## Next Steps

### Recommended Features to Build:

1. **Admin Dashboard** (High Priority)
   - View all members
   - Promote/demote users
   - Manage campuses
   - View and manage invite codes

2. **Role-Based UI** (High Priority)
   - Show/hide features based on role
   - Add "Admin" tab in navigation for owners/overseers
   - Campus selector for overseers managing multiple campuses

3. **Data Filtering** (High Priority)
   - Update existing features (directory, assets, needs, meal trains) to:
     - Filter by church_id and campus_id
     - Save data with correct church/campus association
     - Respect user's campus scope

4. **QR Code Scanning** (Medium Priority)
   - Implement camera-based QR code scanner
   - Mobile-friendly invite flow

5. **Campus Management** (Medium Priority)
   - Create new campuses
   - Edit campus details
   - Assign overseers to campuses

6. **User Profiles** (Low Priority)
   - Create/edit member profiles
   - Sync with Clerk user data

## Troubleshooting

### "You are already a member of a church"
Users can only belong to ONE church at a time. To test multiple churches, use different Clerk accounts.

### "Invalid or expired invite code"
Check that:
- The code exists in the database
- `is_active` is `true`
- `expires_at` is null or in the future
- `current_uses` < `max_uses` (if max_uses is set)

### Database connection errors
Verify:
- Supabase URL and anon key are correct
- Supabase project is running
- Migration has been executed successfully

## Support

For questions or issues:
1. Check the `DATABASE_SCHEMA.md` for table structure
2. Review the API routes for endpoint details
3. See Supabase logs in dashboard for database errors
4. Check browser console for client-side errors
