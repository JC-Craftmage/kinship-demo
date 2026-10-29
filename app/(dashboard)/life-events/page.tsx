// Life Events feature - Celebrate milestones and important moments
//
// The feed is read from `/api/life-events`, which returns the caller's own
// church's celebrations from the `life_events` table. Nothing on this page
// is invented: there is no local mock feed, and there is no reaction count,
// because there is no reactions table to count. A board that shows a number
// nobody can produce is a lie with a heartbeat.

'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { BoardError, BoardLoading } from '@/components/ui/board-status';
import { DemoBanner } from '@/components/ui/demo-banner';
import { Baby, Heart, Home, GraduationCap, Plane, Cake, Plus } from 'lucide-react';
import { useLifeEvents } from '@/hooks/use-life-events';
import { LifeEventType } from '@/lib/types';

const LIFE_EVENT_TYPES: {
  id: LifeEventType;
  label: string;
  icon: typeof Baby;
  color: string;
  emoji: string;
}[] = [
  { id: 'baby', label: 'Baby Arrived', icon: Baby, color: 'from-pink-400 to-rose-500', emoji: '👶' },
  { id: 'birthday', label: 'Birthday', icon: Cake, color: 'from-yellow-400 to-amber-500', emoji: '🎂' },
  { id: 'wedding', label: 'Wedding', icon: Heart, color: 'from-red-400 to-pink-500', emoji: '💒' },
  { id: 'new-home', label: 'New Home', icon: Home, color: 'from-green-400 to-emerald-500', emoji: '🏠' },
  { id: 'graduation', label: 'Graduation', icon: GraduationCap, color: 'from-blue-400 to-indigo-500', emoji: '🎓' },
  { id: 'travel', label: 'Travel', icon: Plane, color: 'from-cyan-400 to-teal-500', emoji: '✈️' },
];

const EMPTY_FORM = { type: 'baby' as LifeEventType, title: '', description: '', date: '' };

export default function LifeEventsPage() {
  const { events, demo, loading, error, refresh, sharing, shareError, shareEvent, commenting, commentError, addComment } =
    useLifeEvents();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState(EMPTY_FORM);
  const [commentText, setCommentText] = useState('');

  const handleCreate = async () => {
    if (!newEvent.title.trim() || !newEvent.date) return;

    const result = await shareEvent({
      type: newEvent.type,
      title: newEvent.title.trim(),
      description: newEvent.description.trim(),
      date: newEvent.date,
    });

    // The modal only closes once the write actually landed.
    if (result.ok) {
      setShowCreateModal(false);
      setNewEvent(EMPTY_FORM);
    }
  };

  const handleComment = async () => {
    if (!selectedEvent || !commentText.trim()) return;

    const result = await addComment(selectedEvent.id, commentText.trim());
    if (result.ok) {
      setCommentText('');
    }
  };

  // The selected event is derived from the live feed, so a comment posted in
  // the modal shows up without reopening it.
  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId]
  );

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

  const typeMeta = (type: LifeEventType) =>
    LIFE_EVENT_TYPES.find((entry) => entry.id === type) ?? LIFE_EVENT_TYPES[0];

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
        {demo && (
          <div className="max-w-7xl mx-auto px-4 pt-4">
            <DemoBanner />
          </div>
        )}

        {error ? (
          <BoardError message={error} onRetry={() => void refresh()} />
        ) : loading ? (
          <BoardLoading label="Loading life events" />
        ) : events.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-lg font-semibold text-gray-900">No celebrations yet</p>
            <p className="mt-1 text-gray-600">
              When someone in your church shares good news, it shows up here.
            </p>
            <Button
              variant="primary"
              icon={<Plus size={18} />}
              className="mt-4"
              onClick={() => setShowCreateModal(true)}
            >
              Share News
            </Button>
          </Card>
        ) : (
          events.map((event) => {
            const eventType = typeMeta(event.type);
            return (
              <Card key={event.id} className="overflow-hidden">
                {/* Event Header */}
                <div className={`bg-gradient-to-r ${eventType.color} p-4`}>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{eventType.emoji}</span>
                    <div className="flex-1">
                      <p className="text-white/90 text-sm">{eventType.label}</p>
                      <h3 className="text-xl font-bold text-white">{event.title}</h3>
                    </div>
                    <span className="text-white/80 text-sm">{getTimeAgo(event.date)}</span>
                  </div>
                </div>

                {/* Event Body */}
                <div className="p-4">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-5xl">{event.memberAvatar || eventType.emoji}</div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg">{event.memberName}</p>
                      <p className="text-sm text-gray-500">{event.campus}</p>
                      {event.description && (
                        <p className="text-gray-700 mt-2">{event.description}</p>
                      )}
                      <p className="mt-2 text-xs text-gray-400">Shared by {event.postedBy}</p>
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <button
                      onClick={() => setSelectedEventId(event.id)}
                      className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition"
                    >
                      <span>💬</span>
                      <span className="text-sm font-medium">
                        {event.comments.length}{' '}
                        {event.comments.length === 1 ? 'comment' : 'comments'}
                      </span>
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
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
                {LIFE_EVENT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setNewEvent((prev) => ({ ...prev, type: type.id }))}
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
                onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
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
                onChange={(e) => setNewEvent((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Share details (optional)</label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="7lbs 2oz, 20 inches of pure joy..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 transition resize-none"
                maxLength={300}
              />
            </div>

            {shareError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {shareError}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => void handleCreate()}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                disabled={!newEvent.title.trim() || !newEvent.date || sharing}
              >
                {sharing ? 'Sharing…' : 'Share News'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEventId(null)}
          headerColor="from-purple-500 to-indigo-600"
        >
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-3">{selectedEvent.memberAvatar || typeMeta(selectedEvent.type).emoji}</div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
              <p className="text-gray-500">
                {formatDate(selectedEvent.date)} • {selectedEvent.campus}
              </p>
            </div>
            {selectedEvent.description && (
              <p className="text-gray-700 text-lg">{selectedEvent.description}</p>
            )}
            <p className="text-xs text-gray-400 text-center">Shared by {selectedEvent.postedBy}</p>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-900">
                {selectedEvent.comments.length === 0
                  ? 'No comments yet'
                  : `${selectedEvent.comments.length} ${
                      selectedEvent.comments.length === 1 ? 'comment' : 'comments'
                    }`}
              </h3>
              {selectedEvent.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{comment.authorAvatar || '🙂'}</span>
                    <span className="font-semibold text-gray-900">{comment.authorName}</span>
                    <span className="text-xs text-gray-400">
                      {getTimeAgo(comment.time)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.text}</p>
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment…"
                  maxLength={500}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 transition"
                />
                <Button
                  variant="primary"
                  onClick={() => void handleComment()}
                  disabled={!commentText.trim() || commenting}
                >
                  {commenting ? 'Posting…' : 'Post'}
                </Button>
              </div>
              {commentError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {commentError}
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
