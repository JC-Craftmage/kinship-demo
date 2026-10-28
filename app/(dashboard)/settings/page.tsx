// Settings and account management page

'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useChurchMembership } from '@/hooks/use-church-membership';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { LogOut, AlertTriangle, Church, User as UserIcon, Moon, Sun, Camera, Briefcase, FileText, Package, Check, PartyPopper } from 'lucide-react';
import { useProfileCompleteness } from '@/hooks/use-profile-completeness';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { membership, refetch } = useChurchMembership();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Profile completeness data
  const { completenessPercent, isComplete, hasPhoto, hasSkills, hasBio } = useProfileCompleteness();

  useEffect(() => {
    setMounted(true);
  }, []);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLeaveChurch = async () => {
    if (confirmText.toLowerCase() !== 'i understand') {
      setError('Please type "I understand" to confirm');
      return;
    }

    setIsLeaving(true);
    setError(null);

    try {
      const response = await fetch('/api/churches/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membershipId: membership?.id,
          reason: leaveReason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to leave church');
      }

      // Refresh membership and redirect to welcome
      await refetch();
      router.push('/welcome');
    } catch (err) {
      console.error('Error leaving church:', err);
      setError(err instanceof Error ? err.message : 'Failed to leave church');
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <DashboardHeader
        title="Settings"
        subtitle="Manage your account"
      />

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Profile Strength Meter */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {isComplete ? <PartyPopper size={20} /> : <UserIcon size={20} />}
                  {isComplete ? 'Profile Complete!' : 'Profile Strength'}
                </h2>
                <p className="text-indigo-100 text-sm mt-1">
                  {isComplete
                    ? "You're ready to connect with your church family!"
                    : `${completenessPercent}% complete — finish these items to build trust`}
                </p>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${isComplete ? 'text-yellow-300' : 'text-white'}`}>
                  {completenessPercent}%
                </div>
                {!isComplete && (
                  <div className="w-16 bg-white/30 rounded-full h-2 mt-1">
                    <div
                      className="bg-yellow-300 h-2 rounded-full transition-all"
                      style={{ width: `${completenessPercent}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 grid grid-cols-2 gap-3">
            {/* Photo */}
            <div className={`p-3 rounded-xl border-2 ${hasPhoto ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Camera size={18} className={hasPhoto ? 'text-green-600' : 'text-gray-400'} />
                  <span className="font-semibold text-sm text-gray-900">Photo</span>
                </div>
                {hasPhoto ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <span className="text-xs text-gray-500">25%</span>
                )}
              </div>
              {hasPhoto ? (
                <p className="text-xs text-green-700">Profile photo added</p>
              ) : (
                <a href="/settings" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                  Add now →
                </a>
              )}
            </div>

            {/* Skills */}
            <div className={`p-3 rounded-xl border-2 ${hasSkills ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Briefcase size={18} className={hasSkills ? 'text-green-600' : 'text-gray-400'} />
                  <span className="font-semibold text-sm text-gray-900">Skills</span>
                </div>
                {hasSkills ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <span className="text-xs text-gray-500">25%</span>
                )}
              </div>
              {hasSkills ? (
                <p className="text-xs text-green-700">Skills listed</p>
              ) : (
                <a href="/settings" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                  Add now →
                </a>
              )}
            </div>

            {/* Bio */}
            <div className={`p-3 rounded-xl border-2 ${hasBio ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <FileText size={18} className={hasBio ? 'text-green-600' : 'text-gray-400'} />
                  <span className="font-semibold text-sm text-gray-900">Bio</span>
                </div>
                {hasBio ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <span className="text-xs text-gray-500">25%</span>
                )}
              </div>
              {hasBio ? (
                <p className="text-xs text-green-700">Bio added</p>
              ) : (
                <a href="/settings" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                  Add now →
                </a>
              )}
            </div>

            {/* Assets */}
            <div className="p-3 rounded-xl border-2 border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-gray-400" />
                  <span className="font-semibold text-sm text-gray-900">Assets</span>
                </div>
                <span className="text-xs text-gray-500">25%</span>
              </div>
              <a href="/assets" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                List an asset →
              </a>
            </div>
          </div>

          {isComplete && (
            <div className="px-4 pb-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-green-800 font-semibold">
                  🎉 Your profile is fully set up! You&#39;re ready to connect with your church family.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Theme Toggle */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {mounted && resolvedTheme === 'dark' ? (
                <Moon className="w-6 h-6 text-indigo-600" />
              ) : (
                <Sun className="w-6 h-6 text-indigo-600" />
              )}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">Appearance</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Toggle between light and dark mode
                </p>
              </div>
            </div>
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                resolvedTheme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                  resolvedTheme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </Card>

        {/* User Info */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt="Profile"
                  width={64}
                  height={64}
                  unoptimized
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200"
                />
              ) : (
                <UserIcon className="w-16 h-16 text-indigo-600" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-gray-600">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>

          {/* Profile Photo Guidelines */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-bold text-blue-900 text-sm mb-2">📸 Profile Photo Guidelines</h4>
            <p className="text-xs text-blue-800 mb-2">
              Please use a <strong>real and recent photo of yourself</strong> so your church community can recognize you.
            </p>
            <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
              <li>Use a clear, well-lit photo showing your face</li>
              <li>Avoid using emojis, cartoon characters, pets, or old photos</li>
              <li>A current photo helps build trust and connection within your community</li>
            </ul>
          </div>
        </Card>

        {/* Church Info */}
        {membership && (
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <Church className="w-10 h-10 text-indigo-600" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Your Church</h3>
                <p className="text-gray-600">{membership.churchName}</p>
                {membership.campusName && (
                  <p className="text-sm text-gray-500">Campus: {membership.campusName}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Role: <span className="font-medium capitalize">{membership.role}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Joined {new Date(membership.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Leave Church Section */}
            <div className="border-t pt-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Leave Church</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    If you need to leave your church community, you can do so here. This action cannot be undone,
                    and you will need an invite code to rejoin.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => setShowLeaveModal(true)}
                className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
              >
                <LogOut size={16} className="mr-2" />
                Leave Church
              </Button>
            </div>
          </Card>
        )}

        {/* Admin Management Tools */}
        {membership && ['moderator', 'overseer', 'owner'].includes(membership.role) && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Admin Tools</h3>
            <p className="text-sm text-gray-600 mb-4">
              Manage your church community settings and members
            </p>
            <div className="space-y-3">
              <Button
                variant="secondary"
                onClick={() => router.push('/manage-requests')}
                className="w-full justify-start"
              >
                <UserIcon size={16} className="mr-2" />
                Manage Join Requests
              </Button>
              {membership.role === 'owner' && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => router.push('/manage-members')}
                    className="w-full justify-start"
                  >
                    <UserIcon size={16} className="mr-2" />
                    Manage Members & Roles
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => router.push('/manage-questionnaire')}
                    className="w-full justify-start"
                  >
                    <UserIcon size={16} className="mr-2" />
                    Manage Questionnaire
                  </Button>
                </>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Leave Church Confirmation Modal */}
      {showLeaveModal && (
        <Modal
          isOpen={showLeaveModal}
          onClose={() => {
            setShowLeaveModal(false);
            setConfirmText('');
            setLeaveReason('');
            setError(null);
          }}
          title="Leave Church"
        >
          <div className="space-y-4">
            {/* Strong Warning */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-700 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-yellow-900 mb-2">
                    Please Consider Carefully
                  </h4>
                  <p className="text-sm text-yellow-800 mb-2">
                    Leaving a church community should not be taken lightly. Church is meant to be
                    a place of belonging, growth, and mutual support.
                  </p>
                  <p className="text-sm text-yellow-800">
                    <strong>Valid reasons to leave include:</strong>
                  </p>
                  <ul className="text-sm text-yellow-800 list-disc ml-5 mt-1">
                    <li>Moving to a new city or area</li>
                    <li>Life circumstances requiring a change</li>
                    <li>Transitioning to a different ministry calling</li>
                  </ul>
                  <p className="text-sm text-yellow-800 mt-2">
                    If you&#39;re experiencing difficulties, please consider speaking with a church
                    leader before leaving.
                  </p>
                </div>
              </div>
            </div>

            {/* Reason Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Leaving (Optional - visible to church admins)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="e.g., Moving to another city..."
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
              />
            </div>

            {/* Confirmation Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <strong>&quot;I understand&quot;</strong> to confirm
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="I understand"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowLeaveModal(false);
                  setConfirmText('');
                  setLeaveReason('');
                  setError(null);
                }}
                className="flex-1"
                disabled={isLeaving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleLeaveChurch}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isLeaving || confirmText.toLowerCase() !== 'i understand'}
              >
                {isLeaving ? 'Leaving...' : 'Leave Church'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
