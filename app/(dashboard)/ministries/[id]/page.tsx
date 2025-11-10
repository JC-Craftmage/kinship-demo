'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useChurchMembership } from '@/hooks/use-church-membership';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

export default function MinistryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ministryId = params.id as string;
  const { membership, role } = useChurchMembership();
  const [ministry, setMinistry] = useState<Ministry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'volunteers' | 'schedule' | 'settings'>('overview');

  const canManage = role && ['owner', 'overseer'].includes(role);

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
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Calendar size={16} className="mr-2" />
                    Add Schedule
                  </Button>
                )}
              </div>
              <div className="text-center py-12 text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No scheduled events yet. Create your first schedule!</p>
              </div>
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
      </div>
    </div>
  );
}
