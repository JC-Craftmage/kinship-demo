// Life Events feature - Celebrate milestones and important moments

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Baby, Heart, Home, GraduationCap, Plane, Cake, Plus, X } from 'lucide-react';

const LIFE_EVENT_TYPES = [
  { id: 'baby', label: 'Baby Arrived', icon: Baby, color: 'from-pink-400 to-rose-500', emoji: '👶' },
  { id: 'birthday', label: 'Birthday', icon: Cake, color: 'from-yellow-400 to-amber-500', emoji: '🎂' },
  { id: 'wedding', label: 'Wedding', icon: Heart, color: 'from-red-400 to-pink-500', emoji: '💒' },
  { id: 'new-home', label: 'New Home', icon: Home, color: 'from-green-400 to-emerald-500', emoji: '🏠' },
  { id: 'graduation', label: 'Graduation', icon: GraduationCap, color: 'from-blue-400 to-indigo-500', emoji: '🎓' },
  { id: 'travel', label: 'Travel', icon: Plane, color: 'from-cyan-400 to-teal-500', emoji: '✈️' },
];

// Mock life events
const MOCK_EVENTS = [
  {
    id: 1,
    type: 'baby',
    title: 'Baby Elijah James Born',
    description: 'Welcome to the world, Elijah! 7lbs 2oz, 20 inches of pure joy.',
    memberName: 'The Thompson Family',
    memberAvatar: '👨‍👩‍👦',
    date: '2026-04-15',
    campus: 'Downtown',
    reactions: 24,
    comments: [
      { author: 'Sarah Johnson', avatar: '👩', text: 'Congratulations! So happy for you!', time: '2 days ago' },
      { author: 'Mike Chen', avatar: '👨', text: 'What a beautiful blessing!', time: '1 day ago' },
    ],
  },
  {
    id: 2,
    type: 'wedding',
    title: 'David & Maria Reyes Wedding',
    description: 'Two become one. Thank you to everyone who celebrated with us!',
    memberName: 'David & Maria Reyes',
    memberAvatar: '💒',
    date: '2026-04-10',
    campus: 'Westside',
    reactions: 47,
    comments: [],
  },
  {
    id: 3,
    type: 'graduation',
    title: 'Joshua Graduates High School!',
    description: 'Our Joshua is officially a high school graduate. So proud!',
    memberName: 'The Martinez Family',
    memberAvatar: '👨‍👩‍👦‍👦',
    date: '2026-04-08',
    campus: 'Downtown',
    reactions: 31,
    comments: [],
  },
  {
    id: 4,
    type: 'new-home',
    title: 'New House - Eastside Campus',
    description: 'We did it! After 3 years of searching, we finally have our forever home.',
    memberName: 'Robert & Amy Chen',
    memberAvatar: '🏠',
    date: '2026-04-05',
    campus: 'Eastside',
    reactions: 19,
    comments: [],
  },
];

export default function LifeEventsPage() {
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<typeof MOCK_EVENTS[0] | null>(null);
  const [newEvent, setNewEvent] = useState({
    type: 'baby',
    title: '',
    description: '',
    date: '',
  });

  const handleCreate = () => {
    if (!newEvent.title.trim() || !newEvent.date) return;

    const eventType = LIFE_EVENT_TYPES.find(t => t.id === newEvent.type);
    const created = {
      id: events.length + 1,
      type: newEvent.type,
      title: newEvent.title,
      description: newEvent.description,
      memberName: 'You',
      memberAvatar: eventType?.emoji || '🎉',
      date: newEvent.date,
      campus: 'Your Campus',
      reactions: 0,
      comments: [],
    };

    setEvents([created, ...events]);
    setShowCreateModal(false);
    setNewEvent({ type: 'baby', title: '', description: '', date: '' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(dateStr);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🎉</span>
              <div>
                <h1 className="text-3xl font-bold">Life Events</h1>
                <p className="text-purple-100 text-sm">Celebrating together</p>
              </div>
            </div>
            <Button variant="secondary" icon={<Plus size={20} />} onClick={() => setShowCreateModal(true)}>
              Share News
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {events.map(event => {
          const eventType = LIFE_EVENT_TYPES.find(t => t.id === event.type);
          return (
            <Card key={event.id} className="overflow-hidden">
              {/* Event Header */}
              <div className={`bg-gradient-to-r ${eventType?.color || 'from-purple-500 to-indigo-600'} p-4`}>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{eventType?.emoji}</span>
                  <div className="flex-1">
                    <p className="text-white/90 text-sm">{eventType?.label}</p>
                    <h3 className="text-xl font-bold text-white">{event.title}</h3>
                  </div>
                  <span className="text-white/80 text-sm">{getTimeAgo(event.date)}</span>
                </div>
              </div>

              {/* Event Body */}
              <div className="p-4">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-5xl">{event.memberAvatar}</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">{event.memberName}</p>
                    <p className="text-sm text-gray-500">{event.campus}</p>
                    <p className="text-gray-700 mt-2">{event.description}</p>
                  </div>
                </div>

                {/* Reactions & Comments */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-gray-500 hover:text-pink-600 transition">
                      <span>❤️</span>
                      <span className="text-sm font-medium">{event.reactions}</span>
                    </button>
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition"
                    >
                      <span>💬</span>
                      <span className="text-sm font-medium">{event.comments.length} comments</span>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          headerColor="from-purple-500 to-indigo-600"
        >
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Share Life News</h2>
              <p className="text-gray-600 mt-1">Let your church family celebrate with you</p>
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">What happened?</label>
              <div className="grid grid-cols-3 gap-2">
                {LIFE_EVENT_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setNewEvent(prev => ({ ...prev, type: type.id }))}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition ${
                      newEvent.type === type.id
                        ? 'border-purple-400 bg-purple-50 ring-2 ring-purple-300'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{type.emoji}</span>
                    <span className="text-xs font-medium text-gray-700">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Baby Elijah James Born"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 transition"
                maxLength={100}
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={newEvent.date}
                onChange={e => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Share details (optional)</label>
              <textarea
                value={newEvent.description}
                onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="7lbs 2oz, 20 inches of pure joy..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 transition resize-none"
                maxLength={300}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreate}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                disabled={!newEvent.title.trim() || !newEvent.date}
              >
                Share News
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          headerColor="from-purple-500 to-indigo-600"
        >
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-3">{selectedEvent.memberAvatar}</div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
              <p className="text-gray-500">{formatDate(selectedEvent.date)} • {selectedEvent.campus}</p>
            </div>
            <p className="text-gray-700 text-lg">{selectedEvent.description}</p>
            <div className="flex items-center justify-center gap-4 py-3 border-t border-b">
              <span className="text-2xl">❤️</span>
              <span className="font-bold text-gray-900">{selectedEvent.reactions} reactions</span>
            </div>
            {selectedEvent.comments.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900">Comments</h3>
                {selectedEvent.comments.map((comment, i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{comment.avatar}</span>
                      <span className="font-semibold text-gray-900">{comment.author}</span>
                      <span className="text-xs text-gray-400">{comment.time}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
