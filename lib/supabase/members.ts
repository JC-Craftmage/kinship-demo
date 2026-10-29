// Loads the members of one church together with the assets they own.
//
// The dashboard's Member Directory and Assets Board show the same two tables
// from two angles, so the join lives here and both routes reuse it.
//
// Note the id spaces: `members.id` is a uuid, `members.user_id` is the Clerk
// user id, and `assets.owner_id` is that same Clerk user id. The directory
// shows `members.id`; assets are attributed through `user_id`.

import 'server-only';
import { supabase } from './server';
import { loadCampusNames, campusLabel } from './lookups';
import { mapAsset, mapMember } from '@/lib/board-mappers';
import type { Asset, AssetWithOwner, Member } from '@/lib/types';
import type { Database } from './types';

type MemberRow = Database['public']['Tables']['members']['Row'];
type AssetRow = Database['public']['Tables']['assets']['Row'];

export interface ChurchMembersBundle {
  members: Member[];
  /** Clerk user id -> member */
  membersByUserId: Map<string, Member>;
  /** Assets with their owner attached */
  assets: AssetWithOwner[];
}

export async function loadChurchMembers(churchId: string): Promise<ChurchMembersBundle> {
  const bundle: ChurchMembersBundle = {
    members: [],
    membersByUserId: new Map(),
    assets: [],
  };

  const { data: membershipRows, error: membershipError } = await supabase
    .from('church_members')
    .select('user_id, campus_id')
    .eq('church_id', churchId);

  if (membershipError) {
    console.error('loadChurchMembers failed:', membershipError.message);
    return bundle;
  }

  const userIds = [...new Set((membershipRows ?? []).map((row) => row.user_id))];

  let profiles: MemberRow[] = [];
  if (userIds.length) {
    const { data, error } = await supabase.from('members').select('*').in('user_id', userIds);
    if (error) {
      console.error('loadChurchMembers (profiles) failed:', error.message);
      return bundle;
    }
    profiles = (data ?? []) as MemberRow[];
  }

  const { data: assetRows, error: assetError } = await supabase
    .from('assets')
    .select('*')
    .eq('church_id', churchId);

  if (assetError) {
    console.error('loadChurchMembers (assets) failed:', assetError.message);
    return bundle;
  }

  const campusNames = await loadCampusNames(churchId);
  const campusByUser = new Map((membershipRows ?? []).map((row) => [row.user_id, row.campus_id]));
  const userIdByMemberId = new Map(profiles.map((profile) => [profile.id, profile.user_id]));

  // Kudos totals: sum of the amounts each member has received.
  // A missing table (migrations not applied yet) must not empty the whole
  // directory, so a failed read degrades to zero rather than aborting.
  const kudosByMember = new Map<string, number>();
  {
    const { data, error } = await supabase
      .from('kudos')
      .select('to_member_id, amount')
      .eq('church_id', churchId);

    if (error) {
      console.warn('loadChurchMembers (kudos totals) failed:', error.message);
    } else {
      for (const row of (data ?? []) as { to_member_id: string; amount: number }[]) {
        const amount = Number(row.amount);
        if (!Number.isFinite(amount)) continue;
        kudosByMember.set(row.to_member_id, (kudosByMember.get(row.to_member_id) ?? 0) + amount);
      }
    }
  }

  // assets.owner_id -> the assets that person owns
  const assetsByOwner = new Map<string, Asset[]>();
  for (const row of (assetRows ?? []) as AssetRow[]) {
    const asset = mapAsset(row);
    if (!asset) continue;
    const list = assetsByOwner.get(row.owner_id) ?? [];
    list.push(asset);
    assetsByOwner.set(row.owner_id, list);
  }

  bundle.members = profiles.map((profile) => {
    const campusId = campusByUser.get(profile.user_id);
    return mapMember(profile, {
      campusName: campusLabel(campusId ? campusNames.get(campusId) : undefined),
      assets: assetsByOwner.get(profile.user_id) ?? [],
      kudosCount: kudosByMember.get(profile.id) ?? 0,
    });
  });

  for (const member of bundle.members) {
    const userId = userIdByMemberId.get(member.id);
    if (userId) bundle.membersByUserId.set(userId, member);
  }

  for (const row of (assetRows ?? []) as AssetRow[]) {
    const asset = mapAsset(row);
    const owner = bundle.membersByUserId.get(row.owner_id);
    if (!asset || !owner) continue;
    bundle.assets.push({ ...asset, owner });
  }

  return bundle;
}
