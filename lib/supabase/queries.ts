// Shared authorization helpers for API routes.
//
// Database access runs through the service role client, which bypasses row
// level security. These helpers are the application-level authorization
// boundary: they resolve the Clerk user, look up church membership, and
// enforce role checks. Every lookup is scoped by BOTH user and church so a
// request can never reach another tenant's data by guessing an id.

import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { supabase } from './server';
import type { ChurchRole } from './types';

export interface ChurchMembership {
  id: string;
  user_id: string;
  church_id: string;
  campus_id: string | null;
  role: ChurchRole;
  joined_at: string;
}

/** Owners and overseers: full church administration. */
export const ADMIN_ROLES: ChurchRole[] = ['owner', 'overseer'];

/** Roles allowed to review join requests. */
export const REQUEST_REVIEW_ROLES: ChurchRole[] = ['moderator', 'overseer', 'owner'];

const MEMBERSHIP_COLUMNS = 'id, user_id, church_id, campus_id, role, joined_at';

/** Resolve the authenticated Clerk user id, or null when signed out. */
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}

/**
 * Membership for one specific church. Scoped by both `user_id` and
 * `church_id` so a membership id from another church never matches.
 */
export async function getMembership(
  userId: string,
  churchId: string
): Promise<ChurchMembership | null> {
  const { data, error } = await supabase
    .from('church_members')
    .select(MEMBERSHIP_COLUMNS)
    .eq('user_id', userId)
    .eq('church_id', churchId)
    .limit(1);

  if (error) {
    console.error('Error fetching church membership:', error);
    return null;
  }

  const rows = (data as ChurchMembership[]) ?? [];
  return rows.length > 0 ? rows[0] : null;
}

/**
 * First membership for a user across any church. Used for the
 * "one church per user" checks on create/join flows.
 */
export async function getAnyMembership(userId: string): Promise<ChurchMembership | null> {
  const { data, error } = await supabase
    .from('church_members')
    .select(MEMBERSHIP_COLUMNS)
    .eq('user_id', userId)
    .limit(1);

  if (error) {
    console.error('Error fetching church membership:', error);
    return null;
  }

  const rows = (data as ChurchMembership[]) ?? [];
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Membership only when the caller's role is in `allowedRoles`.
 * Returns null when the caller is not a member or lacks the role.
 */
export async function requireChurchRole(
  userId: string,
  churchId: string,
  allowedRoles: ChurchRole[]
): Promise<ChurchMembership | null> {
  const membership = await getMembership(userId, churchId);

  if (!membership) {
    return null;
  }

  if (!allowedRoles.includes(membership.role)) {
    return null;
  }

  return membership;
}

/**
 * Confirm a campus belongs to the given church. Prevents a caller from
 * attaching a campus id from a different church (cross-tenant write).
 */
export async function campusBelongsToChurch(
  campusId: string,
  churchId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('campuses')
    .select('id')
    .eq('id', campusId)
    .eq('church_id', churchId)
    .limit(1);

  if (error) {
    console.error('Error validating campus:', error);
    return false;
  }

  return ((data as { id: string }[]) ?? []).length > 0;
}
