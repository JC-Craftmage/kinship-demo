'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useChurchMembership } from '@/hooks/use-church-membership';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
  Users,
  Music,
  Volume2,
  Shield,
  Coffee,
  Heart,
  Baby,
  ArrowLeft,
  Edit,
  Calendar,
  UserPlus,
  Settings,
  Clock,
  X,
} from 'lucide-react';

interface Ministry {
  id: string;
  name: string;
  category: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
  leader_user_id: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  meeting_info: string | null;
  leaderName: string | null;
  volunteerCount: number;
}

interface Volunteer {
  id: string;
  user_id: string;
  userName: string;
  is_active: boolean;
  role: {
    name: string;
    role_type: string;
  } | null;
}

interface Schedule {
  id: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  service_type: string;
  service_name: string | null;
  role_assignment: string | null;
  status: string;
  notes: string | null;
  volunteer: {
    userName: string;
  };
}

export default function MinistryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ministryId = params.id as string;
  const { membership, role } = useChurchMembership();
  const [ministry, setMinistry] = useState<Ministry | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'volunteers' | 'schedule' | 'settings'>('overview');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManage = role && ['owner', 'overseer'].includes(role);

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    volunteerId: '',
    scheduledDate: '',
    startTime: '',
    endTime: '',
    serviceType: 'sunday_morning',
    serviceName: '',
    roleAssignment: '',
    notes: '',
  });

  useEffect(() => {
    const fetchMinistry = async () => {
      if (!membership?.churchId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const response = await fetch(`/api/churches/${membership.churchId}/ministries`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch ministry');
        }

        const foundMinistry = data.ministries?.find((m: Ministry) => m.id === ministryId);

        if (!foundMinistry) {
          throw new Error('Ministry not found');
        }

        setMinistry(foundMinistry);
      } catch (err) {
        console.error('Error fetching ministry:', err);
        setError(err instanceof Error ? err.message : 'Failed to load ministry');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMinistry();
  }, [membership, ministryId]);

  // Fetch volunteers
  useEffect(() => {
    const fetchVolunteers = async () => {
      if (!membership?.churchId || !ministryId) return;

      try {
        const response = await fetch(`/api/churches/${membership.churchId}/ministries/${ministryId}/volunteers`);
        const data = await response.json();

        if (response.ok) {
          setVolunteers(data.volunteers || []);
        }
      } catch (err) {
        console.error('Error fetching volunteers:', err);
      }
    };

    fetchVolunteers();
  }, [membership, ministryId]);

  // Fetch schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!membership?.churchId || !ministryId) return;

      try {
        const response = await fetch(`/api/churches/${membership.churchId}/ministries/${ministryId}/schedules`);
        const data = await response.json();

        if (response.ok) {
          setSchedules(data.schedules || []);
        }
      } catch (err) {
        console.error('Error fetching schedules:', err);
      }
    };

    fetchSchedules();
  }, [membership, ministryId]);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!membership?.churchId || !ministryId) return;
    if (!scheduleForm.volunteerId || !scheduleForm.scheduledDate || !scheduleForm.startTime || !scheduleForm.endTime) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/churches/${membership.churchId}/ministries/${ministryId}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId: scheduleForm.volunteerId,
          scheduledDate: scheduleForm.scheduledDate,
          startTime: scheduleForm.startTime,
          endTime: scheduleForm.endTime,
          serviceType: scheduleForm.serviceType,
          serviceName: scheduleForm.serviceName || null,
          roleAssignment: scheduleForm.roleAssignment || null,
          notes: scheduleForm.notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create schedule');
      }

      // Refresh schedules
      const refreshResponse = await fetch(`/api/churches/${membership.churchId}/ministries/${ministryId}/schedules`);
      const refreshData = await refreshResponse.json();
      if (refreshResponse.ok) {
        setSchedules(refreshData.schedules || []);
      }

      // Reset form and close modal
      setScheduleForm({
        volunteerId: '',
        scheduledDate: '',
        startTime: '',
        endTime: '',
        serviceType: 'sunday_morning',
        serviceName: '',
        roleAssignment: '',
        notes: '',
      });
      setShowScheduleModal(false);
      alert('Schedule created successfully!');
    } catch (err) {
      console.error('Error creating schedule:', err);
      alert(err instanceof Error ? err.message : 'Failed to create schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinistryIcon = (category: string) => {
    const icons: Record<string, any> = {
      childrens: Baby,
      worship: Music,
      sound: Volume2,
      security: Shield,
      cafe: Coffee,
      celebrate_recovery: Heart,
      singles: Users,
      single_parents: Heart,
    };
    return icons[category] || Users;
  };

  const getMinistryColor = (category: string) => {
    const colors: Record<string, string> = {
      childrens: 'bg-pink-100 text-pink-700 border-pink-200',
      worship: 'bg-purple-100 text-purple-700 border-purple-200',
      sound: 'bg-blue-100 text-blue-700 border-blue-200',
      security: 'bg-red-100 text-red-700 border-red-200',
      cafe: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      celebrate_recovery: 'bg-green-100 text-green-700 border-green-200',
      singles: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      single_parents: 'bg-teal-100 text-teal-700 border-teal-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading ministry...</p>
      </div>
    );
  }

  if (error || !ministry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <p className="text-red-600 mb-4">{error || 'Ministry not found'}</p>
          <Button onClick={() => router.push('/ministries')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Ministries
          </Button>
        </Card>
      </div>
    );
  }

  const Icon = getMinistryIcon(ministry.category);
  const colorClass = getMinistryColor(ministry.category);

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/ministries')}
            className="mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Ministries
          </Button>

          <div className="flex items-start gap-6">
            {/* Icon */}
            <div className={`p-6 rounded-xl border-2 ${colorClass}`}>
              <Icon size={48} />
            </div>

            {/* Title & Meta */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {ministry.name}
                  </h1>
                  <p className="text-gray-600 mb-4">
                    {ministry.description || 'No description available'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>{ministry.volunteerCount} volunteer{ministry.volunteerCount !== 1 ? 's' : ''}</span>
                    </div>
                    {!ministry.is_active && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                        INACTIVE
                      </span>
                    )}
                  </div>
                </div>

                {canManage && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('settings')}
                    >
                      <Settings size={16} className="mr-2" />
                      Settings
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Leader Card */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Ministry Leader</h3>
            <p className="text-gray-900">
              {ministry.leaderName || 'No leader assigned'}
            </p>
          </Card>

          {/* Contact Card */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Contact Info</h3>
            {ministry.contact_email || ministry.contact_phone ? (
              <>
                {ministry.contact_email && (
                  <p className="text-sm text-gray-900">{ministry.contact_email}</p>
                )}
                {ministry.contact_phone && (
                  <p className="text-sm text-gray-900">{ministry.contact_phone}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500 italic">No contact info</p>
            )}
          </Card>

          {/* Meeting Info Card */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Meeting Times</h3>
            <p className="text-sm text-gray-900">
              {ministry.meeting_info || 'No meeting info available'}
            </p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('volunteers')}
              className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'volunteers'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users size={16} className="inline mr-2" />
              Volunteers
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'schedule'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar size={16} className="inline mr-2" />
              Schedule
            </button>
            {canManage && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings size={16} className="inline mr-2" />
                Settings
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Ministry</h2>
              <p className="text-gray-700 mb-6">
                {ministry.description || 'No description available for this ministry.'}
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
                  <p className="text-gray-700 capitalize">{ministry.category.replace('_', ' ')}</p>
                </div>

                {ministry.meeting_info && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Meeting Information</h3>
                    <p className="text-gray-700">{ministry.meeting_info}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                  <p className="text-gray-700">
                    {ministry.is_active ? (
                      <span className="text-green-600">✓ Active</span>
                    ) : (
                      <span className="text-gray-500">○ Inactive</span>
                    )}
                  </p>
                </div>

                {ministry.is_default && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Ministry Type</h3>
                    <p className="text-gray-700">Default ministry (included with all churches)</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'volunteers' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Volunteers</h2>
                {canManage && (
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <UserPlus size={16} className="mr-2" />
                    Add Volunteer
                  </Button>
                )}
              </div>
              <div className="text-center py-12 text-gray-500">
                <Users size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No volunteers yet. Add your first volunteer to get started!</p>
              </div>
            </Card>
          )}

          {activeTab === 'schedule' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Schedule</h2>
                {canManage && (
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setShowScheduleModal(true)}
                    disabled={volunteers.length === 0}
                  >
                    <Calendar size={16} className="mr-2" />
                    Add Schedule
                  </Button>
                )}
              </div>

              {volunteers.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 text-sm">
                    You need to add volunteers before creating schedules.
                  </p>
                </div>
              ) : null}

              {schedules.length > 0 ? (
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {schedule.volunteer.userName}
                            </h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              schedule.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                              schedule.status === 'completed' ? 'bg-green-100 text-green-700' :
                              schedule.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {schedule.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} />
                              <span>{new Date(schedule.scheduled_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} />
                              <span>{schedule.start_time} - {schedule.end_time}</span>
                            </div>
                            {schedule.service_name && (
                              <div className="col-span-2">
                                <span className="font-medium">Service:</span> {schedule.service_name}
                              </div>
                            )}
                            {schedule.role_assignment && (
                              <div className="col-span-2">
                                <span className="font-medium">Role:</span> {schedule.role_assignment}
                              </div>
                            )}
                            {schedule.notes && (
                              <div className="col-span-2 text-gray-500 italic">
                                {schedule.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No scheduled events yet. Create your first schedule!</p>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'settings' && canManage && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Ministry Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ministry Name</h3>
                  <p className="text-gray-700">{ministry.name}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
                  <p className="text-gray-700 capitalize">{ministry.category.replace('_', ' ')}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button variant="outline" className="text-indigo-600 border-indigo-600 hover:bg-indigo-50">
                    <Edit size={16} className="mr-2" />
                    Edit Ministry Details
                  </Button>
                </div>

                {!ministry.is_default && (
                  <div className="pt-4 border-t border-gray-200">
                    <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                      Delete Ministry
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Schedule Creation Modal */}
        <Modal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          title="Add Schedule"
          titleIcon={<Calendar size={32} />}
        >
          <form onSubmit={handleCreateSchedule} className="space-y-6">
            {/* Volunteer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volunteer *
              </label>
              <select
                value={scheduleForm.volunteerId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, volunteerId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select a volunteer...</option>
                {volunteers.filter(v => v.is_active).map((volunteer) => (
                  <option key={volunteer.id} value={volunteer.id}>
                    {volunteer.userName} {volunteer.role ? `(${volunteer.role.name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={scheduleForm.scheduledDate}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  value={scheduleForm.endTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <select
                value={scheduleForm.serviceType}
                onChange={(e) => setScheduleForm({ ...scheduleForm, serviceType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="sunday_morning">Sunday Morning</option>
                <option value="sunday_evening">Sunday Evening</option>
                <option value="wednesday">Wednesday</option>
                <option value="saturday">Saturday</option>
                <option value="special_event">Special Event</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Service Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name
              </label>
              <input
                type="text"
                value={scheduleForm.serviceName}
                onChange={(e) => setScheduleForm({ ...scheduleForm, serviceName: e.target.value })}
                placeholder="e.g., Morning Worship, Youth Night"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Role Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Assignment
              </label>
              <input
                type="text"
                value={scheduleForm.roleAssignment}
                onChange={(e) => setScheduleForm({ ...scheduleForm, roleAssignment: e.target.value })}
                placeholder="e.g., Lead Guitar, Nursery Teacher"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={scheduleForm.notes}
                onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Schedule'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowScheduleModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
