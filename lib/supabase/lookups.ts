// Shared read-only lookups for the dashboard API routes.
//
// These helpers never widen a scope. Every caller passes the church id it
// already derived from the caller's own membership, and every query is
// filtered by that id.

import 'server-only';
import { supabase } from './server';

/** Campus id -> campus name for one church. */
export async function loadCampusNames(churchId: string): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  const { data, error } = await supabase
    .from('campuses')
    .select('id, name')
    .eq('church_id', churchId);

  if (error) {
    console.error('loadCampusNames failed:', error.message);
    return names;
  }
  for (const row of (data ?? []) as { id: string; name: string }[]) {
    names.set(row.id, row.name);
  }
  return names;
}

/** Clerk user id -> avatar emoji for the members of one church. */
export async function loadAvatars(userIds: string[]): Promise<Map<string, string>> {
  const avatars = new Map<string, string>();
  const unique = [...new Set(userIds.filter((id): id is string => Boolean(id)))];
  if (!unique.length) return avatars;

  const { data, error } = await supabase
    .from('members')
    .select('user_id, avatar')
    .in('user_id', unique);

  if (error) {
    console.error('loadAvatars failed:', error.message);
    return avatars;
  }
  for (const row of (data ?? []) as { user_id: string; avatar: string | null }[]) {
    avatars.set(row.user_id, row.avatar ?? '');
  }
  return avatars;
}

/** Fallback label for rows that are not attached to a campus. */
export const DEFAULT_CAMPUS = 'Main Campus';

export function campusLabel(name: string | null | undefined): string {
  return name && name.trim() ? name : DEFAULT_CAMPUS;
}
