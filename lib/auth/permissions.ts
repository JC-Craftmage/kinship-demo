// Role-based permission utilities

import type { ChurchRole } from '../supabase/types';

export type { ChurchRole };

/**
 * Permission definitions for each role
 */
export const ROLE_PERMISSIONS = {
  owner: {
    // Church management
    deleteChurch: true,
    updateChurch: true,
    viewChurchSettings: true,

    // Campus management
    createCampus: true,
    deleteCampus: true,
    updateCampus: true,
    viewAllCampuses: true,

    // Member management
    promoteToOwner: true,
    promoteToOverseer: true,
    promoteToModerator: true,
    demoteMembers: true,
    removeMembers: true,

    // Invite management
    createInvites: true,
    viewAllInvites: true,
    deleteInvites: true,

    // Content management
    manageAllContent: true,
    viewAllContent: true,
  },

  overseer: {
    // Church management
    deleteChurch: false,
    updateChurch: false,
    viewChurchSettings: true,

    // Campus management
    createCampus: false,
    deleteCampus: false,
    updateCampus: true, // Only assigned campuses
    viewAllCampuses: false, // Only assigned campuses

    // Member management
    promoteToOwner: false,
    promoteToOverseer: false,
    promoteToModerator: true, // Only in their campus
    demoteMembers: true, // Only moderators in their campus
    removeMembers: true, // Only from their campus

    // Invite management
    createInvites: true, // Only for their campus
    viewAllInvites: false, // Only their campus invites
    deleteInvites: true, // Only their campus invites

    // Content management
    manageAllContent: false,
    viewAllContent: false, // Only their campus
  },

  moderator: {
    // Church management
    deleteChurch: false,
    updateChurch: false,
    viewChurchSettings: false,

    // Campus management
    createCampus: false,
    deleteCampus: false,
    updateCampus: false,
    viewAllCampuses: false,

    // Member management
    promoteToOwner: false,
    promoteToOverseer: false,
    promoteToModerator: false,
    demoteMembers: false,
    removeMembers: false,

    // Invite management
    createInvites: false,
    viewAllInvites: false,
    deleteInvites: false,

    // Content management
    manageAllContent: false, // Can manage content in their campus
    viewAllContent: false,
  },

  member: {
    // Church management
    deleteChurch: false,
    updateChurch: false,
    viewChurchSettings: false,

    // Campus management
    createCampus: false,
    deleteCampus: false,
    updateCampus: false,
    viewAllCampuses: false,

    // Member management
    promoteToOwner: false,
    promoteToOverseer: false,
    promoteToModerator: false,
    demoteMembers: false,
    removeMembers: false,

    // Invite management
    createInvites: false,
    viewAllInvites: false,
    deleteInvites: false,

    // Content management
    manageAllContent: false,
    viewAllContent: false,
  },
} as const;

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: ChurchRole,
  permission: keyof typeof ROLE_PERMISSIONS.owner
): boolean {
  return ROLE_PERMISSIONS[role][permission];
}

/**
 * Check if a user can manage content (create, edit, delete)
 */
export function canManageContent(role: ChurchRole): boolean {
  return ['owner', 'overseer', 'moderator'].includes(role);
}

/**
 * Check if a user can view all church data
 */
export function canViewAllChurchData(role: ChurchRole): boolean {
  return role === 'owner';
}

/**
 * Check if a user can manage members
 */
export function canManageMembers(role: ChurchRole): boolean {
  return ['owner', 'overseer'].includes(role);
}

/**
 * Check if a user can create invites
 */
export function canCreateInvites(role: ChurchRole): boolean {
  return ['owner', 'overseer'].includes(role);
}

/**
 * Check if a user can manage campuses
 */
export function canManageCampuses(role: ChurchRole): boolean {
  return role === 'owner';
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: ChurchRole): string {
  const displayNames: Record<ChurchRole, string> = {
    owner: 'Church Owner',
    overseer: 'Campus Overseer',
    moderator: 'Campus Moderator',
    member: 'Member',
  };
  return displayNames[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: ChurchRole): string {
  const descriptions: Record<ChurchRole, string> = {
    owner: 'Full access to all church settings, campuses, and members',
    overseer: 'Manages specific campuses and can promote moderators',
    moderator: 'Helps manage content within their campus',
    member: 'Can view and participate in church activities',
  };
  return descriptions[role];
}

/**
 * Get available roles for promotion based on current user role
 */
export function getPromotableRoles(currentUserRole: ChurchRole): ChurchRole[] {
  if (currentUserRole === 'owner') {
    return ['overseer', 'moderator'];
  }
  if (currentUserRole === 'overseer') {
    return ['moderator'];
  }
  return [];
}

/**
 * Role hierarchy level (higher number = more permissions)
 */
export const ROLE_HIERARCHY: Record<ChurchRole, number> = {
  owner: 4,
  overseer: 3,
  moderator: 2,
  member: 1,
};

/**
 * Check if one role is higher than another
 */
export function isRoleHigher(role1: ChurchRole, role2: ChurchRole): boolean {
  return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2];
}
