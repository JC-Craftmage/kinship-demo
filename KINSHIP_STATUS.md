# Kinship — MVP Feature Summary

*Updated: 2026-04-19*

---

## ✅ Build Status

### Auth & Database
- [x] Clerk authentication — keys in `.env.local`
- [x] Supabase connected
- [x] Database schema — all tables created

### Core Features (MVP)
- [x] Life Events — create, track, notify
- [x] Help Requests (Needs Board) — post, browse, volunteer
- [x] Assets Directory — add, browse, request
- [x] Kudos — give, receive, celebrate
- [x] Group Notifications — church-wide alerts

### Supporting Infrastructure
- [x] Invite codes — generate, share, join
- [x] Join requests — request to join, admin approve/deny
- [x] Multi-campus support
- [x] Role-based access (owner, overseer, moderator, member)

### Support Infrastructure
- [x] Support bot — FAQ matching + ticket creation (`/api/support`)
- [x] Support tickets table (needs migration)
- [x] Admin support dashboard component
- [x] 10 FAQ entries covering common questions

---

## 📋 To Run Support Tickets

Execute the migration in Supabase:
```sql
-- Run: supabase/migrations/002_support_tickets.sql
```

---

## 🔜 Next Features (Post-MVP)

- [ ] Email notifications (life events, kudos, etc.)
- [ ] here.now hosting setup
- [ ] Support ticket comments/threads
- [ ] Analytics dashboard
- [ ] Mobile app (React Native or PWA)

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `components/features/support/support-bot.tsx` | User-facing FAQ + ticket bot |
| `components/features/support/support-admin.tsx` | Admin ticket management |
| `app/api/support/route.ts` | Support API endpoint |
| `supabase/migrations/002_support_tickets.sql` | DB migration for tickets |
| `DATABASE_SCHEMA.md` | Full schema docs |
| `competitor-research.md` | Sales positioning |