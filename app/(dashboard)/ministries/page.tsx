'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Plus,
  ChevronRight,
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
  leaderName: string | null;
  volunteerCount: number;
}

export default function MinistriesPage() {
  const router = useRouter();
  const { membership, role } = useChurchMembership();
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canManage = role && ['owner', 'overseer'].includes(role);

  useEffect(() => {
    const fetchMinistries = async () => {
      if (!membership?.churchId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const response = await fetch(`/api/churches/${membership.churchId}/ministries`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch ministries');
        }

        setMinistries(data.ministries || []);
      } catch (err) {
        console.error('Error fetching ministries:', err);
        setError(err instanceof Error ? err.message : 'Failed to load ministries');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMinistries();
  }, [membership]);

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

  const handleMinistryClick = (ministry: Ministry) => {
    router.push(`/ministries/${ministry.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading ministries...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ministries</h1>
            <p className="text-gray-600">
              Explore and join ministries at your church
            </p>
          </div>
          {canManage && (
            <Button
              onClick={() => router.push('/ministries/create')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus size={18} className="mr-2" />
              Create Ministry
            </Button>
          )}
        </div>

        {/* Active Ministries */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Active Ministries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ministries
              .filter(m => m.is_active)
              .map(ministry => {
                const Icon = getMinistryIcon(ministry.category);
                const colorClass = getMinistryColor(ministry.category);

                return (
                  <Card
                    key={ministry.id}
                    className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleMinistryClick(ministry)}
                  >
                    {/* Icon & Name */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-lg border-2 ${colorClass}`}>
                        <Icon size={28} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{ministry.name}</h3>
                        <p className="text-sm text-gray-600">
                          {ministry.leaderName ? `Led by ${ministry.leaderName}` : 'No leader assigned'}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    {ministry.description && (
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {ministry.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users size={16} />
                        <span>{ministry.volunteerCount} volunteer{ministry.volunteerCount !== 1 ? 's' : ''}</span>
                      </div>
                      <ChevronRight size={20} className="text-gray-400" />
                    </div>

                    {/* Contact Info */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {ministry.contact_email ? (
                        <p className="text-xs text-gray-600">
                          Email: {ministry.contact_email}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 italic">
                          No contact email
                        </p>
                      )}
                      {ministry.contact_phone ? (
                        <p className="text-xs text-gray-600">
                          Phone: {ministry.contact_phone}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 italic">
                          No contact phone
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>

        {/* Inactive Ministries */}
        {canManage && ministries.some(m => !m.is_active) && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Inactive Ministries</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ministries
                .filter(m => !m.is_active)
                .map(ministry => {
                  const Icon = getMinistryIcon(ministry.category);
                  const colorClass = getMinistryColor(ministry.category);

                  return (
                    <Card
                      key={ministry.id}
                      className="p-6 opacity-60 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleMinistryClick(ministry)}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`p-3 rounded-lg border-2 ${colorClass}`}>
                          <Icon size={28} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">{ministry.name}</h3>
                          <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded mt-1">
                            INACTIVE
                          </span>
                        </div>
                      </div>
                      {ministry.description && (
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {ministry.description}
                        </p>
                      )}
                    </Card>
                  );
                })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {ministries.length === 0 && (
          <Card className="p-12 text-center">
            <Users size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Ministries Yet</h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first ministry.
            </p>
            {canManage && (
              <Button onClick={() => router.push('/ministries/create')}>
                <Plus size={18} className="mr-2" />
                Create First Ministry
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
