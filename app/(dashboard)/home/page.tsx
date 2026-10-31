// Home dashboard page - Full featured version

'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useMembers } from '@/hooks/use-members';
import { useNeeds } from '@/hooks/use-needs';
import { useMealTrains } from '@/hooks/use-meal-trains';
import { useChurchMembership } from '@/hooks/use-church-membership';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonGrid } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { UserCheck, HandHeart, Award, Users, Truck, ChefHat, ArrowRight, Calendar, PartyPopper, Handshake, BookOpen, Image as ImageIcon, HeartHandshake } from 'lucide-react';
import { PhotoPromptModal } from '@/components/features/onboarding/photo-prompt-modal';
import { ProfileCompletenessNudge } from '@/components/features/onboarding/profile-completeness-nudge';
import { useProfileCompleteness } from '@/hooks/use-profile-completeness';
import { useKudos } from '@/hooks/use-kudos';
import { useLifeEvents } from '@/hooks/use-life-events';
import type { LifeEventType } from '@/lib/types';

/** Emoji for each kind of celebration. */
const LIFE_EVENT_EMOJI: Record<LifeEventType, string> = {
  baby: '👶',
  birthday: '🎂',
  wedding: '💍',
  'new-home': '🏠',
  graduation: '🎓',
  travel: '✈',
};

