# 🔐 Clerk Authentication Setup Guide

## ✅ What Was Added

Authentication has been successfully integrated into Kinship using **Clerk**!

### Features Implemented:
- ✅ User sign-up and sign-in
- ✅ Protected dashboard routes
- ✅ User profile management
- ✅ Session management
- ✅ Sign out functionality
- ✅ Beautiful pre-built UI components

---

## 🚀 How to Get Started

### **Step 1: Create a Clerk Account**

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign up for a free account
3. Create a new application
4. Choose "Next.js" as your framework

### **Step 2: Get Your API Keys**

1. In the Clerk dashboard, go to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_...`)
3. Copy your **Secret Key** (starts with `sk_test_...`)

### **Step 3: Update Environment Variables**

Open `.env.local` and replace the placeholder keys:

```bash
# Replace these with your actual Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_key_here

# These routes are already configured (don't change)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home
```

### **Step 4: Restart the Dev Server**

```bash
npm run dev
```

---

## 📋 What's Protected

### **Public Routes (No Login Required):**
- `/` - Landing page
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page

### **Protected Routes (Login Required):**
- `/home` - Dashboard
- `/directory` - Member directory
- `/assets` - Assets registry
- `/meal-trains` - Meal trains
- `/needs` - Needs board

**If you try to access a protected route without being logged in, you'll be redirected to the sign-in page.**

---

## 🎯 How It Works

### **1. User Flow:**

```
Landing Page (/)
    ↓
Click "Get Started"
    ↓
Sign Up Page (/sign-up)
    ↓
Create Account
    ↓
Redirect to Dashboard (/home)
    ↓
