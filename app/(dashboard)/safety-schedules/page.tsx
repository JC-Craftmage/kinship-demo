'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChurchMembership } from '@/hooks/use-church-membership';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface SafetySchedule {
  id: string;
  campus_id: string | null;
  safety_member_id: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  event_type: string | null;
  event_name: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  memberName: string;
  memberEmail: string;
  campusName: string | null;
  safety_team_members: {
    user_id: string;
    team_role: string;
    specialty: string;
  };
}

interface SafetyTeamMember {
  id: string;
  user_id: string;
  team_role: string;
  specialty: string;
  userName: string;
}

interface Campus {
  id: string;
  name: string;
}

interface ScheduleForm {
  safetyMemberId: string;
  campusId: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  eventType: string;
  eventName: string;
  notes: string;
}

export default function SafetySchedulesPage() {
  const router = useRouter();
  const { membership, role } = useChurchMembership();
  const [schedules, setSchedules] = useState<SafetySchedule[]>([]);
  const [safetyTeam, setSafetyTeam] = useState<SafetyTeamMember[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<SafetySchedule | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCampus, setFilterCampus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({
    safetyMemberId: '',
    campusId: '',
    scheduledDate: '',
    startTime: '09:00',
    endTime: '12:00',
    eventType: '',
    eventName: '',
    notes: '',
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

        // Build query params
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (filterCampus !== 'all') params.append('campusId', filterCampus);
        if (filterStatus !== 'all') params.append('status', filterStatus);

        // Fetch schedules
        const schedulesResponse = await fetch(
          `/api/churches/${membership.churchId}/safety-schedules?${params.toString()}`
        );
        const schedulesData = await schedulesResponse.json();

        if (!schedulesResponse.ok) {
          throw new Error(schedulesData.error || 'Failed to fetch schedules');
        }

        setSchedules(schedulesData.schedules || []);

        // Fetch safety team members
        const teamResponse = await fetch(`/api/churches/${membership.churchId}/safety-team`);
        const teamData = await teamResponse.json();

        if (teamResponse.ok) {
          // Map to simplified structure
          const members = (teamData.safetyTeam || [])
            .filter((m: any) => m.is_active)
            .map((m: any) => ({
              id: m.id,
              user_id: m.user_id,
              team_role: m.team_role,
              specialty: m.specialty,
              userName: m.userName,
            }));
          setSafetyTeam(members);
        }

        // Fetch campuses
        const campusesResponse = await fetch(`/api/churches/${membership.churchId}/campuses`);
        const campusesData = await campusesResponse.json();

        if (campusesResponse.ok) {
          setCampuses(campusesData.campuses || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load schedules');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [membership, startDate, endDate, filterCampus, filterStatus]);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membership?.churchId) return;

    try {
      const response = await fetch(`/api/churches/${membership.churchId}/safety-schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create schedule');
      }

      // Refresh schedules
      const schedulesResponse = await fetch(
        `/api/churches/${membership.churchId}/safety-schedules`
      );
      const schedulesData = await schedulesResponse.json();
      setSchedules(schedulesData.schedules || []);

      // Reset form and close modal
      setScheduleForm({
        safetyMemberId: '',
        campusId: '',
        scheduledDate: '',
        startTime: '09:00',
        endTime: '12:00',
        eventType: '',
        eventName: '',
        notes: '',
      });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error creating schedule:', err);
      alert(err instanceof Error ? err.message : 'Failed to create schedule');
    }
  };

  const handleEditSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membership?.churchId || !editingSchedule) return;

    try {
      const response = await fetch(
        `/api/churches/${membership.churchId}/safety-schedules/${editingSchedule.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scheduleForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update schedule');
      }

      // Refresh schedules
      const schedulesResponse = await fetch(
        `/api/churches/${membership.churchId}/safety-schedules`
      );
      const schedulesData = await schedulesResponse.json();
      setSchedules(schedulesData.schedules || []);

      setEditingSchedule(null);
    } catch (err) {
      console.error('Error updating schedule:', err);
      alert(err instanceof Error ? err.message : 'Failed to update schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string, eventInfo: string) => {
    if (!membership?.churchId) return;
    if (!confirm(`Delete schedule for ${eventInfo}?`)) return;

    try {
      const response = await fetch(
        `/api/churches/${membership.churchId}/safety-schedules/${scheduleId}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete schedule');
      }

      // Refresh schedules
      const schedulesResponse = await fetch(
        `/api/churches/${membership.churchId}/safety-schedules`
      );
      const schedulesData = await schedulesResponse.json();
      setSchedules(schedulesData.schedules || []);
    } catch (err) {
      console.error('Error deleting schedule:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete schedule');
    }
  };

  const handleUpdateStatus = async (
    scheduleId: string,
    newStatus: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  ) => {
    if (!membership?.churchId) return;

    try {
      const response = await fetch(
        `/api/churches/${membership.churchId}/safety-schedules/${scheduleId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      // Refresh schedules
      const schedulesResponse = await fetch(
        `/api/churches/${membership.churchId}/safety-schedules`
      );
      const schedulesData = await schedulesResponse.json();
      setSchedules(schedulesData.schedules || []);
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const openEditModal = (schedule: SafetySchedule) => {
    setScheduleForm({
      safetyMemberId: schedule.safety_member_id,
      campusId: schedule.campus_id || '',
      scheduledDate: schedule.scheduled_date,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      eventType: schedule.event_type || '',
      eventName: schedule.event_name || '',
      notes: schedule.notes || '',
    });
    setEditingSchedule(schedule);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      no_show: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
    };

    const badge = badges[status] || badges.scheduled;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
        <Icon size={12} />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading schedules...</p>
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
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar size={32} className="text-indigo-600" />
                Safety Team Schedule
              </h1>
              <p className="text-gray-600">
                Manage safety team scheduling for services and events
              </p>
            </div>
            {canManage && (
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus size={18} className="mr-2" />
                Create Schedule
              </Button>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push('/safety-team')}
              className="bg-white text-gray-700 border-gray-300"
            >
              Roster
            </Button>
            <Button
              variant="secondary"
              className="bg-indigo-100 text-indigo-900 border-indigo-300"
            >
              Schedules
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campus
              </label>
              <select
                value={filterCampus}
                onChange={(e) => setFilterCampus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Campuses</option>
                {campuses.map(campus => (
                  <option key={campus.id} value={campus.id}>{campus.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Schedule List */}
        {schedules.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Schedules</h3>
            <p className="text-gray-600 mb-4">
              {filterStatus !== 'all' || filterCampus !== 'all' || startDate || endDate
                ? 'No schedules match your filters.'
                : 'Create your first safety team schedule.'}
            </p>
            {canManage && (
              <Button onClick={() => setShowAddModal(true)}>
                <Plus size={18} className="mr-2" />
                Create First Schedule
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {schedules.map(schedule => (
              <Card key={schedule.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Date & Time */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-indigo-600" />
                        <span className="font-bold text-gray-900">
                          {new Date(schedule.scheduled_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-gray-600" />
                        <span className="text-gray-700">
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </span>
                      </div>
                      {getStatusBadge(schedule.status)}
                    </div>

                    {/* Event Info */}
                    {(schedule.event_type || schedule.event_name) && (
                      <div className="mb-2">
                        <span className="font-medium text-gray-900">
                          {schedule.event_name || schedule.event_type}
                        </span>
                        {schedule.event_name && schedule.event_type && (
                          <span className="text-sm text-gray-600 ml-2">
                            ({schedule.event_type})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Member & Campus */}
                    <div className="text-sm text-gray-700 space-y-1">
                      <div>
                        <span className="font-medium">Assigned to:</span>{' '}
                        {schedule.memberName}
                        {schedule.safety_team_members?.team_role === 'team_leader' && (
                          <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-bold">
                            LEADER
                          </span>
                        )}
                      </div>
                      {schedule.campusName && (
                        <div>
                          <span className="font-medium">Campus:</span> {schedule.campusName}
                        </div>
                      )}
                      {schedule.notes && (
                        <div className="mt-2">
                          <span className="font-medium">Notes:</span> {schedule.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {canManage && (
                    <div className="flex flex-col gap-2 ml-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(schedule)}
                          className="p-2 hover:bg-gray-100 rounded"
                          title="Edit schedule"
                        >
                          <Edit size={16} className="text-indigo-600" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteSchedule(
                              schedule.id,
                              `${schedule.memberName} on ${new Date(schedule.scheduled_date).toLocaleDateString()}`
                            )
                          }
                          className="p-2 hover:bg-gray-100 rounded"
                          title="Delete schedule"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                      {schedule.status === 'scheduled' && (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleUpdateStatus(schedule.id, 'completed')}
                            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            Mark Complete
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(schedule.id, 'no_show')}
                            className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                          >
                            No Show
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(schedule.id, 'cancelled')}
                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add Schedule Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Safety Schedule</h2>
              <form onSubmit={handleAddSchedule}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Safety Team Member */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Safety Team Member *
                    </label>
                    <select
                      value={scheduleForm.safetyMemberId}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, safetyMemberId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">Select member...</option>
                      {safetyTeam.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.userName} ({member.specialty})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={scheduleForm.scheduledDate}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  {/* Campus */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Campus
                    </label>
                    <select
                      value={scheduleForm.campusId}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, campusId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">All Campuses</option>
                      {campuses.map(campus => (
                        <option key={campus.id} value={campus.id}>{campus.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.startTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  {/* Event Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type
                    </label>
                    <input
                      type="text"
                      value={scheduleForm.eventType}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, eventType: e.target.value })}
                      placeholder="e.g., Sunday Service"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* Event Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Name
                    </label>
                    <input
                      type="text"
                      value={scheduleForm.eventName}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, eventName: e.target.value })}
                      placeholder="e.g., Morning Worship"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={scheduleForm.notes}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                      placeholder="Any special instructions or notes"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    Create Schedule
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

        {/* Edit Schedule Modal */}
        {editingSchedule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Edit Schedule
              </h2>
              <form onSubmit={handleEditSchedule}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Safety Team Member */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Safety Team Member
                    </label>
                    <select
                      value={scheduleForm.safetyMemberId}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, safetyMemberId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {safetyTeam.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.userName} ({member.specialty})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={scheduleForm.scheduledDate}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* Campus */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Campus
                    </label>
                    <select
                      value={scheduleForm.campusId}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, campusId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">All Campuses</option>
                      {campuses.map(campus => (
                        <option key={campus.id} value={campus.id}>{campus.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.startTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* Event Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type
                    </label>
                    <input
                      type="text"
                      value={scheduleForm.eventType}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, eventType: e.target.value })}
                      placeholder="e.g., Sunday Service"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* Event Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Name
                    </label>
                    <input
                      type="text"
                      value={scheduleForm.eventName}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, eventName: e.target.value })}
                      placeholder="e.g., Morning Worship"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={scheduleForm.notes}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                      placeholder="Any special instructions or notes"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setEditingSchedule(null)}
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
