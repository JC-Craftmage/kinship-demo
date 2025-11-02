# Kinship Database Schema

## Overview
Multi-tenant church community platform with role-based access control.

## Tables

### 1. churches
Primary table for church organizations.

```sql
churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id TEXT NOT NULL, -- Clerk user ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Indexes:**
- `owner_id` for quick lookup of churches by owner

---

### 2. campuses
Church campuses/locations.

```sql
campuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Indexes:**
- `church_id` for quick campus lookups per church

---

### 3. church_members
User membership and roles within churches/campuses.

```sql
church_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL, -- Clerk user ID
  role TEXT NOT NULL CHECK (role IN ('owner', 'overseer', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_id, user_id)
)
```

**Indexes:**
- `church_id` for church member lookups
- `user_id` for user's church memberships
- `campus_id` for campus member lists

**Notes:**
- Users can only be in ONE church at a time
- `campus_id` can be NULL for church-level roles (owner)
- Owners have access across all campuses

---

### 4. campus_overseers
Assignment table for overseers managing specific campuses.

```sql
campus_overseers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_member_id UUID NOT NULL REFERENCES church_members(id) ON DELETE CASCADE,
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_member_id, campus_id)
)
```

**Notes:**
- Only for users with 'overseer' role
- Overseers can manage multiple campuses

---

### 5. invite_codes
Invitation codes for joining churches/campuses.

```sql
invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_by TEXT NOT NULL, -- Clerk user ID
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Indexes:**
- `code` for quick invite lookups (already unique)
- `church_id, campus_id` for management UI

**Notes:**
- `campus_id` NULL = church-wide invite
- `max_uses` NULL = unlimited uses
- `expires_at` NULL = never expires

---

### 6. members (User Profiles)
Extended user profile information.

```sql
members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE, -- Clerk user ID
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  phone TEXT,
  bio TEXT,
  job_title TEXT,
  company TEXT,
  skills TEXT[], -- Array of skills
  interests TEXT[], -- Array of interests
  seeking_work BOOLEAN DEFAULT FALSE,
  looking_for_groups TEXT[], -- Array of group types
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Indexes:**
- `user_id` (already unique)

---

### 7. assets
Church/campus assets available for use.

```sql
assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  owner_id TEXT NOT NULL, -- Clerk user ID of asset owner
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  availability TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Indexes:**
- `church_id, campus_id` for filtering
- `owner_id` for user's assets

---

### 8. meal_trains
Meal train coordination.

```sql
meal_trains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  recipient_situation TEXT NOT NULL,
  recipient_dietary TEXT,
  recipient_address TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by TEXT NOT NULL, -- Clerk user ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

---

### 9. meal_signups
Individual meal sign-ups within meal trains.

```sql
meal_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_train_id UUID NOT NULL REFERENCES meal_trains(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID
  user_name TEXT NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meal_train_id, date)
)
```

---

### 10. needs
Community needs board.

```sql
needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'fulfilled', 'cancelled')),
  posted_by TEXT NOT NULL, -- Clerk user ID
  posted_by_name TEXT NOT NULL,
  deadline DATE,
  volunteers_needed INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

---

### 11. need_volunteers
Volunteers signed up for needs.

```sql
need_volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID
  user_name TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'declined')),
  volunteered_at TIMESTAMPTZ DEFAULT NOW()
)
```

---

## Role Permissions

### Owner
- Full access to all church data and settings
- Create/delete campuses
- Promote/demote any member
- Delete the church
- Generate invite codes for any campus

### Overseer
- Manage assigned campus(es)
- Promote members to moderator within their campus(es)
- Generate invite codes for their campus(es)
- View all campus data
- Cannot delete church or modify other campuses

### Moderator
- Manage content (assets, meal trains, needs) for their campus
- Cannot promote users
- Cannot generate invite codes
- Cannot modify campus settings

### Member
- View church/campus content
- Participate in meal trains, needs board
- Add personal assets
- Cannot manage other users or campus settings

---

## Data Scoping

**Church-Level Data:**
- Owned by church, visible across all campuses
- `campus_id` = NULL

**Campus-Level Data:**
- Owned by specific campus
- `campus_id` = specific campus UUID

**User Queries:**
- Members see only their campus data by default
- Overseers see their assigned campus(es) data
- Owners see all church data