export default function HomePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { hasChurch, isLoading, membership, role } = useChurchMembership();
  const { totalMembers, totalAssets, champions, members } = useMembers();
  const { needs } = useNeeds();
  const { mealTrains } = useMealTrains();
  const { completenessPercent, isComplete } = useProfileCompleteness();
  const { kudos } = useKudos();
  const { events: lifeEvents } = useLifeEvents();

  // The celebrations worth celebrating, newest first.
  const recentLifeEvents = useMemo(
    () =>
      [...lifeEvents]
        .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
        .slice(0, 3),
    [lifeEvents]
  );

  // Everything that actually happened lately: kudos, needs, celebrations.
  // The list is built from the database feeds, so it can never contain
  // invented people.
  const recentActivity = useMemo(() => {
    const items = [
      ...kudos.map((entry) => ({
        id: `kudos-${entry.id}`,
        text: `${entry.memberName} received ${entry.amount} kudos${entry.reason ? ` for "${entry.reason}"` : ''}`,
        time: entry.createdAt,
        icon: '🏆',
        href: '/kudos',
      })),
      ...needs.map((need) => ({
        id: `need-${need.id}`,
        text: need.isAnonymous ? 'A member posted a need' : `${need.poster.name} posted: ${need.title}`,
        time: need.createdAt,
        icon: '🆘',
        href: '/needs',
      })),
      ...lifeEvents.map((event) => ({
        id: `event-${event.id}`,
        text: event.title,
        time: event.postedAt,
        icon: LIFE_EVENT_EMOJI[event.type],
        href: '/life-events',
      })),
    ];

    return items
      .filter((item) => Boolean(item.time))
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);
  }, [kudos, needs, lifeEvents]);

  // What is scheduled, soonest first.
  const upcomingMeals = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return mealTrains
      .filter((train) => train.startDate >= today)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, 4);
  }, [mealTrains]);

  const isAdmin = role && ['moderator', 'overseer', 'owner'].includes(role);
  const firstName = user?.firstName || 'Friend';
  const churchName = membership?.churchName || 'Your Church';

  // Community health stats
  const membersWithPhotos = members.filter(m => m.avatar && m.avatar !== '👤').length;
  const needsFulfilledThisMonth = needs.filter(n => n.status === 'fulfilled').length;
  const familiesActiveThisWeek = Math.min(members.length, Math.floor(members.length * 0.7));

  // Get urgent needs
  const urgentNeeds = needs.filter(n => n.urgency === 'high').slice(0, 3);
  const activeMealTrains = mealTrains.filter(t => t.signups.length > 0).slice(0, 2);

  useEffect(() => {
    if (isLoaded && !isLoading && !hasChurch) {
      router.push('/welcome');
    }
  }, [isLoaded, isLoading, hasChurch, router]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-7xl mx-auto px-4">
          <SkeletonGrid count={6} />
        </div>
      </div>
    );
  }

  if (!hasChurch) {
    return null;
  }

  return (
    <>
      <PhotoPromptModal />
      <ProfileCompletenessNudge />

      <div className="min-h-screen bg-gray-50 pb-24">
        <ErrorBoundary>
        {/* Welcome Hero */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-4 pt-6 pb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-indigo-200 text-sm mb-1">Good {getTimeOfDay()},</p>
                <h1 className="text-3xl font-bold mb-1">{firstName}! 👋</h1>
                <p className="text-indigo-200 flex items-center gap-2">
                  <span className="text-lg">⛵</span>
                  {churchName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-white">{totalMembers}</p>
                <p className="text-indigo-200 text-sm">members</p>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{totalAssets}</p>
                <p className="text-xs text-indigo-200">Assets</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{champions.length}</p>
                <p className="text-xs text-indigo-200">Champions</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{activeMealTrains.length}</p>
                <p className="text-xs text-indigo-200">Meal Trains</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-4 space-y-5">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/needs">
              <Card className="p-4 hover:shadow-md transition cursor-pointer bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                    <HandHeart size={24} className="text-teal-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Post a Need</span>
                </div>
              </Card>
            </Link>
            <Link href="/kudos">
              <Card className="p-4 hover:shadow-md transition cursor-pointer bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Award size={24} className="text-amber-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Give Kudos</span>
                </div>
              </Card>
            </Link>
            <Link href="/directory">
              <Card className="p-4 hover:shadow-md transition cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users size={24} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Directory</span>
                </div>
              </Card>
            </Link>
            <Link href="/assets">
              <Card className="p-4 hover:shadow-md transition cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Truck size={24} className="text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Borrow Asset</span>
                </div>
              </Card>
            </Link>
            <Link href="/offers">
              <Card className="p-4 hover:shadow-md transition cursor-pointer bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                    <Handshake size={24} className="text-teal-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Give Help</span>
                </div>
              </Card>
            </Link>
            <Link href="/bible-study">
              <Card className="p-4 hover:shadow-md transition cursor-pointer bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <BookOpen size={24} className="text-indigo-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Bible Study</span>
                </div>
              </Card>
            </Link>
          </div>

          {/* Community Health Stats */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <HeartHandshake size={18} />
                Community Health
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-indigo-50 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <ImageIcon size={20} className="text-indigo-600" />
                  </div>
                  <p className="text-2xl font-bold text-indigo-700">{membersWithPhotos}</p>
                  <p className="text-xs text-gray-600 mt-1">members with photos</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <HeartHandshake size={20} className="text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-700">{needsFulfilledThisMonth}</p>
                  <p className="text-xs text-gray-600 mt-1">needs fulfilled this month</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Users size={20} className="text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-700">{familiesActiveThisWeek}</p>
                  <p className="text-xs text-gray-600 mt-1">families active this week</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Profile Completeness Progress (only for logged-in users with incomplete profiles) */}
          {!isComplete && user && (
            <Link href="/settings">
              <Card className="overflow-hidden border-indigo-200 hover:border-indigo-400 transition cursor-pointer">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <ImageIcon size={18} className="text-indigo-600" />
                        Your Profile is {completenessPercent}% Complete
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Complete your profile to build trust with your church family
                      </p>
                    </div>
                    <span className="text-indigo-600 text-sm font-medium">Improve →</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${completenessPercent}%` }}
                    />
                  </div>
                </div>
              </Card>
            </Link>
          )}

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Left Column */}
            <div className="space-y-5">
              {/* Urgent Needs */}
              {urgentNeeds.length > 0 && (
                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-rose-600 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        🚨 Urgent Needs
                      </h3>
                      <Link href="/needs" className="text-white/80 text-sm flex items-center gap-1 hover:text-white">
                        View all <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    {urgentNeeds.map(need => (
                      <Link key={need.id} href="/needs" className="block">
                        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition">
                          <div className="text-2xl">{need.urgency === 'high' ? '🚨' : '📌'}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{need.title}</p>
                            <p className="text-xs text-gray-500">{need.status === 'open' ? ' Volunteers needed' : need.status}</p>
                          </div>
                          <span className="text-xs text-gray-400">{getTimeAgo(need.createdAt)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {/* Active Meal Trains */}
              {activeMealTrains.length > 0 && (
                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <ChefHat size={18} />
                        Meal Trains
                      </h3>
                      <Link href="/meal-trains" className="text-white/80 text-sm flex items-center gap-1 hover:text-white">
                        View all <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    {activeMealTrains.map(train => (
                      <Link key={train.id} href="/meal-trains" className="block">
                        <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg hover:bg-rose-100 transition">
                          <div className="text-2xl">🍲</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{train.recipient.name}</p>
                            <p className="text-xs text-gray-500">
                              {train.signups.filter(s => s.signedUp).length} of {train.signups.length} meals covered
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">{formatDate(train.startDate)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {/* Life Events Widget */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <PartyPopper size={18} />
                      Celebrate
                    </h3>
                    <Link href="/life-events" className="text-white/80 text-sm flex items-center gap-1 hover:text-white">
                      View all <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {recentLifeEvents.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No celebrations yet</div>
                  ) : (
                    recentLifeEvents.map(event => (
                      <Link key={event.id} href="/life-events" className="block">
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
                          <div className="text-2xl">{LIFE_EVENT_EMOJI[event.type]}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{event.title}</p>
                            <p className="text-xs text-gray-500">{event.memberName || event.campus}</p>
                          </div>
                          <span className="text-xs text-purple-600 font-medium">{formatDate(event.date)}</span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Recent Activity */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      ⚡ Recent Activity
                    </h3>
                  </div>
                </div>
                <div className="divide-y">
                  {recentActivity.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Nothing yet — kudos, needs and celebrations show up here.
                    </div>
                  ) : (
                    recentActivity.map(activity => (
                      <Link
                        key={activity.id}
                        href={activity.href}
                        className="flex items-start gap-3 p-3 hover:bg-gray-50 transition"
                      >
                        <div className="text-2xl">{activity.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800">{activity.text}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{getTimeAgo(activity.time)}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </Card>

              {/* Upcoming Events */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Calendar size={18} />
                    Coming Up
                  </h3>
                </div>
                <div className="divide-y">
                  {upcomingMeals.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">Nothing scheduled yet</div>
                  ) : (
                    upcomingMeals.map(train => (
                      <Link
                        key={train.id}
                        href="/meal-trains"
                        className="flex items-start gap-3 p-3 hover:bg-gray-50 transition"
                      >
                        <div className="text-2xl">🍲</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">Meal train for {train.recipient.name}</p>
                          <p className="text-xs text-gray-500">{train.recipient.campus}</p>
                        </div>
                        <span className="text-xs text-indigo-600 font-medium">{formatDate(train.startDate)}</span>
                      </Link>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Admin Tools */}
          {isAdmin && (
            <Card className="overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-600 border-0">
              <div className="p-4">
                <h3 className="font-bold text-white mb-1">Admin Tools</h3>
                <p className="text-indigo-100 text-sm mb-4">Manage your church community</p>
                <Link href="/manage-requests">
                  <Button
                    variant="primary"
                    className="w-full bg-white text-indigo-600 hover:bg-gray-100"
                  >
                    <UserCheck size={16} className="mr-2" />
                    Manage Join Requests
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
        </ErrorBoundary>
      </div>
    </>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function getTimeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