Browse all features!
```

### **2. Authentication Components:**

| Component | Location | Purpose |
|-----------|----------|---------|
| **ClerkProvider** | `app/layout.tsx` | Wraps entire app |
| **Middleware** | `middleware.ts` | Protects routes |
| **SignIn** | `app/(auth)/sign-in/[[...sign-in]]/page.tsx` | Sign in UI |
| **SignUp** | `app/(auth)/sign-up/[[...sign-up]]/page.tsx` | Sign up UI |
| **UserButton** | `components/layout/navigation.tsx` | User menu |

### **3. How Routes Are Protected:**

The `middleware.ts` file automatically protects all routes except:
- `/` (landing page)
- `/sign-in/*` (sign in pages)
- `/sign-up/*` (sign up pages)

If a user tries to access `/home` without being logged in, they're automatically redirected to `/sign-in`.

---

## 👤 User Management Features

### **What Clerk Provides:**

✅ **Email/Password Authentication**
✅ **Social Login** (Google, GitHub, etc.) - Can be enabled in Clerk dashboard
✅ **Email Verification**
✅ **Password Reset**
✅ **User Profile Management**
✅ **Session Management**
✅ **2FA (Two-Factor Authentication)** - Optional

### **User Button Features:**

When signed in, click the user avatar to:
- View profile
- Manage account
- Sign out

---

## 🎨 Customization

### **Change Sign-In/Sign-Up Appearance:**

Edit the `appearance` prop in:
- `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `app/(auth)/sign-up/[[...sign-up]]/page.tsx`

Example:
```typescript
<SignIn
  appearance={{
    elements: {
      rootBox: 'mx-auto',
      card: 'shadow-2xl border-2 border-indigo-200',
      headerTitle: 'text-indigo-600',
      formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700',
    }
  }}
/>
```

### **Add Social Login:**

1. Go to Clerk Dashboard → **User & Authentication** → **Social Connections**
2. Enable Google, GitHub, Facebook, etc.
3. No code changes needed!

### **Customize Redirect URLs:**

Change where users go after sign-in/sign-up in `.env.local`:
```bash
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home
```

---

## 🔍 Accessing User Data

### **In Client Components:**

```typescript
import { useUser } from '@clerk/nextjs';

export function MyComponent() {
  const { user } = useUser();

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <p>Hello, {user.firstName}!</p>
      <p>Email: {user.emailAddresses[0].emailAddress}</p>
    </div>
  );
}
```

### **In Server Components:**

```typescript
import { currentUser } from '@clerk/nextjs/server';

export default async function MyPage() {
  const user = await currentUser();

  if (!user) return <div>Not authenticated</div>;

  return <div>Hello, {user.firstName}!</div>;
}
```

---

## 🛠️ Advanced Features (Future)

### **Role-Based Access Control (RBAC):**

You can assign roles to users (Admin, Member, Pastor, etc.) in Clerk:

```typescript
import { auth } from '@clerk/nextjs/server';

export default async function AdminPage() {
  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role;

  if (role !== 'admin') {
    return <div>Access Denied</div>;
  }

  return <div>Admin Dashboard</div>;
}
```

### **Organizations (Multi-Tenancy):**

Clerk supports organizations for multi-church support:
- Each church = One organization
- Members can belong to multiple churches
- Separate data per organization

---

## 📊 What Changed in the Code

### **Files Added:**
```
✅ .env.local                                    - Environment variables
✅ .env.example                                  - Example env file
✅ middleware.ts                                 - Route protection
✅ app/(auth)/sign-in/[[...sign-in]]/page.tsx  - Sign in page
✅ app/(auth)/sign-up/[[...sign-up]]/page.tsx  - Sign up page
✅ app/(auth)/layout.tsx                        - Auth layout
✅ AUTH_SETUP.md                                - This file!
```

### **Files Modified:**
```
✅ app/layout.tsx                    - Added ClerkProvider
✅ app/(marketing)/page.tsx           - Added sign-in/sign-up buttons
✅ components/layout/navigation.tsx   - Added user info & UserButton
```

---

## ✅ Testing Checklist

1. **Visit Landing Page:**
   - [ ] See "Sign In" and "Get Started" buttons
   - [ ] Not logged in yet

2. **Click "Get Started":**
   - [ ] Redirected to `/sign-up`
   - [ ] See beautiful sign-up form
   - [ ] Kinship branding visible

3. **Create Account:**
   - [ ] Fill out form (email, password, name)
   - [ ] Account created
   - [ ] Email verification sent (if enabled)

4. **After Sign Up:**
   - [ ] Redirected to `/home` (dashboard)
   - [ ] See user info in navigation
   - [ ] Can access all dashboard features

5. **Click User Avatar:**
   - [ ] User menu appears
   - [ ] Can view profile
   - [ ] Can sign out

6. **Sign Out:**
   - [ ] Clicked "Sign Out"
   - [ ] Redirected to landing page
   - [ ] No longer can access `/home` directly

7. **Sign In Again:**
   - [ ] Go to `/sign-in`
   - [ ] Enter credentials
   - [ ] Successfully logged in
   - [ ] Back to dashboard

---

## 🚨 Troubleshooting

### **"Invalid API Key" Error:**
- Make sure you copied the keys correctly from Clerk dashboard
- Check for extra spaces or newlines
- Restart the dev server after changing `.env.local`

### **Redirected to Sign-In Unexpectedly:**
- This is normal! The middleware is protecting your routes
- Make sure you're signed in to access dashboard pages

### **Sign-Up Form Not Showing:**
- Check that `@clerk/nextjs` is installed: `npm list @clerk/nextjs`
- Make sure middleware.ts is in the root directory
- Restart dev server

### **"Cannot find module '@clerk/nextjs'" Error:**
```bash
npm install @clerk/nextjs
```

---

## 🎉 You're All Set!

Authentication is now fully integrated into Kinship. Users can:
- ✅ Sign up for an account
- ✅ Sign in securely
- ✅ Access protected features
- ✅ Manage their profile
- ✅ Sign out

**Next Steps:**
- Connect users to member profiles
- Add role-based permissions
- Enable social login
- Set up organizations for multi-church support

---

## 📚 Resources

- **Clerk Documentation:** https://clerk.com/docs
- **Clerk Dashboard:** https://dashboard.clerk.com
- **Next.js Integration:** https://clerk.com/docs/quickstarts/nextjs
- **Customization Guide:** https://clerk.com/docs/components/customization

---

**Status:** ✅ Authentication Complete!
**Package:** `@clerk/nextjs`
**Version:** Latest
**Setup Time:** ~10 minutes with API keys
