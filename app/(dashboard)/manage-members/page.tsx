// Manage church members and roles page (Owner only)

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChurchMembership } from '@/hooks/use-church-membership';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Users, Shield, UserX, ChevronDown, Search, MapPin } from 'lucide-react';

interface Member {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_photo: string | null;
  role: 'owner' | 'overseer' | 'moderator' | 'member';
  campus_name: string | null;
  joined_at: string;
}

export default function ManageMembersPage() {
  const router = useRouter();
  const { membership, role } = useChurchMembership();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [newRole, setNewRole] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  // Bulk actions state
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [showBulkRoleModal, setShowBulkRoleModal] = useState(false);
  const [showBulkRemoveModal, setShowBulkRemoveModal] = useState(false);
  const [bulkNewRole, setBulkNewRole] = useState<string>('');

  // Campus assignment state
  const [showCampusModal, setShowCampusModal] = useState(false);
  const [newCampusId, setNewCampusId] = useState<string>('');
  const [campuses, setCampuses] = useState<Array<{id: string, name: string}>>([]);

  const isOwner = role === 'owner';
  const canAssignCampus = role === 'owner' || role === 'overseer';

  useEffect(() => {
    const fetchData = async () => {
      if (!membership?.churchId || !isOwner) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch members
        const membersResponse = await fetch(`/api/churches/${membership.churchId}/members`);
        const membersData = await membersResponse.json();

        if (!membersResponse.ok) {
          throw new Error(membersData.error || 'Failed to fetch members');
        }

        setMembers(membersData.members || []);
        setFilteredMembers(membersData.members || []);

        // Fetch campuses for assignment
        const campusesResponse = await fetch(`/api/churches/${membership.churchId}/campuses`);
        const campusesData = await campusesResponse.json();
        setCampuses(campusesData.campuses || []);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [membership?.churchId, isOwner]);

  // Filter members based on search and role filter
  useEffect(() => {
    let filtered = members;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(m =>
        m.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.user_email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(m => m.role === roleFilter);
    }

    setFilteredMembers(filtered);
  }, [searchQuery, roleFilter, members]);

  const handleChangeRole = async () => {
    if (!selectedMember || !newRole) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/churches/members/${selectedMember.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change role');
      }

      // Update local state
      setMembers(members.map(m =>
        m.id === selectedMember.id ? { ...m, role: newRole as any } : m
      ));

      setShowRoleModal(false);
      setSelectedMember(null);
      setNewRole('');
    } catch (err) {
      console.error('Error changing role:', err);
      setError(err instanceof Error ? err.message : 'Failed to change role');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/churches/members/${selectedMember.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove member');
      }

      // Update local state
      setMembers(members.filter(m => m.id !== selectedMember.id));

      setShowRemoveModal(false);
      setSelectedMember(null);
    } catch (err) {
      console.error('Error removing member:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'overseer': return 'bg-blue-100 text-blue-800';
      case 'moderator': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Bulk actions handlers
  const toggleMemberSelection = (memberId: string) => {
    const newSelection = new Set(selectedMemberIds);
    if (newSelection.has(memberId)) {
      newSelection.delete(memberId);
    } else {
      newSelection.add(memberId);
    }
    setSelectedMemberIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedMemberIds.size === filteredMembers.length) {
      setSelectedMemberIds(new Set());
    } else {
      setSelectedMemberIds(new Set(filteredMembers.map(m => m.id)));
    }
  };

  const handleBulkChangeRole = async () => {
    if (!bulkNewRole || selectedMemberIds.size === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Call each role change individually (could be optimized with bulk API later)
      const promises = Array.from(selectedMemberIds).map(memberId =>
        fetch(`/api/churches/members/${memberId}/role`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: bulkNewRole }),
        })
      );

      const responses = await Promise.all(promises);
      const failedCount = responses.filter(r => !r.ok).length;

      if (failedCount > 0) {
        throw new Error(`Failed to update ${failedCount} member(s)`);
      }

      // Update local state
      setMembers(members.map(m =>
        selectedMemberIds.has(m.id) ? { ...m, role: bulkNewRole as any } : m
      ));

      setShowBulkRoleModal(false);
      setSelectedMemberIds(new Set());
      setBulkNewRole('');
    } catch (err) {
      console.error('Error in bulk role change:', err);
      setError(err instanceof Error ? err.message : 'Failed to change roles');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkRemove = async () => {
    if (selectedMemberIds.size === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Call each remove individually
      const promises = Array.from(selectedMemberIds).map(memberId =>
        fetch(`/api/churches/members/${memberId}`, {
          method: 'DELETE',
        })
      );

      const responses = await Promise.all(promises);
      const failedCount = responses.filter(r => !r.ok).length;

      if (failedCount > 0) {
        throw new Error(`Failed to remove ${failedCount} member(s)`);
      }

      // Update local state
      setMembers(members.filter(m => !selectedMemberIds.has(m.id)));

      setShowBulkRemoveModal(false);
      setSelectedMemberIds(new Set());
    } catch (err) {
      console.error('Error in bulk remove:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove members');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssignCampus = async () => {
    if (!selectedMember) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/churches/members/${selectedMember.id}/campus`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campusId: newCampusId || null }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign campus');
      }

      // Update local state
      const campusName = newCampusId
        ? campuses.find(c => c.id === newCampusId)?.name || null
        : null;

      setMembers(members.map(m =>
        m.id === selectedMember.id ? { ...m, campus_name: campusName } : m
      ));

      setShowCampusModal(false);
      setSelectedMember(null);
      setNewCampusId('');
    } catch (err) {
      console.error('Error assigning campus:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign campus');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-indigo-600 text-white p-4 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl font-bold">Manage Members</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-4">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Owner Access Required</h2>
            <p className="text-gray-600">
              Only church owners can manage member roles.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading members...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">Manage Members & Roles</h1>
          <p className="text-sm text-indigo-200">{membership?.churchName}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats & Filters */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{members.length}</p>
            </div>
            <Users className="w-8 h-8 text-indigo-600" />
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Role Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                roleFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({members.length})
            </button>
            <button
              onClick={() => setRoleFilter('owner')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                roleFilter === 'owner'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
              }`}
            >
              Owners ({members.filter(m => m.role === 'owner').length})
            </button>
            <button
              onClick={() => setRoleFilter('overseer')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                roleFilter === 'overseer'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              Overseers ({members.filter(m => m.role === 'overseer').length})
            </button>
            <button
              onClick={() => setRoleFilter('moderator')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                roleFilter === 'moderator'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              Moderators ({members.filter(m => m.role === 'moderator').length})
            </button>
            <button
              onClick={() => setRoleFilter('member')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                roleFilter === 'member'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Members ({members.filter(m => m.role === 'member').length})
            </button>
          </div>
        </Card>

        {/* Bulk Actions Toolbar */}
        {selectedMemberIds.size > 0 && (
          <Card className="p-4 bg-indigo-50 border-indigo-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold text-indigo-900">
                  {selectedMemberIds.size} member{selectedMemberIds.size > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedMemberIds(new Set())}
                  className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowBulkRoleModal(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Shield size={14} className="mr-1" />
                  Change Roles
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowBulkRemoveModal(true)}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  <UserX size={14} className="mr-1" />
                  Remove Members
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Select All / Deselect All */}
        {filteredMembers.length > 0 && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedMemberIds.size === filteredMembers.length && filteredMembers.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 text-indigo-600 rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">
              {selectedMemberIds.size === filteredMembers.length && filteredMembers.length > 0
                ? 'Deselect all'
                : 'Select all'}
            </span>
          </div>
        )}

        {/* Members List */}
        {filteredMembers.length > 0 ? (
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <Card key={member.id} className={`p-4 ${selectedMemberIds.has(member.id) ? 'ring-2 ring-indigo-500' : ''}`}>
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedMemberIds.has(member.id)}
                    onChange={() => toggleMemberSelection(member.id)}
                    className="w-5 h-5 text-indigo-600 rounded border-gray-300"
                  />
                  {member.user_photo ? (
                    <img
                      src={member.user_photo}
                      alt={member.user_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {member.user_name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <button
                      onClick={() => router.push(`/members/${member.id}`)}
                      className="font-bold text-gray-900 hover:text-indigo-600 hover:underline text-left"
                    >
                      {member.user_name}
                    </button>
                    <p className="text-sm text-gray-600">{member.user_email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(member.role)}`}>
                        {getRoleLabel(member.role)}
                      </span>
                      {member.campus_name && (
                        <span className="text-xs text-gray-500">• {member.campus_name}</span>
                      )}
                      <span className="text-xs text-gray-500">
                        • Joined {new Date(member.joined_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedMember(member);
                        setNewRole(member.role);
                        setShowRoleModal(true);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Shield size={14} />
                      Change Role
                    </Button>
                    {canAssignCampus && campuses.length > 0 && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelectedMember(member);
                          setNewCampusId(member.campus_name || '');
                          setShowCampusModal(true);
                        }}
                        className="flex items-center gap-1"
                      >
                        <MapPin size={14} />
                        Campus
                      </Button>
                    )}
                    {member.role !== 'owner' && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelectedMember(member);
                          setShowRemoveModal(true);
                        }}
                        className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                      >
                        <UserX size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">No Members Found</h3>
            <p className="text-gray-600">
              {searchQuery || roleFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No members in your church yet'}
            </p>
          </Card>
        )}
      </div>

      {/* Change Role Modal */}
      {showRoleModal && selectedMember && (
        <Modal
          isOpen={showRoleModal}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedMember(null);
            setNewRole('');
            setError(null);
          }}
          title="Change Member Role"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b">
              {selectedMember.user_photo ? (
                <img
                  src={selectedMember.user_photo}
                  alt={selectedMember.user_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {selectedMember.user_name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-900">{selectedMember.user_name}</h3>
                <p className="text-sm text-gray-600">{selectedMember.user_email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Role
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="member">Member - Basic access</option>
                <option value="moderator">Moderator - Can approve join requests</option>
                <option value="overseer">Overseer - Campus leadership</option>
                <option value="owner">Owner - Full control</option>
              </select>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Changing roles affects what members can do in the church management system.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedMember(null);
                  setNewRole('');
                  setError(null);
                }}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleChangeRole}
                className="flex-1"
                disabled={isProcessing || newRole === selectedMember.role}
              >
                {isProcessing ? 'Changing...' : 'Change Role'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Remove Member Modal */}
      {showRemoveModal && selectedMember && (
        <Modal
          isOpen={showRemoveModal}
          onClose={() => {
            setShowRemoveModal(false);
            setSelectedMember(null);
            setError(null);
          }}
          title="Remove Member"
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This will remove {selectedMember.user_name} from your church.
                They will need a new invite code to rejoin.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRemoveModal(false);
                  setSelectedMember(null);
                  setError(null);
                }}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleRemoveMember}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isProcessing}
              >
                {isProcessing ? 'Removing...' : 'Remove Member'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Change Role Modal */}
      {showBulkRoleModal && (
        <Modal
          isOpen={showBulkRoleModal}
          onClose={() => {
            setShowBulkRoleModal(false);
            setBulkNewRole('');
            setError(null);
          }}
          title="Bulk Change Roles"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                You are about to change the role for <strong>{selectedMemberIds.size} member(s)</strong>.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Role
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={bulkNewRole}
                onChange={(e) => setBulkNewRole(e.target.value)}
              >
                <option value="">Select a role...</option>
                <option value="member">Member - Basic access</option>
                <option value="moderator">Moderator - Can approve join requests</option>
                <option value="overseer">Overseer - Campus leadership</option>
                <option value="owner">Owner - Full control</option>
              </select>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This will change the role for all selected members at once.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowBulkRoleModal(false);
                  setBulkNewRole('');
                  setError(null);
                }}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleBulkChangeRole}
                className="flex-1"
                disabled={isProcessing || !bulkNewRole}
              >
                {isProcessing ? 'Changing...' : `Change ${selectedMemberIds.size} Role(s)`}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Remove Modal */}
      {showBulkRemoveModal && (
        <Modal
          isOpen={showBulkRemoveModal}
          onClose={() => {
            setShowBulkRemoveModal(false);
            setError(null);
          }}
          title="Bulk Remove Members"
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This will remove <strong>{selectedMemberIds.size} member(s)</strong> from your church.
                They will need new invite codes to rejoin.
              </p>
            </div>

            <div className="max-h-48 overflow-y-auto bg-gray-50 border border-gray-200 rounded p-3">
              <p className="text-xs text-gray-600 font-bold mb-2">Members to be removed:</p>
              <ul className="text-sm text-gray-800 space-y-1">
                {members
                  .filter(m => selectedMemberIds.has(m.id))
                  .map(m => (
                    <li key={m.id}>• {m.user_name} ({m.user_email})</li>
                  ))}
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowBulkRemoveModal(false);
                  setError(null);
                }}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleBulkRemove}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isProcessing}
              >
                {isProcessing ? 'Removing...' : `Remove ${selectedMemberIds.size} Member(s)`}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Campus Modal */}
      {showCampusModal && selectedMember && (
        <Modal
          isOpen={showCampusModal}
          onClose={() => {
            setShowCampusModal(false);
            setSelectedMember(null);
            setNewCampusId('');
            setError(null);
          }}
          title="Assign Campus"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Assign <strong>{selectedMember.user_name}</strong> to a campus or leave unassigned.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campus
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={newCampusId}
                onChange={(e) => setNewCampusId(e.target.value)}
              >
                <option value="">No Campus (Unassigned)</option>
                {campuses.map(campus => (
                  <option key={campus.id} value={campus.id}>
                    {campus.name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCampusModal(false);
                  setSelectedMember(null);
                  setNewCampusId('');
                  setError(null);
                }}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAssignCampus}
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? 'Assigning...' : 'Assign Campus'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
