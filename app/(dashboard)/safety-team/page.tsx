'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChurchMembership } from '@/hooks/use-church-membership';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Shield,
  UserPlus,
  Edit,
  Trash2,
  Phone,
  Award,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface SafetyTeamMember {
  id: string;
  user_id: string;
  team_role: 'team_leader' | 'member';
  specialty: 'medical' | 'security' | 'fire_safety' | 'general';
  certifications: string | null;
  phone: string | null;
  is_active: boolean;
  availability_notes: string | null;
  joined_team_at: string;
  userName: string;
  userEmail: string;
  campus: string | null;
}

interface AddMemberForm {
  targetUserId: string;
  teamRole: 'team_leader' | 'member';
  specialty: 'medical' | 'security' | 'fire_safety' | 'general';
  certifications: string;
  phone: string;
  availabilityNotes: string;
}

interface EditMemberForm {
  teamRole: 'team_leader' | 'member';
  specialty: 'medical' | 'security' | 'fire_safety' | 'general';
  certifications: string;
  phone: string;
  availabilityNotes: string;
  isActive: boolean;
}

export default function SafetyTeamPage() {
  const router = useRouter();
  const { membership, role } = useChurchMembership();
  const [safetyTeam, setSafetyTeam] = useState<SafetyTeamMember[]>([]);
  const [churchMembers, setChurchMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<SafetyTeamMember | null>(null);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('active');

  const [addForm, setAddForm] = useState<AddMemberForm>({
    targetUserId: '',
    teamRole: 'member',
    specialty: 'general',
    certifications: '',
    phone: '',
    availabilityNotes: '',
  });

  const [editForm, setEditForm] = useState<EditMemberForm>({
    teamRole: 'member',
    specialty: 'general',
    certifications: '',
    phone: '',
    availabilityNotes: '',
    isActive: true,
  });

  const canManage = role === 'owner' || role === 'overseer';

  useEffect(() => {
    const fetchData = async () => {
      if (!membership?.churchId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch safety team members
        const teamResponse = await fetch(`/api/churches/${membership.churchId}/safety-team`);
        const teamData = await teamResponse.json();

        if (!teamResponse.ok) {
          throw new Error(teamData.error || 'Failed to fetch safety team');
        }

        setSafetyTeam(teamData.safetyTeam || []);

        // Fetch all church members for the add member dropdown
        if (canManage) {
          const membersResponse = await fetch(`/api/churches/${membership.churchId}/members`);
          const membersData = await membersResponse.json();

          if (membersResponse.ok) {
            setChurchMembers(membersData.members || []);
          }
        }
      } catch (err) {
        console.error('Error fetching safety team:', err);
        setError(err instanceof Error ? err.message : 'Failed to load safety team');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [membership, canManage]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membership?.churchId) return;

    try {
      const response = await fetch(`/api/churches/${membership.churchId}/safety-team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add member');
      }

      // Refresh safety team list
      const teamResponse = await fetch(`/api/churches/${membership.churchId}/safety-team`);
      const teamData = await teamResponse.json();
      setSafetyTeam(teamData.safetyTeam || []);

      // Reset form and close modal
      setAddForm({
        targetUserId: '',
        teamRole: 'member',
        specialty: 'general',
        certifications: '',
        phone: '',
        availabilityNotes: '',
      });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding member:', err);
      alert(err instanceof Error ? err.message : 'Failed to add member');
    }
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membership?.churchId || !editingMember) return;

    try {
      const response = await fetch(
        `/api/churches/${membership.churchId}/safety-team/${editingMember.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update member');
      }

      // Refresh safety team list
      const teamResponse = await fetch(`/api/churches/${membership.churchId}/safety-team`);
      const teamData = await teamResponse.json();
      setSafetyTeam(teamData.safetyTeam || []);

      setEditingMember(null);
    } catch (err) {
      console.error('Error updating member:', err);
      alert(err instanceof Error ? err.message : 'Failed to update member');
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!membership?.churchId) return;
    if (!confirm(`Remove ${memberName} from the safety team?`)) return;

    try {
      const response = await fetch(
        `/api/churches/${membership.churchId}/safety-team/${memberId}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove member');
      }

      // Refresh safety team list
      const teamResponse = await fetch(`/api/churches/${membership.churchId}/safety-team`);
      const teamData = await teamResponse.json();
      setSafetyTeam(teamData.safetyTeam || []);
    } catch (err) {
      console.error('Error removing member:', err);
      alert(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const openEditModal = (member: SafetyTeamMember) => {
    setEditForm({
      teamRole: member.team_role,
      specialty: member.specialty,
      certifications: member.certifications || '',
      phone: member.phone || '',
      availabilityNotes: member.availability_notes || '',
      isActive: member.is_active,
    });
    setEditingMember(member);
  };

  const formatSpecialty = (specialty: string) => {
    const map: Record<string, string> = {
      medical: 'Medical',
      security: 'Security',
      fire_safety: 'Fire Safety',
      general: 'General',
    };
    return map[specialty] || specialty;
  };

  const formatRole = (role: string) => {
    return role === 'team_leader' ? 'Team Leader' : 'Member';
  };

  // Filter safety team based on active filter
  const filteredTeam = safetyTeam.filter(member => {
    if (filterActive === 'active') return member.is_active;
    if (filterActive === 'inactive') return !member.is_active;
    return true;
  });

  // Get available members (not already on safety team)
  const availableMembers = churchMembers.filter(
    member => !safetyTeam.some(sm => sm.user_id === member.user_id)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading safety team...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/home')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Shield size={32} className="text-indigo-600" />
              Safety Team Roster
            </h1>
            <p className="text-gray-600">
              Manage your church safety and security team members
            </p>
          </div>
          {canManage && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <UserPlus size={18} className="mr-2" />
              Add Member
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setFilterActive('active')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filterActive === 'active'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Active ({safetyTeam.filter(m => m.is_active).length})
          </button>
          <button
            onClick={() => setFilterActive('inactive')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filterActive === 'inactive'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Inactive ({safetyTeam.filter(m => !m.is_active).length})
          </button>
          <button
            onClick={() => setFilterActive('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filterActive === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            All ({safetyTeam.length})
          </button>
        </div>

        {/* Safety Team List */}
        {filteredTeam.length === 0 ? (
          <Card className="p-12 text-center">
            <Shield size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Safety Team Members</h3>
            <p className="text-gray-600 mb-4">
              {filterActive === 'active'
                ? 'No active safety team members yet.'
                : filterActive === 'inactive'
                ? 'No inactive safety team members.'
                : 'Add church members to your safety team.'}
            </p>
            {canManage && (
              <Button onClick={() => setShowAddModal(true)}>
                <UserPlus size={18} className="mr-2" />
                Add First Member
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeam.map(member => (
              <Card key={member.id} className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{member.userName}</h3>
                      {member.is_active ? (
                        <CheckCircle size={18} className="text-green-600" />
                      ) : (
                        <AlertCircle size={18} className="text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{member.userEmail}</p>
                  </div>
                  {canManage && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Edit member"
                      >
                        <Edit size={16} className="text-indigo-600" />
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member.id, member.userName)}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Remove from team"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Role & Specialty */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Role:</span>
                    <span className={`font-medium px-2 py-1 rounded ${
                      member.team_role === 'team_leader'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {formatRole(member.team_role)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Specialty:</span>
                    <span className="font-medium text-indigo-900">
                      {formatSpecialty(member.specialty)}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <Phone size={14} className="text-gray-400" />
                    <span>{member.phone}</span>
                  </div>
                )}

                {/* Certifications */}
                {member.certifications && (
                  <div className="flex items-start gap-2 text-sm text-gray-700 mb-2">
                    <Award size={14} className="text-gray-400 mt-0.5" />
                    <span className="flex-1">{member.certifications}</span>
                  </div>
                )}

                {/* Availability Notes */}
                {member.availability_notes && (
                  <div className="flex items-start gap-2 text-sm text-gray-700 mb-2">
                    <Clock size={14} className="text-gray-400 mt-0.5" />
                    <span className="flex-1">{member.availability_notes}</span>
                  </div>
                )}

                {/* Campus */}
                {member.campus && (
                  <div className="text-xs text-gray-500 mt-2">
                    Campus: {member.campus}
                  </div>
                )}

                {/* Joined Date */}
                <div className="text-xs text-gray-500 mt-2">
                  Joined team: {new Date(member.joined_team_at).toLocaleDateString()}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add Member Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Safety Team Member</h2>
              <form onSubmit={handleAddMember}>
                <div className="space-y-4">
                  {/* Select Member */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Member *
                    </label>
                    <select
                      value={addForm.targetUserId}
                      onChange={(e) => setAddForm({ ...addForm, targetUserId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">Choose a member...</option>
                      {availableMembers.map(member => (
                        <option key={member.user_id} value={member.user_id}>
                          {member.user_name} ({member.user_email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Team Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Role
                    </label>
                    <select
                      value={addForm.teamRole}
                      onChange={(e) => setAddForm({ ...addForm, teamRole: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="member">Member</option>
                      <option value="team_leader">Team Leader</option>
                    </select>
                  </div>

                  {/* Specialty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialty
                    </label>
                    <select
                      value={addForm.specialty}
                      onChange={(e) => setAddForm({ ...addForm, specialty: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="general">General</option>
                      <option value="medical">Medical</option>
                      <option value="security">Security</option>
                      <option value="fire_safety">Fire Safety</option>
                    </select>
                  </div>

                  {/* Certifications */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certifications
                    </label>
                    <input
                      type="text"
                      value={addForm.certifications}
                      onChange={(e) => setAddForm({ ...addForm, certifications: e.target.value })}
                      placeholder="e.g., CPR, First Aid, AED"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={addForm.phone}
                      onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* Availability Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Availability Notes
                    </label>
                    <textarea
                      value={addForm.availabilityNotes}
                      onChange={(e) => setAddForm({ ...addForm, availabilityNotes: e.target.value })}
                      placeholder="e.g., Available Sundays and Wednesdays"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    Add to Safety Team
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Edit Member Modal */}
        {editingMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Edit {editingMember.userName}
              </h2>
              <form onSubmit={handleEditMember}>
                <div className="space-y-4">
                  {/* Team Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Role
                    </label>
                    <select
                      value={editForm.teamRole}
                      onChange={(e) => setEditForm({ ...editForm, teamRole: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="member">Member</option>
                      <option value="team_leader">Team Leader</option>
                    </select>
                  </div>

                  {/* Specialty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialty
                    </label>
                    <select
                      value={editForm.specialty}
                      onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="general">General</option>
                      <option value="medical">Medical</option>
                      <option value="security">Security</option>
                      <option value="fire_safety">Fire Safety</option>
                    </select>
                  </div>

                  {/* Certifications */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certifications
                    </label>
                    <input
                      type="text"
                      value={editForm.certifications}
                      onChange={(e) => setEditForm({ ...editForm, certifications: e.target.value })}
                      placeholder="e.g., CPR, First Aid, AED"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* Availability Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Availability Notes
                    </label>
                    <textarea
                      value={editForm.availabilityNotes}
                      onChange={(e) => setEditForm({ ...editForm, availabilityNotes: e.target.value })}
                      placeholder="e.g., Available Sundays and Wednesdays"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Active on safety team
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
