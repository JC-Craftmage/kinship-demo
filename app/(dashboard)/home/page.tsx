// Home dashboard page - Full featured version

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useMembers } from '@/hooks/use-members';
import { useNeeds } from '@/hooks/use-needs';
import { useMealTrains } from '@/hooks/use-meal-trains';
import { useChurchMembership } from '@/hooks/use-church-membership';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, HandHeart, Award, Users, Truck, ChefHat, ArrowRight, Calendar, Clock } from 'lucide-react';
import { PhotoPromptModal } from '@/components/features/onboarding/photo-prompt-modal';

// Mock recent activity
const RECENT_ACTIVITY = [
  { id: 1, type: 'kudos', text: 'Mike Chen received 3 kudos for "Helped with moving"', time: '2h ago', icon: '🏆' },
  { id: 2, type: 'life_event', text: 'Baby Elijah James born to the Thompson family!', time: '1d ago', icon: '👶' },
  { id: 3, type: 'meal_train', text: 'Meal train created for Sarah Johnson', time: '2d ago', icon: '🍲' },
  { id: 4, type: 'new_member', text: 'Emily Davis joined the community', time: '3d ago', icon: '👋' },
  { id: 5, type: 'kudos', text: 'Robert Chen received 5 kudos for "Cooked meals for new mom"', time: '4d ago', icon: '🏆' },
];

// Upcoming events
const UPCOMING_EVENTS = [
  { id: 1, title: 'Potluck Sunday', date: '2026-04-27', campus: 'Downtown', icon: '🍽️' },
  { id: 2, title: 'Youth Group', date: '2026-04-25', campus: 'Westside', icon: '🎸' },
  { id: 3, title: 'Community Service Day', date: '2026-05-03', campus: 'All Campuses', icon: '🤝' },
];

export default function HomePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { hasChurch, isLoading, membership, role } = useChurchMembership();
  const { totalMembers, totalAssets, champions } = useMembers();
  const { needs } = useNeeds();
  const { mealTrains } = useMealTrains();

  const isAdmin = role && ['moderator', 'overseer', 'owner'].includes(role);
  const firstName = user?.firstName || 'Friend';
  const churchName = membership?.churchName || 'Your Church';

  // Get urgent needs
  const urgentNeeds = needs.filter(n => n.isUrgent).slice(0, 3);
  const activeMealTrains = mealTrains.filter(t => t.status === 'active').slice(0, 2);

  useEffect(() => {
    if (isLoaded && !isLoading && !hasChurch) {
      router.push('/welcome');
    }
  }, [isLoaded, isLoading, hasChurch, router]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!hasChurch) {
    return null;
  }

  return (
    <>
      <PhotoPromptModal />

      <div className="min-h-screen bg-gray-50 pb-24">
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
          </div>

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
                          <div className="text-2xl">{need.isUrgent ? '🚨' : '📌'}</div>
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
                            <p className="font-semibold text-gray-900 truncate">{train.title}</p>
                            <p className="text-xs text-gray-500">
                              {train.signups?.length || 0} of {train.coordinator.goalMeals} meals covered
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">{formatDate(train.deliveryDate)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}
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
                  {RECENT_ACTIVITY.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 transition">
                      <div className="text-2xl">{activity.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">{activity.text}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
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
                  {UPCOMING_EVENTS.map(event => (
                    <div key={event.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 transition">
                      <div className="text-2xl">{event.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{event.title}</p>
                        <p className="text-xs text-gray-500">{event.campus}</p>
                      </div>
                      <span className="text-xs text-indigo-600 font-medium">{formatDate(event.date)}</span>
                    </div>
                  ))}
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
