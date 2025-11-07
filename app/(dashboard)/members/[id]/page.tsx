'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useChurchMembership } from '@/hooks/use-church-membership';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, MapPin, Shield, ArrowLeft } from 'lucide-react';

interface MemberProfile {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_photo: string | null;
  user_phone: string | null;
  user_bio: string | null;
  role: 'owner' | 'overseer' | 'moderator' | 'member';
  campus_id: string | null;
  campus_name: string | null;
  joined_at: string;
  church_name: string;
}

export default function MemberProfilePage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;
  const { membership } = useChurchMembership();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!membership?.churchId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/churches/members/${memberId}/profile`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch member profile');
        }

        setProfile(data.profile);
      } catch (err) {
        console.error('Error fetching member profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [memberId, membership]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'overseer': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'moderator': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading member profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <p className="text-red-600 mb-4">{error || 'Member not found'}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>

        {/* Profile Header Card */}
        <Card className="p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Photo */}
            {profile.user_photo ? (
              <img
                src={profile.user_photo}
                alt={profile.user_name}
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200 shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-4xl border-4 border-indigo-200 shadow-lg">
                {profile.user_name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profile.user_name}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <span className={`px-4 py-1 rounded-full text-sm font-bold border ${getRoleBadgeColor(profile.role)}`}>
                  {getRoleLabel(profile.role)}
                </span>
              </div>
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Mail size={16} />
                  <span>{profile.user_email}</span>
                </div>
                {profile.user_phone && (
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <User size={16} />
                    <span>{profile.user_phone}</span>
                  </div>
                )}
                {profile.campus_name && (
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <MapPin size={16} />
                    <span>{profile.campus_name}</span>
                  </div>
                )}
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Calendar size={16} />
                  <span>Joined {new Date(profile.joined_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.user_bio && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-bold text-gray-700 mb-2">About</h3>
              <p className="text-gray-800">{profile.user_bio}</p>
            </div>
          )}
        </Card>

        {/* Church Membership Card */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Church Membership</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Church</p>
              <p className="text-lg font-bold text-gray-900">{profile.church_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Campus</p>
              <p className="text-lg font-bold text-gray-900">
                {profile.campus_name || 'No campus assigned'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="text-lg font-bold text-gray-900">{getRoleLabel(profile.role)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-lg font-bold text-gray-900">
                {new Date(profile.joined_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </Card>

        {/* Role Permissions Card */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield size={20} className="text-indigo-600" />
            Role Permissions
          </h2>
          <div className="space-y-3">
            {profile.role === 'owner' && (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-bold text-gray-900">Full Church Control</p>
                    <p className="text-sm text-gray-600">
                      Can manage all aspects of the church including members, roles, campuses, and settings
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-bold text-gray-900">Generate Invite Codes</p>
                    <p className="text-sm text-gray-600">
                      Can create and manage invite codes with QR codes
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-bold text-gray-900">View All History</p>
                    <p className="text-sm text-gray-600">
                      Can view departure history and all church records
                    </p>
                  </div>
                </div>
              </>
            )}
            {profile.role === 'overseer' && (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-bold text-gray-900">Campus Leadership</p>
                    <p className="text-sm text-gray-600">
                      Can oversee campus operations and manage join requests
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-bold text-gray-900">Generate Invite Codes</p>
                    <p className="text-sm text-gray-600">
                      Can create invite codes for their campus or church-wide
                    </p>
                  </div>
                </div>
              </>
            )}
            {profile.role === 'moderator' && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-bold text-gray-900">Join Request Management</p>
                  <p className="text-sm text-gray-600">
                    Can approve or deny join requests from prospective members
                  </p>
                </div>
              </div>
            )}
            {profile.role === 'member' && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-bold text-gray-900">Basic Access</p>
                  <p className="text-sm text-gray-600">
                    Can access church community features and information
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
